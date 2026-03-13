import { scryptSync, randomBytes, timingSafeEqual, createHash } from 'crypto';

const SCRYPT_KEYLEN = 64;

/**
 * Hash a password with a random salt using scrypt.
 * Returns "scrypt:salt:hash" in hex format.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash string.
 * Supports both new scrypt format ("scrypt:salt:hash") and
 * legacy SHA-256 format ("salt:hash") for migration.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith('scrypt:')) {
    const parts = stored.split(':');
    const salt = parts[1];
    const hash = parts[2];
    if (!salt || !hash) return false;
    const hashBuf = Buffer.from(hash, 'hex');
    const checkBuf = scryptSync(password, salt, SCRYPT_KEYLEN);
    if (hashBuf.length !== checkBuf.length) return false;
    return timingSafeEqual(hashBuf, checkBuf);
  }

  // Legacy SHA-256 format: "salt:hash"
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const check = createHash('sha256').update(salt + password).digest('hex');
  // Use constant-time comparison to prevent timing attacks
  const checkBuf = Buffer.from(check, 'hex');
  const hashBuf = Buffer.from(hash, 'hex');
  if (checkBuf.length !== hashBuf.length) return false;
  return timingSafeEqual(checkBuf, hashBuf);
}

/**
 * Check if a stored hash needs to be upgraded from SHA-256 to scrypt.
 */
export function needsRehash(stored: string): boolean {
  return !stored.startsWith('scrypt:');
}
