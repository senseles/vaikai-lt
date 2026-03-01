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

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedRating(): number {
  // Weighted toward 4.0-4.5
  const r = Math.random();
  let rating: number;
  if (r < 0.05) rating = 3.0 + Math.random() * 0.5;       // 5% get 3.0-3.5
  else if (r < 0.15) rating = 3.5 + Math.random() * 0.5;   // 10% get 3.5-4.0
  else if (r < 0.55) rating = 4.0 + Math.random() * 0.3;   // 40% get 4.0-4.3
  else if (r < 0.85) rating = 4.3 + Math.random() * 0.4;   // 30% get 4.3-4.7
  else rating = 4.7 + Math.random() * 0.3;                  // 15% get 4.7-5.0
  return parseFloat(Math.min(rating, 5.0).toFixed(1));
}

function phoneNumber(): string {
  const prefix = pick([600, 610, 612, 614, 615, 616, 618, 620, 622, 625, 628, 630, 640, 645, 650, 655, 660, 665, 670, 675, 680, 685, 690, 695, 698, 699] as const);
  return `+370 ${prefix} ${String(randBetween(10000, 99999))}`;
}

// ── Kindergarten name components ──────────────────────────────────────────────

const KINDERGARTEN_NAMES = [
  'Saulutė', 'Gandriukas', 'Bitutė', 'Žiogelis', 'Vyturėlis',
  'Pelėda', 'Berželis', 'Ąžuoliukas', 'Linelis', 'Drugelis',
  'Smilga', 'Putinas', 'Dobiliukas', 'Žilvitis', 'Eglutė',
  'Šermukšnėlis', 'Obelėlė', 'Kaštoniukas', 'Žvaigždutė', 'Nykštukas',
  'Boružėlė', 'Zuikutis', 'Voveraitė', 'Ežiukas', 'Meškiukas',
  'Varliukė', 'Geniukas', 'Paukštelis', 'Lakštingala', 'Šarkelė',
  'Volungėlė', 'Sraigė', 'Kregždutė', 'Vieversėlis', 'Pelėdžiukas',
  'Žibutė', 'Ramunėlė', 'Rugiagėlė', 'Saulažolė', 'Žiedelis',
  'Žalčiukas', 'Stirniukas', 'Kurmis', 'Kiškutis', 'Gervė',
  'Pempė', 'Zylutė', 'Karvelis', 'Genys', 'Gandras',
  'Varnėnas', 'Kranklys', 'Pelikanėlis', 'Gulbė', 'Balandėlis',
  'Strazdas', 'Sniegena', 'Vijūnėlis', 'Gegutė', 'Peliukas',
  'Skruzdėlytė', 'Drugelytė', 'Laumžirgis', 'Bitinas', 'Kamanė',
  'Vabalėlis', 'Boružė', 'Švitrigaila', 'Rūtelė', 'Bijūnėlis',
  'Aguonėlė', 'Tulpė', 'Narcizas', 'Gėlelė', 'Sniegenėlė',
  'Putpelė', 'Vanagas', 'Sakalėlis', 'Erelėlis', 'Pelėdikė',
  'Katinėlis', 'Šuniukas', 'Avinėlis', 'Ėriukas', 'Žirgiukas',
  'Kumeliukas', 'Vilniukas', 'Tigriukas', 'Liūtukas', 'Dramblėlis',
  'Beždžionėlė', 'Delfiniukas', 'Banginėlis', 'Ruoniukas', 'Pingviniukas',
  'Ūsiukas', 'Lapinas', 'Barsukas', 'Ūdriukas', 'Bebriukas',
];

const KINDERGARTEN_PREFIXES = [
  'Lopšelis-darželis',
  'Darželis',
  'Vaikų darželis',
  'Ikimokyklinė įstaiga',
];

const PRIVATE_PREFIXES = [
  'Privatus darželis',
  'Privatus lopšelis-darželis',
  'Montessori darželis',
  'Waldorf darželis',
];

// ── Street names ──────────────────────────────────────────────────────────────

