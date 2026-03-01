import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/** Strip HTML tags from user input to prevent stored XSS */
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/** Check nesting depth of a comment by walking up the parent chain */
async function getCommentDepth(parentId: string): Promise<number> {
  let depth = 1;
  let currentId: string | null = parentId;

  while (currentId) {
    const parent: { parentId: string | null } | null = await prisma.forumComment.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    if (!parent || !parent.parentId) break;
    currentId = parent.parentId;
    depth++;
  }

  return depth;
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.REVIEW_POST);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Netinkamas JSON formatas', 400);
  }

  const { postId, content: rawContent, authorName: rawAuthor, parentId } =
    body as Record<string, unknown>;

  // Validate postId
  if (!postId || typeof postId !== 'string') {
    return errorResponse('Įrašo ID yra privalomas', 400);
  }
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { id: true, isLocked: true },
  });
  if (!post) {
    return errorResponse('Įrašas nerastas', 404);
  }
  if (post.isLocked) {
    return errorResponse('Šis įrašas yra užrakintas — komentarai negalimi', 403);
  }

  // Validate content
  if (!rawContent || typeof rawContent !== 'string') {
    return errorResponse('Komentaro turinys yra privalomas', 400);
  }
  const cleanContent = stripHtml(rawContent.trim());
  if (cleanContent.length < 2) {
    return errorResponse('Komentaras turi būti bent 2 simbolių', 400);
  }
  if (cleanContent.length > 2000) {
    return errorResponse('Komentaras negali viršyti 2000 simbolių', 400);
  }

  // Validate authorName
  if (!rawAuthor || typeof rawAuthor !== 'string') {
    return errorResponse('Autoriaus vardas yra privalomas', 400);
  }
  const cleanAuthor = stripHtml(rawAuthor.trim());
  if (cleanAuthor.length < 2) {
    return errorResponse('Autoriaus vardas turi būti bent 2 simbolių', 400);
  }
  if (cleanAuthor.length > 50) {
    return errorResponse('Autoriaus vardas negali viršyti 50 simbolių', 400);
  }

  // Validate parentId (optional)
  let validParentId: string | null = null;
  if (parentId && typeof parentId === 'string') {
    const parentComment = await prisma.forumComment.findUnique({
      where: { id: parentId },
      select: { id: true, postId: true },
    });
    if (!parentComment) {
      return errorResponse('Tėvinis komentaras nerastas', 404);
    }
    if (parentComment.postId !== postId) {
      return errorResponse('Tėvinis komentaras priklauso kitam įrašui', 400);
    }

    // Check nesting depth (max 3 levels: root=1, reply=2, sub-reply=3)
    const depth = await getCommentDepth(parentId);
    if (depth >= 3) {
      return errorResponse('Pasiektas maksimalus komentarų gylis (3 lygiai)', 400);
    }

    validParentId = parentId;
  }

  try {
    const comment = await prisma.forumComment.create({
      data: {
        postId: postId as string,
        parentId: validParentId,
        content: cleanContent,
        authorName: cleanAuthor,
      },
    });

    return jsonResponse(comment, 201);
  } catch {
    return errorResponse('Nepavyko sukurti komentaro', 500);
  }
}
