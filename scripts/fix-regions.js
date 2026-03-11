const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fix: normalize region values from "X apskritis" to "X" for consistency
async function main() {
  const models = ['kindergarten', 'aukle', 'burelis', 'specialist'];

  for (const model of models) {
    const items = await prisma[model].findMany({
      where: { region: { not: null } },
      select: { id: true, region: true }
    });

    let fixed = 0;
    for (const item of items) {
      if (item.region && item.region.endsWith(' apskritis')) {
        const newRegion = item.region.replace(' apskritis', '');
        await prisma[model].update({ where: { id: item.id }, data: { region: newRegion } });
        fixed++;
      }
    }
    console.log(`${model}: fixed ${fixed}/${items.length} regions`);
  }

  // Fix "Vilniaus r." → "Vilnius" for city field
  for (const model of models) {
    const vilnR = await prisma[model].updateMany({
      where: { city: 'Vilniaus r.' },
      data: { city: 'Vilnius' }
    });
    if (vilnR.count > 0) {
      console.log(`${model}: fixed ${vilnR.count} items with city "Vilniaus r." → "Vilnius"`);
    }
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
