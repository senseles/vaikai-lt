import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = { params: { id: string } };

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
