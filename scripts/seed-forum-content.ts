import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ===== Lithuanian slugification =====
function slugify(text: string): string {
  const map: Record<string, string> = {
    'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
    'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
    'Ą': 'a', 'Č': 'c', 'Ę': 'e', 'Ė': 'e', 'Į': 'i',
    'Š': 's', 'Ų': 'u', 'Ū': 'u', 'Ž': 'z',
  };
  return text
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] || ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

// Deterministic pseudo-random
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

// ===== Author names (diverse Lithuanian first names) =====
const authorNames = [
  'Gabrielė K.', 'Matas S.', 'Emilija R.', 'Lukas V.', 'Austėja P.',
  'Dominykas T.', 'Ugnė M.', 'Kajus L.', 'Ieva D.', 'Nojus B.',
  'Liepa G.', 'Rokas A.', 'Kotryna J.', 'Eimantas N.', 'Viltė S.',
  'Dovydas K.', 'Rugilė V.', 'Benas R.', 'Urtė M.', 'Gustas P.',
  'Miglė T.', 'Arnas S.', 'Saulė D.', 'Vilius K.', 'Aušrinė L.',
  'Danielius G.', 'Goda B.', 'Tautvydas R.', 'Brigita A.', 'Ignas V.',
  'Živilė M.', 'Paulina K.', 'Gediminas N.', 'Adelė S.', 'Karolis T.',
  'Deimantė P.', 'Mantas L.', 'Julija B.', 'Vytenis D.', 'Rasma G.',
  'Birutė V.', 'Skaistė R.', 'Indrė J.', 'Ovidijus M.', 'Giedrė K.',
];

// ===== Post data (55 posts across all 8 categories) =====
interface PostSeed {
  categorySlug: string;
  title: string;
  content: string;
  authorName: string;
  city?: string;
}

