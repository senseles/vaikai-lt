import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

interface CommentWithReplies {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  authorName: string;
  authorId: string | null;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  replies: CommentWithReplies[];
}

/** Build a threaded comment tree (max 3 levels) */
function buildCommentTree(
  comments: Array<{
    id: string;
    postId: string;
    parentId: string | null;
    content: string;
    authorName: string;
    authorId: string | null;
    upvotes: number;
    downvotes: number;
    createdAt: Date;
  }>,
): CommentWithReplies[] {
  const map = new Map<string, CommentWithReplies>();
  const roots: CommentWithReplies[] = [];

  // Initialize all comments with empty replies
  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] });
  }

  // Build tree
  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  // Limit depth to 3 levels (root = level 1, replies = level 2, sub-replies = level 3)
  function trimDepth(nodes: CommentWithReplies[], depth: number): CommentWithReplies[] {
    if (depth >= 3) {
      return nodes.map((n) => ({ ...n, replies: [] }));
    }
    return nodes.map((n) => ({
      ...n,
      replies: trimDepth(n.replies, depth + 1),
    }));
  }

  return trimDepth(roots, 1);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.PUBLIC_GET);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const post = await prisma.forumPost.findUnique({
      where: { slug: params.slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      return errorResponse('Įrašas nerastas', 404);
    }

    // Increment view count (non-blocking)
    prisma.forumPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => { /* view count failure should not block */ });

    const { comments, ...postData } = post;
    const commentTree = buildCommentTree(comments);

    return jsonResponse({
      ...postData,
      comments: commentTree,
    });
  } catch {
    return errorResponse('Vidinė serverio klaida', 500);
  }
}