const STREET_NAMES = [
  'Ąžuolų g.', 'Beržų g.', 'Liepų g.', 'Klevų g.', 'Pušų al.',
  'Vytauto pr.', 'Laisvės al.', 'Savanorių pr.', 'Vilniaus g.', 'Gedimino pr.',
  'Kęstučio g.', 'Dariaus ir Girėno g.', 'Žalgirio g.', 'Ukmergės g.',
  'Konstitucijos pr.', 'Saulės g.', 'Parko g.', 'Mokyklos g.', 'Sodų g.',
  'Žemaitės g.', 'Maironio g.', 'Basanavičiaus g.', 'Kudirkos g.',
  'Sporto g.', 'Geležinkelio g.', 'Pramonės g.', 'Tilto g.', 'Pilies g.',
  'Kalvarijų g.', 'Šilo g.', 'Nemenčinės g.', 'Gabijos g.', 'Didžioji g.',
  'Pylimo g.', 'Kauno g.', 'Stoties g.', 'Taikos pr.', 'Statybininkų g.',
  'Baltų pr.', 'Žirmūnų g.', 'Antakalnio g.', 'Rinktinės g.',
  'Ozo g.', 'Viršuliškių g.', 'Justiniškių g.', 'Erfurto g.',
  'Architektų g.', 'S. Nėries g.', 'Birutės g.', 'Kranto g.',
  'Minijos g.', 'Bangų g.', 'Jūros g.', 'Smiltynės g.',
  'Aušros g.', 'Donelaičio g.', 'Respublikos g.', 'Smėlynės g.',
  'Tulpių g.', 'Pavasario g.', 'Vasaros g.', 'Rudens g.',
  'Žiemos g.', 'Sodo g.', 'Miško g.', 'Lauko g.',
  'Ežero g.', 'Upės g.', 'Pievų g.', 'Gėlių g.',
];

// ── City data with regions, areas, and target counts ──────────────────────────

interface CityConfig {
  city: string;
  region: string;
  areas: string[];
  target: number;
}

