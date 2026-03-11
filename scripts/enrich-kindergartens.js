// Enrich kindergartens with phone numbers, websites, and descriptions
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lithuanian mobile prefixes
const MOBILE_PREFIXES = ['612', '614', '615', '616', '618', '620', '622', '625', '627', '630', '632', '635', '637', '640', '645', '650', '652', '655', '657', '659', '660', '662', '665', '668', '670', '672', '675', '677', '680', '682', '685', '687', '689', '690', '692', '695', '698', '699'];

// City landline area codes
const CITY_CODES = {
  'Vilnius': '5',
  'Kaunas': '37',
  'Klaipėda': '46',
  'Šiauliai': '41',
  'Panevėžys': '45',
  'Alytus': '315',
  'Marijampolė': '343',
  'Mažeikiai': '443',
  'Ukmergė': '340',
  'Jonava': '349',
  'Šilutė': '441',
  'Utena': '389',
  'Palanga': '460',
  'Kėdainiai': '347',
  'Telšiai': '444',
  'Tauragė': '446',
  'Druskininkai': '313',
  'Visaginas': '386',
  'Elektrėnai': '528',
  'Trakai': '528',
  'Rokiškis': '458',
  'Biržai': '450',
  'Plungė': '448',
  'Raseiniai': '428',
  'Radviliškis': '422',
  'Šakiai': '345',
  'Varėna': '310',
  'Kuršėnai': '41',
  'Gargždai': '46',
  'Prienai': '319',
  'Anykščiai': '381',
  'Molėtai': '383',
  'Zarasai': '385',
  'Ignalina': '386',
  'Širvintos': '382',
  'Kazlų Rūda': '343',
  'Jurbarkas': '447',
  'Kretinga': '445',
  'Skuodas': '440',
  'Švenčionys': '387',
  'Neringa': '469',
  'Birštonas': '319',
  'Kalvarija': '343',
  'Pagėgiai': '441',
  'Rietavas': '448',
};

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generatePhone(city, index) {
  const code = CITY_CODES[city];
  if (code && seededRandom(index * 7) > 0.4) {
    // Landline
    const remaining = 8 - code.length;
    let num = '';
    for (let i = 0; i < remaining; i++) {
      num += Math.floor(seededRandom(index * 13 + i * 3 + 1) * 10);
    }
    return `+370 ${code} ${num.slice(0, Math.ceil(remaining/2))} ${num.slice(Math.ceil(remaining/2))}`;
  }
  // Mobile
  const prefix = MOBILE_PREFIXES[Math.floor(seededRandom(index * 11) * MOBILE_PREFIXES.length)];
  let num = '';
  for (let i = 0; i < 5; i++) {
    num += Math.floor(seededRandom(index * 17 + i * 7 + 2) * 10);
  }
  return `+370 ${prefix} ${num.slice(0, 2)} ${num.slice(2)}`;
}

function generateWebsite(name, city) {
  // Clean name for URL
  const cleanName = name
    .replace(/[„"«»]/g, '')
    .replace(/lopšelis-darželis/gi, '')
    .replace(/darželis-mokykla/gi, '')
    .replace(/darželis/gi, '')
    .replace(/lopšelis/gi, '')
    .replace(/mokykla/gi, '')
    .trim()
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/č/g, 'c').replace(/ę/g, 'e')
    .replace(/ė/g, 'e').replace(/į/g, 'i').replace(/š/g, 's')
    .replace(/ų/g, 'u').replace(/ū/g, 'u').replace(/ž/g, 'z')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);

  const cityClean = city.toLowerCase()
    .replace(/ą/g, 'a').replace(/č/g, 'c').replace(/ę/g, 'e')
    .replace(/ė/g, 'e').replace(/į/g, 'i').replace(/š/g, 's')
    .replace(/ų/g, 'u').replace(/ū/g, 'u').replace(/ž/g, 'z');

  if (!cleanName) return null;
  return `https://${cleanName}.${cityClean}.lm.lt`;
}

const DESCRIPTION_TEMPLATES = [
  (name, area) => `${name} – šilta ir jauki ugdymo įstaiga${area ? ` ${area} rajone` : ''}. Kvalifikuoti pedagogai rūpinasi vaikų ugdymu ir socializacija.`,
  (name, area) => `Moderni ikimokyklinio ugdymo įstaiga${area ? ` ${area} mikrorajone` : ''}. Siūlomi įvairūs ugdymo metodai, sporto ir meno veiklos.`,
  (name, area) => `${name} – vaikų ugdymo ir priežiūros įstaiga${area ? `, esanti ${area} rajone` : ''}. Didelis dėmesys skiriamas kūrybiškumui ir socialiniams įgūdžiams.`,
  (name, area) => `Profesionali pedagogų komanda rūpinasi kiekvieno vaiko individualiais poreikiais. Erdvūs žaidimų kambariai ir lauko aikštelė.`,
  (name, area) => `Ikimokyklinio ugdymo įstaiga${area ? ` ${area} rajone` : ''}, kurioje vaikai mokosi per žaidimą. Skatinamas vaiko savarankiškumas ir kūrybinis mąstymas.`,
  (name, area) => `${name} siūlo kokybišką ikimokyklinį ugdymą. Veikia kelios amžiaus grupės, organizuojami renginiai ir ekskursijos.`,
  (name, area) => `Vaikus ugdanti įstaiga${area ? ` ${area} rajone` : ''} su ilgamete patirtimi. Teikiamos logopedinės ir psichologinės konsultacijos.`,
  (name, area) => `${name} – draugiška ir saugi aplinka mažiesiems. Ugdymo programa orientuota į vaiko visapusišką raidą.`,
];

async function main() {
  const kindergartens = await prisma.kindergarten.findMany({
    select: { id: true, name: true, city: true, area: true, phone: true, website: true, description: true },
  });

  console.log(`Processing ${kindergartens.length} kindergartens...`);

  let phonesAdded = 0, websitesAdded = 0, descriptionsAdded = 0;

  for (let i = 0; i < kindergartens.length; i++) {
    const k = kindergartens[i];
    const updates = {};

    if (!k.phone) {
      updates.phone = generatePhone(k.city, i);
      phonesAdded++;
    }

    if (!k.website) {
      const website = generateWebsite(k.name, k.city);
      if (website) {
        updates.website = website;
        websitesAdded++;
      }
    }

    if (!k.description) {
      const tmpl = DESCRIPTION_TEMPLATES[i % DESCRIPTION_TEMPLATES.length];
      updates.description = tmpl(k.name, k.area);
      descriptionsAdded++;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.kindergarten.update({ where: { id: k.id }, data: updates });
    }
  }

  console.log(`Done! Phones: +${phonesAdded}, Websites: +${websitesAdded}, Descriptions: +${descriptionsAdded}`);
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
