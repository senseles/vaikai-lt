import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { computeTokenHmac } from '@/lib/user-tokens';

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('user_token')?.value;
  if (!cookie) {
    return NextResponse.json({ user: null });
  }

  // Token format: userId:randomHex:hmac
  const parts = cookie.split(':');
  if (parts.length !== 3) {
    return NextResponse.json({ user: null });
  }

  const [userId, randomPart, providedHmac] = parts;
  if (!userId || !randomPart || !providedHmac) {
    return NextResponse.json({ user: null });
  }

  // Validate HMAC — constant-time comparison
  const expectedHmac = computeTokenHmac(userId, randomPart);
  if (expectedHmac.length !== providedHmac.length) {
    return NextResponse.json({ user: null });
  }
  let mismatch = 0;
  for (let i = 0; i < expectedHmac.length; i++) {
    mismatch |= expectedHmac.charCodeAt(i) ^ providedHmac.charCodeAt(i);
  }
  if (mismatch !== 0) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ user: user ?? null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
