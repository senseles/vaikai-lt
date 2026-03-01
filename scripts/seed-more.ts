import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Helper utilities ──────────────────────────────────────────────────────────

const LT_CHAR_MAP: Record<string, string> = {
  'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
  'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
};
const LT_CHAR_RE = new RegExp('[' + Object.keys(LT_CHAR_MAP).join('') + ']', 'g');

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(LT_CHAR_RE, (ch) => LT_CHAR_MAP[ch] || ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function phoneNumber(): string {
  return `+370 ${randBetween(600, 699)} ${randBetween(10000, 99999)}`;
}

// ── Lithuanian data pools ─────────────────────────────────────────────────────

const CITIES = [
  'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys',
  'Palanga', 'Šilutė', 'Tauragė', 'Alytus', 'Marijampolė',
  'Utena', 'Druskininkai', 'Jonava',
];

const CITY_REGIONS: Record<string, string> = {
  'Vilnius': 'Vilniaus apskritis',
  'Kaunas': 'Kauno apskritis',
  'Klaipėda': 'Klaipėdos apskritis',
  'Šiauliai': 'Šiaulių apskritis',
  'Panevėžys': 'Panevėžio apskritis',
  'Palanga': 'Klaipėdos apskritis',
  'Šilutė': 'Klaipėdos apskritis',
  'Tauragė': 'Tauragės apskritis',
  'Alytus': 'Alytaus apskritis',
  'Marijampolė': 'Marijampolės apskritis',
  'Utena': 'Utenos apskritis',
  'Druskininkai': 'Alytaus apskritis',
  'Jonava': 'Kauno apskritis',
};

const CITY_AREAS: Record<string, string[]> = {
  'Vilnius': ['Senamiestis', 'Antakalnis', 'Žirmūnai', 'Šeškinė', 'Fabijoniškės', 'Pašilaičiai', 'Pilaitė', 'Lazdynai', 'Karoliniškės', 'Baltupiai'],
  'Kaunas': ['Centras', 'Žaliakalnis', 'Eiguliai', 'Šilainiai', 'Dainava', 'Aleksotas', 'Petrašiūnai', 'Vilijampolė'],
  'Klaipėda': ['Senamiestis', 'Melnragė', 'Giruliai', 'Debrecenas', 'Bandužiai', 'Tauralaukis'],
  'Šiauliai': ['Centras', 'Lieporiai', 'Dainai', 'Gubernija', 'Zokniai'],
  'Panevėžys': ['Centras', 'Kniaudiškiai', 'Tulpių', 'Senvagė'],
  'Palanga': ['Centras', 'Šventoji'],
  'Šilutė': ['Centras'],
  'Tauragė': ['Centras'],
  'Alytus': ['Centras', 'Putinai', 'Vidzgiris', 'Dainava'],
  'Marijampolė': ['Centras', 'Mokolai'],
  'Utena': ['Centras', 'Vyturiai'],
  'Druskininkai': ['Centras', 'Viečiūnai'],
  'Jonava': ['Centras', 'Žeimiai'],
};

// ── Aukle data ────────────────────────────────────────────────────────────────

const FEMALE_FIRST_NAMES = [
  'Rasa', 'Jūratė', 'Daiva', 'Rima', 'Sigita', 'Giedrė', 'Lina', 'Jolanta',
  'Vilma', 'Inga', 'Renata', 'Vida', 'Neringa', 'Aušra', 'Eglė', 'Gintarė',
  'Kristina', 'Justina', 'Simona', 'Monika', 'Ieva', 'Živilė', 'Agnė', 'Dalia',
  'Birutė', 'Rūta', 'Laima', 'Nijolė', 'Jurgita', 'Audronė', 'Ona', 'Aldona',
  'Vaida', 'Edita', 'Loreta', 'Aistė', 'Indrė', 'Dovilė', 'Karolina', 'Emilija',
  'Viktorija', 'Gabija', 'Austėja', 'Milda', 'Goda', 'Ugnė', 'Deimantė', 'Ringailė',
  'Saulė', 'Nida',
];

const LAST_INITIALS = ['A', 'B', 'C', 'D', 'G', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'Š', 'T', 'V', 'Z', 'Ž'];

const AUKLE_DESCRIPTIONS = [
  'Patirtis dirbant su vaikais ikimokyklinio amžiaus. Turiu aukštąjį pedagoginį išsilavinimą.',
  'Myliu vaikus ir turiu ilgametę patirtį prižiūrėti mažylius. Kūrybiškos veiklos, pasivaikščiojimai, sveika mityba.',
  'Esu kantri, atsakinga ir mylinti vaikus auklė. Organizuoju edukacines veiklas ir lavinamuosius žaidimus.',
  'Dirbu su vaikais jau daugiau nei 10 metų. Siūlau individualų požiūrį į kiekvieną vaiką.',
  'Profesionali vaikų priežiūra jūsų namuose. Turiu pirmosios pagalbos pažymėjimą.',
  'Galiu prižiūrėti vaikus nuo kūdikystės iki mokyklinio amžiaus. Patirtis su dvynukais.',
  'Turiu pedagoginį išsilavinimą ir specialiosios pedagogikos kvalifikaciją.',
  'Mėgstu gamtą, meną ir sportą – visa tai integruoju į vaikų priežiūrą.',
  'Siūlau priežiūrą su Montessori elementais. Veiklos pagal vaiko amžių ir poreikius.',
  'Ilgametė patirtis darželyje, dabar dirbu kaip privati auklė. Puikus ryšys su vaikais.',
  'Kūrybiška ir energinga auklė. Organizuoju meninę ir fizinę veiklą vaikams.',
  'Patirtis su specialiųjų poreikių vaikais. Kantrumas ir individualus dėmesys garantuotas.',
  'Mokau vaikus per žaidimus – skaičiavimą, raides, spalvas. Paruošiu mokyklai.',
  'Turiu maisto ruošimo patirties – paruošiu sveiką ir skanų maistą vaikams.',
  'Dirbu lanksčiu grafiku, galiu prižiūrėti vaikus ir savaitgaliais.',
];

const AGE_RANGES_AUKLE = ['0-1 m.', '0-3 m.', '1-3 m.', '1-6 m.', '2-6 m.', '3-7 m.', '4-10 m.'];
const HOURLY_RATES = ['6€/val.', '7€/val.', '8€/val.', '9€/val.', '10€/val.', '12€/val.', '15€/val.', '8-12€/val.', '10-15€/val.'];
const LANGUAGES_AUKLE = ['Lietuvių', 'Lietuvių, anglų', 'Lietuvių, rusų', 'Lietuvių, anglų, rusų', 'Lietuvių, lenkų'];
const AVAILABILITY = ['Darbo dienomis', 'Darbo dienomis, šeštadieniais', 'Visą savaitę', 'Pagal susitarimą', 'Ryto metu (8-13)', 'Popietėmis (13-18)', 'Pilna diena'];

// ── Burelis data ──────────────────────────────────────────────────────────────

const BURELIS_CATEGORIES = ['Menai', 'Sportas', 'Muzika', 'Šokiai', 'Kalbos', 'IT', 'Gamta/Mokslas', 'Kita'];

interface BurelisTemplate {
  nameTemplate: string;
  category: string;
  subcategory: string;
  description: string;
}

const BURELIS_TEMPLATES: BurelisTemplate[] = [
  // Menai
  { nameTemplate: 'Dailės studija „Spalvų pasaulis"', category: 'Menai', subcategory: 'Dailė', description: 'Dailės užsiėmimai vaikams – piešimas, tapyba, grafika. Ugdome kūrybiškumą ir meninį skonį.' },
  { nameTemplate: 'Keramikos dirbtuvės „Molinis"', category: 'Menai', subcategory: 'Keramika', description: 'Keramikos užsiėmimai vaikams ir paaugliams. Lipdymas, žiedimas, dekoravimas.' },
  { nameTemplate: 'Piešimo studija „Linija"', category: 'Menai', subcategory: 'Piešimas', description: 'Individualūs ir grupiniai piešimo užsiėmimai. Akademinis piešimas, akvarelė, pastelė.' },
  { nameTemplate: 'Meno studija „Kūrybos namai"', category: 'Menai', subcategory: 'Mišri technika', description: 'Įvairios meninės technikos vaikams: dekupažas, mozaika, koliažas, tekstilė.' },
  { nameTemplate: 'Fotografijos būrelis „Kadras"', category: 'Menai', subcategory: 'Fotografija', description: 'Fotografijos pagrindai vaikams. Kompozicija, apšvietimas, skaitmeninė fotografija.' },
  { nameTemplate: 'Teatro studija „Uždanga"', category: 'Menai', subcategory: 'Teatras', description: 'Teatriniai užsiėmimai vaikams – vaidyba, improvizacija, spektaklių statymas.' },
  { nameTemplate: 'Rankdarbių būrelis „Siūlelis"', category: 'Menai', subcategory: 'Rankdarbiai', description: 'Rankdarbiai vaikams: mezgimas, siuvimas, nėrimas. Smulkiosios motorikos lavinimas.' },

  // Sportas
  { nameTemplate: 'Krepšinio būrelis', category: 'Sportas', subcategory: 'Krepšinis', description: 'Krepšinio treniruotės vaikams nuo 5 metų. Technika, taktika, komandinės varžybos.' },
  { nameTemplate: 'Futbolo akademija', category: 'Sportas', subcategory: 'Futbolas', description: 'Futbolo treniruotės vaikams. Profesionalūs treneriai, šiuolaikiška treniruočių bazė.' },
  { nameTemplate: 'Plaukimo mokykla „Banginis"', category: 'Sportas', subcategory: 'Plaukimas', description: 'Plaukimo pamokos vaikams nuo 3 metų. Individualios ir grupinės pamokos.' },
  { nameTemplate: 'Gimnastikos studija „Lankstumas"', category: 'Sportas', subcategory: 'Gimnastika', description: 'Meninė ir sportinė gimnastika. Lankstumas, jėga, koordinacija.' },
  { nameTemplate: 'Karatė klubas „Bushido"', category: 'Sportas', subcategory: 'Kovos menai', description: 'Karatė treniruotės vaikams ir paaugliams. Disciplina, savigyba, fizinis pasirengimas.' },
  { nameTemplate: 'Teniso akademija', category: 'Sportas', subcategory: 'Tenisas', description: 'Teniso pamokos vaikams. Individualios ir grupinės treniruotės su profesionaliais treneriais.' },
  { nameTemplate: 'Lengvosios atletikos klubas', category: 'Sportas', subcategory: 'Lengvoji atletika', description: 'Bėgimas, šuoliai, metimai – visapusiška sportinė veikla vaikams.' },
  { nameTemplate: 'Šachmatų klubas „Lygis"', category: 'Sportas', subcategory: 'Šachmatai', description: 'Šachmatų pamokos vaikams nuo 4 metų. Loginio mąstymo ir koncentracijos ugdymas.' },
  { nameTemplate: 'Jojimo klubas „Žirgynas"', category: 'Sportas', subcategory: 'Jojimas', description: 'Jojimo pamokos vaikams. Saugus bendravimas su žirgais, jojimo technika.' },

  // Muzika
  { nameTemplate: 'Muzikos studija „Nata"', category: 'Muzika', subcategory: 'Bendra muzika', description: 'Muzikos užsiėmimai vaikams: ritmas, dainavimas, instrumentų pažinimas.' },
  { nameTemplate: 'Fortepijono pamokos', category: 'Muzika', subcategory: 'Fortepijonas', description: 'Individualios fortepijono pamokos vaikams nuo 5 metų. Klasikinė ir populiarioji muzika.' },
  { nameTemplate: 'Gitaros studija „Styga"', category: 'Muzika', subcategory: 'Gitara', description: 'Gitaros pamokos pradedantiesiems ir pažengusiems. Akustinė ir elektrinė gitara.' },
  { nameTemplate: 'Smuiko pamokos', category: 'Muzika', subcategory: 'Smuikas', description: 'Smuiko pamokos vaikams. Klasikinė muzika, ansamblio grojimas.' },
  { nameTemplate: 'Būgnų mokykla „Ritmas"', category: 'Muzika', subcategory: 'Būgnai', description: 'Būgnų ir perkusijos pamokos vaikams nuo 6 metų. Ritmo pojūčio ugdymas.' },
  { nameTemplate: 'Choro studija „Balsas"', category: 'Muzika', subcategory: 'Dainavimas', description: 'Chorinės ir solinės dainavimo pamokos. Vokalo technika, sceninis pasirodymas.' },

  // Šokiai
  { nameTemplate: 'Šokių studija „Šokis"', category: 'Šokiai', subcategory: 'Šiuolaikinis šokis', description: 'Šiuolaikinio šokio pamokos vaikams. Choreografija, improvizacija, pasirodymai.' },
  { nameTemplate: 'Baleto studija „Gulbė"', category: 'Šokiai', subcategory: 'Baletas', description: 'Klasikinio baleto pamokos vaikams nuo 3 metų. Laikysena, plastiškumas, gracija.' },
  { nameTemplate: 'Hip-hop studija „Beat"', category: 'Šokiai', subcategory: 'Hip-hop', description: 'Hip-hop šokio pamokos vaikams ir paaugliams. Šiuolaikinė choreografija.' },
  { nameTemplate: 'Liaudies šokių kolektyvas „Ratelis"', category: 'Šokiai', subcategory: 'Liaudies šokiai', description: 'Lietuvių liaudies šokiai vaikams. Tautinės tradicijos, festivaliai, pasirodymai.' },
  { nameTemplate: 'Sportinių šokių klubas „Žingsnis"', category: 'Šokiai', subcategory: 'Sportiniai šokiai', description: 'Sportiniai šokiai vaikams – standartinė ir lotynų Amerikos programa.' },

  // Kalbos
  { nameTemplate: 'Anglų kalbos mokykla „English Kids"', category: 'Kalbos', subcategory: 'Anglų kalba', description: 'Anglų kalbos pamokos vaikams per žaidimus, dainas ir interaktyvias veiklas.' },
  { nameTemplate: 'Vokiečių kalbos būrelis „Deutsch"', category: 'Kalbos', subcategory: 'Vokiečių kalba', description: 'Vokiečių kalbos pamokos vaikams. Komunikacinis metodas, žaidimai.' },
  { nameTemplate: 'Prancūzų kalbos studija „Bonjour"', category: 'Kalbos', subcategory: 'Prancūzų kalba', description: 'Prancūzų kalbos pamokos vaikams nuo 5 metų. Kultūra ir kalba per žaidimus.' },
  { nameTemplate: 'Ispanų kalbos būrelis „Hola"', category: 'Kalbos', subcategory: 'Ispanų kalba', description: 'Ispanų kalbos pamokos vaikams. Interaktyvus mokymas, kalbiniai žaidimai.' },
  { nameTemplate: 'Kinų kalbos pamokos „Mandarinas"', category: 'Kalbos', subcategory: 'Kinų kalba', description: 'Kinų kalbos pradmenys vaikams. Hieroglifai, tarimas, kultūros pažinimas.' },

  // IT
  { nameTemplate: 'Robotikos akademija', category: 'IT', subcategory: 'Robotika', description: 'Robotikos užsiėmimai su LEGO ir Arduino. Programavimas, konstrujavimas, varžybos.' },
  { nameTemplate: 'Programavimo būrelis „Koduotojas"', category: 'IT', subcategory: 'Programavimas', description: 'Programavimo pamokos vaikams – Scratch, Python, web kūrimas. Nuo pradedančiųjų.' },
  { nameTemplate: 'IT akademija „Bitė"', category: 'IT', subcategory: 'Bendra IT', description: 'Kompiuterinio raštingumo ir programavimo pagrindai vaikams nuo 7 metų.' },
  { nameTemplate: '3D spausdinimo dirbtuvės', category: 'IT', subcategory: '3D modeliavimas', description: '3D modeliavimas ir spausdinimas vaikams. Kūrybiškumas ir technologijos.' },
  { nameTemplate: 'Žaidimų kūrimo studija „GameDev"', category: 'IT', subcategory: 'Žaidimų kūrimas', description: 'Kompiuterinių žaidimų kūrimo pagrindai vaikams. Unity, Roblox Studio.' },

  // Gamta/Mokslas
  { nameTemplate: 'Gamtos tyrinėtojų būrelis', category: 'Gamta/Mokslas', subcategory: 'Gamta', description: 'Gamtos pažinimas per eksperimentus ir lauko veiklas. Ekologija, biologija.' },
  { nameTemplate: 'Mokslo laboratorija „Eureka"', category: 'Gamta/Mokslas', subcategory: 'Mokslas', description: 'Moksliniai eksperimentai vaikams – chemija, fizika, biologija per praktiką.' },
  { nameTemplate: 'Astronomijos būrelis „Žvaigždė"', category: 'Gamta/Mokslas', subcategory: 'Astronomija', description: 'Astronomijos užsiėmimai vaikams. Žvaigždžių stebėjimas, planetariumo lankymas.' },
  { nameTemplate: 'Ekologijos klubas „Žalias"', category: 'Gamta/Mokslas', subcategory: 'Ekologija', description: 'Ekologinio sąmoningumo ugdymas. Atliekų rūšiavimas, sodininkyste, gamtos apsauga.' },

  // Kita
  { nameTemplate: 'Kulinarijos būrelis „Šefas"', category: 'Kita', subcategory: 'Kulinarija', description: 'Kulinarijos pamokos vaikams. Sveikos mitybos pagrindai, paprastų patiekalų gamyba.' },
  { nameTemplate: 'Logikos žaidimų klubas', category: 'Kita', subcategory: 'Logika', description: 'Loginio mąstymo lavinimas per stalo žaidimus, galvosūkius ir matematinius uždavinius.' },
  { nameTemplate: 'Jaunųjų žurnalistų būrelis', category: 'Kita', subcategory: 'Žurnalistika', description: 'Rašymo, interviu ir reportažų kūrimo pagrindai vaikams nuo 10 metų.' },
  { nameTemplate: 'Pirmosios pagalbos kursai vaikams', category: 'Kita', subcategory: 'Saugumas', description: 'Pirmosios pagalbos pagrindai vaikams. Kaip elgtis pavojingose situacijose.' },
];

const BURELIS_PRICES = [
  '30€/mėn.', '35€/mėn.', '40€/mėn.', '45€/mėn.', '50€/mėn.', '55€/mėn.',
  '60€/mėn.', '70€/mėn.', '80€/mėn.', '100€/mėn.', '25€/mėn.',
  '8€/užsiėmimas', '10€/užsiėmimas', '12€/užsiėmimas', '15€/užsiėmimas',
];

const BURELIS_SCHEDULES = [
  'Pirmadienis, trečiadienis 16:00-17:00',
  'Antradienis, ketvirtadienis 17:00-18:00',
  'Pirmadienis, trečiadienis, penktadienis 15:30-16:30',
  'Šeštadienis 10:00-12:00',
  'Antradienis 16:00-17:30',
  'Ketvirtadienis 15:00-16:00',
  'Pirmadienis-penktadienis 16:00-17:00',
  'Trečiadienis, penktadienis 17:30-18:30',
  'Šeštadienis 11:00-13:00',
  'Pirmadienis 16:30-18:00',
];

const BURELIS_AGE_RANGES = ['3-6 m.', '4-7 m.', '5-10 m.', '6-12 m.', '7-14 m.', '5-8 m.', '8-14 m.', '4-12 m.', '3-5 m.', '10-16 m.'];

// ── Specialist data ───────────────────────────────────────────────────────────

const SPECIALTIES = ['Logopedas', 'Psichologas', 'Pediatras', 'Ergoterapeutas', 'Kineziterapeutas', 'Ortodontas', 'Alergologas'];

const MALE_FIRST_NAMES = [
  'Jonas', 'Petras', 'Tomas', 'Mindaugas', 'Darius', 'Andrius', 'Marius',
  'Rokas', 'Aurimas', 'Giedrius', 'Vytautas', 'Donatas', 'Karolis', 'Lukas',
  'Mantas', 'Edgaras', 'Ignas', 'Paulius', 'Simonas', 'Dominykas',
];

const LAST_NAMES_MALE = [
  'Kazlauskas', 'Jankaitis', 'Petrauskas', 'Stankevičius', 'Vasiliauskas',
  'Žukauskas', 'Butkus', 'Paulauskas', 'Urbonas', 'Kavaliauskas',
  'Sakalauskas', 'Kučinskas', 'Balčiūnas', 'Gudaitis', 'Ramanauskas',
  'Mačiulis', 'Čeponis', 'Bagdonas', 'Grigas', 'Navickas',
];

const LAST_NAMES_FEMALE = [
  'Kazlauskienė', 'Jankaitienė', 'Petrauskienė', 'Stankevičienė', 'Vasiliauskienė',
  'Žukauskienė', 'Butkienė', 'Paulauskienė', 'Urbonienė', 'Kavaliauskienė',
  'Sakalauskienė', 'Kučinskienė', 'Balčiūnienė', 'Gudaitienė', 'Ramanauskienė',
  'Mačiulienė', 'Čeponienė', 'Bagdonienė', 'Grigienė', 'Navickienė',
];

const CLINICS: Record<string, string[]> = {
  'Logopedas': ['Kalbos centras', 'Logopedijos kabinetas', 'Kalbos terapijos centras', 'Vaikų kalbos klinika'],
  'Psichologas': ['Psichologijos centras', 'Vaikų psichologijos kabinetas', 'Šeimos konsultacijų centras', 'Emocijų centras'],
  'Pediatras': ['Vaikų klinika', 'Šeimos gydytojo kabinetas', 'Medicinos centras', 'Vaikų sveikatos centras'],
  'Ergoterapeutas': ['Reabilitacijos centras', 'Ergoterapijos kabinetas', 'Vaiko raidos centras', 'Sensorinės integracijos centras'],
  'Kineziterapeutas': ['Reabilitacijos centras', 'Kineziterapijos kabinetas', 'Judėjimo klinika', 'Sporto medicinos centras'],
  'Ortodontas': ['Ortodontijos klinika', 'Dantų klinika', 'Šypsenos studija', 'Ortodontijos kabinetas'],
  'Alergologas': ['Alergologijos centras', 'Vaikų alergologijos kabinetas', 'Medicinos centras', 'Imunologijos klinika'],
};

const SPECIALIST_DESCRIPTIONS: Record<string, string[]> = {
  'Logopedas': [
    'Vaikų kalbos ir kalbėjimo sutrikimų diagnostika ir korekcija. Individualios pamokos.',
    'Logopedinis vertinimas ir terapija vaikams nuo 2 metų. Kalbos vėlavimas, garsyno korekcija.',
    'Dirbu su vaikais, turinčiais kalbos, kalbėjimo ir komunikacijos sutrikimų. 10+ metų patirtis.',
    'Specializuojuosi kalbos sutrikimų korekcijoje. Mikčiojimas, disleksija, fonologiniai sutrikimai.',
  ],
  'Psichologas': [
    'Vaikų ir paauglių psichologinis konsultavimas. Elgesio sunkumai, nerimas, adaptacija.',
    'Psichologinės konsultacijos šeimoms ir vaikams. Žaidimų terapija, kognityvinė terapija.',
    'Specializuojuosi vaikų emociniuose ir elgesio sunkumuose. Diagnostika ir terapija.',
    'Vaiko raidos vertinimas, psichologinis konsultavimas. Mokymosi sunkumai, ADHD.',
  ],
  'Pediatras': [
    'Vaikų sveikatos priežiūra nuo gimimo iki 18 metų. Profilaktiniai patikrinimai, vakcinacija.',
    'Šeimos pediatras su ilgamete patirtimi. Ligų diagnostika ir gydymas, konsultacijos.',
    'Individualus požiūris į kiekvieną mažą pacientą. Profilaktika, diagnostika, gydymas.',
    'Vaikų infekcinės ligos, alergijos, dermatologinės problemos. Konsultacijos ir gydymas.',
  ],
  'Ergoterapeutas': [
    'Ergoterapija vaikams su raidos sutrikimais. Sensorinė integracija, smulkioji motorika.',
    'Padedame vaikams įgyti kasdienio gyvenimo įgūdžius. Individualios terapijos programos.',
    'Specializuojuosi sensorinės integracijos terapijoje vaikams nuo 1 metų.',
    'Ergoterapija autizmo spektro, cerebrinės paralyžiaus, raidos vėlavimo atvejais.',
  ],
  'Kineziterapeutas': [
    'Vaikų kineziterapija – laikysenos korekcija, motorinės raidos skatinimas.',
    'Gydomoji mankšta vaikams po traumų ir su raidos sutrikimais. Individualios programos.',
    'Specializuojuosi vaikų ortopediniuose sutrikmuose ir reabilitacijoje.',
    'Kineziterapija kūdikiams ir vaikams. Plokščiapėdystė, skoliozė, hipotonija.',
  ],
  'Ortodontas': [
    'Vaikų ortodontinis gydymas – breketai, kapai, funkciniai aparatai.',
    'Specializuojuosi ankstyvajame ortodontiniame gydyme vaikams nuo 6 metų.',
    'Sąkandžio anomalijų diagnostika ir gydymas. Šiuolaikiniai gydymo metodai.',
    'Ortodontinis vaikų gydymas. Individualus gydymo planas kiekvienam pacientui.',
  ],
  'Alergologas': [
    'Vaikų alergijų diagnostika ir gydymas. Maisto alergijos, astma, atopinis dermatitas.',
    'Alergologinis ištyrimas ir gydymas vaikams. Alergenų testai, imunoterapija.',
    'Specializuojuosi vaikų alerginėse ligose ir astmoje. Šiuolaikiniai gydymo metodai.',
    'Vaikų alergijų prevencija ir gydymas. Individualios gydymo programos.',
  ],
};

const SPECIALIST_PRICES: Record<string, string[]> = {
  'Logopedas': ['25€/užsiėmimas', '30€/užsiėmimas', '35€/užsiėmimas', '20€/užsiėmimas'],
  'Psichologas': ['40€/konsultacija', '50€/konsultacija', '45€/konsultacija', '60€/konsultacija'],
  'Pediatras': ['30€/vizitas', '35€/vizitas', '40€/vizitas', '25€/vizitas'],
  'Ergoterapeutas': ['30€/užsiėmimas', '35€/užsiėmimas', '40€/užsiėmimas', '25€/užsiėmimas'],
  'Kineziterapeutas': ['25€/užsiėmimas', '30€/užsiėmimas', '35€/užsiėmimas', '20€/užsiėmimas'],
  'Ortodontas': ['40€/konsultacija', '50€/konsultacija', '60€/konsultacija', '45€/konsultacija'],
  'Alergologas': ['35€/vizitas', '40€/vizitas', '45€/vizitas', '50€/vizitas'],
};

const SPECIALIST_LANGUAGES = [
  'Lietuvių', 'Lietuvių, anglų', 'Lietuvių, rusų', 'Lietuvių, anglų, rusų',
];

// ── Review data ───────────────────────────────────────────────────────────────

const REVIEW_TEXTS_KINDERGARTEN = [
  'Labai geras darželis! Vaikas eina su džiaugsmu kiekvieną rytą.',
  'Puikūs auklėtojai, šilta atmosfera. Rekomenduojame!',
  'Vaikai maitinami sveikai, daug laiko praleidžia lauke. Patenkinti.',
  'Darželis šaunus, bet grupės galėtų būti mažesnės.',
  'Mūsų vaikas čia lanko jau antrus metus – labai patenkinti.',
  'Nuostabi vieta vaikams! Kūrybiškos veiklos, rūpestingi darbuotojai.',
  'Geras darželis, tik kartais trūksta informacijos tėvams.',
  'Patinka, kad daug dėmesio skiriama gamtai ir lauko veikloms.',
  'Rekomenduoju šį darželį – profesionalus personalas ir gera programa.',
  'Vaikas labai greitai adaptavosi, auklėtojos labai padėjo.',
  'Maistas skanus ir sveikas, vaikas visada sočiai pavalgęs grįžta.',
  'Gera ugdymo programa, vaikas daug išmoksta. Puikus darželis!',
  'Darželis švarus, tvarkingos patalpos, gera vieta vaikams augti.',
  'Labai dėkojame auklėtojoms už kantrybę ir meilę mūsų vaikams.',
  'Patenkinti pasirinkimu. Vaikas čia jaučiasi kaip namuose.',
  'Geros sąlygos, draugiškas kolektyvas, vaikai laimingi.',
  'Šis darželis – geriausias mūsų mieste! Puiki programa ir maitinimas.',
  'Truputį brangokas, bet kokybė atitinka kainą.',
  'Auklėtojos labai rūpestingos ir profesionalios.',
  'Vaikas išmoko daug naujų dalykų – skaičiuoti, piešti, dainuoti.',
];

const REVIEW_TEXTS_AUKLE = [
  'Puiki auklė, rekomenduoju! Vaikai ją labai myli.',
  'Labai atsakinga ir patikima. Vaikas visada laimingas po priežiūros.',
  'Profesionali, kantri, myli vaikus. Geresnės auklės negalėjome rasti.',
  'Auklė turi puikų ryšį su mūsų vaiku. Labai dėkojame!',
  'Patikima ir kūrybiška auklė. Organizuoja įdomias veiklas.',
  'Nuostabi patirtis! Auklė tapo mūsų šeimos dalimi.',
  'Labai rekomenduoju – punktuali, atsakinga, myli vaikus.',
  'Mūsų vaikas laukia auklės atėjimo su nekantrumu!',
  'Gera auklė, bet kartais sunku suderinti grafikus.',
  'Ačiū už nuostabią priežiūrą! Vaikas labai patenkintas.',
];

const REVIEW_TEXTS_BURELIS = [
  'Vaikui labai patinka užsiėmimai! Puikūs mokytojai.',
  'Geras būrelis, vaikas daug išmoksta ir smagiai leidžia laiką.',
  'Profesionalūs vadovai, įdomi programa. Rekomenduojame.',
  'Mūsų vaikas lanko jau metus – matome didelę pažangą.',
  'Puikus būrelis! Vaikai grįžta laimingi ir kupini įspūdžių.',
  'Geras kainos ir kokybės santykis. Patenkinti.',
  'Labai geros sąlygos, šiuolaikiška įranga.',
  'Vaikui patinka, tik norėtųsi daugiau laiko užsiėmimams.',
  'Rekomenduoju šį būrelį visiems tėvams!',
  'Puiki vieta vaikų talentams atskleisti.',
];

const REVIEW_TEXTS_SPECIALIST = [
  'Puikus specialistas! Matome didelę pažangą.',
  'Labai profesionalus, vaikas jaučiasi komfortabiliai.',
  'Rekomenduoju – kantrus, malonus, profesionalus.',
  'Po kelių užsiėmimų jau matome teigiamų pokyčių.',
  'Geriausias specialistas mieste! Dėkojame už pagalbą.',
  'Labai patenkinti rezultatais. Profesionalus požiūris.',
  'Vaikas su malonumu eina į užsiėmimus. Puiku!',
  'Ačiū už kantrybę ir profesionalumą!',
  'Rezultatai pranoko lūkesčius. Labai rekomenduoju.',
  'Šiltas požiūris į vaikus, aukšta kvalifikacija.',
];

const REVIEWER_NAMES = [
  'Ona M.', 'Jonas K.', 'Rasa P.', 'Tomas V.', 'Dalia S.', 'Petras J.',
  'Jurgita L.', 'Andrius B.', 'Lina G.', 'Marius R.', 'Giedrė N.',
  'Donatas Š.', 'Sigita A.', 'Mantas D.', 'Edita Z.', 'Lukas T.',
  'Neringa V.', 'Karolis M.', 'Vaida K.', 'Rokas P.', 'Inga S.',
  'Paulius L.', 'Renata B.', 'Mindaugas J.', 'Eglė R.',
];

// ── Slug deduplication ────────────────────────────────────────────────────────

const usedSlugs = new Set<string>();

function uniqueSlug(name: string): string {
  let slug = toSlug(name);
  if (usedSlugs.has(slug)) {
    let counter = 2;
    while (usedSlugs.has(`${slug}-${counter}`)) counter++;
    slug = `${slug}-${counter}`;
  }
  usedSlugs.add(slug);
  return slug;
}

// ── Generators ────────────────────────────────────────────────────────────────

function generateAukles(count: number) {
  const aukles = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      const first = pick(FEMALE_FIRST_NAMES);
      const lastInit = pick(LAST_INITIALS);
      name = `Auklė ${first} ${lastInit}.`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const city = pick(CITIES);
    const area = pick(CITY_AREAS[city]);
    const rating = randFloat(3.0, 5.0);
    const reviewCount = randBetween(0, 25);

    aukles.push({
      slug: uniqueSlug(name),
      name,
      city,
      region: CITY_REGIONS[city],
      area,
      phone: phoneNumber(),
      email: `${name.split(' ')[1].toLowerCase()}.${name.split(' ')[2].replace('.', '').toLowerCase()}@gmail.com`,
      experience: `${randBetween(1, 20)} m.`,
      ageRange: pick(AGE_RANGES_AUKLE),
      hourlyRate: pick(HOURLY_RATES),
      languages: pick(LANGUAGES_AUKLE),
      description: pick(AUKLE_DESCRIPTIONS),
      availability: pick(AVAILABILITY),
      baseRating: rating,
      baseReviewCount: reviewCount,
    });
  }
  return aukles;
}

