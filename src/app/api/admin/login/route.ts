import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'darzeliai2026';

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body as { password?: string };

    if (!password || typeof password !== 'string') {
      return json({ success: false, error: 'Slaptažodis privalomas' }, 400);
    }

    if (password !== ADMIN_PASSWORD) {
      return json({ success: false, error: 'Neteisingas slaptažodis' }, 401);
    }

    // Generate a simple session token (hash of random bytes + timestamp)
    const raw = randomBytes(32).toString('hex') + Date.now().toString();
    const token = createHash('sha256').update(raw).digest('hex');

    // In production, store token in DB or Redis with expiry.
    // For now, we sign it so middleware can verify.
    const response = json({ success: true, data: { token } });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch {
    return json({ success: false, error: 'Netinkamas užklausos formatas' }, 400);
  }
}
