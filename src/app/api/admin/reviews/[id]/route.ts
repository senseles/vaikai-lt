import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

type Params = { params: { id: string } };

/** PATCH /api/admin/reviews/[id] — approve or reject a review */
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    const body = await request.json();

    // Only allow updating the approval status — prevent modifying rating, text, etc.
    const data: { isApproved?: boolean } = {};
    if (typeof body.isApproved === 'boolean') {
      data.isApproved = body.isApproved;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bent vienas laukas (isApproved) privalomas' },
        { status: 400 },
      );
    }

    // Fetch current state for audit log
    const current = await prisma.review.findUnique({ where: { id }, select: { isApproved: true } });

    const updated = await prisma.review.update({ where: { id }, data });

    // Audit log
    logAuditEvent({
      action: data.isApproved ? 'REVIEW_APPROVE' : 'REVIEW_REJECT',
      targetType: 'review',
      targetId: id,
      oldValue: current ? String(current.isApproved) : null,
      newValue: String(data.isApproved),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(`Admin patch review/${id} error:`, err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to update not found')) {
      return NextResponse.json({ success: false, error: 'Atsiliepimas nerastas' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Nepavyko atnaujinti' }, { status: 500 });
  }
}

/** DELETE /api/admin/reviews/[id] — delete a review */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ success: false, error: 'ID privalomas' }, { status: 400 });
  }

  try {
    await prisma.review.delete({ where: { id } });

    logAuditEvent({
      action: 'REVIEW_DELETE',
      targetType: 'review',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`Admin delete review/${id} error:`, err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to delete does not exist')) {
      return NextResponse.json({ success: false, error: 'Atsiliepimas nerastas' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Nepavyko ištrinti atsiliepimo' }, { status: 500 });
  }
}
