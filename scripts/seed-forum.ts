import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ===== Categories =====
const categories = [
  {
    name: 'Darželiai',
    slug: 'darzeliai',
    description: 'Klausimai apie darželius',
    icon: '🏫',
    order: 1,
  },
  {
    name: 'Auklės',
    slug: 'aukles',
    description: 'Auklių paieška ir patarimai',
    icon: '👩‍👧',
    order: 2,
  },
  {
    name: 'Būreliai',
    slug: 'bureliai',
    description: 'Būrelių rekomendacijos',
    icon: '🎨',
    order: 3,
  },
  {
    name: 'Specialistai',
    slug: 'specialistai',
    description: 'Gydytojai, logopedai, psichologai',
    icon: '👨‍⚕️',
    order: 4,
  },
  {
    name: 'Tėvystė',
    slug: 'tevyste',
    description: 'Bendri klausimai apie vaikų auginimą',
    icon: '👨‍👩‍👧‍👦',
    order: 5,
  },
  {
    name: 'Mokyklos',
    slug: 'mokyklos',
    description: 'Pasiruošimas mokyklai',
    icon: '📚',
    order: 6,
  },
  {
    name: 'Sveikata',
    slug: 'sveikata',
    description: 'Vaikų sveikata ir mityba',
    icon: '🏥',
    order: 7,
  },
  {
    name: 'Laisvalaikis',
    slug: 'laisvalaikis',
    description: 'Renginiai, žaidimai, kelionės',
    icon: '🎪',
    order: 8,
  },
];

// ===== Post Data =====
interface PostSeed {
  categorySlug: string;
  title: string;
  content: string;
  authorName: string;
  city?: string;
}

