const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const remaining = await prisma.kindergarten.findMany({ orderBy: { name: 'asc' } });

  // Classify remaining
  let ldCount = 0, lopselisCount = 0, otherCount = 0;
  const others = [];

  for (const k of remaining) {
    if (/\bl-d\b/.test(k.name)) ldCount++;
    else if (/lopšelis/i.test(k.name)) lopselisCount++;
    else {
      otherCount++;
      others.push(k);
    }
  }

  console.log(`Remaining: ${remaining.length}`);
  console.log(`  l-d: ${ldCount}`);
  console.log(`  lopšelis: ${lopselisCount}`);
  console.log(`  other: ${otherCount}`);

  if (others.length > 0) {
    console.log('\nOther entries (should be checked):');
    others.forEach(k => console.log(`  ${k.name} | ${k.city} | web: ${k.website}`));
  }

  // City distribution
  const cities = {};
  remaining.forEach(k => { cities[k.city] = (cities[k.city] || 0) + 1; });
  const sorted = Object.entries(cities).sort((a, b) => b[1] - a[1]);
  console.log('\nCity distribution:');
  sorted.forEach(([city, cnt]) => console.log(`  ${city}: ${cnt}`));

  // Sample 10
  console.log('\nRandom sample of 10:');
  for (let i = 0; i < 10; i++) {
    const k = remaining[Math.floor(Math.random() * remaining.length)];
    console.log(`  ${k.name} | ${k.city} | phone: ${k.phone || 'none'}`);
  }

  await prisma.$disconnect();
}

verify().catch(e => { console.error(e); process.exit(1); });
