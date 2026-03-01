import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-tokens';
import { VALID_CITY_SLUGS } from '@/lib/cities';

/** Known top-level routes that are NOT city slugs */
const KNOWN_ROUTES = new Set(['', 'megstamiausieji', 'paieska', 'admin', 'prisijungti', 'privatumo-politika']);

/** Minimal 404 HTML — styled to match the site */
const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="lt">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>404 — Puslapis nerastas | Vaikai.lt</title>
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.json|icons|og-image).*)',
  ],
};