const posts: PostSeed[] = [
  // === Darželiai (10 posts) ===
  {
    categorySlug: 'darzeliai',
    title: 'Koks darželis geriausias Vilniuje?',
    content: 'Sveiki, ieškome darželio Vilniuje, Antakalnio rajone. Vaikui 3 metai. Kokius darželius rekomenduotumėte? Svarbu gera mityba ir draugiškos auklėtojos. Gal kas turite patirties su privačiais darželiais tame rajone?',
    authorName: 'Rūta M.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Privatus ar valstybinis darželis — ką renkaties?',
    content: 'Svarstome, ar verta mokėti už privatų darželį, ar pakanka valstybinio. Mūsų rajone valstybinis darželis turi ilgą eilę, bet privatus kainuoja 400 EUR/mėn. Kas ką renkasi ir kodėl? Ar jaučiate skirtumą?',
    authorName: 'Jonas K.',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Adaptacija darželyje — kiek laiko trunka?',
    content: 'Mūsų dukra pradėjo lankyti darželį prieš 2 savaites ir kiekvieną rytą verkia. Auklėtoja sako, kad per dieną nusiramina, bet man vis tiek sunku. Kiek laiko jūsų vaikams užtruko prisitaikyti? Gal turite patarimų?',
    authorName: 'Aistė V.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Darželių eilės Klaipėdoje — kokia situacija?',
    content: 'Prisiregistravome į darželį Klaipėdoje, bet eilėje jau 200 vaikų prieš mus. Ar realu patekti iki rugsėjo? Gal kas žinote alternatyvų? Girdėjau, kad yra naujų privačių darželių atsidarę.',
    authorName: 'Mindaugas R.',
    city: 'Klaipėda',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Montessori darželiai Lietuvoje — patirtis?',
    content: 'Domina Montessori metodika. Ar turite patirties su Montessori darželiais Lietuvoje? Kokios kainos, ar verta? Ar vaikas paskui lengvai adaptuojasi prie įprastos mokyklos sistemos?',
    authorName: 'Simona L.',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Maitinimas darželyje — ar jūsų vaikai valgo?',
    content: 'Mūsų sūnus labai išrankus maistui ir darželyje beveik nieko nevalgo. Namuose valgo tik makaronus ir bananus. Auklėtojos sako, kad daugelis vaikų taip pradžioje. Bet jau 2 mėnesiai... Gal kas turėjo panašią situaciją?',
    authorName: 'Greta P.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Dvikalbiams vaikams — lietuviškas ar angliškas darželis?',
    content: 'Mūsų šeima dvikalbė (lietuvių/anglų). Vaikui 2,5 metų. Svarstome, ar leisti į lietuvišką darželį (kad sustiprėtų lietuvių kalba) ar tarptautinį. Kaip jūs sprendžiate?',
    authorName: 'Laura B.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Darželis nuo 1,5 metų — ar ne per anksti?',
    content: 'Darbdavys spaudžia grįžti į darbą, o vaikui tik 1,5 metų. Ar kas leidote tokio amžiaus vaikus į darželį? Kaip sekėsi? Man vis atrodo, kad per mažas dar...',
    authorName: 'Dovilė R.',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Kaip pasirinkti gerą darželį? Mano kriterijai',
    content: 'Noriu pasidalinti savo patirtimi renkantis darželį. Per 3 metus aplankiau 8 darželius ir sudėliojau kriterijų sąrašą: 1) Auklėtojų rotacija, 2) Vaikų skaičius grupėje, 3) Lauko aikštelė, 4) Maitinimo kokybė, 5) Tėvų bendruomenė. Kas dar svarbu jums?',
    authorName: 'Kristina A.',
    city: 'Šiauliai',
  },
  {
    categorySlug: 'darzeliai',
    title: 'Darželio keitimas — ar verta?',
    content: 'Lankome vieną darželį jau metus, bet neesame patenkinti — dažnai keičiasi auklėtojos, komunikacija su tėvais minimali. Bet vaikas jau priprato prie draugų. Ar verta keisti? Bijau, kad adaptacija vėl bus sunki.',
    authorName: 'Tadas V.',
    city: 'Panevėžys',
  },

  // === Auklės (8 posts) ===
  {
    categorySlug: 'aukles',
    title: 'Ieškau auklės Kaune — patarimai?',
    content: 'Ieškome auklės 2 metų dukrai Kaune, Žaliakalnyje. Reikia 3 dienas per savaitę, po pietų. Kokios kainos dabar Kaune? Kur geriausia ieškoti — per agentūras ar pažįstamus?',
    authorName: 'Paulius G.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'aukles',
    title: 'Auklė namuose vs darželis — privalumai ir trūkumai',
    content: 'Svarstome tarp auklės namuose ir darželio. Auklė kainuotų ~600 EUR/mėn., darželis ~350 EUR. Bet su aukle vaikas gautų daugiau individualaus dėmesio. Kas ką rinktumėtės ir kodėl?',
    authorName: 'Monika J.',
  },
  {
    categorySlug: 'aukles',
    title: 'Kaip patikrinti auklės patikimumą?',
    content: 'Samdome auklę pirmą kartą ir truputį nerimauju. Kokius klausimus reikėtų užduoti per pokalbį? Ar prašote rekomendacijų iš buvusių darbdavių? Ar kas naudojate kameras namuose?',
    authorName: 'Sandra K.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'aukles',
    title: 'Auklės darbo sutartis — ką turėtų apimti?',
    content: 'Norime oficialiai įdarbinti auklę. Kokios pagrindinės sutarties sąlygos turėtų būti? Ar kas turite pavyzdinę sutartį? Kaip dėl mokesčių — kiek iš tikrųjų kainuoja oficialiai įdarbinta auklė?',
    authorName: 'Eglė V.',
  },
  {
    categorySlug: 'aukles',
    title: 'Nanny sharing — ar kas bandėte?',
    content: 'Girdėjau apie "nanny sharing" koncepciją, kai dvi šeimos dalina vieną auklę. Ar kas Lietuvoje tai praktikuojate? Kaip veikia logistika? Kokie privalumai ir trūkumai?',
    authorName: 'Jurgita R.',
  },
  {
    categorySlug: 'aukles',
    title: 'Auklė su pedagoginiu išsilavinimu — ar svarbu?',
    content: 'Ieškome auklės ir pastebėjome, kad su pedagoginiu išsilavinimu kainos aukštesnės. Ar tai tikrai verta? Kokią auklę pasirinkti — su patirtimi bet be diplomo, ar su diplomu bet mažiau patirties?',
    authorName: 'Daiva S.',
  },
  {
    categorySlug: 'aukles',
    title: 'Auklės keitimas — kaip pasakyti vaikui?',
    content: 'Mūsų auklė išeina po 1,5 metų darbo. Sūnus (3 m.) labai prie jos prisirišęs. Kaip paruošti vaiką pokyčiui? Gal kas turėjote panašią patirtį?',
    authorName: 'Renata P.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'aukles',
    title: 'Auklė kūdikiui — nuo kokio amžiaus?',
    content: 'Planuoju grįžti į darbą, kai kūdikiui bus 6 mėnesiai. Ar kas samdėte auklę tokiam mažam vaikui? Kokie svarbiausi dalykai, į kuriuos atkreipti dėmesį?',
    authorName: 'Neringa V.',
  },

  // === Būreliai (8 posts) ===
  {
    categorySlug: 'bureliai',
    title: 'Ar verta vaiką leisti į šachmatų būrelį nuo 4 metų?',
    content: 'Sūnui 4 metai ir jis mėgsta stalo žaidimus. Galvojame apie šachmatų būrelį. Ar 4 metai ne per anksti? Gal kas turite patirties — ar vaikai neatsibodo po kelių mėnesių?',
    authorName: 'Giedrius T.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'bureliai',
    title: 'Robotikos būreliai Kaune — rekomendacijos',
    content: 'Ieškome robotikos būrelio 6 metų sūnui Kaune. Yra keli variantai, bet sunku pasirinkti. Ar kas lanko robotikos būrelius Kaune ir galite parekomenduoti? Kokios kainos?',
    authorName: 'Inga M.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'bureliai',
    title: 'Kiek būrelių per savaitę yra per daug?',
    content: 'Dukra (6 m.) lanko šokius, dailę ir anglų kalbos būrelį. Dabar dar nori plaukimą. Bet man atrodo, kad 4 būreliai per savaitę — per daug. Kiek jūsų vaikai lanko? Ar nematote nuovargio ženklų?',
    authorName: 'Vaida L.',
  },
  {
    categorySlug: 'bureliai',
    title: 'Muzikos būrelis — nuo kokio amžiaus pradėti?',
    content: 'Vaikas labai muzikalus — nuolat dainuoja ir mušinėja ritmą. Jam 3 metai. Ar yra muzikos būrelių tokio amžiaus vaikams? Kas rekomenduotumėte — ritmikos, dainavimo ar instrumentų?',
    authorName: 'Neringa K.',
  },
  {
    categorySlug: 'bureliai',
    title: 'Sportiniai būreliai — futbolas ar krepšinis?',
    content: 'Sūnui 5 metai ir norime pradėti sportinį būrelį. Tarp futbolo ir krepšinio — ką rekomenduotumėte? Ar šiame amžiuje dar nesvarbu ir tiesiog reikia judėjimo?',
    authorName: 'Lina K.',
    city: 'Klaipėda',
  },
  {
    categorySlug: 'bureliai',
    title: 'Teatro būrelis — nuostabi patirtis',
    content: 'Noriu pasidalinti — mūsų dukra (7 m.) pradėjo lankyti teatro būrelį ir pokytis nepaprastas. Tapo drąsesnė, geriau reiškia emocijas, susiranda draugų. Labai rekomenduoju visiems, kurių vaikai drovūs!',
    authorName: 'Kristina P.',
  },
  {
    categorySlug: 'bureliai',
    title: 'Programavimo būrelis 7-mečiui — ar ne per anksti?',
    content: 'Sūnus domisi kompiuteriais ir norėtų mokytis programuoti. Jam 7 metai. Ar yra gerų programavimo būrelių vaikams Vilniuje? Ar Scratch programavimas tinka tokio amžiaus vaikams?',
    authorName: 'Artūras B.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'bureliai',
    title: 'Dailės būreliai — kur geriausia?',
    content: 'Ieškome dailės būrelio dukrai (5 m.) Vilniuje. Ar kas galite parekomenduoti gerą dailės studiją vaikams? Svarbu, kad vadovė būtų kantri ir kūrybinga. Kainos irgi domina.',
    authorName: 'Sigita R.',
    city: 'Vilnius',
  },

  // === Specialistai (8 posts) ===
  {
    categorySlug: 'specialistai',
    title: 'Geras logopedas Vilniuje — rekomendacijos?',
    content: 'Sūnui 4 metai ir dar netaria kelių raidžių (r, š, ž). Pediatrė rekomendavo logopedą. Ar galite parekomenduoti gerą logopedą Vilniuje? Kiek paprastai kainuoja vizitas?',
    authorName: 'Neringa V.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'specialistai',
    title: 'Vaikų psichologas — kada kreiptis?',
    content: 'Mūsų dukra (5 m.) po broliuko gimimo labai pasikeitė — tapo agresyvi, blogai miega, atsisako valgyti. Ar verta kreiptis į vaikų psichologą? Ar tai normali reakcija, kuri praeis savaime?',
    authorName: 'Rita S.',
  },
  {
    categorySlug: 'specialistai',
    title: 'Ergoterapija vaikams — kas tai ir kam reikia?',
    content: 'Darželio auklėtoja pasiūlė pasikonsultuoti dėl ergoterapijos, nes sūnus (4 m.) sunkiai laiko pieštukąir nenori piešti. Ar kas turėjote patirties su ergoterapija? Ar padėjo?',
    authorName: 'Aušra M.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'specialistai',
    title: 'Ortodontas vaikui — nuo kokio amžiaus?',
    content: 'Pastebėjau, kad dukros (6 m.) dantys auga kreivai. Dantų gydytoja sakė palaukti, kol iškris pieniniai. Bet draugė patarė eiti pas ortodontą anksčiau. Ką manote? Nuo kada verta kreiptis?',
    authorName: 'Justina M.',
  },
  {
    categorySlug: 'specialistai',
    title: 'Kineziterapija vaikui su laikysenos problemomis',
    content: 'Sūnui 7 metai ir pastebėjome, kad jis susikūprinęs sėdi ir vaikšto. Pediatrė pasiuntė pas kineziterapeutą. Ar kas turėjote panašią patirtį? Kiek laiko trunka korekciniai pratimai, kol matosi rezultatas?',
    authorName: 'Edvardas P.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'specialistai',
    title: 'Alergologas vaikui Kaune — kas geriausias?',
    content: 'Sūnui (3 m.) nuolat bėga nosis ir kosėja. Gydytojai sako, kad gali būti alergija, bet tiksliai nenustatė. Ieškome gero alergologo Kaune. Gal kas galite parekomenduoti?',
    authorName: 'Viktorija S.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'specialistai',
    title: 'Neurologas vaikui — eilė 3 mėnesiai',
    content: 'Reikia vaikų neurologo konsultacijos, bet eilė valstybinėje poliklinikoje — 3 mėnesiai. Ar kas žinote, kur galima patekti greičiau? Gal privatūs neurologai Vilniuje? Kokios kainos?',
    authorName: 'Milda R.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'specialistai',
    title: 'Psichologo konsultacija prieš mokyklą — ar verta?',
    content: 'Ruošiamės leisti vaiką į mokyklą (jam bus 6,5 metų). Draugai patarė nueiti pas vaikų psichologą brandos įvertinimui. Ar tai būtina? Kas ką darėte prieš mokyklą?',
    authorName: 'Dalia A.',
  },

  // === Tėvystė (8 posts) ===
  {
    categorySlug: 'tevyste',
    title: 'Ekranų laikas vaikams — kiek leisti?',
    content: 'Mūsų 4-metis prašo žiūrėti planšetę kiekvieną dieną. Dabar leidžiame ~1 val., bet kartais sunku atimti. Kiek jūs leidžiate ekranų laiko? Ar turite taisyklių, kurios veikia?',
    authorName: 'Tomas V.',
  },
  {
    categorySlug: 'tevyste',
    title: 'Miego problemos — 3-metis nemiega vienas',
    content: 'Sūnus (3 m.) atsisako miegoti savo lovoje ir kiekvieną naktį ateina pas mus. Bandėme viską — naktinę lemputę, skaitymo ritualą, apdovanojimus. Niekas nepadeda. Gal kas turėjote panašią situaciją?',
    authorName: 'Agnė D.',
  },
  {
    categorySlug: 'tevyste',
    title: 'Antras vaikas — kaip paruošti pirmąjį?',
    content: 'Laukiamės antro vaiko. Pirmagimei dukrai 3 metai. Kaip paruošti ją broliuko/sesutės atėjimui? Kokios knygos, patarimai? Bijau pavydo ir regreso...',
    authorName: 'Ieva B.',
  },
  {
    categorySlug: 'tevyste',
    title: 'Vaikas muša kitus vaikus darželyje',
    content: 'Gavome iš darželio pranešimą, kad sūnus (3,5 m.) muša kitus vaikus. Namuose tokio elgesio nepastebime. Ką daryti? Kaip reaguoti? Gal kas turėjote panašią patirtį?',
    authorName: 'Vytautas S.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'tevyste',
    title: 'Savivertė — kaip auginti pasitikintį vaiką?',
    content: 'Pastebėjau, kad dukra (6 m.) dažnai sako "aš nemoku", "man nepavyks". Noriu padėti jai sustiprinti pasitikėjimą savimi. Kokius metodus taikote? Gal kas skaitėte gerų knygų šia tema?',
    authorName: 'Ramunė S.',
  },
  {
    categorySlug: 'tevyste',
    title: 'Tėčio vaidmuo — kaip įsitraukti daugiau?',
    content: 'Esu tėtis ir noriu būti aktyvesnis savo vaikų gyvenime, bet jaučiuosi, kad mama viską daro geriau. Kaip kiti tėčiai randa savo vietą? Kokias veiklas darote su vaikais?',
    authorName: 'Andrius M.',
  },
  {
    categorySlug: 'tevyste',
    title: 'Dvynukai — patarimai iš patirties',
    content: 'Sužinojome, kad laukiamės dvynukų! Džiaugsmas mišrus su panika. Kas auginate dvynukus — kokie pagrindiniai patarimai? Ką pirkti dvigubai, o ką galima dalinti?',
    authorName: 'Lina D.',
  },
  {
    categorySlug: 'tevyste',
    title: 'Vaiko dėmesio sutelkimas — kaip padėti?',
    content: 'Sūnui 5 metai ir jam labai sunku sutelkti dėmesį. Niekada neužbaigia pradėtos veiklos, nuolat šokinėja nuo vieno prie kito. Ar tai normalu šiam amžiui? Ar reikėtų konsultuotis su specialistu?',
    authorName: 'Edita M.',
    city: 'Kaunas',
  },

  // === Mokyklos (7 posts) ===
  {
    categorySlug: 'mokyklos',
    title: 'Pasiruošimas mokyklai — ką turi mokėti vaikas?',
    content: 'Sūnui rudenį bus 7 metai ir eis į pirmą klasę. Ką jis turėtų mokėti prieš mokyklą? Girdžiu skirtingas nuomones — vieni sako, kad turi mokėti skaityti, kiti — kad visiškai nereikia. Kokia realybė?',
    authorName: 'Darius V.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'mokyklos',
    title: 'Mokykla 6-mečiui — ar leisti anksčiau?',
    content: 'Dukra gimusi lapkričio mėnesį ir bus 6 metai rugsėjį. Ji jau skaito, skaičiuoja ir labai nori eiti į mokyklą. Ar verta leisti anksčiau? Kokia jūsų patirtis su jaunesniais mokiniais?',
    authorName: 'Sigita V.',
  },
  {
    categorySlug: 'mokyklos',
    title: 'Priešmokyklinė grupė — ar tikrai būtina?',
    content: 'Mūsų rajone priešmokyklinė grupė yra kitame darželyje nei dabartinis. Ar tikrai būtina lankyti, ar galima paruošti vaiką namuose? Ką daro priešmokyklinėje, ko nedaroma paprastoje darželio grupėje?',
    authorName: 'Asta K.',
  },
  {
    categorySlug: 'mokyklos',
    title: 'Geriausia pradinė mokykla Kaune?',
    content: 'Renkamės pradinę mokyklą Kaune. Domina mokyklos centre arba Žaliakalnyje. Ar kas galite pasidalinti patirtimi? Kokie svarbiausi kriterijai renkantis mokyklą?',
    authorName: 'Rima D.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'mokyklos',
    title: 'Mokyklinė uniforma — už ar prieš?',
    content: 'Renkamės mokyklą ir vienoje reikalauja uniformos, kitoje — ne. Kaip jūs žiūrite į mokyklines uniformas? Ar tai disciplinuoja, ar tik papildoma išlaida?',
    authorName: 'Virginija S.',
  },
  {
    categorySlug: 'mokyklos',
    title: 'Namų darbai pirmokams — kiek yra normalu?',
    content: 'Sūnus pirmokas ir kiekvieną vakarą praleidžiame 1-1,5 val. prie namų darbų. Man atrodo, kad per daug. Kiek jūsų pirmokai skiria laiko namų darbams? Ar kalbatės su mokytoja, jei per daug?',
    authorName: 'Jurgita K.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'mokyklos',
    title: 'Waldorf mokykla — patirtis?',
    content: 'Domina Waldorf pedagogika ir svarstome dėl Waldorf mokyklos. Ar kas turite patirties? Kokie privalumai ir trūkumai? Kaip vaikas adaptuojasi, jei vėliau reikia pereiti į įprastą mokyklą?',
    authorName: 'Marius L.',
  },

  // === Sveikata (7 posts) ===
  {
    categorySlug: 'sveikata',
    title: 'Vaikas dažnai serga — kaip stiprinti imunitetą?',
    content: 'Sūnus (3 m.) pradėjo lankyti darželį ir serga kas 2 savaites. Tai normalu? Gydytojas sakė, kad tai adaptuojasi, bet jau 4 mėnesiai... Kokius vitaminusduodate vaikams? Gal kas padėjo sustiprinti imunitetą?',
    authorName: 'Sandra P.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'sveikata',
    title: 'Vaiko mityba — ką daryti, kai nieko nevalgo?',
    content: 'Dukra (2,5 m.) labai išranki maistui. Valgo tik duoną, sūrį ir obuolius. Mėsos, daržovių, pieno produktų — kategoriškai atsisako. Ar tai faze? Kaip išplėsti mitybą be streso?',
    authorName: 'Monika R.',
  },
  {
    categorySlug: 'sveikata',
    title: 'Skiepai — kokia jūsų patirtis?',
    content: 'Mūsų vaikui artėja skiepų laikas ir norėčiau sužinoti kitų tėvų patirtį. Kokios buvo reakcijos? Ar kas turėjote stipresnių šalutinių poveikių? Kokius papildomus skiepus rekomendavo jūsų gydytojas?',
    authorName: 'Aida K.',
  },
  {
    categorySlug: 'sveikata',
    title: 'Antroji nuomonė — ar verta ieškoti?',
    content: 'Gydytojas diagnozavo vaikui vieną diagnozę, bet man kažkas nesutampa. Ar verta kreiptis į kitą specialistą dėl antros nuomonės? Ar tai normalu, ar bus vertinama kaip nepasitikėjimas?',
    authorName: 'Jolanta K.',
  },
  {
    categorySlug: 'sveikata',
    title: 'Užkrėčiamos ligos darželyje — kaip apsisaugoti?',
    content: 'Per paskutinius 3 mėnesius darželyje buvo utėlės, rankų-kojų-burnos liga ir rotavirusas. Ar galima kaip nors apsisaugoti? Kokias higienines priemones taikote?',
    authorName: 'Gintarė B.',
    city: 'Kaunas',
  },
  {
    categorySlug: 'sveikata',
    title: 'Veganiška mityba vaikui — ar saugu?',
    content: 'Esame veganai ir norime, kad vaikas irgi valgytų veganiškai. Bet kai kurie gydytojai prieštarauja. Ar kas auginate vaikus be gyvūninių produktų? Kaip užtikrinate visus maistines medžiagas?',
    authorName: 'Rūta G.',
  },
  {
    categorySlug: 'sveikata',
    title: 'Vaiko dantukai — nuo kada pradėti valyti?',
    content: 'Sūnui 10 mėnesių ir jau turi 4 dantukus. Nuo kada ir kaip pradėti valyti? Ar reikia specialios dantų pastos kūdikiams? Ar kas turite gerą vaikišką šepetėlį parekomenduoti?',
    authorName: 'Simona V.',
  },

  // === Laisvalaikis (7 posts) ===
  {
    categorySlug: 'laisvalaikis',
    title: 'Geriausi žaidimai namuose kai lyja',
    content: 'Ieškau idėjų, ką veikti namuose su 3 ir 5 metų vaikais, kai lauke lyja. Jau išbandėme plastiliną, piešimą, statybas iš Lego. Kas dar veikia? Dalinkitės idėjomis!',
    authorName: 'Laura V.',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Kelionė su vaikais — Turkija ar Graikija?',
    content: 'Planuojame vasaros atostogas su 2 ir 5 metų vaikais. Svarstome tarp Turkijos ir Graikijos. Kur geriau su mažais vaikais? Ypač domina maistas, smėlėti paplūdimiai ir kaina.',
    authorName: 'Tomas P.',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Vaikų gimtadienio organizavimas — idėjos?',
    content: 'Dukrai sueis 5 metai ir norime surengti gimtadienį. Namuose per maža vietos (bus ~15 vaikų). Ar kas žinote gerų vietų Vilniuje vaikų gimtadieniams? Kiek paprastai kainuoja?',
    authorName: 'Inga T.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Stovyklos vaikams vasarą — rekomendacijos',
    content: 'Ieškome vasaros stovyklos 7-metei dukrai. Domina gamtos stovyklos arba meno stovyklos. Kur jūsų vaikai važiuoja vasarą? Kaip su adaptacija — ar vaikai nebijo be tėvų?',
    authorName: 'Dalia P.',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Geriausios vaikų žaidimų aikštelės Vilniuje',
    content: 'Kokios jūsų mėgstamiausios žaidimų aikštelės Vilniuje? Ieškome naujų vietų pasivaikščioti su vaikais. Ypač domina aikštelės su tualetais netoliese ir su kavinėmis šalia.',
    authorName: 'Renata V.',
    city: 'Vilnius',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Savaitgalio veiklos su vaikais — idėjų bankas',
    content: 'Kiekvieną savaitgalį svarstome ką veikti su vaikais. Pabodo prekybos centrai ir kinas. Kokias veiklas jūs darote savaitgaliais? Gal yra mažiau žinomų vietų, kur smagu su vaikais?',
    authorName: 'Andrius L.',
  },
  {
    categorySlug: 'laisvalaikis',
    title: 'Knygos vaikams lietuvių kalba — ką rekomenduojate?',
    content: 'Ieškome gerų knygų lietuvių kalba 3-5 metų vaikams. Dabar skaitome Sipniauskas ir Astrid Lindgren vertimus. Ką dar rekomenduotumėte? Ypač domina lietuvių autoriai.',
    authorName: 'Milda K.',
  },
];

