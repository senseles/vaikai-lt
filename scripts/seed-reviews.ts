import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Expanded realistic Lithuanian review templates for variety
const reviewTemplates = {
  kindergarten: {
    positive: [
      { rating: 5, names: ['Rūta M.', 'Aistė K.', 'Greta P.', 'Simona V.', 'Laura B.'], texts: [
        'Puikus darželis! Vaikai labai patenkinti, auklėtojos rūpestingos ir profesionalios. Rekomenduoju visiems tėveliams.',
        'Lankome jau antrus metus ir esame labai patenkinti. Maistas sveikas, patalpos švarios, programa įdomi.',
        'Mūsų vaikas pradėjo lankyti prieš pusmetį ir pokytis akivaizdus — kalba geriau, draugauja su kitais vaikais. Ačiū auklėtojoms!',
        'Labai geras darželis, vaikai gauna daug dėmesio. Aplinka jauki ir saugi.',
        'Esame patenkinti pasirinkimu. Auklėtojos labai stengiasi, vaikas nori eiti kiekvieną rytą.',
      ]},
      { rating: 4, names: ['Jonas L.', 'Vytautas S.', 'Mindaugas R.', 'Tadas K.', 'Lukas G.'], texts: [
        'Gerai organizuotas darželis, bet kartais trūksta komunikacijos su tėvais. Vis dėlto rekomenduočiau.',
        'Vaikai gerai prižiūrimi, tačiau maitinimas galėtų būti geriau. Bendrai vertinu teigiamai.',
        'Auklėtojos labai stengiasi, bet grupėse per daug vaikų. Kitu atžvilgiu — viskas puiku.',
        'Geras darželis, programa subalansuota. Vaikas daug išmoko per trumpą laiką.',
        'Patenkinti, nors vieta ne visada lengvai pasiekiama. Bet darželis verto!',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Ieva B.', 'Agnė D.', 'Dovilė R.', 'Renata P.'], texts: [
        'Darželis vidutiniškas. Yra ir pliusų, ir minusų. Vieta patogi, bet pastatas senas ir reikalauja remonto.',
        'Auklėtojos malonios, bet programa galėtų būti įdomesnė. Vaikas nenorai eina, bet draugai patinka.',
        'Normalu, bet tikėjomės daugiau. Gal tiesiog ne mūsų stilius.',
        'Nieko ypatingo, bet ir nieko blogo. Standartinis darželis.',
      ]},
    ],
    negative: [
      { rating: 2, names: ['Tomas V.', 'Andrius M.'], texts: [
        'Deja, lūkesčiai nebuvo patenkinti. Grupėje per daug vaikų, o auklėtojos nuolat keičiasi.',
        'Per daug vaikų vienoje grupėje. Individualus dėmesys minimalus.',
      ]},
    ],
  },
  aukle: {
    positive: [
      { rating: 5, names: ['Sandra K.', 'Monika J.', 'Eglė V.', 'Daiva S.', 'Jurgita R.'], texts: [
        'Nuostabi auklė! Vaikai ją myli. Labai atsakinga, punktuali ir kūrybinga. Užsiėmimai visada įdomūs.',
        'Radome per vaikai.lt ir labai džiaugiamės. Auklė puikiai sutaria su mūsų dviem vaikais.',
        'Profesionali, šilta ir rūpestinga. Vaikas visada laimingai laukia jos atėjimo.',
        'Geriausia auklė, kokią teko turėti. Labai rekomenduoju!',
        'Auklė randa bendrą kalbą su vaikais ir moka juos užimti prasmingai.',
      ]},
      { rating: 4, names: ['Paulius G.', 'Ramunė S.', 'Kristina L.', 'Dalia A.'], texts: [
        'Labai gera auklė, patikima ir maloni. Vienintelis minusas — ne visada galima suderinti laikus.',
        'Mūsų vaikui labai patinka su ja. Šiek tiek brangoka, bet kokybė verta kainos.',
        'Atsakinga ir patikima. Vaikai ją labai mėgsta.',
        'Gera auklė, bendravimas sklandus. Rekomenduoju.',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Dalia P.', 'Renata V.', 'Inga T.'], texts: [
        'Auklė šiaip gera, bet ne visuomet laikosi susitarimo dėl laikų. Vaikui patinka, tai pagrindinė priežastis, kodėl tęsiame.',
        'Vidutiniškai. Nieko blogo, bet ir nieko ypatingo.',
        'Normalu. Vaikui patinka, bet norėtųsi daugiau veiklų.',
      ]},
    ],
    negative: [
      { rating: 2, names: ['Gintarė B.'], texts: [
        'Nepavyko rasti bendros kalbos. Auklė buvo nepatikima dėl laiko.',
      ]},
    ],
  },
  burelis: {
    positive: [
      { rating: 5, names: ['Inga M.', 'Jurgita R.', 'Vaida L.', 'Neringa K.', 'Kristina P.'], texts: [
        'Puikus būrelis! Vaikas per mėnesį išmoko daugiau nei tikėjomės. Vadovė labai kompetentinga.',
        'Lankome robotikos būrelį ir vaikas tiesiog susižavėjęs. Kiekvieną savaitę laukia su nekantrumu.',
        'Šokių būrelis — mūsų geriausia investicija. Vaikas tapo drąsesnis, lankstesnis ir laimingesnis.',
        'Labai geras būrelis, vaikas daug ko išmoko. Rekomenduoju!',
        'Meno būrelis tiesiog nuostabus. Vadovė labai kūrybinga ir kantriai dirba su vaikais.',
      ]},
      { rating: 4, names: ['Giedrius T.', 'Lina K.', 'Sigita R.', 'Rima D.'], texts: [
        'Gerai organizuotas būrelis, vaikai gauna daug naujos informacijos. Gal tik per trumpa pamoka.',
        'Meno būrelis labai patinka. Darbai puikūs, bet grupėje galėtų būti mažiau vaikų.',
        'Geras būrelis, tik kaina galėtų būti draugiškesnė.',
        'Vaikai patenkinti, programa įdomi ir struktūruota.',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Artūras B.', 'Virginija S.', 'Edita M.'], texts: [
        'Būrelis neblogas, bet tikėjausi daugiau. Vadovė maloni, tačiau programa galėtų būti struktūruotesnė.',
        'Vidutiniškas. Vaikui nelabai patiko, bet gal tiesiog ne jo sritis.',
        'Norėtųsi geresnės organizacijos ir komunikacijos su tėvais.',
      ]},
    ],
    negative: [
      { rating: 2, names: ['Marius L.'], texts: [
        'Nusivylėme. Programa neįdomi, vaikas nenorėjo tęsti.',
      ]},
    ],
  },
  specialist: {
    positive: [
      { rating: 5, names: ['Neringa V.', 'Kristina A.', 'Rita S.', 'Aušra M.', 'Jolanta K.'], texts: [
        'Logopedė tiesiog nuostabi! Per 3 mėnesius vaikas pradėjo taisyklingai tarti visus garsus. Labai rekomenduoju.',
        'Psichologė padėjo mūsų vaikui įveikti baimę eiti į darželį. Profesionali ir labai maloni.',
        'Kineziterapeutė rado problemą, kurios kiti specialistai nepastebėjo. Labai dėkinga už jos pagalbą.',
        'Puikus specialistas, rezultatai akivaizdūs. Labai rekomenduoju.',
        'Profesionalus ir šiltas požiūris. Vaikas nebijojo eiti į vizitus.',
      ]},
      { rating: 4, names: ['Edvardas P.', 'Justina M.', 'Viktorija S.', 'Milda R.'], texts: [
        'Geras specialistas, padėjo su kalbos problemomis. Tik eilėje reikėjo palaukti ilgiau nei norėtųsi.',
        'Ergoterapeutė labai kompetentinga. Rezultatai matomi, nors progresas lėtas (kas normalu).',
        'Profesionali konsultacija, aiškiai paaiškino situaciją ir planą.',
        'Geras specialistas, bet kaina aukšta. Vis dėlto verta.',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Andrius L.', 'Asta K.', 'Darius V.'], texts: [
        'Specialistas kompetentingas, bet bendravimas su tėvais galėtų būti geresnis. Norėtųsi daugiau paaiškinimų.',
        'Vizitas buvo greitas, norėjosi daugiau laiko ir dėmesio.',
        'Normalu, bet tikėjomės didesnio progreso per tą laiką.',
      ]},
    ],
    negative: [
      { rating: 2, names: ['Rūta G.'], texts: [
        'Ilgas laukimas, trumpas vizitas. Lūkesčiai nepatenkinti.',
      ]},
    ],
  },
};