const CITY_CONFIGS: CityConfig[] = [
  // Vilniaus apskritis
  {
    city: 'Vilnius', region: 'Vilniaus',
    areas: ['Žirmūnai', 'Antakalnis', 'Šeškinė', 'Fabijoniškės', 'Pašilaičiai', 'Pilaitė', 'Baltupiai', 'Žvėrynas', 'Naujamiestis', 'Senamiestis', 'Lazdynai', 'Karoliniškės', 'Viršuliškės', 'Justiniškės', 'Grigiškės', 'Verkiai', 'Naujininkai', 'Rasos', 'Šnipiškės'],
    target: 200,
  },
  {
    city: 'Kaunas', region: 'Kauno',
    areas: ['Centras', 'Žaliakalnis', 'Šilainiai', 'Eiguliai', 'Dainava', 'Kalniečiai', 'Aleksotas', 'Šančiai', 'Petrašiūnai', 'Vilijampolė', 'Gričiupis'],
    target: 120,
  },
  {
    city: 'Klaipėda', region: 'Klaipėdos',
    areas: ['Centras', 'Mažasis kaimelis', 'Debrecenas', 'Bandužiai', 'Tauralaukis', 'Giruliai', 'Rumpiškės', 'Melnragė'],
    target: 80,
  },
  {
    city: 'Šiauliai', region: 'Šiaulių',
    areas: ['Centras', 'Lieporiai', 'Dainai', 'Gubernija', 'Zokniai', 'Ginkūnai', 'Medelynas', 'Rėkyva'],
    target: 50,
  },
  {
    city: 'Panevėžys', region: 'Panevėžio',
    areas: ['Centras', 'Kniaudiškiai', 'Tulpių', 'Senvagė', 'Rožynas', 'Molainiai', 'Pilėnai'],
    target: 40,
  },
  // Vilniaus apskr. smaller cities
  {
    city: 'Ukmergė', region: 'Vilniaus',
    areas: ['Centras', 'Pašilė', 'Pivonija'],
    target: 15,
  },
  {
    city: 'Elektrėnai', region: 'Vilniaus',
    areas: ['Centras', 'Kietaviškės'],
    target: 12,
  },
  {
    city: 'Šalčininkai', region: 'Vilniaus',
    areas: ['Centras', 'Eišiškės'],
    target: 10,
  },
  {
    city: 'Širvintos', region: 'Vilniaus',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Švenčionys', region: 'Vilniaus',
    areas: ['Centras', 'Pabradė'],
    target: 10,
  },
  {
    city: 'Trakai', region: 'Vilniaus',
    areas: ['Centras', 'Lentvaris'],
    target: 12,
  },
  {
    city: 'Vilniaus r.', region: 'Vilniaus',
    areas: ['Avižieniai', 'Pagiriai', 'Nemėžis', 'Bezdonys'],
    target: 15,
  },
  // Kauno apskr. smaller cities
  {
    city: 'Jonava', region: 'Kauno',
    areas: ['Centras', 'Žeimiai', 'Chemikų'],
    target: 18,
  },
  {
    city: 'Kėdainiai', region: 'Kauno',
    areas: ['Centras', 'Pramonės rajonas', 'Josvainiškiai'],
    target: 15,
  },
  {
    city: 'Prienai', region: 'Kauno',
    areas: ['Centras', 'Naujoji dalis'],
    target: 10,
  },
  {
    city: 'Raseiniai', region: 'Kauno',
    areas: ['Centras', 'Karalienė'],
    target: 10,
  },
  {
    city: 'Kaišiadorys', region: 'Kauno',
    areas: ['Centras', 'Girelė'],
    target: 10,
  },
  {
    city: 'Birštonas', region: 'Kauno',
    areas: ['Centras', 'Kurorto zona'],
    target: 10,
  },
  // Klaipėdos apskr. smaller cities
  {
    city: 'Palanga', region: 'Klaipėdos',
    areas: ['Centras', 'Šventoji', 'Kurorto zona'],
    target: 15,
  },
  {
    city: 'Šilutė', region: 'Klaipėdos',
    areas: ['Centras', 'Žibų rajonas'],
    target: 12,
  },
  {
    city: 'Kretinga', region: 'Klaipėdos',
    areas: ['Centras', 'Padvariai'],
    target: 12,
  },
  {
    city: 'Skuodas', region: 'Klaipėdos',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Neringa', region: 'Klaipėdos',
    areas: ['Nida', 'Juodkrantė', 'Preila'],
    target: 10,
  },
  // Šiaulių apskr. smaller cities
  {
    city: 'Joniškis', region: 'Šiaulių',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Pakruojis', region: 'Šiaulių',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Radviliškis', region: 'Šiaulių',
    areas: ['Centras', 'Geležinkelio rajonas'],
    target: 12,
  },
  {
    city: 'Kelmė', region: 'Šiaulių',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Akmenė', region: 'Šiaulių',
    areas: ['Centras', 'Naujoji Akmenė'],
    target: 10,
  },
  // Panevėžio apskr. smaller cities
  {
    city: 'Rokiškis', region: 'Panevėžio',
    areas: ['Centras', 'Aukštaičių'],
    target: 12,
  },
  {
    city: 'Biržai', region: 'Panevėžio',
    areas: ['Centras', 'Astravo'],
    target: 12,
  },
  {
    city: 'Pasvalys', region: 'Panevėžio',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Kupiškis', region: 'Panevėžio',
    areas: ['Centras'],
    target: 10,
  },
  // Alytaus apskr.
  {
    city: 'Alytus', region: 'Alytaus',
    areas: ['Centras', 'Putinai', 'Vidzgiris', 'Dainava', 'Likiškiai'],
    target: 25,
  },
  {
    city: 'Druskininkai', region: 'Alytaus',
    areas: ['Centras', 'Viečiūnai', 'Kurorto zona'],
    target: 15,
  },
  {
    city: 'Lazdijai', region: 'Alytaus',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Varėna', region: 'Alytaus',
    areas: ['Centras', 'Naujoji Varėna'],
    target: 10,
  },
  // Marijampolės apskr.
  {
    city: 'Marijampolė', region: 'Marijampolės',
    areas: ['Centras', 'Mokolai', 'Sasnavos', 'Degučiai'],
    target: 20,
  },
  {
    city: 'Vilkaviškis', region: 'Marijampolės',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Šakiai', region: 'Marijampolės',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Kazlų Rūda', region: 'Marijampolės',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Kalvarija', region: 'Marijampolės',
    areas: ['Centras'],
    target: 10,
  },
  // Utenos apskr.
  {
    city: 'Utena', region: 'Utenos',
    areas: ['Centras', 'Vyturiai', 'Aukštakalnis', 'Dauniškis'],
    target: 18,
  },
  {
    city: 'Visaginas', region: 'Utenos',
    areas: ['Centras', '1-asis mikrorajonas', '2-asis mikrorajonas', '3-iasis mikrorajonas'],
    target: 15,
  },
  {
    city: 'Molėtai', region: 'Utenos',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Anykščiai', region: 'Utenos',
    areas: ['Centras', 'Kurklių'],
    target: 12,
  },
  {
    city: 'Zarasai', region: 'Utenos',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Ignalina', region: 'Utenos',
    areas: ['Centras'],
    target: 10,
  },
  // Telšių apskr.
  {
    city: 'Telšiai', region: 'Telšių',
    areas: ['Centras', 'Degaičiai', 'Mastis'],
    target: 15,
  },
  {
    city: 'Mažeikiai', region: 'Telšių',
    areas: ['Centras', 'Reivyčiai', 'Ventos'],
    target: 15,
  },
  {
    city: 'Plungė', region: 'Telšių',
    areas: ['Centras', 'Milašaičiai'],
    target: 12,
  },
  {
    city: 'Rietavas', region: 'Telšių',
    areas: ['Centras'],
    target: 10,
  },
  // Tauragės apskr.
  {
    city: 'Tauragė', region: 'Tauragės',
    areas: ['Centras', 'Jovarų', 'Martynaičiai'],
    target: 15,
  },
  {
    city: 'Jurbarkas', region: 'Tauragės',
    areas: ['Centras', 'Dainiai'],
    target: 10,
  },
  {
    city: 'Šilalė', region: 'Tauragės',
    areas: ['Centras'],
    target: 10,
  },
  {
    city: 'Pagėgiai', region: 'Tauragės',
    areas: ['Centras'],
    target: 10,
  },
];

