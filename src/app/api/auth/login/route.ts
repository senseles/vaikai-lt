import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { checkCsrf } from '@/lib/security';
import { verifyPassword, hashPassword, needsRehash } from '@/lib/password';
import { computeTokenHmac } from '@/lib/user-tokens';

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request: NextRequest) {
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.AUTH_LOGIN);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return json({ success: false, error: 'El. paštas ir slaptažodis privalomi' }, 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return json({ success: false, error: 'Neteisingas el. paštas arba slaptažodis' }, 401);
    }

    // Rehash legacy SHA-256 passwords to scrypt
    if (needsRehash(user.passwordHash)) {
      const newHash = hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }

    // Create HMAC-signed session token
    const randomPart = randomBytes(32).toString('hex');
    const hmac = computeTokenHmac(user.id, randomPart);

    const response = json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set('user_token', `${user.id}:${randomPart}:${hmac}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch {
    return json({ success: false, error: 'Prisijungimo klaida' }, 500);
  }
}
