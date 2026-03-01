import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = { params: { id: string } };

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** GET /api/admin/specialistai/[id] */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    const item = await prisma.specialist.findUnique({ where: { id } });
    if (!item) return json({ success: false, error: 'Nerastas' }, 404);
    return json({ success: true, data: item });
  } catch (err) {
    console.error(`Admin get specialist/${id} error:`, err);
    return json({ success: false, error: 'Vidinė klaida' }, 500);
  }
}

/** PATCH /api/admin/specialistai/[id] */
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    const body = await request.json();
    delete body.id;
    delete body.createdAt;
    delete body.updatedAt;

    const updated = await prisma.specialist.update({ where: { id }, data: body });
    return json({ success: true, data: updated });
  } catch (err) {
    console.error(`Admin update specialist/${id} error:`, err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to update not found')) {
      return json({ success: false, error: 'Įrašas nerastas' }, 404);
    }
    return json({ success: false, error: 'Nepavyko atnaujinti' }, 500);
  }
}

/** DELETE /api/admin/specialistai/[id] */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    await prisma.specialist.delete({ where: { id } });
    await prisma.review.deleteMany({ where: { itemId: id, itemType: 'specialist' } });
    return json({ success: true });
  } catch (err) {
    console.error(`Admin delete specialist/${id} error:`, err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to delete does not exist')) {
      return json({ success: false, error: 'Įrašas nerastas' }, 404);
    }
    return json({ success: false, error: 'Nepavyko ištrinti' }, 500);
  }
}
