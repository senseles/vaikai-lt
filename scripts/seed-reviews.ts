import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────
// REVIEW QUALITY SYSTEM v2
// - Entity-specific reviews using actual features/descriptions
// - Template composition for uniqueness (opener + detail + closer)
// - Max 15 reviews per entity, min 3
// - No single text used more than 5 times globally
// - Authentic Lithuanian parent language from real forums
// - Rating distribution: 5% ★1, 10% ★2, 20% ★3, 35% ★4, 30% ★5
// ──────────────────────────────────────────────────────────────

const authorNames = {
  female: [
    'Rūta M.', 'Aistė K.', 'Greta P.', 'Simona V.', 'Laura B.', 'Sandra K.',
    'Monika J.', 'Eglė V.', 'Daiva S.', 'Jurgita R.', 'Inga M.', 'Vaida L.',
    'Neringa K.', 'Kristina P.', 'Jolanta K.', 'Rita S.', 'Aušra M.', 'Ieva B.',
    'Agnė D.', 'Dovilė R.', 'Renata P.', 'Dalia P.', 'Inga T.', 'Gintarė B.',
    'Virginija S.', 'Edita M.', 'Asta K.', 'Justina M.', 'Viktorija S.',
    'Milda R.', 'Ramunė S.', 'Kristina L.', 'Dalia A.', 'Sigita R.', 'Rima D.',
    'Lina K.', 'Birutė H.', 'Loreta Ž.', 'Austėja N.', 'Raminta D.',
    'Žydrė O.', 'Nomeda S.', 'Vida R.', 'Gabija F.', 'Indrė S.', 'Gabrielė D.',
    'Milda Č.', 'Austėja R.', 'Sonata L.', 'Vaida T.', 'Lina A.',
    'Jūratė U.', 'Giedrė J.', 'Erika V.', 'Vilma G.', 'Daiva J.',
    'Neringa T.', 'Ieva R.', 'Aistė D.', 'Sigita L.', 'Monika A.',
    'Sandra Č.', 'Dovilė N.', 'Agnė Š.', 'Simona Z.', 'Karolina B.',
    'Beata R.', 'Evelina M.', 'Jurgita P.', 'Viktorija K.', 'Aurelija S.',
    'Diana G.', 'Rasa T.', 'Jolita V.', 'Natalija K.', 'Živilė P.',
    'Edita K.', 'Alma R.', 'Birutė S.', 'Gražina M.', 'Irena L.',
  ],
  male: [
    'Jonas L.', 'Vytautas S.', 'Mindaugas R.', 'Tadas K.', 'Lukas G.',
    'Paulius G.', 'Tomas V.', 'Andrius M.', 'Giedrius T.', 'Artūras B.',
    'Marius L.', 'Andrius L.', 'Darius V.', 'Edvardas P.', 'Matas V.',
    'Domantas J.', 'Paulius A.', 'Edvinas K.', 'Dainius V.', 'Mindaugas P.',
    'Rokas S.', 'Karolis M.', 'Mantas D.', 'Deividas R.', 'Aivaras K.',
    'Tautvydas G.', 'Povilas B.', 'Martynas Š.', 'Evaldas T.', 'Donatas J.',
    'Robertas N.', 'Algirdas V.', 'Gediminas K.', 'Saulius R.', 'Viktoras M.',
  ],
};

const allNames = [...authorNames.female, ...authorNames.male];

// ──────────────────────────────────────────────────────────────
// FEATURE → REVIEW MENTION MAP
// Maps entity features to natural review snippets
// ──────────────────────────────────────────────────────────────
const featureReviewSnippets: Record<string, { positive: string[]; neutral: string[]; negative: string[] }> = {
  'Logopedas': {
    positive: [
      'logopedė tiesiog nuostabi — per pusmetį mūsų vaikas pradėjo taisyklingai tarti „r" ir „š"',
      'labai vertiname, kad darželyje yra logopedė. Nereikia ieškoti papildomai ir vežioti vaiką po miestą',
      'darželio logopedė pastebėjo kalbos vėlavimą anksčiau nei mes patys. Labai dėkingi už profesionalumą',
    ],
    neutral: [
      'yra logopedė, bet eilė pas ją ilga — teko palaukti porą mėnesių',
      'logopedė dirba, bet tik 2 kartus per savaitę — norėtųsi dažniau',
    ],
    negative: [
      'logopedė yra tik popierinė — realiai vaikas gauna gal 2 užsiėmimus per mėnesį',
    ],
  },
  'Psichologas': {
    positive: [
      'psichologė padėjo mūsų vaikui per adaptacijos periodą — profesionali ir jautri',
      'labai gerai, kad darželyje dirba psichologė. Kai vaikas turėjo sunkumų su draugais, iškart sureagavo',
    ],
    neutral: [
      'psichologė yra, bet sunku patekti — aptarnauja per daug grupių',
    ],
    negative: [],
  },
  'Baseinas': {
    positive: [
      'baseinas — didžiausias šio darželio pliusas! Vaikas mokosi plaukti nuo 3 metų ir labai džiaugiasi',
      'baseinas puikus — vaikai plaukioja 2 kartus per savaitę. Mūsų sūnus per pusmetį išmoko plaukti',
      'dėl baseino ir pasirinkome šį darželį. Vaikas labai mėgsta vandens užsiėmimus',
    ],
    neutral: [
      'baseinas yra, bet vanduo kartais per šaltas pagal vaiką. Vis tiek malonu kad tokia galimybė',
    ],
    negative: [],
  },
  'Baseinėlis': {
    positive: [
      'baseinėlis mažiesiems — puiki idėja! Vaikai praplaukia ir būna laimingi visą dieną',
      'dėl baseinėlio ir pasirinkome. Vaikui labai patinka vanduo, o čia saugi aplinka mokytis',
    ],
    neutral: [],
    negative: [],
  },
  'Sporto salė': {
    positive: [
      'sporto salė didelė ir gerai įrengta — vaikai turi kur judėti net žiemą',
      'labai patinka, kad yra sporto salė. Mūsų aktyviam vaikui tai svarbu — grįžta namo pavargęs ir laimingas',
    ],
    neutral: [
      'sporto salė yra, bet ne visada prieinama — kartais užimta renginiais',
    ],
    negative: [],
  },
  'Meninis ugdymas': {
    positive: [
      'meninis ugdymas čia tikrai stiprus — vaikas piešia, lipdo, kuria. Kiekvieną dieną parneša naujų darbelių',
      'labai patinka meninio ugdymo programa — vaikas tapo kūrybingesnis ir drąsesnis išreikšti save',
    ],
    neutral: [
      'meninis ugdymas yra, bet galėtų būti intensyvesnis. Kartais atrodo formalus',
    ],
    negative: [],
  },
  'Montessori metodika': {
    positive: [
      'Montessori metodika čia taikoma profesionaliai — vaikas mokosi savarankiškumo ir tai matosi namuose',
      'labai patenkinti Montessori programa! Vaikas pats rengiasi, pats tvarko žaislus — nuostabu',
    ],
    neutral: [
      'Montessori elementai yra, bet ne pilna programa. Vis tiek gerai, kad bent kažkiek taikoma',
    ],
    negative: [],
  },
  'Montessori elementai': {
    positive: [
      'patinka kad darželis taiko Montessori elementus — vaikas mokosi pasirinkti veiklą pats',
      'Montessori elementai matosi — vaikai turi laisvės rinktis, bet kartu ir struktūrą',
    ],
    neutral: [],
    negative: [],
  },
  'Anglų kalba': {
    positive: [
      'anglų kalbos pamokos — puiku! Vaikas jau moka skaičiuoti iki 20 angliškai ir žino spalvas',
      'labai vertiname anglų kalbos pamokas. Vaikas per metus pramoko pagrindinių žodžių — gera investicija',
    ],
    neutral: [
      'anglų kalba yra, bet tik kartą per savaitę. Norėtųsi dažniau',
    ],
    negative: [],
  },
  'Muzikos užsiėmimai': {
    positive: [
      'muzikos užsiėmimai nuostabūs — vaikas namuose dainuoja visas darželyje išmoktas dainas',
      'muzikos pamokos labai patinka vaikui. Mokosi ritmikos, dainelių, net groja instrumentais',
    ],
    neutral: [],
    negative: [],
  },
  'Muzikinis ugdymas': {
    positive: [
      'muzikinis ugdymas stiprus — vaikas dalyvavo koncerte ir mes buvome sužavėti',
    ],
    neutral: [],
    negative: [],
  },
  'Muzikos pamokos': {
    positive: [
      'muzikos pamokos vaikui labai patinka — mokosi dainuoti ir groti ritminiais instrumentais',
    ],
    neutral: [],
    negative: [],
  },
  'Teatras': {
    positive: [
      'teatro užsiėmimai — vaikas tapo drąsesnis kalbėti prieš kitus. Per šventę vaidino — buvome sužavėti!',
    ],
    neutral: [],
    negative: [],
  },
  'Teatro būrelis': {
    positive: [
      'teatro būrelis padėjo vaikui atsikratyti drovumo. Dabar drąsiai pasakoja eilėraščius prieš visą grupę',
    ],
    neutral: [],
    negative: [],
  },
  'Keramika': {
    positive: [
      'keramikos užsiėmimai — vaikas parneša nuostabių darbelių. Labai raminanti ir kūrybinga veikla',
    ],
    neutral: [],
    negative: [],
  },
  'Gamtos pažinimas': {
    positive: [
      'gamtos pažinimo programa puiki — vaikai sodina augalėlius, stebi paukščius, mokosi apie gamtą',
      'labai patinka gamtos pažinimo veiklos. Vaikas dabar žino visus miško gyvūnus ir paukščius',
    ],
    neutral: [],
    negative: [],
  },
  'Gamtos kampelis': {
    positive: [
      'gamtos kampelis darželyje — vaikas prižiūri augalėlius ir mokosi atsakomybės. Labai smagi idėja',
    ],
    neutral: [],
    negative: [],
  },
  'STEAM programa': {
    positive: [
      'STEAM programa tikrai veikia — vaikas eksperimentuoja, tyrinėja, klausia. Smalsumas sužadintas!',
    ],
    neutral: [],
    negative: [],
  },
  'STEAM ugdymas': {
    positive: [
      'STEAM ugdymas čia organizuojamas profesionaliai — vaikai daro eksperimentus ir mokosi per atradimus',
    ],
    neutral: [],
    negative: [],
  },
  'Robotika': {
    positive: [
      'robotikos užsiėmimai — sūnus tiesiog susižavėjęs! Programuoja LEGO robotus ir pasakoja apie tai visą vakarą',
    ],
    neutral: [],
    negative: [],
  },
  'Ekologinis ugdymas': {
    positive: [
      'ekologinis ugdymas čia ne tik žodžiais — vaikai rūšiuoja atliekas, augina daržoves. Namuose irgi pradėjo',
    ],
    neutral: [],
    negative: [],
  },
  'Ekologiškas maistas': {
    positive: [
      'ekologiškas maistas — labai svarbu mums. Vaikas valgo noriai, ir žinome kad produktai kokybiški',
    ],
    neutral: [],
    negative: [],
  },
  'Mažos grupės': {
    positive: [
      'grupėje tik 12 vaikų — tai didžiulis pliusas! Auklėtoja spėja kiekvienam skirti dėmesio',
      'mažos grupės — dėl to ir pasirinkome. Vaikas gauna individualų dėmesį, o ne pasimeta minioje',
    ],
    neutral: [],
    negative: [],
  },
  'Ilga darbo diena': {
    positive: [
      'darželis dirba iki 18:30 — labai patogu mums dirbantiems. Nereikia skubėti iš darbo',
    ],
    neutral: [],
    negative: [],
  },
  'Specialusis pedagogas': {
    positive: [
      'specialioji pedagogė labai padeda mūsų vaikui — individuali programa, kantrumas, profesionalumas',
    ],
    neutral: [],
    negative: [],
  },
  'Ergoterapeutas': {
    positive: [
      'ergterapeutė darželyje — didelis pliusas. Padeda vaikui su smulkiosios motorikos problemomis',
    ],
    neutral: [],
    negative: [],
  },
  'Šokiai': {
    positive: [
      'šokių pamokos vaikui labai patinka — grįžta namo ir šoka mums visą vakarą',
    ],
    neutral: [],
    negative: [],
  },
  'Šokių pamokos': {
    positive: [
      'šokių pamokos nuostabios — dukra tapo lankstesnė ir drąsesnė pasirodymuose',
    ],
    neutral: [],
    negative: [],
  },
  'Šokių užsiėmimai': {
    positive: [
      'šokių užsiėmimai — vaikui mėgstamiausia dienos dalis. Labai džiaugiamės',
    ],
    neutral: [],
    negative: [],
  },
  'Šokio studija': {
    positive: [
      'šokio studija darželyje — puiki galimybė vaikui judėti ir reikštis per šokį',
    ],
    neutral: [],
    negative: [],
  },
  'Sensorinis kambarys': {
    positive: [
      'sensorinis kambarys — nuostabu! Vaikas ten nusiramina ir susikaupia. Labai padeda po aktyvių veiklų',
    ],
    neutral: [],
    negative: [],
  },
  'Jogos pamokos': {
    positive: [
      'jogos pamokos vaikams — mūsų dukra pradėjo geriau miegoti ir būti ramesnė. Labai patinka',
    ],
    neutral: [],
    negative: [],
  },
  'Šachmatai': {
    positive: [
      'šachmatų būrelis ugdo mąstymą — sūnus pradėjo geriau susikaupti ir mokykloje',
    ],
    neutral: [],
    negative: [],
  },
  'Dailės studija': {
    positive: [
      'dailės studija nuostabi — vaikas per metus labai patobulėjo piešime. Darbeliai ant šaldytuvo kasdien',
    ],
    neutral: [],
    negative: [],
  },
  'Dramos studija': {
    positive: [
      'dramos studija padeda vaikui drąsiau reikšti emocijas ir bendrauti su kitais',
    ],
    neutral: [],
    negative: [],
  },
  'Menų studija': {
    positive: [
      'menų studija — vaikas ten ir piešia, ir lipdo, ir kuria koliažus. Labai kūrybiška aplinka',
    ],
    neutral: [],
    negative: [],
  },
  'Lauko aikštelė': {
    positive: [
      'lauko aikštelė puiki — nauja, saugi, su daug įrangos. Vaikai mielai žaidžia lauke',
    ],
    neutral: [
      'lauko aikštelė yra, bet galėtų būti didesnė. Kai visos grupės lauke — ankšta',
    ],
    negative: [],
  },
  'Lauko žaidimų aikštelė': {
    positive: [
      'lauko žaidimų aikštelė nauja ir gerai įrengta — čiuožyklės, supynės, smėlio dėžė. Vaikai laimingi',
    ],
    neutral: [],
    negative: [],
  },
  'Dietologas': {
    positive: [
      'labai gerai, kad darželyje yra dietologas — mūsų vaikui su alergija meniu pritaikomas individualiai',
    ],
    neutral: [],
    negative: [],
  },
  'Darželis + mokykla': {
    positive: [
      'puiku, kad darželis su mokykla — vaikas neturės keisti aplinkos kai eis į pirmą klasę',
    ],
    neutral: [],
    negative: [],
  },
  'Daugiakalbis (LT/PL/RU)': {
    positive: [
      'daugiakalbė aplinka — vaikas čia mokosi ir lietuviškai, ir lenkiškai. Mums tai labai svarbu',
    ],
    neutral: [],
    negative: [],
  },
  'Priešmokyklinis ugdymas': {
    positive: [
      'priešmokyklinis ugdymas organizuotas puikiai — vaikas jau skaito, rašo vardą ir skaičiuoja',
    ],
    neutral: [],
    negative: [],
  },
  'Ikimokyklinis ugdymas': {
    positive: [
      'ikimokyklinio ugdymo programa subalansuota — ir mokosi, ir žaidžia, ir kuria',
    ],
    neutral: [],
    negative: [],
  },
  'Muzikos kambarys': {
    positive: [
      'muzikos kambarys su instrumentais — vaikai ten groja, dainuoja, kuria. Labai smagi erdvė',
    ],
    neutral: [],
    negative: [],
  },
  'Sportas': {
    positive: [
      'sporto užsiėmimai — vaikas aktyvus ir grįžta namo pavargęs gera prasme',
    ],
    neutral: [],
    negative: [],
  },
  'Videofilmavimas': {
    positive: [
      'labai smagu, kad darželis filmuoja veiklas — galime matyti kaip vaikas leidžia dieną',
    ],
    neutral: [],
    negative: [],
  },
};

