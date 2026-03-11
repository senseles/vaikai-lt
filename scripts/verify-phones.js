/**
 * Phone Number Verification Script
 * Validates Lithuanian phone numbers across all entity types.
 *
 * Usage: node scripts/verify-phones.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// --- Lithuanian phone validation rules ---

// Known valid area codes (1-3 digits after +370)
const MOBILE_PREFIX = '6'; // +370 6XX XXXXX
const KNOWN_AREA_CODES = [
  // 1-digit
  '5',   // Vilnius
  // 2-digit
  '37',  // Kaunas
  '45',  // Panevėžys
  '46',  // Klaipėda
  '41',  // Šiauliai
  '31',  // part of smaller cities (prefix family)
  '34',  // Utena region
  '38',  // Alytus region
  '31',  // Varėna/Lazdijai region
  '36',  // Tauragė/Jurbarkas
  '40',  // Mažeikiai/Telšiai region
  '42',  // Radviliškis/Kėdainiai
  '43',  // Biržai/Rokiškis
  '44',  // Kupiškis/Anykščiai
  '47',  // Marijampolė/Vilkaviškis
  '48',  // Palanga
  '49',  // Druskininkai
  '52',  // Vilnius region alt
  '28',  // Zarasai
  '35',  // Prienai
  '39',  // Plungė
  '58',  // Širvintos
  '59',  // Kaišiadorys
  // 3-digit
  '310', // Varėna
  '313', // Druskininkai
  '315', // Lazdijai
  '316', // Alytus area
  '318', // Prienai area
  '319', // Birštonas
  '340', // Utena
  '342', // Visaginas
  '343', // Zarasai
  '345', // Ignalina
  '346', // Molėtai
  '347', // Švenčionys
  '349', // Anykščiai
  '380', // Alytus
  '381', // Alytus city
  '382', // Alytus alt
  '386', // Širvintos
  '387', // Elektrėnai
  '389', // Ukmergė
  '422', // Kėdainiai
  '425', // Radviliškis
  '426', // Joniškis
  '427', // Pakruojis
  '428', // Raseiniai
  '440', // Biržai
  '441', // Rokiškis
  '443', // Kupiškis
  '445', // Pasvalys
  '447', // Panevėžys area
  '448', // Anykščiai
  '449', // Kupiškis alt
  '451', // Panevėžys city
  '458', // Telšiai
  '460', // Klaipėda alt
  '464', // Šilutė
  '469', // Kretinga
  '471', // Marijampolė
  '473', // Vilkaviškis
  '478', // Šakiai
  '479', // Kazlų Rūda
  '528', // Trakai
  '529', // Šalčininkai
];

const Categories = {
  VALID_MOBILE: 'VALID_MOBILE',
  VALID_LANDLINE: 'VALID_LANDLINE',
  INVALID_FORMAT: 'INVALID_FORMAT',
  WRONG_DIGIT_COUNT: 'WRONG_DIGIT_COUNT',
  SUSPICIOUS_AREA_CODE: 'SUSPICIOUS_AREA_CODE',
};

function classifyPhone(raw) {
  if (!raw) return null;

  // Strip spaces, dashes, parentheses for analysis
  const cleaned = raw.replace(/[\s\-()]/g, '');

  // Must start with +370
  if (!cleaned.startsWith('+370')) {
    return {
      category: Categories.INVALID_FORMAT,
      reason: `Does not start with +370 (got: "${raw}")`,
    };
  }

  const afterPrefix = cleaned.slice(4); // digits after +370

  // Check total digit count: should be 8 digits after +370
  if (afterPrefix.length !== 8) {
    return {
      category: Categories.WRONG_DIGIT_COUNT,
      reason: `Expected 8 digits after +370, got ${afterPrefix.length} ("${raw}")`,
    };
  }

  // All remaining chars must be digits
  if (!/^\d+$/.test(afterPrefix)) {
    return {
      category: Categories.INVALID_FORMAT,
      reason: `Non-digit characters after +370 ("${raw}")`,
    };
  }

  // Mobile: starts with 6
  if (afterPrefix.startsWith(MOBILE_PREFIX)) {
    return { category: Categories.VALID_MOBILE };
  }

  // Landline: check area code (try 3-digit, 2-digit, 1-digit match)
  const ac3 = afterPrefix.slice(0, 3);
  const ac2 = afterPrefix.slice(0, 2);
  const ac1 = afterPrefix.slice(0, 1);

  if (
    KNOWN_AREA_CODES.includes(ac3) ||
    KNOWN_AREA_CODES.includes(ac2) ||
    KNOWN_AREA_CODES.includes(ac1)
  ) {
    return { category: Categories.VALID_LANDLINE };
  }

  return {
    category: Categories.SUSPICIOUS_AREA_CODE,
    reason: `Unknown area code prefix "${ac2}" / "${ac3}" in "${raw}"`,
  };
}

async function main() {
  console.log('=== Lithuanian Phone Number Verification ===\n');

  const entityTypes = [
    { name: 'Kindergarten', query: () => prisma.kindergarten.findMany({ where: { phone: { not: null } }, select: { id: true, name: true, phone: true, city: true } }) },
    { name: 'Aukle', query: () => prisma.aukle.findMany({ where: { phone: { not: null } }, select: { id: true, name: true, phone: true, city: true } }) },
    { name: 'Burelis', query: () => prisma.burelis.findMany({ where: { phone: { not: null } }, select: { id: true, name: true, phone: true, city: true } }) },
    { name: 'Specialist', query: () => prisma.specialist.findMany({ where: { phone: { not: null } }, select: { id: true, name: true, phone: true, city: true } }) },
  ];

  const counts = {
    [Categories.VALID_MOBILE]: 0,
    [Categories.VALID_LANDLINE]: 0,
    [Categories.INVALID_FORMAT]: 0,
    [Categories.WRONG_DIGIT_COUNT]: 0,
    [Categories.SUSPICIOUS_AREA_CODE]: 0,
  };
  let totalWithPhone = 0;
  let totalEntities = 0;
  const issues = [];

  for (const { name: typeName, query } of entityTypes) {
    const entities = await query();
    const typeTotal = await getCount(typeName);
    console.log(`--- ${typeName} ---`);
    console.log(`  Total: ${typeTotal}, With phone: ${entities.length}`);
    totalEntities += typeTotal;
    totalWithPhone += entities.length;

    for (const entity of entities) {
      // Some phone fields may contain multiple numbers separated by comma/semicolon
      const phones = entity.phone.split(/[;,]/).map((p) => p.trim()).filter(Boolean);

      for (const phone of phones) {
        const result = classifyPhone(phone);
        if (!result) continue;

        counts[result.category]++;

        if (
          result.category !== Categories.VALID_MOBILE &&
          result.category !== Categories.VALID_LANDLINE
        ) {
          issues.push({
            type: typeName,
            name: entity.name,
            city: entity.city,
            phone,
            category: result.category,
            reason: result.reason,
          });
        }
      }
    }
  }

  // --- Report ---
  console.log('\n========================================');
  console.log('           VERIFICATION SUMMARY');
  console.log('========================================\n');
  console.log(`Total entities:         ${totalEntities}`);
  console.log(`Entities with phone:    ${totalWithPhone}`);
  console.log('');
  console.log(`VALID_MOBILE:           ${counts[Categories.VALID_MOBILE]}`);
  console.log(`VALID_LANDLINE:         ${counts[Categories.VALID_LANDLINE]}`);
  console.log(`INVALID_FORMAT:         ${counts[Categories.INVALID_FORMAT]}`);
  console.log(`WRONG_DIGIT_COUNT:      ${counts[Categories.WRONG_DIGIT_COUNT]}`);
  console.log(`SUSPICIOUS_AREA_CODE:   ${counts[Categories.SUSPICIOUS_AREA_CODE]}`);

  const totalChecked =
    counts[Categories.VALID_MOBILE] +
    counts[Categories.VALID_LANDLINE] +
    counts[Categories.INVALID_FORMAT] +
    counts[Categories.WRONG_DIGIT_COUNT] +
    counts[Categories.SUSPICIOUS_AREA_CODE];

  const totalValid = counts[Categories.VALID_MOBILE] + counts[Categories.VALID_LANDLINE];
  const pct = totalChecked > 0 ? ((totalValid / totalChecked) * 100).toFixed(1) : '0.0';
  console.log(`\nTotal numbers checked:  ${totalChecked}`);
  console.log(`Valid rate:             ${pct}%`);

  if (issues.length > 0) {
    console.log(`\n========================================`);
    console.log(`  INVALID / SUSPICIOUS NUMBERS (${issues.length})`);
    console.log(`========================================\n`);
    for (const issue of issues) {
      console.log(
        `  [${issue.category}] ${issue.type} | ${issue.name} (${issue.city}) | phone: "${issue.phone}"`
      );
      console.log(`    -> ${issue.reason}`);
    }
  } else {
    console.log('\nNo invalid or suspicious phone numbers found.');
  }
}

async function getCount(typeName) {
  switch (typeName) {
    case 'Kindergarten':
      return prisma.kindergarten.count();
    case 'Aukle':
      return prisma.aukle.count();
    case 'Burelis':
      return prisma.burelis.count();
    case 'Specialist':
      return prisma.specialist.count();
    default:
      return 0;
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