// Deterministic pseudo-random based on seed string
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

async function seedReviews() {
  console.log('Seeding reviews for ALL items with baseReviewCount > 0...');

  // Delete all existing reviews to start fresh
  const deleted = await prisma.review.deleteMany({});
  console.log(`Deleted ${deleted.count} existing reviews.`);

  // Get ALL items with baseReviewCount > 0
  const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
    prisma.kindergarten.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
    prisma.aukle.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
    prisma.burelis.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
    prisma.specialist.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
  ]);

  console.log(`Items with baseReviewCount > 0: kindergartens=${kindergartens.length}, aukles=${aukles.length}, bureliai=${bureliai.length}, specialists=${specialists.length}`);

  const reviews: Array<{
    itemId: string;
    itemType: string;
    authorName: string;
    rating: number;
    text: string;
    isApproved: boolean;
    createdAt: Date;
  }> = [];

  function generateReviewsForItem(
    item: { id: string; name: string; baseReviewCount: number; baseRating: number },
    itemType: string,
    templates: typeof reviewTemplates.kindergarten,
  ) {
    const numReviews = item.baseReviewCount;
    const targetRating = item.baseRating || 4;
    const rand = seededRandom(item.id);

    const allTemplates = [
      ...templates.positive,
      ...(templates.mixed || []),
      ...(templates.negative || []),
    ];

    for (let i = 0; i < numReviews; i++) {
      // Pick template weighted toward target rating
      let template;
      const r = rand();
      if (targetRating >= 4) {
        if (r < 0.7) template = templates.positive[Math.floor(rand() * templates.positive.length)];
        else if (r < 0.9) template = (templates.mixed || templates.positive)[Math.floor(rand() * (templates.mixed || templates.positive).length)];
        else template = allTemplates[Math.floor(rand() * allTemplates.length)];
      } else if (targetRating >= 3) {
        if (r < 0.4) template = templates.positive[Math.floor(rand() * templates.positive.length)];
        else if (r < 0.7) template = (templates.mixed || templates.positive)[Math.floor(rand() * (templates.mixed || templates.positive).length)];
        else template = allTemplates[Math.floor(rand() * allTemplates.length)];
      } else {
        if (r < 0.3) template = templates.positive[Math.floor(rand() * templates.positive.length)];
        else template = allTemplates[Math.floor(rand() * allTemplates.length)];
      }

      if (!template) template = allTemplates[0];

      const nameIdx = Math.floor(rand() * template.names.length);
      const textIdx = Math.floor(rand() * template.texts.length);

      // Random date in the last 12 months
      const daysAgo = Math.floor(rand() * 365);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(rand() * 14) + 7);
      createdAt.setMinutes(Math.floor(rand() * 60));

      reviews.push({
        itemId: item.id,
        itemType,
        authorName: template.names[nameIdx],
        rating: template.rating,
        text: template.texts[textIdx],
        isApproved: true,
        createdAt,
      });
    }
  }

  for (const item of kindergartens) generateReviewsForItem(item, 'kindergarten', reviewTemplates.kindergarten);
  for (const item of aukles) generateReviewsForItem(item, 'aukle', reviewTemplates.aukle);
  for (const item of bureliai) generateReviewsForItem(item, 'burelis', reviewTemplates.burelis);
  for (const item of specialists) generateReviewsForItem(item, 'specialist', reviewTemplates.specialist);

  console.log(`Total reviews to create: ${reviews.length}`);

  // Batch insert for performance
  const BATCH_SIZE = 100;
  let created = 0;
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    const result = await prisma.review.createMany({ data: batch });
    created += result.count;
    if ((i / BATCH_SIZE) % 10 === 0) {
      console.log(`  Progress: ${created}/${reviews.length} reviews created...`);
    }
  }

  console.log(`Created ${created} reviews total.`);

  // Update baseReviewCount and baseRating on ALL items to match actual approved reviews
  console.log('Updating base review counts and ratings...');

  async function updateCounts(items: Array<{ id: string }>, itemType: string, model: string) {
    for (const item of items) {
      const approvedReviews = await prisma.review.findMany({
        where: { itemId: item.id, itemType, isApproved: true },
        select: { rating: true },
      });
      const count = approvedReviews.length;
      const avg = count > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count
        : 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any)[model].update({
        where: { id: item.id },
        data: {
          baseReviewCount: count,
          baseRating: count > 0 ? Math.round(avg * 10) / 10 : 0,
        },
      });
    }
  }

  // Get ALL items (including those with 0 reviews) to reset fake counts
  const [allKg, allAukle, allBurelis, allSpec] = await Promise.all([
    prisma.kindergarten.findMany({ select: { id: true } }),
    prisma.aukle.findMany({ select: { id: true } }),
    prisma.burelis.findMany({ select: { id: true } }),
    prisma.specialist.findMany({ select: { id: true } }),
  ]);

  await updateCounts(allKg, 'kindergarten', 'kindergarten');
  console.log('  Kindergartens updated.');
  await updateCounts(allAukle, 'aukle', 'aukle');
  console.log('  Aukles updated.');
  await updateCounts(allBurelis, 'burelis', 'burelis');
  console.log('  Bureliai updated.');
  await updateCounts(allSpec, 'specialist', 'specialist');
  console.log('  Specialists updated.');

  console.log('Review counts and ratings updated!');
}

seedReviews()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
