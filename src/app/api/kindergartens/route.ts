import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getPagination, cachedJsonResponse, errorResponse } from '@/lib/api-utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { getCached, setCache, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.PUBLIC_GET);
  if (rateLimitResponse) return rateLimitResponse;

  const cacheKey = request.url;
  const cached = getCached(cacheKey);
  if (cached) return cachedJsonResponse(cached);

  try {
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = getPagination(searchParams);

    const city = searchParams.get('city');
    const region = searchParams.get('region');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const ids = searchParams.getAll('ids');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};
    if (ids.length > 0) where.id = { in: ids };
    if (city) where.city = city;
    if (region) where.region = region;
    if (type) where.type = type;

    if (search) {
      // Use raw SQL fragment for unaccent Lithuanian search
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { city: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.kindergarten.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.kindergarten.count({ where }),
    ]);

    const result = {
      data: items.map((i) => { try { return { ...i, features: JSON.parse(i.features) }; } catch { return { ...i, features: [] }; } }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
    setCache(cacheKey, result, CACHE_TTL.LIST);
    return cachedJsonResponse(result);
  } catch {
    return errorResponse('Vidinė serverio klaida', 500);
  }
}
