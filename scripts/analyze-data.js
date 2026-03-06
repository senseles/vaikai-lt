const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyze() {
  console.log('=== DATA ANALYSIS ===\n');

  // Counts
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
  console.log('COUNTS:', JSON.stringify(counts, null, 2));

  // === KINDERGARTENS ===
  console.log('\n=== KINDERGARTENS SAMPLE ===');
  const kgSample = await prisma.kindergarten.findMany({ take: 20, orderBy: { name: 'asc' } });
  kgSample.forEach(k => console.log(`  ${k.name} | ${k.city} | ${k.type} | phone: ${k.phone} | web: ${k.website}`));

  // Check types distribution
  const kgTypes = await prisma.$queryRaw`SELECT type, COUNT(*) as cnt FROM "Kindergarten" GROUP BY type ORDER BY cnt DESC`;
  console.log('\nKindergarten types:', kgTypes);

  // Check city distribution
  const kgCities = await prisma.$queryRaw`SELECT city, COUNT(*) as cnt FROM "Kindergarten" GROUP BY city ORDER BY cnt DESC LIMIT 15`;
  console.log('\nKindergarten cities (top 15):', kgCities);

  // Phone patterns - repeating digits
  const kgPhones = await prisma.$queryRaw`
    SELECT phone, COUNT(*) as cnt FROM "Kindergarten"
    WHERE phone IS NOT NULL
    GROUP BY phone ORDER BY cnt DESC LIMIT 20
  `;
  console.log('\nMost common phones:', kgPhones);

  // Check for suspicious patterns in names
  const kgNamePatterns = await prisma.$queryRaw`
    SELECT name, city FROM "Kindergarten"
    WHERE name LIKE '%l-d%' OR name LIKE '%lopšelis%' OR name LIKE '%darželis%'
    LIMIT 20
  `;
  console.log('\nKindergartens with official-looking names (l-d, lopšelis, darželis):', kgNamePatterns.length);

  // Names that look AI-generated (contain city in parentheses)
  const kgFakePattern = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "Kindergarten"
    WHERE name LIKE '%(%' AND name LIKE '%)'
  `;
  console.log('Kindergartens with city in parentheses:', kgFakePattern);

  // === AUKLES ===
  console.log('\n=== AUKLES SAMPLE ===');
  const aukleSample = await prisma.aukle.findMany({ take: 15 });
  aukleSample.forEach(a => console.log(`  ${a.name} | ${a.city} | phone: ${a.phone} | exp: ${a.experience}`));

  // Check for repeating digit phones in aukles
  const auklePhones = await prisma.$queryRaw`
    SELECT phone, COUNT(*) as cnt FROM "Aukle"
    WHERE phone IS NOT NULL
    GROUP BY phone ORDER BY cnt DESC LIMIT 10
  `;
  console.log('\nAukle most common phones:', auklePhones);

  // === BURELIAI ===
  console.log('\n=== BURELIAI SAMPLE ===');
  const burelisSample = await prisma.burelis.findMany({ take: 15 });
  burelisSample.forEach(b => console.log(`  ${b.name} | ${b.city} | cat: ${b.category} | phone: ${b.phone}`));

  // === SPECIALISTS ===
  console.log('\n=== SPECIALISTS SAMPLE ===');
  const specSample = await prisma.specialist.findMany({ take: 15 });
  specSample.forEach(s => console.log(`  ${s.name} | ${s.city} | ${s.specialty} | clinic: ${s.clinic}`));

  // === REVIEWS ===
  console.log('\n=== REVIEWS ANALYSIS ===');
  const reviewsByType = await prisma.$queryRaw`
    SELECT "itemType", COUNT(*) as cnt FROM "Review" GROUP BY "itemType"
  `;
  console.log('Reviews by type:', reviewsByType);

  const reviewSample = await prisma.review.findMany({ take: 10 });
  reviewSample.forEach(r => console.log(`  [${r.itemType}] ${r.authorName}: "${r.text.substring(0, 80)}..." rating:${r.rating}`));

  // Check review approval status
  const reviewApproval = await prisma.$queryRaw`
    SELECT "isApproved", COUNT(*) as cnt FROM "Review" GROUP BY "isApproved"
  `;
  console.log('\nReview approval:', reviewApproval);

  // === FORUM ===
  console.log('\n=== FORUM ===');
  const forumCats = await prisma.forumCategory.findMany();
  console.log('Forum categories:', forumCats.map(c => `${c.name} (${c.slug})`));

  // Check if kindergartens have real website domains
  console.log('\n=== WEBSITE ANALYSIS ===');
  const websites = await prisma.$queryRaw`
    SELECT website, COUNT(*) as cnt FROM "Kindergarten"
    WHERE website IS NOT NULL AND website != ''
    GROUP BY website ORDER BY cnt DESC LIMIT 20
  `;
  console.log('Most common websites:', websites);

  const websiteCount = await prisma.$queryRaw`
    SELECT COUNT(*) as cnt FROM "Kindergarten" WHERE website IS NOT NULL AND website != ''
  `;
  console.log('Kindergartens with websites:', websiteCount);

  // Check for isUserAdded entries
  const userAdded = await prisma.$queryRaw`
    SELECT
      (SELECT COUNT(*) FROM "Kindergarten" WHERE "isUserAdded" = true) as kg,
      (SELECT COUNT(*) FROM "Aukle" WHERE "isUserAdded" = true) as aukle,
      (SELECT COUNT(*) FROM "Burelis" WHERE "isUserAdded" = true) as burelis,
      (SELECT COUNT(*) FROM "Specialist" WHERE "isUserAdded" = true) as spec
  `;
  console.log('\nUser-added entries:', userAdded);

  await prisma.$disconnect();
}

analyze().catch(e => { console.error(e); process.exit(1); });
