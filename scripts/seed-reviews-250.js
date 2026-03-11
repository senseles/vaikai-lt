const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authorNames = [
  'Rūta M.', 'Inga V.', 'Jolanta K.', 'Laura S.', 'Eglė P.', 'Kristina B.',
  'Vilma G.', 'Daiva J.', 'Neringa T.', 'Ieva R.', 'Aistė D.', 'Sigita L.',
  'Monika A.', 'Sandra Č.', 'Dovilė N.', 'Agnė Š.', 'Simona Z.', 'Jūratė U.',
  'Gabija F.', 'Tomas K.', 'Andrius M.', 'Marius P.', 'Dainius V.', 'Mindaugas R.',
  'Paulius S.', 'Edita B.', 'Giedrė J.', 'Sonata L.', 'Vaida T.', 'Lina A.',
  'Birutė H.', 'Loreta Ž.', 'Austėja N.', 'Raminta D.', 'Viktorija E.',
  'Žydrė O.', 'Milda K.', 'Nomeda S.', 'Vida R.', 'Rita P.',
];

// Reviews for kindergartens (darželiai)
const kindergartenReviews5 = [
  'Puikus darželis! Vaikas eina su džiaugsmu kiekvieną rytą. Auklėtojos nuostabios, labai rūpestingos ir kantriai bendrauja su vaikais.',
  'Labai patenkinti šiuo darželiu. Maistas skanus ir sveikas, vaikų užsiėmimai įdomūs. Rekomenduojame visiems tėvams!',
  'Nuostabus darželis su profesionaliu personalu. Vaikas per pusę metų labai pasikeitė — drąsesnis, kalbantis, kūrybingesnis.',
  'Geriausi darželis Lietuvoje! Auklėtojos tikrai myli vaikus, maitinimas puikus, aplinka švari ir saugi.',
  'Labai džiaugiamės, kad pasirinkome būtent šį darželį. Vaikas grįžta laimingas, daug naujo išmoksta kiekvieną dieną.',
  'Šis darželis viršijo visus lūkesčius. Individualus dėmesys kiekvienam vaikui, puikūs renginiai ir šventės.',
  'Esu labai dėkinga auklėtojoms — jos tikrai atsidavusios savo darbui. Vaikas labai pažengė socialiniuose įgūdžiuose.',
  'Darželis moderniai įrengtas, erdvus kiemas, daug žaidimų. Vaikas kiekvieną vakarą pasakoja, ką veikė.',
  'Ačiū šiam darželiui už nuostabų ugdymą! Vaikas pradėjo skaityti dar prieš mokyklą. Labai rekomenduoju.',
  'Puiki vieta vaikams augti ir mokytis. Profesionalios auklėtojos, gera aplinka, skanūs pietūs. 10 iš 10!',
];

const kindergartenReviews4 = [
  'Geras darželis, vaikas patenkinta. Kartais trūksta informacijos apie dienos veiklas, bet bendrai esame patenkinti.',
  'Solidus darželis su gerais mokytojais. Kiemas galėtų būti didesnis, bet viduje viskas gerai sutvarkyta.',
  'Patenkinti darželiu — auklėtojos rūpestingos, maistas normalus. Truputį trūksta papildomų užsiėmimų, bet bendrai gerai.',
  'Vaikas eina į darželį noriai, tai jau didelis pliusas. Kai kurie dalykai galėtų būti geriau organizuoti, bet mes patenkinti.',
  'Geri mokytojai, švarūs patalpos. Reikėtų daugiau lauko veiklų, bet šiaip darželis vertas dėmesio.',
  'Viskas gerai, vaikas laimingas. Kartais grupėse per daug vaikų, bet auklėtojos susitvarko.',
  'Darželis gerai organizuotas, maitinimas sveikas. Norėtųsi daugiau kūrybinių užsiėmimų, bet kitiems dalykams pretenzijų nėra.',
  'Geras darželis. Auklėtojos profesionalios, bet komunikacija su tėvais galėtų būti aktyvesnė.',
];

const kindergartenReviews3 = [
  'Vidutiniškas darželis. Yra gerų dalykų — logopedė puiki, bet maitinimas galėtų būti geresnis.',
  'Darželis nieko tokio, bet tikrai ne geriausias mieste. Auklėtojos geranoriškos, tačiau trūksta modernesnio ugdymo.',
  'Pusiau patenkinti — kai kurios auklėtojos labai geros, kitos galėtų būti atidesnės. Maistas vidutiniškas.',
];

// Reviews for aukles
const aukleReviews5 = [
  'Fantastika! Auklė puikiai sutarė su vaikais, labai atsakinga ir punktuali. Vaikai ją tiesiog dievina.',
  'Labai rekomenduoju šią auklę. Profesionali, šilta, vaikai su ja jaučiasi saugiai. Atrado puikų ryšį su mūsų vaiku.',
  'Geriausia auklė, kokią turėjome. Organizuoja lavinančias veiklas, eina pasivaikščioti, gamina sveiką maistą vaikams.',
  'Nuostabi auklė — patikima, kūrybinga, mylinti vaikus. Nebijome palikti vaikų jos globai net kelias dienas.',
  'Ačiū už puikų darbą! Auklė tapo kaip šeimos narė. Vaikai ją myli ir visada laukia, kada ateis.',
];

