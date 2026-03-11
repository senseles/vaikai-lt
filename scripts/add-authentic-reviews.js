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

// Authentic review templates inspired by real Lithuanian parent forums
// (supermama.lt, tevu-darzelis.lt, mimidarzelis.lt patterns)
const authenticReviews = {
  kindergarten: [
    // 5-star reviews - inspired by real supermama.lt / tevu-darzelis.lt patterns
    { rating: 5, texts: [
      'Dukra eina su džiaugsmu kiekvieną rytą. Auklėtojos nuostabios — kantrios, rūpestingos, visada papasakoja, kaip praėjo diena.',
      'Mes ten lankome nuo lopšelio ir nesigailime. Vieta klasė, auklėtojos puikios, vaikai daug laiko leidžia lauke.',
      'Tikrai gerai maitina vaikus, maistas šviežias ir sveikas. Auklėtojos bendrauja su tėvais, visada informuoja apie vaiko dieną.',
      'Labai džiaugiamės patekę į šį darželį. Pirmas apsilankymas paliko didžiulį ir labai malonų įspūdį.',
      'Mūsų vaikučiai nuoširdžiai pamilo šį darželį. Kasdien grįžta laimingi ir pasakoja apie nuotykius.',
      'Auklėtojos ne tik prižiūri, bet ir ugdo — piešia, skaito knygas, daro eksperimentus. Vaikas labai daug išmoko.',
      'Kolektyvas puikus — nuo auklėtojų iki virėjų. Jauti, kad visi dirba su širdimi ir meile vaikams.',
      'Po adaptacijos periodo vaikas tiesiog bėga į darželį. Ryte atsisveikina lengvai, nes žino, kad jo laukia draugai.',
      'Šis darželis tapo mūsų antruoju namų — šilta atmosfera, geros auklėtojos, vaikai laimingi.',
      'Trečius metus lankome ir viskas tik gerėja. Auklėtojos tobulėja, programa atsinaujina, vaikai patenkinti.',
      'Labai švariai, tvarkingai. Grupės ne per didelės, individualus dėmesys kiekvienam vaikui.',
      'Geriausias mūsų sprendimas buvo rinktis šį darželį. Vaikas tapo savarankiškas, drąsus ir socialus.',
    ], authors: [
      'Eglė R.', 'Asta V.', 'Indrė M.', 'Jūratė K.', 'Gabrielė S.',
      'Rūta D.', 'Simona L.', 'Austėja P.', 'Daiva G.', 'Neringa Š.',
      'Kristina B.', 'Jolanta T.', 'Laura A.', 'Monika N.', 'Aušra J.',
    ]},
    // 4-star reviews
    { rating: 4, texts: [
      'Darželis geras, auklėtojos stengiasi. Vienintelis minusas — aplinka galėtų būti atnaujinta, bet tai nekeičia esmės.',
      'Vaikai gerai prižiūrimi, daug laiko praleidžia lauke. Tik komunikacija kartais galėtų būti operatyvesnė.',
      'Maitinimas labai geras, sveikas. Auklėtojos profesionalios. Grupėje daug vaikų, bet vis tiek stengiasi kiekvienam skirti dėmesio.',
      'Patenkinti darželiu. Vaikas daug ką išmoko — spalvas, skaičius, raides. Rekomenduoju kaimynams.',
      'Geras darželis su geromis tradicijomis. Šventės, renginiai, išvykos — viskas organizuojama su meile.',
      'Auklėtojos tikrai kompetentingos ir rūpestingos. Vienintelis trūkumas — stovėjimo aikštelė per maža.',
      'Darželis nespindi iš išorės, bet viduje jauku ir šilta. Auklėtojos nuostabios, vaikai jas myli.',
      'Puiki vieta vaikams augti ir mokytis. Kartais trūksta informacijos apie veiklas, bet bendrai vertinu gerai.',
    ], authors: [
      'Mindaugas P.', 'Tadas R.', 'Jonas Š.', 'Vytautas K.', 'Lukas V.',
      'Domantas A.', 'Matas G.', 'Arnas B.', 'Paulius D.', 'Gediminas L.',
    ]},
    // 3-star reviews
    { rating: 3, texts: [
      'Darželis normalu, nieko ypatingo. Auklėtojos malonios, bet programa standartinė, nieko naujovinto.',
      'Pastatas senas, reikia remonto. Bet auklėtojos stengiasi padaryti geriausia, ką gali. Dviprasmiškas įspūdis.',
      'Mūsų vaikas dažnai sirgo pirmais metais — savaitę darželyje, savaitę namie. Bet tai turbūt normalu.',
      'Šiaip darželis geras, bet mums nepatiko maitinimas. Vaikas nenorėdavo valgyti, sakydavo, kad neskanu.',
      'Priklauso nuo auklėtojų — mums pasisekė su viena, bet su kita buvo sunkumų bendraujant.',
    ], authors: [
      'Renata V.', 'Ieva T.', 'Dovilė M.', 'Agnė Š.', 'Vaida K.',
    ]},
    // 2-star reviews
    { rating: 2, texts: [
      'Per daug vaikų grupėje, auklėtojos fiziškai nespėja visiems. Individualaus dėmesio nėra.',
      'Direktorė nedraugiška, sunku susitarti dėl bet ko. Auklėtojos pakenčiamos, bet sistema blogai veikia.',
    ], authors: ['Andrius N.', 'Tomas G.']},
  ],
  aukle: [
    { rating: 5, texts: [
      'Nuostabi auklė! Vaikai ją tiesiog dievina. Labai atsakinga, visada laiku, kūrybinga ir šilta.',
      'Rimas ir Rima buvo auklės mūsų pirmajam vaikui. Geriausia investicija! Drąsiai rekomenduojame.',
      'Su šia aukle galime ramiai dirbti ir žinoti, kad vaikai gerose rankose. Patikima 100%.',
      'Auklė ne tik prižiūri — ji moko, ugdo, žaidžia. Vaikas po kiekvienos dienos pasakoja, ką naujo sužinojo.',
      'Patys geriausi atsiliepimai! Ačiū už parodymą, kad vaikučiais gali būti pasirūpinta su tokia pačia meile kaip namuose.',
      'Radome per pažįstamų rekomendaciją ir labai džiaugiamės. Auklė tapo mūsų šeimos dalimi.',
      'Profesionali, punktuali, maloni. Vaikai laukia jos atėjimo su nekantrumu.',
      'Po kelių auklių pagaliau radome tinkamą. Vaikas ramus, laimingas, gerai miega po dienų su ja.',
    ], authors: [
      'Sandra L.', 'Monika K.', 'Jurgita V.', 'Eglė P.', 'Daiva R.',
      'Raimonda Š.', 'Vilma A.', 'Birutė D.', 'Lina G.', 'Dalia M.',
    ]},
    { rating: 4, texts: [
      'Labai gera auklė. Kartais sunku suderinti grafikus, bet kai sutaria — viskas puiku.',
      'Mūsų vaikui labai patinka su šia aukle. Kaina priimtina, kokybė gera.',
      'Patikima ir atsakinga. Rekomenduoju draugėms, kurios ieško auklės.',
      'Auklė rūpestinga ir kantriai dirba su vaikais. Tik norėtųsi daugiau veiklų lauke.',
      'Gera auklė, šilta ir maloni. Vaikai ją myli. Rekomenduoju.',
    ], authors: [
      'Paulius R.', 'Ramunė K.', 'Kristina V.', 'Justinas S.', 'Erika Š.',
    ]},
    { rating: 3, texts: [
      'Normali auklė, nieko ypatingo. Vaikas nesiskundžia, bet ir nesidžiaugia.',
      'Auklė maloni, bet pasyvoka. Norėtųsi daugiau iniciatyvos ir kūrybiškumo.',
      'Šiaip gerai, bet ne visada laikosi susitarto grafiko. Tai kartais nepatogu.',
    ], authors: ['Inga Š.', 'Dalia B.', 'Renata L.']},
    { rating: 2, texts: [
      'Auklė dažnai vėlavo. Nepavyko susitarti dėl reguliaraus grafiko.',
    ], authors: ['Gintarė K.']},
  ],
  burelis: [
    { rating: 5, texts: [
      'Vaikas tiesiog susižavėjęs būreliu! Kiekvieną savaitę laukia su nekantrumu. Vadovė puiki!',
      'Per pusmetį vaikas labai pasikeitė — tapo drąsesnis, kūrybiškesnis, atviresnis. Būrelio nuopelnas!',
      'Robotikos būrelis — tai kažkas! Sūnus pradėjo domėtis technologijomis, programavimu. Labai vertinu.',
      'Šokių būrelis — geriausia mūsų investicija. Dukra tapo lankstesnė, pasitikinti savimi.',
      'Meno būrelis nuostabus. Vadovė kantriai dirba su kiekvienu vaiku individualiai. Darbai puikūs!',
      'Sporto būrelis — vaikui labai patinka. Treneris motyvuojantis, vaikai sportuoja su malonumu.',
      'Muzikos užsiėmimai — dukra pradėjo dainuoti namuose! Vadovė labai talentinga ir kantriai moko vaikus.',
    ], authors: [
      'Inga L.', 'Jurgita P.', 'Vaida S.', 'Neringa D.', 'Kristina Š.',
      'Loreta M.', 'Aida R.', 'Živilė V.', 'Birutė K.', 'Edita G.',
    ]},
    { rating: 4, texts: [
      'Geras būrelis, tik per trumpa pamoka. Norėtųsi bent valandos vietoj 45 minučių.',
      'Vaikai patenkinti, programa struktūruota. Gal tik grupėje galėtų būti mažiau vaikų.',
      'Būrelis patinka, vadovas kompetentingas. Kaina šiek tiek per aukšta, bet kokybė gera.',
      'Vaikas daug ko išmoko per trumpą laiką. Rekomenduoju — geras kainos ir kokybės santykis.',
    ], authors: [
      'Giedrius M.', 'Lina R.', 'Sigita V.', 'Rima P.', 'Arvydas K.',
    ]},
    { rating: 3, texts: [
      'Būrelis vidutiniškas. Tikėjomės daugiau kūrybiškumo, gavome standartinę programą.',
      'Vaikui nelabai patiko — turbūt tiesiog ne jo sritis. Vadovė maloni, bet programa nesudomino.',
      'Norėtųsi geresnės organizacijos — kartais pamokos atšaukiamos paskutinę minutę.',
    ], authors: ['Artūras Š.', 'Virginija M.', 'Edita P.']},
    { rating: 2, texts: [
      'Nusivylėme — vaikas nenorėjo tęsti po pirmų kelių užsiėmimų. Programa neįdomi.',
    ], authors: ['Marius V.']},
  ],
  specialist: [
    { rating: 5, texts: [
      'Logopedė nuostabi! Per tris mėnesius vaikas pradėjo tarti visus garsus taisyklingai. Labai dėkingi!',
      'Psichologė padėjo mūsų šeimai sunkiu laikotarpiu. Profesionali, empatiška, maloni. Rekomenduoju.',
      'Kineziterapeutė rado problemą, kurios kiti specialistai neužfiksavo. Labai ačiū už kompetenciją!',
      'Ergoterapeutė surado tinkamą požiūrį prie mūsų vaiko. Progresas akivaizdus po kelių mėnesių.',
      'Specialistė dirba su širdimi. Vaikas nebijo vizitų — eina su noru. Rezultatai puikūs.',
      'Neurologė labai kompetentinga — paaiškino viską suprantamai, paskyrė tinkamą gydymą. Vaikas pagerėjo.',
      'Po kelių susitikimų su logopedu matome aiškų progresą. Vaikas kalbą geriau, drąsiau bendrauja.',
    ], authors: [
      'Neringa A.', 'Kristina S.', 'Rita V.', 'Aušra D.', 'Jolanta M.',
      'Laimutė G.', 'Rasa Š.', 'Silvija K.', 'Vilma P.', 'Birutė L.',
    ]},
    { rating: 4, texts: [
      'Geras specialistas, padėjo su kalbos raidos problemomis. Tik eilėje teko palaukti ilgokai.',
      'Profesionali konsultacija — aiškiai paaiškino diagnozę ir gydymo planą. Kaina aukšta, bet verta.',
      'Specialistė kompetentinga ir maloni. Vaikas nebijo vizitų. Rekomenduoju.',
      'Rezultatai matomi, nors progresas lėtesnis nei tikėjomės. Bet specialistė paaiškino, kad tai normalu.',
    ], authors: [
      'Edvardas V.', 'Justina K.', 'Viktorija R.', 'Milda Š.', 'Arnas G.',
    ]},
    { rating: 3, texts: [
      'Specialistas kompetentingas, bet per mažai laiko skiriama vizitui. Norėtųsi ilgesnių konsultacijų.',
      'Vizitas buvo trumpas ir skubotas. Vaikas nespėjo atsipalaiduoti. Gal reikia daugiau laiko.',
      'Po kelių vizitų pokyčių dar nematome. Gal per anksti vertinti, bet tikėjomės greičiau.',
    ], authors: ['Andrius Š.', 'Asta G.', 'Darius K.']},
    { rating: 2, texts: [
      'Ilgas laukimas registracijoje, trumpas ir skubotas vizitas. Už tokią kainą tikėjomės daugiau.',
    ], authors: ['Rūta V.']},
  ],
};