// Location-specific snippets for areas
const locationSnippets: Record<string, string[]> = {
  'Šalia Pavilnio regioninio parko': [
    'šalia Pavilnio parko — vaikai dažnai eina pasivaikščioti į gamtą. Puiki vieta!',
  ],
  'Šalia Markučių dvaro sodybos': [
    'šalia Markučių dvaro — vaikai vaikšto po parką ir mokosi istorijos',
  ],
  'Šalia Verkių parko': [
    'šalia Verkių parko — švarus oras, gamta aplinkui. Ideali vieta darželiui',
  ],
  'Šalia miško': [
    'šalia miško — vaikai eina į gamtą, renka lapus ir kankorėžius. Tikra gamtinė pedagogika',
  ],
  'Šalia Ąžuolyno parko': [
    'šalia Ąžuolyno parko — gražioje vietoje, vaikai dažnai eina pasivaikščioti',
  ],
};

// ──────── KINDERGARTEN REVIEWS — STANDALONE ────────
const kindergartenReviews: Array<{rating: number; texts: string[]}> = [
  // ★★★★★ (5 stars) — 70 texts
  { rating: 5, texts: [
    'Puikus darželis! Vaikai labai patenkinti, auklėtojos rūpestingos ir profesionalios. Rekomenduoju visiems tėveliams.',
    'Lankome jau antrus metus ir esame labai patenkinti. Maistas sveikas, patalpos švarios, programa įdomi.',
    'Mūsų vaikas pradėjo lankyti prieš pusmetį ir pokytis akivaizdus — kalba geriau, draugauja su kitais vaikais.',
    'Geriausia mūsų sprendimas buvo rinktis šį darželį. Auklėtoja tikrai dirba su kiekvienu vaiku individualiai.',
    'Kiekvieną dieną kai pasiimam vaiką — vis naujas darbeliai ant šaldytuvo. Vaikai užimti prasmingom veiklom.',
    'Mūsų dukra čia lanko jau trečius metus. Auklėtojos tikrai mylintys savo darbą žmonės. Vaikas bėga į darželį su džiaugsmu.',
    'Labai patenkinti šiuo darželiu. Maistas skanus, aplinka švari, vaikai nuolat užsiėmę prasmingom veiklom.',
    'Šis darželis — tikras lobis. Auklėtojos individualiai dirba su kiekvienu vaiku, pastebi jų stipriąsias puses.',
    'Mūsų sūnus pradėjo lankyti būdamas 2.5 m. Adaptacija praėjo sklandžiai, auklėtojos labai padėjo.',
    'Nuostabus darželis su atsidavusiu kolektyvu. Vaikas grįžta namo laimingas ir pasakoja apie dienos nuotykius.',
    'Esame labai patenkinti. Darželis turi puikią lauko aikštelę, vaikai daug juda ir kiekvieną dieną mokosi naujų dalykų.',
    'Labai gerai organizuotas ugdymo procesas. Vaikas greitai išmoko skaityti ir skaičiuoti.',
    'Vaikai prižiūrimi puikiai. Mano dukra pradėjo lankyti nuo 1.5 m, auklėtojos rado bendrą kalbą labai greitai.',
    'Mes labai ilgai ieškojome gero darželio ir pagaliau radome. Švarumas, tvarka, geras maistas — viskas kaip ir turi būti.',
    'Puikiai organizuotos šventės — Kalėdos, Velykos, gimtadieniai. Vaikai labai džiaugiasi.',
    'Patinka kad auklėtojos reguliariai informuoja apie vaiko dieną. Gauname nuotraukų ir žinučių.',
    'Mūsų trečias vaikas jau čia lanko — tai sako viską. Patikimas, geras darželis.',
    'Vaikas per pusmetį labai pasikeitė — pradėjo kalbėti pilnais sakiniais, tapo drąsesnis.',
    'Darželis mažas, jauku, kaip namuose. Auklėtojos visus vaikus žino vardu ir pastebi kiekvieną.',
    'Po kelių darželių pagaliau radome tinkamą. Čia vaikai gerbiami, su jais kalbama, o ne rėkiama.',
    'Nuo pirmos dienos supratome kad pasirinkome teisingai. Vaikas adaptavosi per savaitę.',
    'Maistas ruošiamas vietoje, ne atvežtinis. Jaučiasi skirtumas — vaikas valgo noriai.',
    'Darželis dirba ilgai — labai patogu dirbantiems tėvams. Nereikia skubėti iš darbo.',
    'Vaikas pradėjo lankyti neseniai, bet jau matosi pokytis. Drąsesnis, daugiau kalba, pasakoja apie draugus.',
    'Darželyje didelis dėmesys socialiniams įgūdžiams — vaikas išmoko dalintis, laukti eilėje.',
    'Ypatingai džiaugiamės muzikos užsiėmimais — vaikas namuose dainuoja visas darželyje išmoktas dainas.',
    'Labai patinka, kad yra logopedas ir psichologas darželyje. Nereikia ieškoti papildomai.',
    'Lauko teritorija didelė ir saugi. Vaikai gali bėgioti, kopti, suptiesi — viskas apgalvota.',
    'Vaikui buvo sunku adaptuotis pirmas dvi savaites, bet auklėtojos buvo labai kantrios ir padėjo.',
    'Mūsų sūnus čia lanko nuo lopšelio grupės. Dabar priešmokyklinukas ir puikiai pasiruošęs mokyklai.',
    'Auklėtojos pastebėjo kad mūsų vaikui reikia daugiau pagalbos su smulkiąja motorika ir pasiūlė pratimus.',
    'Vaikas jau moka skaityti ir rašyti savo vardą. Dar tik 5 metų! Darželio nuopelnas.',
    'Maistas tikrai geras — vaikas net prašo namie gaminti „kaip darželyje".',
    'Šventės darželyje visada šiltos ir jaukios. Jaučiamės kaip šeima.',
    'Auklėtojos kūrybingos — kiekvieną savaitę vis nauji projektai, eksperimentai, stebėjimai.',
    'Patogu kad darželis netoli namų, galima ateiti pėsčiomis. Bet svarbiausia — kokybė puiki.',
    'Darželio direktorė visada atvira pokalbiui, išklauso tėvų nuomones. Jaučiamės vertinami.',
    'Vaikas per metus tapo visiškai kitoks — iš drovaus, tylaus tapo drąsus ir bendraujantis.',
    'Patinka kad darželis organizuoja išvykas — buvome muziejuje, teatre, gamtoje.',
    'Labai rekomenduoju šį darželį. Profesionalus kolektyvas, gera aplinka, skanūs pietūs.',
    // New reviews based on real forum language
    'Nuoširdžiai ačiū auklėtojoms! Laikas prabėgo nepastebimai — paliekame darželį su gražiausiais prisiminimais.',
    'Vaikas labai nori ten eiti kiekvieną rytą. Tai turbūt geriausias darželio įvertinimas.',
    'Auklėtoja — tikra pašaukimo žmogus. Vaikai ją dievina, o mes esame ramūs palikus vaiką.',
    'Maistas gaminamas vietinėje virtuvėje iš lietuviškų produktų. Vaikas valgo su apetitu.',
    'Per pandemiją darželis puikiai susiorganizavo — nuotolinės veiklos, namų darbai. Buvome nustebinti.',
    'Pavyko gauti vietą per stebuklą — šis darželis labai populiarus. Ir suprantama kodėl!',
    'Mano vaikas bijojo vandens, bet darželyje per vasaros stovyklą pagaliau išdrįso. Labai dėkinga.',
    'Esame dėkingi šiam darželiui. Vaikas čia atrado draugų, pramoko daug naujų dalykų.',
    'Rekomenduoju visiems kaimynams! Geras darželis su šiltu kolektyvu.',
    'Darželis turėtų būti modelis kitiems. Viskas apgalvota — nuo ugdymo programos iki vaiko saugumo.',
    'Auklėtojos randa laiko kiekvienam vaikui. Matosi kad čia dirba ne dėl pinigų, o iš širdies.',
    'Vaikas grįžta namo ir pasakoja apie savo dieną — draugus, žaidimus, dainas. Tai svarbu.',
    'Puikiai paruošė vaiką mokyklai. Skaito, skaičiuoja, moka bendrauti — ačiū darželiui.',
    'Mūsų dukra atrado piešimą darželyje. Dabar tai jos didžiausia aistra. Ačiū auklėtojoms!',
    'Viskas labai gerai. Jei kas klausia patarimo — visada rekomenduoju šį darželį.',
    'Vaikas eina su džiaugsmu, o tai svarbiausia. Auklėtojos šaunuolės.',
    'Patinka šilta atmosfera. Ne konvejeris, o tikras namų jausmas.',
    'Labai geras darželis. Mūsų patirtis tik teigiama per 3 metus.',
    'Čia vaikas išmoko ne tik skaityti, bet ir draugauti, dalintis, padėti kitiems.',
    'Auklėtojos ne tik prižiūri, bet ir ugdo. Matosi profesionalumas ir meilė vaikams.',
  ]},
  // ★★★★ (4 stars) — 65 texts
  { rating: 4, texts: [
    'Gerai organizuotas darželis, bet kartais trūksta komunikacijos su tėvais. Vis dėlto rekomenduočiau.',
    'Vaikai gerai prižiūrimi, tačiau maitinimas galėtų būti geriau. Bendrai vertinu teigiamai.',
    'Auklėtojos labai stengiasi, bet grupėse per daug vaikų. Kitu atžvilgiu — viskas puiku.',
    'Geras darželis, programa subalansuota. Vaikas daug išmoko per trumpą laiką.',
    'Darželis atitinka lūkesčius. Maistas geras, veiklos įdomios. Kartais norėtųsi daugiau lauko laiko.',
    'Patinka darželis, bet norėtųsi daugiau kūrybinių veiklų. Auklėtojos geranoriškos.',
    'Bendrai gerai, nors kartais vaikas ateina namo su kitų vaikų drabužiais — sumaišo.',
    'Darželis geras, tik eilė priimti buvo ilga — laukėme beveik metus.',
    'Auklėtojos profesionalios, vaikas eina noriai. Vienintelis minusas — maistas kartais vienodas.',
    'Programa gera, bet norėtųsi daugiau informacijos apie vaiko dieną. Kartais nežinome ką veikė.',
    'Vaikas adaptuotis buvo sunku pirmas 3 savaites, bet dabar jau noriai eina.',
    'Geras darželis. Grupėje 18 vaikų — nemažai, bet auklėtoja susitvarko.',
    'Maitinimas galėtų būti geriau, bet visa kita — labai gerai. Vaikas laimingas.',
    'Patogu kad arti namų. Darželis tvarkingas, auklėtojos malonios.',
    'Gerai, bet pastatas galėtų būti atnaujintas. Viduje jau senas remontas.',
    'Geras darželis su keliomis pastabomis — kartais per vėlai informuoja apie renginius.',
    'Vaikai mokomi gerų manierų ir savarankiškumo. Tai matosi namuose.',
    'Auklėtoja gera, bet padėjėja kartais gruboka su vaikais. Tikiuosi pagerės.',
    'Maistas sveikas, bet vaikas sako „neskanu". Suprantu kad sunku visiems įtikti.',
    'Geras darželis, tik automobilių stovėjimas probleminis — ryte visada kamštis.',
    'Auklėtojos geros, bet vaikas dažnai serga. Manau per daug vaikų grupėje.',
    'Piešimo ir muzikos užsiėmimai labai patinka vaikui. Kūno kultūra galėtų būti dažniau.',
    'Vaikas eina noriai, turi draugų. Maistas vidutiniškas, bet ne tai svarbiausia.',
    'Darželis neblogas. Yra ką tobulinti, bet pagrindinai esame patenkinti.',
    'Darželis patogus, su geru kiemu. Tik šiek tiek sena įranga viduje.',
    'Bendrai gerai. Vaikas lanko 2 metus, esame patenkinti. Kartais būna smulkių nesklandumų.',
    'Darželis gerai organizuotas, bet maitinimo meniu galėtų būti įvairesnis.',
    'Auklėtojos puikios, bet administracija kartais lėtai reaguoja į užklausas.',
    'Geras darželis su kompetentingu personalu. Trūksta tik modernesnių žaislų.',
    'Vis dėlto rekomenduočiau. Mūsų patirtis daugiausiai teigiama, nors yra ką tobulinti.',
    'Darželis tvarkingas ir saugus. Auklėtojos rūpestingos. Trūksta tik anglų k. užsiėmimų.',
    'Mano vaikas ten laimingas, o tai svarbiausia. Yra smulkių minusų, bet jie neesminiai.',
    'Geras darželis, nors kartais trūksta komunikacijos. Rekomenduočiau bet su išlygomis.',
    'Auklėtojos šaunuolės, bet pastatas senas ir reikėtų remonto.',
    'Darželis atitinka mūsų lūkesčius. Ne idealus, bet geras.',
    'Geras darželis, ypač vertinu auklėtojų pastangas. Administracija galėtų būti draugiškesnė.',
    'Vaikai gerai užimti per dieną, ateina namo pavargę ir laimingi.',
    'Ne idealus, bet tikrai virš vidurkio. Rekomenduočiau kaimynams.',
    'Darželis gerai veikiantis, su stabilia komanda. Nuolatinė auklėtoja — ne besikeičiančios.',
    'Patenkinti. Vaikas daug ko išmoko, nors kartais norėtų daugiau lauko laiko.',
    'Geras darželis, gera kaina. Auklėtojos rūpestingos, programa subalansuota.',
    // New — based on real forum language
    'Darželis kaip darželis — nieko ypatingo, bet nieko ir blogo. Vaikui patinka.',
    'Auklėtojos man patinka — realistiškai mąstančios, suprantančios vaikus.',
    'Eilė buvo ilga, bet atsipirko — darželis tikrai geras. Vaikas prisitaikė greitai.',
    'Per didelės grupės — 22 vaikai — bet auklėtojos kaip nors tvarkosi.',
    'Maistas kartais ne koks, bet vaikas ir namuose kaprizingas — gal ne darželio kaltė.',
    'Adaptuotis vaikui buvo sunku — verkė porą savaičių. Bet dabar bėga ten su džiaugsmu.',
    'Gerai, kad informuoja per Tamo dienyną. Žinome ką vaikas veikė, ką valgė.',
    'Auklėtoja šauni, bet padėjėja per griežta. Kalbėjomės — situacija pagerėjo.',
    'Vaikas labai mėgsta lauko aikštelę — ten bėgioja ir kopia. Viduje — kartais nuobodu jam.',
    'Geras darželis, tik norėtųsi kad tėvų susirinkimai būtų dažniau. Kartais jaučiamės „atskirti".',
    'Patenkinti. Auklėtojos rūpestingos. Pastatas senokas, bet vaikui tai nesvarbu.',
    'Darželis OK. Kainos priimtinos, auklėtojos geranoriškos. Nieko ypatingo, bet viskas tvarkoje.',
    'Vaikas ten turi geriausią draugą — dėl to ir einame. Programa irgi patinka.',
    'Geras pasirinkimas už tokią kainą. Yra ir geresnių darželių, bet šis pilnai tinka.',
  ]},
  // ★★★ (3 stars) — 55 texts
  { rating: 3, texts: [
    'Darželis vidutiniškas. Yra ir pliusų, ir minusų. Vieta patogi, bet pastatas senas.',
    'Auklėtojos malonios, bet programa galėtų būti įdomesnė. Vaikas nenorai eina.',
    'Normalu, bet tikėjomės daugiau. Gal tiesiog ne mūsų stilius.',
    'Nieko ypatingo, bet ir nieko blogo. Standartinis darželis.',
    'Vidutiniškai. Maistas kartais geresnis, kartais prastesnis.',
    'Darželis normalus, bet per daug vaikų grupėje — 24! Individualaus dėmesio trūksta.',
    'Pastatas atnaujintas, bet programa sena. Vaikai daugiausia tiesiog žaidžia, mažai ugdymo.',
    'Vaikui patinka draugai, bet auklėtoja nelabai skiria dėmesio individualiems poreikiams.',
    'Maitinimas vidutiniškas. Vaikas dažnai sako „neskanu" ir grįžta alkanas.',
    'Darželis neblogas, bet tikrai ne geriausias rajone. Yra ir geresnių variantų.',
    'Adaptacija buvo sunki — truko 3 savaites. Auklėtojos galėjo labiau padėti.',
    'Normalu. Vaikas eina, draugai yra, bet nieko ypatingo neišmoksta.',
    'Darželis tvarkingas, bet programa monotoniška. Kasdien beveik tas pats.',
    'Lauko aikštelė maža ir sena. Viduje geriau, bet galėtų būti ir daugiau žaislų.',
    'Per daug biurokratijos — kiekvienam dalykui reikia rašyti prašymą.',
    'Maistas atvežtinis — nelabai skanus. Tai didžiausias minusas.',
    'Vaikas sirgo kas antrą savaitę pirmus 3 mėnesius. Manau higienos galėtų būti daugiau.',
    'Auklėtoja keičiasi kas pusmetį — vaikui sunku prisitaikyti prie naujų žmonių.',
    'Lokacija patogi, bet tai vienintelis didelis pliusas. Visa kita — vidutiniška.',
    'Vaikui kartais patinka, kartais ne. Priklauso nuo dienos ir auklėtojos nuotaikos.',
    'Per daug vaikų, per mažai auklėtojų. Personalas pervargęs — ir tai matosi.',
    'Maitinimas OK, ugdymas OK, bet trūksta šilumos. Jaučiasi „konvejeris".',
    'Buvo geriau kai pradėjome lankyti, dabar kokybė krito. Gal dėl personalo kaitos.',
    'Darželis normalus miesto darželis. Nei blogas, nei ypatingas.',
    'Kartais skambinu paklausti kaip vaikas — ne visada pavyksta prisiskambinti.',
    'Maitinimas galėtų būti geriau — per daug sausainių ir mažai daržovių.',
    'Vaikas lanko, nes nėra kito varianto šalia namų.',
    'Vidutiniškas darželis. Nei rekomenduočiau, nei atkalbinėčiau.',
    'Vaikas eina be ašarų — tai gerai. Bet ir be entuziazmo — tai blogai.',
    'Ne tai ko tikėjomės už tokią kainą. Privatus darželis turėtų siūlyti daugiau.',
    'Kaina atitinka kokybę — nei per brangu, nei per pigu. Vidutiniškai.',
    // New
    'Sena įranga, bet auklėtojos šiltos. Tai kompensuoja dalį trūkumų.',
    'Darželis geresnis nei tikėjomės pagal kainą, bet vis tiek — tik vidutiniškas.',
    'Vidutiniškas vertinimas. Auklėtojos stengiasi, bet matosi kad pervargusios.',
    'Darželis normalus. Vaikas turi draugų, ir tai pagrindinė priežastis kodėl lankome.',
    'Auklėtojos geranoriškos, bet patirties trūksta. Jaučiasi kad dar mokosi.',
    'Darželis ne blogas, bet komunikacija su tėvais minimali.',
    'Per mažai laiko lauke. Vaikai per daug laiko praleidžia viduje.',
    'Darželis vidutinis, bet mūsų grupės auklėtoja gera. Dėl jos ir lankome.',
    'Pirma savaitė buvo košmaras — vaikas verkė, auklėtojos gūžčiojo pečiais. Dabar geriau.',
    'Vaikai myli auklėtojas, bet maitinimas tikrai reikalauja pagerinimo.',
    'Skaičiavimo ir skaitymo moko, bet kūrybinių veiklų beveik nėra.',
    'Girdėjome gerų atsiliepimų, bet mūsų patirtis vidutiniška. Gavome ne tą grupę galbūt.',
    'Darželis OK. Nėra ko labai girti ar labai peikti.',
    'Normalus darželis. Tikėjomės geriau, bet tinka.',
  ]},
  // ★★ (2 stars) — 28 texts
  { rating: 2, texts: [
    'Deja, lūkesčiai nebuvo patenkinti. Grupėje per daug vaikų, o auklėtojos nuolat keičiasi.',
    'Per daug vaikų vienoje grupėje. Individualus dėmesys minimalus.',
    'Maistas šaltas ir neskanus — vaikas nuolat alkanas grįžta namo.',
    'Auklėtojos ignoruoja tėvų pastabas. Bandžiau kalbėtis — be rezultato.',
    'Vaikas parėjo namo su mėlyne ant rankos. Auklėtoja sakė „vaikai žaidė".',
    'Pastatas apleistas, lauko aikštelė nesaugi — suplyšę gumos dangos.',
    'Vaikas verkė kiekvieną rytą 2 mėnesius. Auklėtojos nesistengė padėti adaptuotis.',
    'Komunikacijos nulis. Nežinome ką vaikas veikia visą dieną.',
    'Per brangu už tai ką gauni. Privatus darželis su viešo lygio paslauga.',
    'Susirgimas po susirgimo. Vaikas per 3 mėnesius lankė gal 4 savaites.',
    'Auklėtoja rėkia ant vaikų. Vaikas pradėjo bijoti eiti į darželį.',
    'Darželis nepriima alergikų maisto — mūsų vaikui su alergija buvo neįmanoma.',
    'Eilė registracijai absurdiškai ilga — 1.5 metų! O kai patekome — nusivylėme.',
    'Darželis purvinas. Tualetai seni, prausyklos surūdiję.',
    'Programa visiškai neįdomi — vaikai tiesiog sėdi ir žiūri multikus.',
    'Auklėtoja pati su telefonu sėdi, vaikai patys sau. Mačiau savo akimis.',
    'Maitinimas monotoniškas — kas antrą dieną makaronai su mėsa.',
    'Vaikas pradėjo elgtis agresyviai namuose — manau perėmė iš darželio aplinkos.',
    'Nusivylėme. Daug gerų atsiliepimų internete, bet realybė visai kitokia.',
    'Auklėtojos keičiasi nuolat — vaikas nespėja priprasti prie vienos, jau kita.',
    'Darželis neskiria dėmesio vaikams su specialiais poreikiais.',
    'Per daug ekranų laiko — vaikai žiūri filmukus kai auklėtojoms reikia pertraukos.',
    'Negaliu rekomenduoti. Mūsų patirtis buvo bloga nuo pradžios iki galo.',
    // New
    'Kiemas labai varganai atrodo — mažai vietos, mažai įrangos. Liūdna.',
    'Grupė pasirodė netvarkinga. Man kelia abejonių ar personalas kompetentingas.',
    'Vaikas subraižytas, o auklėtoja nežino kas nutiko. Priežiūra abejotina.',
    'Lauko aikštelėje sena ir nesaugi įranga. Bijojome dėl vaiko saugumo.',
    'Kainos kyla, o kokybė krenta. Per pastaruosius metus viskas pablogėjo.',
  ]},
  // ★ (1 star) — 18 texts
  { rating: 1, texts: [
    'Baisiausia patirtis. Vaikas grįžo namo šlapias, alkanas ir verkiantis. Daugiau nebeleidome.',
    'Apleistas darželis be jokio ugdymo. Vaikai tiesiog uždaryti patalpoje visai dienai.',
    'Auklėtoja šaukė ant mano 3 metų vaiko! Visiškai nepriimtina. Išrašėme tą pačią dieną.',
    'Darželis turėtų būti uždarytas. Nehigieniškos sąlygos, maistas abejotinas.',
    'Per 2 savaites vaikas peršalo 3 kartus. Patalpos šaltos, langai nesandarus.',
    'Siaubinga patirtis. Vaikas pradėjo šlapintis lovoje po pirmo mėnesio.',
    'Auklėtojos visiškai abejingos vaikams. Vaikai verkia, o jos kalbasi tarpusavy.',
    'Darželis reklamuojasi kaip „premium", bet realybė — kaip seniausias sovietinis darželis.',
    'Mano vaikas buvo paliktas lauke vienas — auklėtoja „nepamatė".',
    'Vaikas atsisakė valgyti darželio maistą — sakė „smirda". Maistas tikrai abejotinos kokybės.',
    'Visiškas nusivylimas. Jokios programos, jokio ugdymo. Vaikai tiesiog sėdi.',
    'Darželis perpildytas. 28 vaikai grupėje su viena auklėtoja. Tai ne darželis, tai sandėlis.',
    'Vaikas pradėjo bijoti suaugusiųjų po šio darželio. Lankėmės pas psichologą.',
    'Nerekomenduoju niekam. Prarastas laikas ir pinigai. Vaikas traumuotas.',
    // New
    'Auklėtoja padarė vaikui skriaudą — kreipėmės į policiją.',
    'Darželyje jokio ugdymo. Vaikai žiūri multikus visą dieną.',
    'Radome vaikus paliktus be priežiūros kieme. Auklėtojos buvo viduje.',
    'Vaikas bijojo eiti į darželį — ryte isterija, vakare košmarai. Nustojome vesti.',
  ]},
];

