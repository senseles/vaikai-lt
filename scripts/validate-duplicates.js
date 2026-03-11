const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = [
    { name: 'Kindergarten', fn: () => prisma.kindergarten.findMany({ select: { id: true, name: true, city: true, address: true, slug: true } }) },
    { name: 'Aukle', fn: () => prisma.aukle.findMany({ select: { id: true, name: true, city: true, slug: true } }) },
    { name: 'Burelis', fn: () => prisma.burelis.findMany({ select: { id: true, name: true, city: true, slug: true } }) },
    { name: 'Specialist', fn: () => prisma.specialist.findMany({ select: { id: true, name: true, city: true, slug: true } }) },
  ];

  for (const model of models) {
    const items = await model.fn();

    // Check for exact name+city duplicates
    const nameCityMap = new Map();
    for (const item of items) {
      const key = `${item.name}|||${item.city}`;
      if (!nameCityMap.has(key)) nameCityMap.set(key, []);
      nameCityMap.get(key).push(item);
    }
    const exactDups = [...nameCityMap.entries()].filter(([, v]) => v.length > 1);

    // Check for similar names (normalized) in same city
    const normalizedMap = new Map();
    for (const item of items) {
      const normalized = item.name
        .toLowerCase()
        .replace(/[„""«»]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      const key = `${normalized}|||${item.city}`;
      if (!normalizedMap.has(key)) normalizedMap.set(key, []);
      normalizedMap.get(key).push(item);
    }
    const fuzzyDups = [...normalizedMap.entries()].filter(([, v]) => v.length > 1);

    // Check for duplicate slugs
    const slugMap = new Map();
    for (const item of items) {
      if (!slugMap.has(item.slug)) slugMap.set(item.slug, []);
      slugMap.get(item.slug).push(item);
    }
    const slugDups = [...slugMap.entries()].filter(([, v]) => v.length > 1);

    console.log(`\n=== ${model.name} DUPLICATES ===`);
    console.log(`Total: ${items.length}`);
    console.log(`Exact name+city duplicates: ${exactDups.length} groups`);
    exactDups.forEach(([key, items]) => {
      console.log(`  "${key}": ${items.map(i => i.id).join(', ')}`);
    });
    console.log(`Normalized name+city duplicates: ${fuzzyDups.length} groups`);
    fuzzyDups.forEach(([key, items]) => {
      if (!exactDups.some(([ek]) => ek === key)) {
        console.log(`  "${key}": ${items.map(i => `${i.id} (${i.name})`).join(', ')}`);
      }
    });
    console.log(`Duplicate slugs: ${slugDups.length}`);
    slugDups.forEach(([slug, items]) => {
      console.log(`  "${slug}": ${items.map(i => i.id).join(', ')}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
