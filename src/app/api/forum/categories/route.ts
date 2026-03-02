import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { cachedJsonResponse, errorResponse } from '@/lib/api-utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.PUBLIC_GET);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const categories = await prisma.forumCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const data = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
      postCount: cat._count.posts,
    }));

    return cachedJsonResponse(data, 300, 600);
  } catch {
    return errorResponse('Vidinė serverio klaida', 500);
  }
}
