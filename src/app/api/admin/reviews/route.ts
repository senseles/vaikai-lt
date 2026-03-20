import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPagination } from '@/lib/api-utils';
import { logAuditEvent } from '@/lib/audit';

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** GET /api/admin/reviews — list reviews with filters and pagination */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPagination(searchParams);
  const pending = searchParams.get('pending') === 'true';
  const approved = searchParams.get('approved') === 'true';
  const itemType = searchParams.get('itemType');
  const itemId = searchParams.get('itemId');
  const rating = searchParams.get('rating');
  const search = searchParams.get('search');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (pending) where.isApproved = false;
  else if (approved) where.isApproved = true;

  if (itemType && ['kindergarten', 'aukle', 'burelis', 'specialist'].includes(itemType)) {
    where.itemType = itemType;
  }

  if (itemId && typeof itemId === 'string') {
    where.itemId = itemId;
  }

  if (rating) {
    const r = Number(rating);
    if (r >= 1 && r <= 5) where.rating = r;
  }

  if (search) {
    where.OR = [
      { authorName: { contains: search, mode: 'insensitive' as const } },
      { text: { contains: search, mode: 'insensitive' as const } },
    ];
  }

  // Sort parameter
  const sortParam = searchParams.get('sort') ?? 'date_desc';
  const orderBy: Record<string, string> = {};
  switch (sortParam) {
    case 'date_asc': orderBy.createdAt = 'asc'; break;
    case 'rating_desc': orderBy.rating = 'desc'; break;
    case 'rating_asc': orderBy.rating = 'asc'; break;
    default: orderBy.createdAt = 'desc';
  }

  const [reviews, totalCount, pendingCount, approvedCount, totalAll] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { replies: { take: 1, orderBy: { createdAt: 'desc' } } },
    }),
    prisma.review.count({ where }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.review.count(),
  ]);

  // Resolve entity names for each review (batched to avoid N+1)
  const itemIds: Record<string, Set<string>> = {
    kindergarten: new Set(),
    aukle: new Set(),
    burelis: new Set(),
    specialist: new Set(),
  };
  for (const r of reviews) {
    if (itemIds[r.itemType]) {
      itemIds[r.itemType].add(r.itemId);
    }
  }

  const nameMap = new Map<string, string>();

  const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
    itemIds.kindergarten.size > 0
      ? prisma.kindergarten.findMany({ where: { id: { in: Array.from(itemIds.kindergarten) } }, select: { id: true, name: true } })
      : [],
    itemIds.aukle.size > 0
      ? prisma.aukle.findMany({ where: { id: { in: Array.from(itemIds.aukle) } }, select: { id: true, name: true } })
      : [],
    itemIds.burelis.size > 0
      ? prisma.burelis.findMany({ where: { id: { in: Array.from(itemIds.burelis) } }, select: { id: true, name: true } })
      : [],
    itemIds.specialist.size > 0
      ? prisma.specialist.findMany({ where: { id: { in: Array.from(itemIds.specialist) } }, select: { id: true, name: true } })
      : [],
  ]);

  for (const item of [...kindergartens, ...aukles, ...bureliai, ...specialists]) {
    nameMap.set(item.id, item.name);
  }

  const enrichedReviews = reviews.map((r) => ({
    ...r,
    itemName: nameMap.get(r.itemId) ?? undefined,
    reply: r.replies && r.replies.length > 0 ? r.replies[0] : null,
    replies: undefined,
  }));

  return json({
    reviews: enrichedReviews,
    total: totalCount,
    pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    counts: { pending: pendingCount, approved: approvedCount, all: totalAll },
  });
}

/** PATCH /api/admin/reviews — bulk approve or reject */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action } = body as { ids?: unknown[]; action?: string };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return json({ success: false, error: 'Reikalingi ID' }, 400);
    }

    if (!ids.every((id): id is string => typeof id === 'string' && id.length > 0)) {
      return json({ success: false, error: 'Visi ID turi būti tekstinės reikšmės' }, 400);
    }

    if (ids.length > 100) {
      return json({ success: false, error: 'Maksimalus kiekis: 100 ID' }, 400);
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return json({ success: false, error: 'Netinkamas veiksmas (approve arba reject)' }, 400);
    }

    const isApproved = action === 'approve';

    const result = await prisma.review.updateMany({
      where: { id: { in: ids } },
      data: { isApproved },
    });

    // Audit log for bulk action
    for (const targetId of ids) {
      logAuditEvent({
        action: isApproved ? 'REVIEW_APPROVE' : 'REVIEW_REJECT',
        targetType: 'review',
        targetId,
        details: `Bulk ${action}`,
      });
    }

    return json({ success: true, updated: result.count });
  } catch (err) {
    console.error('Admin bulk review action error:', err);
    return json({ success: false, error: 'Nepavyko atlikti veiksmo' }, 500);
  }
}
