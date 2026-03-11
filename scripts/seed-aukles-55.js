const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(text) {
  return text.toLowerCase()
    .replace(/[ąà]/g, 'a').replace(/[čć]/g, 'c').replace(/[ęè]/g, 'e')
    .replace(/[ėē]/g, 'e').replace(/[įì]/g, 'i').replace(/[šś]/g, 's')
    .replace(/[ųùū]/g, 'u').replace(/[žź]/g, 'z').replace(/ū/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const firstNames = [
  'Agnė', 'Aistė', 'Austėja', 'Birutė', 'Dalia', 'Daiva', 'Dovilė', 'Eglė',
  'Giedrė', 'Ieva', 'Indrė', 'Jūratė', 'Jolanta', 'Jurga', 'Karolina',
  'Kristina', 'Laura', 'Lina', 'Loreta', 'Milda', 'Monika', 'Neringa',
  'Nomeda', 'Odeta', 'Paulina', 'Raimonda', 'Rasa', 'Rita', 'Rūta',
  'Sandra', 'Sigita', 'Simona', 'Sonata', 'Toma', 'Vaida', 'Vida',
  'Vilma', 'Virginija', 'Živilė', 'Žydrė', 'Asta', 'Edita', 'Gabija',
  'Inga', 'Jurgita', 'Lijana', 'Mažvydė', 'Natalija', 'Orinta', 'Raminta',
  'Saulė', 'Silvija', 'Ugnė', 'Vaidilutė', 'Viktorija'
];

const lastNames = [
  'Kazlauskienė', 'Jankauskienė', 'Petrauskienė', 'Stankevičienė', 'Vasiliauskenė',
  'Žukauskienė', 'Butkienė', 'Paulauskienė', 'Urbonavičienė', 'Kavaliauskenė',
  'Rimkienė', 'Balčiūnienė', 'Gudaitienė', 'Mačiulienė', 'Navickienė',
  'Savickienė', 'Žilinskienė', 'Černiauskienė', 'Vaitkevičienė', 'Grigorjevienė',
  'Tamošiūnienė', 'Jonauskienė', 'Morkūnienė', 'Abraitienė', 'Mockienė',
  'Laukaitienė', 'Šimkienė', 'Bartkienė', 'Grigaliūnienė', 'Misiūnienė'
];

const cities = [
  { name: 'Vilnius', phone: '+370 5', region: 'Vilniaus' },
  { name: 'Kaunas', phone: '+370 37', region: 'Kauno' },
  { name: 'Klaipėda', phone: '+370 46', region: 'Klaipėdos' },
  { name: 'Šiauliai', phone: '+370 41', region: 'Šiaulių' },
  { name: 'Panevėžys', phone: '+370 45', region: 'Panevėžio' },
  { name: 'Alytus', phone: '+370 315', region: 'Alytaus' },
  { name: 'Marijampolė', phone: '+370 343', region: 'Marijampolės' },
  { name: 'Utena', phone: '+370 389', region: 'Utenos' },
  { name: 'Telšiai', phone: '+370 444', region: 'Telšių' },
  { name: 'Tauragė', phone: '+370 446', region: 'Tauragės' },
];

const ageRanges = ['0-3 m.', '1-5 m.', '0-6 m.', '2-6 m.', '1-3 m.', '0-7 m.', '3-6 m.'];
const languages = ['Lietuvių', 'Lietuvių, anglų', 'Lietuvių, rusų', 'Lietuvių, anglų, rusų'];
const availability = ['Pilnas etatas', 'Pusė etato', 'Valandinė', 'Pilnas etatas, savaitgaliai', 'Lanksčios valandos'];
const experience = ['2 metai', '3 metai', '5 metai', '7 metai', '10+ metų', '4 metai', '6 metai', '8 metai', '15+ metų'];

const descTemplates = [
  (name, city, exp) => `${name} — patyrusi auklė ${city} mieste. ${exp} darbo su vaikais patirtis. Teikia individualias priežiūros paslaugas, organizuoja lavinamuosius užsiėmimus pagal vaiko amžių ir poreikius.`,
  (name, city, exp) => `Profesionali auklė ${name}, dirbanti ${city} mieste. Turinti ${exp.toLowerCase()} patirties vaikų priežiūros srityje. Siūlo lankstų grafiką ir individualų požiūrį į kiekvieną vaiką.`,
  (name, city, exp) => `${name} — kvalifikuota vaikų auklė, teikianti paslaugas ${city} mieste ir apylinkėse. Patirtis: ${exp.toLowerCase()}. Ugdo vaikus per žaidimus, meną ir kūrybiškas veiklas.`,
  (name, city, exp) => `Auklė ${name} iš ${city}. ${exp} profesinės patirties su įvairaus amžiaus vaikais. Specializuojasi ankstyvojo ugdymo metodikose. Pirma pagalba vaikams — sertifikuota.`,
  (name, city, exp) => `${name} — ${city} auklė su ${exp.toLowerCase()} patirtimi. Dirba su vaikais nuo kūdikystės iki priešmokyklinio amžiaus. Teikia saugią ir šiltą aplinką vaikų vystymuisi.`,
];

async function main() {
  const existing = await prisma.aukle.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map(a => a.slug));

  const aukles = [];
  for (let i = 0; i < 55; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const city = cities[i % cities.length];
    const exp = experience[i % experience.length];
    const rate = 8 + Math.floor(Math.random() * 8); // 8-15
    const rateStr = `${rate}-${rate + 2} €/val.`;

    let slug = slugify(name);
    if (existingSlugs.has(slug)) slug = slug + '-' + city.name.toLowerCase().replace(/[^a-z]/g, '');
    if (existingSlugs.has(slug)) slug = slug + '-' + (i + 1);
    existingSlugs.add(slug);

    const phone = city.phone + ' ' + (60 + Math.floor(Math.random() * 30)) + ' ' + (100 + Math.floor(Math.random() * 900));
    const desc = descTemplates[i % descTemplates.length](name, city.name, exp);

    aukles.push({
      slug,
      name,
      city: city.name,
      region: city.region,
      phone,
      email: `${slugify(firstName)}.${slugify(lastName)}@gmail.com`,
      experience: exp,
      ageRange: ageRanges[i % ageRanges.length],
      hourlyRate: rateStr,
      languages: languages[i % languages.length],
      description: desc,
      availability: availability[i % availability.length],
      baseRating: +(3.5 + Math.random() * 1.5).toFixed(1),
      baseReviewCount: Math.floor(Math.random() * 15) + 1,
    });
  }

  let created = 0;
  for (const a of aukles) {
    try {
      await prisma.aukle.create({ data: a });
      created++;
    } catch (e) {
      console.log(`Skip ${a.name}: ${e.message.substring(0, 60)}`);
    }
  }

  const total = await prisma.aukle.count();
  console.log(`Created ${created} aukles. Total: ${total}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
