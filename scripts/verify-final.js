const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('=== FINAL DATABASE STATE ===\n');

  // Counts
  const counts = {
    kindergartens: await prisma.kindergarten.count(),
    aukles: await prisma.aukle.count(),
    bureliai: await prisma.burelis.count(),
    specialists: await prisma.specialist.count(),
    reviews: await prisma.review.count(),
    forumPosts: await prisma.forumPost.count(),
    forumComments: await prisma.forumComment.count(),
    forumCategories: await prisma.forumCategory.count(),
    users: await prisma.user.count(),
    favorites: await prisma.favorite.count(),
  };
  console.log('COUNTS:', JSON.stringify(counts, null, 2));

  // Check for orphaned reviews (should be 0 since we deleted all)
  console.log('\n--- Orphan checks ---');
  const orphanedReviews = await prisma.review.count();
  console.log(`Reviews (should be 0): ${orphanedReviews}`);

  // Check forum integrity
  const postsWithOrphanedCategory = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "ForumPost" p
    LEFT JOIN "ForumCategory" c ON p."categoryId" = c.id
    WHERE c.id IS NULL
  `;
  console.log(`Posts with orphaned categories: ${postsWithOrphanedCategory[0].cnt}`);

  const commentsWithOrphanedPosts = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "ForumComment" c
    LEFT JOIN "ForumPost" p ON c."postId" = p.id
    WHERE p.id IS NULL
  `;
  console.log(`Comments with orphaned posts: ${commentsWithOrphanedPosts[0].cnt}`);

  // Check for duplicate slugs
  const dupSlugs = await prisma.$queryRaw`
    SELECT slug, COUNT(*) as cnt FROM "Kindergarten"
    GROUP BY slug HAVING COUNT(*) > 1
  `;
  console.log(`\nDuplicate kindergarten slugs: ${dupSlugs.length}`);
  if (dupSlugs.length > 0) {
    dupSlugs.forEach(d => console.log(`  ${d.slug}: ${d.cnt}`));
  }

  // Check all ratings are reset
  const nonZeroRating = await prisma.kindergarten.count({
    where: { OR: [{ baseRating: { not: 0 } }, { baseReviewCount: { not: 0 } }] }
  });
  console.log(`Kindergartens with non-zero ratings (should be 0): ${nonZeroRating}`);

  // Check all phones are null
  const withPhone = await prisma.kindergarten.count({
    where: { phone: { not: null } }
  });
  console.log(`Kindergartens with phone numbers: ${withPhone}`);

  // Sample kindergartens
  console.log('\n--- Sample kindergartens (random 10) ---');
  const all = await prisma.kindergarten.findMany();
  for (let i = 0; i < 10; i++) {
    const k = all[Math.floor(Math.random() * all.length)];
    console.log(`  ${k.name} | ${k.city} | ${k.type}`);
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
  await prisma.$disconnect();
}

verify().catch(e => { console.error(e); process.exit(1); });
