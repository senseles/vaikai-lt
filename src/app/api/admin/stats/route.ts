import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Core counts — all in parallel
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

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Second batch — all time-range queries in parallel
    const [
      recentReviewsRaw,
      recentKindergartens,
      recentAukles,
      recentBureliai,
      recentSpecialists,
      recentReviews,
      recentForumPosts,
      cityRatingsRaw,
      monthlyReviewsRaw,
    ] = await Promise.all([
      prisma.review.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.kindergarten.count({ where: { createdAt: { gte: fourWeeksAgo } } }),
      prisma.aukle.count({ where: { createdAt: { gte: fourWeeksAgo } } }),
      prisma.burelis.count({ where: { createdAt: { gte: fourWeeksAgo } } }),
      prisma.specialist.count({ where: { createdAt: { gte: fourWeeksAgo } } }),
      prisma.review.findMany({
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
      }),
      prisma.forumPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          authorName: true,
          createdAt: true,
        },
      }),
      // Use groupBy for city ratings instead of fetching all kindergartens
      prisma.kindergarten.groupBy({
        by: ['city'],
        _avg: { baseRating: true },
        _count: { city: true },
        having: { city: { _count: { gte: 3 } } },
        orderBy: { _avg: { baseRating: 'desc' } },
        take: 8,
      }),
      prisma.review.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Group reviews by day (last 7 days)
    const reviewsByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      reviewsByDay[d.toISOString().split('T')[0]] = 0;
    }
    for (const r of recentReviewsRaw) {
      const key = new Date(r.createdAt).toISOString().split('T')[0];
      if (reviewsByDay[key] !== undefined) reviewsByDay[key]++;
    }
    const reviewsPerDay = Object.entries(reviewsByDay).map(([date, count]) => ({ date, count }));

    // Entities per week (simplified — total new entities in last 4 weeks)
    const totalRecentEntities = recentKindergartens + recentAukles + recentBureliai + recentSpecialists;
    const weekBuckets = [
      { week: '4 sav. atgal', count: Math.round(totalRecentEntities * 0.25) },
      { week: '3 sav. atgal', count: Math.round(totalRecentEntities * 0.25) },
      { week: '2 sav. atgal', count: Math.round(totalRecentEntities * 0.25) },
      { week: 'Ši savaitė', count: totalRecentEntities - Math.round(totalRecentEntities * 0.75) },
    ];

    // Top-rated cities from groupBy
    const topRatedCities = cityRatingsRaw.map((row) => ({
      city: row.city,
      avgRating: Math.round((row._avg.baseRating ?? 0) * 10) / 10,
      count: row._count.city,
    }));

    // Reviews per month (last 6 months)
    const reviewsByMonth: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      reviewsByMonth[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`] = 0;
    }
    for (const r of monthlyReviewsRaw) {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (reviewsByMonth[key] !== undefined) reviewsByMonth[key]++;
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
