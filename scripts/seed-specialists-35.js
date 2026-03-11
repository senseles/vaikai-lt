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
];

const specialists = [
  // Logopedai
  { name: 'Logopedė Rūta Kazlauskienė', spec: 'Logopedas', clinic: 'Privati praktika', price: '25-35 €/vizitas' },
  { name: 'Logopedė Asta Jankauskienė', spec: 'Logopedas', clinic: 'Kalbos centras „Žodis"', price: '30-40 €/vizitas' },
  { name: 'Logopedė Vilma Petrauskienė', spec: 'Logopedas', clinic: 'Vaikų kalbos klinika', price: '25-35 €/vizitas' },
  { name: 'Logopedė Daiva Butkienė', spec: 'Logopedas', clinic: 'Privati praktika', price: '20-30 €/vizitas' },
  { name: 'Logopedė Neringa Rimkienė', spec: 'Logopedas', clinic: 'Logopedinė pagalba', price: '25-40 €/vizitas' },
  // Psichologai
  { name: 'Psichologė Ieva Stankevičiūtė', spec: 'Psichologas', clinic: 'Vaikų psichologijos centras', price: '40-60 €/vizitas' },
  { name: 'Psichologė Laura Navickienė', spec: 'Psichologas', clinic: 'Šeimos harmonija', price: '35-55 €/vizitas' },
  { name: 'Psichologas Marius Gudaitis', spec: 'Psichologas', clinic: 'Privati praktika', price: '40-50 €/vizitas' },
  { name: 'Psichologė Jūratė Savickienė', spec: 'Psichologas', clinic: 'Vaikų emocinės sveikatos centras', price: '35-50 €/vizitas' },
  { name: 'Psichologė Kristina Žilinskienė', spec: 'Psichologas', clinic: 'Privati praktika', price: '30-45 €/vizitas' },
  // Ergoterapeutai
  { name: 'Ergoterapeutė Sigita Mačiulienė', spec: 'Ergoterapeutas', clinic: 'Ergoterapijos centras „Rankutės"', price: '30-45 €/vizitas' },
  { name: 'Ergoterapeutė Monika Vaitkevičienė', spec: 'Ergoterapeutas', clinic: 'Vaikų reabilitacijos centras', price: '25-40 €/vizitas' },
  { name: 'Ergoterapeutė Dovilė Tamošiūnienė', spec: 'Ergoterapeutas', clinic: 'Privati praktika', price: '30-40 €/vizitas' },
  { name: 'Ergoterapeutas Tomas Jonauskis', spec: 'Ergoterapeutas', clinic: 'Sensorinės integracijos kabinetas', price: '35-50 €/vizitas' },
  // Kineziterapeutai
  { name: 'Kineziterapeutė Eglė Černiauskienė', spec: 'Kineziterapeutas', clinic: 'Vaikų judėjimo centras', price: '25-40 €/vizitas' },
  { name: 'Kineziterapeutas Andrius Balčiūnas', spec: 'Kineziterapeutas', clinic: 'Privati praktika', price: '30-45 €/vizitas' },
  { name: 'Kineziterapeutė Sonata Grigorjevienė', spec: 'Kineziterapeutas', clinic: 'Reabilitacijos klinika „Judėk"', price: '25-35 €/vizitas' },
  // Specialieji pedagogai
  { name: 'Spec. pedagogė Jolanta Morkūnienė', spec: 'Specialusis pedagogas', clinic: 'PPT centras', price: '20-35 €/vizitas' },
  { name: 'Spec. pedagogė Indrė Abraitienė', spec: 'Specialusis pedagogas', clinic: 'Vaiko raidos centras', price: '25-35 €/vizitas' },
  { name: 'Spec. pedagogė Vida Mockienė', spec: 'Specialusis pedagogas', clinic: 'Privati praktika', price: '20-30 €/vizitas' },
  // Vaikų neurologai
  { name: 'Neurologė dr. Sandra Laukaitienė', spec: 'Neurologas', clinic: 'Vaikų neurologijos klinika', price: '50-70 €/vizitas' },
  { name: 'Neurologas dr. Paulius Šimkus', spec: 'Neurologas', clinic: 'Privati klinika „Nervų sveikata"', price: '45-65 €/vizitas' },
  // Psichoterapeutai
  { name: 'Psichoterapeutė Gabija Bartkienė', spec: 'Psichoterapeutas', clinic: 'Vaikų psichoterapijos kabinetas', price: '45-65 €/vizitas' },
  { name: 'Psichoterapeutas Dainius Grigaliūnas', spec: 'Psichoterapeutas', clinic: 'Šeimos terapijos centras', price: '50-70 €/vizitas' },
  // Dietologai
  { name: 'Dietologė Simona Misiūnienė', spec: 'Dietologas', clinic: 'Vaikų mitybos kabinetas', price: '35-50 €/vizitas' },
  // Oftalmologai
  { name: 'Oftalmologė dr. Raimonda Paulauskienė', spec: 'Oftalmologas', clinic: 'Vaikų akių klinika', price: '40-60 €/vizitas' },
  // Alergologai
  { name: 'Alergologė dr. Živilė Žukauskienė', spec: 'Alergologas', clinic: 'Vaikų alergologijos centras', price: '45-60 €/vizitas' },
  // Ortodontai
  { name: 'Ortodontė dr. Vaida Kavaliauskenė', spec: 'Ortodontas', clinic: 'Vaikų ortodontijos kabinetas', price: '40-80 €/vizitas' },
  // Logopedas papildomas
  { name: 'Logopedė Edita Urbonavičienė', spec: 'Logopedas', clinic: 'Kalbos terapijos centras „Aidas"', price: '25-35 €/vizitas' },
  { name: 'Logopedė Giedrė Šimkienė', spec: 'Logopedas', clinic: 'Privati praktika', price: '20-30 €/vizitas' },
  // Sensorinės integracijos specialistas
  { name: 'Sensorinės integracijos spec. Lijana Jonauskienė', spec: 'Sensorinės integracijos specialistas', clinic: 'SI centras „Pojūčiai"', price: '30-45 €/vizitas' },
  // ABA terapeutas
  { name: 'ABA terapeutė Raminta Mažvydienė', spec: 'ABA terapeutas', clinic: 'Elgesio terapijos centras', price: '35-50 €/vizitas' },
  // Pediatras
  { name: 'Pediatrė dr. Orinta Paulavičienė', spec: 'Pediatras', clinic: 'Šeimos klinika', price: '30-50 €/vizitas' },
  { name: 'Pediatras dr. Vytautas Rimkus', spec: 'Pediatras', clinic: 'Vaikų sveikatos centras', price: '35-55 €/vizitas' },
  { name: 'Pediatrė dr. Aušra Balčiūnienė', spec: 'Pediatras', clinic: 'Privati praktika', price: '30-45 €/vizitas' },
];