// ===== Comment templates =====
const commentAuthors = [
  'Rūta M.', 'Jonas K.', 'Aistė V.', 'Mindaugas R.', 'Simona L.',
  'Greta P.', 'Laura B.', 'Dovilė R.', 'Kristina A.', 'Tadas V.',
  'Paulius G.', 'Monika J.', 'Sandra K.', 'Eglė V.', 'Jurgita R.',
  'Neringa V.', 'Rita S.', 'Aušra M.', 'Justina M.', 'Edvardas P.',
  'Giedrius T.', 'Inga M.', 'Vaida L.', 'Neringa K.', 'Lina K.',
  'Artūras B.', 'Sigita R.', 'Tomas V.', 'Agnė D.', 'Ieva B.',
  'Ramunė S.', 'Andrius M.', 'Edita M.', 'Darius V.', 'Rima D.',
];

const commentTexts = [
  // Darželiai related
  'Mes lankome darželį tame rajone ir esame labai patenkinti. Auklėtojos nuostabios!',
  'Mūsų patirtis panaši — adaptacija truko apie mėnesį, bet paskui viskas susitvarkė.',
  'Rekomenduoju pasikalbėti su darželio direktore asmeniškai — daug kas paaiškėja.',
  'Mes irgi rinkome tarp privataus ir valstybinio. Galų gale pasirinkome privatų ir nesigailime.',
  'Darželio keitimas buvo geriausias sprendimas, kurį priėmėme. Vaikas dabar laimingas.',
  'Sutinku — maitinimas labai svarbus. Mūsų darželyje maistą gamina vietoje ir labai skanu.',
  'Eilės darželiuose yra rimta problema. Mes registravomės kai vaikui buvo tik 6 mėnesiai.',

  // Auklės related
  'Geriausia ieškoti auklės per rekomendacijas — taip radome savo.',
  'Sutartis būtina! Mes turėjome blogą patirtį be sutarties — auklė tiesiog neatėjo vieną dieną.',
  'Kaina priklauso nuo patirties ir lokacijos. Vilniuje auklė kainuoja 7-12 EUR/val.',
  'Nanny sharing puikiai veikia, jei šeimos turi panašaus amžiaus vaikus.',
  'Kameros namuose — diskutuotinas klausimas. Mes naudojame ir auklė sutiko.',

  // Būreliai related
  'Mūsų vaikas lanko šachmatų būrelį nuo 5 metų ir labai patinka!',
  'Robotikos būrelis — geriausias pasirinkimas. Vaikas išmoksta loginio mąstymo.',
  'Mes irgi turėjome per daug būrelių. Sumažinome iki 2 per savaitę ir vaikas laimingesnis.',
  'Scratch programavimas tinka nuo 6-7 metų. Mūsų sūnus jau kuria savo žaidimus!',
  'Teatro būrelis padėjo dukrai įveikti drovumą. Labai rekomenduoju.',

  // Specialistai related
  'Logopedas padėjo per 4 mėnesius. Kantrybė ir reguliarūs pratimai — svarbiausia.',
  'Kreipėmės į vaikų psichologą ir labai padėjo. Nereikia bijoti.',
  'Ergoterapija — nuostabi pagalba. Mūsų sūnus po 3 mėnesių jau noriai piešia.',
  'Ortodontui verta kreiptis kuo anksčiau. Mūsų dukrai 7 metai ir jau dėvi breketines plokšteles.',
  'Privatus neurologas kainuoja apie 60-80 EUR, bet pateksite per savaitę.',

  // Tėvystė related
  'Mes ribojame ekranų laiką iki 30 min. per dieną. Sunku, bet veikia.',
  'Miego problemas turėjome iki 4 metų. Kantrybės — praeis!',
  'Knygos apie naują šeimos narį labai padeda paruošti vaiką.',
  'Sutinku, kad dėmesio sutelkimas 5-mečiams dar sunkus. Tai normalu šiam amžiui.',
  'Tėčiai yra labai svarbūs! Mano vyras daro pusryčius ir skaito prieš miegą — vaikai jį dievina.',

  // Mokyklos related
  'Mano vaikas ėjo į mokyklą nemokėdamas skaityti ir per pusmetį viską pasivijo.',
  'Priešmokyklinė grupė labai padėjo — vaikas priprato prie tvarkos ir disciplinos.',
  'Waldorf mokykloje vaikai laimingi, bet perėjimas į įprastą mokyklą gali būti sudėtingas.',
  'Namų darbų pirmokams turėtų būti ne daugiau 30 min. per dieną.',
  'Uniformos prasmė yra ta, kad vaikai nesiskirsto pagal drabužius.',

  // Sveikata related
  'Pirmi metai darželyje visi vaikai daug serga. Antrais metais imunitetas sustiprintas.',
  'Vitaminas D visus metus ir omega-3 — mūsų pediatrės rekomendacija.',
  'Antra nuomonė visada verta! Geriau pasitikrinti nei nerimauti.',
  'Dantukus pradėjome valyti nuo pirmo dantuko. Svarbu nuo mažens formuoti įprotį.',

  // Laisvalaikis related
  'Graikija su vaikais buvo nuostabi! Jūra šilta, maistas skanus, žmonės draugiški.',
  'Stovykla gamtoje — geriausias pasirinkimas. Vaikai grįžta pilni įspūdžių.',
  'Mes kiekvieną savaitgalį einame į kitą parką. Vilniuje yra daugybė nuostabių vietų.',
  'Rekomenduoju Justino Marcinkevičiaus knygas vaikams — labai gražios.',
  'Gimtadienį šventėme batutų parke — vaikai buvo laimingi!',

  // Generic supportive comments
  'Ačiū, kad pasidalinote! Labai naudinga informacija.',
  'Mūsų patirtis labai panaši. Tikrai suprantu jūsų situaciją.',
  'Puikus klausimas! Irgi norėčiau sužinoti kitų nuomonę.',
  'Visiškai sutinku su jumis! Patys turėjome tokią pačią patirtį.',
  'Ačiū už patarimą — būtinai išbandysime!',
  'Labai gera tema. Tokių diskusijų reikia daugiau.',
  'Mes praėjome tuo pačiu keliu. Kantrybės — viskas susitvarkys!',
  'Gera žinoti, kad ne mes vieni susiduriame su tokia situacija.',
  'Ačiū, kad paklausėte — patys turėjome panašų klausimą, bet nedrįsome paklausti.',
  'Puiku, kad yra tokia platforma, kur galime pasidalinti patirtimi.',
];

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

