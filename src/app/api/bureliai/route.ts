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
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const ids = searchParams.getAll('ids');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};
    if (ids.length > 0) where.id = { in: ids };
    if (city) where.city = city;
    if (region) where.region = region;
    if (category) where.category = category;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { city: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { category: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.burelis.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.burelis.count({ where }),
    ]);

    const result = {
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
    setCache(cacheKey, result, CACHE_TTL.LIST);
    return cachedJsonResponse(result);
  } catch {
    return errorResponse('Vidinė serverio klaida', 500);
  }
}
