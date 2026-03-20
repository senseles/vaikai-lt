import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-tokens';
import { VALID_CITY_SLUGS } from '@/lib/cities';
// Note: request tracking moved to server-side (instrumentation + API wrapper)
// Middleware runs in Edge runtime which doesn't share globalThis with Node.js API routes

/** Known top-level routes that are NOT city slugs */
const KNOWN_ROUTES = new Set(['', 'megstamiausieji', 'paieska', 'admin', 'prisijungti', 'registracija', 'privatumo-politika', 'forumas', 'aukles', 'bureliai', 'specialistai', 'slaptazodis', 'profilis', 'pasiulyti']);

// --- Edge-compatible in-memory rate limiter for auth endpoints ---
interface RateLimitEntry { count: number; resetAt: number }
const authRateLimitStore = new Map<string, RateLimitEntry>();

/** Extract client IP with Cloudflare priority */
function getClientIpFromRequest(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.ip ??
    '127.0.0.1'
  );
}

/**
 * Edge-compatible rate limit check. Returns 429 response if limited, null if allowed.
 */
function checkAuthRateLimit(
  request: NextRequest,
  identifier: string,
  maxRequests: number,
  windowSeconds: number,
): NextResponse | null {
  const ip = getClientIpFromRequest(request);
  const key = `${identifier}:${ip}`;
  const now = Date.now();

  const existing = authRateLimitStore.get(key);
  if (!existing || now >= existing.resetAt) {
    authRateLimitStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return null;
  }

  existing.count += 1;
  if (existing.count > maxRequests) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Per daug užklausų. Bandykite vėliau.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }
  return null;
}

// Periodic cleanup of expired entries (every 60s)
let authCleanupTimer: ReturnType<typeof setInterval> | null = null;
function ensureAuthCleanup() {
  if (authCleanupTimer) return;
  authCleanupTimer = setInterval(() => {
    const now = Date.now();
    authRateLimitStore.forEach((entry, key) => {
      if (now >= entry.resetAt) authRateLimitStore.delete(key);
    });
  }, 60_000);
  if (authCleanupTimer && typeof authCleanupTimer === 'object' && 'unref' in authCleanupTimer) {
    (authCleanupTimer as NodeJS.Timeout).unref();
  }
}
ensureAuthCleanup();

/** Minimal 404 HTML — styled to match the site */
const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="lt">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>404 — Puslapis nerastas | ManoVaikai.lt</title>
<meta name="robots" content="noindex"/>
<style>
body{font-family:Inter,system-ui,sans-serif;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb;color:#111827;text-align:center}
.c{max-width:28rem;padding:2rem}
.n{font-size:4rem;font-weight:700;color:#2d6a4f;margin-bottom:1rem}
h1{font-size:1.5rem;font-weight:700;margin-bottom:.75rem}
p{color:#6b7280;margin-bottom:2rem}
a{display:inline-block;background:#2d6a4f;color:#fff;font-weight:600;padding:.75rem 1.5rem;border-radius:.5rem;text-decoration:none}
a:hover{background:#40916c}
</style>
</head>
<body><div class="c"><div class="n">404</div><h1>Puslapis nerastas</h1><p>Atsiprašome, bet šis puslapis neegzistuoja arba buvo perkeltas.</p><a href="/">Grįžti į pradžią</a></div></body>
</html>`;

/** Sensitive files/paths that should always 404 */
const BLOCKED_PATHS = new Set([
  '/.env', '/.env.local', '/.env.production', '/.env.development',
  '/.git', '/.git/config', '/.git/HEAD',
  '/.gitignore', '/.npmrc', '/.htaccess',
  '/wp-admin', '/wp-login.php', '/xmlrpc.php',
  '/phpmyadmin', '/adminer.php',
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Block sensitive file access ---
  if (BLOCKED_PATHS.has(pathname) || pathname.startsWith('/.env') || pathname.startsWith('/.git/')) {
    return new NextResponse(NOT_FOUND_HTML, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // --- City slug validation ---
  // Check root-level single-segment paths (e.g., /vilnius, /nonexistent)
  const slug = pathname.slice(1); // remove leading /
  if (slug && !slug.includes('/') && !slug.includes('.') && !slug.startsWith('api') && !slug.startsWith('_next')) {
    if (!KNOWN_ROUTES.has(slug) && !VALID_CITY_SLUGS.has(slug)) {
      return new NextResponse(NOT_FOUND_HTML, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  }

  // /api/auth/providers is required by NextAuth for OAuth (Google, Facebook)

  // --- Rate limit auth endpoints (defense in depth) ---
  // NextAuth credential login: 5 POST requests per 5 minutes per IP
  if (request.method === 'POST' && (
    pathname === '/api/auth/callback/credentials' ||
    pathname === '/api/auth/signin'
  )) {
    const limited = checkAuthRateLimit(request, 'nextauth-login', 5, 300);
    if (limited) return limited;
  }
  // Admin login: 5 POST requests per 15 minutes per IP
  if (request.method === 'POST' && pathname === '/api/admin/login') {
    const limited = checkAuthRateLimit(request, 'admin-login-mw', 5, 900);
    if (limited) return limited;
  }

  // --- Admin API auth ---
  if (pathname.startsWith('/api/admin')) {
    if (pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    const cookieToken = request.cookies.get('admin_token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;

    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json(
        { success: false, error: 'Neautorizuota. Prisijunkite.' },
        { status: 401 },
      );
    }
  }

  // --- Security headers ---
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content-Security-Policy
  const csp = [
    "default-src 'self'",
    // Scripts: self only, no eval, no inline (Next.js uses nonces internally)
    "script-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com",
    // Styles: self + inline needed for Tailwind CSS and component styles + hCaptcha
    "style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com",
    // Images: self, data: URIs, and HTTPS sources (e.g., map tiles)
    "img-src 'self' data: https:",
    // Fonts: self and data: URIs
    "font-src 'self' data:",
    // Connect: self for API calls + OAuth providers + hCaptcha
    "connect-src 'self' https://accounts.google.com https://www.facebook.com https://hcaptcha.com https://*.hcaptcha.com",
    // Frames: Google Maps + OAuth + hCaptcha
    "frame-src https://www.google.com https://maps.google.com https://accounts.google.com https://www.facebook.com https://hcaptcha.com https://*.hcaptcha.com",
    // Objects: none (block Flash, Java, etc.)
    "object-src 'none'",
    // Base URI: self only (prevent <base> tag hijacking)
    "base-uri 'self'",
    // Form actions: self only
    "form-action 'self'",
    // Frame ancestors: none (equivalent to X-Frame-Options: DENY)
    "frame-ancestors 'none'",
    // TODO: Re-enable after SSL certificate is provisioned
    // "upgrade-insecure-requests",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/auth/:path*',
    '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.json|icons|og-image).*)',
  ],
};
