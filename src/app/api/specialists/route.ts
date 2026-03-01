import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getPagination, jsonResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPagination(searchParams);

  const city = searchParams.get('city');
  const region = searchParams.get('region');
  const specialty = searchParams.get('specialty');
  const search = searchParams.get('search');

  const ids = searchParams.getAll('ids');

  const where: Record<string, unknown> = {};
  if (ids.length > 0) where.id = { in: ids };
  if (city) where.city = city;
  if (region) where.region = region;
  if (specialty) where.specialty = specialty;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.specialist.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.specialist.count({ where }),
  ]);

  return jsonResponse({
    data: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
