/**
 * Assign neighborhoods (area) to existing kindergartens that have area=null.
 * Uses address postal codes and street name patterns.
 *
 * Run: npx tsx scripts/assign-areas.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Vilnius postal code → neighborhood (detailed) ───────────────────────────

const VILNIUS_POSTAL_DETAILED: [string, string][] = [
  ['LT-010', 'Senamiestis'],
  ['LT-011', 'Senamiestis'],
  ['LT-012', 'Senamiestis'],
  ['LT-013', 'Užupis'],
  ['LT-021', 'Žirmūnai'],
  ['LT-022', 'Žirmūnai'],
  ['LT-023', 'Žirmūnai'],
  ['LT-024', 'Žirmūnai'],
  ['LT-030', 'Antakalnis'],
  ['LT-031', 'Antakalnis'],
  ['LT-032', 'Antakalnis'],
  ['LT-040', 'Naujamiestis'],
  ['LT-041', 'Naujamiestis'],
  ['LT-042', 'Naujamiestis'],
  ['LT-050', 'Justiniškės'],
  ['LT-051', 'Viršuliškės'],
  ['LT-052', 'Viršuliškės'],
  ['LT-060', 'Šeškinė'],
  ['LT-061', 'Šeškinė'],
  ['LT-062', 'Šeškinė'],
  ['LT-070', 'Fabijoniškės'],
  ['LT-071', 'Pašilaičiai'],
  ['LT-072', 'Pašilaičiai'],
  ['LT-073', 'Pašilaičiai'],
  ['LT-080', 'Antakalnis'],
  ['LT-081', 'Antakalnis'],
  ['LT-082', 'Verkiai'],
  ['LT-083', 'Verkiai'],
  ['LT-084', 'Bajorai'],
  ['LT-085', 'Balsiai'],
  ['LT-090', 'Šnipiškės'],
  ['LT-091', 'Šnipiškės'],
  ['LT-100', 'Naujininkai'],
  ['LT-101', 'Rasos'],
  ['LT-102', 'Naujininkai'],
  ['LT-103', 'Naujininkai'],
  ['LT-110', 'Naujininkai'],
  ['LT-111', 'Naujininkai'],
  ['LT-112', 'Salininkai'],
  ['LT-120', 'Pilaitė'],
  ['LT-121', 'Pilaitė'],
  ['LT-122', 'Pilaitė'],
  ['LT-130', 'Lazdynai'],
  ['LT-131', 'Karoliniškės'],
  ['LT-132', 'Karoliniškės'],
  ['LT-133', 'Lazdynai'],
  ['LT-140', 'Žvėrynas'],
  ['LT-141', 'Žvėrynas'],
];

const VILNIUS_POSTAL_FALLBACK: Record<string, string> = {
  '01': 'Senamiestis',
  '02': 'Žirmūnai',
  '03': 'Antakalnis',
  '04': 'Naujamiestis',
  '05': 'Justiniškės',
  '06': 'Šeškinė',
  '07': 'Fabijoniškės',
  '08': 'Antakalnis',
  '09': 'Šnipiškės',
  '10': 'Naujininkai',
  '11': 'Naujininkai',
  '12': 'Pilaitė',
  '13': 'Lazdynai',
  '14': 'Žvėrynas',
};

// ── Kaunas postal code → neighborhood ───────────────────────────────────────

const KAUNAS_POSTAL: Record<string, string> = {
  '44': 'Centras',
  '45': 'Dainava',
  '46': 'Žaliakalnis',
  '47': 'Eiguliai',
  '48': 'Petrašiūnai',
  '49': 'Šančiai',
  '50': 'Aleksotas',
  '51': 'Vilijampolė',
  '52': 'Šilainiai',
};

// ── Klaipėda postal code → neighborhood ─────────────────────────────────────

const KLAIPEDA_POSTAL: Record<string, string> = {
  '91': 'Centras',
  '92': 'Debrecenas',
  '93': 'Melnragė',
  '94': 'Žardininkai',
  '95': 'Bandužiai',
  '96': 'Tauralaukis',
};

// ── Šiauliai postal code → neighborhood ─────────────────────────────────────

const SIAULIAI_POSTAL: Record<string, string> = {
  '76': 'Centras',
  '77': 'Dainai',
  '78': 'Gubernija',
};

// ── Panevėžys postal code → neighborhood ────────────────────────────────────

const PANEVEZYS_POSTAL: Record<string, string> = {
  '35': 'Centras',
  '36': 'Tulpių',
  '37': 'Klaipėdos',
  '38': 'Senvagė',
};

// ── Street name patterns (for addresses without clear postal codes) ─────────

const VILNIUS_STREET_PATTERNS: [RegExp, string][] = [
  [/Žirmūnų|Kareivių|Tuskulėnų|Minties/i, 'Žirmūnai'],
  [/Antakalnio|Sapiegų|Kosciuškos/i, 'Antakalnis'],
  [/Šeškinės|Ukmergės.*[67]/i, 'Šeškinė'],
  [/Justiniškių|Rygos/i, 'Justiniškės'],
  [/Pilaitės|Gulbių/i, 'Pilaitė'],
  [/Pašilaičių|Laisvės.*7/i, 'Pašilaičiai'],
  [/Fabijoniškių|S\.\s*Nėries/i, 'Fabijoniškės'],
  [/Lazdynų|Erfurto/i, 'Lazdynai'],
  [/Karoliniškių|Loretos/i, 'Karoliniškės'],
  [/Viršuliškių/i, 'Viršuliškės'],
  [/Žvėryno|Sėlių|Kęstučio/i, 'Žvėrynas'],
  [/Naujininkų|Gerosios Vilties/i, 'Naujininkai'],
  [/Šnipiškių|Kalvarijų/i, 'Šnipiškės'],
  [/Verkių|Jeruzalės/i, 'Verkiai'],
  [/Baltupių/i, 'Baltupiai'],
  [/Pavilnio|Pavilnyje/i, 'Pavilnys'],
  [/Grigiškių|Grigiškės/i, 'Grigiškės'],
  [/Užupio/i, 'Užupis'],
  [/Vilkpėdės/i, 'Vilkpėdė'],
  [/Rasų|Subatvečio/i, 'Rasos'],
  [/Gedimino\s+pr/i, 'Senamiestis'],
  [/Pylimo|Trakų\s+g|Vokiečių/i, 'Senamiestis'],
];

function getAreaFromAddress(address: string | null, city: string): string | null {
  if (!address) return null;

  // Try postal code first
  const postalMatch = address.match(/LT[-\s]?(\d{5})/i) || address.match(/(\d{5})\s/);
  if (postalMatch) {
    const code = postalMatch[1];
    const prefix2 = code.substring(0, 2);

    if (city === 'Vilnius') {
      const ltPrefix = `LT-${code.substring(0, 3)}`;
      for (const [prefix, area] of VILNIUS_POSTAL_DETAILED) {
        if (ltPrefix.startsWith(prefix)) return area;
      }
      return VILNIUS_POSTAL_FALLBACK[prefix2] || null;
    }
    if (city === 'Kaunas') return KAUNAS_POSTAL[prefix2] || null;
    if (city === 'Klaipėda') return KLAIPEDA_POSTAL[prefix2] || null;
    if (city === 'Šiauliai') return SIAULIAI_POSTAL[prefix2] || null;
    if (city === 'Panevėžys') return PANEVEZYS_POSTAL[prefix2] || null;
  }

  // Try street name patterns (Vilnius only for now)
  if (city === 'Vilnius') {
    for (const [pattern, area] of VILNIUS_STREET_PATTERNS) {
      if (pattern.test(address)) return area;
    }
  }

  return null;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Assigning areas to kindergartens with area=null\n');

  const noArea = await prisma.kindergarten.findMany({
    where: { area: null },
    select: { id: true, name: true, address: true, city: true },
  });

  console.log(`Found ${noArea.length} kindergartens without area\n`);

  let assigned = 0;
  let unresolved = 0;

  for (const kg of noArea) {
    const area = getAreaFromAddress(kg.address, kg.city);
    if (area) {
      await prisma.kindergarten.update({
        where: { id: kg.id },
        data: { area },
      });
      console.log(`  ✓ ${kg.name} → ${area} (from: ${kg.address})`);
      assigned++;
    } else {
      console.log(`  ✗ ${kg.name} — no match (${kg.address || 'no address'})`);
      unresolved++;
    }
  }

  // Final stats
  const totalNoArea = await prisma.kindergarten.count({ where: { area: null } });
  console.log(`\nResults: ${assigned} assigned, ${unresolved} unresolved`);
  console.log(`Remaining without area: ${totalNoArea}`);
  console.log(`Success rate: ${noArea.length > 0 ? Math.round(assigned / noArea.length * 100) : 0}%`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Fatal error:', e);
  prisma.$disconnect();
  process.exit(1);
});
