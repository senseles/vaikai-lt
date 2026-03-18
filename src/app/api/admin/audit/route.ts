import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse, getPagination } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPagination(searchParams);
  const action = searchParams.get('action');

  try {
    const where: Record<string, unknown> = {};
    if (action) where.action = action;

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return jsonResponse({
      data: entries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return errorResponse('Nepavyko gauti audito įrašų', 500);
  }
}
