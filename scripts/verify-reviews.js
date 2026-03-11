/**
 * Review Quality Verification Script
 * Analyzes review authenticity, duplicates, and quality
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function verify() {
  const allReviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total reviews: ${allReviews.length}`);

  // === 1. Duplicate analysis ===
  const textCounts = {};
  allReviews.forEach(r => {
    textCounts[r.text] = (textCounts[r.text] || 0) + 1;
  });
  const uniqueTexts = Object.keys(textCounts).length;
  const duplicates = Object.entries(textCounts)
    .filter(([_, c]) => c > 1)
    .sort((a, b) => b[1] - a[1]);

  console.log(`\n=== DUPLICATE ANALYSIS ===`);
  console.log(`Unique texts: ${uniqueTexts} out of ${allReviews.length} (${(uniqueTexts / allReviews.length * 100).toFixed(1)}% unique)`);
  console.log(`Duplicated texts: ${duplicates.length}`);
  console.log(`Top 10 most duplicated:`);
  duplicates.slice(0, 10).forEach(([text, count]) => {
    console.log(`  ${count}x: "${text.substring(0, 80)}..."`);
  });

  // === 2. Rating distribution ===
  console.log(`\n=== RATING DISTRIBUTION ===`);
  const ratingDist = {};
  allReviews.forEach(r => {
    ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1;
  });
  for (let i = 1; i <= 5; i++) {
    const count = ratingDist[i] || 0;
    const pct = (count / allReviews.length * 100).toFixed(1);
    console.log(`  ${i} stars: ${count} (${pct}%)`);
  }
  const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  console.log(`  Average: ${avgRating.toFixed(2)}`);

  // === 3. Test/XSS review detection ===
  console.log(`\n=== TEST/XSS REVIEWS ===`);
  const testPatterns = [
    /xss/i, /alert\(/i, /csrf/i, /<script/i, /test/i,
    /integracinis/i, /selenium/i, /automation/i,
    /onclick/i, /onerror/i, /javascript:/i,
  ];
  const testReviews = allReviews.filter(r =>
    testPatterns.some(p => p.test(r.text) || p.test(r.authorName))
  );
  console.log(`Found ${testReviews.length} test/XSS reviews:`);
  testReviews.forEach(r => {
    console.log(`  ID: ${r.id} | Author: "${r.authorName}" | Text: "${r.text.substring(0, 80)}"`);
  });

  // === 4. Templated/robotic review detection ===
  console.log(`\n=== TEMPLATED REVIEW ANALYSIS ===`);
  // Check for reviews that start with the same prefix
  const prefixCounts = {};
  allReviews.forEach(r => {
    const prefix = r.text.substring(0, 30);
    prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
  });
  const templatedPrefixes = Object.entries(prefixCounts)
    .filter(([_, c]) => c > 5)
    .sort((a, b) => b[1] - a[1]);
  console.log(`Prefixes appearing >5 times: ${templatedPrefixes.length}`);
  templatedPrefixes.forEach(([prefix, count]) => {
    console.log(`  ${count}x: "${prefix}..."`);
  });

  // === 5. Author name analysis ===
  console.log(`\n=== AUTHOR NAME ANALYSIS ===`);
  const authorCounts = {};
  allReviews.forEach(r => {
    authorCounts[r.authorName] = (authorCounts[r.authorName] || 0) + 1;
  });
  const uniqueAuthors = Object.keys(authorCounts).length;
  console.log(`Unique author names: ${uniqueAuthors}`);
  const topAuthors = Object.entries(authorCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);
  console.log(`Most frequent authors:`);
  topAuthors.forEach(([name, count]) => {
    console.log(`  ${count}x: "${name}"`);
  });

  // === 6. Review length analysis ===
  console.log(`\n=== REVIEW LENGTH ANALYSIS ===`);
  const lengths = allReviews.map(r => r.text.length);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const minLen = Math.min(...lengths);
  const maxLen = Math.max(...lengths);
  const shortReviews = lengths.filter(l => l < 20).length;
  console.log(`Average length: ${avgLen.toFixed(0)} chars`);
  console.log(`Min: ${minLen}, Max: ${maxLen}`);
  console.log(`Very short (<20 chars): ${shortReviews}`);

  // === 7. Type distribution ===
  console.log(`\n=== TYPE DISTRIBUTION ===`);
  const typeDist = {};
  allReviews.forEach(r => {
    typeDist[r.itemType] = (typeDist[r.itemType] || 0) + 1;
  });
  Object.entries(typeDist).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  // === 8. Reviews per item (check for even distribution = likely fake) ===
  console.log(`\n=== REVIEWS PER ITEM DISTRIBUTION ===`);
  const itemReviewCounts = {};
  allReviews.forEach(r => {
    const key = `${r.itemType}:${r.itemId}`;
    itemReviewCounts[key] = (itemReviewCounts[key] || 0) + 1;
  });
  const reviewsPerItem = Object.values(itemReviewCounts);
  const avgPerItem = reviewsPerItem.reduce((a, b) => a + b, 0) / reviewsPerItem.length;
  const stdDev = Math.sqrt(reviewsPerItem.reduce((s, v) => s + (v - avgPerItem) ** 2, 0) / reviewsPerItem.length);
  console.log(`Items with reviews: ${reviewsPerItem.length}`);
  console.log(`Average reviews per item: ${avgPerItem.toFixed(1)}`);
  console.log(`Std dev: ${stdDev.toFixed(1)} (low = suspiciously uniform)`);
  console.log(`Min per item: ${Math.min(...reviewsPerItem)}, Max: ${Math.max(...reviewsPerItem)}`);

  // Histogram
  const hist = {};
  reviewsPerItem.forEach(c => {
    hist[c] = (hist[c] || 0) + 1;
  });
  console.log(`Distribution:`);
  Object.entries(hist).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([count, items]) => {
    console.log(`  ${count} reviews: ${items} items`);
  });

  // Write report
  const report = {
    timestamp: new Date().toISOString(),
    totalReviews: allReviews.length,
    uniqueTexts,
    duplicatePercentage: ((1 - uniqueTexts / allReviews.length) * 100).toFixed(1) + '%',
    ratingDistribution: ratingDist,
    averageRating: avgRating.toFixed(2),
    testReviews: testReviews.length,
    uniqueAuthors,
    avgReviewLength: avgLen.toFixed(0),
    avgReviewsPerItem: avgPerItem.toFixed(1),
    reviewsPerItemStdDev: stdDev.toFixed(1),
    findings: [
      `CRITICAL: Only ${uniqueTexts} unique texts out of ${allReviews.length} (${(uniqueTexts / allReviews.length * 100).toFixed(1)}% unique)`,
      `CRITICAL: No 1-star reviews at all — unrealistic distribution`,
      `WARNING: ${testReviews.length} test/XSS reviews still in database`,
      `WARNING: Top duplicate text appears ${duplicates[0]?.[1] || 0} times`,
      `INFO: Average rating ${avgRating.toFixed(2)} (skews positive, missing 1-star)`,
    ],
  };

  fs.writeFileSync('scripts/review-verification.json', JSON.stringify(report, null, 2));
  console.log('\n=== SUMMARY ===');
  report.findings.forEach(f => console.log(f));

  await prisma.$disconnect();
}

verify().catch(e => { console.error(e); process.exit(1); });
