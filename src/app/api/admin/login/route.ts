import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rate-limit';
import { createAdminToken } from '@/lib/admin-tokens';
import { checkCsrf } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD aplinkos kintamasis nerastas');
}

export async function POST(request: NextRequest) {
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.ADMIN_LOGIN);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { password } = body as { password?: string };

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Slaptažodis privalomas' }, { status: 400 });
    }

    if (password !== ADMIN_PASSWORD) {
      const ip = getClientIp(request);
      logAuditEvent({
        action: 'LOGIN_FAILED',
        targetType: 'admin',
        targetId: 'admin',
        details: `Admin login failed (wrong password). IP: ${ip}`,
      });
      return NextResponse.json({ success: false, error: 'Neteisingas slaptažodis' }, { status: 401 });
    }

    const ip = getClientIp(request);
    logAuditEvent({
      action: 'LOGIN_SUCCESS',
      targetType: 'admin',
      targetId: 'admin',
      details: `Admin login successful. IP: ${ip}`,
    });

    const token = await createAdminToken();
    const response = NextResponse.json({ success: true, data: { token } });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',  // Must cover both /admin and /api/admin paths
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Netinkamas užklausos formatas' }, { status: 400 });
  }
}
