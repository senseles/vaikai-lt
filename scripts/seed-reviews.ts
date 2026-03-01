import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Realistic Lithuanian review data
const reviewTemplates = {
  kindergarten: {
    positive: [
      { rating: 5, names: ['Rūta M.', 'Aistė K.', 'Greta P.'], texts: [
        'Puikus darželis! Vaikai labai patenkinti, auklėtojos rūpestingos ir profesionalios. Rekomenduoju visiems tėveliams.',
        'Lankome jau antrus metus ir esame labai patenkinti. Maistas sveikas, patalpos švarios, programa įdomi.',
        'Mūsų vaikas pradėjo lankyti prieš pusmetį ir pokytis akivaizdus — kalba geriau, draugauja su kitais vaikais. Ačiū auklėtojoms!',
      ]},
      { rating: 4, names: ['Jonas L.', 'Vytautas S.', 'Mindaugas R.'], texts: [
        'Gerai organizuotas darželis, bet kartais trūksta komunikacijos su tėvais. Vis dėlto rekomenduočiau.',
        'Vaikai gerai prižiūrimi, tačiau maitinimas galėtų būti geriau. Bendrai vertinu teigiamai.',
        'Auklėtojos labai stengiasi, bet grupėse per daug vaikų. Kitu atžvilgiu — viskas puiku.',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Ieva B.', 'Agnė D.'], texts: [
        'Darželis vidutiniškas. Yra ir pliusų, ir minusų. Vieta patogi, bet pastatas senas ir reikalauja remonto.',
        'Auklėtojos malonios, bet programa galėtų būti įdomesnė. Vaikas nenorai eina, bet draugai patinka.',
      ]},
    ],
    negative: [
      { rating: 2, names: ['Tomas V.'], texts: [
        'Deja, lūkesčiai nebuvo patenkinti. Grupėje per daug vaikų, o auklėtojos nuolat keičiasi.',
      ]},
    ],
  },
  aukle: {
    positive: [
      { rating: 5, names: ['Sandra K.', 'Monika J.', 'Eglė V.'], texts: [
        'Nuostabi auklė! Vaikai ją myli. Labai atsakinga, punktuali ir kūrybinga. Užsiėmimai visada įdomūs.',
        'Radome per vaikai.lt ir labai džiaugiamės. Auklė puikiai sutaria su mūsų dviem vaikais.',
        'Profesionali, šilta ir rūpestinga. Vaikas visada laimingai laukia jos atėjimo.',
      ]},
      { rating: 4, names: ['Paulius G.', 'Ramunė S.'], texts: [
        'Labai gera auklė, patikima ir maloni. Vienintelis minusas — ne visada galima suderinti laikus.',
        'Mūsų vaikui labai patinka su ja. Šiek tiek brangoka, bet kokybė verta kainos.',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Dalia P.'], texts: [
        'Auklė šiaip gera, bet ne visuomet laikosi susitarimo dėl laikų. Vaikui patinka, tai pagrindinė priežastis, kodėl tęsiame.',
      ]},
    ],
  },
  burelis: {
    positive: [
      { rating: 5, names: ['Inga M.', 'Jurgita R.', 'Vaida L.'], texts: [
        'Puikus būrelis! Vaikas per mėnesį išmoko daugiau nei tikėjomės. Vadovė labai kompetentinga.',
        'Lankome robotikos būrelį ir vaikas tiesiog susižavėjęs. Kiekvieną savaitę laukia su nekantrumu.',
        'Šokių būrelis — mūsų geriausia investicija. Vaikas tapo drąsesnis, lankstesnis ir laimingesnis.',
      ]},
      { rating: 4, names: ['Giedrius T.', 'Lina K.'], texts: [
        'Gerai organizuotas būrelis, vaikai gauna daug naujos informacijos. Gal tik per trumpa pamoka.',
        'Meno būrelis labai patinka. Darbai puikūs, bet grupėje galėtų būti mažiau vaikų.',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Artūras B.'], texts: [
        'Būrelis neblogas, bet tikėjausi daugiau. Vadovė maloni, tačiau programa galėtų būti struktūruotesnė.',
      ]},
    ],
  },
  specialist: {
    positive: [
      { rating: 5, names: ['Neringa V.', 'Kristina A.', 'Rita S.'], texts: [
        'Logopedė tiesiog nuostabi! Per 3 mėnesius vaikas pradėjo taisyklingai tarti visus garsus. Labai rekomenduoju.',
        'Psichologė padėjo mūsų vaikui įveikti baimę eiti į darželį. Profesionali ir labai maloni.',
        'Kineziterapeutė rado problemą, kurios kiti specialistai nepastebėjo. Labai dėkinga už jos pagalbą.',
      ]},
      { rating: 4, names: ['Edvardas P.', 'Justina M.'], texts: [
        'Geras specialistas, padėjo su kalbos problemomis. Tik eilėje reikėjo palaukti ilgiau nei norėtųsi.',
        'Ergoterapeutė labai kompetentinga. Rezultatai matomi, nors progresas lėtas (kas normalu).',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Andrius L.'], texts: [
        'Specialistas kompetentingas, bet bendravimas su tėvais galėtų būti geresnis. Norėtųsi daugiau paaiškinimų.',
      ]},
    ],
  },
};

