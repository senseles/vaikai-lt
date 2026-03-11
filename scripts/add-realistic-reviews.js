const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Realistic Lithuanian first names for review authors
const FEMALE_NAMES = [
  'Aistė', 'Agnė', 'Asta', 'Austėja', 'Birutė', 'Daiva', 'Dalia', 'Diana',
  'Dovilė', 'Edita', 'Eglė', 'Elena', 'Emilija', 'Eva', 'Gabrielė', 'Giedrė',
  'Gintarė', 'Ieva', 'Ilona', 'Indrė', 'Inga', 'Irma', 'Jolanta', 'Jovita',
  'Jurgita', 'Jurga', 'Justė', 'Karolina', 'Kristina', 'Laura', 'Lina', 'Lina',
  'Loreta', 'Milda', 'Monika', 'Natalija', 'Neringa', 'Nijolė', 'Oksana',
  'Ona', 'Paulina', 'Raimonda', 'Ramunė', 'Rasa', 'Renata', 'Rima', 'Rita',
  'Rūta', 'Sandra', 'Sigita', 'Simona', 'Sonata', 'Vaida', 'Vida', 'Vilma',
  'Violeta', 'Viktorija', 'Živilė',
];

const MALE_NAMES = [
  'Andrius', 'Arnas', 'Artūras', 'Dainius', 'Darius', 'Donatas', 'Edgaras',
  'Giedrius', 'Gintaras', 'Jonas', 'Justinas', 'Karolis', 'Kęstutis', 'Linas',
  'Lukas', 'Mantas', 'Marius', 'Mindaugas', 'Nerijus', 'Paulius', 'Povilas',
  'Ramunas', 'Robertas', 'Rokas', 'Rolandas', 'Rytis', 'Saulius', 'Tadas',
  'Tomas', 'Valdas', 'Vaidas', 'Vytautas',
];

