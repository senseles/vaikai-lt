import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { AdminStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use COUNT queries instead of fetching all rows — much faster through tunnels
    const [kindergartenCount, aukleCount, burelisCount, specialistCount, reviewCount, pendingReviewCount, userCount] = await Promise.all([
      prisma.kindergarten.count(),
      prisma.aukle.count(),
      prisma.burelis.count(),
      prisma.specialist.count(),
      prisma.review.count(),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.user.count(),
    ]);

    const stats: AdminStats = {
      kindergartenCount,
      aukleCount,
      burelisCount,
      specialistCount,
      reviewCount,
      pendingReviewCount,
      userCount,
      dataQuality: {
        kindergartens: 0,
        aukles: 0,
        bureliai: 0,
        specialists: 0,
      },
    };

    return NextResponse.json({ success: true, data: stats }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ success: false, error: 'Nepavyko gauti statistikos' }, { status: 500 });
  }
}