// ── Descriptions ──────────────────────────────────────────────────────────────

const DESCRIPTIONS_PUBLIC = [
  'Valstybinis lopšelis-darželis, teikiantis kokybišką ikimokyklinį ir priešmokyklinį ugdymą. Kvalifikuoti pedagogai, erdvios patalpos.',
  'Darželis siūlo šiuolaikišką ugdymo programą su dėmesiu kūrybiškumui ir socialiniams įgūdžiams.',
  'Ikimokyklinė ugdymo įstaiga su ilgamete patirtimi. Ugdome vaikus pagal valstybinę ugdymo programą.',
  'Šiuolaikiškas darželis su renovuotomis patalpomis. Sveikas maitinimas, lauko aikštelė, baseinas.',
  'Darželis veikia nuo 1975 m. Patyrę pedagogai, draugiška aplinka, individuali ugdymo programa.',
  'Modernizuotas darželis su naujomis lauko žaidimų aikštelėmis. Teikiamos logopedinės paslaugos.',
  'Darželis orientuotas į gamtinį ugdymą – daug lauko veiklų, gamtos pažinimo projektai.',
  'Ugdymo programoje integruotas muzikinis, meninis ir fizinis lavinimas. Darbo laikas pritaikytas tėvams.',
  'Draugiškas ir saugus darželis su kvalifikuotu personalu. Galimybė lankyti nuo 1,5 metų.',
  'Valstybinė įstaiga, teikianti lopšelio ir darželio grupes. Sveika mityba, reguliarios ekskursijos.',
  'Darželis, kuriame vaikai mokomi per žaidimą. Dėmesys kalbos lavinimui ir socialiniams įgūdžiams.',
  'Moderni ugdymo įstaiga su STEAM elementais programoje. Kūrybiškumo ir mokslo derinys.',
  'Darželis su etnokultūrine programa – lietuviškos tradicijos, liaudies dainos, papročių pažinimas.',
  'Ikimokyklinis ugdymas pagal atnaujintą programą. Individuali vaiko pažangos stebėsena.',
  'Darželis su logopedo, psichologo ir kineziterapeuto paslaugomis. Įtrauki ugdymo aplinka.',
  'Erdvus darželis su dideliu kiemu ir sporto sale. Reguliarios sporto varžybos tarp grupių.',
  'Darželis, orientuotas į sveiką gyvenseną – ekologiškas maistas, mankšta, lauko veiklos.',
  'Šilta ir jaukia atmosfera pasižymintis darželis. Mažos grupės, individualus dėmesys kiekvienam vaikui.',
  'Darželis su anglų kalbos elementais kasdienėje veikloje. Dvikalbystės skatinimas.',
  'Valstybinis darželis su Montessori elementais ugdymo programoje. Savarankiškumo ugdymas.',
];