const newPosts: PostSeed[] = [
  // === Darželiai (7 posts) ===
  {
    categorySlug: 'darzeliai',
    title: 'Darželis su baseinuku Vilniuje — ar yra?',
    content: 'Ieškome darželio su baseinu arba vandens procedūromis Vilniuje. Dukra labai mėgsta vandenį ir girdėjau, kad keli privatūs darželiai turi mažus baseinukus. Ar kas žinote konkrečius? Kokia papildoma kaina?',
    authorName: 'Gabrielė K.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Darželio grupės dydis — kiek vaikų per daug?',
    content: 'Mūsų grupėje yra 24 vaikai ir 2 auklėtojos. Atrodo, kad per daug. Kitame darželyje siūlo grupę su 15 vaikų, bet toliau nuo namų. Kiek vaikų yra jūsų grupėse? Ar pastebite skirtumą tarp mažų ir didelių grupių?',
    authorName: 'Matas S.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Lauko darželiai Lietuvoje — kas tai?',
    content: 'Perskaičiau apie lauko darželius (forest kindergarten) Skandinavijoje. Ar Lietuvoje yra panašių iniciatyvų? Labai patinka idėja, kad vaikai daug laiko praleidžia gamtoje, nepriklausomai nuo oro. Gal kas esate bandę?',
    authorName: 'Emilija R.',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Darželis Šiauliuose — kokia situacija su eilėmis?',
    content: 'Neseniai persikraustėme į Šiaulius ir reikia darželio 4-mečiui. Kokia situacija su eilėmis? Ar lengva patekti? Gal kas galite rekomenduoti konkrečius darželius Šiaulių centre arba Dainų rajone?',
    authorName: 'Lukas V.',
    city: 'Šiauliai',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Darželio kainos 2026 metais — kiek mokate?',
    content: 'Norėčiau palyginti darželių kainas. Mes mokame 350 EUR už privatų darželį Kaune, bet girdžiu, kad Vilniuje kainos siekia 500-600 EUR. O valstybiniuose — kiek maitinimas kainuoja? Dalinkitės savo skaičiais!',
    authorName: 'Austėja P.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Darželis su anglų kalba — ar verta?',
    content: 'Yra galimybė leisti vaiką į darželį, kur pusę dienos vyksta anglų kalba. Kaina dvigubai didesnė nei valstybinio. Ar tikrai vaikai tame amžiuje (3 m.) gali efektyviai mokytis antros kalbos tokiu būdu? Kokia jūsų patirtis?',
    authorName: 'Dominykas T.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Auklėtojų trūkumas darželiuose — ar jaučiate?',
    content: 'Mūsų darželyje per metus pasikeitė 3 auklėtojos. Vaikai nespėja priprasti. Girdėjau, kad visoje Lietuvoje yra auklėtojų trūkumas ir atlyginimai per maži. Ar jūsų darželiuose stabilu? Kaip tai veikia vaikus?',
    authorName: 'Ugnė M.',
    city: 'Panevėžys',
  },

  // === Auklės (7 posts) ===
  {
    categorySlug: 'aukles',
    title: 'Auklė dviem vaikams — kaip organizuoti?',
    content: 'Turime 1,5 ir 4 metų vaikus. Ieškome vienos auklės abiem. Ar tai realu? Kaip organizuojate dieną, kai vienas miega, o kitas nori žaisti? Kokią kainą mokate už auklę dviem vaikams?',
    authorName: 'Kajus L.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'aukles',
    title: 'Auklė vakare ir savaitgaliais — kur rasti?',
    content: 'Dirbame nestandartiniu grafiku ir kartais reikia auklės vakarais ar savaitgaliais. Agentūros dažniausiai siūlo tik darbo dienomis. Kur ieškoti auklės vakariniam laikui? Ar mokate daugiau už vakarines valandas?',
    authorName: 'Ieva D.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'aukles',
    title: 'Auklė senelių amžiaus — privalumai?',
    content: 'Mums pasiūlė auklę, kuriai 62 metai. Ji turi 30 metų patirties ir nuostabias rekomendacijas. Bet truputį nerimauju dėl energijos lygio — ar suspės paskui 2-metį? Kas turėjote vyresnio amžiaus aukles? Kaip patirtis?',
    authorName: 'Nojus B.',
  },
  {
    categorySlug: 'aukles',
    title: 'Auklės agentūros Vilniuje — kurią rinktis?',
    content: 'Vilniuje yra bent 5-6 auklių agentūros. Kurios patikimiausios? Ar agentūra garantuoja pakeitimą, jei auklė netinka? Kiek papildomai kainuoja agentūros tarpininkavimas?',
    authorName: 'Liepa G.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'aukles',
    title: 'Auklė iš užsienio — ar svarstote?',
    content: 'Girdėjau, kad kai kurios šeimos samdo aukles iš Ukrainos ar Filipinų. Kainos mažesnės, bet kalbos barjeras gali būti problema. Ar kas turite patirties? Kaip su darbo leidimais ir komunikacija su vaiku?',
    authorName: 'Rokas A.',
  },
  {
    categorySlug: 'aukles',
    title: 'Au pair programa — ar veikia Lietuvoje?',
    content: 'Domina au pair programa — jaunuolė iš užsienio gyvena su šeima, prižiūri vaikus mainais į kambarį ir kišenpinigius. Ar kas Lietuvoje esate bandę? Kaip tai veikia praktiškai? Kokie teisiniai reikalavimai?',
    authorName: 'Kotryna J.',
  },
  {
    categorySlug: 'aukles',
    title: 'Pirmoji diena su nauja aukle — patarimai',
    content: 'Kitą savaitę pradeda dirbti nauja auklė. Sūnui 2 metai ir jis labai prisirišęs prie manęs. Kaip padaryti pirmąją dieną kuo sklandesnę? Ar turėčiau likti namuose pirmą dieną? Kiek ilgai trunka adaptacija su aukle?',
    authorName: 'Eimantas N.',
    city: 'Klaipėda',
  },

  // === Būreliai (7 posts) ===
  {
    categorySlug: 'bureliai',
    title: 'Plaukimo būrelis nuo 3 metų — ar rekomenduojate?',
    content: 'Norime vesti dukrą į plaukimo būrelį. Jai 3 metai. Ar tame amžiuje mokosi plaukti, ar tai daugiau žaidimas vandenyje? Kokius baseinus rekomenduojate Vilniuje vaikų plaukimo pamokoms?',
    authorName: 'Viltė S.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'bureliai',
    title: 'Gimnastikos būrelis mergaitėms Kaune',
    content: 'Dukra (5 m.) labai lanksti ir energinga. Galvojame apie gimnastiką. Kaune yra kelios sporto mokyklos, bet nežinau, kuri tinka pradedantiesiems. Ar kas lankote gimnastikos būrelį Kaune? Kokios kainos ir grafikai?',
    authorName: 'Dovydas K.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'bureliai',
    title: 'Gamtos mokslų būreliai vaikams — kur rasti?',
    content: 'Sūnus (6 m.) domisi gyvūnais, augalais, dinozaurais — viskuo, kas susiję su gamta. Ieškome gamtos mokslų būrelio, kur vaikai eksperimentuoja ir tyrinėja. Ar yra tokių Lietuvoje? Gal kas žinote?',
    authorName: 'Rugilė V.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'bureliai',
    title: 'Anglų kalbos būrelis ar privačios pamokos?',
    content: 'Norime, kad 5-metė dukra pradėtų mokytis anglų kalbos. Kas efektyviau — grupinis būrelis (6-8 vaikai) ar privačios pamokos? Būrelis kainuoja 60 EUR/mėn., privačios — 15 EUR/val. Kokia jūsų patirtis?',
    authorName: 'Benas R.',
    city: 'Klaipėda',
  },
  {
    categorySlug: 'bureliai',
    title: 'Keramikos būrelis vaikams — nuostabi patirtis',
    content: 'Noriu pasidalinti: sūnus (7 m.) pradėjo lankyti keramikos būrelį ir tai buvo geriausias pasirinkimas. Lavina smulkiąją motoriką, kūrybiškumą, ir grįžta namo su puodeliais ir lėkštėmis. Labai rekomenduoju!',
    authorName: 'Urtė M.',
  },
  {
    categorySlug: 'bureliai',
    title: 'Būreliai mažiesiems (2-3 metų) — ar prasminga?',
    content: 'Matau daug būrelių skirtų 2-3 metų vaikams: ritmika, sensorika, kūrybiniai užsiėmimai. Ar tai tikrai naudinga, ar tik pinigų išmetimas? Vaikai tame amžiuje dar taip trumpai sutelkia dėmesį...',
    authorName: 'Gustas P.',
  },
  {
    categorySlug: 'bureliai',
    title: 'Šokių būrelis berniukams — ar populiaru?',
    content: 'Sūnus (6 m.) labai mėgsta šokti, bet nori eiti į šokių būrelį. Bijau, kad kiti berniukai juoksis. Ar jūsų sūnūs lanko šokius? Kokius šokių stilius rekomenduojate berniukams — hip hop, šiuolaikinį, liaudies?',
    authorName: 'Miglė T.',
    city: 'Šiauliai',
  },

  // === Specialistai (7 posts) ===
  {
    categorySlug: 'specialistai',
    title: 'Vaikų dantų gydytojas be streso — ar įmanoma?',
    content: 'Sūnus (4 m.) mirtinai bijo dantų gydytojo. Paskutinį kartą turėjome išeiti iš kabineto. Ar yra Vilniuje odontologų, kurie specializuojasi su baimę turinčiais vaikais? Gal kas bandėte gydymą su sedacija?',
    authorName: 'Arnas S.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'specialistai',
    title: 'Vaikų oftalmologas — kada tikrinti regėjimą?',
    content: 'Dukrai 3 metai ir dar niekada netikrinome regėjimo. Nuo kada rekomenduojama pradėti reguliarius patikrinimus? Pastebėjau, kad ji kartais žiūri televizorių labai iš arti. Ar tai ženklas, kad reikia pas gydytoją?',
    authorName: 'Saulė D.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'specialistai',
    title: 'Logopedas Klaipėdoje — ilgos eilės',
    content: 'Sūnui 3,5 metų ir jis dar beveik nekalba pilnais sakiniais. Pediatrė siuntė pas logopedą, bet eilė Klaipėdoje — 4 mėnesiai. Ar kas žinote privačių logopedų Klaipėdoje? Kiek kainuoja? Ar nuotolinės konsultacijos veikia mažiems vaikams?',
    authorName: 'Vilius K.',
    city: 'Klaipėda',
  },
  {
    categorySlug: 'specialistai',
    title: 'Vaikų psichiatras — kai psichologas nepadeda',
    content: 'Dukrai (6 m.) stiprūs nerimo priepuoliai. Psichologė dirba jau 3 mėnesius, bet situacija negerėja. Psichologė siūlo konsultuotis su vaikų psichiatru. Ar kas turėjote patirties? Ar psichiatras būtinai skirs vaistus?',
    authorName: 'Aušrinė L.',
  },
  {
    categorySlug: 'specialistai',
    title: 'Fizinė terapija po lūžio — kur kreiptis?',
    content: 'Sūnus (5 m.) lūžo ranką žaidimų aikštelėje. Gipsas nuimtas, bet ranka silpna ir jis bijo ja naudoti. Gydytojas rekomendavo fizinę terapiją. Ar kas žinote gerą kineziterapeutą vaikams Vilniuje?',
    authorName: 'Danielius G.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'specialistai',
    title: 'Vaikų dermatologas — egzemos gydymas',
    content: 'Dukrai (2 m.) nuo gimimo egzema. Bandėme visokius kremus, dietų pakeitimus, bet niekas ilgam nepadeda. Gal kas galite rekomenduoti gerą dermatologą, kuris specializuojasi vaikų egzemoje? Esame iš Kauno.',
    authorName: 'Goda B.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'specialistai',
    title: 'Ankstyvoji intervencija — ką tai reiškia?',
    content: 'Pediatrė minėjo „ankstyvąją intervenciją" mūsų sūnui (18 mėn.), nes jis dar nevaikšto. Ką tiksliai tai apima? Kokius specialistus reikia aplankyti? Ar tai reiškia, kad kažkas rimtai negerai? Labai nerimauju.',
    authorName: 'Tautvydas R.',
  },

  // === Tėvystė (7 posts) ===
  {
    categorySlug: 'tevyste',
    title: 'Vaiko pyktis — kaip valdyti isterikas?',
    content: 'Dukrai 3 metai ir prasidėjo siaubingos isterikos — rėkia, svaidosi ant grindų, muša. Ypač parduotuvėse ir viešose vietose. Bandėme ignoruoti, bandėme kalbėtis — niekas neveikia. Gal kas turite veikiančių strategijų?',
    authorName: 'Brigita A.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'tevyste',
    title: 'Vieniša mama — kaip susitvarkyti?',
    content: 'Auginu 2 metų sūnų viena. Darbas, namai, vaikas — viskas ant mano pečių. Labai pavargstu ir kartais jaučiuosi kalta, kad nesu pakankamai gera mama. Gal yra kitų vienišų mamų, kurios galėtų pasidalinti patirtimi ar tiesiog palaikyti?',
    authorName: 'Ignas V.',
  },
  {
    categorySlug: 'tevyste',
    title: 'Tėvų perdegimas — kaip atpažinti ir gydyti?',
    content: 'Jaučiu, kad esu prie ribos. 3 vaikai (1, 3 ir 5 m.), darbas pilnu etatu, namai. Nebeturiu energijos, viskas erzina, negaliu miegoti nors esu mirtinai pavargusi. Ar tai perdegimas? Ką daryti? Ar kreiptis į specialistą?',
    authorName: 'Živilė M.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'tevyste',
    title: 'Vaikas ir išmanusis telefonas — nuo kada leisti?',
    content: 'Sūnui 8 metai ir visi jo klasiokai jau turi telefonus. Jis labai prašo. Mes manome, kad per anksti. Nuo kada jūs davėte vaikams telefonus? Ar yra gerų tėvų kontrolės programų, kurias rekomenduotumėte?',
    authorName: 'Paulina K.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'tevyste',
    title: 'Brolių ir sesių konfliktai — ar tai normalu?',
    content: 'Mano vaikai (4 ir 6 m.) nuolat pešasi. Dėl žaislų, dėl dėmesio, dėl visko. Kartais tai gražiai žaidžia, o kartais rėkia ir muša vienas kitą. Ar tai normalu? Kaip reaguojate, kai vaikai konfliktuoja?',
    authorName: 'Gediminas N.',
  },
  {
    categorySlug: 'tevyste',
    title: 'Pagyrimas vs pastangų pripažinimas — kas veikia?',
    content: 'Skaičiau, kad nereikia sakyti „esi protingas/gražus", o geriau girti pastangas — „kaip gerai pasistengei". Bet praktikoje sunku persijungti. Ar kas taikote šį metodą? Ar tikrai matote skirtumą?',
    authorName: 'Adelė S.',
  },
  {
    categorySlug: 'tevyste',
    title: 'Vaiko savarankiškumas — ką leisti daryti pačiam?',
    content: 'Dukra (4 m.) nori viską daryti pati — rengtis, valgyti, plauti indus. Bet tai trunka amžinybę ir baigiasi netvarka. Kiek leisti savarankiškumo ir kada padėti? Ar jūsų vaikai patys rengiasi, valgo ir pan.?',
    authorName: 'Karolis T.',
  },

  // === Mokyklos (6 posts) ===
  {
    categorySlug: 'mokyklos',
    title: 'Nauja mokykla po persikraustymo — kaip padėti vaikui?',
    content: 'Persikraustėme iš Vilniaus į Klaipėdą ir sūnus (8 m.) turi pradėti naujoje mokykloje. Labai nerimauja, bijo, kad nesuras draugų. Kaip padėti jam adaptuotis? Gal kas turėjote panašią patirtį?',
    authorName: 'Deimantė P.',
    city: 'Klaipėda',
  },
  {
    categorySlug: 'mokyklos',
    title: 'Pailgintos dienos grupė — ar naudinga?',
    content: 'Svarstome, ar leisti dukrą (7 m.) į pailgintos dienos grupę po pamokų. Dirbame iki 17 val. ir kitostaip nėra kas prižiūri. Bet bijau, kad vaikui bus per ilga diena. Ar jūsų vaikai lanko? Ką ten veikia?',
    authorName: 'Mantas L.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'mokyklos',
    title: 'Mokyklinės patyčios — ką daryti?',
    content: 'Sūnus (9 m.) pasakojo, kad keli klasiokai jį pravardžiuoja ir stumdo. Kalbėjau su mokytoja, bet situacija nesikeičia. Ką daryti toliau? Ar kreiptis į mokyklos administraciją? Gal reikia psichologo? Kaip mokinti vaiką gintis?',
    authorName: 'Julija B.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'mokyklos',
    title: 'Dvikalbis vaikas mokykloje — ar sunkiau?',
    content: 'Mūsų šeimoje kalbame lietuviškai ir rusiškai. Dukra (6 m.) rugsėjį eis į lietuvišką mokyklą. Ar dvikalbiai vaikai turi sunkumų pradžioje? Gal reikia papildomų lietuvių kalbos pamokų prieš mokyklą?',
    authorName: 'Vytenis D.',
  },
  {
    categorySlug: 'mokyklos',
    title: 'Elektroninis dienynas — kaip dažnai tikrinate?',
    content: 'Pastebėjau, kad tapau priklausoma nuo elektroninio dienyno — tikrinu kelis kartus per dieną. Kiekvienas pažymys sukelia emocijas. Ar tai normalu? Kaip dažnai jūs tikrinate? Ar nekontroliuojate vaikų per daug?',
    authorName: 'Rasma G.',
  },
  {
    categorySlug: 'mokyklos',
    title: 'Mokyklos renginiai — ar tėvai privalo dalyvauti?',
    content: 'Mokykloje nuolat vyksta renginiai, spektakliai, šventės. Dirbu pilną etatą ir ne visada galiu dalyvauti. Ar vaikai labai nusimena, jei tėvai neateina? Kaip dažnai jūs dalyvaujate mokyklos renginiuose?',
    authorName: 'Birutė V.',
    city: 'Šiauliai',
  },

  // === Sveikata (7 posts) ===
  {
    categorySlug: 'sveikata',
    title: 'Vaiko svoris — kada nerimauti?',
    content: 'Sūnui 4 metai ir jis labai plonas — 14 kg. Valgo normaliai, bet neauga svoriu. Pediatrė sako, kad viskas gerai, bet seneliai nuolat baro, kad per mažai maitinu. Kada tikrai reikėtų nerimauti dėl vaiko svorio?',
    authorName: 'Skaistė R.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'sveikata',
    title: 'Antibiotikai vaikams — kiek kartų per metus normalu?',
    content: 'Per paskutinius metus sūnui (3 m.) skirti antibiotikai jau 4 kartus. Man atrodo, kad per daug. Ar gydytojas per lengvai skiria? Ar tai normalu darželinukams? Kaip atskirti, kada antibiotikai tikrai būtini?',
    authorName: 'Indrė J.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'sveikata',
    title: 'Vaiko miegas — kiek valandų reikia?',
    content: 'Dukra (5 m.) atsisako miegoti dieną, bet vakare užmiega 19 val. ir miega iki 6 ryto. Tai 11 valandų. Ar to pakanka? Darželyje sako, kad turi miegoti dieną, bet ji tiesiog guli ir nemiega. Ar verta priversti?',
    authorName: 'Ovidijus M.',
  },
  {
    categorySlug: 'sveikata',
    title: 'Enurezė — 5-metis dar šlapinasi naktį',
    content: 'Sūnui 5 metai ir jis vis dar šlapinasi naktį. Dieną viskas gerai, bet naktį — beveik kiekvieną naktį. Gydytojas sako palaukti iki 6-7 metų. Bet man nepatogu, ir vaikas pradeda gėdytis. Ar kas turėjote panašią patirtį?',
    authorName: 'Giedrė K.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'sveikata',
    title: 'Vitaminai vaikams — kuriuos tikrai reikia?',
    content: 'Vaistinėje daugybė vitaminų vaikams, bet nežinau, kurie tikrai reikalingi. Pediatrė rekomendavo tik vitamino D. O omega-3, multivitaminai, probiotikai — ar jie tikrai padeda? Ką duodate savo vaikams?',
    authorName: 'Gabrielė K.',
  },
  {
    categorySlug: 'sveikata',
    title: 'Vaiko ausų uždegimas — profilaktika',
    content: 'Dukrai (2,5 m.) per žiemą buvo jau 3 ausų uždegimai. Kiekvieną kartą antibiotikai ir skausmas. Gydytoja sako, kad kai kurie vaikai tiesiog tam linkę. Ar yra būdų tai prevenciškai gydyti? Gal kas bandėte homeopatiją?',
    authorName: 'Matas S.',
    city: 'Klaipėda',
  },
  {
    categorySlug: 'sveikata',
    title: 'Vaikų psichinė sveikata — ar kalbate apie jausmus?',
    content: 'Pastebėjau, kad mūsų kartoje daugiau kalbama apie vaikų psichinę sveikatą nei mūsų tėvai tai darė. Ar kalbatės su vaikais apie jausmus? Ar turite kokių nors ritualų — pvz., „kaip praėjo diena" pokalbius? Kokio amžiaus pradėjote?',
    authorName: 'Emilija R.',
  },

  // === Laisvalaikis (8 posts) ===
  {
    categorySlug: 'laisvalaikis',
    title: 'Šeimos dviračių žygis — maršrutai su vaikais',
    content: 'Norime pradėti dviračių žygius su vaikais (4 ir 7 m.). Kur Lietuvoje yra geri ir saugūs dviračių takai, tinkami šeimoms? Kiek km vaikai gali nuvažiuoti? Gal kas turite patirties ir galite pasidalinti maršrutais?',
    authorName: 'Lukas V.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Muziejai vaikams Lietuvoje — kurie įdomiausi?',
    content: 'Ieškome interaktyvių muziejų, kur vaikams (5 ir 8 m.) būtų įdomu. Energijos ir technologijų muziejų Vilniuje jau aplankėme. Ką dar rekomenduojate? Ar yra gerų muziejų ne tik Vilniuje?',
    authorName: 'Kajus L.',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Gimtadienio šventė gamtoje — idėjos',
    content: 'Sūnui sueis 6 metai birželį ir norime švęsti gamtoje. Galvojame apie pievą prie ežero ar mišką. Kokias veiklas organizuoti 10-15 vaikų? Lobių paieška, sporto žaidimai? Dalinkitės idėjomis!',
    authorName: 'Ieva D.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Žiemos veiklos su vaikais Lietuvoje',
    content: 'Kiekvieną žiemą svarstome, ką veikti su vaikais. Be čiuožyklos ir slidinėjimo — kokios dar žiemos veiklos? Gal kas žinote gerų vietų rogutėms, snieguolėms ar tiesiog žiemos pasivaikščiojimams su mažais vaikais?',
    authorName: 'Nojus B.',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Kempingas su vaikais — ką žinoti?',
    content: 'Pirmą kartą planuojame kempingą su 3 ir 5 metų vaikais. Kas svarbiausia pasiimti? Kaip užtikrinti saugumą? Ar vaikai miega palapinėje? Gal kas galite rekomenduoti geras kempingo vietas Lietuvoje?',
    authorName: 'Liepa G.',
    city: 'Panevėžys',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Šeimos stalo žaidimai — ką rekomenduojate?',
    content: 'Ieškome stalo žaidimų, kurie tiktų visai šeimai (vaikai 5 ir 8 m., tėvai). Turime „Monopoly Junior" ir „Dobble", bet norime daugiau. Kokie stalo žaidimai populiarūs jūsų šeimose? Gal yra gerų lietuviškų?',
    authorName: 'Rokas A.',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Vaikų teatrai ir spektakliai — ką žiūrite?',
    content: 'Norime pradėti vesti vaikus į teatrą. Dukrai 4 metai. Ar nebus per anksti? Kokius spektaklius rekomenduojate mažiausiems? Vilniuje yra keletas teatrų — Keistuolių, Lėlė. Kur geriausia pradėti?',
    authorName: 'Kotryna J.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Atostogos Lietuvoje su vaikais — geriausios vietos',
    content: 'Ne visada norime skristi į užsienį. Kokios geriausios vietos atostogoms Lietuvoje su mažais vaikais? Nida, Palanga — tai akivaizdu. Bet gal yra mažiau žinomų vietų? Ežerai, kaimo turizmo sodybos?',
    authorName: 'Eimantas N.',
  },
];

