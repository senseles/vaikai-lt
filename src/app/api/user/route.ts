import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { stripHtml } from '@/lib/security';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as { id?: string }).id) {
    return errorResponse('Neprisijungęs', 401);
  }
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) return errorResponse('Vartotojas nerastas', 404);

  const [reviews, forumPosts, forumComments] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, itemId: true, itemType: true, authorName: true, rating: true, text: true, isApproved: true, createdAt: true },
    }),
    prisma.forumPost.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, categoryId: true, upvotes: true, createdAt: true },
    }),
    prisma.forumComment.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, content: true, postId: true, createdAt: true },
    }),
  ]);

  const providers = user.accounts.map(a => a.provider);
  const loginMethod = providers.length > 0 ? providers.join(', ') : 'El. paštas';

  return jsonResponse({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      loginMethod,
    },
    reviews,
    forumPosts,
    forumComments,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as { id?: string }).id) {
    return errorResponse('Neprisijungęs', 401);
  }
  const userId = (session.user as { id: string }).id;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Netinkamas JSON', 400);
  }

  const data: { name?: string } = {};
  if (typeof body.name === 'string') {
    const clean = stripHtml(body.name.trim());
    if (clean.length < 1 || clean.length > 100) {
      return errorResponse('Vardas turi būti 1-100 simbolių', 400);
    }
    data.name = clean;
  }

  if (Object.keys(data).length === 0) {
    return errorResponse('Nėra ką atnaujinti', 400);
  }

  const updated = await prisma.user.update({ where: { id: userId }, data });
  return jsonResponse({ success: true, user: { name: updated.name } });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as { id?: string }).id) {
    return errorResponse('Neprisijungęs', 401);
  }
  const userId = (session.user as { id: string }).id;

  // GDPR: Delete user and all related data (cascading via Prisma)
  await prisma.user.delete({ where: { id: userId } });

  return jsonResponse({ success: true, message: 'Paskyra ištrinta' });
}