const aukleReviews4 = [
  'Gera auklė, patikima ir atsakinga. Kartais vėluoja, bet su vaikais dirba puikiai.',
  'Esame patenkinti — auklė gerai prižiūri vaikus, maitina, organizuoja veiklas. Rekomenduoju.',
  'Auklė profesionali ir šilta. Truputį brangoka, bet verta kiekvieno euro.',
  'Gera specialistė, vaikai ją mėgsta. Komunikacija galėtų būti aktyvesnė, bet bendrai gerai.',
];

// Reviews for bureliai (clubs)
const bureliaiReviews5 = [
  'Vaikas dievina šį būrelį! Mokytojai puikūs, užsiėmimai įdomūs ir interaktyvūs. Labai rekomenduoju!',
  'Puikus būrelis — vaikas per kelis mėnesius labai pasikeitė. Profesionalūs vadovai, draugiška atmosfera.',
  'Geriausi užsiėmimai mieste! Vaikas nekantriai laukia kiekvienos pamokos. Maži grupės — individualus dėmesys.',
  'Labai patenkinti šiuo būreliu. Vaikas įgijo naujų draugų ir daug ko išmoko. Kaina atitinka kokybę.',
  'Nuostabūs mokytojai, šiuolaikinė įranga, puiki vieta. Vaikas su džiaugsmu bėga į kiekvieną užsiėmimą!',
];

const bureliaiReviews4 = [
  'Geras būrelis, vaikai patenkinti. Kartais grupėse per daug žmonių, bet mokytojai susitvarko.',
  'Patenkintas — vaikas daug ko išmoko. Kaina galėtų būti mažesnė, bet kokybė gera.',
  'Geri užsiėmimai, profesionalūs vadovai. Tvarkaraštis kartais keičiasi, bet bendrai rekomenduoju.',
];

// Reviews for specialists
const specialistReviews5 = [
  'Puikus specialistas! Per keletą vizitų pastebėjome didelę pažangą. Labai rekomenduoju visiems tėvams.',
  'Profesionalumas aukščiausio lygio. Vaikui labai patinka vizitai, o rezultatai maloniai nustebino.',
  'Ačiū už pagalbą! Specialistė rado puikų kontaktą su vaiku, ir pažanga tikrai matoma.',
  'Rekomenduoju iš visos širdies — kompetentingas, kantrus, mylintis savo darbą specialistas.',
  'Geriausia specialistė mieste! Vaikas per 3 mėnesius padarė didžiulę pažangą. Esu labai dėkinga.',
];

const specialistReviews4 = [
  'Geras specialistas, kompetentingas. Kartais tenka palaukti, bet rezultatai verti laukimo.',
  'Patenkintas vizitais. Specialistė profesionali ir maloni. Kaina priimtina.',
  'Gera specialistė — vaikas noriai eina į vizitus. Truputį sunku patekti, bet verta.',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomDate() {
  const start = new Date('2024-06-01');
  const end = new Date('2026-03-01');
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  // Get all entity IDs
  const kindergartens = await prisma.kindergarten.findMany({ select: { id: true }, take: 200 });
  const aukles = await prisma.aukle.findMany({ select: { id: true } });
  const bureliai = await prisma.burelis.findMany({ select: { id: true } });
  const specialists = await prisma.specialist.findMany({ select: { id: true } });

  const reviews = [];

  // 120 kindergarten reviews
  for (let i = 0; i < 120; i++) {
    const kg = pick(kindergartens);
    const rand = Math.random();
    let rating, text;
    if (rand < 0.5) { rating = 5; text = pick(kindergartenReviews5); }
    else if (rand < 0.85) { rating = 4; text = pick(kindergartenReviews4); }
    else { rating = 3; text = pick(kindergartenReviews3); }
    reviews.push({ itemId: kg.id, itemType: 'kindergarten', authorName: pick(authorNames), rating, text, isApproved: true, createdAt: randomDate() });
  }

  // 40 aukle reviews
  for (let i = 0; i < 40; i++) {
    const a = pick(aukles);
    const rand = Math.random();
    let rating, text;
    if (rand < 0.55) { rating = 5; text = pick(aukleReviews5); }
    else { rating = 4; text = pick(aukleReviews4); }
    reviews.push({ itemId: a.id, itemType: 'aukle', authorName: pick(authorNames), rating, text, isApproved: true, createdAt: randomDate() });
  }

  // 50 burelis reviews
  for (let i = 0; i < 50; i++) {
    const b = pick(bureliai);
    const rand = Math.random();
    let rating, text;
    if (rand < 0.6) { rating = 5; text = pick(bureliaiReviews5); }
    else { rating = 4; text = pick(bureliaiReviews4); }
    reviews.push({ itemId: b.id, itemType: 'burelis', authorName: pick(authorNames), rating, text, isApproved: true, createdAt: randomDate() });
  }

  // 40 specialist reviews
  for (let i = 0; i < 40; i++) {
    const s = pick(specialists);
    const rand = Math.random();
    let rating, text;
    if (rand < 0.55) { rating = 5; text = pick(specialistReviews5); }
    else { rating = 4; text = pick(specialistReviews4); }
    reviews.push({ itemId: s.id, itemType: 'specialist', authorName: pick(authorNames), rating, text, isApproved: true, createdAt: randomDate() });
  }

  // Insert all reviews
  let created = 0;
  for (const r of reviews) {
    try {
      await prisma.review.create({ data: r });
      created++;
    } catch (e) {
      console.log(`Skip review: ${e.message.substring(0, 60)}`);
    }
  }

  const total = await prisma.review.count();
  console.log(`Created ${created} reviews. Total: ${total}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