// ===== Comment templates (rich, diverse, Lithuanian) =====
const commentTemplates = [
  // Darželiai
  'Mes lankome darželį tame pačiame rajone ir galiu pasakyti, kad jis tikrai vertas dėmesio. Grupės mažos, auklėtojos rūpestingos.',
  'Patarimu — aplankykite darželį asmeniškai ir pasikalbėkite su kitais tėvais. Internete informacija ne visada atspindi realybę.',
  'Mes keliame darželių klausimą savivaldybėje — eilės tikrai absurdiškos. Reikia daugiau vietų.',
  'Kainos kasmet auga. Pernai mokėjome 280 EUR, dabar jau 350 EUR. Ir tai dar ne Vilnius.',
  'Adaptacija priklauso nuo vaiko temperamento. Mūsų pirmas vaikas adaptavosi per savaitę, antras — per 2 mėnesius.',
  'Labai svarbu, kad darželyje būtų gera ventiliacija ir švarumas. Ypač po COVID patirties.',
  'Montessori metodika mūsų šeimai tiko puikiai. Vaikas tapo savarankiškesnis ir labiau pasitikintis savimi.',
  'Mūsų darželyje tėvai gali bet kada ateiti ir pamatyti, kaip vyksta diena. Tai labai ramina.',

  // Auklės
  'Auklės kaina Kaune — apie 6-8 EUR per valandą. Vilniuje — 8-12 EUR. Patirtis ir kvalifikacija kainą kelia.',
  'Sutartyje būtina nurodyti darbo valandas, atlyginimą, atostogas ir atleidimo sąlygas. Mes to nepadarėme ir turėjome problemų.',
  'Rekomendacijos — svarbiausias dalykas renkantis auklę. Būtinai paskambinkite buvusiems darbdaviams.',
  'Mes naudojame kamerą ir auklė apie tai žino. Tai suteikia ramybę, ypač pirmomis savaitėmis.',
  'Auklė su pedagoginiu išsilavinimu tikrai daro skirtumą — ji ne tik prižiūri, bet ir ugdo vaiką.',
  'Pirmąją savaitę rekomenduoju būti namuose ir palaipsniui perleisti atsakomybę auklei.',

  // Būreliai
  'Mūsų dukra lanko plaukimą nuo 4 metų ir dabar puikiai plaukia. Pradžioje buvo daugiau žaidimų, bet palaipsniui pradėjo mokytis technikos.',
  'Šachmatai nuo 5 metų — puikus pasirinkimas. Lavina mąstymą, kantrybę ir strateginį planavimą.',
  'Per daug būrelių — tikra problema. Mes sumažinome iki 2 per savaitę ir vaikas atsipalaidavo.',
  'Robotika — ateities įgūdis. Mūsų sūnus dabar kuria projektus ir dalyvauja varžybose.',
  'Dailė padeda vaikams išreikšti emocijas. Mūsų dukros piešiniai per metus labai pasikeitė.',
  'Muzikos būrelis nuo 3 metų — labai gerai. Vaikai mokosi ritmo, klausos ir bendradarbiavimo.',
  'Karate mūsų sūnui labai padėjo — tapo drausmingesnis ir pasitikintis savimi.',

  // Specialistai
  'Einame pas logopedą jau pusmetį ir matome didelį progresą. Kantrybė ir reguliarumas — svarbiausia.',
  'Vaikų psichologė padėjo mūsų dukrai po skyrybų. Labai rekomenduoju nebijoti kreiptis.',
  'Privačiai pas neurologą patekome per savaitę, valstybinėje — 3 mėnesių eilė. Kaina 60-80 EUR.',
  'Ergoterapija buvo stebuklas mūsų sūnui. Po kelių mėnesių jis jau noriai piešia ir rašo.',
  'Antra nuomonė niekada nepakenks. Mes pakeitėme gydytoją ir diagnozė pasikeičiau iš esmės.',
  'Logopedą geriausia lankyti bent 2 kartus per savaitę. Vienas kartas — per retai norint matyti greitą rezultatą.',
  'Dantų gydytojas su sedacija — geriausias sprendimas nervingam vaikui. Jokio streso.',

  // Tėvystė
  'Ekranų laikas — sunkiausia tema. Mes sutarėme dėl taisyklių ir laikomės. 30 min. darbo dienomis, 1 val. savaitgaliais.',
  'Isterikos — tai normali 3-mečio raidos dalis. Prasideda ir praeina. Svarbiausia — likti ramiam pačiam.',
  'Knyga „Kaip kalbėti, kad vaikai klausytų" — labai padėjo mūsų šeimai. Rekomenduoju.',
  'Tėčio vaidmuo mūsų šeimoje — vakarinis ritualas. Maudymas, skaitymas, guldymas. Vaikai laukia.',
  'Perdegimas — rimta problema. Kreipkitės pagalbos, prašykite senelių padėti. Jūs negalite visko padaryti vieni.',
  'Savarankiškumas labai svarbus. Taip, tai trunka ilgiau, bet vaikas mokosi atsakomybės.',
  'Brolių/sesių konfliktai — visiškai normalu. Svarbu mokyti spręsti konfliktus, o ne juos malšinti.',
  'Pagyrimas pastangų tikrai veikia. Vaikas pradeda labiau stengtis, o ne bijoti klysti.',

  // Mokyklos
  'Priešmokyklinė grupė davė mūsų vaikui daug — išmoko laukti eilėje, dalintis, klausyti mokytojo.',
  'Waldorf mokykloje vaikai mokosi per patyrimą. Mūsų sūnus ten laimingas ir motyvuotas.',
  'Namų darbai pirmokams neturėtų būti ilgiau nei 20-30 min. Jei ilgiau — kalbėkite su mokytoja.',
  'Uniforma — puikus sprendimas. Ryte nereikia galvoti, ką vilkti. Vaikai nesiskirsto pagal drabužius.',
  'Pailgintos dienos grupėje vaikai daro namų darbus ir žaidžia. Mūsų dukrai patinka.',
  'Patyčios — rimta problema. Mes kreipėmės į mokyklos psichologą ir situacija pagerėjo.',
  'Elektroninį dienyną tikrinu kartą per savaitę. Kasdien tikrinti — tikras stresas ir kontrolės mania.',

  // Sveikata
  'Vitaminas D — privalomas visus metus. Mūsų pediatrė taip pat rekomenduoja omega-3.',
  'Pirmi 2 metai darželyje — nuolatinis sirgimas. Bet paskui imunitetas tikrai sustiprėja.',
  'Antibiotikus reikia gerti tik kai tikrai būtina. Prašykite gydytojo paaiškinti, kodėl skiria.',
  'Enurezė iki 6-7 metų — medicinos norma. Nereikia gėdinti vaiko ar nerimauti per daug.',
  'Probiotikai po antibiotikų kūro — būtini. Mūsų šeimos gydytoja visada rekomenduoja.',
  'Ausų uždegimai dažni mažiems vaikams. Mūsų padėjo adenoidų operacija — susirgimų sumažėjo drastiškai.',
  'Apie jausmus kalbame kiekvieną vakarą. Turime „jausmų ratą" ant šaldytuvo ir vaikai rodo, kaip jaučiasi.',

  // Laisvalaikis
  'Nidos dviračių takas — nuostabus su vaikais. 30 km nuo Nidos iki Juodkrantės, bet galima nuvažiuoti tik dalį.',
  'Kempingas su vaikais — geriausios atostogos! Pasiimkite daug stalo žaidimų ir nepriklausykite nuo oro.',
  'Energijos ir technologijų muziejus Vilniuje — privalomas vizitas su vaikais. Interaktyvus ir įdomus.',
  'Stalo žaidimas „Katicė" — lietuviškas ir labai smagi visa šeima žaisti. Nuo 5 metų tinka.',
  'Keistuolių teatras — nuostabus pirmajai teatro patirčiai. Spektakliai neilgi ir labai spalvingi.',
  'Zuikių sala Kaune — puiki vieta pasivaikščioti su vaikais. Žaidimų aikštelė ir gamta.',
  'Lietuvos pajūris rudenį — nuostabu. Mažiau žmonių, gražūs vaizdai, ir vaikai gali laisvai bėgioti.',
  'Anykščių lajų takas — vaikams nuo 4 metų puikiai tinka. Nepamirštama patirtis!',

  // Generic
  'Ačiū už klausimą — pati apie tai galvojau, bet nedrįsau paklausti.',
  'Labai naudinga diskusija! Sekuosi patarimus ir kai kuriuos jau taikau.',
  'Visiškai suprantu jūsų situaciją. Mes perėjome tuo pačiu ir galiu pasakyti — bus geriau!',
  'Puikus patarimas! Būtinai išbandysiu.',
  'Mūsų patirtis labai panaši. Svarbu nepasiduoti ir ieškoti sprendimų.',
  'Ačiū, kad pasidalinote. Tokios diskusijos labai padeda tėvams jaustis ne vieniems.',
  'Sutinku su ankstesniu komentaru — kantrybė yra svarbiausia.',
  'Mes taip pat turėjome abejonių, bet galų gale priėmėme sprendimą ir nesigailime.',
  'Labai gera tema! Norėčiau daugiau tokių diskusijų šiame forume.',
  'Ačiū visiems už patarimus — daug naudingos informacijos vienoje vietoje.',
  'Tai tikrai aktuali problema daugeliui šeimų. Gerai, kad apie tai kalbame.',
  'Mano draugė turėjo panašią situaciją ir kreipėsi pagalbos — situacija labai pagerėjo.',
  'Niekada nereikia bijoti klausti — geriau sužinoti daugiau nuomonių.',
  'Mes irgi tą patį patyrėme. Svarbu pasitikėti savo intuicija kaip tėvams.',
  'Puiku, kad dalitės savo patirtimi — tai padeda kitiems tėvams.',
];

