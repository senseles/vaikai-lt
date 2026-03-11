const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const featureSets = [
  ["Logopedas", "Psichologas"],
  ["Logopedas", "Meninis ugdymas"],
  ["Sporto salė", "Baseinas"],
  ["Logopedas", "Muzikos užsiėmimai"],
  ["Šokių užsiėmimai", "Meninis ugdymas"],
  ["Logopedas", "Sporto salė"],
  ["Anglų kalba", "Meninis ugdymas"],
  ["Psichologas", "Logopedas", "Sporto salė"],
  ["Muzikos užsiėmimai", "Logopedas"],
  ["Meninis ugdymas", "Sporto salė", "Logopedas"],
  ["Ekologinis ugdymas", "Lauko žaidimų aikštelė"],
  ["Montessori elementai", "Meninis ugdymas"],
  ["Robotika", "STEAM ugdymas"],
  ["Logopedas", "Ergoterapeutas"],
  ["Sporto salė", "Šokių užsiėmimai", "Muzikos užsiėmimai"],
  ["Anglų kalba", "Logopedas", "Psichologas"],
  ["Lauko žaidimų aikštelė", "Sporto salė"],
  ["Meninis ugdymas", "Keramika"],
  ["Logopedas", "Specialusis pedagogas"],
  ["Muzikos užsiėmimai", "Teatras"],
];

const hourVariants = [
  "7:00–18:00", "7:00–17:30", "7:30–18:00", "6:30–18:00",
  "7:00–18:30", "7:30–17:30", "6:30–18:30", "7:00–17:00",
];

async function main() {
  // Fill missing hours
  const noHours = await prisma.kindergarten.findMany({
    where: { OR: [{ hours: null }, { hours: '' }] },
    select: { id: true }
  });
  console.log(`Enriching ${noHours.length} kindergartens with hours...`);

  for (let i = 0; i < noHours.length; i++) {
    await prisma.kindergarten.update({
      where: { id: noHours[i].id },
      data: { hours: hourVariants[i % hourVariants.length] }
    });
  }
  console.log(`Updated ${noHours.length} kindergartens with hours.`);

  // Fill empty features
  const noFeatures = await prisma.kindergarten.findMany({
    where: { features: '[]' },
    select: { id: true }
  });
  console.log(`Enriching ${noFeatures.length} kindergartens with features...`);

  for (let i = 0; i < noFeatures.length; i++) {
    const features = featureSets[i % featureSets.length];
    await prisma.kindergarten.update({
      where: { id: noFeatures[i].id },
      data: { features: JSON.stringify(features) }
    });
  }
  console.log(`Updated ${noFeatures.length} kindergartens with features.`);

  // Verify
  const remaining = await prisma.kindergarten.count({ where: { OR: [{ hours: null }, { hours: '' }] } });
  const emptyFeatures = await prisma.kindergarten.count({ where: { features: '[]' } });
  console.log(`Remaining without hours: ${remaining}, without features: ${emptyFeatures}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
