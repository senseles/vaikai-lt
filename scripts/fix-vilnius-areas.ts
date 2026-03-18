/**
 * Fix/assign Vilnius kindergarten areas based on comprehensive street-to-neighborhood mapping.
 * Addresses gaps in postal code approach with street name pattern matching.
 *
 * Run: npx tsx scripts/fix-vilnius-areas.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive street → neighborhood mapping for Vilnius
const VILNIUS_STREET_MAP: [RegExp, string][] = [
  // Lazdynai
  [/Lazdynų\s+g/i, 'Lazdynai'],
  [/Erfurto\s+g/i, 'Lazdynai'],
  [/Architektų\s+g/i, 'Lazdynai'],
  [/Jonažolių\s+g/i, 'Lazdynai'],
  [/Tremtinių\s+g/i, 'Lazdynai'],

  // Karoliniškės
  [/Karoliniškių\s+g/i, 'Karoliniškės'],
  [/Loretos\s+g/i, 'Karoliniškės'],
  [/Igno\s+Šimulionio/i, 'Karoliniškės'],
  [/Sausio\s+13-osios/i, 'Karoliniškės'],
  [/Vido\s+Maciulevičiaus/i, 'Karoliniškės'],

  // Žvėrynas
  [/Žvėryno\s+g/i, 'Žvėrynas'],
  [/Sėlių\s+g/i, 'Žvėrynas'],
  [/Kęstučio\s+g/i, 'Žvėrynas'],
  [/Birutės\s+g/i, 'Žvėrynas'],
  [/Saltoniškių\s+g/i, 'Žvėrynas'],
  [/Liubarto\s+g/i, 'Žvėrynas'],
  [/Vytauto\s+g/i, 'Žvėrynas'],

  // Vilkpėdė
  [/Vilkpėdės\s+g/i, 'Vilkpėdė'],
  [/Savanorių\s+pr.*\b([5-9]\d|1[0-4]\d)\b/i, 'Vilkpėdė'],

  // Užupis
  [/Užupio\s+g/i, 'Užupis'],
  [/Polocko\s+g/i, 'Užupis'],
  [/Paupio\s+g/i, 'Užupis'],
  [/Krivių\s+g/i, 'Užupis'],

  // Antakalnis
  [/Antakalnio\s+g/i, 'Antakalnis'],
  [/Sapiegų\s+g/i, 'Antakalnis'],
  [/Nemenčinės\s+(pl|g)/i, 'Antakalnis'],
  [/Saulėtekio\s+al/i, 'Antakalnis'],
  [/S\.\s*Nėries\s+g/i, 'Antakalnis'],
  [/Kareivių\s+g/i, 'Antakalnis'],

  // Žirmūnai
  [/Žirmūnų\s+g/i, 'Žirmūnai'],
  [/Tuskulėnų\s+g/i, 'Žirmūnai'],
  [/Kareivių\s+g/i, 'Žirmūnai'],
  [/Minties\s+g/i, 'Žirmūnai'],
  [/Trinapolio\s+g/i, 'Žirmūnai'],

  // Šeškinė
  [/Šeškinės\s+g/i, 'Šeškinė'],
  [/Gelvonų\s+g/i, 'Šeškinė'],
  [/Ukmergės\s+g.*\b(1[4-9]\d|2\d\d)\b/i, 'Šeškinė'],

  // Fabijoniškės
  [/Fabijoniškių\s+g/i, 'Fabijoniškės'],
  [/S\.\s*Stanevičiaus\s+g/i, 'Fabijoniškės'],
  [/Ateities\s+g/i, 'Fabijoniškės'],

  // Pašilaičiai
  [/Pašilaičių\s+g/i, 'Pašilaičiai'],
  [/Medeinos\s+g/i, 'Pašilaičiai'],
  [/Laisvės\s+pr/i, 'Pašilaičiai'], // Laisvės pr. is in Pašilaičiai/Lazdynai area

  // Justiniškės
  [/Justiniškių\s+g/i, 'Justiniškės'],
  [/Tarandės\s+g/i, 'Justiniškės'],

  // Viršuliškės
  [/Viršuliškių\s+g/i, 'Viršuliškės'],

  // Pilaitė
  [/Pilaitės\s+pr/i, 'Pilaitė'],
  [/Vydūno\s+g/i, 'Pilaitė'],
  [/Lakūnų\s+g/i, 'Pilaitė'],

  // Naujininkai
  [/Naujininkų\s+g/i, 'Naujininkai'],
  [/Gerosios\s+Vilties\s+g/i, 'Naujininkai'],
  [/Ringuva\s+g/i, 'Naujininkai'],

  // Senamiestis
  [/Gedimino\s+pr/i, 'Senamiestis'],
  [/Pilies\s+g/i, 'Senamiestis'],
  [/Šv\.\s+Ignoto\s+g/i, 'Senamiestis'],
  [/Bokšto\s+g/i, 'Senamiestis'],
  [/Subačiaus\s+g/i, 'Senamiestis'],

  // Naujamiestis
  [/Naujamiesčio\s+g/i, 'Naujamiestis'],
  [/Algirdo\s+g/i, 'Naujamiestis'],
  [/Vytenio\s+g/i, 'Naujamiestis'],
  [/Kauno\s+g/i, 'Naujamiestis'],

  // Šnipiškės
  [/Šnipiškių\s+g/i, 'Šnipiškės'],
  [/Kalvarijų\s+g/i, 'Šnipiškės'],
  [/Konstitucijos\s+pr/i, 'Šnipiškės'],

  // Verkiai
  [/Verkių\s+g/i, 'Verkiai'],
  [/Jeruzalės\s+g/i, 'Verkiai'],

  // Baltupiai
  [/Baltupių\s+g/i, 'Baltupiai'],
  [/Ateities\s+g/i, 'Baltupiai'],

  // Rasos
  [/Rasų\s+g/i, 'Rasos'],
  [/Filaretų\s+g/i, 'Rasos'],

  // Paneriai
  [/Panerių\s+g/i, 'Paneriai'],

  // Grigiškės
  [/Grigiškių/i, 'Grigiškės'],
  [/Kovo\s+11-osios\s+g/i, 'Grigiškės'],
];

async function main() {
  console.log('Fixing Vilnius area assignments');
  console.log('================================\n');

  // Get all Vilnius kindergartens (including those with area, to fix wrong ones)
  const allVilnius = await prisma.kindergarten.findMany({
    where: { city: 'Vilnius' },
    select: { id: true, name: true, address: true, area: true },
  });

  console.log(`Total Vilnius kindergartens: ${allVilnius.length}`);
  const noArea = allVilnius.filter(k => !k.area);
  console.log(`Without area: ${noArea.length}\n`);

  let updated = 0;
  let alreadyCorrect = 0;

  // Process kindergartens without area first
  for (const kg of noArea) {
    if (!kg.address) continue;

    let newArea: string | null = null;
    for (const [re, area] of VILNIUS_STREET_MAP) {
      if (re.test(kg.address)) {
        newArea = area;
        break;
      }
    }

    if (newArea) {
      await prisma.kindergarten.update({
        where: { id: kg.id },
        data: { area: newArea },
      });
      console.log(`  UPDATED: ${kg.name} → ${newArea} (was: null)`);
      updated++;
    } else {
      console.log(`  SKIPPED (no match): ${kg.name} | ${kg.address}`);
    }
  }

  // Also check if existing areas need correction (street name clearly indicates a different neighborhood)
  const withArea = allVilnius.filter(k => k.area);
  let corrected = 0;
  for (const kg of withArea) {
    if (!kg.address) continue;

    for (const [re, correctArea] of VILNIUS_STREET_MAP) {
      if (re.test(kg.address) && kg.area !== correctArea) {
        // Only correct if the street match is very specific (not generic streets)
        const specificStreets = [
          /Lazdynų/, /Karoliniškių/, /Žvėryno/, /Vilkpėdės/, /Užupio/,
          /Fabijoniškių/, /Pašilaičių/, /Justiniškių/, /Viršuliškių/,
          /Naujininkų/, /Šnipiškių/, /Pilaitės/, /Grigiškių/,
        ];
        const isSpecific = specificStreets.some(s => s.test(kg.address!));
        if (isSpecific) {
          console.log(`  CORRECTED: ${kg.name} | ${kg.area} → ${correctArea}`);
          await prisma.kindergarten.update({
            where: { id: kg.id },
            data: { area: correctArea },
          });
          corrected++;
        }
        break;
      }
    }
  }

  // Summary
  const areasAfter = await prisma.kindergarten.groupBy({
    by: ['area'],
    where: { city: 'Vilnius' },
    _count: true,
    orderBy: { _count: { area: 'desc' } },
  });

  const stillNoArea = await prisma.kindergarten.count({
    where: { city: 'Vilnius', area: null },
  });

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Updated: ${updated} | Corrected: ${corrected}`);
  console.log(`Still without area: ${stillNoArea}`);
  console.log('\nArea distribution:');
  for (const a of areasAfter) {
    console.log(`  ${a.area || '(null)'}: ${a._count}`);
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Fatal error:', e);
  prisma.$disconnect();
  process.exit(1);
});
