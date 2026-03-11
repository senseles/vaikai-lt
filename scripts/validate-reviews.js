const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Check baseReviewCount consistency
  const reviews = await p.review.findMany({ where: { isApproved: true }, select: { itemId: true, itemType: true } });
  console.log("Total approved reviews:", reviews.length);

  const reviewCounts = {};
  reviews.forEach(r => {
    const key = r.itemType + ":" + r.itemId;
    reviewCounts[key] = (reviewCounts[key] || 0) + 1;
  });

  // Check each entity type for unreasonable baseReviewCounts
  const models = [
    { name: "Kindergarten", fn: () => p.kindergarten.findMany({ select: { id: true, name: true, baseReviewCount: true, baseRating: true } }), maxReasonable: 500 },
    { name: "Aukle", fn: () => p.aukle.findMany({ select: { id: true, name: true, baseReviewCount: true, baseRating: true } }), maxReasonable: 100 },
    { name: "Burelis", fn: () => p.burelis.findMany({ select: { id: true, name: true, baseReviewCount: true, baseRating: true } }), maxReasonable: 100 },
    { name: "Specialist", fn: () => p.specialist.findMany({ select: { id: true, name: true, baseReviewCount: true, baseRating: true } }), maxReasonable: 100 },
  ];

  for (const model of models) {
    const items = await model.fn();
    const withReviews = items.filter(i => i.baseReviewCount > 0);
    const highCount = items.filter(i => i.baseReviewCount > model.maxReasonable);
    const zeroRatingWithReviews = items.filter(i => i.baseReviewCount > 0 && i.baseRating === 0);
    const ratingWithoutReviews = items.filter(i => i.baseReviewCount === 0 && i.baseRating > 0);

    console.log(`\n=== ${model.name} review stats ===`);
    console.log(`  With baseReviewCount > 0: ${withReviews.length}/${items.length}`);
    console.log(`  With baseReviewCount > ${model.maxReasonable}: ${highCount.length}`);
    highCount.forEach(i => console.log(`    ${i.id} | ${i.name} | count: ${i.baseReviewCount}`));
    console.log(`  baseReviewCount > 0 but baseRating = 0: ${zeroRatingWithReviews.length}`);
    zeroRatingWithReviews.forEach(i => console.log(`    ${i.id} | ${i.name} | count: ${i.baseReviewCount} rating: ${i.baseRating}`));
    console.log(`  baseRating > 0 but baseReviewCount = 0: ${ratingWithoutReviews.length}`);
    ratingWithoutReviews.forEach(i => console.log(`    ${i.id} | ${i.name} | rating: ${i.baseRating} count: ${i.baseReviewCount}`));
  }

  await p.$disconnect();
}

main().catch(console.error);
