import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { createAdminToken } from '@/lib/admin-tokens';
import { checkCsrf } from '@/lib/security';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'darzeliai2026';

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
    const { password } = body as { password?: string };

    if (!password || typeof password !== 'string') {
      return json({ success: false, error: 'Slaptažodis privalomas' }, 400);
    }

    if (password !== ADMIN_PASSWORD) {
      return json({ success: false, error: 'Neteisingas slaptažodis' }, 401);
    }

    const token = await createAdminToken();
    const response = json({ success: true, data: { token } });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',  // Must cover both /admin and /api/admin paths
    });

    return response;
  } catch {
    return json({ success: false, error: 'Netinkamas užklausos formatas' }, 400);
  }
}
