const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== FINAL COMPREHENSIVE VALIDATION ===\n');

  // 1. Entity counts
  const counts = {
    kindergartens: await prisma.kindergarten.count(),
    aukles: await prisma.aukle.count(),
    bureliai: await prisma.burelis.count(),
    specialists: await prisma.specialist.count(),
    reviews: await prisma.review.count(),
    approvedReviews: await prisma.review.count({ where: { isApproved: true } }),
  };
  console.log('Entity counts:', counts);

  // 2. Description coverage
  for (const m of ['kindergarten', 'aukle', 'burelis', 'specialist']) {
    const noDesc = await prisma[m].count({ where: { OR: [{ description: null }, { description: '' }] } });
    console.log(m + ' without description: ' + noDesc);
  }

  // 3. Features validation
  const kgs = await prisma.kindergarten.findMany({ select: { features: true } });
  let invalidFeatures = 0;
  let emptyFeatures = 0;
  kgs.forEach(k => {
    try {
      const f = JSON.parse(k.features);
      if (Array.isArray(f) === false) invalidFeatures++;
      if (Array.isArray(f) && f.length === 0) emptyFeatures++;
    } catch (e) { invalidFeatures++; }
  });
  console.log('\nFeatures: ' + invalidFeatures + ' invalid, ' + emptyFeatures + ' empty');

  // 4. baseReviewCount consistency
  console.log('\nbaseReviewCount consistency:');
  let allMatch = true;
  for (const t of ['kindergarten', 'aukle', 'burelis', 'specialist']) {
    const items = await prisma[t].findMany({ select: { id: true, baseReviewCount: true } });
    let mismatches = 0;
    for (const item of items) {
      const actual = await prisma.review.count({ where: { itemId: item.id, itemType: t, isApproved: true } });
      if (actual !== item.baseReviewCount) mismatches++;
    }
    const withReviews = items.filter(i => i.baseReviewCount > 0).length;
    console.log('  ' + t + ': ' + withReviews + '/' + items.length + ' have reviews, ' + mismatches + ' mismatches');
    if (mismatches > 0) allMatch = false;
  }

  // 5. Review text quality
  const reviews = await prisma.review.findMany({ select: { text: true } });
  const englishReviews = reviews.filter(r => /\b(the |this is a|children will|kindergarten provides|we offer|welcome to)\b/i.test(r.text));
  console.log('\nReviews with English text: ' + englishReviews.length + '/' + reviews.length);

  // 6. Rating distribution
  const ratingDist = await prisma.$queryRaw`
    SELECT rating, COUNT(*)::int as count FROM "Review" GROUP BY rating ORDER BY rating`;
  console.log('\nRating distribution:');
  ratingDist.forEach(r => console.log('  ' + r.rating + ' stars: ' + r.count + ' reviews'));

  // 7. Reviews per entity type
  const reviewsByType = await prisma.$queryRaw`
    SELECT "itemType", COUNT(*)::int as count FROM "Review" GROUP BY "itemType" ORDER BY "itemType"`;
  console.log('\nReviews by type:');
  reviewsByType.forEach(r => console.log('  ' + r.itemType + ': ' + r.count));

  console.log('\n=== ALL CHECKS ' + (allMatch ? 'PASSED ✓' : 'FAILED ✗') + ' ===');
}

main()
  .then(() => { process.exit(0); })
  .catch((err) => { console.error('Error:', err); process.exit(1); });
