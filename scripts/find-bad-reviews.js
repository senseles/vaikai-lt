const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Find test/malicious reviews
  const testReviews = await p.review.findMany({
    where: {
      OR: [
        { authorName: { contains: 'XSS' } },
        { authorName: { contains: 'CSRF' } },
        { authorName: { contains: 'Tester' } },
        { authorName: { contains: 'alert' } },
        { text: { contains: 'XSS' } },
        { text: { contains: 'CSRF' } },
        { text: { contains: 'alert(' } },
        { text: { contains: '<script' } },
        { text: { contains: 'XMLHttpRequest' } },
        { text: { contains: 'integracinis test' } },
      ]
    },
    select: { id: true, authorName: true, text: true, rating: true }
  });
  console.log('Test/malicious reviews:', testReviews.length);
  testReviews.forEach(r => console.log(`  ${r.id} | ${r.authorName} | ${r.text.substring(0, 100)}`));

  // Check orphaned reviews (itemId doesn't match any entity)
  const reviews = await p.review.findMany({ select: { id: true, itemId: true, itemType: true } });
  let orphaned = 0;
  const orphanedList = [];
  for (const r of reviews) {
    let exists = false;
    try {
      if (r.itemType === 'kindergarten') {
        const e = await p.kindergarten.findUnique({ where: { id: r.itemId } });
        exists = !!e;
      } else if (r.itemType === 'aukle') {
        const e = await p.aukle.findUnique({ where: { id: r.itemId } });
        exists = !!e;
      } else if (r.itemType === 'burelis') {
        const e = await p.burelis.findUnique({ where: { id: r.itemId } });
        exists = !!e;
      } else if (r.itemType === 'specialist') {
        const e = await p.specialist.findUnique({ where: { id: r.itemId } });
        exists = !!e;
      }
    } catch(e) {}
    if (!exists) {
      orphaned++;
      if (orphanedList.length < 10) orphanedList.push(r);
    }
  }
  console.log(`\nOrphaned reviews: ${orphaned}/${reviews.length}`);
  orphanedList.forEach(r => console.log(`  ${r.id} | type=${r.itemType} | itemId=${r.itemId}`));

  // Check for non-Lithuanian reviews (English text)
  const allReviews = await p.review.findMany({ select: { id: true, authorName: true, text: true } });
  const englishPatterns = [/\bthe\b/i, /\bwith\b/i, /\band\b.*\bthe\b/i, /\bfor\b.*\bchildren\b/i];
  const englishReviews = allReviews.filter(r => {
    return englishPatterns.some(pat => pat.test(r.text)) && !/[ąčęėįšųūž]/i.test(r.text);
  });
  console.log(`\nPossibly English reviews: ${englishReviews.length}`);
  englishReviews.slice(0, 5).forEach(r => console.log(`  ${r.id} | ${r.authorName} | ${r.text.substring(0, 100)}`));

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