async function seedForum() {
  console.log('Seeding forum data...');

  // Clean existing forum data
  console.log('Cleaning existing forum data...');
  await prisma.forumVote.deleteMany({});
  await prisma.forumComment.deleteMany({});
  await prisma.forumPost.deleteMany({});
  await prisma.forumCategory.deleteMany({});
  console.log('Cleaned.');

  // Create categories
  console.log('Creating categories...');
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const created = await prisma.forumCategory.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
    console.log(`  Created category: ${cat.name} (${created.id})`);
  }

  // Create posts
  console.log('Creating posts...');
  const rand = seededRandom('forum-seed-2026');
  const createdPosts: Array<{ id: string; slug: string; categorySlug: string }> = [];

  const usedSlugs = new Set<string>();

  for (const post of posts) {
    const categoryId = categoryMap.get(post.categorySlug);
    if (!categoryId) {
      console.error(`  Category not found: ${post.categorySlug}`);
      continue;
    }

    let slug = slugify(post.title);
    while (usedSlugs.has(slug)) {
      slug = slug + '-' + Math.floor(rand() * 1000);
    }
    usedSlugs.add(slug);

    // Random timestamps (within last 6 months)
    const daysAgo = Math.floor(rand() * 180);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(Math.floor(rand() * 14) + 7);
    createdAt.setMinutes(Math.floor(rand() * 60));

    // Random votes and views
    const upvotes = Math.floor(rand() * 25);
    const downvotes = Math.floor(rand() * 5);
    const viewCount = upvotes * Math.floor(rand() * 10 + 5) + Math.floor(rand() * 50);

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

    createdPosts.push({ id: created.id, slug: created.slug, categorySlug: post.categorySlug });
  }
  console.log(`  Created ${createdPosts.length} posts.`);

  // Create comments
  console.log('Creating comments...');
  let commentCount = 0;

  for (const post of createdPosts) {
    // Each post gets 2-5 top-level comments
    const numComments = Math.floor(rand() * 4) + 2;

    const topLevelCommentIds: string[] = [];

    for (let i = 0; i < numComments; i++) {
      const authorIdx = Math.floor(rand() * commentAuthors.length);
      const textIdx = Math.floor(rand() * commentTexts.length);

      const daysAgo = Math.floor(rand() * 30);
      const commentDate = new Date();
      commentDate.setDate(commentDate.getDate() - daysAgo);
      commentDate.setHours(Math.floor(rand() * 14) + 7);
      commentDate.setMinutes(Math.floor(rand() * 60));

      const upvotes = Math.floor(rand() * 10);
      const downvotes = Math.floor(rand() * 2);

      const comment = await prisma.forumComment.create({
        data: {
          postId: post.id,
          content: commentTexts[textIdx],
          authorName: commentAuthors[authorIdx],
          upvotes,
          downvotes,
          createdAt: commentDate,
        },
      });

      topLevelCommentIds.push(comment.id);
      commentCount++;

      // 40% chance of a reply to this comment (level 2)
      if (rand() < 0.4) {
        const replyAuthorIdx = Math.floor(rand() * commentAuthors.length);
        const replyTextIdx = Math.floor(rand() * commentTexts.length);

        const replyDate = new Date(commentDate);
        replyDate.setHours(replyDate.getHours() + Math.floor(rand() * 48) + 1);

        const reply = await prisma.forumComment.create({
          data: {
            postId: post.id,
            parentId: comment.id,
            content: commentTexts[replyTextIdx],
            authorName: commentAuthors[replyAuthorIdx],
            upvotes: Math.floor(rand() * 5),
            downvotes: 0,
            createdAt: replyDate,
          },
        });
        commentCount++;

        // 25% chance of a sub-reply (level 3)
        if (rand() < 0.25) {
          const subReplyAuthorIdx = Math.floor(rand() * commentAuthors.length);
          const subReplyTextIdx = Math.floor(rand() * commentTexts.length);

          const subReplyDate = new Date(replyDate);
          subReplyDate.setHours(subReplyDate.getHours() + Math.floor(rand() * 24) + 1);

          await prisma.forumComment.create({
            data: {
              postId: post.id,
              parentId: reply.id,
              content: commentTexts[subReplyTextIdx],
              authorName: commentAuthors[subReplyAuthorIdx],
              upvotes: Math.floor(rand() * 3),
              downvotes: 0,
              createdAt: subReplyDate,
            },
          });
          commentCount++;
        }
      }
    }
  }

  console.log(`  Created ${commentCount} comments.`);

  // Summary
  const totalPosts = await prisma.forumPost.count();
  const totalComments = await prisma.forumComment.count();
  const totalCategories = await prisma.forumCategory.count();

  console.log('\nSeed complete!');
  console.log(`  Categories: ${totalCategories}`);
  console.log(`  Posts: ${totalPosts}`);
  console.log(`  Comments: ${totalComments}`);
}

seedForum()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
