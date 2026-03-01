import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { AdminStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

function computeQuality(items: Array<Record<string, unknown>>, requiredFields: string[]): number {
  if (items.length === 0) return 100;
  let filled = 0;
  const total = items.length * requiredFields.length;
  for (const item of items) {
    for (const field of requiredFields) {
      const val = item[field];
      if (val != null && val !== '' && val !== 0) filled++;
    }
  }
  return Math.round((filled / total) * 100);
}

export async function GET() {
  try {
    const [kindergartens, aukles, bureliai, specialists, reviewCount, pendingReviewCount, userCount] = await Promise.all([
      prisma.kindergarten.findMany({ select: { name: true, city: true, address: true, phone: true, description: true } }),
      prisma.aukle.findMany({ select: { name: true, city: true, phone: true, description: true, hourlyRate: true } }),
      prisma.burelis.findMany({ select: { name: true, city: true, category: true, description: true, price: true } }),
      prisma.specialist.findMany({ select: { name: true, city: true, specialty: true, description: true, price: true } }),
      prisma.review.count(),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.user.count(),
    ]);

    const stats: AdminStats = {
      kindergartenCount: kindergartens.length,
      aukleCount: aukles.length,
      burelisCount: bureliai.length,
      specialistCount: specialists.length,
      reviewCount,
      pendingReviewCount,
      userCount,
      dataQuality: {
        kindergartens: computeQuality(kindergartens, ['name', 'city', 'address', 'phone', 'description']),
        aukles: computeQuality(aukles, ['name', 'city', 'phone', 'description', 'hourlyRate']),
        bureliai: computeQuality(bureliai, ['name', 'city', 'category', 'description', 'price']),
        specialists: computeQuality(specialists, ['name', 'city', 'specialty', 'description', 'price']),
      },
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ success: false, error: 'Nepavyko gauti statistikos' }, { status: 500 });
  }
}