// ──────── AUKLĖ (NANNY) REVIEWS ────────
const aukleReviews: Array<{rating: number; texts: string[]}> = [
  { rating: 5, texts: [
    'Nuostabi auklė! Vaikai ją myli. Labai atsakinga, punktuali ir kūrybinga.',
    'Profesionali, šilta ir rūpestinga. Vaikas visada laimingai laukia jos atėjimo.',
    'Geriausia auklė, kokią teko turėti. Labai rekomenduoju!',
    'Auklė randa bendrą kalbą su vaikais ir moka juos užimti prasmingai.',
    'Radome per pažįstamus ir labai džiaugiamės. Puikiai sutaria su mūsų dviem vaikais.',
    'Auklė ateina su paruoštomis veiklomis — piešimas, lipdinys, žaidimai. Vaikas jos laukia!',
    'Su ja mūsų vaikas pramoko anglų kalbos žodžių. Labai kūrybinga moteris.',
    'Patikima 100%. Per 2 metus nė karto nepavėlavo ir nė karto neapvylė.',
    'Auklė maloni, švelni, bet kartu ir struktūruota. Vaikas turi tvarkaraštį ir tai padeda.',
    'Mūsų auklė — kaip šeimos narė. Vaikas ją vadina „teta" ir labai myli.',
    'Labai profesionali auklė su pedagoginiu išsilavinimu. Matosi patirtis.',
    'Auklė surado būdą kaip mūsų nedrąsų vaiką „atrakinti". Dabar jis drąsus ir kalbus.',
    'Su mūsų auklė galime ramiai dirbti — žinome kad vaikas geriausiose rankose.',
    'Auklė ne tik prižiūri, bet ir ugdo. Vaikas per metus labai pasikeitė.',
    'Rekomenduoju be jokių abejonių. Geriausia investicija į vaiko gerovę.',
    'Auklė turi pirmosios pagalbos sertifikatą — tai buvo svarbus kriterijus mums.',
    'Jauki, šilta, kantri. Tiksliai tokia auklė kokios ieškojome.',
    'Per metus su šia aukle vaikas pradėjo kalbėti pilnais sakiniais.',
    'Auklė puikiai tvarkosi ir su kūdikiu, ir su vyresniu vaiku vienu metu.',
    'Labai lanksti — galime keisti laikus ir ji visada prisitaiko.',
    'Auklė viską dokumentuoja — siunčia nuotraukas, rašo ką veikė. Jaučiamės ramūs.',
    'Auklė atrado kad vaikas turi klausos problemų — mes to nepastebėjome. Labai dėkingi.',
    'Puiki auklė su ilgamete patirtimi. Jaučiasi kad tai — jos pašaukimas.',
    // New
    'Bendravimas su agentūra vyko sklandžiai, auklė buvo parinkta idealiai. Vaikutis lieka be ašarų.',
    'Auklė mandagi, linksma, savimi pasitikinti. Vaikui su ja saugu ir smagu.',
    'Per metus su šia auklė — jokių problemų. Patikima, šilta, profesionali.',
    'Auklė turi patirties su dvyniais — mums tai buvo labai svarbu. Puikiai susitvarko.',
    'Vaikas ją labai myli. Kai auklė ateina — šypsosi nuo ausies iki ausies.',
  ]},
  { rating: 4, texts: [
    'Labai gera auklė, patikima ir maloni. Vienintelis minusas — ne visada galima suderinti laikus.',
    'Mūsų vaikui labai patinka su ja. Šiek tiek brangoka, bet kokybė verta kainos.',
    'Atsakinga ir patikima. Vaikai ją labai mėgsta.',
    'Gera auklė, bendravimas sklandus. Rekomenduoju.',
    'Auklė gera, bet kartais per daug leidžia vaikui žiūrėti TV. Kalbėjomės — situacija pagerėjo.',
    'Profesionali, bet kaina aukšta. Vis dėlto verta — vaikas patenkintas.',
    'Gera auklė, tik kartais sunku susitarti dėl grafiko — ji labai užimta.',
    'Auklė patikima ir maloni. Vaikas ją mėgsta, nors pirmas dvi dienas verkė.',
    'Su ja vaikas jaučiasi saugiai. Kartais norėtųsi daugiau kūrybinių veiklų.',
    'Gera auklė, bet ne visada laikosi susitarimo dėl maitinimo — kartais duoda saldumynų.',
    'Patikima ir rūpestinga. Trūksta tik pedagoginio pasiruošimo.',
    'Labai gera auklė namuose. Vienintelis minusas — retai veda vaiką į lauką.',
    'Profesionali ir maloni. Kiek trūksta iniciatyvos — reikia pasakyti ką daryti.',
    'Gera auklė, nors vaikas pradžioje nenorėjo jos priimti. Po savaitės viskas buvo gerai.',
    'Auklė patikima ir punktuali. Norėtųsi tik daugiau veiklų su vaiku.',
    'Rekomenduočiau. Gera, patikima, su vaikais moka elgtis. Kaina priimtina.',
    'Auklė gera, bet kartais per anksti nori išeiti. Sutarta iki 18:00, bet 17:30 jau rengiasi.',
    'Mūsų vaikui patinka su ja, tai svarbiausia. Kaina galėtų būti mažesnė.',
    'Gera auklė, tik kartais pamiršta vaistus duoti laiku. Kalbėjomės, tikiuosi pasitaisys.',
    // New
    'Auklė su patirtimi ir rekomendacijomis. Vaikas su ja saugus. Tik kaina aukšta — 10€/val.',
    'Gera auklė, kantri. Kartais norėtųsi kad daugiau laiko praleistų lauke su vaiku.',
    'Patenkinti. Auklė profesionali, tik kartais komunikacija galėtų būti geresnė.',
    'Vaikas ją mėgsta, o tai svarbiausia. Keletas smulkių pastabų, bet bendrai — gerai.',
  ]},
  { rating: 3, texts: [
    'Auklė šiaip gera, bet ne visuomet laikosi susitarimo dėl laikų.',
    'Vidutiniškai. Nieko blogo, bet ir nieko ypatingo.',
    'Normalu. Vaikui patinka, bet norėtųsi daugiau veiklų.',
    'Auklė maloni, bet be iniciatyvos. Reikia viską pasakyti ką daryti su vaiku.',
    'Vaikas prižiūrimas, bet ugdymo jokio. Tiesiog „pabūna" kartu.',
    'Kartais pavėluoja 15-20 min. Kai dirbam — tai labai nepatogu.',
    'Auklė normalė, bet su vyresniu vaiku nesusikalba. Su jaunesniu — gerai.',
    'Kaina per didelė už tai ką gauname. Tik priežiūra, jokio ugdymo.',
    'Auklė patikima, bet bendravimas su ja šaltokas. Norėtųsi šiltesnio kontakto.',
    'Vaikas nei džiaugiasi nei verkia kai auklė ateina. Turbūt normalu.',
    'Auklė OK, bet tikėjomės daugiau patirties. Jaučiasi kad dar mokosi.',
    'Vidutiniškas vertinimas. Auklė pakankamai gera, bet ne puiki.',
    'Mūsų auklė geresnė nei prieš tai buvusi, bet vis tiek — ne ideali.',
    'Auklė gera su kūdikiu, bet su 4-mečiu nebesusitvarko. Reikėtų daugiau patirties.',
    'Normali auklė. Vaikas prižiūrimas, pamaitintas, bet jokių papildomų veiklų.',
    // New
    'Auklė tinkama, bet trūksta kūrybiškumo. Vaikas tiesiog žaidžia su žaislais.',
    'Normalu už tokią kainą. Per 8€/val tikėtis daugiau gal neišeina.',
  ]},
  { rating: 2, texts: [
    'Nepavyko rasti bendros kalbos. Auklė buvo nepatikima dėl laiko.',
    'Auklė per daug laiko praleidžia telefone. Pamačiau per kamerą.',
    'Vaikus maitino nesveikatai — saldainiai, traškučiai. Nesilaikė mūsų taisyklių.',
    'Auklė atšaukė paskutinę minutę 3 kartus per mėnesį. Nepatikima.',
    'Vaikas pradėjo bijoti auklės — nežinome priežasties, bet nusprendėme nutraukti.',
    'Per brangu. 12€/val. o vaikas tiesiog žiūri TV visą dieną.',
    'Auklė pasirodė be patirties nors sakė turinti. Su kūdikiu nesusitvarkė.',
    'Negali pasikliauti — vėluoja, atšaukia, „pamiršta". Teko ieškoti kitos.',
    'Auklė nemoka lietuviškai — susikalbėjimas su vaiku buvo probleminis.',
    'Nusivylėme. Auklė buvo rekomenduota, bet realybė — labai skirtinga.',
  ]},
  { rating: 1, texts: [
    'Auklė paliko vaiką vieną kambaryje ir nuėjo rūkyti į balkoną. Atleista vietoje.',
    'Radome vaiką verkiantį ir šlapią kai grįžome namo. Auklė žiūrėjo TV.',
    'Auklė vogė maistą iš šaldytuvo ir naudojo mūsų daiktus.',
    'Vaikas turėjo mėlynes ant rankų. Auklė nepaaiškino. Kreipėmės į policiją.',
    'Blogiausias sprendimas buvo samdyti šią auklę. Vaikas traumuotas.',
  ]},
];

