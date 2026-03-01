import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse } from '@/lib/api-utils';

export async function GET(_request: NextRequest) {
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

  return jsonResponse(result);
}
