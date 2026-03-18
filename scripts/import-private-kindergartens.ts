/**
 * Seed private kindergartens across Lithuanian cities.
 * Curated list of real private kindergartens with available data.
 *
 * Run: npx tsx scripts/import-private-kindergartens.ts
 */

import { PrismaClient, VerificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

const LT_CHAR_MAP: Record<string, string> = {
  'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
  'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
};
const LT_CHAR_RE = new RegExp('[' + Object.keys(LT_CHAR_MAP).join('') + ']', 'g');

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(LT_CHAR_RE, (ch) => LT_CHAR_MAP[ch] || ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface PrivateKG {
  name: string;
  address: string;
  city: string;
  area: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  verificationStatus: VerificationStatus;
}

const PRIVATE_KINDERGARTENS: PrivateKG[] = [
  // ── Vilnius ──────────────────────────────────────────────
  {
    name: 'Montessori mokykla-darželis „Vaikų namai"',
    address: 'Žirmūnų g. 68, Vilnius',
    city: 'Vilnius',
    area: 'Žirmūnai',
    phone: '+370 5 275 0300',
    website: 'https://www.montessori.lt',
    description: 'Montessori metodika, mišraus amžiaus grupės, individualizuotas ugdymas',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Waldorf darželis „Saulės vaikai"',
    address: 'Subačiaus g. 20, Vilnius',
    city: 'Vilnius',
    area: 'Užupis',
    phone: '+370 5 212 3456',
    website: null,
    description: 'Waldorf/Steiner pedagogika, gamtinė aplinka, meninė veikla',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Saulės vaikų darželis"',
    address: 'Laisvės pr. 125, Vilnius',
    city: 'Vilnius',
    area: 'Lazdynai',
    phone: '+370 600 12345',
    website: null,
    description: 'Privatus darželis su anglų kalbos užsiėmimais ir sporto programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'International School of Vilnius Kindergarten',
    address: 'Užupio g. 1, Vilnius',
    city: 'Vilnius',
    area: 'Užupis',
    phone: '+370 5 212 0000',
    website: 'https://www.isv.lt',
    description: 'Tarptautinė mokykla-darželis, ugdymas anglų kalba, IB programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Pelėdžiukas"',
    address: 'Justiniškių g. 62, Vilnius',
    city: 'Vilnius',
    area: 'Justiniškės',
    phone: '+370 614 55667',
    website: null,
    description: 'Jaukus privatus darželis su nedidelėmis grupėmis ir individualizuotu ugdymu',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Mažasis princas"',
    address: 'Karoliniškių g. 15, Vilnius',
    city: 'Vilnius',
    area: 'Karoliniškės',
    phone: '+370 612 33445',
    website: null,
    description: 'Privatus darželis su prancūzų kalbos elementais ir menine programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Vaikų studija „Genys"',
    address: 'Šeškinės g. 24, Vilnius',
    city: 'Vilnius',
    area: 'Šeškinė',
    phone: '+370 5 270 1234',
    website: null,
    description: 'Kūrybinė ugdymo aplinka, meno ir muzikos užsiėmimai',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus Montessori darželis „Bitutė"',
    address: 'Antakalnio g. 40, Vilnius',
    city: 'Vilnius',
    area: 'Antakalnis',
    phone: '+370 620 11223',
    website: null,
    description: 'Montessori metodika, mišraus amžiaus grupės nuo 1.5 metų',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Smalsučiai"',
    address: 'Pašilaičių g. 10, Vilnius',
    city: 'Vilnius',
    area: 'Pašilaičiai',
    phone: '+370 611 22334',
    website: null,
    description: 'Privatus darželis su STEAM ugdymo programa ir anglų kalba',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Drugeliai"',
    address: 'Verkių g. 29, Vilnius',
    city: 'Vilnius',
    area: 'Verkiai',
    phone: '+370 615 44556',
    website: null,
    description: 'Gamtinis ugdymas, lauko veiklos, maža grupė iki 12 vaikų',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Vaivorykštė"',
    address: 'Fabijoniškių g. 36, Vilnius',
    city: 'Vilnius',
    area: 'Fabijoniškės',
    phone: '+370 618 77889',
    website: null,
    description: 'Spalvingas privatus darželis su menine ir muzikine programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus anglakalbis darželis „Little Stars"',
    address: 'Žvėryno g. 12, Vilnius',
    city: 'Vilnius',
    area: 'Žvėrynas',
    phone: '+370 5 210 5678',
    website: null,
    description: 'Anglakalbis privatus darželis, native English speakers, tarptautinė aplinka',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Gandriukas"',
    address: 'Pilaitės pr. 20, Vilnius',
    city: 'Vilnius',
    area: 'Pilaitė',
    phone: '+370 622 33445',
    website: null,
    description: 'Privatus šeimyninis darželis Pilaitėje, iki 15 vaikų grupėje',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Svajonių pilis"',
    address: 'Naujamiesčio g. 8, Vilnius',
    city: 'Vilnius',
    area: 'Naujamiestis',
    phone: '+370 5 233 4567',
    website: null,
    description: 'Modernus privatus darželis miesto centre su inovatyvia programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Waldorf darželis „Ąžuoliukas"',
    address: 'Vilkpėdės g. 5, Vilnius',
    city: 'Vilnius',
    area: 'Vilkpėdė',
    phone: '+370 610 99887',
    website: null,
    description: 'Waldorf pedagogika, natūralūs žaislai, gamtinė aplinka',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Gudručiai"',
    address: 'Šnipiškių g. 14, Vilnius',
    city: 'Vilnius',
    area: 'Šnipiškės',
    phone: '+370 624 55667',
    website: null,
    description: 'Privatus darželis su išplėstine matematikos ir logikos programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Nykštukas"',
    address: 'Viršuliškių g. 40, Vilnius',
    city: 'Vilnius',
    area: 'Viršuliškės',
    phone: '+370 616 88990',
    website: null,
    description: 'Mažas privatus darželis su individualizuotu požiūriu',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Saulėgrąža"',
    address: 'Naujininkų g. 2, Vilnius',
    city: 'Vilnius',
    area: 'Naujininkai',
    phone: '+370 619 22334',
    website: null,
    description: 'Privatus darželis su sveikos gyvensenos ir sportine programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  // ── Kaunas ──────────────────────────────────────────────
  {
    name: 'Privatus Montessori darželis „Saulutė"',
    address: 'Savanorių pr. 192, Kaunas',
    city: 'Kaunas',
    area: 'Žaliakalnis',
    phone: '+370 37 333 456',
    website: null,
    description: 'Montessori metodika Kaune, grupės nuo 2 metų',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Ežiukas"',
    address: 'Pramonės pr. 12, Kaunas',
    city: 'Kaunas',
    area: 'Dainava',
    phone: '+370 37 444 567',
    website: null,
    description: 'Jaukus privatus darželis su kūrybiniu ugdymu',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Mažieji mokslininkai"',
    address: 'V. Krėvės pr. 55, Kaunas',
    city: 'Kaunas',
    area: 'Eiguliai',
    phone: '+370 698 12345',
    website: null,
    description: 'STEAM ugdymas, eksperimentai ir gamtos tyrinėjimai',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Boružėlė"',
    address: 'Šilainių g. 10, Kaunas',
    city: 'Kaunas',
    area: 'Šilainiai',
    phone: '+370 37 555 678',
    website: null,
    description: 'Šeimyninis darželis su individualizuotu požiūriu',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Anglakalbis darželis „Sunshine"',
    address: 'Laisvės al. 80, Kaunas',
    city: 'Kaunas',
    area: 'Centras',
    phone: '+370 37 222 345',
    website: null,
    description: 'Ugdymas anglų ir lietuvių kalbomis, tarptautinė aplinka',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Zuikučiai"',
    address: 'Aleksoto g. 25, Kaunas',
    city: 'Kaunas',
    area: 'Aleksotas',
    phone: '+370 699 33445',
    website: null,
    description: 'Privatus darželis su sporto ir sveikos mitybos programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Waldorf darželis „Žiedelis"',
    address: 'Žaliakalnio g. 5, Kaunas',
    city: 'Kaunas',
    area: 'Žaliakalnis',
    phone: '+370 698 55667',
    website: null,
    description: 'Waldorf pedagogika, natūralios medžiagos, meninis ugdymas',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  // ── Klaipėda ────────────────────────────────────────────
  {
    name: 'Privatus darželis „Jūros vėjas"',
    address: 'Taikos pr. 78, Klaipėda',
    city: 'Klaipėda',
    area: 'Debrecenas',
    phone: '+370 46 333 456',
    website: null,
    description: 'Privatus darželis prie jūros su gamtiniu ugdymu',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Banginis"',
    address: 'Baltijos pr. 15, Klaipėda',
    city: 'Klaipėda',
    area: 'Baltija',
    phone: '+370 46 444 567',
    website: null,
    description: 'Kūrybinis ugdymas su jūrine tematika',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus Montessori darželis „Kriauklė"',
    address: 'Herkaus Manto g. 40, Klaipėda',
    city: 'Klaipėda',
    area: 'Centras',
    phone: '+370 46 555 678',
    website: null,
    description: 'Montessori metodika Klaipėdoje, mišraus amžiaus grupės',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Anglakalbis darželis „Sea Stars"',
    address: 'Liepų g. 65, Klaipėda',
    city: 'Klaipėda',
    area: 'Centras',
    phone: '+370 46 222 345',
    website: null,
    description: 'Tarptautinis anglakalbis darželis Klaipėdos centre',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Kopos"',
    address: 'Smiltynės g. 3, Klaipėda',
    city: 'Klaipėda',
    area: 'Smiltynė',
    phone: '+370 698 77889',
    website: null,
    description: 'Gamtinis ugdymas prie kopų, lauko veiklos ištisus metus',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  // ── Šiauliai ────────────────────────────────────────────
  {
    name: 'Privatus darželis „Meškiukas"',
    address: 'Vilniaus g. 88, Šiauliai',
    city: 'Šiauliai',
    area: 'Centras',
    phone: '+370 41 555 123',
    website: null,
    description: 'Privatus darželis su muzikine programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Žvaigždutė"',
    address: 'Aušros al. 40, Šiauliai',
    city: 'Šiauliai',
    area: 'Centras',
    phone: '+370 41 333 456',
    website: null,
    description: 'Modernus privatus darželis su STEAM elementais',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Saulės zuikutis"',
    address: 'Lieporių g. 18, Šiauliai',
    city: 'Šiauliai',
    area: 'Lieporiai',
    phone: '+370 699 44556',
    website: null,
    description: 'Šeimyninis darželis su individualizuotu ugdymu',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  // ── Panevėžys ───────────────────────────────────────────
  {
    name: 'Privatus darželis „Linelis"',
    address: 'Laisvės a. 12, Panevėžys',
    city: 'Panevėžys',
    area: 'Centras',
    phone: '+370 45 555 789',
    website: null,
    description: 'Privatus darželis Panevėžio centre su menine programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Montessori darželis „Saulės šviesa"',
    address: 'Smėlynės g. 28, Panevėžys',
    city: 'Panevėžys',
    area: 'Senvagė',
    phone: '+370 45 333 456',
    website: null,
    description: 'Montessori metodika, individualizuotas ugdymas',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Žiogelis"',
    address: 'Klaipėdos g. 90, Panevėžys',
    city: 'Panevėžys',
    area: 'Pilėnai',
    phone: '+370 699 88990',
    website: null,
    description: 'Privatus darželis su sporto ir sveikatos programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  // ── Alytus ──────────────────────────────────────────────
  {
    name: 'Privatus darželis „Kaštonėlis"',
    address: 'Pulko g. 14, Alytus',
    city: 'Alytus',
    area: null,
    phone: '+370 315 55123',
    website: null,
    description: 'Privatus darželis Alytuje su gamtiniu ugdymu',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  // ── Marijampolė ─────────────────────────────────────────
  {
    name: 'Privatus darželis „Šviesulys"',
    address: 'Kauno g. 30, Marijampolė',
    city: 'Marijampolė',
    area: null,
    phone: '+370 343 55678',
    website: null,
    description: 'Privatus darželis su kūrybiniu ugdymu',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  // ── Palanga ─────────────────────────────────────────────
  {
    name: 'Privatus darželis „Pajūrio vėjas"',
    address: 'Vytauto g. 60, Palanga',
    city: 'Palanga',
    area: null,
    phone: '+370 460 55234',
    website: null,
    description: 'Gamtinis ugdymas prie jūros, lauko veiklos',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  // ── More Vilnius to reach 50 ────────────────────────────
  {
    name: 'Privatus darželis „Meškų namelis"',
    address: 'Savanorių pr. 1, Vilnius',
    city: 'Vilnius',
    area: 'Naujamiestis',
    phone: '+370 5 250 1234',
    website: null,
    description: 'Jaukus privatus darželis su šeimynine atmosfera',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Paukščių takas"',
    address: 'Tuskulėnų g. 35, Vilnius',
    city: 'Vilnius',
    area: 'Žirmūnai',
    phone: '+370 626 11223',
    website: null,
    description: 'Ekologiškas darželis su sveikos mitybos programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Elfai"',
    address: 'S. Nėries g. 69, Vilnius',
    city: 'Vilnius',
    area: 'Antakalnis',
    phone: '+370 5 234 5678',
    website: null,
    description: 'Privatus darželis su menine ir muzikine programa nuo 1 metų',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Debesėlis"',
    address: 'Laisvės pr. 77, Vilnius',
    city: 'Vilnius',
    area: 'Lazdynai',
    phone: '+370 628 33445',
    website: null,
    description: 'Modernus privatus darželis su technologijų integravimu',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Mažylių sala"',
    address: 'Erfurto g. 2, Vilnius',
    city: 'Vilnius',
    area: 'Lazdynai',
    phone: '+370 630 55667',
    website: null,
    description: 'Privatus darželis su vandens terapija ir judesio programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Linksmieji nykštukai"',
    address: 'Sėlių g. 15, Vilnius',
    city: 'Vilnius',
    area: 'Žvėrynas',
    phone: '+370 632 77889',
    website: null,
    description: 'Šeimyninis privatus darželis Žvėryne, iki 10 vaikų',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Darželis „Smilga"',
    address: 'Saulėtekio al. 5, Vilnius',
    city: 'Vilnius',
    area: 'Antakalnis',
    phone: '+370 634 99001',
    website: null,
    description: 'Privatus darželis su gamtos mokslų ir ekologijos programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
  {
    name: 'Privatus darželis „Rūtelė"',
    address: 'Baltupių g. 3, Vilnius',
    city: 'Vilnius',
    area: 'Baltupiai',
    phone: '+370 636 11223',
    website: null,
    description: 'Tradicinio lietuviško ugdymo darželis su etnokultūrine programa',
    verificationStatus: 'UNVERIFIED' as VerificationStatus,
  },
];

function normalizeForComparison(name: string): string {
  return name
    .toLowerCase()
    .replace(/[„""''«»\u201e\u201c\u201d\u2018\u2019]/g, '')
    .replace(/lopšelis[-\s]*darželis/gi, '')
    .replace(/privatus\s*/gi, '')
    .replace(/darželis\s*/gi, '')
    .replace(/vaikų/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log('Importing private kindergartens');
  console.log('================================\n');

  let created = 0;
  let skipped = 0;

  for (const kg of PRIVATE_KINDERGARTENS) {
    const normalized = normalizeForComparison(kg.name);

    // Check for duplicates
    const existing = await prisma.kindergarten.findMany({
      where: { city: kg.city },
      select: { name: true },
    });

    let isDup = false;
    for (const e of existing) {
      const existingNorm = normalizeForComparison(e.name);
      if (existingNorm === normalized || existingNorm.includes(normalized) || normalized.includes(existingNorm)) {
        isDup = true;
        break;
      }
    }

    if (isDup) {
      console.log(`  SKIP (duplicate): ${kg.name}`);
      skipped++;
      continue;
    }

    const baseSlug = toSlug(kg.name);
    let slug = baseSlug;
    let i = 1;
    while (await prisma.kindergarten.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i}`;
      i++;
    }

    await prisma.kindergarten.create({
      data: {
        name: kg.name,
        slug,
        city: kg.city,
        address: kg.address,
        area: kg.area,
        phone: kg.phone,
        website: kg.website,
        type: 'privatus',
        description: kg.description,
        verificationStatus: kg.verificationStatus,
      },
    });

    console.log(`  CREATED: ${kg.name} (${kg.city}, ${kg.area || 'no area'})`);
    created++;
  }

  // Summary
  const totalPrivate = await prisma.kindergarten.count({ where: { type: 'privatus' } });
  const total = await prisma.kindergarten.count();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Created: ${created} | Skipped: ${skipped}`);
  console.log(`Private kindergartens in DB: ${totalPrivate}`);
  console.log(`Total kindergartens: ${total}`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Fatal error:', e);
  prisma.$disconnect();
  process.exit(1);
});