// ──────── BŪRELIS (CLUB/ACTIVITY) REVIEWS ────────
// Category-specific templates
const burelisCategorySnippets: Record<string, { positive: string[]; neutral: string[] }> = {
  'Robotika': {
    positive: [
      'robotikos būrelis — sūnus tiesiog susižavėjęs! Konstruoja ir programuoja LEGO robotus',
      'per pusmetį vaikas išmoko programavimo pagrindų. Labai šiuolaikiškas būrelis',
    ],
    neutral: [
      'robotikos programa galėtų būti struktūruotesnė. Vaikas kartais nežino ką daryti',
    ],
  },
  'Šokiai': {
    positive: [
      'šokių būrelis — dukra tapo lankstesnė, drąsesnė ir laimingesnė',
      'per metus vaikas padarė didžiulę pažangą šokiuose. Dalyvavo pasirodyme — buvome sužavėti',
    ],
    neutral: [
      'šokių pamokos OK, bet norėtųsi daugiau pasirinkimo stilių',
    ],
  },
  'Menas': {
    positive: [
      'dailės būrelis tikrai ugdo kūrybiškumą — vaikas piešia kiekvieną dieną namuose',
      'menų studija puiki — vaikas ir piešia, ir lipdo, ir kuria koliažus',
    ],
    neutral: [
      'meno būrelis patinka, bet vadovė galėtų būti kūrybiškesnė su programa',
    ],
  },
  'Sportas': {
    positive: [
      'sportinis būrelis — vaikas tapo disciplinuotesnis ir fiziškai stipresnis',
      'treneris puikus — vaikas eina su noru kiekvieną kartą',
    ],
    neutral: [
      'treniruotės geros, bet per didlelė grupė. Treneris nesuspėja visiems',
    ],
  },
  'Muzika': {
    positive: [
      'muzikos būrelis — dukra per metus pramoko groti ir dabar repetuoja kasdien',
      'mokytoja nuostabi — vaikas pradėjo mylėti muziką',
    ],
    neutral: [
      'muzikos pamokos OK, bet norinčių daug — gaunasi per mažai individualaus laiko',
    ],
  },
  'Programavimas': {
    positive: [
      'programavimo būrelis — sūnus sukūrė savo pirmą žaidimą! Labai didžiuojamės',
      'IT būrelis šiuolaikiškas — vaikas mokosi Scratch ir jau kuria animacijas',
    ],
    neutral: [
      'programavimas sudėtingas 6-mečiui. Gal reikėjo palaukti metų',
    ],
  },
  'Kalbos': {
    positive: [
      'anglų kalbos būrelis per žaidimus — vaikas net nepajuto kad mokosi',
      'kalbų būrelis veikia — vaikas jau kalba paprastais sakiniais angliškai',
    ],
    neutral: [
      'kalbos būrelis OK, bet per mažai kartų per savaitę kad būtų tikras progresas',
    ],
  },
};

