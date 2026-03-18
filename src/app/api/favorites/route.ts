import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const VALID_TYPES = ['kindergarten', 'aukle', 'burelis', 'specialist'];
const COOKIE_NAME = 'vaikai-session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getSessionId(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value ?? null;
}

function setSessionCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

async function resolveIdentity(request: NextRequest): Promise<{
  userId: string | null;
  sessionId: string;
  isNewSession: boolean;
}> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { userId: session.user.id, sessionId: session.user.id, isNewSession: false };
  }
  const existing = getSessionId(request);
  if (existing) {
    return { userId: null, sessionId: existing, isNewSession: false };
  }
  const newId = crypto.randomUUID();
  return { userId: null, sessionId: newId, isNewSession: true };
}

export async function GET(request: NextRequest) {
  const { userId, sessionId, isNewSession } = await resolveIdentity(request);
  const { searchParams } = request.nextUrl;
  const itemId = searchParams.get('itemId');
  const itemType = searchParams.get('itemType');

  const where = userId ? { userId } : { sessionId, userId: null };

  if (itemId && itemType) {
    const fav = await prisma.favorite.findFirst({
      where: { itemId, itemType, ...where },
    });
    const res = NextResponse.json({ isFavorited: !!fav });
    if (isNewSession) setSessionCookie(res, sessionId);
    return res;
  }

  const favorites = await prisma.favorite.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  const res = NextResponse.json({ favorites });
  if (isNewSession) setSessionCookie(res, sessionId);
  return res;
}

export async function POST(request: NextRequest) {
  const { userId, sessionId, isNewSession } = await resolveIdentity(request);

  const body = await request.json();
  const { itemId, itemType } = body;

  if (!itemId || !VALID_TYPES.includes(itemType)) {
    return NextResponse.json({ error: 'Netinkami duomenys' }, { status: 400 });
  }

  const where = userId ? { userId } : { sessionId, userId: null };
  const existing = await prisma.favorite.findFirst({
    where: { itemId, itemType, ...where },
  });
  if (existing) {
    const res = NextResponse.json({ success: true });
    if (isNewSession) setSessionCookie(res, sessionId);
    return res;
  }

  await prisma.favorite.create({
    data: { itemId, itemType, userId, sessionId },
  });

  const res = NextResponse.json({ success: true }, { status: 201 });
  if (isNewSession) setSessionCookie(res, sessionId);
  return res;
}

export async function DELETE(request: NextRequest) {
  const { userId, sessionId, isNewSession } = await resolveIdentity(request);

  const body = await request.json();
  const { itemId, itemType } = body;

  const where = userId ? { userId } : { sessionId, userId: null };
  await prisma.favorite.deleteMany({
    where: { itemId, itemType, ...where },
  });

  const res = NextResponse.json({ success: true });
  if (isNewSession) setSessionCookie(res, sessionId);
  return res;
}
