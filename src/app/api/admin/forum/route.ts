import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** GET /api/admin/forum — list forum posts with details */
export async function GET() {
  try {
    const posts = await prisma.forumPost.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: { select: { name: true } },
        _count: { select: { comments: true } },
      },
      take: 200,
    });

    const formatted = posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      authorName: p.authorName,
      categoryName: p.category.name,
      city: p.city,
      upvotes: p.upvotes,
      downvotes: p.downvotes,
      viewCount: p.viewCount,
      isPinned: p.isPinned,
      isLocked: p.isLocked,
      commentCount: p._count.comments,
      createdAt: p.createdAt.toISOString(),
    }));

    return json({ posts: formatted });
  } catch (err) {
    console.error('Admin forum GET error:', err);
    return json({ success: false, error: 'Nepavyko gauti forumo įrašų' }, 500);
  }
}

/** PATCH /api/admin/forum — pin/unpin or lock/unlock a post */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isPinned, isLocked } = body as { id?: string; isPinned?: boolean; isLocked?: boolean };

    if (!id || typeof id !== 'string') {
      return json({ success: false, error: 'ID privalomas' }, 400);
    }

    const data: { isPinned?: boolean; isLocked?: boolean } = {};
    if (typeof isPinned === 'boolean') data.isPinned = isPinned;
    if (typeof isLocked === 'boolean') data.isLocked = isLocked;

    if (Object.keys(data).length === 0) {
      return json({ success: false, error: 'Bent vienas laukas (isPinned, isLocked) privalomas' }, 400);
    }

    const updated = await prisma.forumPost.update({ where: { id }, data });
    return json({ success: true, data: updated });
  } catch (err) {
    console.error('Admin forum PATCH error:', err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to update not found')) {
      return json({ success: false, error: 'Įrašas nerastas' }, 404);
    }
    return json({ success: false, error: 'Nepavyko atnaujinti' }, 500);
  }
}

/** DELETE /api/admin/forum — delete a forum post (cascade deletes comments) */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body as { id?: string };

    if (!id || typeof id !== 'string') {
      return json({ success: false, error: 'ID privalomas' }, 400);
    }

    // Delete votes first (they reference post)
    await prisma.forumVote.deleteMany({ where: { postId: id } });
    // Comments cascade via onDelete: Cascade, but votes on comments need manual cleanup
    const commentIds = await prisma.forumComment.findMany({ where: { postId: id }, select: { id: true } });
    if (commentIds.length > 0) {
      await prisma.forumVote.deleteMany({ where: { commentId: { in: commentIds.map((c) => c.id) } } });
    }
    // Now delete the post (comments cascade)
    await prisma.forumPost.delete({ where: { id } });

    return json({ success: true });
  } catch (err) {
    console.error('Admin forum DELETE error:', err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to delete does not exist')) {
      return json({ success: false, error: 'Įrašas nerastas' }, 404);
    }
    return json({ success: false, error: 'Nepavyko ištrinti' }, 500);
  }
}
