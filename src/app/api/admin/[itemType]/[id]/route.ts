import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isValidItemType } from '@/lib/utils';

type Params = { params: { itemType: string; id: string } };

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** PUT /api/admin/[itemType]/[id] — update item */
export async function PUT(request: NextRequest, { params }: Params) {
  const { itemType, id } = params;

  if (!isValidItemType(itemType)) {
    return json({ success: false, error: `Netinkamas tipas: ${itemType}` }, 400);
  }
  if (!id || typeof id !== 'string') {
    return json({ success: false, error: 'ID privalomas' }, 400);
  }

  try {
    const body = await request.json();

    // Don't allow changing id or createdAt
    delete body.id;
    delete body.createdAt;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[itemType];
    const updated = await model.update({
      where: { id },
      data: body,
    });

    return json({ success: true, data: updated });
  } catch (err) {
    console.error(`Admin update ${itemType}/${id} error:`, err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to update not found')) {
      return json({ success: false, error: 'Įrašas nerastas' }, 404);
    }
    return json({ success: false, error: 'Nepavyko atnaujinti' }, 500);
  }
}

/** DELETE /api/admin/[itemType]/[id] — delete item */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { itemType, id } = params;

  if (!isValidItemType(itemType)) {
    return json({ success: false, error: `Netinkamas tipas: ${itemType}` }, 400);
  }
  if (!id || typeof id !== 'string') {
    return json({ success: false, error: 'ID privalomas' }, 400);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[itemType];
    await model.delete({ where: { id } });

    // Also delete associated reviews
    await prisma.review.deleteMany({
      where: { itemId: id, itemType },
    });

    return json({ success: true });
  } catch (err) {
    console.error(`Admin delete ${itemType}/${id} error:`, err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to delete does not exist')) {
      return json({ success: false, error: 'Įrašas nerastas' }, 404);
    }
    return json({ success: false, error: 'Nepavyko ištrinti' }, 500);
  }
}
