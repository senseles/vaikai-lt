import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;

  const where: Record<string, string> = {};
  if (status && ['pending', 'reviewed', 'dismissed'].includes(status)) {
    where.status = status;
  }

  try {
    const reports = await prisma.forumReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    if (!['pending', 'reviewed', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const report = await prisma.forumReport.update({
      where: { id },
      data: {
        status,
        reviewedAt: status === 'pending' ? null : new Date(),
      },
    });

    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
