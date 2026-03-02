import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
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

  // Validate sessionId (must be a UUID format)
  if (!sessionId || typeof sessionId !== 'string') {
    return errorResponse('Sesijos ID yra privalomas', 400);
  }
  if (sessionId.length > 64 || !/^[a-f0-9-]+$/i.test(sessionId)) {
    return errorResponse('Netinkamas sesijos ID formatas', 400);
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

      // Check for existing vote
      const existingVote = await prisma.forumVote.findUnique({
        where: { postId_sessionId: { postId, sessionId: sessionId as string } },
      });

      if (existingVote) {
        if (existingVote.value === value) {
          // Same vote — remove it (toggle off) — atomic transaction
          await prisma.$transaction([
            prisma.forumVote.delete({ where: { id: existingVote.id } }),
            prisma.forumPost.update({
              where: { id: postId },
              data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
            }),
          ]);
          return jsonResponse({ action: 'removed', postId });
        } else {
          // Different vote — update — atomic transaction
          await prisma.$transaction([
            prisma.forumVote.update({
              where: { id: existingVote.id },
              data: { value: value as number },
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

      // New vote — atomic transaction
      await prisma.$transaction([
        prisma.forumVote.create({
          data: {
            postId,
            sessionId: sessionId as string,
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
      const existingVote = await prisma.forumVote.findUnique({
        where: { commentId_sessionId: { commentId, sessionId: sessionId as string } },
      });

      if (existingVote) {
        if (existingVote.value === value) {
          // Same vote — remove it — atomic transaction
          await prisma.$transaction([
            prisma.forumVote.delete({ where: { id: existingVote.id } }),
            prisma.forumComment.update({
              where: { id: commentId },
              data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
            }),
          ]);
          return jsonResponse({ action: 'removed', commentId });
        } else {
          // Different vote — update — atomic transaction
          await prisma.$transaction([
            prisma.forumVote.update({
              where: { id: existingVote.id },
              data: { value: value as number },
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

      // New vote — atomic transaction
      await prisma.$transaction([
        prisma.forumVote.create({
          data: {
            commentId,
            sessionId: sessionId as string,
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
    return errorResponse('Vidinė serverio klaida', 500);
  }
}
