import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** GET /api/admin/forum/comments — list all comments (most recent first) */
export async function GET() {
  try {
    const comments = await prisma.forumComment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        post: { select: { title: true, id: true } },
      },
      take: 200,
    });

    const formatted = comments.map((c) => ({
      id: c.id,
      content: c.content,
      authorName: c.authorName,
      postTitle: c.post.title,
      postId: c.post.id,
      upvotes: c.upvotes,
      downvotes: c.downvotes,
      createdAt: c.createdAt.toISOString(),
    }));

    return json({ comments: formatted });
  } catch (err) {
    console.error('Admin forum comments GET error:', err);
    return json({ success: false, error: 'Nepavyko gauti komentarų' }, 500);
  }
}

/** DELETE /api/admin/forum/comments — delete a comment */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body as { id?: string };

    if (!id || typeof id !== 'string') {
      return json({ success: false, error: 'ID privalomas' }, 400);
    }

    // Delete votes on this comment first
    await prisma.forumVote.deleteMany({ where: { commentId: id } });
    // Delete child replies (if any)
    const childIds = await prisma.forumComment.findMany({ where: { parentId: id }, select: { id: true } });
    if (childIds.length > 0) {
      await prisma.forumVote.deleteMany({ where: { commentId: { in: childIds.map((c) => c.id) } } });
      await prisma.forumComment.deleteMany({ where: { parentId: id } });
    }
    // Delete the comment
    await prisma.forumComment.delete({ where: { id } });

    return json({ success: true });
  } catch (err) {
    console.error('Admin forum comment DELETE error:', err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to delete does not exist')) {
      return json({ success: false, error: 'Komentaras nerastas' }, 404);
    }
    return json({ success: false, error: 'Nepavyko ištrinti komentaro' }, 500);
  }
}