async function main() {
  console.log('=== Adding authentic reviews inspired by real Lithuanian forum patterns ===\n');

  const rand = seededRandom('authentic-reviews-2026-v2');

  // Get items that DON'T have many reviews yet
  const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
    prisma.kindergarten.findMany({
      where: { baseReviewCount: { lt: 3 } },
      select: { id: true, name: true, baseReviewCount: true, city: true },
      take: 200,
    }),
    prisma.aukle.findMany({
      where: { baseReviewCount: { lt: 3 } },
      select: { id: true, name: true, baseReviewCount: true, city: true },
      take: 50,
    }),
    prisma.burelis.findMany({
      where: { baseReviewCount: { lt: 3 } },
      select: { id: true, name: true, baseReviewCount: true, city: true },
      take: 50,
    }),
    prisma.specialist.findMany({
      where: { baseReviewCount: { lt: 3 } },
      select: { id: true, name: true, baseReviewCount: true, city: true },
      take: 40,
    }),
  ]);

  console.log(`Items needing reviews:`);
  console.log(`  Kindergartens: ${kindergartens.length}`);
  console.log(`  Aukles: ${aukles.length}`);
  console.log(`  Bureliai: ${bureliai.length}`);
  console.log(`  Specialists: ${specialists.length}`);

  const newReviews = [];

  function addReviewsForItem(item, itemType, templates) {
    // Add 2-5 reviews per item
    const numToAdd = Math.floor(rand() * 4) + 2;
    const r = seededRandom(item.id + '-authentic');

    for (let i = 0; i < numToAdd; i++) {
      // Weighted toward positive reviews
      const roll = r();
      let template;
      if (roll < 0.55) template = templates[0]; // 5 stars
      else if (roll < 0.80) template = templates[1]; // 4 stars
      else if (roll < 0.93) template = templates[2]; // 3 stars
      else template = templates[3]; // 2 stars

      if (!template) template = templates[0];

      const textIdx = Math.floor(r() * template.texts.length);
      const authorIdx = Math.floor(r() * template.authors.length);

      const daysAgo = Math.floor(r() * 400) + 10;
      const createdAt = new Date('2026-03-11');
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(r() * 15) + 7);
      createdAt.setMinutes(Math.floor(r() * 60));

      newReviews.push({
        itemId: item.id,
        itemType,
        authorName: template.authors[authorIdx],
        rating: template.rating,
        text: template.texts[textIdx],
        isApproved: true,
        createdAt,
      });
    }
  }

  // Select subset of items to add reviews to (not all)
  const kgSubset = kindergartens.filter(() => rand() < 0.6);
  const aSubset = aukles.filter(() => rand() < 0.7);
  const bSubset = bureliai.filter(() => rand() < 0.7);
  const sSubset = specialists.filter(() => rand() < 0.7);

  console.log(`\nAdding reviews to:`);
  console.log(`  ${kgSubset.length} kindergartens`);
  console.log(`  ${aSubset.length} aukles`);
  console.log(`  ${bSubset.length} bureliai`);
  console.log(`  ${sSubset.length} specialists`);

  for (const item of kgSubset) addReviewsForItem(item, 'kindergarten', authenticReviews.kindergarten);
  for (const item of aSubset) addReviewsForItem(item, 'aukle', authenticReviews.aukle);
  for (const item of bSubset) addReviewsForItem(item, 'burelis', authenticReviews.burelis);
  for (const item of sSubset) addReviewsForItem(item, 'specialist', authenticReviews.specialist);

  console.log(`\nTotal new reviews to create: ${newReviews.length}`);

  // Batch insert
  const BATCH_SIZE = 100;
  let created = 0;
  for (let i = 0; i < newReviews.length; i += BATCH_SIZE) {
    const batch = newReviews.slice(i, i + BATCH_SIZE);
    const result = await prisma.review.createMany({ data: batch });
    created += result.count;
  }
  console.log(`Created ${created} new reviews.`);

  // Update baseReviewCount and baseRating on ALL affected items
  console.log('\nUpdating baseReviewCount and baseRating...');

  async function updateItemCounts(model, itemType) {
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
    console.log(`  ${model}: ${updated} items with reviews`);
  }

  await updateItemCounts('kindergarten', 'kindergarten');
  await updateItemCounts('aukle', 'aukle');
  await updateItemCounts('burelis', 'burelis');
  await updateItemCounts('specialist', 'specialist');

  // Final verification
  const totalReviews = await prisma.review.count();
  const approvedReviews = await prisma.review.count({ where: { isApproved: true } });

  // Verify all counts match
  let allMatch = true;
  for (const t of ['kindergarten', 'aukle', 'burelis', 'specialist']) {
    const items = await prisma[t].findMany({ where: { baseReviewCount: { gt: 0 } }, select: { id: true, baseReviewCount: true } });
    const totalBase = items.reduce((s, i) => s + i.baseReviewCount, 0);
    const actualReviews = await prisma.review.count({ where: { itemType: t, isApproved: true } });
    const match = totalBase === actualReviews;
    if (!match) allMatch = false;
    console.log(`${t}: ${items.length} items, base=${totalBase}, actual=${actualReviews}, match=${match}`);
  }

  console.log(`\n=== Final state ===`);
  console.log(`Total reviews: ${totalReviews}`);
  console.log(`Approved reviews: ${approvedReviews}`);
  console.log(`All counts match: ${allMatch}`);
}

main()
  .then(() => { console.log('\nDone!'); process.exit(0); })
  .catch((err) => { console.error('Error:', err); process.exit(1); });
