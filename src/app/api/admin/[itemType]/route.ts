import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isValidItemType, toSlug } from '@/lib/utils';

type Params = { params: { itemType: string } };

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** GET /api/admin/[itemType] — list items with search/pagination/sort */
export async function GET(request: NextRequest, { params }: Params) {
  const { itemType } = params;
  if (!isValidItemType(itemType)) {
    return json({ success: false, error: `Netinkamas tipas: ${itemType}` }, 400);
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
  const sort = searchParams.get('sort') ?? 'name';
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = (prisma as any)[itemType];

  const where = search
    ? { OR: [{ name: { contains: search } }, { city: { contains: search } }] }
    : {};

  const orderBy = sort === 'baseRating' ? { baseRating: 'desc' as const } : sort === 'city' ? { city: 'asc' as const } : { name: 'asc' as const };

  const [items, total] = await Promise.all([
    model.findMany({ where, orderBy, skip, take: limit }),
    model.count({ where }),
  ]);

  return json({ items, total });
}

/** POST /api/admin/[itemType] — create new item */
export async function POST(request: NextRequest, { params }: Params) {
  const { itemType } = params;

  if (!isValidItemType(itemType)) {
    return json({ success: false, error: `Netinkamas tipas: ${itemType}` }, 400);
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return json({ success: false, error: 'Pavadinimas/vardas privalomas' }, 400);
    }
    if (!body.city || typeof body.city !== 'string' || body.city.trim().length === 0) {
      return json({ success: false, error: 'Miestas privalomas' }, 400);
    }

    const slug = body.slug ?? toSlug(body.name + '-' + body.city);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[itemType];
    const created = await model.create({
      data: {
        ...body,
        slug,
        isUserAdded: body.isUserAdded ?? false,
      },
    });

    return json({ success: true, data: created }, 201);
  } catch (err) {
    console.error(`Admin create ${itemType} error:`, err);
    const message = err instanceof Error ? err.message : 'Nepavyko sukurti';
    return json({ success: false, error: message }, 500);
  }
}
