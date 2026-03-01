import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getPagination, jsonResponse, matchesSearch } from '@/lib/api-utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { getCached, setCache, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.PUBLIC_GET);
  if (rateLimitResponse) return rateLimitResponse;

  const cacheKey = request.url;
  const cached = getCached(cacheKey);
  if (cached) return jsonResponse(cached);

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPagination(searchParams);

  const city = searchParams.get('city');
  const region = searchParams.get('region');
  const type = searchParams.get('type');
  const search = searchParams.get('search');
  const ids = searchParams.getAll('ids');

  const where: Record<string, unknown> = {};
  if (ids.length > 0) where.id = { in: ids };
  if (city) where.city = city;
  if (region) where.region = region;
  if (type) where.type = type;

  // For search: fetch all matching base filters, then filter in JS for Lithuanian case-insensitivity
  if (search) {
    const allItems = await prisma.kindergarten.findMany({ where, orderBy: { name: 'asc' } });
    const filtered = allItems.filter((item) =>
      matchesSearch(item.name, search) ||
      matchesSearch(item.city, search) ||
      matchesSearch(item.description, search)
    );
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    const result = {
      data: paginated.map((i) => { try { return { ...i, features: JSON.parse(i.features) }; } catch { return { ...i, features: [] }; } }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
    setCache(cacheKey, result, CACHE_TTL.LIST);
    return jsonResponse(result);
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
  return jsonResponse(result);
}
