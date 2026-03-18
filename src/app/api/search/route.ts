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
    // Split query into words and AND them together for multi-word search
    const words = q.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const wordConditions = (fields: string[], ws: string[]) => ({
      AND: ws.map(w => ({
        OR: fields.map(f => ({ [f]: { contains: w, mode: 'insensitive' as const } })),
      })),
    });

    const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
      prisma.kindergarten.findMany({
        where: wordConditions(['name', 'city', 'address'], words),
        select: { name: true, city: true, slug: true, baseRating: true },
        take: 3,
        orderBy: { baseRating: 'desc' },
      }),
      prisma.aukle.findMany({
        where: wordConditions(['name', 'city'], words),
        select: { name: true, city: true, slug: true, baseRating: true },
        take: 2,
        orderBy: { baseRating: 'desc' },
      }),
      prisma.burelis.findMany({
        where: wordConditions(['name', 'city', 'category'], words),
        select: { name: true, city: true, slug: true, category: true, baseRating: true },
        take: 2,
        orderBy: { baseRating: 'desc' },
      }),
      prisma.specialist.findMany({
        where: wordConditions(['name', 'city', 'specialty'], words),
        select: { name: true, city: true, slug: true, specialty: true, baseRating: true },
        take: 2,
        orderBy: { baseRating: 'desc' },
      }),
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
