import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  // Search across all entity types for suggestions (limit to 8 total)
  const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
    prisma.kindergarten.findMany({
      where: { name: { contains: q } },
      select: { name: true, city: true, slug: true },
      take: 3,
      orderBy: { baseRating: 'desc' },
    }),
    prisma.aukle.findMany({
      where: { name: { contains: q } },
      select: { name: true, city: true, slug: true },
      take: 2,
      orderBy: { baseRating: 'desc' },
    }),
    prisma.burelis.findMany({
      where: { name: { contains: q } },
      select: { name: true, city: true, slug: true },
      take: 2,
      orderBy: { baseRating: 'desc' },
    }),
    prisma.specialist.findMany({
      where: { name: { contains: q } },
      select: { name: true, city: true, slug: true },
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
