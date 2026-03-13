import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isValidItemType } from '@/lib/utils';
import { getModel, pickAllowedFields } from '@/lib/prisma-models';
import type { ValidItemType } from '@/lib/prisma-models';

type Params = { params: { itemType: string; id: string } };

/** PUT /api/admin/[itemType]/[id] — update item */
export async function PUT(request: NextRequest, { params }: Params) {
  const { itemType, id } = params;

  if (!isValidItemType(itemType)) {
    return NextResponse.json({ success: false, error: `Netinkamas tipas: ${itemType}` }, { status: 400 });
  }
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ success: false, error: 'ID privalomas' }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Only allow whitelisted fields — prevents mass assignment
    const data = pickAllowedFields(body, itemType as ValidItemType);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Nėra ką atnaujinti' }, { status: 400 });
    }

    const model = getModel(itemType as ValidItemType);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma delegate types differ per model
    const updated = await (model as any).update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(`Admin update ${itemType}/${id} error:`, err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to update not found')) {
      return NextResponse.json({ success: false, error: 'Įrašas nerastas' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Nepavyko atnaujinti' }, { status: 500 });
  }
}

/** DELETE /api/admin/[itemType]/[id] — delete item */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { itemType, id } = params;

  if (!isValidItemType(itemType)) {
    return NextResponse.json({ success: false, error: `Netinkamas tipas: ${itemType}` }, { status: 400 });
  }
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ success: false, error: 'ID privalomas' }, { status: 400 });
  }

  try {
    // Delete reviews first to avoid orphans if entity delete fails
    await prisma.review.deleteMany({
      where: { itemId: id, itemType },
    });

    const model = getModel(itemType as ValidItemType);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma delegate types differ per model
    await (model as any).delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`Admin delete ${itemType}/${id} error:`, err);
    const message = err instanceof Error ? err.message : '';
    if (message.includes('Record to delete does not exist')) {
      return NextResponse.json({ success: false, error: 'Įrašas nerastas' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Nepavyko ištrinti' }, { status: 500 });
  }
}