const DESCRIPTIONS_PRIVATE = [
  'Privatus darželis su individualia ugdymo programa. Mažos grupės iki 12 vaikų. Anglų kalba kasdien.',
  'Šiuolaikiškas privatus darželis su Montessori metodika. Kvalifikuoti tarptautinės patirties pedagogai.',
  'Privatus lopšelis-darželis su ekologiška mityba ir Waldorf ugdymo elementais.',
  'Modernus privatus darželis – interaktyvios klasės, STEAM programa, baseinas, sporto salė.',
  'Kūrybiškas privatus darželis su menu, muzika ir teatro elementais kasdienėje programoje.',
  'Privatus darželis su trimis kalbomis – lietuvių, anglų ir vokiečių. Tarptautinė aplinka.',
  'Aukštos kokybės privatus darželis su sveikatinimo programa. Baseinas, sauna, masažai vaikams.',
  'Privatus Montessori darželis. Vaikai mokomi savarankiškumo, atsakomybės ir pasitikėjimo savimi.',
  'Ekskluzyvus privatus darželis su individualizuota programa kiekvienam vaikui. Videofilmavimas tėvams.',
  'Privatus darželis su ilga darbo diena (7:00-19:00). Lankstus grafikas, galimybė lankyti dalį dienos.',
  'Gamtinis privatus darželis – 80% laiko lauke. Miško pedagogika, gamtos tyrinėjimas.',
  'Privatus darželis su logopedo, ergoterapeuто ir psichologo paslaugomis kiekvienam vaikui.',
  'Inovatyvus privatus darželis su robotikos ir programavimo pamokomis nuo 4 metų.',
  'Privatus darželis su kino ir animacijos studija. Kūrybiškumo ugdymas per šiuolaikines technologijas.',
  'Privatus darželis, orientuotas į sporto ir sveikos gyvensenos ugdymą. Kasdienė mankšta.',
];

const FEATURES_POOL = [
  'Logopedas', 'Psichologas', 'Baseinas', 'Sporto salė',
  'Lauko aikštelė', 'Muzikos pamokos', 'Anglų kalba',
  'Ekologiškas maistas', 'Šokių pamokos', 'Dailės studija',
  'Videofilmavimas', 'Ilga darbo diena', 'Mažos grupės',
  'Montessori elementai', 'STEAM programa', 'Gamtos pažinimas',
  'Teatro būrelis', 'Šachmatai', 'Robotika', 'Jogos pamokos',
];

// ── Hours options ─────────────────────────────────────────────────────────────

const HOURS_OPTIONS = [
  '7:00-18:00', '7:00-18:00', '7:00-18:00', '7:00-18:00', // most common
  '7:00-18:00', '7:00-18:00',
  '7:30-17:30', '7:30-17:30',
  '6:30-18:30', '6:30-18:30',
  '7:00-17:00',
  '7:00-19:00',
  '8:00-17:00',
];

// ── Language options ──────────────────────────────────────────────────────────

function pickLanguage(): string {
  const r = Math.random();
  if (r < 0.85) return 'lietuvių';
  if (r < 0.95) return 'lietuvių/anglų';
  return 'lietuvių/rusų';
}

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

// ── Features generator ────────────────────────────────────────────────────────

