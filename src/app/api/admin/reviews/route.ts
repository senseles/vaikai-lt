import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** GET /api/admin/reviews — list reviews with filters */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pending = searchParams.get('pending') === 'true';
  const approved = searchParams.get('approved') === 'true';
  const itemType = searchParams.get('itemType');
  const rating = searchParams.get('rating');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (pending) where.isApproved = false;
  else if (approved) where.isApproved = true;

  if (itemType && ['kindergarten', 'aukle', 'burelis', 'specialist'].includes(itemType)) {
    where.itemType = itemType;
  }

  if (rating) {
    const r = Number(rating);
    if (r >= 1 && r <= 5) where.rating = r;
  }

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return json(reviews);
}

/** PATCH /api/admin/reviews — bulk approve or reject */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action } = body as { ids?: string[]; action?: string };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return json({ success: false, error: 'Reikalingi ID' }, 400);
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return json({ success: false, error: 'Netinkamas veiksmas (approve arba reject)' }, 400);
    }

    const isApproved = action === 'approve';

    await prisma.review.updateMany({
      where: { id: { in: ids } },
      data: { isApproved },
    });

    return json({ success: true, updated: ids.length });
  } catch (err) {
    console.error('Admin bulk review action error:', err);
    return json({ success: false, error: 'Nepavyko atlikti veiksmo' }, 500);
  }
}
