import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

const VALID_TYPES = ['kindergarten', 'aukle', 'burelis', 'specialist'];

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user?.id) {
    return errorResponse('Neprisijungęs', 401);
  }
  const userId = session.user.id;
  const { searchParams } = request.nextUrl;
  const itemId = searchParams.get('itemId');
  const itemType = searchParams.get('itemType');

  if (itemId && itemType) {
    const fav = await prisma.favorite.findFirst({
      where: { itemId, itemType, userId },
    });
    return jsonResponse({ isFavorited: !!fav });
  }

  // Return all user favorites
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return jsonResponse({ favorites });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user?.id) {
    return errorResponse('Neprisijungęs', 401);
  }
  const userId = session.user.id;

  const body = await request.json();
  const { itemId, itemType } = body;

  if (!itemId || !VALID_TYPES.includes(itemType)) {
    return errorResponse('Netinkami duomenys', 400);
  }

  // Check if already exists
  const existing = await prisma.favorite.findFirst({
    where: { itemId, itemType, userId },
  });
  if (existing) return jsonResponse({ success: true });

  await prisma.favorite.create({
    data: { itemId, itemType, userId, sessionId: userId },
  });

  return jsonResponse({ success: true }, 201);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user?.id) {
    return errorResponse('Neprisijungęs', 401);
  }
  const userId = session.user.id;

  const body = await request.json();
  const { itemId, itemType } = body;

  await prisma.favorite.deleteMany({
    where: { itemId, itemType, userId },
  });

  return jsonResponse({ success: true });
}
