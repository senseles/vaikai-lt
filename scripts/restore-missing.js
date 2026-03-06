const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// City prefixes in both diacritic and non-diacritic forms
const CITY_PREFIXES = [
  'Vilniaus', 'Kauno', 'Klaipėdos', 'Klaipedos', 'Šiaulių', 'Siauliu',
  'Panevėžio', 'Panevezio', 'Alytaus', 'Marijampolės', 'Marijampoles',
  'Utenos', 'Jonavos', 'Kėdainių', 'Kedainiu', 'Mažeikių', 'Mazeikiu',
  'Tauragės', 'Taurages', 'Telšių', 'Telsiu', 'Ukmergės', 'Ukmerges',
  'Palangos', 'Druskininkų', 'Druskininku', 'Rokiškio', 'Rokiskio',
  'Šilutės', 'Silutes', 'Biržų', 'Birzu', 'Anykščių', 'Anyksciu',
  'Elektrėnų', 'Elektrenu', 'Plungės', 'Plunges', 'Molėtų', 'Moletu',
  'Pasvalio', 'Trakų', 'Traku', 'Prienų', 'Prienu', 'Raseinių', 'Raseiniu',
  'Varėnos', 'Varenos', 'Joniškio', 'Joniskio', 'Kupiškio', 'Kupiskio',
  'Šilalės', 'Silales', 'Šalčininkų', 'Salcininku', 'Neringos',
  'Jurbarko', 'Kelmės', 'Kelmes', 'Kaišiadorių', 'Kaisiadoriu',
  'Kalvarijos', 'Zarasų', 'Zarasu', 'Šakių', 'Sakiu',
  'Širvintų', 'Sirvintu', 'Birštono', 'Birstono', 'Lazdijų', 'Lazdiju',
  'Pakruojo', 'Kazlų Rūdos', 'Kazlu Rudos', 'Akmenės', 'Akmenes',
  'Skuodo', 'Rietavo', 'Ignalinos', 'Pagėgių', 'Pagegiu',
  'Švenčionių', 'Svencioniu', 'Vilkaviškio', 'Vilkaviskio',
  'Kretingos', 'Visagino', 'Radviliškio', 'Radviliskio',
];

async function restore() {
  // Read backup
  const backupPath = path.join(__dirname, 'backup', 'kindergartens.json');
  const allBackup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log(`Backup has ${allBackup.length} kindergartens`);

  // Get currently existing IDs
  const existing = await prisma.kindergarten.findMany({ select: { id: true } });
  const existingIds = new Set(existing.map(k => k.id));
  console.log(`Currently in DB: ${existingIds.size}`);

  // Find entries that should be restored (city-prefix + l-d/lopšelis pattern, deleted by round 2)
  const toRestore = [];

  for (const k of allBackup) {
    if (existingIds.has(k.id)) continue; // Already in DB

    const name = k.name;
    const startsWithCity = CITY_PREFIXES.some(prefix => name.startsWith(prefix));
    const hasLdOrLopselis = /\bl-d\b|lopšelis-darželis|lopseli/i.test(name);
    const isSpecial = name.includes('Vilija') || name === 'Darželis-mokykla „Saulutė"';

    // Only restore entries that start with a city name AND have l-d or lopšelis
    if (startsWithCity && hasLdOrLopselis) {
      toRestore.push(k);
    }
  }

  console.log(`Entries to restore: ${toRestore.length}`);

  // Show samples
  console.log('\nSample of entries to restore (first 20):');
  toRestore.slice(0, 20).forEach(k => console.log(`  ${k.name} | ${k.city}`));

  // Insert them back (clean: no phone, reset ratings)
  let restored = 0;
  for (const k of toRestore) {
    try {
      await prisma.kindergarten.create({
        data: {
          id: k.id,
          slug: k.slug,
          name: k.name,
          city: k.city,
          region: k.region,
          area: k.area,
          address: k.address,
          type: k.type,
          phone: null, // strip fake phones
          website: k.website,
          language: k.language,
          ageFrom: k.ageFrom,
          groups: k.groups,
          hours: k.hours,
          features: k.features || '[]',
          description: k.description,
          note: k.note,
          baseRating: 0,
          baseReviewCount: 0,
          isUserAdded: k.isUserAdded || false,
        },
      });
      restored++;
    } catch (e) {
      // Skip if slug conflict etc
      console.log(`  Skip: ${k.name} (${e.message.substring(0, 80)})`);
    }
  }

  console.log(`\nRestored ${restored} kindergartens`);

  // Deduplicate
  console.log('\n--- Deduplicating ---');
  const all = await prisma.kindergarten.findMany({ orderBy: { createdAt: 'asc' } });
  const seen = new Map();
  const dupIds = [];
  for (const k of all) {
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
  }

  // Final report
  const finalCount = await prisma.kindergarten.count();
  console.log(`\nFinal kindergarten count: ${finalCount}`);

  const final = await prisma.kindergarten.findMany();
  const cities = {};
  final.forEach(k => { cities[k.city] = (cities[k.city] || 0) + 1; });
  const sorted = Object.entries(cities).sort((a, b) => b[1] - a[1]);
  console.log('\nCity distribution:');
  sorted.forEach(([city, cnt]) => console.log(`  ${city}: ${cnt}`));

  await prisma.$disconnect();
}

restore().catch(e => { console.error(e); process.exit(1); });
