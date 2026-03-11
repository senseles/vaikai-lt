const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Fix 1: Kindergartens that have approved reviews but baseReviewCount = 0
  // Get actual review counts and average ratings per item
  const approvedReviews = await prisma.review.findMany({
    where: { isApproved: true },
    select: { itemId: true, itemType: true, rating: true }
  });

  const reviewData = {};
  for (const r of approvedReviews) {
    const key = `${r.itemType}:${r.itemId}`;
    if (!reviewData[key]) reviewData[key] = { count: 0, sumRating: 0 };
    reviewData[key].count++;
    reviewData[key].sumRating += r.rating;
  }

  // Update kindergartens with reviews
  for (const [key, data] of Object.entries(reviewData)) {
    const [itemType, itemId] = key.split(':');
    if (itemType === 'kindergarten') {
      const avgRating = Math.round((data.sumRating / data.count) * 10) / 10;
      await prisma.kindergarten.update({
        where: { id: itemId },
        data: { baseReviewCount: data.count, baseRating: avgRating }
      });
      console.log(`Updated kindergarten ${itemId}: count=${data.count}, rating=${avgRating}`);
    }
  }

  // Fix 2: Aukles that have baseReviewCount > 0 but no actual approved reviews
  // These have "phantom" base counts from original seed data — we keep them as-is
  // because they represent aggregated external review counts
  const aukles = await prisma.aukle.findMany({
    where: { baseReviewCount: { gt: 0 } },
    select: { id: true, name: true, baseReviewCount: true, baseRating: true }
  });

  console.log(`\nAukles with baseReviewCount > 0: ${aukles.length} (kept as external aggregated counts)`);
  aukles.forEach(a => console.log(`  "${a.name}" count=${a.baseReviewCount} rating=${a.baseRating}`));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