// ===== Reply templates (shorter, conversational) =====
const replyTemplates = [
  'Visiškai sutinku! Mūsų patirtis labai panaši.',
  'Ačiū, labai naudinga informacija!',
  'O kiek tai kainavo, jei galite pasidalinti?',
  'Mes irgi ten buvome ir galime patvirtinti — tikrai verta.',
  'Ar galėtumėte duoti daugiau detalių? Labai domina.',
  'Tai puikus patarimas — pabandysime!',
  'Mes bandėme tą patį ir irgi padėjo.',
  'Hm, mūsų patirtis buvo kitokia — mums nepadėjo.',
  'Labai džiaugiuosi, kad jums pavyko!',
  'Mes irgi svarstome apie tai. Jūsų komentaras įkvepia.',
  'Galiu tik patvirtinti — tikrai taip ir yra.',
  'O kokiame mieste tai buvo?',
  'Ačiū! Kaip tik ieškojau tokios informacijos.',
  'Tai labai svarbus pastebėjimas. Ačiū, kad pasidalinote.',
  'Mūsų gydytojas sakė tą patį — gerai žinoti, kad kiti tėvai taip pat tai patvirtina.',
  'Ar tinka 3-mečiui? Mano dukra tokio amžiaus.',
  'Super! Mes užsiregistravome — pradedame kitą savaitę.',
  'O kur tiksliai yra? Galėtumėte parašyti adresą?',
  'Labai gera idėja! Kodėl aš pati nepagalvojau?',
  'Mes buvome skeptiški, bet pabandėme ir tikrai veikia!',
  'Ačiū — persiųsiu šį patarima savo vyrui/žmonai.',
  'Tikrai taip. Vaikams reikia laiko, ir mes turime būti kantrūs.',
  'Mes tą darėme kitaip, bet jūsų metodas atrodo geresnis.',
  'Galiu parekomenduoti panašią vietą — parašysiu privačiai.',
  'Tai labai aktualu — ačiū, kad iškėlėte šią temą.',
];

