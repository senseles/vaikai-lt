const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const types = [
    { name: 'kindergarten', model: 'kindergarten' },
    { name: 'aukle', model: 'aukle' },
    { name: 'burelis', model: 'burelis' },
    { name: 'specialist', model: 'specialist' },
  ];

  const allMismatches = [];

  for (const t of types) {
    const entities = await prisma[t.model].findMany({
      select: { id: true, name: true, baseReviewCount: true, baseRating: true }
    });
    const withBaseCount = entities.filter(e => e.baseReviewCount > 0);

    // Get actual approved review counts per item
    const reviewCounts = await prisma.review.groupBy({
      by: ['itemId'],
      where: { itemType: t.name, isApproved: true },
      _count: true,
    });
    const rcMap = new Map(reviewCounts.map(r => [r.itemId, r._count]));

    let mismatches = 0;
    let noReviewsButHasBase = 0;
    for (const e of withBaseCount) {
      const actual = rcMap.get(e.id) || 0;
      if (actual !== e.baseReviewCount) {
        mismatches++;
        if (actual === 0) noReviewsButHasBase++;
        allMismatches.push({
          type: t.name,
          id: e.id,
          name: e.name,
          baseReviewCount: e.baseReviewCount,
          actualReviews: actual,
          baseRating: e.baseRating,
        });
      }
    }

    // Also check entities with 0 baseReviewCount but has reviews
    const zeroBase = entities.filter(e => e.baseReviewCount === 0);
    let hasReviewsButNoBase = 0;
    for (const e of zeroBase) {
      const actual = rcMap.get(e.id) || 0;
      if (actual > 0) {
        hasReviewsButNoBase++;
        allMismatches.push({
          type: t.name,
          id: e.id,
          name: e.name,
          baseReviewCount: 0,
          actualReviews: actual,
        });
      }
    }

    console.log(`${t.name}: total=${entities.length}, withBaseCount=${withBaseCount.length}, mismatches=${mismatches}, baseButNoReviews=${noReviewsButHasBase}, reviewsButNoBase=${hasReviewsButNoBase}`);
  }

  console.log(`\nTotal mismatches: ${allMismatches.length}`);
  if (allMismatches.length > 0) {
    console.log('Sample mismatches (first 10):');
    allMismatches.slice(0, 10).forEach(m => {
      console.log(`  ${m.type} "${m.name}" - base:${m.baseReviewCount} actual:${m.actualReviews} rating:${m.baseRating}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