// Review templates categorized by rating and topic
const REVIEW_TEMPLATES = {
  kindergarten: {
    5: [
      'Puikus darželis! Vaikas eina su džiaugsmu kiekvieną rytą. Auklėtojos labai rūpestingos ir dėmesingos.',
      'Labai patenkinti šiuo darželiu. Maistas skanus, aplinka švari, vaikai nuolat užsiima įdomiomis veiklomis.',
      'Rekomenduoju visiems tėvams! Mūsų vaikas čia lankosi jau antrus metus ir labai patenkintas. Auklėtojos nuostabios.',
      'Geriausias darželis mieste! Vaikai mokosi per žaidimus, daug laiko praleidžia lauke. Personalas draugiškas.',
      'Nuostabus darželis su atsidavusiu kolektyvu. Vaikas grįžta namo laimingas ir pasakoja apie dienos nuotykius.',
      'Esame labai patenkinti. Darželis turi puikią lauko aikštelę, vaikai daug judėjo ir sportavo.',
      'Mūsų dukra čia lanko jau trečius metus. Auklėtojos tikrai mylintys savo darbą žmonės. Ačiū!',
      'Fantastiškas darželis! Maitinimas puikus, viskas šviežia ir namų gamybos. Vaikas valgo su apetitu.',
      'Labai gerai organizuotas ugdymo procesas. Vaikas greitai išmoko skaityti ir skaičiuoti. Rekomenduoju.',
      'Šis darželis — tikras lobis. Auklėtojos individualiai dirba su kiekvienu vaiku, pastebi jo poreikius.',
    ],
    4: [
      'Geras darželis, vaikai prižiūrimi gerai. Kartais trūksta vietos lauke, bet bendrai patenkinti.',
      'Patinka darželis, bet norėtųsi daugiau kūrybinių veiklų. Auklėtojos geranoriškos ir kantriosios.',
      'Solidus darželis su geru kolektyvu. Maistas kartais galėtų būti įvairesnis, bet vaikas valgo.',
      'Gerai organizuotas darželis. Vienintelis trūkumas — parkavimas prie darželio sudėtingas rytais.',
      'Mūsų sūnus eina noriai. Auklėtojos kompetentingos, tik informacijos apie vaiko dieną galėtų duoti daugiau.',
      'Darželis tvarkingas, vaikai saugūs. Norėtųsi modernesnių žaislų ir priemonių, bet personalas puikus.',
      'Patenkintas darželiu. Vaikai daug laiko praleidžia lauke, mokosi gamtos pažinimo. Tik grupės per didelės.',
      'Geras darželis, normalios kainos. Auklėtojos stengiasi, bet kartais jaučiasi, kad vaikų per daug vienai auklėtojai.',
      'Bendrai gerai. Vaikas adaptuojasi greitai, auklėtojos padėjo pereiti sunkų prisitaikymo laikotarpį.',
      'Darželis atitinka lūkesčius. Maistas geras, veiklos įdomios. Kartais norėtųsi daugiau anglų kalbos pamokų.',
    ],
    3: [
      'Vidutinis darželis. Nieko ypatingo, bet ir nieko blogo. Vaikas eina be problemų.',
      'Galėtų būti geriau. Auklėtojos keičiasi per dažnai, vaikams sunku priprasti.',
      'Darželis normalus, bet aplinka galėtų būti modernesnė. Žaislai seni, bet vaikai vis tiek žaidžia.',
      'Maistas galėtų būti geresnis. Vaikas dažnai sako, kad buvo neskanu. Bet auklėtojos geros.',
      'Tris žvaigždutes, nes darželis senokas ir reikia remonto. Bet personalas stengiasi.',
    ],
  },
  aukle: {
    5: [
      'Nuostabi auklė! Vaikas ją labai myli ir visada laukia jos atėjimo. Patikima ir atsakinga.',
      'Rekomenduoju šią auklę be jokių abejonių. Profesionali, punktuali, su vaikais elgiasi šiltai.',
      'Geriausia auklė, kokią turėjome. Mūsų mažylis ją tiesiog dievina. Ačiū už rūpestį!',
      'Puiki auklė! Visada randa kūrybingų užsiėmimų vaikams. Vaikai su ja nenuobodžiauja.',
      'Labai patenkinti! Auklė atsakinga, visada informuoja apie vaiko dieną. Jaučiamės saugūs.',
    ],
    4: [
      'Gera auklė, vaikai ją mėgsta. Kartais vėluoja, bet su vaikais elgiasi puikiai.',
      'Patenkinti auklės darbu. Vaikas su ja jaučiasi gerai. Kaina adekvati paslaugos kokybei.',
      'Auklė kompetentinga ir maloni. Norėtųsi, kad daugiau laiko skirtų ugdomosioms veikloms.',
      'Solidus pasirinkimas. Auklė atsakinga ir rūpestinga, vaikas grįžta namo patenkintas.',
    ],
    3: [
      'Normali auklė. Vaikus prižiūri, bet iniciatyvos trūksta. Tikėjausi daugiau.',
      'Auklė geranoriška, bet patirties trūksta. Su laiku, manau, bus geriau.',
    ],
  },
  burelis: {
    5: [
      'Puikus būrelis! Vaikas labai mėgsta lankyti ir visada laukia kito užsiėmimo.',
      'Rekomenduoju! Mokytojai profesionalūs, užsiėmimai įdomūs ir turiningi.',
      'Vaikas per trumpą laiką labai daug išmoko. Būrelio vadovai tikri profesionalai.',
      'Nuostabi vieta vaikų laisvalaikui! Kūrybinga atmosfera ir geros kainos.',
    ],
    4: [
      'Geras būrelis, vaikai mokosi daug naujų dalykų. Tik grupės galėtų būti mažesnės.',
      'Patinka būrelio programa. Vaikai aktyvūs ir užsiėmę. Kaina normali.',
      'Solidus būrelis su gerais vadovais. Vaikas eina noriai kiekvieną kartą.',
    ],
    3: [
      'Vidutinis būrelis. Programa galėtų būti įdomesnė. Bet vaikui patinka bendrauti.',
      'Normalus būrelis, bet tikėjausi daugiau. Mokytojas kartais keičiasi.',
    ],
  },
  specialist: {
    5: [
      'Puikus specialistas! Po kelių užsiėmimų pastebėjome didelę pažangą. Labai rekomenduoju.',
      'Profesionalus ir empatiškas specialistas. Vaikas jaučiasi saugiai ir noriai eina į konsultacijas.',
      'Ačiū už pagalbą! Specialistas tikrai žino savo darbą. Rezultatai matomi greitai.',
      'Nuostabus specialistas. Individualus požiūris į kiekvieną vaiką. Labai patenkinti.',
    ],
    4: [
      'Geras specialistas, kompetentingas. Tik eilės ilgos, sunku gauti laiką.',
      'Patenkinti konsultacijomis. Specialistas profesionalus ir kantriai dirba su vaikais.',
      'Solidus specialistas. Vaikas padarė didelę pažangą per kelis mėnesius.',
    ],
    3: [
      'Normalus specialistas. Rezultatai lėtai, bet matosi. Kaina galėtų būti mažesnė.',
    ],
  },
};

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomName() {
  if (Math.random() > 0.3) {
    return randomElement(FEMALE_NAMES);
  }
  return randomElement(MALE_NAMES);
}

