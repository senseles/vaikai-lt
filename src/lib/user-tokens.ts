import { createHmac } from 'crypto';

const USER_TOKEN_SECRET = process.env.USER_TOKEN_SECRET ?? process.env.ADMIN_PASSWORD ?? 'vaikai-session-key';

/** Derive HMAC for a userId + random part to validate session tokens */
export function computeTokenHmac(userId: string, randomPart: string): string {
  return createHmac('sha256', USER_TOKEN_SECRET)
    .update(`${userId}:${randomPart}`)
    .digest('hex');
}
