import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = { params: { id: string } };

/** PATCH /api/admin/reviews/[id] — update a review (approve etc.) */
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    const body = await request.json();
    const updated = await prisma.review.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(`Admin patch review/${id} error:`, err);
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
    const message = err instanceof Error ? err.message : 'Nepavyko ištrinti atsiliepimo';
    const status = message.includes('Record to delete does not exist') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
