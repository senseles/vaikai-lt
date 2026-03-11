const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Seeded random for reproducibility
function seededRandom(seed) {
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

// Expanded Lithuanian review templates with many unique review texts
const reviewTemplates = {
  kindergarten: {
    positive: [
      { rating: 5, names: ['Rūta M.', 'Aistė K.', 'Greta P.', 'Simona V.', 'Laura B.', 'Indrė S.', 'Gabrielė D.', 'Milda Č.', 'Austėja R.'], texts: [
        'Puikus darželis! Vaikai labai patenkinti, auklėtojos rūpestingos ir profesionalios. Rekomenduoju visiems tėveliams.',
        'Lankome jau antrus metus ir esame labai patenkinti. Maistas sveikas, patalpos švarios, programa įdomi.',
        'Mūsų vaikas pradėjo lankyti prieš pusmetį ir pokytis akivaizdus — kalba geriau, draugauja su kitais vaikais.',
        'Labai geras darželis, vaikai gauna daug dėmesio. Aplinka jauki ir saugi.',
        'Esame patenkinti pasirinkimu. Auklėtojos labai stengiasi, vaikas nori eiti kiekvieną rytą.',
        'Dukra eina su džiaugsmu! Auklėtojos kantriai ir su meile dirba su vaikais. Labai vertinu šį darželį.',
        'Vaikas per metus labai pasikeitė — tapo savarankiškesnis ir drąsesnis. Darželio nuopelnas!',
        'Švariai, tvarkingai, su meile. Ką dar gali tėvai norėti? Ačiū jums!',
        'Mūsų trečias vaikas eina į šį darželį. Jei nebūtų geras — tikrai nebūtume likę.',
        'Labai gera adaptacijos programa naujiems vaikams. Mūsų mažylis greitai priprato.',
        'Darželyje vyksta daug renginių, švenčių — vaikams labai patinka. Auklėtojos tikrai stengiasi.',
        'Sūnus kasdien pasakoja, ką veikė darželyje. Matosi, kad veiklos įdomios ir prasmingos.',
        'Nuostabus kolektyvas. Visi — nuo auklėtojų iki virtuvės darbuotojų — dirba su širdimi.',
        'Mažos grupės, individualus dėmesys kiekvienam vaikui. Labai svarbu mums kaip tėvams.',
        'Vaikas pradėjo lankyti neseniai, bet jau matome puikius rezultatus kalbos ir socialinių įgūdžių srityse.',
      ]},
      { rating: 4, names: ['Jonas L.', 'Vytautas S.', 'Mindaugas R.', 'Tadas K.', 'Lukas G.', 'Matas V.', 'Domantas J.', 'Paulius A.'], texts: [
        'Gerai organizuotas darželis, bet kartais trūksta komunikacijos su tėvais. Vis dėlto rekomenduočiau.',
        'Vaikai gerai prižiūrimi, tačiau maitinimas galėtų būti geriau. Bendrai vertinu teigiamai.',
        'Auklėtojos labai stengiasi, bet grupėse per daug vaikų. Kitu atžvilgiu — viskas puiku.',
        'Geras darželis, programa subalansuota. Vaikas daug išmoko per trumpą laiką.',
        'Patenkinti, nors vieta ne visada lengvai pasiekiama. Bet darželis verto!',
        'Mūsų vaikui patinka, bet norėtųsi daugiau lauko veiklų. Bendrai — geras pasirinkimas.',
        'Darželis neblogas, maitinimas sveikas, patalpos atnaujintos. Tik komunikacija kartais vėluoja.',
        'Programa įdomi, vaikas daug sužinojo apie gamtą ir menus. Rekomenduoju.',
        'Gerai, kad yra logopedas. Mūsų vaikas pradėjo geriau tarti garsus.',
        'Tvarkinga ir saugi aplinka. Auklėtojos profesionalios, bet galėtų būti daugiau kūrybinių veiklų.',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Ieva B.', 'Agnė D.', 'Dovilė R.', 'Renata P.', 'Justina T.', 'Vaida N.'], texts: [
        'Darželis vidutiniškas. Yra ir pliusų, ir minusų. Vieta patogi, bet pastatas senas ir reikalauja remonto.',
        'Auklėtojos malonios, bet programa galėtų būti įdomesnė. Vaikas nenorai eina, bet draugai patinka.',
        'Normalu, bet tikėjomės daugiau. Gal tiesiog ne mūsų stilius.',
        'Nieko ypatingo, bet ir nieko blogo. Standartinis darželis.',
        'Teritorija galėtų būti didesnė. Vaikai per mažai laiko praleidžia lauke.',
        'Darželis seniai remontuotas, bet auklėtojos labai stengiasi. Dviprasmiškas jausmas.',
      ]},
    ],
    negative: [
      { rating: 2, names: ['Tomas V.', 'Andrius M.', 'Edvinas K.'], texts: [
        'Deja, lūkesčiai nebuvo patenkinti. Grupėje per daug vaikų, o auklėtojos nuolat keičiasi.',
        'Per daug vaikų vienoje grupėje. Individualus dėmesys minimalus.',
        'Komunikacija su tėvais prasta. Sunku sužinoti, kaip vaikui sekasi.',
      ]},
    ],
  },
  aukle: {
    positive: [
      { rating: 5, names: ['Sandra K.', 'Monika J.', 'Eglė V.', 'Daiva S.', 'Jurgita R.', 'Raimonda L.', 'Vilma G.', 'Birutė A.'], texts: [
        'Nuostabi auklė! Vaikai ją myli. Labai atsakinga, punktuali ir kūrybinga.',
        'Radome per vaikai.lt ir labai džiaugiamės. Auklė puikiai sutaria su mūsų dviem vaikais.',
        'Profesionali, šilta ir rūpestinga. Vaikas visada laimingai laukia jos atėjimo.',
        'Geriausia auklė, kokią teko turėti. Labai rekomenduoju!',
        'Auklė randa bendrą kalbą su vaikais ir moka juos užimti prasmingai.',
        'Su šia aukle galime ramiai dirbti — žinome, kad vaikai gerose rankose.',
        'Labai patikima ir atsakinga. Jau metai kai dirba su mumis ir nėra buvę jokių nesklandumų.',
        'Auklė ne tik prižiūri, bet ir ugdo — skaito knygas, piešia, daro eksperimentus su vaikais.',
      ]},
      { rating: 4, names: ['Paulius G.', 'Ramunė S.', 'Kristina L.', 'Dalia A.', 'Justinas P.', 'Erika M.'], texts: [
        'Labai gera auklė, patikima ir maloni. Vienintelis minusas — ne visada galima suderinti laikus.',
        'Mūsų vaikui labai patinka su ja. Šiek tiek brangoka, bet kokybė verta kainos.',
        'Atsakinga ir patikima. Vaikai ją labai mėgsta.',
        'Gera auklė, bendravimas sklandus. Rekomenduoju.',
        'Auklė labai gerai sutaria su vaikais, yra kantriai ir rūpestinga. Tik kartais sunku susisiekti telefonu.',
        'Mūsų šeima labai patenkinta. Auklė ateina laiku, vaikai visada laimingi po dienos su ja.',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Dalia P.', 'Renata V.', 'Inga T.', 'Neringa B.'], texts: [
        'Auklė šiaip gera, bet ne visuomet laikosi susitarimo dėl laikų.',
        'Vidutiniškai. Nieko blogo, bet ir nieko ypatingo.',
        'Normalu. Vaikui patinka, bet norėtųsi daugiau veiklų.',
        'Kaip auklė — gerai, bet komunikacija su tėvais galėtų būti aktyvesnė.',
      ]},
    ],
    negative: [
      { rating: 2, names: ['Gintarė B.', 'Rasa T.'], texts: [
        'Nepavyko rasti bendros kalbos. Auklė buvo nepatikima dėl laiko.',
        'Deja, patirtis buvo neigiama. Auklė dažnai vėlavo ir nesilaikė susitarimų.',
      ]},
    ],
  },
  burelis: {
    positive: [
      { rating: 5, names: ['Inga M.', 'Jurgita R.', 'Vaida L.', 'Neringa K.', 'Kristina P.', 'Loreta S.', 'Aida V.', 'Živilė D.'], texts: [
        'Puikus būrelis! Vaikas per mėnesį išmoko daugiau nei tikėjomės. Vadovė labai kompetentinga.',
        'Lankome robotikos būrelį ir vaikas tiesiog susižavėjęs. Kiekvieną savaitę laukia su nekantrumu.',
        'Šokių būrelis — mūsų geriausia investicija. Vaikas tapo drąsesnis ir laimingesnis.',
        'Labai geras būrelis, vaikas daug ko išmoko. Rekomenduoju!',
        'Meno būrelis tiesiog nuostabus. Vadovė labai kūrybinga ir kantriai dirba su vaikais.',
        'Sūnus lanko sportinį būrelį ir per pusmetį labai sustiprėjo fiziškai. Treneris puikus!',
        'Muzikos būrelis — tikras radinys! Vaikas jau groja ukulele ir dainuoja su malonumu.',
        'Programavimo būrelis vyresniam vaikui — labai šiuolaikiškas, vaikas mokosi Scratch ir jau kuria savo žaidimus.',
      ]},
      { rating: 4, names: ['Giedrius T.', 'Lina K.', 'Sigita R.', 'Rima D.', 'Arvydas M.', 'Eglė Š.'], texts: [
        'Gerai organizuotas būrelis, vaikai gauna daug naujos informacijos. Gal tik per trumpa pamoka.',
        'Meno būrelis labai patinka. Darbai puikūs, bet grupėje galėtų būti mažiau vaikų.',
        'Geras būrelis, tik kaina galėtų būti draugiškesnė.',
        'Vaikai patenkinti, programa įdomi ir struktūruota.',
        'Būrelis geras, vadovas kompetentingas. Tik vieta kartais nepatogi pasiekti.',
        'Vaikui patinka veiklos, bet grafikus ne visada patogus mums kaip tėvams.',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Artūras B.', 'Virginija S.', 'Edita M.', 'Darius Š.'], texts: [
        'Būrelis neblogas, bet tikėjausi daugiau. Vadovė maloni, tačiau programa galėtų būti struktūruotesnė.',
        'Vidutiniškas. Vaikui nelabai patiko, bet gal tiesiog ne jo sritis.',
        'Norėtųsi geresnės organizacijos ir komunikacijos su tėvais.',
        'Programa panaši į tai, ką vaikas mokosi mokykloje. Norėjosi kažko originalesnio.',
      ]},
    ],
    negative: [
      { rating: 2, names: ['Marius L.', 'Sigitas R.'], texts: [
        'Nusivylėme. Programa neįdomi, vaikas nenorėjo tęsti.',
        'Per daug vaikų grupėje, vadovas nespėja visiems skirti dėmesio.',
      ]},
    ],
  },
  specialist: {
    positive: [
      { rating: 5, names: ['Neringa V.', 'Kristina A.', 'Rita S.', 'Aušra M.', 'Jolanta K.', 'Laimutė P.', 'Rasa G.', 'Silvija D.'], texts: [
        'Logopedė tiesiog nuostabi! Per 3 mėnesius vaikas pradėjo taisyklingai tarti visus garsus.',
        'Psichologė padėjo mūsų vaikui įveikti baimę eiti į darželį. Profesionali ir labai maloni.',
        'Kineziterapeutė rado problemą, kurios kiti specialistai nepastebėjo. Labai dėkinga.',
        'Puikus specialistas, rezultatai akivaizdūs. Labai rekomenduoju.',
        'Profesionalus ir šiltas požiūris. Vaikas nebijojo eiti į vizitus.',
        'Po kelių susitikimų su logopedu vaikas pradėjo daug geriau kalbėti. Matome aiškų progresą.',
        'Ergoterapeutė surado tinkamą požiūrį į mūsų vaiką. Labai rekomenduojame šią specialistę.',
        'Specialistė nuostabi — kantriai ir profesionaliai dirba su mūsų vaiku, kuris turi specialiųjų poreikių.',
      ]},
      { rating: 4, names: ['Edvardas P.', 'Justina M.', 'Viktorija S.', 'Milda R.', 'Arnas K.', 'Lina Š.'], texts: [
        'Geras specialistas, padėjo su kalbos problemomis. Tik eilėje reikėjo palaukti ilgiau.',
        'Ergoterapeutė labai kompetentinga. Rezultatai matomi, nors progresas lėtas.',
        'Profesionali konsultacija, aiškiai paaiškino situaciją ir planą.',
        'Geras specialistas, bet kaina aukšta. Vis dėlto verta.',
        'Padėjo išspręsti kalbos problemas, bet teko ilgai laukti pirmojo vizito.',
        'Specialistė gerai dirba su vaiku, bet norėtųsi daugiau grįžtamojo ryšio tėvams.',
      ]},
    ],
    mixed: [
      { rating: 3, names: ['Andrius L.', 'Asta K.', 'Darius V.', 'Giedrė R.'], texts: [
        'Specialistas kompetentingas, bet bendravimas su tėvais galėtų būti geresnis.',
        'Vizitas buvo greitas, norėjosi daugiau laiko ir dėmesio.',
        'Normalu, bet tikėjomės didesnio progreso per tą laiką.',
        'Specialistė maloni, bet po kelių vizitų pokyčių dar nematome.',
      ]},
    ],
    negative: [
      { rating: 2, names: ['Rūta G.', 'Karolis M.'], texts: [
        'Ilgas laukimas, trumpas vizitas. Lūkesčiai nepatenkinti.',
        'Per brangu už tai, ką gavome. Progresas minimalus.',
      ]},
    ],
  },
};

async function main() {
  console.log('=== Validator 2: Review validation and seeding ===\n');

  // Step 1: Check current state
  const reviewCount = await prisma.review.count();
  console.log(`Current reviews in DB: ${reviewCount}`);

  // Step 2: Set baseReviewCount on kindergartens (select ~150 random ones)
  const allKindergartens = await prisma.kindergarten.findMany({
    select: { id: true, name: true, baseReviewCount: true, baseRating: true },
    orderBy: { name: 'asc' },
  });

  const rand = seededRandom('validator2-seed-2026');

  // Pick ~200 kindergartens to have reviews
  const kgWithReviews = allKindergartens
    .filter(() => rand() < 0.26)  // ~26% = ~200 kindergartens
    .map(k => ({
      id: k.id,
      baseReviewCount: Math.floor(rand() * 12) + 3,  // 3-14 reviews
      baseRating: (3.5 + rand() * 1.5),  // 3.5-5.0
    }));

  console.log(`\nSetting baseReviewCount on ${kgWithReviews.length} kindergartens...`);
  for (const k of kgWithReviews) {
    await prisma.kindergarten.update({
      where: { id: k.id },
      data: {
        baseReviewCount: k.baseReviewCount,
        baseRating: Math.round(k.baseRating * 10) / 10,
      },
    });
  }

  // Step 3: Set baseReviewCount on bureliai (~30)
  const allBureliai = await prisma.burelis.findMany({
    select: { id: true, name: true, baseReviewCount: true },
    orderBy: { name: 'asc' },
  });
  const bWithReviews = allBureliai
    .filter(() => rand() < 0.45)
    .map(b => ({
      id: b.id,
      baseReviewCount: Math.floor(rand() * 10) + 2,
      baseRating: (3.5 + rand() * 1.5),
    }));

  console.log(`Setting baseReviewCount on ${bWithReviews.length} bureliai...`);
  for (const b of bWithReviews) {
    await prisma.burelis.update({
      where: { id: b.id },
      data: {
        baseReviewCount: b.baseReviewCount,
        baseRating: Math.round(b.baseRating * 10) / 10,
      },
    });
  }

  // Step 4: Set baseReviewCount on specialists (~20)
  const allSpecialists = await prisma.specialist.findMany({
    select: { id: true, name: true, baseReviewCount: true },
    orderBy: { name: 'asc' },
  });
  const sWithReviews = allSpecialists
    .filter(() => rand() < 0.45)
    .map(s => ({
      id: s.id,
      baseReviewCount: Math.floor(rand() * 8) + 2,
      baseRating: (3.8 + rand() * 1.2),
    }));

  console.log(`Setting baseReviewCount on ${sWithReviews.length} specialists...`);
  for (const s of sWithReviews) {
    await prisma.specialist.update({
      where: { id: s.id },
      data: {
        baseReviewCount: s.baseReviewCount,
        baseRating: Math.round(s.baseRating * 10) / 10,
      },
    });
  }

  // Step 5: Now generate actual Review records
  console.log('\nDeleting existing reviews...');
  const deleted = await prisma.review.deleteMany({});
  console.log(`Deleted ${deleted.count} existing reviews.`);

  // Fetch all items with baseReviewCount > 0
  const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
    prisma.kindergarten.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
    prisma.aukle.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
    prisma.burelis.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
    prisma.specialist.findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, name: true, baseReviewCount: true, baseRating: true } }),
  ]);

  console.log(`\nItems with baseReviewCount > 0:`);
  console.log(`  Kindergartens: ${kindergartens.length}`);
  console.log(`  Aukles: ${aukles.length}`);
  console.log(`  Bureliai: ${bureliai.length}`);
  console.log(`  Specialists: ${specialists.length}`);

  const reviews = [];

  function generateReviewsForItem(item, itemType, templates) {
    const numReviews = item.baseReviewCount;
    const targetRating = item.baseRating || 4;
    const r = seededRandom(item.id + '-reviews');

    const allTemplates = [
      ...templates.positive,
      ...(templates.mixed || []),
      ...(templates.negative || []),
    ];

    for (let i = 0; i < numReviews; i++) {
      let template;
      const roll = r();
      if (targetRating >= 4) {
        if (roll < 0.65) template = templates.positive[Math.floor(r() * templates.positive.length)];
        else if (roll < 0.85) template = (templates.mixed || templates.positive)[Math.floor(r() * (templates.mixed || templates.positive).length)];
        else template = allTemplates[Math.floor(r() * allTemplates.length)];
      } else if (targetRating >= 3) {
        if (roll < 0.4) template = templates.positive[Math.floor(r() * templates.positive.length)];
        else if (roll < 0.7) template = (templates.mixed || templates.positive)[Math.floor(r() * (templates.mixed || templates.positive).length)];
        else template = allTemplates[Math.floor(r() * allTemplates.length)];
      } else {
        if (roll < 0.3) template = templates.positive[Math.floor(r() * templates.positive.length)];
        else template = allTemplates[Math.floor(r() * allTemplates.length)];
      }

      if (!template) template = allTemplates[0];

      const nameIdx = Math.floor(r() * template.names.length);
      const textIdx = Math.floor(r() * template.texts.length);

      const daysAgo = Math.floor(r() * 365);
      const createdAt = new Date('2026-03-11');
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(r() * 14) + 7);
      createdAt.setMinutes(Math.floor(r() * 60));

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

  console.log(`\nTotal reviews to create: ${reviews.length}`);

  // Batch insert
  const BATCH_SIZE = 100;
  let created = 0;
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    const result = await prisma.review.createMany({ data: batch });
    created += result.count;
    if (created % 500 === 0 || i + BATCH_SIZE >= reviews.length) {
      console.log(`  Progress: ${created}/${reviews.length} reviews created...`);
    }
  }

  console.log(`\nCreated ${created} reviews total.`);

  // Step 6: Update baseReviewCount and baseRating to match actual approved reviews
  console.log('\nUpdating baseReviewCount and baseRating on ALL items...');

  async function updateCounts(model, itemType) {
    const items = await prisma[model].findMany({ select: { id: true } });
    let updated = 0;
    for (const item of items) {
      const approvedReviews = await prisma.review.findMany({
        where: { itemId: item.id, itemType, isApproved: true },
        select: { rating: true },
      });
      const count = approvedReviews.length;
      const avg = count > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count
        : 0;
      await prisma[model].update({
        where: { id: item.id },
        data: {
          baseReviewCount: count,
          baseRating: count > 0 ? Math.round(avg * 10) / 10 : 0,
        },
      });
      if (count > 0) updated++;
    }
    console.log(`  ${model}: ${updated} items have reviews`);
  }

  await updateCounts('kindergarten', 'kindergarten');
  await updateCounts('aukle', 'aukle');
  await updateCounts('burelis', 'burelis');
  await updateCounts('specialist', 'specialist');

  // Final verification
  const finalCount = await prisma.review.count();
  const approvedCount = await prisma.review.count({ where: { isApproved: true } });
  console.log(`\n=== Final state ===`);
  console.log(`Total reviews: ${finalCount}`);
  console.log(`Approved reviews: ${approvedCount}`);

  // Verify baseReviewCount matches
  for (const model of ['kindergarten', 'aukle', 'burelis', 'specialist']) {
    const withCount = await prisma[model].findMany({
      where: { baseReviewCount: { gt: 0 } },
      select: { id: true, baseReviewCount: true },
    });
    const totalBase = withCount.reduce((s, i) => s + i.baseReviewCount, 0);
    const actualReviews = await prisma.review.count({
      where: { itemType: model, isApproved: true },
    });
    console.log(`${model}: ${withCount.length} items, baseReviewCount total=${totalBase}, actual reviews=${actualReviews}, match=${totalBase === actualReviews}`);
  }
}

main()
  .then(() => { console.log('\nDone!'); process.exit(0); })
  .catch((err) => { console.error('Error:', err); process.exit(1); });
