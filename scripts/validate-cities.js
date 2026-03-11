const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Known Lithuanian cities and their regions
const CITY_REGIONS = {
  'Vilnius': 'Vilniaus',
  'Kaunas': 'Kauno',
  'Klaipėda': 'Klaipėdos',
  'Šiauliai': 'Šiaulių',
  'Panevėžys': 'Panevėžio',
  'Alytus': 'Alytaus',
  'Marijampolė': 'Marijampolės',
  'Mažeikiai': 'Telšių',
  'Jonava': 'Kauno',
  'Utena': 'Utenos',
  'Kėdainiai': 'Kauno',
  'Telšiai': 'Telšių',
  'Tauragė': 'Tauragės',
  'Ukmergė': 'Vilniaus',
  'Visaginas': 'Utenos',
  'Plungė': 'Telšių',
  'Kretinga': 'Klaipėdos',
  'Palanga': 'Klaipėdos',
  'Šilutė': 'Klaipėdos',
  'Radviliškis': 'Šiaulių',
  'Druskininkai': 'Alytaus',
  'Gargždai': 'Klaipėdos',
  'Elektrėnai': 'Vilniaus',
  'Jurbarkas': 'Tauragės',
  'Rokiškis': 'Panevėžio',
  'Biržai': 'Panevėžio',
  'Prienai': 'Kauno',
  'Kupiškis': 'Panevėžio',
  'Molėtai': 'Utenos',
  'Zarasai': 'Utenos',
  'Anykščiai': 'Utenos',
  'Šakiai': 'Marijampolės',
  'Pasvalys': 'Panevėžio',
  'Širvintos': 'Vilniaus',
  'Kazlų Rūda': 'Marijampolės',
  'Vilkaviškis': 'Marijampolės',
  'Trakai': 'Vilniaus',
  'Šalčininkai': 'Vilniaus',
  'Ignalina': 'Utenos',
  'Varėna': 'Alytaus',
  'Lazdijai': 'Alytaus',
  'Pakruojis': 'Šiaulių',
  'Neringa': 'Klaipėdos',
};

async function main() {
  const models = [
    { name: 'Kindergarten', fn: () => prisma.kindergarten.findMany({ select: { id: true, name: true, city: true, region: true } }) },
    { name: 'Aukle', fn: () => prisma.aukle.findMany({ select: { id: true, name: true, city: true, region: true } }) },
    { name: 'Burelis', fn: () => prisma.burelis.findMany({ select: { id: true, name: true, city: true, region: true } }) },
    { name: 'Specialist', fn: () => prisma.specialist.findMany({ select: { id: true, name: true, city: true, region: true } }) },
  ];

  for (const model of models) {
    const items = await model.fn();
    const unknownCities = [];
    const regionMismatches = [];
    const cityCounts = new Map();

    for (const item of items) {
      cityCounts.set(item.city, (cityCounts.get(item.city) || 0) + 1);

      if (!CITY_REGIONS[item.city]) {
        unknownCities.push(item);
      } else if (item.region && item.region !== CITY_REGIONS[item.city]) {
        regionMismatches.push({ ...item, expected: CITY_REGIONS[item.city] });
      }
    }

    console.log(`\n=== ${model.name} CITY-REGION CHECK ===`);
    console.log(`Total: ${items.length}`);
    console.log(`Cities: ${[...cityCounts.entries()].sort((a,b) => b[1]-a[1]).map(([c,n]) => `${c}(${n})`).join(', ')}`);
    console.log(`Unknown cities: ${unknownCities.length}`);
    unknownCities.slice(0, 10).forEach(i => console.log(`  "${i.name}" city="${i.city}"`));
    console.log(`Region mismatches: ${regionMismatches.length}`);
    regionMismatches.slice(0, 10).forEach(i => console.log(`  "${i.name}" city="${i.city}" region="${i.region}" expected="${i.expected}"`));
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
