const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const models = [
    { name: "Kindergarten", fn: () => p.kindergarten.findMany({ where: { phone: { not: null } }, select: { id: true, name: true, phone: true, city: true } }) },
    { name: "Aukle", fn: () => p.aukle.findMany({ where: { phone: { not: null } }, select: { id: true, name: true, phone: true, city: true } }) },
    { name: "Burelis", fn: () => p.burelis.findMany({ where: { phone: { not: null } }, select: { id: true, name: true, phone: true, city: true } }) },
    { name: "Specialist", fn: () => p.specialist.findMany({ where: { phone: { not: null } }, select: { id: true, name: true, phone: true, city: true } }) },
  ];

  for (const model of models) {
    const items = await model.fn();
    const bad = items.filter(item => {
      if (!item.phone) return false;
      const ph = item.phone.trim();
      if (ph === "" || ph === "-") return false;
      // Valid Lithuanian phone: +370..., 8..., (8-...)
      return !(/^(\+370|8|\(8)/.test(ph));
    });
    console.log(`=== ${model.name} suspicious phones (${bad.length}/${items.length}) ===`);
    bad.forEach(item => console.log(`  ${item.id} | ${item.name} | ${item.phone} | ${item.city}`));
  }

  await p.$disconnect();
}

main().catch(console.error);
