const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restore() {
  const backup = JSON.parse(fs.readFileSync(path.join(__dirname, 'backup', 'kindergartens.json'), 'utf8'));
  const existing = await prisma.kindergarten.findMany({ select: { id: true } });
  const existingIds = new Set(existing.map(k => k.id));
  console.log(`Currently in DB: ${existingIds.size}`);

  // Find lopšelis-darželis entries that should be restored:
  // - Contains "lopšelis" (but not l-d, which are already handled)
  // - No city in parentheses at end
  // - No "Nr." numbering (AI pattern)
  // - Starts with "Lopšelis-darželis" or "Privatus lopšelis-darželis" or city name
  const toRestore = [];

  for (const k of backup) {
    if (existingIds.has(k.id)) continue;

    const name = k.name;
    if (!/lopšelis/i.test(name)) continue;
    if (/\(.*\)\s*$/.test(name)) continue; // Skip city in parens
    if (/Nr\.\s*\d+/.test(name)) continue; // Skip numbered entries

    // Accept: "Lopšelis-darželis „Name"" or "Privatus lopšelis-darželis „Name""
    // or city-prefixed lopšelis entries
    if (/^(Lopšelis-darželis|Privatus lopšelis|Kauno|Vilniaus|Klaipedos|Klaipėdos)/i.test(name)) {
      toRestore.push(k);
    }
  }

  console.log(`Entries to restore: ${toRestore.length}`);

  // Also restore the one Grigiškės filial entry
  const grigiskes = backup.find(k =>
    k.name.includes('Pelėdžiukas') && k.name.includes('Grigiškės') && !existingIds.has(k.id)
  );
  if (grigiskes) {
    toRestore.push(grigiskes);
    console.log(`Also restoring: ${grigiskes.name}`);
  }

  // Deduplicate by name+city before inserting
  const seen = new Map();
  const uniqueRestore = [];
  // First add existing entries to seen map
  const existingFull = await prisma.kindergarten.findMany({ select: { name: true, city: true } });
  existingFull.forEach(k => seen.set(`${k.name.toLowerCase().trim()}|${k.city.toLowerCase().trim()}`, true));

  for (const k of toRestore) {
    const key = `${k.name.toLowerCase().trim()}|${k.city.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.set(key, true);
      uniqueRestore.push(k);
    }
  }

  console.log(`Unique entries to restore (after dedup): ${uniqueRestore.length}`);

  let restored = 0;
  for (const k of uniqueRestore) {
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
          phone: null,
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
      console.log(`  Skip: ${k.name} (${e.message.substring(0, 60)})`);
    }
  }

  console.log(`\nRestored ${restored} kindergartens`);

  const finalCount = await prisma.kindergarten.count();
  console.log(`Final count: ${finalCount}`);

  // City distribution
  const all = await prisma.kindergarten.findMany();
  const cities = {};
  all.forEach(k => { cities[k.city] = (cities[k.city] || 0) + 1; });
  const sorted = Object.entries(cities).sort((a, b) => b[1] - a[1]);
  console.log('\nCity distribution (top 15):');
  sorted.slice(0, 15).forEach(([city, cnt]) => console.log(`  ${city}: ${cnt}`));
  console.log(`  ... ${sorted.length} cities total`);

  // Type distribution
  const types = {};
  all.forEach(k => { types[k.type] = (types[k.type] || 0) + 1; });
  console.log('\nType distribution:', types);

  await prisma.$disconnect();
}

restore().catch(e => { console.error(e); process.exit(1); });
