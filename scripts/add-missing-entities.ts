/**
 * Add Missing Major Organizations
 *
 * Adds verified real organizations that are missing from the database.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ąà]/g, 'a')
    .replace(/[čć]/g, 'c')
    .replace(/[ęè]/g, 'e')
    .replace(/[ėé]/g, 'e')
    .replace(/[į]/g, 'i')
    .replace(/[šś]/g, 's')
    .replace(/[ųù]/g, 'u')
    .replace(/[ūú]/g, 'u')
    .replace(/[žź]/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('Adding missing major organizations...\n');

  // ============================================================
  // MISSING BURELIAI
  // ============================================================

  const missingBureliai = [
    {
      name: 'CodeAcademy Kids — Vilnius',
      slug: slugify('CodeAcademy Kids — Vilnius'),
      city: 'Vilnius',
      region: 'Vilniaus',
      area: 'Naujamiestis',
      category: 'Programavimas',
      subcategory: 'IT būreliai',
      ageRange: '7-18 m.',
      price: 'nuo 30 €/mėn.',
      schedule: 'Savaitgaliais ir po pamokų',
      phone: null,
      website: 'https://codeacademykids.com',
      description: 'Inovatyvaus švietimo akademija moksleiviams — programavimo būreliai, virtualios klasės ir vasaros stovyklos. Veikia Vilniuje, Kaune, Klaipėdoje.',
      baseRating: 4.6,
      baseReviewCount: 0,
    },
    {
      name: 'CodeAcademy Kids — Kaunas',
      slug: slugify('CodeAcademy Kids — Kaunas'),
      city: 'Kaunas',
      region: 'Kauno',
      area: 'Centras',
      category: 'Programavimas',
      subcategory: 'IT būreliai',
      ageRange: '7-18 m.',
      price: 'nuo 30 €/mėn.',
      schedule: 'Savaitgaliais ir po pamokų',
      phone: null,
      website: 'https://codeacademykids.com',
      description: 'Inovatyvaus švietimo akademija moksleiviams — programavimo būreliai Kaune ir nuotoliniu būdu.',
      baseRating: 4.5,
      baseReviewCount: 0,
    },
    {
      name: 'CodeAcademy Kids — Klaipėda',
      slug: slugify('CodeAcademy Kids — Klaipeda'),
      city: 'Klaipėda',
      region: 'Klaipėdos',
      area: 'Centras',
      category: 'Programavimas',
      subcategory: 'IT būreliai',
      ageRange: '7-18 m.',
      price: 'nuo 30 €/mėn.',
      schedule: 'Savaitgaliais ir po pamokų',
      phone: null,
      website: 'https://codeacademykids.com',
      description: 'Inovatyvaus švietimo akademija moksleiviams — programavimo būreliai Klaipėdoje ir nuotoliniu būdu.',
      baseRating: 4.5,
      baseReviewCount: 0,
    },
    {
      name: 'Algorithmics — Vilnius',
      slug: slugify('Algorithmics — Vilnius'),
      city: 'Vilnius',
      region: 'Vilniaus',
      area: 'Centras',
      category: 'Programavimas',
      subcategory: 'IT būreliai',
      ageRange: '6-17 m.',
      price: null,
      schedule: 'Pagal tvarkaraštį',
      phone: null,
      website: 'https://vilnius.alg.academy/lt',
      description: 'Tarptautinė programavimo ir matematikos mokykla vaikams nuo 6 iki 17 metų. Grupėse iki 12 mokinių.',
      baseRating: 4.5,
      baseReviewCount: 0,
    },
    {
      name: 'Bricks4Kidz — Vilnius',
      slug: slugify('Bricks4Kidz — Vilnius'),
      city: 'Vilnius',
      region: 'Vilniaus',
      area: 'Centras',
      category: 'Robotika',
      subcategory: 'LEGO robotika',
      ageRange: '3-12 m.',
      price: null,
      schedule: 'Po pamokų ir savaitgaliais',
      phone: null,
      website: 'https://www.bricks4kidz.lt',
      description: 'Robotikos būreliai su LEGO — tarptautinė programa, ugdanti inžinerinius įgūdžius vaikams nuo 3 metų.',
      baseRating: 4.5,
      baseReviewCount: 0,
    },
    {
      name: 'Bricks4Kidz — Klaipėda',
      slug: slugify('Bricks4Kidz — Klaipeda'),
      city: 'Klaipėda',
      region: 'Klaipėdos',
      area: 'Centras',
      category: 'Robotika',
      subcategory: 'LEGO robotika',
      ageRange: '3-12 m.',
      price: null,
      schedule: 'Po pamokų ir savaitgaliais',
      phone: null,
      website: 'https://www.bricks4kidz.lt',
      description: 'Robotikos būreliai su LEGO — tarptautinė programa Klaipėdoje.',
      baseRating: 4.4,
      baseReviewCount: 0,
    },
  ];

  for (const b of missingBureliai) {
    const existing = await prisma.burelis.findFirst({ where: { slug: b.slug } });
    if (!existing) {
      await prisma.burelis.create({ data: b });
      console.log(`  + Added burelis: ${b.name}`);
    } else {
      console.log(`  = Already exists: ${b.name}`);
    }
  }

  // ============================================================
  // MISSING SPECIALISTS
  // ============================================================

  const missingSpecialists = [
    {
      name: 'Gijos klinikos — vaikų psichologas',
      slug: slugify('Gijos klinikos vaiku psichologas'),
      city: 'Vilnius',
      region: 'Vilniaus',
      area: 'Centras',
      specialty: 'Psichologas',
      clinic: 'Gijos klinikos',
      price: null,
      phone: null,
      website: 'https://gijosklinikos.lt',
      languages: null,
      description: 'Gijos klinikos — privati sveikatos priežiūros įstaiga, teikianti vaikų ir suaugusiųjų psichologines konsultacijas.',
      baseRating: 4.5,
      baseReviewCount: 0,
    },
    {
      name: 'Mano Šeimos Gydytojas — pediatrija',
      slug: slugify('Mano Seimos Gydytojas pediatrija'),
      city: 'Vilnius',
      region: 'Vilniaus',
      area: 'Centras',
      specialty: 'Pediatras',
      clinic: 'Mano Šeimos Gydytojas',
      price: null,
      phone: null,
      website: 'https://manoseima.lt',
      languages: null,
      description: 'Šeimos gydytojo paslaugos vaikams ir suaugusiems Vilniuje.',
      baseRating: 4.4,
      baseReviewCount: 0,
    },
  ];

  for (const s of missingSpecialists) {
    const existing = await prisma.specialist.findFirst({ where: { slug: s.slug } });
    if (!existing) {
      await prisma.specialist.create({ data: s });
      console.log(`  + Added specialist: ${s.name}`);
    } else {
      console.log(`  = Already exists: ${s.name}`);
    }
  }

  // ============================================================
  // MISSING AUKLE PORTALS for underserved cities
  // ============================================================

  const missingAukles = [
    {
      name: 'Babysits — Panevėžys',
      slug: slugify('Babysits — Panevezys'),
      city: 'Panevėžys',
      region: 'Panevėžio',
      area: 'Centras',
      phone: null,
      email: null,
      experience: null,
      ageRange: '0-12 m.',
      hourlyRate: '5-8 €/val.',
      languages: null,
      description: 'Babysits platforma — raskite patikimą auklę Panevėžyje. Nemokama registracija, jokių komisinių.',
      availability: null,
      isServicePortal: true,
      baseRating: 4.2,
      baseReviewCount: 0,
    },
    {
      name: 'Superauklė — Panevėžys',
      slug: slugify('Superaukle — Panevezys'),
      city: 'Panevėžys',
      region: 'Panevėžio',
      area: 'Centras',
      phone: null,
      email: null,
      experience: null,
      ageRange: '0-12 m.',
      hourlyRate: '5-10 €/val.',
      languages: null,
      description: 'Superauklė — didžiausia auklių bendruomenė Lietuvoje. Raskite auklę Panevėžyje.',
      availability: null,
      isServicePortal: true,
      baseRating: 4.3,
      baseReviewCount: 0,
    },
  ];

  for (const a of missingAukles) {
    const existing = await prisma.aukle.findFirst({ where: { slug: a.slug } });
    if (!existing) {
      await prisma.aukle.create({ data: a });
      console.log(`  + Added aukle: ${a.name}`);
    } else {
      console.log(`  = Already exists: ${a.name}`);
    }
  }

  // Final counts
  const aukles = await prisma.aukle.count();
  const bureliai = await prisma.burelis.count();
  const specialists = await prisma.specialist.count();
  console.log(`\nFinal counts: ${aukles} aukles, ${bureliai} bureliai, ${specialists} specialists`);
  console.log(`Total non-kindergarten entities: ${aukles + bureliai + specialists}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