const descTemplates = [
  (s, city) => `${s.name} — ${s.spec.toLowerCase()} ${city} mieste, klinika „${s.clinic}". Teikia profesionalias paslaugas vaikams. Konsultacijos kaina: ${s.price}.`,
  (s, city) => `Patyręs ${s.spec.toLowerCase()} ${city} mieste. ${s.name} dirba ${s.clinic}. Individuali diagnostika ir gydymo planai vaikams.`,
  (s, city) => `${s.name}, ${s.spec.toLowerCase()}, priima pacientus ${city} mieste (${s.clinic}). Specializacija — vaikų sveikata ir raida.`,
];

async function main() {
  const existing = await prisma.specialist.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map(s => s.slug));

  let created = 0;
  for (let i = 0; i < specialists.length; i++) {
    const spec = specialists[i];
    const city = cities[i % cities.length];
    const nameFull = `${spec.name} — ${city.name}`;

    let slug = slugify(nameFull);
    if (existingSlugs.has(slug)) slug = slug + '-' + (i + 1);
    if (existingSlugs.has(slug)) continue;
    existingSlugs.add(slug);

    const phone = city.phone + ' ' + (60 + Math.floor(Math.random() * 30)) + ' ' + (100 + Math.floor(Math.random() * 900));
    const desc = descTemplates[i % descTemplates.length](spec, city.name);

    try {
      await prisma.specialist.create({
        data: {
          slug,
          name: nameFull,
          city: city.name,
          region: city.region,
          specialty: spec.spec,
          clinic: spec.clinic,
          price: spec.price,
          phone,
          languages: 'Lietuvių',
          description: desc,
          baseRating: +(3.8 + Math.random() * 1.2).toFixed(1),
          baseReviewCount: Math.floor(Math.random() * 10) + 1,
        }
      });
      created++;
    } catch (e) {
      console.log(`Skip ${nameFull}: ${e.message.substring(0, 60)}`);
    }
  }

  const total = await prisma.specialist.count();
  console.log(`Created ${created} specialists. Total: ${total}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