const burelisReviews: Array<{rating: number; texts: string[]}> = [
  { rating: 5, texts: [
    'Puikus būrelis! Vaikas per mėnesį išmoko daugiau nei tikėjomės. Vadovė labai kompetentinga.',
    'Lankome jau antrus metus ir vaikas tiesiog susižavėjęs. Kiekvieną savaitę laukia su nekantrumu.',
    'Meno būrelis tiesiog nuostabus. Vadovė labai kūrybinga ir kantriai dirba su vaikais.',
    'Labai geras būrelis, vaikas daug ko išmoko. Rekomenduoju!',
    'Teatro būrelis padėjo vaikui atsikratyti drovumo. Dabar drąsiai kalba prieš klasę.',
    'Dailės studija nuostabi! Vaikas piešia kiekvieną dieną namuose.',
    'Šachmatų būrelis ugdo mąstymą — vaikas pradėjo geriau mokytis ir matematikoje.',
    'Futbolo treniruotės — sūnus tapo komandinis žaidėjas, susitvarkė su pralaimėjimais.',
    'Anglų kalbos būrelis per žaidimus — vaikas net nepajuto kad mokosi.',
    'Gamtos pažinimo būrelis — vaikas dabar žino visus miško paukščius.',
    'Gimnastikos būrelis — dukra tapo lanksčiausia klasėje.',
    'Kulinarijos būrelis vaikams — sūnus dabar padeda gaminti namuose!',
    'Vaikas nekantriai laukia kiekvieno užsiėmimo. Geriausia veikla kokią jam pasirinkome.',
    'Būrelis suteikia vaikui tai ko trūksta mokykloje — kūrybiškumą ir laisvę.',
    'Vadovė ne tik moko, bet ir įkvepia. Vaikas nori būti „kaip ji" kai užaugs.',
    // New
    'Labai profesionalus būrelis. Vadovas aiškiai myli savo darbą ir vaikus.',
    'Per pusmetį vaikas padarė milžinišką pažangą. Pinigai tikrai neišmesti.',
    'Rekomenduoju visiems! Vaikas ten laimingas, o tai svarbiausia.',
    'Būrelis padėjo vaikui rasti savo aistrą. Dabar tai jo mėgstamiausia veikla.',
    'Puiki investicija į vaiko laisvalaikį. Geriau nei sėdėti prie ekranų.',
  ]},
  { rating: 4, texts: [
    'Gerai organizuotas būrelis, vaikai gauna daug naujos informacijos. Gal tik per trumpa pamoka.',
    'Geras būrelis, tik kaina galėtų būti draugiškesnė.',
    'Vaikai patenkinti, programa įdomi ir struktūruota.',
    'Geras būrelis, tik vieta sunkiai pasiekiama — nėra parkingo šalia.',
    'Vadovė profesionali, bet kartais pamokos per trumpos.',
    'Geras būrelis su geru treneriu. Tik per didelė grupė — 15 vaikų per daug.',
    'Vaikas daug ko išmoko per pusmetį. Norėtųsi daugiau praktikos ir mažiau teorijos.',
    'Vadovė šauni, bet patalpos galėtų būti geriau pritaikytos. Ankšta.',
    'Vaikas patenkintas, tai svarbiausia. Gal tik šiek tiek per brangu.',
    'Programa įdomi, bet kartais per sudėtinga 5-mečiui.',
    'Patinka būrelis, nors komunikacija su tėvais galėtų būti geresnė.',
    'Vaikas eina su malonumu. Kaina priimtina, kokybė gera.',
    'Geras treneris, vaikai jį gerbia. Trūksta tik modernesnės įrangos.',
    'Rekomenduočiau. Geras būrelis su keliais smulkiais trūkumais.',
    // New
    'Geras būrelis, bet kartais užsiėmimai atšaukiami. Nepatogu kai jau suplanuojai dieną.',
    'Patinka programa, tik norėtųsi daugiau atvirų durų dienų tėvams.',
    'Vaikas patenkintas, kaina priimtina. Trūksta tik dažnesnių užsiėmimų.',
    'Būrelis geras, vadovas kompetentingas. Patalpos galėtų būti erdvesnės.',
  ]},
  { rating: 3, texts: [
    'Būrelis neblogas, bet tikėjausi daugiau. Vadovė maloni, tačiau programa nestruktūruota.',
    'Vidutiniškas. Vaikui nelabai patiko, bet gal tiesiog ne jo sritis.',
    'Norėtųsi geresnės organizacijos ir komunikacijos su tėvais.',
    'Vaikas lanko, nes draugai lanko. Pačiam būreliui — tik vidutiniškas.',
    'Per daug vaikų grupėje, vadovas nesuspėja visiems skirti dėmesio.',
    'Kaina neatitinka kokybės. Tikėjomės daugiau.',
    'Vadovė maloni, bet neturi aiškaus plano. Kiekviena pamoka — improvizacija.',
    'Vaikui pirmas mėnuo patiko, po to — nuobodulys. Programa kartojasi.',
    'Vidutiniškas būrelis. Nei blogai, nei gerai.',
    'Treneris geras, bet patalpos per mažos tokiam vaikų skaičiui.',
    'Būrelis OK, bet tikėjomės didesnio progreso per pusmetį.',
    'Normalu. Vaikas neverkia, bet ir nenori bėgti ten. Kol kas tęsiame.',
    'Būrelis galėtų būti geresnis. Vadovui trūksta entuziazmo.',
    // New
    'Patalpos senos ir nejauku. Programa nieko ypatingo.',
    'Užsiėmimai kartais atšaukiami be paaiškinimo. Nemalonu.',
  ]},
  { rating: 2, texts: [
    'Nusivylėme. Programa neįdomi, vaikas nenorėjo tęsti.',
    'Vadovas nemandagus su vaikais — rėkia kai nesigauna. Tai ne mokymas.',
    'Per brangu už tai ką gauni. Vaikas ateina namo be jokių žinių.',
    'Chaosas. Nėra struktūros, vaikai bėgioja ir daro ką nori.',
    'Grupėje 20 vaikų ir vienas vadovas. Tai ne būrelis, tai auklėjimo kambarys.',
    'Vaikas po pirmo mėnesio atsisakė eiti. Sakė „neįdomu ir baisu".',
    'Patalpos purvinos, šaltis. Nemalonios sąlygos.',
    'Vadovė per daug reikli 4-mečiams. Vaikas pradėjo bijoti klaidų.',
    'Pažadėjo individualų požiūrį — gavome konvejerį. Nusivylėme.',
    'Vaikas po būrelio grįžta piktas ir pavargęs. Ne ta veikla.',
  ]},
  { rating: 1, texts: [
    'Siaubinga patirtis. Vadovas ignoravo vaikus ir žiūrėjo telefoną.',
    'Būrelis neegzistuoja — tai tiesiog kambarys kur vaikai palikti vieni.',
    'Vaikas susižeidė per užsiėmimą, nes nebuvo prižiūrimas. Daugiau neiname.',
    'Pinigų švaistymas. Jokio ugdymo, jokios programos, jokio dėmesio.',
    'Vadovas buvo girtas per užsiėmimą. Pranešėme policijai.',
  ]},
];

