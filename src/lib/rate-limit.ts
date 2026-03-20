import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory store: used as fast-path for high-frequency checks (GET, votes).
 * DB-backed sliding window is used for important actions (submissions, reviews, auth).
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
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Extract the client IP address from the request.
 * Priority: cf-connecting-ip (Cloudflare) > x-real-ip > x-forwarded-for > fallback
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '127.0.0.1'
  );
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
  /** Submission: 3 per hour */
  SUBMISSION: { maxRequests: 3, windowSeconds: 3600, identifier: 'submission' } satisfies RateLimitOptions,
  /** Report: 10 per hour */
  REPORT: { maxRequests: 10, windowSeconds: 3600, identifier: 'report' } satisfies RateLimitOptions,
} as const;

const RATE_LIMIT_MESSAGE = 'Per daug užklausų. Bandykite vėliau.';

/**
 * In-memory rate limit check (original behavior).
 * Fast but doesn't persist across serverless instances.
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
    store.set(key, {
      count: 1,
      resetAt: now + options.windowSeconds * 1000,
    });
    return null;
  }

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

/**
 * DB-backed sliding window rate limit check.
 * Persists across serverless instances. Use for important actions
 * (submissions, reviews, auth) where in-memory is insufficient.
 *
 * Returns null if allowed, or a 429 NextResponse if rate-limited.
 */
export async function checkRateLimitDb(
  request: NextRequest,
  options: RateLimitOptions,
  userId?: string,
): Promise<NextResponse | null> {
  const identifier = userId ?? getClientIp(request);
  const action = options.identifier;
  const windowStart = new Date(Date.now() - options.windowSeconds * 1000);

  try {
    // Upsert: find existing record or create new one
    const existing = await prisma.rateLimit.findUnique({
      where: { identifier_action: { identifier, action } },
    });

    if (!existing || existing.windowStart < windowStart) {
      // Window expired or no record — reset counter
      await prisma.rateLimit.upsert({
        where: { identifier_action: { identifier, action } },
        update: { count: 1, windowStart: new Date() },
        create: { identifier, action, count: 1, windowStart: new Date() },
      });
      return null;
    }

    // Within window — increment
    if (existing.count >= options.maxRequests) {
      const windowEnd = new Date(existing.windowStart.getTime() + options.windowSeconds * 1000);
      const retryAfterSeconds = Math.max(1, Math.ceil((windowEnd.getTime() - Date.now()) / 1000));
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds) },
        },
      );
    }

    await prisma.rateLimit.update({
      where: { identifier_action: { identifier, action } },
      data: { count: { increment: 1 } },
    });

    return null;
  } catch (err) {
    // If DB fails, fall back to in-memory
    console.error('DB rate limit check failed, falling back to in-memory:', err);
    return checkRateLimit(request, options, userId);
  }
}

/**
 * Periodically clean up expired rate limit entries from the DB.
 * Call this from a cron or on a schedule.
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  // Delete entries older than the longest window (1 hour)
  const cutoff = new Date(Date.now() - 3600 * 1000);
  const result = await prisma.rateLimit.deleteMany({
    where: { windowStart: { lt: cutoff } },
  });
  return result.count;
}
