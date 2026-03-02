import { NextRequest, NextResponse } from 'next/server';
import { checkCsrf } from '@/lib/security';

export async function POST(request: NextRequest) {
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  const response = NextResponse.json({ success: true });
  response.cookies.set('user_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return response;
}
