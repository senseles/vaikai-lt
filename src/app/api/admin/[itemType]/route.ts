import { NextRequest, NextResponse } from 'next/server';
import { isValidItemType } from '@/lib/utils';
import { getModel, pickAllowedFields } from '@/lib/prisma-models';
import type { ValidItemType } from '@/lib/prisma-models';
import { slugify } from '@/lib/lithuanian';

type Params = { params: { itemType: string } };

/** GET /api/admin/[itemType] — list items with search/pagination/sort */
export async function GET(request: NextRequest, { params }: Params) {
  const { itemType } = params;
  if (!isValidItemType(itemType)) {
    return NextResponse.json({ success: false, error: `Netinkamas tipas: ${itemType}` }, { status: 400 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
  const sort = searchParams.get('sort') ?? 'name';
  const skip = (page - 1) * limit;

  const model = getModel(itemType as ValidItemType);

  const where = search
    ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { city: { contains: search, mode: 'insensitive' as const } }] }
    : {};

  const orderBy = sort === 'baseRating' ? { baseRating: 'desc' as const } : sort === 'city' ? { city: 'asc' as const } : { name: 'asc' as const };

  /* eslint-disable @typescript-eslint/no-explicit-any -- Prisma delegate types differ per model */
  const [items, total] = await Promise.all([
    (model as any).findMany({ where, orderBy, skip, take: limit }),
    (model as any).count({ where }),
  ]);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return NextResponse.json({ items, total });
}

/** POST /api/admin/[itemType] — create new item */
export async function POST(request: NextRequest, { params }: Params) {
  const { itemType } = params;

  if (!isValidItemType(itemType)) {
    return NextResponse.json({ success: false, error: `Netinkamas tipas: ${itemType}` }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Pavadinimas/vardas privalomas' }, { status: 400 });
    }
    if (!body.city || typeof body.city !== 'string' || body.city.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Miestas privalomas' }, { status: 400 });
    }

    const slug = body.slug ?? slugify(body.name + '-' + body.city);

    // Only allow whitelisted fields — prevents mass assignment
    const data = pickAllowedFields(body, itemType as ValidItemType);

    const model = getModel(itemType as ValidItemType);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma delegate types differ per model
    const created = await (model as any).create({
      data: {
        ...data,
        slug,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error(`Admin create ${itemType} error:`, err);
    const message = err instanceof Error ? err.message : 'Nepavyko sukurti';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
