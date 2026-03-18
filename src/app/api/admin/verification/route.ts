import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const ENTITY_MODELS = {
  kindergarten: 'kindergarten',
  aukle: 'aukle',
  burelis: 'burelis',
  specialist: 'specialist',
} as const;

type EntityType = keyof typeof ENTITY_MODELS;

function getModel(type: EntityType) {
  switch (type) {
    case 'kindergarten': return prisma.kindergarten;
    case 'aukle': return prisma.aukle;
    case 'burelis': return prisma.burelis;
    case 'specialist': return prisma.specialist;
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const entityType = url.searchParams.get('type') as EntityType | null;
    const status = url.searchParams.get('status'); // UNVERIFIED, VERIFIED, REJECTED
    const search = url.searchParams.get('search') || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const types: EntityType[] = entityType && ENTITY_MODELS[entityType]
      ? [entityType]
      : ['kindergarten', 'aukle', 'burelis', 'specialist'];

    const allItems: Array<{
      id: string;
      name: string;
      city: string;
      entityType: string;
      verificationStatus: string;
      verifiedAt: Date | null;
      verifiedBy: string | null;
      rejectionReason: string | null;
      createdAt: Date;
    }> = [];

    for (const type of types) {
      const model = getModel(type);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (status && ['UNVERIFIED', 'VERIFIED', 'REJECTED'].includes(status)) {
        where.verificationStatus = status;
      }
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = await (model as any).findMany({
        where,
        select: {
          id: true,
          name: true,
          city: true,
          verificationStatus: true,
          verifiedAt: true,
          verifiedBy: true,
          rejectionReason: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      for (const item of items) {
        allItems.push({ ...item, entityType: type });
      }
    }

    // Sort by createdAt desc
    allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = allItems.length;
    const paginated = allItems.slice(skip, skip + limit);

    return NextResponse.json({
      items: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Verification GET error:', err);
    return NextResponse.json({ error: 'Vidinė klaida' }, { status: 500 });
  }
}