function randomRating() {
  // Weighted: mostly 4-5, some 3
  const r = Math.random();
  if (r < 0.45) return 5;
  if (r < 0.85) return 4;
  return 3;
}

function randomDate() {
  // Random date in last 2 years
  const now = new Date();
  const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
  return new Date(twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime()));
}

async function main() {
  // Get entities that don't have enough reviews
  const models = [
    { name: 'kindergarten', fn: () => prisma.kindergarten.findMany({ select: { id: true, name: true, city: true } }) },
    { name: 'aukle', fn: () => prisma.aukle.findMany({ select: { id: true, name: true, city: true } }) },
    { name: 'burelis', fn: () => prisma.burelis.findMany({ select: { id: true, name: true, city: true } }) },
    { name: 'specialist', fn: () => prisma.specialist.findMany({ select: { id: true, name: true, city: true } }) },
  ];

  // Get current review counts per entity
  const existingReviews = await prisma.review.groupBy({
    by: ['itemId', 'itemType'],
    _count: true,
  });
  const reviewCountMap = new Map();
  existingReviews.forEach(r => reviewCountMap.set(`${r.itemType}:${r.itemId}`, r._count));

  const reviewsToCreate = [];

  for (const model of models) {
    const entities = await model.fn();

    for (const entity of entities) {
      const key = `${model.name}:${entity.id}`;
      const currentCount = reviewCountMap.get(key) || 0;

      // Add reviews for entities with few or no reviews
      // Target: 2-5 reviews per entity, but don't exceed that
      const target = 2 + Math.floor(Math.random() * 4); // 2-5
      const needed = Math.max(0, target - currentCount);

      if (needed > 0) {
        const templates = REVIEW_TEMPLATES[model.name];
        for (let i = 0; i < needed; i++) {
          const rating = randomRating();
          const ratingTemplates = templates[rating] || templates[Math.min(rating + 1, 5)] || templates[5];
          const text = randomElement(ratingTemplates);

          reviewsToCreate.push({
            itemId: entity.id,
            itemType: model.name,
            authorName: randomName(),
            rating,
            text,
            isApproved: true,
            createdAt: randomDate(),
          });
        }
      }
    }
  }

  console.log(`Reviews to create: ${reviewsToCreate.length}`);

  // Batch create
  if (reviewsToCreate.length > 0) {
    const batchSize = 100;
    let created = 0;
    for (let i = 0; i < reviewsToCreate.length; i += batchSize) {
      const batch = reviewsToCreate.slice(i, i + batchSize);
      await prisma.review.createMany({ data: batch });
      created += batch.length;
      console.log(`Created ${created}/${reviewsToCreate.length} reviews...`);
    }
  }

  // Update baseReviewCount and baseRating for all entities
  for (const model of models) {
    const entities = await model.fn();
    let updated = 0;

    for (const entity of entities) {
      const reviews = await prisma.review.findMany({
        where: { itemId: entity.id, itemType: model.name, isApproved: true },
        select: { rating: true },
      });

      if (reviews.length > 0) {
        const avgRating = Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;
        await prisma[model.name].update({
          where: { id: entity.id },
          data: { baseReviewCount: reviews.length, baseRating: avgRating },
        });
        updated++;
      }
    }
    console.log(`${model.name}: updated baseReviewCount/baseRating for ${updated} entities`);
  }

  // Final counts
  const total = await prisma.review.count();
  const byType = await prisma.review.groupBy({ by: ['itemType'], _count: true });
  console.log(`\nFinal total reviews: ${total}`);
  console.log('By type:', byType.map(t => `${t.itemType}: ${t._count}`).join(', '));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
