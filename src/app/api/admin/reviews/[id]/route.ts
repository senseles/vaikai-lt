import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    const updated = await prisma.review.update({ where: { id }, data });
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
