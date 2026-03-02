import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { toSlug } from '@/lib/utils';

function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** GET /api/admin/bureliai — list with search/pagination/sort */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 25));
  const sort = searchParams.get('sort') ?? 'name';
  const dir = searchParams.get('dir') ?? 'asc';
  const skip = (page - 1) * limit;

  const where = search
    ? { OR: [{ name: { contains: search } }, { city: { contains: search } }] }
    : {};

  const validSortFields = ['name', 'city', 'baseRating', 'baseReviewCount', 'category', 'createdAt'];
  const sortField = validSortFields.includes(sort) ? sort : 'name';
  const sortDir = dir === 'desc' ? 'desc' as const : 'asc' as const;
  const orderBy = { [sortField]: sortDir };

  const [items, total] = await Promise.all([
    prisma.burelis.findMany({ where, orderBy, skip, take: limit }),
    prisma.burelis.count({ where }),
  ]);

  return json({ items, total });
}

/** POST /api/admin/bureliai — create new burelis */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return json({ success: false, error: 'Pavadinimas privalomas' }, 400);
    }
    if (!body.city || typeof body.city !== 'string' || body.city.trim().length === 0) {
      return json({ success: false, error: 'Miestas privalomas' }, 400);
    }

    const slug = body.slug ?? toSlug(body.name + '-' + body.city);

    const data: Record<string, unknown> = {
      name: body.name.trim(),
      city: body.city.trim(),
      slug,
      isUserAdded: body.isUserAdded ?? false,
    };

    const optionalStrings = ['category', 'subcategory', 'ageRange', 'price', 'schedule', 'phone', 'website', 'description', 'region', 'area'];
    for (const key of optionalStrings) {
      if (body[key] !== undefined && body[key] !== '') data[key] = String(body[key]).trim();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = await prisma.burelis.create({ data: data as any });
    return json({ success: true, data: created }, 201);
  } catch (err) {
    console.error('Admin create burelis error:', err);
    return json({ success: false, error: 'Nepavyko sukurti' }, 500);
  }
}