async function seedReviews() {
  console.log('Seeding diverse reviews...');

  // Get some items from each category
  const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
    prisma.kindergarten.findMany({ take: 30, orderBy: { baseRating: 'desc' }, select: { id: true, name: true } }),
    prisma.aukle.findMany({ take: 15, orderBy: { baseRating: 'desc' }, select: { id: true, name: true } }),
    prisma.burelis.findMany({ take: 15, orderBy: { baseRating: 'desc' }, select: { id: true, name: true } }),
    prisma.specialist.findMany({ take: 15, orderBy: { baseRating: 'desc' }, select: { id: true, name: true } }),
  ]);

  const reviews: Array<{
    itemId: string;
    itemType: string;
    authorName: string;
    rating: number;
    text: string;
    isApproved: boolean;
    createdAt: Date;
  }> = [];

  function addReviews(
    items: Array<{ id: string; name: string }>,
    itemType: string,
    templates: typeof reviewTemplates.kindergarten,
  ) {
    for (const item of items) {
      // Each item gets 1-3 reviews
      const numReviews = 1 + Math.floor(Math.random() * 3);
      const allTemplates = [...templates.positive, ...(templates.mixed || []), ...(templates.negative || [])];

      for (let i = 0; i < numReviews && i < allTemplates.length; i++) {
        const template = allTemplates[i];
        const nameIdx = Math.floor(Math.random() * template.names.length);
        const textIdx = Math.floor(Math.random() * template.texts.length);

        // Random date in the last 6 months
        const daysAgo = Math.floor(Math.random() * 180);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

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
  }

  addReviews(kindergartens, 'kindergarten', reviewTemplates.kindergarten);
  addReviews(aukles, 'aukle', reviewTemplates.aukle);
  addReviews(bureliai, 'burelis', reviewTemplates.burelis);
  addReviews(specialists, 'specialist', reviewTemplates.specialist);

  // Delete existing seeded reviews (keep user-submitted ones)
  // Actually, just create new ones — they'll coexist with existing ones
  let created = 0;
  for (const review of reviews) {
    try {
      await prisma.review.create({ data: review });
      created++;
    } catch {
      // Skip duplicates
    }
  }

  console.log(`Created ${created} new reviews (out of ${reviews.length} attempted)`);

  // Update base review counts to match actual approved review counts
  const [kgIds, aukleIds, burelisIds, specIds] = await Promise.all([
    prisma.kindergarten.findMany({ select: { id: true } }),
    prisma.aukle.findMany({ select: { id: true } }),
    prisma.burelis.findMany({ select: { id: true } }),
    prisma.specialist.findMany({ select: { id: true } }),
  ]);

  async function updateCounts(items: Array<{ id: string }>, itemType: string, model: string) {
    for (const item of items) {
      const approvedReviews = await prisma.review.findMany({
        where: { itemId: item.id, itemType, isApproved: true },
        select: { rating: true },
      });
      if (approvedReviews.length > 0) {
        const avg = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any)[model].update({
          where: { id: item.id },
          data: {
            baseReviewCount: approvedReviews.length,
            baseRating: Math.round(avg * 10) / 10,
          },
        });
      }
    }
  }

  await updateCounts(kgIds, 'kindergarten', 'kindergarten');
  await updateCounts(aukleIds, 'aukle', 'aukle');
  await updateCounts(burelisIds, 'burelis', 'burelis');
  await updateCounts(specIds, 'specialist', 'specialist');

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
