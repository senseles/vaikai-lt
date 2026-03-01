/**
 * Simple in-memory cache with TTL support for API responses.
 *
 * - Uses a Map to store cached values alongside their expiry timestamps.
 * - Expired entries are cleaned up automatically every 60 seconds.
 * - Intended for read-only GET endpoints only.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/** Default TTL values in seconds */
export const CACHE_TTL = {
  LIST: 60,
  CITIES: 300,
} as const;

/**
 * Retrieve a cached value by key. Returns null if the key is missing or expired.
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Store a value in the cache with a TTL (in seconds).
 */
export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Auto-cleanup: remove expired entries every 60 seconds.
 * Uses unref() so the timer does not prevent Node.js from exiting.
 */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  cache.forEach((entry, key) => {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  });
}, 60_000);

if (typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
  cleanupInterval.unref();
}
