const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const models = [
    { name: "Kindergarten", fn: () => p.kindergarten.findMany({ select: { id: true, slug: true, name: true } }) },
    { name: "Aukle", fn: () => p.aukle.findMany({ select: { id: true, slug: true, name: true } }) },
    { name: "Burelis", fn: () => p.burelis.findMany({ select: { id: true, slug: true, name: true } }) },
    { name: "Specialist", fn: () => p.specialist.findMany({ select: { id: true, slug: true, name: true } }) },
  ];

  for (const model of models) {
    const items = await model.fn();
    const bad = items.filter(item => {
      if (!item.slug) return true;
      // Slugs should be lowercase, no spaces, only a-z, 0-9, hyphens
      return item.slug !== item.slug.toLowerCase() || /\s/.test(item.slug) || /[^a-z0-9\-]/.test(item.slug);
    });
    console.log(`=== ${model.name} bad slugs (${bad.length}/${items.length}) ===`);
    bad.forEach(item => console.log(`  ${item.id} | slug: "${item.slug}" | name: "${item.name}"`));

    // Check for duplicate slugs
    const slugCounts = {};
    items.forEach(item => {
      slugCounts[item.slug] = (slugCounts[item.slug] || 0) + 1;
    });
    const dupSlugs = Object.entries(slugCounts).filter(([, count]) => count > 1);
    if (dupSlugs.length > 0) {
      console.log(`  DUPLICATE SLUGS:`);
      dupSlugs.forEach(([slug, count]) => console.log(`    "${slug}" appears ${count} times`));
    }
  }

  await p.$disconnect();
}

main().catch(console.error);
