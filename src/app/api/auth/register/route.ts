import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { checkCsrf } from '@/lib/security';
import { hashPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.AUTH_REGISTER);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email, password, name } = body as { email?: string; password?: string; name?: string };

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'El. paštas ir slaptažodis privalomi' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Neteisingas el. pašto formatas' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Slaptažodis turi būti bent 8 simbolių' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Vartotojas su šiuo el. paštu jau egzistuoja' }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name: name?.trim() || null,
        passwordHash,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Registracijos klaida' }, { status: 500 });
  }
}
