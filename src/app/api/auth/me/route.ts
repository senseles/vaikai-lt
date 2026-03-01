import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('user_token')?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const userId = token.split(':')[0];
  if (!userId) {
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