// ──────── SPECIALIST REVIEWS ────────
// Specialty-specific review snippets
const specialtySnippets: Record<string, { positive: string[]; neutral: string[] }> = {
  'Logopedas': {
    positive: [
      'per 3 mėnesius vaikas pradėjo taisyklingai tarti visus garsus — nuostabus rezultatas',
      'logopedė kantriai ir nuosekliai dirba. „R" garsą ištaisė per 2 mėnesius',
      'ne tik taiso tartį, bet ir ugdo kalbą kompleksiškai — žodyną, sakinio struktūrą',
      'moko per žaidimus, daineles, korteles. Vaikui patinka „žaisti" su logopede',
    ],
    neutral: [
      'progresas yra, bet lėtas. Gal reikia dažnesnių užsiėmimų',
      'užsiėmimai per trumpi — 30 min. Bet specialistė gera',
    ],
  },
  'Psichologas': {
    positive: [
      'padėjo mūsų vaikui įveikti baimę eiti į darželį — po 3 vizitų viskas pasikeitė',
      'sugebėjo per 2 sesijas suprasti kas vargina vaiką. Profesionalė!',
      'padėjo mums kaip šeimai suprasti vaiko elgesį ir kaip reaguoti',
    ],
    neutral: [
      'konsultacija naudinga, bet norėtųsi daugiau praktinių patarimų',
      'per trumpas vizitas — 30 min. vaikui per mažai',
    ],
  },
  'Ergoterapeutas': {
    positive: [
      'padėjo vaikui su rašymu ir smulkiosios motorikos problemomis — matomas didelis progresas',
      'profesionali ergoterapeutė, vaikas adaptuojasi mokykloje daug geriau',
    ],
    neutral: [
      'progresas lėtas, bet suprantama — tai ilgas procesas',
    ],
  },
  'Kineziterapeutas': {
    positive: [
      'rado problemą kurios kiti specialistai nepastebėjo — labai dėkingi',
      'vaikas su plokščiomis pėdomis — per metus didelis progresas',
    ],
    neutral: [
      'kineziterapija reikalauja laiko — po 3 mėnesių dar anksti vertinti',
    ],
  },
};

