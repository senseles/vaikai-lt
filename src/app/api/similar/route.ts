import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const itemId = searchParams.get('itemId');
  const itemType = searchParams.get('itemType');
  const city = searchParams.get('city');

  if (!itemId || !itemType || !city) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    let items;

    switch (itemType) {
      case 'kindergarten':
        items = await prisma.kindergarten.findMany({
          where: { city, id: { not: itemId } },
          orderBy: { baseRating: 'desc' },
          take: 4,
          select: { id: true, name: true, baseRating: true, baseReviewCount: true, slug: true },
        });
        break;
      case 'aukle':
        items = await prisma.aukle.findMany({
          where: { city, id: { not: itemId } },
          orderBy: { baseRating: 'desc' },
          take: 4,
          select: { id: true, name: true, baseRating: true, baseReviewCount: true, slug: true },
        });
        break;
      case 'burelis':
        items = await prisma.burelis.findMany({
          where: { city, id: { not: itemId } },
          orderBy: { baseRating: 'desc' },
          take: 4,
          select: { id: true, name: true, baseRating: true, baseReviewCount: true, slug: true },
        });
        break;
      case 'specialist':
        items = await prisma.specialist.findMany({
          where: { city, id: { not: itemId } },
          orderBy: { baseRating: 'desc' },
          take: 4,
          select: { id: true, name: true, baseRating: true, baseReviewCount: true, slug: true },
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid itemType' }, { status: 400 });
    }

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
