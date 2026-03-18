import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { checkCsrf, checkHoneypot } from '@/lib/security';
import { sanitizeString } from '@/lib/sanitize';
import { hashPassword } from '@/lib/password';
import { verifyCaptcha } from '@/lib/captcha';

export async function POST(request: NextRequest) {
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.AUTH_REGISTER);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    // Honeypot check
    const honeypotResponse = checkHoneypot(body as Record<string, unknown>);
    if (honeypotResponse) return honeypotResponse;

    const { email, password, name, captchaToken } = body as { email?: string; password?: string; name?: string; captchaToken?: string };

    // Verify CAPTCHA
    const captchaValid = await verifyCaptcha(captchaToken);
    if (!captchaValid) {
      return NextResponse.json({ success: false, error: 'CAPTCHA patikrinimas nepavyko' }, { status: 400 });
    }

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
        name: name ? sanitizeString(name) || null : null,
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