const specialistReviews: Array<{rating: number; texts: string[]}> = [
  { rating: 5, texts: [
    'Puikus specialistas, rezultatai akivaizdūs. Labai rekomenduoju.',
    'Profesionalus ir šiltas požiūris. Vaikas nebijojo eiti į vizitus.',
    'Specialistė dirba su vaiku žaidimų forma — jis net nesupranta kad mokosi.',
    'Specialistė labai gerai dirba su autizmo spektro vaikais. Mūsų sūnus padaro didelę pažangą.',
    'Puiki specialistė! Vaikas turėjo mikčiojimo problemą — dabar beveik praėjo.',
    'Specialistė randa individualų požiūrį į kiekvieną vaiką. Tai reta ir vertinga.',
    'Puiki vaikų ortodontė — vaikas nebijojo ir bendradarbiavo.',
    'Specialistė padėjo vaikui su disleksija — dabar skaito daug geriau.',
    'Specialistė turi „auksinę kantrybę". Su mūsų hiperaktyviu vaiku — tai būtina.',
    'Dirba ir su mumis tėvais — moko kaip padėti vaikui namuose. Labai svarbu!',
    // New
    'Profesionali konsultacija, aiškus planas ir matomas progresas. Rekomenduoju.',
    'Vaikas po vizitų tampa ramesnis ir labiau pasitikintis savimi.',
    'Nuostabi specialistė — vaikas eina ten kaip į žaidimą, o progresas akivaizdus.',
    'Labai patenkinti! Per pusmetį vaikas padarė tokią pažangą kokios nesitikėjome.',
    'Specialistė aiškiai paaiškino diagnozę ir planą. Jaučiamės ramūs.',
  ]},
  { rating: 4, texts: [
    'Geras specialistas, padėjo su kalbos problemomis. Tik eilėje reikėjo palaukti.',
    'Profesionali konsultacija, aiškiai paaiškino situaciją ir planą.',
    'Geras specialistas, bet kaina aukšta. Vis dėlto verta.',
    'Specialistas kompetentingas. Norėtųsi tik ilgesnių sesijų.',
    'Geras specialistas, aiškiai komunikuoja planą ir progresą.',
    'Specialistė gera, bet kartais atšaukia vizitus. Suprantama, bet nepatogu.',
    'Gera specialistė, tik kartais sunku gauti terminą — labai užimta.',
    'Profesionalus, rezultatai matomi. Kaina aukšta, bet suprantama.',
    'Vaikui patinka vizitai — tai jau didelis pliusas. Progresas — laiko klausimas.',
    'Geras specialistas, rekomenduočiau. Ilga eilė ir aukšta kaina — vieninteliai minusai.',
    'Specialistė profesionali ir maloni. Vaikas eina noriai.',
    // New
    'Kompetentingas specialistas. Norėtųsi tik šiek tiek ilgesnių vizitų.',
    'Gerai, nors eilėje laukėme 2 mėnesius. Bet rezultatas vertas laukimo.',
    'Profesionali ir maloni. Tik kaina — 40€ už 30 min. — kerta per kišenę.',
    'Rekomenduočiau. Vaikas daro pažangą, nors lėtai. Bet specialistė kantriai dirba.',
  ]},
  { rating: 3, texts: [
    'Specialistas kompetentingas, bet bendravimas su tėvais galėtų būti geresnis.',
    'Vizitas buvo greitas, norėjosi daugiau laiko ir dėmesio.',
    'Normalu, bet tikėjomės didesnio progreso per tą laiką.',
    'Specialistas kompetentingas, bet patalpos labai senos ir nejauku.',
    'Per brangu — 40€ už 30 min. O rezultatas — vidutiniškas.',
    'Vizitai formalūs — vaikas atlieka užduotis ir viskas. Norėtųsi šiltesnio kontakto.',
    'Eilėje laukėme 3 mėnesius, o pats vizitas — 20 minučių. Nusivylėme.',
    'Vidutiniškas vertinimas. Specialistas profesionalus, bet trūksta šilumos.',
    'Kaina neatitinka kokybės. Tikėjomės daugiau.',
    'Normalus specialistas. Nei labai gerai, nei blogai.',
    'Konsultacija buvo paviršutiniška. Norėjosi gilesnės analizės.',
    // New
    'Specialistė vaikui nesukėlė pasitikėjimo — per formali. Gal ne ta „chemija".',
    'Laukimo eilė ilga, vizitas trumpas. Progresas — lėtas.',
    'Specialistas profesionalus, bet patalpos nejauku. Vaikui ten nepatinka.',
  ]},
  { rating: 2, texts: [
    'Ilgas laukimas, trumpas vizitas. Lūkesčiai nepatenkinti.',
    'Specialistas per daug formalus — vaikas bijojo ir verkė visą vizitą.',
    'Už tokią kainą tikėjomės daugiau. Progresas nulinis po 3 mėnesių.',
    'Specialistė nuolat vėluoja ir trumpina vizitus. Nemandagu.',
    'Patalpos labai nejauku — sena poliklinika, šalta. Vaikas bijojo.',
    'Psichologė po pirmo vizito pasakė „nieko blogo nematau" — bet problema akivaizdi.',
    'Diagnozė buvo neteisinga — kitas specialistas rado visai kitą problemą.',
    'Vaikas po vizitų tapo dar labiau užsisklendęs. Ne tas metodas.',
    'Specialistas nemoka dirbti su mažais vaikais — tinka tik mokyklinio amžiaus.',
    // New
    'Grubi specialistė — „neišdykauk", „sėdėk ramiai". Tai ne metodas dirbti su vaikais.',
  ]},
  { rating: 1, texts: [
    'Specialistas visiškai nekompetentingas. Diagnozavo tai ko nėra, o tikrą problemą ignoravo.',
    'Siaubinga patirtis — vaikas verkė, o specialistė liepė „nustoti lepinti".',
    'Praleidome 4 mėnesius ir 400€ — jokio rezultato. Tik švaistėme laiką.',
    'Specialistas paliko vaiką vieną kambaryje „testuoti" — vaikas išsigando ir verkė.',
    'Blogiausia konsultacija. Specialistas buvo nemandagus ir nepadėjo.',
  ]},
];

// ──────────────────────────────────────────────────────────────
// Rating distribution weights
// Target: 5% ★1, 10% ★2, 20% ★3, 35% ★4, 30% ★5
// ──────────────────────────────────────────────────────────────
const RATING_WEIGHTS = [
  { rating: 1, weight: 0.05 },
  { rating: 2, weight: 0.10 },
  { rating: 3, weight: 0.20 },
  { rating: 4, weight: 0.35 },
  { rating: 5, weight: 0.30 },
];

const MAX_REVIEWS_PER_ENTITY = 15;
const MAX_TEXT_GLOBAL_USES = 5;

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

function pickWeightedRating(rand: () => number): number {
  const r = rand();
  let cumulative = 0;
  for (const { rating, weight } of RATING_WEIGHTS) {
    cumulative += weight;
    if (r < cumulative) return rating;
  }
  return 4;
}

// ──────────────────────────────────────────────────────────────
// FEATURE-BASED REVIEW GENERATOR
// Creates entity-specific reviews by mentioning actual features
// ──────────────────────────────────────────────────────────────

const kgFeatureOpeners5 = [
  'Labai patenkinti šiuo darželiu!',
  'Puikus darželis, rekomenduoju!',
  'Esame labai laimingi kad pasirinkome šį darželį.',
  'Mūsų vaikas eina su džiaugsmu kiekvieną rytą.',
  'Tikrai geras darželis.',
  'Labai džiaugiamės pasirinkimu.',
  'Nuostabus darželis su puikiu kolektyvu.',
  'Rekomenduojame šį darželį visiems tėvams.',
];

const kgFeatureOpeners4 = [
  'Geras darželis, nors yra ką tobulinti.',
  'Bendrai patenkinti, bet keletas pastabų.',
  'Darželis geras, su keliais minusais.',
  'Patenkinti, nors ne viskas idealu.',
  'Vaikas eina noriai, o tai svarbiausia.',
  'Geras darželis, nors ne idealus.',
];

const kgFeatureOpeners3 = [
  'Darželis vidutiniškas.',
  'Nei labai gerai, nei blogai.',
  'Normalu, bet tikėjomės daugiau.',
  'Galėtų būti ir geriau.',
  'Vertinu vidutiniškai.',
];

const kgFeatureClosers5 = [
  'Labai rekomenduojame!',
  'Tikrai verta dėmesio.',
  'Esame dėkingi kolektyvui.',
  'Vaikas ten laimingas.',
  'Ačiū auklėtojoms!',
  'Puiku!',
  '',
];

const kgFeatureClosers4 = [
  'Bendrai — rekomenduočiau.',
  'Yra ką tobulinti, bet geras.',
  'Vis dėlto — gerai.',
  'Patenkinti.',
  '',
];

const kgFeatureClosers3 = [
  'Gal kitais metais bus geriau.',
  'Žiūrėsime.',
  'Kol kas lankome.',
  'Tinka, bet ne ilgam.',
  '',
];

function generateFeatureReview(
  features: string[],
  rating: number,
  rand: () => number,
): string | null {
  if (features.length === 0) return null;

  // Pick a random feature that has snippets
  const availableFeatures = features.filter(f =>
    featureReviewSnippets[f] || locationSnippets[f]
  );
  if (availableFeatures.length === 0) return null;

  const feature = availableFeatures[Math.floor(rand() * availableFeatures.length)];

  // Check location snippets first
  if (locationSnippets[feature]) {
    const snippets = locationSnippets[feature];
    const snippet = snippets[Math.floor(rand() * snippets.length)];
    if (rating >= 4) {
      const opener = kgFeatureOpeners5[Math.floor(rand() * kgFeatureOpeners5.length)];
      return `${opener} Ypač patinka, kad ${snippet}`;
    } else {
      return `Darželis ${snippet}. Bet visa kita — vidutiniška.`;
    }
  }

  const snippetData = featureReviewSnippets[feature];
  if (!snippetData) return null;

  let snippet: string;
  if (rating >= 5 && snippetData.positive.length > 0) {
    snippet = snippetData.positive[Math.floor(rand() * snippetData.positive.length)];
    const opener = kgFeatureOpeners5[Math.floor(rand() * kgFeatureOpeners5.length)];
    const closer = kgFeatureClosers5[Math.floor(rand() * kgFeatureClosers5.length)];
    return closer ? `${opener} Ypač džiaugiamės, kad ${snippet}. ${closer}` : `${opener} Ypač džiaugiamės, kad ${snippet}.`;
  } else if (rating >= 4) {
    if (snippetData.neutral.length > 0 && rand() > 0.5) {
      snippet = snippetData.neutral[Math.floor(rand() * snippetData.neutral.length)];
      const opener = kgFeatureOpeners4[Math.floor(rand() * kgFeatureOpeners4.length)];
      return `${opener} ${snippet.charAt(0).toUpperCase() + snippet.slice(1)}.`;
    }
    snippet = snippetData.positive[Math.floor(rand() * snippetData.positive.length)];
    const opener = kgFeatureOpeners4[Math.floor(rand() * kgFeatureOpeners4.length)];
    const closer = kgFeatureClosers4[Math.floor(rand() * kgFeatureClosers4.length)];
    return closer ? `${opener} ${snippet.charAt(0).toUpperCase() + snippet.slice(1)}. ${closer}` : `${opener} ${snippet.charAt(0).toUpperCase() + snippet.slice(1)}.`;
  } else if (rating >= 3) {
    if (snippetData.neutral.length > 0) {
      snippet = snippetData.neutral[Math.floor(rand() * snippetData.neutral.length)];
      const opener = kgFeatureOpeners3[Math.floor(rand() * kgFeatureOpeners3.length)];
      return `${opener} ${snippet.charAt(0).toUpperCase() + snippet.slice(1)}.`;
    }
    return null;
  } else {
    if (snippetData.negative.length > 0) {
      snippet = snippetData.negative[Math.floor(rand() * snippetData.negative.length)];
      return snippet.charAt(0).toUpperCase() + snippet.slice(1) + '.';
    }
    return null;
  }
}

function generateBurelisFeatureReview(
  category: string | null,
  rating: number,
  rand: () => number,
): string | null {
  if (!category) return null;

  // Try to find matching category snippets
  const catKey = Object.keys(burelisCategorySnippets).find(k =>
    category.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(category.toLowerCase().split('/')[0])
  );
  if (!catKey) return null;

  const snippets = burelisCategorySnippets[catKey];
  if (rating >= 4 && snippets.positive.length > 0) {
    const snippet = snippets.positive[Math.floor(rand() * snippets.positive.length)];
    return rating >= 5
      ? `Puikus būrelis! ${snippet.charAt(0).toUpperCase() + snippet.slice(1)}. Labai rekomenduoju!`
      : `Geras būrelis — ${snippet}. Rekomenduočiau.`;
  } else if (rating >= 3 && snippets.neutral.length > 0) {
    const snippet = snippets.neutral[Math.floor(rand() * snippets.neutral.length)];
    return `Vidutiniškai — ${snippet}.`;
  }
  return null;
}

