const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(text) {
  return text.toLowerCase()
    .replace(/[ąà]/g, 'a').replace(/[čć]/g, 'c').replace(/[ęè]/g, 'e')
    .replace(/[ėē]/g, 'e').replace(/[įì]/g, 'i').replace(/[šś]/g, 's')
    .replace(/[ųùū]/g, 'u').replace(/[žź]/g, 'z')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const cities = [
  { name: 'Vilnius', phone: '+370 5', region: 'Vilniaus' },
  { name: 'Kaunas', phone: '+370 37', region: 'Kauno' },
  { name: 'Klaipėda', phone: '+370 46', region: 'Klaipėdos' },
  { name: 'Šiauliai', phone: '+370 41', region: 'Šiaulių' },
  { name: 'Panevėžys', phone: '+370 45', region: 'Panevėžio' },
  { name: 'Alytus', phone: '+370 315', region: 'Alytaus' },
  { name: 'Marijampolė', phone: '+370 343', region: 'Marijampolės' },
  { name: 'Utena', phone: '+370 389', region: 'Utenos' },
  { name: 'Druskininkai', phone: '+370 313', region: 'Alytaus' },
  { name: 'Palanga', phone: '+370 460', region: 'Klaipėdos' },
];

const clubs = [
  // Sportas
  { name: 'Mažųjų krepšinio akademija', cat: 'Sportas', sub: 'Krepšinis', age: '5-12 m.', price: '40-60 €/mėn.', sched: 'Pir, Tre, Pen 16:00-17:30' },
  { name: 'Futbolo mokykla „Kamuolys"', cat: 'Sportas', sub: 'Futbolas', age: '4-10 m.', price: '35-55 €/mėn.', sched: 'Ant, Ket 16:00-17:30' },
  { name: 'Plaukimo klubas „Delfinas"', cat: 'Sportas', sub: 'Plaukimas', age: '4-14 m.', price: '50-70 €/mėn.', sched: 'Pir, Tre, Pen 15:30-17:00' },
  { name: 'Gimnastikos studija „Lankstumas"', cat: 'Sportas', sub: 'Gimnastika', age: '3-10 m.', price: '45-65 €/mėn.', sched: 'Ant, Ket, Šeš 15:00-16:30' },
  { name: 'Teniso akademija „Raketė"', cat: 'Sportas', sub: 'Tenisas', age: '5-14 m.', price: '55-80 €/mėn.', sched: 'Pir, Tre 16:00-17:30' },
  { name: 'Dziudo klubas „Jėga"', cat: 'Sportas', sub: 'Dziudo', age: '5-12 m.', price: '40-55 €/mėn.', sched: 'Ant, Ket, Šeš 16:00-17:30' },
  { name: 'Ledo ritulio mokykla', cat: 'Sportas', sub: 'Ledo ritulys', age: '5-14 m.', price: '60-90 €/mėn.', sched: 'Pir, Tre, Pen 17:00-18:30' },
  // Muzika
  { name: 'Muzikos studija „Do Re Mi"', cat: 'Muzika', sub: 'Muzikos pamokos', age: '4-12 m.', price: '50-70 €/mėn.', sched: 'Pir, Tre 15:00-16:00' },
  { name: 'Fortepijono pamokos „Klavišai"', cat: 'Muzika', sub: 'Fortepijonas', age: '5-15 m.', price: '60-80 €/mėn.', sched: 'Ant, Ket 15:00-16:00' },
  { name: 'Gitaros studija „Stygos"', cat: 'Muzika', sub: 'Gitara', age: '6-16 m.', price: '45-65 €/mėn.', sched: 'Pir, Pen 16:00-17:00' },
  { name: 'Vaikų choras „Melodija"', cat: 'Muzika', sub: 'Choras', age: '5-14 m.', price: '30-40 €/mėn.', sched: 'Ant, Ket 16:00-17:30' },
  { name: 'Smuiko pamokos „Arco"', cat: 'Muzika', sub: 'Smuikas', age: '5-14 m.', price: '55-75 €/mėn.', sched: 'Pir, Tre 15:30-16:30' },
  // Menas
  { name: 'Dailės studija „Spalvų pasaulis"', cat: 'Menas', sub: 'Dailė', age: '4-12 m.', price: '40-55 €/mėn.', sched: 'Ant, Ket 15:00-16:30' },
  { name: 'Keramikos dirbtuvės „Molio bičiuliai"', cat: 'Menas', sub: 'Keramika', age: '5-14 m.', price: '45-65 €/mėn.', sched: 'Šeš 10:00-12:00' },
  { name: 'Fotografijos būrelis „Kadras"', cat: 'Menas', sub: 'Fotografija', age: '8-16 m.', price: '40-55 €/mėn.', sched: 'Pen 15:00-17:00' },
  { name: 'Teatro studija „Kaukė"', cat: 'Menas', sub: 'Teatras', age: '5-14 m.', price: '35-50 €/mėn.', sched: 'Tre, Pen 16:00-17:30' },
  // Šokiai
  { name: 'Šokių studija „Ritmas"', cat: 'Šokiai', sub: 'Šiuolaikinis šokis', age: '4-14 m.', price: '40-60 €/mėn.', sched: 'Pir, Tre 16:00-17:00' },
  { name: 'Baleto studija „Gulbė"', cat: 'Šokiai', sub: 'Baletas', age: '3-12 m.', price: '50-70 €/mėn.', sched: 'Ant, Ket 15:30-16:30' },
  { name: 'Hip-hop studija „Gatvės šokis"', cat: 'Šokiai', sub: 'Hip-hop', age: '6-16 m.', price: '40-55 €/mėn.', sched: 'Pir, Tre, Pen 17:00-18:00' },
  { name: 'Liaudies šokių būrelis „Ratelis"', cat: 'Šokiai', sub: 'Liaudies šokiai', age: '5-14 m.', price: '25-40 €/mėn.', sched: 'Ant, Ket 16:00-17:30' },
  // Robotika / STEAM
  { name: 'LEGO robotikos klubas', cat: 'Robotika', sub: 'LEGO robotika', age: '6-12 m.', price: '55-75 €/mėn.', sched: 'Šeš 10:00-12:00' },
  { name: 'Programavimo akademija „Kodas"', cat: 'Robotika', sub: 'Programavimas', age: '7-16 m.', price: '60-80 €/mėn.', sched: 'Šeš 13:00-15:00' },
  { name: 'STEAM laboratorija „Eureka"', cat: 'Robotika', sub: 'STEAM', age: '5-12 m.', price: '50-70 €/mėn.', sched: 'Pir, Tre 16:00-17:30' },
  { name: '3D spausdinimo studija', cat: 'Robotika', sub: '3D modeliavimas', age: '8-16 m.', price: '55-75 €/mėn.', sched: 'Pen, Šeš 14:00-16:00' },
  // Kalbos
  { name: 'Anglų kalbos studija „English Kids"', cat: 'Kalbos', sub: 'Anglų kalba', age: '4-12 m.', price: '50-70 €/mėn.', sched: 'Pir, Tre 15:00-16:00' },
  { name: 'Vokiečių kalbos būrelis „Deutsch"', cat: 'Kalbos', sub: 'Vokiečių kalba', age: '6-14 m.', price: '45-65 €/mėn.', sched: 'Ant, Ket 16:00-17:00' },
  { name: 'Prancūzų kalbos studija „Bonjour"', cat: 'Kalbos', sub: 'Prancūzų kalba', age: '5-14 m.', price: '50-70 €/mėn.', sched: 'Tre, Pen 15:30-16:30' },
  // Gamta / edukacija
  { name: 'Gamtos tyrėjų klubas „Žalioji laboratorija"', cat: 'Edukacija', sub: 'Gamtos mokslai', age: '5-12 m.', price: '40-55 €/mėn.', sched: 'Šeš 10:00-12:00' },
];

const descTemplates = [
  (name, city, cat, age) => `${name} — ${cat.toLowerCase()} būrelis ${city} mieste vaikams ${age}. Profesionalūs mokytojai, individuali programa, draugiška aplinka.`,
  (name, city, cat, age) => `Kviečiame vaikus ${age} į ${name} ${city} mieste! ${cat} užsiėmimai, skatinantys vaikų kūrybiškumą ir fizinį aktyvumą.`,
  (name, city, cat, age) => `${name} ${city} — ${cat.toLowerCase()} užsiėmimai vaikams nuo ${age.split('-')[0]} metų. Maži grupės, patyrę vadovai, šiuolaikinė įranga.`,
];

async function main() {
  const existing = await prisma.burelis.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map(b => b.slug));

  let created = 0;
  for (let i = 0; i < 55; i++) {
    const club = clubs[i % clubs.length];
    const city = cities[i % cities.length];
    const nameFull = i < clubs.length ? `${club.name} — ${city.name}` : `${club.name} ${city.name}`;

    let slug = slugify(nameFull);
    if (existingSlugs.has(slug)) slug = slug + '-' + (i + 1);
    if (existingSlugs.has(slug)) continue;
    existingSlugs.add(slug);

    const phone = city.phone + ' ' + (60 + Math.floor(Math.random() * 30)) + ' ' + (100 + Math.floor(Math.random() * 900));
    const desc = descTemplates[i % descTemplates.length](club.name, city.name, club.cat, club.age);

    try {
      await prisma.burelis.create({
        data: {
          slug,
          name: nameFull,
          city: city.name,
          region: city.region,
          category: club.cat,
          subcategory: club.sub,
          ageRange: club.age,
          price: club.price,
          schedule: club.sched,
          phone,
          website: `https://${slugify(club.name)}.lt`,
          description: desc,
          baseRating: +(3.5 + Math.random() * 1.5).toFixed(1),
          baseReviewCount: Math.floor(Math.random() * 12) + 1,
        }
      });
      created++;
    } catch (e) {
      console.log(`Skip ${nameFull}: ${e.message.substring(0, 60)}`);
    }
  }

  const total = await prisma.burelis.count();
  console.log(`Created ${created} bureliai. Total: ${total}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
