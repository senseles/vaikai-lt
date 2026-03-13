import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { checkCsrf } from '@/lib/security';
import { verifyPassword, hashPassword, needsRehash } from '@/lib/password';

export async function POST(request: NextRequest) {
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.AUTH_LOGIN);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'El. paštas ir slaptažodis privalomi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ success: false, error: 'Neteisingas el. paštas arba slaptažodis' }, { status: 401 });
    }

    // Rehash legacy SHA-256 passwords to scrypt
    if (needsRehash(user.passwordHash)) {
      const newHash = hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Prisijungimo klaida' }, { status: 500 });
  }
}
