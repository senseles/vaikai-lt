import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getPagination, jsonResponse, matchesSearch } from '@/lib/api-utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.PUBLIC_GET);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPagination(searchParams);

  const city = searchParams.get('city');
  const region = searchParams.get('region');
  const search = searchParams.get('search');
  const ids = searchParams.getAll('ids');

  const where: Record<string, unknown> = {};
  if (ids.length > 0) where.id = { in: ids };
  if (city) where.city = city;
  if (region) where.region = region;

  if (search) {
    const allItems = await prisma.aukle.findMany({ where, orderBy: { name: 'asc' } });
    const filtered = allItems.filter((item) =>
      matchesSearch(item.name, search) ||
      matchesSearch(item.city, search) ||
      matchesSearch(item.description, search)
    );
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return jsonResponse({
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  const [items, total] = await Promise.all([
    prisma.aukle.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.aukle.count({ where }),
  ]);

  return jsonResponse({
    data: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
