import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { parseSearchQuery, buildPrismaWhere } from '@/lib/search-utils';

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.PUBLIC_GET);
  if (rateLimitResponse) return rateLimitResponse;

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const { searchWords, categoryFilter, synonymPatterns } = parseSearchQuery(q);
    if (searchWords.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
      !categoryFilter || categoryFilter === 'kindergarten'
        ? prisma.kindergarten.findMany({
            where: buildPrismaWhere(['name', 'city', 'area', 'address', 'description', 'type', 'language', 'hours'], searchWords, synonymPatterns),
            select: { name: true, city: true, slug: true, baseRating: true },
            take: 3,
            orderBy: { baseRating: 'desc' },
          }) : Promise.resolve([]),
      !categoryFilter || categoryFilter === 'aukle'
        ? prisma.aukle.findMany({
            where: buildPrismaWhere(['name', 'city', 'area', 'description', 'availability', 'languages'], searchWords, synonymPatterns),
            select: { name: true, city: true, slug: true, baseRating: true },
            take: 2,
            orderBy: { baseRating: 'desc' },
          }) : Promise.resolve([]),
      !categoryFilter || categoryFilter === 'burelis'
        ? prisma.burelis.findMany({
            where: buildPrismaWhere(['name', 'city', 'area', 'description', 'category', 'schedule'], searchWords, synonymPatterns),
            select: { name: true, city: true, slug: true, category: true, baseRating: true },
            take: 2,
            orderBy: { baseRating: 'desc' },
          }) : Promise.resolve([]),
      !categoryFilter || categoryFilter === 'specialist'
        ? prisma.specialist.findMany({
            where: buildPrismaWhere(['name', 'city', 'area', 'description', 'specialty', 'clinic', 'languages'], searchWords, synonymPatterns),
            select: { name: true, city: true, slug: true, specialty: true, baseRating: true },
            take: 2,
            orderBy: { baseRating: 'desc' },
          }) : Promise.resolve([]),
    ]);

    const suggestions = [
      ...kindergartens.map(i => ({ name: i.name, city: i.city, slug: i.slug, type: 'darzeliai' as const, rating: i.baseRating })),
      ...aukles.map(i => ({ name: i.name, city: i.city, slug: i.slug, type: 'aukles' as const, rating: i.baseRating })),
      ...bureliai.map(i => ({ name: i.name, city: i.city, slug: i.slug, type: 'bureliai' as const, rating: i.baseRating })),
      ...specialists.map(i => ({ name: i.name, city: i.city, slug: i.slug, type: 'specialistai' as const, rating: i.baseRating })),
    ].slice(0, 8);

    return NextResponse.json({ suggestions }, {
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
    });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
