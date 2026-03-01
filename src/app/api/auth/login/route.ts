import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const check = createHash('sha256').update(salt + password).digest('hex');
  return check === hash;
}

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.ADMIN_LOGIN);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return json({ success: false, error: 'El. paštas ir slaptažodis privalomi' }, 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return json({ success: false, error: 'Neteisingas el. paštas arba slaptažodis' }, 401);
    }

    // Create session token
    const raw = randomBytes(32).toString('hex') + Date.now().toString();
    const token = createHash('sha256').update(raw).digest('hex');

    const response = json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set('user_token', `${user.id}:${token}`, {
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
