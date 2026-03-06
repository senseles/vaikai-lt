import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.PUBLIC_GET);
  if (rateLimitResponse) return rateLimitResponse;

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Search across all entity types — match name, city, or type-specific fields
    const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
      prisma.kindergarten.findMany({
        where: { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { city: { contains: q, mode: 'insensitive' as const } }, { address: { contains: q, mode: 'insensitive' as const } }] },
        select: { name: true, city: true, slug: true, baseRating: true },
        take: 3,
        orderBy: { baseRating: 'desc' },
      }),
      prisma.aukle.findMany({
        where: { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { city: { contains: q, mode: 'insensitive' as const } }] },
        select: { name: true, city: true, slug: true, baseRating: true },
        take: 2,
        orderBy: { baseRating: 'desc' },
      }),
      prisma.burelis.findMany({
        where: { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { city: { contains: q, mode: 'insensitive' as const } }, { category: { contains: q, mode: 'insensitive' as const } }] },
        select: { name: true, city: true, slug: true, category: true, baseRating: true },
        take: 2,
        orderBy: { baseRating: 'desc' },
      }),
      prisma.specialist.findMany({
        where: { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { city: { contains: q, mode: 'insensitive' as const } }, { specialty: { contains: q, mode: 'insensitive' as const } }] },
        select: { name: true, city: true, slug: true, specialty: true, baseRating: true },
        take: 2,
        orderBy: { baseRating: 'desc' },
      }),
    ]);

    const suggestions = [
      ...kindergartens.map(i => ({ name: i.name, city: i.city, type: 'darzeliai' as const, rating: i.baseRating })),
      ...aukles.map(i => ({ name: i.name, city: i.city, type: 'aukles' as const, rating: i.baseRating })),
      ...bureliai.map(i => ({ name: i.name, city: i.city, type: 'bureliai' as const, rating: i.baseRating })),
      ...specialists.map(i => ({ name: i.name, city: i.city, type: 'specialistai' as const, rating: i.baseRating })),
    ].slice(0, 8);

    return NextResponse.json({ suggestions }, {
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
    });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
