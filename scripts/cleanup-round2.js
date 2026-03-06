const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Known Lithuanian city prefixes used in real kindergarten names
const CITY_PREFIXES = [
  'Vilniaus', 'Kauno', 'Klaipėdos', 'Šiaulių', 'Panevėžio',
  'Alytaus', 'Marijampolės', 'Utenos', 'Jonavos', 'Kėdainių',
  'Mažeikių', 'Tauragės', 'Telšių', 'Ukmergės', 'Palangos',
  'Druskininkų', 'Rokiškio', 'Šilutės', 'Biržų', 'Anykščių',
  'Elektrėnų', 'Plungės', 'Molėtų', 'Pasvalio', 'Trakų',
  'Prienų', 'Raseinių', 'Varėnos', 'Joniškio', 'Kupiškio',
  'Šilalės', 'Šalčininkų', 'Neringos', 'Jurbarko', 'Kelmės',
  'Kaišiadorių', 'Kalvarijos', 'Zarasų', 'Šakių', 'Širvintų',
  'Birštono', 'Lazdijų', 'Pakruojo', 'Kazlų Rūdos', 'Akmenės',
  'Skuodo', 'Rietavo', 'Ignalinos', 'Pagėgių', 'Švenčionių',
  'Vilkaviškio', 'Kretingos', 'Visagino', 'Radviliškio',
];

async function cleanup() {
  const remaining = await prisma.kindergarten.findMany({ orderBy: { name: 'asc' } });
  console.log(`Remaining before round 2: ${remaining.length}`);

  const keep = [];
  const remove = [];

  for (const k of remaining) {
    const name = k.name;

    // Keep entries whose names start with a city prefix (real institutional names)
    // e.g., "Kauno l-d Vyturelis", "Vilniaus Aleksoto lopšelis-darželis"
    const startsWithCity = CITY_PREFIXES.some(prefix => name.startsWith(prefix));

    // Also keep the two special entries
    const isSpecial = name.includes('Vilija') || name === 'Darželis-mokykla „Saulutė"';

    if (startsWithCity || isSpecial) {
      keep.push(k);
    } else {
      remove.push(k);
    }
  }

  console.log(`\nKeeping: ${keep.length}`);
  console.log(`Removing: ${remove.length}`);

  // Show samples of what's being removed
  console.log('\nSample of entries being REMOVED (first 20):');
  remove.slice(0, 20).forEach(k => console.log(`  ${k.name} | ${k.city}`));

  // Show samples of what's being kept
  console.log('\nSample of entries being KEPT (first 20):');
  keep.slice(0, 20).forEach(k => console.log(`  ${k.name} | ${k.city}`));

  // Do the deletion
  if (remove.length > 0) {
    const removeIds = remove.map(k => k.id);
    const batchSize = 500;
    let totalDeleted = 0;
    for (let i = 0; i < removeIds.length; i += batchSize) {
      const batch = removeIds.slice(i, i + batchSize);
      const result = await prisma.kindergarten.deleteMany({
        where: { id: { in: batch } },
      });
      totalDeleted += result.count;
    }
    console.log(`\nDeleted ${totalDeleted} more fake kindergartens`);
  }

  // Deduplicate again
  console.log('\n--- Deduplicating (name + city) ---');
  const afterClean = await prisma.kindergarten.findMany({ orderBy: { createdAt: 'asc' } });
  const seen = new Map();
  const dupIds = [];
  for (const k of afterClean) {
    const key = `${k.name.toLowerCase().trim()}|${k.city.toLowerCase().trim()}`;
    if (seen.has(key)) {
      dupIds.push(k.id);
    } else {
      seen.set(key, k.id);
    }
  }
  if (dupIds.length > 0) {
    const result = await prisma.kindergarten.deleteMany({ where: { id: { in: dupIds } } });
    console.log(`  Removed ${result.count} duplicates`);
  } else {
    console.log('  No duplicates');
  }

  // Final count
  const finalCount = await prisma.kindergarten.count();
  console.log(`\nFinal kindergarten count: ${finalCount}`);

  // City distribution
  const final = await prisma.kindergarten.findMany();
  const cities = {};
  final.forEach(k => { cities[k.city] = (cities[k.city] || 0) + 1; });
  const sorted = Object.entries(cities).sort((a, b) => b[1] - a[1]);
  console.log('\nCity distribution:');
  sorted.forEach(([city, cnt]) => console.log(`  ${city}: ${cnt}`));

  await prisma.$disconnect();
}

cleanup().catch(e => { console.error(e); process.exit(1); });
