import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { getCached, setCache, CACHE_TTL } from '@/lib/cache';

export async function GET() {
  const cacheKey = 'cities';
  const cached = getCached(cacheKey);
  if (cached) return jsonResponse(cached);

  try {
    const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
      prisma.kindergarten.groupBy({ by: ['city'], _count: true, orderBy: { city: 'asc' } }),
      prisma.aukle.groupBy({ by: ['city'], _count: true, orderBy: { city: 'asc' } }),
      prisma.burelis.groupBy({ by: ['city'], _count: true, orderBy: { city: 'asc' } }),
      prisma.specialist.groupBy({ by: ['city'], _count: true, orderBy: { city: 'asc' } }),
    ]);

    const cityMap = new Map<string, {
      kindergartens: number;
      aukles: number;
      bureliai: number;
      specialists: number;
    }>();

    const ensure = (city: string) => {
      if (!cityMap.has(city)) {
        cityMap.set(city, { kindergartens: 0, aukles: 0, bureliai: 0, specialists: 0 });
      }
      return cityMap.get(city)!;
    };

    for (const g of kindergartens) { ensure(g.city).kindergartens = g._count; }
    for (const g of aukles) { ensure(g.city).aukles = g._count; }
    for (const g of bureliai) { ensure(g.city).bureliai = g._count; }
    for (const g of specialists) { ensure(g.city).specialists = g._count; }

    const result = Array.from(cityMap.entries())
      .map(([city, counts]) => ({ city, ...counts }))
      .sort((a, b) => a.city.localeCompare(b.city, 'lt'));

    setCache(cacheKey, result, CACHE_TTL.CITIES);
    return jsonResponse(result);
  } catch {
    return errorResponse('Vidinė serverio klaida', 500);
  }
}
