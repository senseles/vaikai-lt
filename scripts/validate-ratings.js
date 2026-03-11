const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = [
    { name: 'Kindergarten', fn: () => prisma.kindergarten.findMany({ select: { id: true, name: true, baseRating: true, baseReviewCount: true } }) },
    { name: 'Aukle', fn: () => prisma.aukle.findMany({ select: { id: true, name: true, baseRating: true, baseReviewCount: true } }) },
    { name: 'Burelis', fn: () => prisma.burelis.findMany({ select: { id: true, name: true, baseRating: true, baseReviewCount: true } }) },
    { name: 'Specialist', fn: () => prisma.specialist.findMany({ select: { id: true, name: true, baseRating: true, baseReviewCount: true } }) },
  ];

  for (const model of models) {
    const items = await model.fn();
    const outOfRange = items.filter(i => i.baseRating < 0 || i.baseRating > 5);
    const suspiciouslyPerfect = items.filter(i => i.baseRating === 5 && i.baseReviewCount > 5);
    const suspiciouslyLow = items.filter(i => i.baseRating > 0 && i.baseRating < 1);
    const nonInteger = items.filter(i => i.baseRating > 0 && !Number.isFinite(i.baseRating));

    console.log(`\n=== ${model.name} RATING RANGE CHECK ===`);
    console.log(`Total: ${items.length}`);
    console.log(`Out of range (0-5): ${outOfRange.length}`);
    outOfRange.forEach(i => console.log(`  "${i.name}" rating=${i.baseRating}`));
    console.log(`Perfect 5.0 with many reviews: ${suspiciouslyPerfect.length}`);
    suspiciouslyPerfect.forEach(i => console.log(`  "${i.name}" rating=${i.baseRating} count=${i.baseReviewCount}`));
    console.log(`Suspiciously low (0 < rating < 1): ${suspiciouslyLow.length}`);
    suspiciouslyLow.forEach(i => console.log(`  "${i.name}" rating=${i.baseRating}`));
    console.log(`Non-finite rating: ${nonInteger.length}`);
  }

  // Also check Review.rating values
  const reviews = await prisma.review.findMany({ select: { id: true, authorName: true, rating: true, itemType: true } });
  const badReviews = reviews.filter(r => r.rating < 1 || r.rating > 5 || !Number.isInteger(r.rating));
  console.log(`\n=== REVIEW RATINGS ===`);
  console.log(`Total reviews: ${reviews.length}`);
  console.log(`Invalid ratings (not 1-5 integer): ${badReviews.length}`);
  badReviews.forEach(r => console.log(`  ${r.id} by "${r.authorName}" rating=${r.rating} type=${r.itemType}`));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
