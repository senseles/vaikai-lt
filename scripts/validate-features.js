const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Only kindergartens have features field
  const kgs = await prisma.kindergarten.findMany({
    select: { id: true, name: true, city: true, features: true }
  });

  let validJson = 0;
  let invalidJson = 0;
  let emptyArray = 0;
  let nonArray = 0;
  let withFeatures = 0;
  const invalidExamples = [];
  const nonArrayExamples = [];
  const allFeatures = new Map();

  for (const kg of kgs) {
    try {
      const parsed = JSON.parse(kg.features);
      validJson++;
      if (!Array.isArray(parsed)) {
        nonArray++;
        nonArrayExamples.push({ name: kg.name, features: kg.features });
      } else if (parsed.length === 0) {
        emptyArray++;
      } else {
        withFeatures++;
        parsed.forEach(f => {
          const key = typeof f === 'string' ? f : JSON.stringify(f);
          allFeatures.set(key, (allFeatures.get(key) || 0) + 1);
        });
      }
    } catch (e) {
      invalidJson++;
      invalidExamples.push({ name: kg.name, city: kg.city, features: kg.features.substring(0, 100) });
    }
  }

  console.log('=== FEATURES VALIDATION ===');
  console.log(`Total kindergartens: ${kgs.length}`);
  console.log(`Valid JSON: ${validJson}`);
  console.log(`Invalid JSON: ${invalidJson}`);
  console.log(`Empty arrays: ${emptyArray}`);
  console.log(`Non-array JSON: ${nonArray}`);
  console.log(`With features: ${withFeatures}`);

  if (invalidExamples.length > 0) {
    console.log('\nInvalid JSON examples:');
    invalidExamples.slice(0, 5).forEach(e => console.log(`  "${e.name}" (${e.city}): ${e.features}`));
  }

  if (nonArrayExamples.length > 0) {
    console.log('\nNon-array JSON examples:');
    nonArrayExamples.slice(0, 5).forEach(e => console.log(`  "${e.name}": ${e.features}`));
  }

  // Show unique features and their counts
  const sorted = [...allFeatures.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\nUnique features (${sorted.length} total):`);
  sorted.forEach(([f, count]) => console.log(`  ${count}x ${f}`));

  // Check for English features
  const englishFeatures = sorted.filter(([f]) => /^[a-zA-Z\s]+$/.test(f));
  if (englishFeatures.length > 0) {
    console.log('\nPossibly English features:');
    englishFeatures.forEach(([f, count]) => console.log(`  ${count}x "${f}"`));
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
