import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pending = searchParams.get('pending') === 'true';

  const where = pending ? { isApproved: false } : {};

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(reviews);
}
