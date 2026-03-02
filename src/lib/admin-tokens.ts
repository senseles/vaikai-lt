/**
 * Stateless HMAC-based admin token generation & verification.
 * Works in both Node.js (API routes) and Edge Runtime (middleware).
 * Token format: <expiresAtMs>.<hmacHex>
 */

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD ?? '';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function toHex(buf: ArrayBuffer): string {
  const arr = new Uint8Array(buf);
  let hex = '';
  for (let i = 0; i < arr.length; i++) {
    hex += arr[i].toString(16).padStart(2, '0');
  }
  return hex;
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ADMIN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return toHex(sig);
}

/** Generate a new admin token */
export async function createAdminToken(): Promise<string> {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const sig = await hmacSign(String(expiresAt));
  return `${expiresAt}.${sig}`;
}

/** Verify an admin token (stateless, works in Edge and Node.js) */
export async function verifyAdminToken(token: string): Promise<boolean> {
  const dotIdx = token.indexOf('.');
  if (dotIdx === -1) return false;

  const expiresAtStr = token.slice(0, dotIdx);
  const providedSig = token.slice(dotIdx + 1);

  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSig = await hmacSign(expiresAtStr);
  // Constant-time comparison
  if (expectedSig.length !== providedSig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    mismatch |= expectedSig.charCodeAt(i) ^ providedSig.charCodeAt(i);
  }
  return mismatch === 0;
}
