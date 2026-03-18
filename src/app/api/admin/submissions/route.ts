import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status'); // PENDING | APPROVED | REJECTED
  const entityType = searchParams.get('entityType');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));

  const where: Record<string, unknown> = {};
  if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    where.status = status;
  }
  if (entityType && ['KINDERGARTEN', 'AUKLE', 'BURELIS', 'SPECIALIST'].includes(entityType)) {
    where.entityType = entityType;
  }

  try {
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.submission.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: submissions,
      total,
      page,
      pageSize,
    });
  } catch (err) {
    console.error('Admin submissions GET error:', err);
    return NextResponse.json({ success: false, error: 'Serverio klaida.' }, { status: 500 });
  }
}
