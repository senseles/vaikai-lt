import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CITIES } from '@/lib/cities';

// Build a city name → slug lookup for fast resolution
const cityNameToSlug: Record<string, string> = {};
for (const c of CITIES) {
  cityNameToSlug[c.name.toLocaleLowerCase('lt')] = c.slug;
}

function getCitySlug(cityName: string): string {
  const lower = cityName.toLocaleLowerCase('lt');
  // Direct match
  if (cityNameToSlug[lower]) return cityNameToSlug[lower];
  // Partial match (e.g. "Vilnius m." → "vilnius")
  for (const [name, slug] of Object.entries(cityNameToSlug)) {
    if (lower.includes(name) || name.includes(lower)) return slug;
  }
  return '';
}

const categoryMap: Record<string, string> = {
  kindergarten: 'darzeliai',
  aukle: 'aukles',
  burelis: 'bureliai',
  specialist: 'specialistai',
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
      prisma.kindergarten.findMany({
        where: { OR: [{ name: { contains: q } }, { city: { contains: q } }, { address: { contains: q } }] },
        select: { id: true, name: true, city: true, slug: true, baseRating: true },
        take: 3,
        orderBy: { baseRating: 'desc' },
      }),
      prisma.aukle.findMany({
        where: { OR: [{ name: { contains: q } }, { city: { contains: q } }] },
        select: { id: true, name: true, city: true, slug: true, baseRating: true },
        take: 2,
        orderBy: { baseRating: 'desc' },
      }),
      prisma.burelis.findMany({
        where: { OR: [{ name: { contains: q } }, { city: { contains: q } }, { category: { contains: q } }] },
        select: { id: true, name: true, city: true, slug: true, baseRating: true },
        take: 2,
        orderBy: { baseRating: 'desc' },
      }),
      prisma.specialist.findMany({
        where: { OR: [{ name: { contains: q } }, { city: { contains: q } }, { specialty: { contains: q } }] },
        select: { id: true, name: true, city: true, slug: true, baseRating: true },
        take: 2,
        orderBy: { baseRating: 'desc' },
      }),
    ]);

    const suggestions = [
      ...kindergartens.map(i => ({
        id: i.id, name: i.name, city: i.city, slug: i.slug,
        type: 'darzeliai' as const, itemType: 'kindergarten' as const,
        rating: i.baseRating,
        citySlug: getCitySlug(i.city),
      })),
      ...aukles.map(i => ({
        id: i.id, name: i.name, city: i.city, slug: i.slug,
        type: 'aukles' as const, itemType: 'aukle' as const,
        rating: i.baseRating,
        citySlug: getCitySlug(i.city),
      })),
      ...bureliai.map(i => ({
        id: i.id, name: i.name, city: i.city, slug: i.slug,
        type: 'bureliai' as const, itemType: 'burelis' as const,
        rating: i.baseRating,
        citySlug: getCitySlug(i.city),
      })),
      ...specialists.map(i => ({
        id: i.id, name: i.name, city: i.city, slug: i.slug,
        type: 'specialistai' as const, itemType: 'specialist' as const,
        rating: i.baseRating,
        citySlug: getCitySlug(i.city),
      })),
    ].slice(0, 5).map(s => ({
      ...s,
      url: s.citySlug ? `/${s.citySlug}?category=${categoryMap[s.itemType] || 'darzeliai'}` : `/paieska?q=${encodeURIComponent(s.name)}`,
    }));

    return NextResponse.json({ suggestions }, {
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
    });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
