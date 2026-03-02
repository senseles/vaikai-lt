import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { checkCsrf } from '@/lib/security';
import { hashPassword } from '@/lib/password';

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request: NextRequest) {
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.ADMIN_LOGIN);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email, password, name } = body as { email?: string; password?: string; name?: string };

    if (!email || !password) {
      return json({ success: false, error: 'El. paštas ir slaptažodis privalomi' }, 400);
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ success: false, error: 'Neteisingas el. pašto formatas' }, 400);
    }

    if (password.length < 6) {
      return json({ success: false, error: 'Slaptažodis turi būti bent 6 simbolių' }, 400);
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return json({ success: false, error: 'Vartotojas su šiuo el. paštu jau egzistuoja' }, 409);
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name: name?.trim() || null,
        passwordHash,
      },
    });

    // Create session token
    const token = randomBytes(32).toString('hex');

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
    return json({ success: false, error: 'Registracijos klaida' }, 500);
  }
}
