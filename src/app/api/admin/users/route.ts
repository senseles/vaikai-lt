import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** GET /api/admin/users — list users with search, filter, pagination */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10) || 20));
  const skip = (page - 1) * limit;
  const search = searchParams.get('search')?.trim() || '';
  const role = searchParams.get('role') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  try {
    // Build where clause
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role;
    }

    // Build orderBy
    const validSorts = ['createdAt', 'email', 'name', 'role'];
    const orderBy = validSorts.includes(sort)
      ? { [sort]: order }
      : { createdAt: 'desc' as const };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          isBlocked: true,
          createdAt: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Get forum activity counts for these users
    const userIds = users.map(u => u.id);
    const forumPostCounts = await prisma.forumPost.groupBy({
      by: ['authorId'],
      where: { authorId: { in: userIds } },
      _count: true,
    });
    const forumCommentCounts = await prisma.forumComment.groupBy({
      by: ['authorId'],
      where: { authorId: { in: userIds } },
      _count: true,
    });

    const postCountMap = new Map(forumPostCounts.map(p => [p.authorId, p._count]));
    const commentCountMap = new Map(forumCommentCounts.map(c => [c.authorId, c._count]));

    const enrichedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      image: u.image,
      role: u.role,
      isBlocked: u.isBlocked,
      createdAt: u.createdAt,
      reviewCount: u._count.reviews,
      forumPostCount: postCountMap.get(u.id) ?? 0,
      forumCommentCount: commentCountMap.get(u.id) ?? 0,
    }));

    return json({
      success: true,
      data: enrichedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Admin users list error:', err);
    return json({ success: false, error: 'Nepavyko gauti vartotojų sąrašo' }, 500);
  }
}

/** PATCH /api/admin/users — update user role or blocked status */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, isBlocked } = body as {
      userId?: string;
      role?: string;
      isBlocked?: boolean;
    };

    if (!userId || typeof userId !== 'string') {
      return json({ success: false, error: 'userId privalomas' }, 400);
    }

    const data: Record<string, unknown> = {};

    if (typeof role === 'string' && ['USER', 'ADMIN'].includes(role)) {
      data.role = role;
    }
    if (typeof isBlocked === 'boolean') {
      data.isBlocked = isBlocked;
    }

    if (Object.keys(data).length === 0) {
      return json({ success: false, error: 'Bent vienas laukas (role, isBlocked) privalomas' }, 400);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
      },
    });

    return json({ success: true, data: updated });
  } catch (err) {
    console.error('Admin user update error:', err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to update not found')) {
      return json({ success: false, error: 'Vartotojas nerastas' }, 404);
    }
    return json({ success: false, error: 'Nepavyko atnaujinti vartotojo' }, 500);
  }
}