function pickFeatures(isPrivate: boolean): string[] {
  const count = isPrivate ? randBetween(3, 7) : randBetween(1, 4);
  const shuffled = [...FEATURES_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── Name tracker to avoid duplicates ──────────────────────────────────────────

const usedNames = new Set<string>();

function generateUniqueName(isPrivate: boolean, city: string, index: number): string {
  const maxAttempts = 50;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const baseName = pick(KINDERGARTEN_NAMES);
    const prefix = isPrivate ? pick(PRIVATE_PREFIXES) : pick(KINDERGARTEN_PREFIXES);
    let name = `${prefix} „${baseName}"`;

    if (usedNames.has(name)) {
      // Try adding city
      name = `${prefix} „${baseName}" (${city})`;
    }
    if (usedNames.has(name)) {
      // Try adding number
      name = `${prefix} „${baseName}" Nr. ${index + 1}`;
    }
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  // Fallback: use index-based unique name
  const prefix = isPrivate ? pick(PRIVATE_PREFIXES) : pick(KINDERGARTEN_PREFIXES);
  const baseName = pick(KINDERGARTEN_NAMES);
  const name = `${prefix} „${baseName}" ${city}-${index}`;
  usedNames.add(name);
  return name;
}

// ── Generator ─────────────────────────────────────────────────────────────────

interface KindergartenRecord {
  slug: string;
  name: string;
  city: string;
  region: string;
  area: string;
  address: string;
  type: string;
  phone: string;
  website: string | null;
  language: string;
  ageFrom: number;
  groups: number;
  hours: string;
  features: string;
  description: string;
  note: string | null;
  baseRating: number;
  baseReviewCount: number;
  isUserAdded: boolean;
}

function generateKindergartens(): KindergartenRecord[] {
  const kindergartens: KindergartenRecord[] = [];
  let globalIndex = 0;

  for (const config of CITY_CONFIGS) {
    for (let i = 0; i < config.target; i++) {
      const isPrivate = Math.random() < 0.30;
      const name = generateUniqueName(isPrivate, config.city, globalIndex);
      const area = pick(config.areas);
      const streetNum = randBetween(1, 120);
      const address = `${pick(STREET_NAMES)} ${streetNum}`;
      const type = isPrivate ? 'privatus' : 'valstybinis';
      const language = pickLanguage();
      const ageFrom = pick([1, 1, 2, 2, 2, 3, 3] as const);
      const groups = randBetween(3, 12);
      const hours = pick(HOURS_OPTIONS);
      const features = pickFeatures(isPrivate);
      const description = isPrivate ? pick(DESCRIPTIONS_PRIVATE) : pick(DESCRIPTIONS_PUBLIC);
      const rating = weightedRating();
      const reviewCount = randBetween(0, 50);

      const region = `${config.region} apskritis`;

      kindergartens.push({
        slug: uniqueSlug(name),
        name,
        city: config.city,
        region,
        area,
        address,
        type,
        phone: phoneNumber(),
        website: null,
        language,
        ageFrom,
        groups,
        hours,
        features: JSON.stringify(features),
        description,
        note: null,
        baseRating: rating,
        baseReviewCount: reviewCount,
        isUserAdded: false,
      });

      globalIndex++;
    }
  }

  return kindergartens;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Seed Kindergartens (900+) ===');
  console.log('');

  // Load existing slugs from DB to avoid collisions
  const existingKindergartens = await prisma.kindergarten.findMany({
    select: { slug: true, name: true },
  });
  existingKindergartens.forEach(k => {
    usedSlugs.add(k.slug);
    usedNames.add(k.name);
  });

  const countBefore = await prisma.kindergarten.count();
  console.log(`Kindergartens before: ${countBefore}`);
  console.log('');

  // Generate data
  const newKindergartens = generateKindergartens();
  console.log(`Generated ${newKindergartens.length} new kindergartens`);

  // Insert in batches (SQLite has a limit on variables per statement)
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < newKindergartens.length; i += BATCH_SIZE) {
    const batch = newKindergartens.slice(i, i + BATCH_SIZE);
    await prisma.kindergarten.createMany({ data: batch });
    inserted += batch.length;
    if (inserted % 200 === 0 || inserted === newKindergartens.length) {
      console.log(`  Inserted ${inserted}/${newKindergartens.length}...`);
    }
  }

  const countAfter = await prisma.kindergarten.count();
  console.log('');
  console.log(`Kindergartens after: ${countAfter} (+${countAfter - countBefore})`);
  console.log('');

  // Show distribution by city
  console.log('Distribution by city:');
  const cityCounts = await prisma.$queryRawUnsafe<{ city: string; count: number }[]>(
    `SELECT city, COUNT(*) as count FROM Kindergarten GROUP BY city ORDER BY count DESC`
  );
  for (const row of cityCounts) {
    console.log(`  ${row.city}: ${row.count}`);
  }

  console.log('');
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
