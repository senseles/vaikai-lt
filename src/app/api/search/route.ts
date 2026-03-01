import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  // Search across all entity types — match name, city, or type-specific fields
  const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
    prisma.kindergarten.findMany({
      where: { OR: [{ name: { contains: q } }, { city: { contains: q } }, { address: { contains: q } }] },
      select: { name: true, city: true, slug: true },
      take: 3,
      orderBy: { baseRating: 'desc' },
    }),
    prisma.aukle.findMany({
      where: { OR: [{ name: { contains: q } }, { city: { contains: q } }] },
      select: { name: true, city: true, slug: true },
      take: 2,
      orderBy: { baseRating: 'desc' },
    }),
    prisma.burelis.findMany({
      where: { OR: [{ name: { contains: q } }, { city: { contains: q } }, { category: { contains: q } }] },
      select: { name: true, city: true, slug: true, category: true },
      take: 2,
      orderBy: { baseRating: 'desc' },
    }),
    prisma.specialist.findMany({
      where: { OR: [{ name: { contains: q } }, { city: { contains: q } }, { specialty: { contains: q } }] },
      select: { name: true, city: true, slug: true, specialty: true },
      take: 2,
      orderBy: { baseRating: 'desc' },
    }),
  ]);

  const suggestions = [
    ...kindergartens.map(i => ({ name: i.name, city: i.city, type: 'darzeliai' as const })),
    ...aukles.map(i => ({ name: i.name, city: i.city, type: 'aukles' as const })),
    ...bureliai.map(i => ({ name: i.name, city: i.city, type: 'bureliai' as const })),
    ...specialists.map(i => ({ name: i.name, city: i.city, type: 'specialistai' as const })),
  ].slice(0, 8);

  return NextResponse.json({ suggestions }, {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
  });
}
