import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Core counts
    const [
      kindergartenCount,
      aukleCount,
      burelisCount,
      specialistCount,
      reviewCount,
      pendingReviewCount,
      userCount,
      forumPostCount,
      forumCommentCount,
    ] = await Promise.all([
      prisma.kindergarten.count(),
      prisma.aukle.count(),
      prisma.burelis.count(),
      prisma.specialist.count(),
      prisma.review.count(),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.user.count(),
      prisma.forumPost.count(),
      prisma.forumComment.count(),
    ]);

    // Reviews per day (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReviewsRaw = await prisma.review.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group reviews by day
    const reviewsByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      reviewsByDay[key] = 0;
    }
    for (const r of recentReviewsRaw) {
      const key = new Date(r.createdAt).toISOString().split('T')[0];
      if (reviewsByDay[key] !== undefined) {
        reviewsByDay[key]++;
      }
    }
    const reviewsPerDay = Object.entries(reviewsByDay).map(([date, count]) => ({ date, count }));

    // Entities per week (last 4 weeks) — count by createdAt
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const [recentKindergartens, recentAukles, recentBureliai, recentSpecialists] = await Promise.all([
      prisma.kindergarten.findMany({ where: { createdAt: { gte: fourWeeksAgo } }, select: { createdAt: true } }),
      prisma.aukle.findMany({ where: { createdAt: { gte: fourWeeksAgo } }, select: { createdAt: true } }),
      prisma.burelis.findMany({ where: { createdAt: { gte: fourWeeksAgo } }, select: { createdAt: true } }),
      prisma.specialist.findMany({ where: { createdAt: { gte: fourWeeksAgo } }, select: { createdAt: true } }),
    ]);

    const allRecentEntities = [
      ...recentKindergartens,
      ...recentAukles,
      ...recentBureliai,
      ...recentSpecialists,
    ];

    // Group by week
    const weekBuckets: { week: string; count: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const count = allRecentEntities.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= weekStart && d < weekEnd;
      }).length;

      const weekLabel = `${weekStart.toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' })}`;
      weekBuckets.push({ week: weekLabel, count });
    }

    // Recent reviews (for activity feed)
    const recentReviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        authorName: true,
        rating: true,
        text: true,
        itemType: true,
        isApproved: true,
        createdAt: true,
      },
    });

    // Recent forum posts (for activity feed)
    const recentForumPosts = await prisma.forumPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        authorName: true,
        createdAt: true,
      },
    });

    // Top-rated cities (by average kindergarten rating, with at least 3 entities)
    const allKindergartens = await prisma.kindergarten.findMany({
      select: { city: true, baseRating: true },
    });
    const cityRatings: Record<string, { total: number; count: number }> = {};
    for (const kg of allKindergartens) {
      if (!cityRatings[kg.city]) cityRatings[kg.city] = { total: 0, count: 0 };
      cityRatings[kg.city].total += kg.baseRating;
      cityRatings[kg.city].count++;
    }
    const topRatedCities = Object.entries(cityRatings)
      .filter(([, v]) => v.count >= 3)
      .map(([city, v]) => ({ city, avgRating: Math.round((v.total / v.count) * 10) / 10, count: v.count }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 8);

    // Reviews per month (last 6 months)
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyReviewsRaw = await prisma.review.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const reviewsByMonth: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      reviewsByMonth[key] = 0;
    }
    for (const r of monthlyReviewsRaw) {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (reviewsByMonth[key] !== undefined) {
        reviewsByMonth[key]++;
      }
    }
    const reviewsPerMonth = Object.entries(reviewsByMonth).map(([month, count]) => ({ month, count }));

    const stats = {
      kindergartenCount,
      aukleCount,
      burelisCount,
      specialistCount,
      reviewCount,
      pendingReviewCount,
      userCount,
      forumPostCount,
      forumCommentCount,
      reviewsPerDay,
      reviewsPerMonth,
      entitiesPerWeek: weekBuckets,
      topRatedCities,
      recentReviews,
      recentForumPosts,
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