function generateBureliai(count: number) {
  const bureliai = [];

  for (let i = 0; i < count; i++) {
    const template = BURELIS_TEMPLATES[i % BURELIS_TEMPLATES.length];
    const city = pick(CITIES);
    const area = pick(CITY_AREAS[city]);
    const rating = randFloat(3.0, 5.0);
    const reviewCount = randBetween(0, 25);

    // Create unique name by adding city or variation
    let name = template.nameTemplate;
    if (i >= BURELIS_TEMPLATES.length) {
      // For duplicates, make name unique by adding city
      name = `${template.nameTemplate} (${city})`;
    }

    bureliai.push({
      slug: uniqueSlug(name),
      name,
      city,
      region: CITY_REGIONS[city],
      area,
      category: template.category,
      subcategory: template.subcategory,
      ageRange: pick(BURELIS_AGE_RANGES),
      price: pick(BURELIS_PRICES),
      schedule: pick(BURELIS_SCHEDULES),
      phone: phoneNumber(),
      website: null as string | null,
      description: template.description,
      baseRating: rating,
      baseReviewCount: reviewCount,
    });
  }
  return bureliai;
}

function generateSpecialists(count: number) {
  const specialists = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const specialty = SPECIALTIES[i % SPECIALTIES.length];
    const isFemale = Math.random() > 0.4; // More female specialists in child care
    const city = pick(CITIES);
    const area = pick(CITY_AREAS[city]);
    const rating = randFloat(3.0, 5.0);
    const reviewCount = randBetween(0, 25);

    let name: string;
    do {
      if (isFemale) {
        name = `Dr. ${pick(FEMALE_FIRST_NAMES)} ${pick(LAST_NAMES_FEMALE)}`;
      } else {
        name = `Dr. ${pick(MALE_FIRST_NAMES)} ${pick(LAST_NAMES_MALE)}`;
      }
    } while (usedNames.has(name));
    usedNames.add(name);

    const clinicName = `${pick(CLINICS[specialty])} „${city}"`;
    const descriptions = SPECIALIST_DESCRIPTIONS[specialty];
    const prices = SPECIALIST_PRICES[specialty];

    specialists.push({
      slug: uniqueSlug(name),
      name,
      city,
      region: CITY_REGIONS[city],
      area,
      specialty,
      clinic: clinicName,
      price: pick(prices),
      phone: phoneNumber(),
      website: null as string | null,
      languages: pick(SPECIALIST_LANGUAGES),
      description: pick(descriptions),
      baseRating: rating,
      baseReviewCount: reviewCount,
    });
  }
  return specialists;
}

