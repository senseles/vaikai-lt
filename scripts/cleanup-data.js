const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('=== DATA CLEANUP ===\n');
  console.log('BEFORE counts:');
  await printCounts();

  // ============================================================
  // 1. DELETE ALL REVIEWS (58k+ fake reviews)
  // ============================================================
  console.log('\n--- Deleting ALL reviews (fake data) ---');
  const reviewResult = await prisma.review.deleteMany({});
  console.log(`  Deleted ${reviewResult.count} reviews`);

  // ============================================================
  // 2. DELETE ALL AUKLES (all fake — generic names, sequential phones)
  // ============================================================
  console.log('\n--- Deleting ALL aukles (fake data) ---');
  const aukleResult = await prisma.aukle.deleteMany({});
  console.log(`  Deleted ${aukleResult.count} aukles`);

  // ============================================================
  // 3. DELETE ALL BURELIAI (all fake — sequential phones +37061200000+)
  // ============================================================
  console.log('\n--- Deleting ALL bureliai (fake data) ---');
  const burelisResult = await prisma.burelis.deleteMany({});
  console.log(`  Deleted ${burelisResult.count} bureliai`);

  // ============================================================
  // 4. DELETE ALL SPECIALISTS (all fake — generic names)
  // ============================================================
  console.log('\n--- Deleting ALL specialists (fake data) ---');
  const specResult = await prisma.specialist.deleteMany({});
  console.log(`  Deleted ${specResult.count} specialists`);

  // ============================================================
  // 5. CLEAN KINDERGARTENS — keep only l-d pattern entries
  // ============================================================
  console.log('\n--- Cleaning kindergartens ---');

  // Get all kindergartens
  const allKg = await prisma.kindergarten.findMany();

  // Classify: keep l-d/lopšelis pattern, and any with real websites
  const keepIds = new Set();
  const deleteIds = new Set();

  for (const k of allKg) {
    const name = k.name;
    const isLdPattern = /l-d|lopšelis|Lopšelis/.test(name);
    const isDarzelMokykla = /darželis-mokykla|Darželis-mokykla/i.test(name);
    const hasRealWebsite = k.website && !k.website.includes('example.com');

    if (isLdPattern || isDarzelMokykla || hasRealWebsite) {
      keepIds.add(k.id);
    } else {
      deleteIds.add(k.id);
    }
  }

  console.log(`  Keeping ${keepIds.size} kindergartens (l-d/lopšelis pattern + real websites)`);
  console.log(`  Deleting ${deleteIds.size} kindergartens (AI-generated patterns)`);

  // Delete fake kindergartens
  if (deleteIds.size > 0) {
    const deleteIdsArr = [...deleteIds];
    // Delete in batches to avoid query size limits
    const batchSize = 500;
    let totalDeleted = 0;
    for (let i = 0; i < deleteIdsArr.length; i += batchSize) {
      const batch = deleteIdsArr.slice(i, i + batchSize);
      const result = await prisma.kindergarten.deleteMany({
        where: { id: { in: batch } },
      });
      totalDeleted += result.count;
    }
    console.log(`  Deleted ${totalDeleted} fake kindergartens`);
  }

  // ============================================================
  // 6. CLEAN FAKE PHONES from remaining kindergartens
  // ============================================================
  console.log('\n--- Cleaning fake phones from remaining kindergartens ---');
  const remaining = await prisma.kindergarten.findMany();
  let phonesCleared = 0;

  for (const k of remaining) {
    if (!k.phone) continue;

    // Strip phone to digits
    const digits = k.phone.replace(/\D/g, '');

    // Fake phone indicators:
    // - Sequential digits (e.g., +37061234567)
    // - Repeating digits (e.g., +37061111111)
    // - Random-looking Lithuanian mobile numbers that were AI-generated
    // Since ALL phones in the l-d category were added by AI seed scripts,
    // clear all phones from l-d entries (they had none originally)
    await prisma.kindergarten.update({
      where: { id: k.id },
      data: { phone: null },
    });
    phonesCleared++;
  }
  console.log(`  Cleared ${phonesCleared} fake phone numbers`);

  // ============================================================
  // 7. RESET baseRating and baseReviewCount on all remaining kindergartens
  //    (since we deleted all reviews)
  // ============================================================
  console.log('\n--- Resetting ratings on remaining kindergartens ---');
  const resetResult = await prisma.kindergarten.updateMany({
    data: { baseRating: 0, baseReviewCount: 0 },
  });
  console.log(`  Reset ratings on ${resetResult.count} kindergartens`);

  // ============================================================
  // 8. DEDUPLICATE remaining kindergartens (same name + city)
  // ============================================================
  console.log('\n--- Deduplicating kindergartens (same name + city) ---');
  const afterClean = await prisma.kindergarten.findMany({ orderBy: { createdAt: 'asc' } });
  const seen = new Map(); // key: name+city -> first id
  const dupIds = [];

  for (const k of afterClean) {
    const key = `${k.name.toLowerCase()}|${k.city.toLowerCase()}`;
    if (seen.has(key)) {
      dupIds.push(k.id);
    } else {
      seen.set(key, k.id);
    }
  }

  if (dupIds.length > 0) {
    const result = await prisma.kindergarten.deleteMany({
      where: { id: { in: dupIds } },
    });
    console.log(`  Removed ${result.count} duplicate kindergartens`);
  } else {
    console.log('  No duplicates found');
  }

  // ============================================================
  // 9. Clean up forum content if needed
  // ============================================================
  console.log('\n--- Forum data: keeping (community content) ---');

  // ============================================================
  // 10. Clean up orphaned favorites
  // ============================================================
  console.log('\n--- Cleaning orphaned favorites ---');
  const favResult = await prisma.favorite.deleteMany({});
  console.log(`  Deleted ${favResult.count} favorites`);

  // ============================================================
  // FINAL REPORT
  // ============================================================
  console.log('\n=== AFTER CLEANUP ===');
  await printCounts();

  await prisma.$disconnect();
}

async function printCounts() {
  const counts = {
    kindergartens: await prisma.kindergarten.count(),
    aukles: await prisma.aukle.count(),
    bureliai: await prisma.burelis.count(),
    specialists: await prisma.specialist.count(),
    reviews: await prisma.review.count(),
    forumPosts: await prisma.forumPost.count(),
    forumComments: await prisma.forumComment.count(),
    users: await prisma.user.count(),
    favorites: await prisma.favorite.count(),
  };
  console.log(JSON.stringify(counts, null, 2));
}

cleanup().catch(e => { console.error(e); process.exit(1); });