// ===== Sub-reply templates (level 3, very short) =====
const subReplyTemplates = [
  'Taip, patvirtinu — labai gerai!',
  'Mes irgi bandysime, ačiū!',
  'Tikrai taip, sutinku.',
  'O, nežinojau! Ačiū už informaciją.',
  'Puiku, kad pasidalinote!',
  'Mes irgi ten buvome — rekomenduojame.',
  'Ačiū, labai naudinga.',
  'Suprantu, ačiū už paaiškinimą.',
  'Tikrai verta pabandyti!',
  'Mūsų draugai irgi taip sako.',
  'Gerai žinoti, ačiū!',
  'Būtinai pasidomėsiu plačiau.',
  'Tai mane nuramina — ačiū.',
  'Labai džiaugiuosi, kad radau šią diskusiją.',
  'Tiksliai taip ir yra!',
];

async function seedMoreForumContent() {
  console.log('=== Seeding additional forum posts and comments ===\n');

  // Get category map
  const categories = await prisma.forumCategory.findMany();
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    categoryMap.set(cat.slug, cat.id);
  }
  console.log(`Found ${categories.length} categories.`);

  // Get existing slugs to avoid conflicts
  const existingPosts = await prisma.forumPost.findMany({ select: { slug: true } });
  const usedSlugs = new Set(existingPosts.map((p) => p.slug));
  console.log(`Found ${existingPosts.length} existing posts.\n`);

  const rand = seededRandom('forum-extra-seed-2026-v2');

  // Create posts
  console.log('Creating new posts...');
  const createdPostIds: string[] = [];
  let postsCreated = 0;

  for (const post of newPosts) {
    const categoryId = categoryMap.get(post.categorySlug);
    if (!categoryId) {
      console.error(`  Category not found: ${post.categorySlug}`);
      continue;
    }

    let slug = slugify(post.title);
    let attempt = 0;
    while (usedSlugs.has(slug)) {
      attempt++;
      slug = slugify(post.title) + '-' + attempt;
    }
    usedSlugs.add(slug);

    // Random timestamp within last 4 months
    const daysAgo = Math.floor(rand() * 120);
    const createdAt = new Date('2026-03-01T12:00:00Z');
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(Math.floor(rand() * 14) + 7);
    createdAt.setMinutes(Math.floor(rand() * 60));

    // Random votes and views
    const upvotes = Math.floor(rand() * 50);
    const downvotes = Math.floor(rand() * 10);
    const viewCount = upvotes * Math.floor(rand() * 10 + 3) + Math.floor(rand() * 100) + 5;

    const created = await prisma.forumPost.create({
      data: {
        title: post.title,
        slug,
        content: post.content,
        authorName: post.authorName,
        categoryId,
        city: post.city || null,
        upvotes,
        downvotes,
        viewCount,
        createdAt,
        updatedAt: createdAt,
      },
    });

    createdPostIds.push(created.id);
    postsCreated++;
  }

  console.log(`  Created ${postsCreated} new posts.\n`);

  // Now create comments on ALL posts (new + existing)
  // We need 200+ new comments
  console.log('Creating new comments...');
  let commentCount = 0;

  // Get all post IDs (existing + new)
  const allPosts = await prisma.forumPost.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' },
  });

  // Distribute comments: new posts get 3-7 comments each, some existing posts get extra comments
  // New posts (56 posts * avg 4 comments = ~224 comments)

  for (const postId of createdPostIds) {
    const numTopLevel = Math.floor(rand() * 5) + 3; // 3-7 top level comments

    for (let i = 0; i < numTopLevel; i++) {
      const authorIdx = Math.floor(rand() * authorNames.length);
      const textIdx = Math.floor(rand() * commentTemplates.length);

      const daysAgo = Math.floor(rand() * 30);
      const commentDate = new Date('2026-03-01T12:00:00Z');
      commentDate.setDate(commentDate.getDate() - daysAgo);
      commentDate.setHours(Math.floor(rand() * 14) + 7);
      commentDate.setMinutes(Math.floor(rand() * 60));

      const upvotes = Math.floor(rand() * 15);
      const downvotes = Math.floor(rand() * 3);

      const comment = await prisma.forumComment.create({
        data: {
          postId,
          content: commentTemplates[textIdx],
          authorName: authorNames[authorIdx],
          upvotes,
          downvotes,
          createdAt: commentDate,
        },
      });
      commentCount++;

      // 50% chance of a reply (level 2)
      if (rand() < 0.5) {
        const replyAuthorIdx = Math.floor(rand() * authorNames.length);
        const replyTextIdx = Math.floor(rand() * replyTemplates.length);

        const replyDate = new Date(commentDate);
        replyDate.setHours(replyDate.getHours() + Math.floor(rand() * 48) + 1);

        const reply = await prisma.forumComment.create({
          data: {
            postId,
            parentId: comment.id,
            content: replyTemplates[replyTextIdx],
            authorName: authorNames[replyAuthorIdx],
            upvotes: Math.floor(rand() * 8),
            downvotes: Math.floor(rand() * 2),
            createdAt: replyDate,
          },
        });
        commentCount++;

        // 35% chance of a sub-reply (level 3)
        if (rand() < 0.35) {
          const subReplyAuthorIdx = Math.floor(rand() * authorNames.length);
          const subReplyTextIdx = Math.floor(rand() * subReplyTemplates.length);

          const subReplyDate = new Date(replyDate);
          subReplyDate.setHours(subReplyDate.getHours() + Math.floor(rand() * 24) + 1);

          await prisma.forumComment.create({
            data: {
              postId,
              parentId: reply.id,
              content: subReplyTemplates[subReplyTextIdx],
              authorName: authorNames[subReplyAuthorIdx],
              upvotes: Math.floor(rand() * 4),
              downvotes: 0,
              createdAt: subReplyDate,
            },
          });
          commentCount++;
        }
      }
    }
  }

  console.log(`  Created ${commentCount} new comments on new posts.`);

  // Also add some extra comments to existing posts (to pad the numbers)
  // Pick ~30 random existing posts and add 1-2 comments each
  const existingPostIds = allPosts
    .filter((p) => !createdPostIds.includes(p.id))
    .map((p) => p.id);

  let extraComments = 0;
  const numExistingToComment = Math.min(existingPostIds.length, 30);

  for (let i = 0; i < numExistingToComment; i++) {
    const postIdx = Math.floor(rand() * existingPostIds.length);
    const postId = existingPostIds[postIdx];

    const numNew = Math.floor(rand() * 2) + 1; // 1-2 new comments
    for (let j = 0; j < numNew; j++) {
      const authorIdx = Math.floor(rand() * authorNames.length);
      const textIdx = Math.floor(rand() * commentTemplates.length);

      const daysAgo = Math.floor(rand() * 14);
      const commentDate = new Date('2026-03-01T12:00:00Z');
      commentDate.setDate(commentDate.getDate() - daysAgo);
      commentDate.setHours(Math.floor(rand() * 14) + 7);
      commentDate.setMinutes(Math.floor(rand() * 60));

      await prisma.forumComment.create({
        data: {
          postId,
          content: commentTemplates[textIdx],
          authorName: authorNames[authorIdx],
          upvotes: Math.floor(rand() * 10),
          downvotes: Math.floor(rand() * 2),
          createdAt: commentDate,
        },
      });
      extraComments++;
    }
  }

  console.log(`  Created ${extraComments} extra comments on existing posts.`);
  console.log(`  Total new comments: ${commentCount + extraComments}\n`);

  // Final counts
  const totalPosts = await prisma.forumPost.count();
  const totalComments = await prisma.forumComment.count();

  // Per-category breakdown
  const catCounts = await prisma.forumPost.groupBy({
    by: ['categoryId'],
    _count: true,
  });

  console.log('=== Final Counts ===');
  console.log(`  Total posts: ${totalPosts}`);
  console.log(`  Total comments: ${totalComments}`);
  console.log('\n=== Posts per category ===');
  for (const cc of catCounts) {
    const cat = categories.find((c) => c.id === cc.categoryId);
    console.log(`  ${cat?.name || cc.categoryId}: ${cc._count}`);
  }

  // Verify targets
  console.log('\n=== Target Verification ===');
  console.log(`  Posts: ${totalPosts} (target: 113+) — ${totalPosts >= 113 ? 'PASS' : 'FAIL'}`);
  console.log(`  Comments: ${totalComments} (target: 517+) — ${totalComments >= 517 ? 'PASS' : 'FAIL'}`);
}

seedMoreForumContent()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
