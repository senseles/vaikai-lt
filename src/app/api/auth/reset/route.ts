import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { checkCsrf } from '@/lib/security';
import { hashPassword } from '@/lib/password';

/** POST /api/auth/reset — request password reset or reset password with token */
export async function POST(request: NextRequest) {
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.PASSWORD_RESET);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { email, token, newPassword } = body as {
      email?: string;
      token?: string;
      newPassword?: string;
    };

    // Step 2: Reset password with token
    if (token && newPassword) {
      if (typeof token !== 'string' || typeof newPassword !== 'string') {
        return NextResponse.json({ success: false, error: 'Netinkami parametrai' }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ success: false, error: 'Slaptažodis turi būti bent 8 simbolių' }, { status: 400 });
      }

      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetToken || resetToken.used || resetToken.expires < new Date()) {
        return NextResponse.json({ success: false, error: 'Nuoroda nebegalioja arba jau panaudota. Bandykite iš naujo.' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email: resetToken.email },
      });

      if (!user) {
        return NextResponse.json({ success: false, error: 'Vartotojas nerastas' }, { status: 404 });
      }

      // Update password and mark token as used
      const passwordHash = hashPassword(newPassword);
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { passwordHash },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true },
        }),
      ]);

      return NextResponse.json({ success: true, data: { message: 'Slaptažodis pakeistas sėkmingai' } });
    }

    // Step 1: Request reset — generate token
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'El. paštas privalomas' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Neteisingas el. pašto formatas' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json({
        success: true,
        data: { message: 'Jei šis el. paštas yra registruotas, atsiuntėme atstatymo nuorodą.' },
      });
    }

    // Generate reset token (1 hour expiry)
    const resetTokenValue = randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetTokenValue,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // In production, send email with reset link
    // For now, log the token (development only)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[PASSWORD RESET] Token for ${email}: ${resetTokenValue}`);
      // eslint-disable-next-line no-console
      console.log(`[PASSWORD RESET] Link: /slaptazodis?token=${resetTokenValue}`);
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Jei šis el. paštas yra registruotas, atsiuntėme atstatymo nuorodą.' },
      // Include token in dev mode for testing
      ...(process.env.NODE_ENV !== 'production' ? { _devToken: resetTokenValue } : {}),
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Vidinė serverio klaida' }, { status: 500 });
  }
}
