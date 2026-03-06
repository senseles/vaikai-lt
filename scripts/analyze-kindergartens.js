const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyze() {
  const all = await prisma.kindergarten.findMany({
    orderBy: { name: 'asc' },
  });

  // Classify kindergartens
  const realPatterns = []; // Official "l-d" or "lopšelis-darželis" names
  const darzelisQuoted = []; // Darželis „Name" without city in parens
  const darzelisWithCity = []; // Darželis „Name" (City) — AI pattern
  const privatusPattern = []; // Privatus darželis patterns
  const other = [];

  for (const k of all) {
    const name = k.name;
    if (/\(.*\)\s*$/.test(name)) {
      darzelisWithCity.push(k);
    } else if (/l-d|lopšelis|Lopšelis/.test(name)) {
      realPatterns.push(k);
    } else if (/^Darželis\s+[„"]/.test(name)) {
      darzelisQuoted.push(k);
    } else if (/^Privatus\s+darželis/i.test(name)) {
      privatusPattern.push(k);
    } else {
      other.push(k);
    }
  }

  console.log('=== KINDERGARTEN CLASSIFICATION ===');
  console.log(`Official "l-d" pattern: ${realPatterns.length}`);
  console.log(`Darželis „Name" (no city parens): ${darzelisQuoted.length}`);
  console.log(`Darželis „Name" (City) — AI pattern: ${darzelisWithCity.length}`);
  console.log(`Privatus darželis: ${privatusPattern.length}`);
  console.log(`Other: ${other.length}`);

  // Show samples of each
  console.log('\n--- OFFICIAL l-d pattern (first 30) ---');
  realPatterns.slice(0, 30).forEach(k =>
    console.log(`  ${k.name} | ${k.city} | phone: ${k.phone || 'none'}`)
  );

  console.log('\n--- Darželis „Name" (no parens) sample ---');
  darzelisQuoted.slice(0, 20).forEach(k =>
    console.log(`  ${k.name} | ${k.city} | phone: ${k.phone || 'none'}`)
  );

  console.log('\n--- Darželis with city in parens sample ---');
  darzelisWithCity.slice(0, 10).forEach(k =>
    console.log(`  ${k.name} | ${k.city} | phone: ${k.phone || 'none'}`)
  );

  console.log('\n--- Privatus darželis sample ---');
  privatusPattern.slice(0, 10).forEach(k =>
    console.log(`  ${k.name} | ${k.city} | phone: ${k.phone || 'none'}`)
  );

  console.log('\n--- Other sample ---');
  other.slice(0, 20).forEach(k =>
    console.log(`  ${k.name} | ${k.city} | type: ${k.type} | phone: ${k.phone || 'none'}`)
  );

  // Check: how many l-d pattern entries have phones?
  const ldWithPhone = realPatterns.filter(k => k.phone);
  console.log(`\nl-d with phone: ${ldWithPhone.length} / ${realPatterns.length}`);

  // Check: how many l-d entries have unique names (no duplicates)?
  const ldNames = realPatterns.map(k => k.name);
  const ldUnique = new Set(ldNames);
  console.log(`l-d unique names: ${ldUnique.size} / ${ldNames.length}`);

  // City distribution for l-d pattern
  const ldCities = {};
  realPatterns.forEach(k => { ldCities[k.city] = (ldCities[k.city] || 0) + 1; });
  const sortedCities = Object.entries(ldCities).sort((a, b) => b[1] - a[1]);
  console.log('\nl-d by city (top 15):');
  sortedCities.slice(0, 15).forEach(([city, cnt]) => console.log(`  ${city}: ${cnt}`));

  // Check "other" category more carefully
  console.log('\n--- ALL "other" entries ---');
  other.forEach(k =>
    console.log(`  ${k.name} | ${k.city} | type: ${k.type} | phone: ${k.phone || 'none'}`)
  );

  // How many darzelisQuoted have phones (fake indicator)?
  const dqWithPhone = darzelisQuoted.filter(k => k.phone);
  console.log(`\nDarželis „Name" with phone: ${dqWithPhone.length} / ${darzelisQuoted.length}`);

  // Check if darzelisQuoted names appear in multiple cities (AI pattern)
  const dqBaseNames = {};
  darzelisQuoted.forEach(k => {
    const base = k.name;
    if (!dqBaseNames[base]) dqBaseNames[base] = [];
    dqBaseNames[base].push(k.city);
  });
  const duplicateNames = Object.entries(dqBaseNames).filter(([_, cities]) => cities.length > 1);
  console.log(`\nDarželis names appearing in multiple cities: ${duplicateNames.length}`);
  duplicateNames.slice(0, 10).forEach(([name, cities]) =>
    console.log(`  ${name}: ${cities.join(', ')}`)
  );

  await prisma.$disconnect();
}

analyze().catch(e => { console.error(e); process.exit(1); });
