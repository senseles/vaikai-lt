import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory store: key (ip + identifier) -> request count & window expiry.
 * NOTE: This does NOT work across multiple serverless instances or after cold starts.
 * For production with >1 instance, replace with Redis/Upstash.
 */
const store = new Map<string, RateLimitEntry>();

/** Clean up expired entries every 60 seconds */
const CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    store.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => store.delete(key));
  }, CLEANUP_INTERVAL_MS);
  // Allow the Node.js process to exit even if the timer is still running
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Extract the client IP address from the request.
 * Uses x-forwarded-for header (set by reverse proxies / Vercel) or falls back to a default.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    return forwarded.split(',')[0].trim();
  }
  // Next.js doesn't expose raw socket IP easily; use a fallback
  return request.headers.get('x-real-ip') ?? '127.0.0.1';
}

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Unique identifier for this limiter (e.g. "reviews-post", "admin-login") */
  identifier: string;
}

/** Pre-configured rate limit options */
export const RATE_LIMITS = {
  /** Public GET APIs: 30 requests per 15 seconds */
  PUBLIC_GET: { maxRequests: 30, windowSeconds: 15, identifier: 'public-get' } satisfies RateLimitOptions,
  /** Review POST: 5 requests per 15 seconds */
  REVIEW_POST: { maxRequests: 5, windowSeconds: 15, identifier: 'review-post' } satisfies RateLimitOptions,
  /** Admin login: 5 attempts per 15 minutes */
  ADMIN_LOGIN: { maxRequests: 5, windowSeconds: 900, identifier: 'admin-login' } satisfies RateLimitOptions,
  /** Forum post creation: 3 posts per 5 minutes */
  FORUM_POST: { maxRequests: 3, windowSeconds: 300, identifier: 'forum-post' } satisfies RateLimitOptions,
  /** Forum comment creation: 10 comments per 5 minutes */
  FORUM_COMMENT: { maxRequests: 10, windowSeconds: 300, identifier: 'forum-comment' } satisfies RateLimitOptions,
  /** Forum voting: 30 votes per minute */
  FORUM_VOTE: { maxRequests: 30, windowSeconds: 60, identifier: 'forum-vote' } satisfies RateLimitOptions,
  /** User registration: 3 attempts per 15 minutes */
  AUTH_REGISTER: { maxRequests: 3, windowSeconds: 900, identifier: 'auth-register' } satisfies RateLimitOptions,
  /** User login: 10 attempts per 15 minutes */
  AUTH_LOGIN: { maxRequests: 10, windowSeconds: 900, identifier: 'auth-login' } satisfies RateLimitOptions,
  /** Password reset: 3 requests per hour */
  PASSWORD_RESET: { maxRequests: 3, windowSeconds: 3600, identifier: 'password-reset' } satisfies RateLimitOptions,
  /** Newsletter subscribe: 5 requests per 15 minutes */
  NEWSLETTER: { maxRequests: 5, windowSeconds: 900, identifier: 'newsletter' } satisfies RateLimitOptions,
} as const;

const RATE_LIMIT_MESSAGE = 'Per daug užklausų. Bandykite vėliau.';

/**
 * Check the rate limit for a request.
 * Returns `null` if the request is within limits, or a 429 NextResponse if rate-limited.
 * When userId is provided, rate limits are applied per user instead of per IP.
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions,
  userId?: string,
): NextResponse | null {
  ensureCleanup();

  const identifier = userId ?? getClientIp(request);
  const key = `${options.identifier}:${identifier}`;
  const now = Date.now();

  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    // First request in a new window
    store.set(key, {
      count: 1,
      resetAt: now + options.windowSeconds * 1000,
    });
    return null;
  }

  // Within the current window
  existing.count += 1;

  if (existing.count > options.maxRequests) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
    return NextResponse.json(
      { error: RATE_LIMIT_MESSAGE },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
      },
    );
  }

  return null;
}