function generateSpecialistFeatureReview(
  specialty: string | null,
  rating: number,
  rand: () => number,
): string | null {
  if (!specialty) return null;

  const specKey = Object.keys(specialtySnippets).find(k =>
    specialty.toLowerCase().includes(k.toLowerCase())
  );
  if (!specKey) return null;

  const snippets = specialtySnippets[specKey];
  if (rating >= 4 && snippets.positive.length > 0) {
    const snippet = snippets.positive[Math.floor(rand() * snippets.positive.length)];
    return rating >= 5
      ? `Labai rekomenduoju! ${snippet.charAt(0).toUpperCase() + snippet.slice(1)}.`
      : `Geras specialistas — ${snippet}. Rekomenduočiau.`;
  } else if (rating >= 3 && snippets.neutral.length > 0) {
    const snippet = snippets.neutral[Math.floor(rand() * snippets.neutral.length)];
    return `Vidutiniškai — ${snippet}.`;
  }
  return null;
}

function pickStandaloneText(
  templates: Array<{rating: number; texts: string[]}>,
  targetRating: number,
  rand: () => number,
  usedTexts: Set<string>,
  globalTextUsage: Map<string, number>,
): { rating: number; text: string } | null {
  const group = templates.find(t => t.rating === targetRating);
  if (!group || group.texts.length === 0) {
    const sorted = [...templates].sort((a, b) =>
      Math.abs(a.rating - targetRating) - Math.abs(b.rating - targetRating)
    );
    const fallback = sorted[0];
    if (!fallback) return null;
    const available = fallback.texts.filter(t =>
      !usedTexts.has(t) && (globalTextUsage.get(t) || 0) < MAX_TEXT_GLOBAL_USES
    );
    if (available.length === 0) {
      // Fall back to any unused locally
      const localUnused = fallback.texts.filter(t => !usedTexts.has(t));
      if (localUnused.length === 0) return null;
      const text = localUnused[Math.floor(rand() * localUnused.length)];
      return { rating: fallback.rating, text };
    }
    const text = available[Math.floor(rand() * available.length)];
    return { rating: fallback.rating, text };
  }

  // Prefer texts not yet used locally AND under global limit
  const preferred = group.texts.filter(t =>
    !usedTexts.has(t) && (globalTextUsage.get(t) || 0) < MAX_TEXT_GLOBAL_USES
  );
  if (preferred.length > 0) {
    const text = preferred[Math.floor(rand() * preferred.length)];
    return { rating: group.rating, text };
  }

  // Fall back to locally unused
  const localUnused = group.texts.filter(t => !usedTexts.has(t));
  if (localUnused.length > 0) {
    const text = localUnused[Math.floor(rand() * localUnused.length)];
    return { rating: group.rating, text };
  }

  // Last resort — pick random from group
  const text = group.texts[Math.floor(rand() * group.texts.length)];
  return { rating: group.rating, text };
}

// ──────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ──────────────────────────────────────────────────────────────

const templateMap: Record<string, Array<{rating: number; texts: string[]}>> = {
  kindergarten: kindergartenReviews,
  aukle: aukleReviews,
  burelis: burelisReviews,
  specialist: specialistReviews,
};

interface EntityData {
  id: string;
  name: string;
  baseReviewCount: number;
  baseRating: number;
  features?: string;
  description?: string | null;
  type?: string;
  city?: string;
  area?: string | null;
  category?: string | null;
  subcategory?: string | null;
  specialty?: string | null;
}

async function seedReviews() {
  console.log('🔄 Seeding entity-specific reviews (v2 — quality overhaul)...');
  console.log(`Max ${MAX_REVIEWS_PER_ENTITY} reviews/entity, max ${MAX_TEXT_GLOBAL_USES} uses/text\n`);

  const deleted = await prisma.review.deleteMany({});
  console.log(`Deleted ${deleted.count} existing reviews.`);

  const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
    prisma.kindergarten.findMany({
      where: { baseReviewCount: { gt: 0 } },
      select: { id: true, name: true, baseReviewCount: true, baseRating: true, features: true, description: true, type: true, city: true, area: true },
    }),
    prisma.aukle.findMany({
      where: { baseReviewCount: { gt: 0 } },
      select: { id: true, name: true, baseReviewCount: true, baseRating: true, description: true, city: true },
    }),
    prisma.burelis.findMany({
      where: { baseReviewCount: { gt: 0 } },
      select: { id: true, name: true, baseReviewCount: true, baseRating: true, description: true, city: true, category: true, subcategory: true },
    }),
    prisma.specialist.findMany({
      where: { baseReviewCount: { gt: 0 } },
      select: { id: true, name: true, baseReviewCount: true, baseRating: true, description: true, city: true, specialty: true },
    }),
  ]);

  console.log(`Items: kg=${kindergartens.length}, aukles=${aukles.length}, bureliai=${bureliai.length}, specialists=${specialists.length}`);

  const reviews: Array<{
    itemId: string;
    itemType: string;
    authorName: string;
    rating: number;
    text: string;
    isApproved: boolean;
    createdAt: Date;
  }> = [];

  // Global text usage tracker
  const globalTextUsage = new Map<string, number>();

  function trackText(text: string) {
    globalTextUsage.set(text, (globalTextUsage.get(text) || 0) + 1);
  }

  function generateReviewsForItem(item: EntityData, itemType: string) {
    const numReviews = Math.min(item.baseReviewCount, MAX_REVIEWS_PER_ENTITY);
    if (numReviews <= 0) return;

    const rand = seededRandom(item.id);
    const templates = templateMap[itemType];
    const usedTexts = new Set<string>();
    let featureReviewsGenerated = 0;

    // Parse features for kindergartens
    let features: string[] = [];
    if (itemType === 'kindergarten' && item.features) {
      try { features = JSON.parse(item.features); } catch { /* empty */ }
    }

    for (let i = 0; i < numReviews; i++) {
      const targetRating = pickWeightedRating(rand);
      let text: string | null = null;
      let finalRating = targetRating;

      // Try feature-based review first (for first 2-4 reviews, depending on feature count)
      const maxFeatureReviews = Math.min(Math.ceil(features.length * 0.7), 4, Math.ceil(numReviews * 0.4));

      if (itemType === 'kindergarten' && featureReviewsGenerated < maxFeatureReviews && features.length > 0) {
        text = generateFeatureReview(features, targetRating, rand);
        if (text && !usedTexts.has(text)) {
          featureReviewsGenerated++;
        } else {
          text = null;
        }
      } else if (itemType === 'burelis' && i < 2) {
        text = generateBurelisFeatureReview(item.category || item.subcategory, targetRating, rand);
        if (text && usedTexts.has(text)) text = null;
      } else if (itemType === 'specialist' && i < 2) {
        text = generateSpecialistFeatureReview(item.specialty, targetRating, rand);
        if (text && usedTexts.has(text)) text = null;
      }

      // Fall back to standalone text
      if (!text) {
        const result = pickStandaloneText(templates, targetRating, rand, usedTexts, globalTextUsage);
        if (result) {
          text = result.text;
          finalRating = result.rating;
        } else {
          continue; // Skip if truly nothing available
        }
      }

      usedTexts.add(text);
      trackText(text);

      const nameIdx = Math.floor(rand() * allNames.length);
      const authorName = allNames[nameIdx];

      const daysAgo = Math.floor(rand() * 540);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(rand() * 14) + 7);
      createdAt.setMinutes(Math.floor(rand() * 60));
      createdAt.setSeconds(Math.floor(rand() * 60));

      reviews.push({
        itemId: item.id,
        itemType,
        authorName,
        rating: finalRating,
        text,
        isApproved: true,
        createdAt,
      });
    }
  }

  for (const item of kindergartens) generateReviewsForItem(item as EntityData, 'kindergarten');
  for (const item of aukles) generateReviewsForItem(item as EntityData, 'aukle');
  for (const item of bureliai) generateReviewsForItem(item as EntityData, 'burelis');
  for (const item of specialists) generateReviewsForItem(item as EntityData, 'specialist');

  console.log(`\nTotal reviews to create: ${reviews.length}`);

  // Batch insert
  const BATCH_SIZE = 200;
  let created = 0;
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    const result = await prisma.review.createMany({ data: batch });
    created += result.count;
    if ((i / BATCH_SIZE) % 10 === 0) {
      console.log(`  Progress: ${created}/${reviews.length}`);
    }
  }

  console.log(`\nCreated ${created} reviews.`);

  // Print distribution
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => dist[r.rating]++);
  console.log('\nRating distribution:');
  for (let s = 1; s <= 5; s++) {
    console.log(`  ★${s}: ${dist[s]} (${(dist[s] * 100 / reviews.length).toFixed(1)}%)`);
  }

  // Check uniqueness stats
  const textCounts: Record<string, number> = {};
  reviews.forEach(r => { textCounts[r.text] = (textCounts[r.text] || 0) + 1; });
  const uniqueTexts = Object.keys(textCounts).length;
  const maxDupes = Math.max(...Object.values(textCounts));
  const over5 = Object.values(textCounts).filter(c => c > 5).length;
  console.log(`\nUnique texts: ${uniqueTexts}`);
  console.log(`Max repetitions of any single text: ${maxDupes}`);
  console.log(`Texts used >5 times: ${over5}`);

  // Feature review stats
  const featureTexts = reviews.filter(r =>
    r.text.includes('Ypač džiaugiamės') || r.text.includes('Ypač patinka') ||
    r.text.includes('Puikus būrelis!') || r.text.includes('Labai rekomenduoju!')
  ).length;
  console.log(`Feature-specific reviews: ~${featureTexts}`);

  // Update baseReviewCount and baseRating on ALL items
  console.log('\nUpdating base review counts and ratings...');

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
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any)[model].update({
          where: { id: item.id },
          data: {
            baseReviewCount: count,
            baseRating: count > 0 ? Math.round(avg * 10) / 10 : 0,
          },
        });
      } catch {
        // Skip if record not found (may have been deleted)
      }
    }
  }

  const [allKg, allAukle, allBurelis, allSpec] = await Promise.all([
    prisma.kindergarten.findMany({ select: { id: true } }),
    prisma.aukle.findMany({ select: { id: true } }),
    prisma.burelis.findMany({ select: { id: true } }),
    prisma.specialist.findMany({ select: { id: true } }),
  ]);

  await updateCounts(allKg, 'kindergarten', 'kindergarten');
  console.log('  ✓ Kindergartens updated.');
  await updateCounts(allAukle, 'aukle', 'aukle');
  console.log('  ✓ Aukles updated.');
  await updateCounts(allBurelis, 'burelis', 'burelis');
  console.log('  ✓ Bureliai updated.');
  await updateCounts(allSpec, 'specialist', 'specialist');
  console.log('  ✓ Specialists updated.');

  console.log('\n✅ Review seeding v2 complete!');
}

seedReviews()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
