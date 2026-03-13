import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { checkCsrf } from '@/lib/security';

export async function POST(request: NextRequest) {
  // CSRF protection
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  // Rate limiting: 30 votes per minute
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.FORUM_VOTE);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Netinkamas JSON formatas', 400);
  }

  const { postId, commentId, sessionId, value } = body as Record<string, unknown>;

  // T8: Prefer userId from session, fallback to sessionId for backwards compat
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  // Require either userId or sessionId
  if (!userId && (!sessionId || typeof sessionId !== 'string')) {
    return errorResponse('Prisijunkite arba pateikite sesijos ID', 400);
  }

  if (sessionId && typeof sessionId === 'string') {
    if (sessionId.length > 64 || !/^[a-f0-9-]+$/i.test(sessionId)) {
      return errorResponse('Netinkamas sesijos ID formatas', 400);
    }
  }

  // Validate value
  if (value !== 1 && value !== -1) {
    return errorResponse('Balsas turi būti 1 arba -1', 400);
  }

  // Must vote on either post or comment, not both
  if ((!postId && !commentId) || (postId && commentId)) {
    return errorResponse('Nurodykite postId arba commentId (ne abu)', 400);
  }

  try {
    if (postId && typeof postId === 'string') {
      // Voting on a post
      const post = await prisma.forumPost.findUnique({
        where: { id: postId },
        select: { id: true },
      });
      if (!post) {
        return errorResponse('Įrašas nerastas', 404);
      }

      // Check for existing vote — prefer userId, fallback to sessionId
      let existingVote = null;
      if (userId) {
        existingVote = await prisma.forumVote.findUnique({
          where: { postId_userId: { postId, userId } },
        });
      }
      if (!existingVote && sessionId && typeof sessionId === 'string') {
        existingVote = await prisma.forumVote.findUnique({
          where: { postId_sessionId: { postId, sessionId } },
        });
      }

      if (existingVote) {
        if (existingVote.value === value) {
          // Same vote — remove it (toggle off)
          await prisma.$transaction([
            prisma.forumVote.delete({ where: { id: existingVote.id } }),
            prisma.forumPost.update({
              where: { id: postId },
              data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
            }),
          ]);
          return jsonResponse({ action: 'removed', postId });
        } else {
          // Different vote — update
          await prisma.$transaction([
            prisma.forumVote.update({
              where: { id: existingVote.id },
              data: { value: value as number, userId: userId ?? existingVote.userId },
            }),
            prisma.forumPost.update({
              where: { id: postId },
              data: value === 1
                ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
                : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
            }),
          ]);
          return jsonResponse({ action: 'changed', postId, value });
        }
      }

      // New vote
      await prisma.$transaction([
        prisma.forumVote.create({
          data: {
            postId,
            sessionId: typeof sessionId === 'string' ? sessionId : null,
            userId,
            value: value as number,
          },
        }),
        prisma.forumPost.update({
          where: { id: postId },
          data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
        }),
      ]);

      return jsonResponse({ action: 'voted', postId, value }, 201);
    }

    if (commentId && typeof commentId === 'string') {
      // Voting on a comment
      const comment = await prisma.forumComment.findUnique({
        where: { id: commentId },
        select: { id: true },
      });
      if (!comment) {
        return errorResponse('Komentaras nerastas', 404);
      }

      // Check for existing vote
      let existingVote = null;
      if (userId) {
        existingVote = await prisma.forumVote.findUnique({
          where: { commentId_userId: { commentId, userId } },
        });
      }
      if (!existingVote && sessionId && typeof sessionId === 'string') {
        existingVote = await prisma.forumVote.findUnique({
          where: { commentId_sessionId: { commentId, sessionId } },
        });
      }

      if (existingVote) {
        if (existingVote.value === value) {
          // Same vote — remove it
          await prisma.$transaction([
            prisma.forumVote.delete({ where: { id: existingVote.id } }),
            prisma.forumComment.update({
              where: { id: commentId },
              data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
            }),
          ]);
          return jsonResponse({ action: 'removed', commentId });
        } else {
          // Different vote — update
          await prisma.$transaction([
            prisma.forumVote.update({
              where: { id: existingVote.id },
              data: { value: value as number, userId: userId ?? existingVote.userId },
            }),
            prisma.forumComment.update({
              where: { id: commentId },
              data: value === 1
                ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
                : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
            }),
          ]);
          return jsonResponse({ action: 'changed', commentId, value });
        }
      }

      // New vote
      await prisma.$transaction([
        prisma.forumVote.create({
          data: {
            commentId,
            sessionId: typeof sessionId === 'string' ? sessionId : null,
            userId,
            value: value as number,
          },
        }),
        prisma.forumComment.update({
          where: { id: commentId },
          data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
        }),
      ]);

      return jsonResponse({ action: 'voted', commentId, value }, 201);
    }

    return errorResponse('Netinkama užklausa', 400);
  } catch {
    return errorResponse('Vidine serverio klaida', 500);
  }
}
