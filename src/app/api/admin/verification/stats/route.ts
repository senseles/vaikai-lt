import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCountsByStatus(model: any) {
  const groups = await model.groupBy({
    by: ['verificationStatus'],
    _count: { _all: true },
  });

  const counts = { UNVERIFIED: 0, VERIFIED: 0, REJECTED: 0, total: 0 };
  for (const g of groups) {
    const status = g.verificationStatus as keyof typeof counts;
    if (status in counts) {
      counts[status] = g._count._all;
    }
    counts.total += g._count._all;
  }
  return counts;
}

export async function GET() {
  try {
    const [kindergarten, aukle, burelis, specialist] = await Promise.all([
      getCountsByStatus(prisma.kindergarten),
      getCountsByStatus(prisma.aukle),
      getCountsByStatus(prisma.burelis),
      getCountsByStatus(prisma.specialist),
    ]);

    const overall = {
      UNVERIFIED: kindergarten.UNVERIFIED + aukle.UNVERIFIED + burelis.UNVERIFIED + specialist.UNVERIFIED,
      VERIFIED: kindergarten.VERIFIED + aukle.VERIFIED + burelis.VERIFIED + specialist.VERIFIED,
      REJECTED: kindergarten.REJECTED + aukle.REJECTED + burelis.REJECTED + specialist.REJECTED,
      total: kindergarten.total + aukle.total + burelis.total + specialist.total,
    };

    return NextResponse.json({
      overall,
      byType: {
        kindergarten,
        aukle,
        burelis,
        specialist,
      },
    });
  } catch (err) {
    console.error('Verification stats error:', err);
    return NextResponse.json({ error: 'Vidinė klaida' }, { status: 500 });
  }
}