function generateReviews(
  kindergartenIds: string[],
  aukleIds: string[],
  burelisIds: string[],
  specialistIds: string[],
  totalCount: number,
) {
  const reviews = [];

  // Distribute reviews: ~40% kindergartens, ~20% aukles, ~20% bureliai, ~20% specialists
  const kCount = Math.round(totalCount * 0.4);
  const aCount = Math.round(totalCount * 0.2);
  const bCount = Math.round(totalCount * 0.2);
  const sCount = totalCount - kCount - aCount - bCount;

  for (let i = 0; i < kCount; i++) {
    reviews.push({
      itemId: pick(kindergartenIds),
      itemType: 'kindergarten',
      authorName: pick(REVIEWER_NAMES),
      rating: randBetween(3, 5),
      text: pick(REVIEW_TEXTS_KINDERGARTEN),
      isApproved: true,
    });
  }

  for (let i = 0; i < aCount; i++) {
    reviews.push({
      itemId: pick(aukleIds),
      itemType: 'aukle',
      authorName: pick(REVIEWER_NAMES),
      rating: randBetween(3, 5),
      text: pick(REVIEW_TEXTS_AUKLE),
      isApproved: true,
    });
  }

  for (let i = 0; i < bCount; i++) {
    reviews.push({
      itemId: pick(burelisIds),
      itemType: 'burelis',
      authorName: pick(REVIEWER_NAMES),
      rating: randBetween(3, 5),
      text: pick(REVIEW_TEXTS_BURELIS),
      isApproved: true,
    });
  }

  for (let i = 0; i < sCount; i++) {
    reviews.push({
      itemId: pick(specialistIds),
      itemType: 'specialist',
      authorName: pick(REVIEWER_NAMES),
      rating: randBetween(3, 5),
      text: pick(REVIEW_TEXTS_SPECIALIST),
      isApproved: true,
    });
  }

  return reviews;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Seed More Data ===');
  console.log('');

  // Load existing slugs from DB to avoid collisions
  const existingAukles = await prisma.aukle.findMany({ select: { slug: true } });
  const existingBureliai = await prisma.burelis.findMany({ select: { slug: true } });
  const existingSpecialists = await prisma.specialist.findMany({ select: { slug: true } });
  existingAukles.forEach(a => usedSlugs.add(a.slug));
  existingBureliai.forEach(b => usedSlugs.add(b.slug));
  existingSpecialists.forEach(s => usedSlugs.add(s.slug));

  // Count existing data
  const countBefore = {
    kindergartens: await prisma.kindergarten.count(),
    aukles: await prisma.aukle.count(),
    bureliai: await prisma.burelis.count(),
    specialists: await prisma.specialist.count(),
    reviews: await prisma.review.count(),
  };
  console.log('Before:');
  console.log(`  Kindergartens: ${countBefore.kindergartens}`);
  console.log(`  Aukles:        ${countBefore.aukles}`);
  console.log(`  Bureliai:      ${countBefore.bureliai}`);
  console.log(`  Specialists:   ${countBefore.specialists}`);
  console.log(`  Reviews:       ${countBefore.reviews}`);
  console.log('');

  // Generate data
  const newAukles = generateAukles(100);
  const newBureliai = generateBureliai(100);
  const newSpecialists = generateSpecialists(80);

  // Insert aukles
  console.log(`Inserting ${newAukles.length} aukles...`);
  await prisma.aukle.createMany({ data: newAukles });

  // Insert bureliai
  console.log(`Inserting ${newBureliai.length} bureliai...`);
  await prisma.burelis.createMany({ data: newBureliai });

  // Insert specialists
  console.log(`Inserting ${newSpecialists.length} specialists...`);
  await prisma.specialist.createMany({ data: newSpecialists });

  // Gather IDs for reviews
  const allKindergartens = await prisma.kindergarten.findMany({ select: { id: true } });
  const allAukles = await prisma.aukle.findMany({ select: { id: true } });
  const allBureliai = await prisma.burelis.findMany({ select: { id: true } });
  const allSpecialists = await prisma.specialist.findMany({ select: { id: true } });

  const kindergartenIds = allKindergartens.map(k => k.id);
  const aukleIds = allAukles.map(a => a.id);
  const burelisIds = allBureliai.map(b => b.id);
  const specialistIds = allSpecialists.map(s => s.id);

  // Generate and insert reviews
  const newReviews = generateReviews(kindergartenIds, aukleIds, burelisIds, specialistIds, 50);
  console.log(`Inserting ${newReviews.length} reviews...`);
  await prisma.review.createMany({ data: newReviews });

  // Count after
  const countAfter = {
    kindergartens: await prisma.kindergarten.count(),
    aukles: await prisma.aukle.count(),
    bureliai: await prisma.burelis.count(),
    specialists: await prisma.specialist.count(),
    reviews: await prisma.review.count(),
  };

  console.log('');
  console.log('After:');
  console.log(`  Kindergartens: ${countAfter.kindergartens} (+${countAfter.kindergartens - countBefore.kindergartens})`);
  console.log(`  Aukles:        ${countAfter.aukles} (+${countAfter.aukles - countBefore.aukles})`);
  console.log(`  Bureliai:      ${countAfter.bureliai} (+${countAfter.bureliai - countBefore.bureliai})`);
  console.log(`  Specialists:   ${countAfter.specialists} (+${countAfter.specialists - countBefore.specialists})`);
  console.log(`  Reviews:       ${countAfter.reviews} (+${countAfter.reviews - countBefore.reviews})`);
  console.log('');
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
