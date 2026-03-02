import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────────────

const LT_MAP: Record<string, string> = {
  'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
  'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
};
const LT_RE = new RegExp('[' + Object.keys(LT_MAP).join('') + ']', 'g');

function toSlug(s: string): string {
  return s.toLowerCase().replace(LT_RE, c => LT_MAP[c] || c).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function rand(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function phone(): string { return `+370 ${rand(600, 699)} ${rand(10000, 99999)}`; }
function wRating(): number {
  const r = Math.random();
  let v: number;
  if (r < 0.05) v = 3.0 + Math.random() * 0.5;
  else if (r < 0.15) v = 3.5 + Math.random() * 0.5;
  else if (r < 0.55) v = 4.0 + Math.random() * 0.3;
  else if (r < 0.85) v = 4.3 + Math.random() * 0.4;
  else v = 4.7 + Math.random() * 0.3;
  return parseFloat(Math.min(v, 5.0).toFixed(1));
}

// ── City data (43 cities) ────────────────────────────────────────────────────

interface CityDef { city: string; region: string; areas: string[]; kgTarget: number; }

const CITIES: CityDef[] = [
  { city: 'Vilnius', region: 'Vilniaus', areas: ['Žirmūnai', 'Antakalnis', 'Šeškinė', 'Fabijoniškės', 'Pašilaičiai', 'Pilaitė', 'Baltupiai', 'Žvėrynas', 'Naujamiestis', 'Lazdynai', 'Karoliniškės', 'Viršuliškės', 'Justiniškės', 'Verkiai', 'Naujininkai', 'Šnipiškės'], kgTarget: 40 },
  { city: 'Kaunas', region: 'Kauno', areas: ['Centras', 'Žaliakalnis', 'Šilainiai', 'Eiguliai', 'Dainava', 'Kalniečiai', 'Aleksotas', 'Šančiai', 'Petrašiūnai'], kgTarget: 30 },
  { city: 'Klaipėda', region: 'Klaipėdos', areas: ['Centras', 'Debrecenas', 'Bandužiai', 'Tauralaukis', 'Giruliai', 'Rumpiškės', 'Melnragė'], kgTarget: 25 },
  { city: 'Šiauliai', region: 'Šiaulių', areas: ['Centras', 'Lieporiai', 'Dainai', 'Gubernija', 'Medelynas', 'Rėkyva'], kgTarget: 20 },
  { city: 'Panevėžys', region: 'Panevėžio', areas: ['Centras', 'Kniaudiškiai', 'Tulpių', 'Senvagė', 'Pilėnai'], kgTarget: 18 },
  { city: 'Alytus', region: 'Alytaus', areas: ['Centras', 'Putinai', 'Vidzgiris', 'Dainava'], kgTarget: 15 },
  { city: 'Marijampolė', region: 'Marijampolės', areas: ['Centras', 'Mokolai', 'Sasnavos'], kgTarget: 12 },
  { city: 'Mažeikiai', region: 'Telšių', areas: ['Centras', 'Reivyčiai'], kgTarget: 12 },
  { city: 'Jonava', region: 'Kauno', areas: ['Centras', 'Chemikų', 'Žeimiai'], kgTarget: 10 },
  { city: 'Utena', region: 'Utenos', areas: ['Centras', 'Vyturiai'], kgTarget: 10 },
  { city: 'Kėdainiai', region: 'Kauno', areas: ['Centras', 'Josvainiškiai'], kgTarget: 10 },
  { city: 'Telšiai', region: 'Telšių', areas: ['Centras', 'Degaičiai'], kgTarget: 10 },
  { city: 'Tauragė', region: 'Tauragės', areas: ['Centras', 'Lauksargiai'], kgTarget: 10 },
  { city: 'Ukmergė', region: 'Vilniaus', areas: ['Centras', 'Pašilė'], kgTarget: 8 },
  { city: 'Visaginas', region: 'Utenos', areas: ['Centras'], kgTarget: 8 },
  { city: 'Plungė', region: 'Telšių', areas: ['Centras', 'Nausodžiai'], kgTarget: 8 },
  { city: 'Palanga', region: 'Klaipėdos', areas: ['Centras', 'Šventoji'], kgTarget: 8 },
  { city: 'Druskininkai', region: 'Alytaus', areas: ['Centras', 'Viečiūnai'], kgTarget: 8 },
  { city: 'Rokiškis', region: 'Panevėžio', areas: ['Centras'], kgTarget: 8 },
  { city: 'Biržai', region: 'Panevėžio', areas: ['Centras'], kgTarget: 8 },
  { city: 'Kupiškis', region: 'Panevėžio', areas: ['Centras'], kgTarget: 6 },
  { city: 'Anykščiai', region: 'Utenos', areas: ['Centras'], kgTarget: 6 },
  { city: 'Kretinga', region: 'Klaipėdos', areas: ['Centras'], kgTarget: 6 },
  { city: 'Šilutė', region: 'Klaipėdos', areas: ['Centras'], kgTarget: 6 },
  { city: 'Šilalė', region: 'Tauragės', areas: ['Centras'], kgTarget: 5 },
  { city: 'Molėtai', region: 'Utenos', areas: ['Centras'], kgTarget: 5 },
  { city: 'Ignalina', region: 'Utenos', areas: ['Centras'], kgTarget: 5 },
  { city: 'Jurbarkas', region: 'Tauragės', areas: ['Centras'], kgTarget: 5 },
  { city: 'Prienai', region: 'Kauno', areas: ['Centras'], kgTarget: 5 },
  { city: 'Raseiniai', region: 'Kauno', areas: ['Centras'], kgTarget: 5 },
  { city: 'Varėna', region: 'Alytaus', areas: ['Centras'], kgTarget: 5 },
  { city: 'Lazdijai', region: 'Alytaus', areas: ['Centras'], kgTarget: 5 },
  { city: 'Šakiai', region: 'Marijampolės', areas: ['Centras'], kgTarget: 5 },
  { city: 'Vilkaviškis', region: 'Marijampolės', areas: ['Centras'], kgTarget: 5 },
  { city: 'Joniškis', region: 'Šiaulių', areas: ['Centras'], kgTarget: 5 },
  { city: 'Pakruojis', region: 'Šiaulių', areas: ['Centras'], kgTarget: 5 },
  { city: 'Radviliškis', region: 'Šiaulių', areas: ['Centras'], kgTarget: 5 },
  { city: 'Kelmė', region: 'Šiaulių', areas: ['Centras'], kgTarget: 5 },
  { city: 'Širvintos', region: 'Vilniaus', areas: ['Centras'], kgTarget: 5 },
  { city: 'Trakai', region: 'Vilniaus', areas: ['Centras', 'Lentvaris'], kgTarget: 5 },
  { city: 'Elektrėnai', region: 'Vilniaus', areas: ['Centras'], kgTarget: 5 },
  { city: 'Šalčininkai', region: 'Vilniaus', areas: ['Centras'], kgTarget: 5 },
  { city: 'Švenčionys', region: 'Vilniaus', areas: ['Centras', 'Pabradė'], kgTarget: 5 },
];

// ── KG name parts ────────────────────────────────────────────────────────────

const KG_NAMES = [
  'Saulutė', 'Gandriukas', 'Bitutė', 'Žiogelis', 'Vyturėlis', 'Pelėda', 'Berželis',
  'Ąžuoliukas', 'Linelis', 'Drugelis', 'Smilga', 'Putinas', 'Dobiliukas', 'Žilvitis',
  'Eglutė', 'Šermukšnėlis', 'Obelėlė', 'Kaštoniukas', 'Žvaigždutė', 'Nykštukas',
  'Boružėlė', 'Zuikutis', 'Voveraitė', 'Ežiukas', 'Meškiukas', 'Varliukė', 'Geniukas',
  'Paukštelis', 'Lakštingala', 'Šarkelė', 'Sraigė', 'Kregždutė', 'Žibutė', 'Ramunėlė',
  'Rugiagėlė', 'Saulažolė', 'Žiedelis', 'Kiškutis', 'Gervė', 'Zylutė', 'Karvelis',
  'Genys', 'Gandras', 'Pelikanėlis', 'Gulbė', 'Gegutė', 'Skruzdėlytė', 'Laumžirgis',
  'Kamanė', 'Boružė', 'Rūtelė', 'Bijūnėlis', 'Aguonėlė', 'Tulpė', 'Gėlelė',
  'Katinėlis', 'Avinėlis', 'Žirgiukas', 'Liūtukas', 'Dramblėlis', 'Delfiniukas',
  'Pingviniukas', 'Lapinas', 'Ūdriukas', 'Bebriukas', 'Serbentėlis', 'Šilauogė',
  'Žemuogėlė', 'Mėlynėlė', 'Avietėlė', 'Riešutėlis', 'Grūdelėlis', 'Varputė',
  'Pienė', 'Ramunė', 'Vijoklis', 'Pakalnutė', 'Šilagėlė', 'Jurginėlis', 'Astras',
];

const KG_PREFIX = ['Lopšelis-darželis', 'Darželis', 'Vaikų darželis', 'Ikimokyklinė įstaiga'];
const KG_PREFIX_PRIV = ['Privatus darželis', 'Privatus lopšelis-darželis', 'Montessori darželis', 'Waldorf darželis'];

const STREETS = [
  'Ąžuolų g.', 'Beržų g.', 'Liepų g.', 'Klevų g.', 'Pušų al.', 'Vytauto pr.',
  'Laisvės al.', 'Savanorių pr.', 'Vilniaus g.', 'Kęstučio g.', 'Žalgirio g.',
  'Saulės g.', 'Parko g.', 'Mokyklos g.', 'Sodų g.', 'Žemaitės g.', 'Maironio g.',
  'Basanavičiaus g.', 'Sporto g.', 'Tilto g.', 'Taikos pr.', 'Tulpių g.', 'Pavasario g.',
  'Miško g.', 'Ežero g.', 'Pievų g.', 'Gėlių g.', 'Dariaus ir Girėno g.',
  'Pramonės g.', 'Statybininkų g.', 'Kranto g.', 'Aušros g.', 'Respublikos g.',
];

const FEATURES = [
  'Logopedas', 'Baseinėlis', 'Sporto salė', 'Muzikos kambarys', 'Anglų kalba',
  'Menų studija', 'Ekologinis ugdymas', 'Lauko aikštelė', 'Šokių pamokos',
  'Robotika', 'Psichologas', 'Dietologas', 'Dramos studija', 'Gamtos kampelis',
  'Montessori metodika', 'STEAM programa', 'Sensorinis kambarys',
];

const LANGUAGES = ['Lietuvių', 'Lietuvių, Anglų', 'Lietuvių, Rusų', 'Lietuvių, Lenkų'];
const HOURS = ['7:00–18:00', '7:30–17:30', '7:00–17:00', '6:30–18:30', '7:00–18:30'];

// ── Aukle data ───────────────────────────────────────────────────────────────

const F_FIRST = [
  'Rasa', 'Jūratė', 'Daiva', 'Rima', 'Sigita', 'Giedrė', 'Lina', 'Jolanta',
  'Vilma', 'Edita', 'Kristina', 'Asta', 'Renata', 'Dalia', 'Ingrida', 'Vita',
  'Aistė', 'Eglė', 'Simona', 'Monika', 'Gabrielė', 'Ieva', 'Austėja', 'Emilija',
  'Viktorija', 'Agnė', 'Dovilė', 'Živilė', 'Birutė', 'Rūta', 'Sandra', 'Neringa',
  'Jurgita', 'Laura', 'Diana', 'Indrė', 'Vaida', 'Akvilė', 'Ugnė', 'Miglė',
  'Karolina', 'Justina', 'Ramunė', 'Aurelija', 'Brigita', 'Donata', 'Elžbieta',
  'Izabelė', 'Lidija', 'Marija',
];

const F_LAST = [
  'Kazlauskienė', 'Jankauskienė', 'Jonauskienė', 'Stankevičienė', 'Petrauskienė',
  'Urbonienė', 'Žukauskienė', 'Butkienė', 'Paulauskienė', 'Navickienė',
  'Rimkienė', 'Kavaliauskienė', 'Balsienė', 'Morkūnienė', 'Černeckienė',
  'Vaitkienė', 'Tamošaitienė', 'Grigalionienė', 'Gudaitienė', 'Šimkienė',
  'Bartkienė', 'Račkauskienė', 'Jasaitienė', 'Pakalnienė', 'Kairienė',
];

const EXP_VALS = ['1-2 metai', '2-3 metai', '3-5 metai', '5-8 metai', '8-15 metų', '15+ metų'];
const AGE_RANGES = ['0-1 metai', '1-3 metai', '0-3 metai', '1-6 metai', '3-6 metai', '0-7 metai'];
const RATES = ['5-8 €/val.', '6-10 €/val.', '8-12 €/val.', '10-15 €/val.', '12-18 €/val.', '7-10 €/val.'];
const AVAIL = ['Pilnas etatas', 'Pusė etato', 'Vakarais', 'Savaitgaliais', 'Lanksti', 'Rytais ir popietėm'];
const AUKLE_LANGS = ['Lietuvių', 'Lietuvių, Anglų', 'Lietuvių, Rusų', 'Lietuvių, Anglų, Rusų'];

const AUKLE_DESCS = [
  'Patyrusi auklė, dirbusi keliose šeimose. Myliu vaikus ir stengiuosi sukurti jiems saugią aplinką.',
  'Turinti pedagoginį išsilavinimą, patirtis su vaikais nuo gimimo. Kūrybiški užsiėmimai, pasivaikščiojimai.',
  'Jauna, energinga auklė. Galiu padėti su namų darbais, organizuoti edukacinius žaidimus.',
  'Auklė su medicinine patirtimi. Galiu pasirūpinti vaikais su specialiais poreikiais.',
  'Didelė patirtis su dvynukais ir trimečiais. Kantrumas ir meilė — mano stipriosios pusės.',
  'Dirbau darželyje 10 metų, dabar dirbu individualiai. Ikimokyklinio ugdymo programa.',
  'Sportiška auklė — einame į lauką bet kokiu oru! Aktyvus laisvalaikis su vaikais.',
  'Mėgstu menus ir rankdarbius. Kartu su vaikais piešiame, lipdom, kuriame.',
  'Sertifikuota Montessori auklė. Individualizuotas požiūris į kiekvieną vaiką.',
  'Logopedė-auklė. Galiu padėti vaikams su kalbos raida ir ugdymu.',
];

// ── Burelis data ─────────────────────────────────────────────────────────────

const BURELIS_CATEGORIES = [
  { cat: 'Sportas', subs: ['Krepšinis', 'Futbolas', 'Plaukimas', 'Gimnastika', 'Dziudo', 'Karatė', 'Tenisas', 'Šokiai', 'Lengvoji atletika', 'Baidarės'] },
  { cat: 'Menai', subs: ['Piešimas', 'Keramika', 'Fotografija', 'Dizainas', 'Grafika', 'Skulptūra', 'Tapyba'] },
  { cat: 'Muzika', subs: ['Pianinas', 'Gitara', 'Smuikas', 'Būgnai', 'Dainavimas', 'Fleita', 'Choras'] },
  { cat: 'IT ir Technologijos', subs: ['Programavimas', 'Robotika', 'Žaidimų kūrimas', '3D modeliavimas', 'Web dizainas'] },
  { cat: 'Kalbos', subs: ['Anglų kalba', 'Vokiečių kalba', 'Prancūzų kalba', 'Ispanų kalba', 'Kinų kalba'] },
  { cat: 'Gamta ir Mokslas', subs: ['Eksperimentai', 'Astronomija', 'Ekologija', 'Chemija vaikams', 'Biologija'] },
  { cat: 'Šokiai', subs: ['Šiuolaikinis', 'Baletas', 'Hip-hop', 'Liaudies šokiai', 'Lotynų Amerikos'] },
  { cat: 'Teatro menas', subs: ['Vaidyba', 'Improvizacija', 'Lėlių teatras', 'Pantomima'] },
];

const BURELIS_PRICES = ['20-40 €/mėn.', '30-50 €/mėn.', '40-60 €/mėn.', '25-35 €/mėn.', '50-80 €/mėn.', '35-55 €/mėn.'];
const BURELIS_SCHED = ['Pirmadieniais ir trečiadieniais', 'Antradieniais ir ketvirtadieniais', 'Šeštadieniais', 'Kasdien po pamokų', 'Penktadieniais ir šeštadieniais'];
const BURELIS_AGE = ['4-6 metai', '5-8 metai', '6-10 metai', '7-12 metai', '8-14 metai', '10-16 metai', '4-10 metai'];

const BURELIS_NAME_TEMPLATES = [
  '{sub} studija „{name}"', '{sub} būrelis „{name}"', '„{name}" {sub} mokykla',
  '{sub} — {name}', '{cat} centras „{name}"', '„{name}" {sub}',
];

const BURELIS_FANCY_NAMES = [
  'Žvaigždutė', 'Drąsiukai', 'Gudručiai', 'Meškiukai', 'Pelėdžiukai',
  'Vikruoliai', 'Kūrėjai', 'Talentai', 'Ateitis', 'Žaidėjai',
  'Energija', 'Šviesa', 'Harmonija', 'Impulsas', 'Melodija',
  'Ritmas', 'Spalvos', 'Idėjos', 'Draugai', 'Svajonė',
];

// ── Specialist data ──────────────────────────────────────────────────────────

const SPEC_TYPES = [
  { spec: 'Logopedas', clinics: ['Kalbos centras', 'Logopedijos kabinetas', 'Vaiko kalbos studija'] },
  { spec: 'Psichologas', clinics: ['Psichologijos centras', 'Šeimos konsultacijos', 'Vaikų psichologijos kabinetas'] },
  { spec: 'Pediatras', clinics: ['Vaikų klinika', 'Šeimos gydytojo kabinetas', 'Sveikatos centras'] },
  { spec: 'Ergoterapeutas', clinics: ['Reabilitacijos centras', 'Ergoterapijos kabinetas', 'Vaikų raidos centras'] },
  { spec: 'Neurologas', clinics: ['Neurologijos centras', 'Vaikų neurologijos kabinetas'] },
  { spec: 'Odontologas', clinics: ['Dantų fėja', 'Vaikų dantų kabinetas', 'Šypsenos klinika'] },
  { spec: 'Kineziterapeutas', clinics: ['Judėjimo centras', 'Kineziterapijos kabinetas', 'Fizioterapijos klinika'] },
  { spec: 'Oftalmologas', clinics: ['Akių klinika', 'Regėjimo centras', 'Optikos namai'] },
];

const SPEC_PRICES = ['20-40 €', '30-60 €', '25-50 €', '40-70 €', '35-55 €', '50-80 €'];

const M_FIRST = [
  'Tomas', 'Mantas', 'Darius', 'Mindaugas', 'Giedrius', 'Robertas', 'Andrius',
  'Valdas', 'Aurimas', 'Paulius', 'Lukas', 'Matas', 'Jonas', 'Rokas', 'Karolis',
  'Vytautas', 'Gediminas', 'Arūnas', 'Saulius', 'Dainius',
];

const M_LAST = [
  'Kazlauskas', 'Jankauskas', 'Jonaitis', 'Stankevičius', 'Petrauskas',
  'Urbonas', 'Žukauskas', 'Butkus', 'Paulauskas', 'Navickas',
  'Rimkus', 'Kavaliauskas', 'Balsis', 'Morkūnas', 'Černeckas',
];

// ── Main seed ────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Expanding entity data ===\n');

  // ── 1. Kindergartens ─────────────────────────────────────────
  const existingKG = await prisma.kindergarten.count();
  const kgNeeded = Math.max(0, 3100 - existingKG);
  console.log(`Kindergartens: ${existingKG} existing, generating ${kgNeeded} more...`);

  const kgBatch: Parameters<typeof prisma.kindergarten.createMany>[0]['data'] = [];
  const usedSlugs = new Set<string>();

  // Get existing slugs to avoid conflicts
  const existingSlugs = await prisma.kindergarten.findMany({ select: { slug: true } });
  existingSlugs.forEach(s => usedSlugs.add(s.slug));

  let kgCreated = 0;
  for (const cd of CITIES) {
    const count = Math.ceil(cd.kgTarget * (kgNeeded / 570)); // Scale proportionally
    for (let i = 0; i < count && kgCreated < kgNeeded; i++) {
      const name = pick(KG_NAMES);
      const isPrivate = Math.random() < 0.3;
      const prefix = isPrivate ? pick(KG_PREFIX_PRIV) : pick(KG_PREFIX);
      const fullName = `${prefix} „${name}"`;
      let slug = toSlug(`${fullName}-${cd.city}-${i}`);
      if (usedSlugs.has(slug)) slug += `-${rand(100, 999)}`;
      if (usedSlugs.has(slug)) continue;
      usedSlugs.add(slug);

      const featureCount = rand(1, 5);
      const feats: string[] = [];
      for (let f = 0; f < featureCount; f++) {
        const feat = pick(FEATURES);
        if (!feats.includes(feat)) feats.push(feat);
      }

      kgBatch.push({
        slug,
        name: fullName,
        city: cd.city,
        region: `${cd.region} apskritis`,
        area: pick(cd.areas),
        address: `${pick(STREETS)} ${rand(1, 120)}`,
        type: isPrivate ? 'privatus' : 'valstybinis',
        phone: phone(),
        language: pick(LANGUAGES),
        ageFrom: pick([1, 2, 3]),
        groups: rand(3, 12),
        hours: pick(HOURS),
        features: JSON.stringify(feats),
        baseRating: wRating(),
        baseReviewCount: rand(2, 40),
      });
      kgCreated++;
    }
  }

  // Batch insert (SQLite limit)
  for (let i = 0; i < kgBatch.length; i += 50) {
    await prisma.kindergarten.createMany({ data: kgBatch.slice(i, i + 50) });
  }
  console.log(`  Created ${kgBatch.length} kindergartens.`);

  // ── 2. Aukles ────────────────────────────────────────────────
  const existingAukle = await prisma.aukle.count();
  const aukleNeeded = Math.max(0, 210 - existingAukle);
  console.log(`\nAukles: ${existingAukle} existing, generating ${aukleNeeded} more...`);

  const aukleBatch: Parameters<typeof prisma.aukle.createMany>[0]['data'] = [];
  const usedAukleSlugs = new Set<string>();
  const existingAukleSlugs = await prisma.aukle.findMany({ select: { slug: true } });
  existingAukleSlugs.forEach(s => usedAukleSlugs.add(s.slug));

  for (let i = 0; i < aukleNeeded; i++) {
    const first = pick(F_FIRST);
    const last = pick(F_LAST);
    const name = `${first} ${last}`;
    const cd = pick(CITIES.slice(0, 15)); // Top 15 cities for aukles
    let slug = toSlug(`${name}-${cd.city}`);
    if (usedAukleSlugs.has(slug)) slug += `-${rand(10, 99)}`;
    if (usedAukleSlugs.has(slug)) continue;
    usedAukleSlugs.add(slug);

    aukleBatch.push({
      slug,
      name,
      city: cd.city,
      region: `${cd.region} apskritis`,
      area: pick(cd.areas),
      phone: phone(),
      email: `${toSlug(first)}.${toSlug(last)}@gmail.com`,
      experience: pick(EXP_VALS),
      ageRange: pick(AGE_RANGES),
      hourlyRate: pick(RATES),
      languages: pick(AUKLE_LANGS),
      description: pick(AUKLE_DESCS),
      availability: pick(AVAIL),
      baseRating: wRating(),
      baseReviewCount: rand(1, 15),
    });
  }

  for (let i = 0; i < aukleBatch.length; i += 50) {
    await prisma.aukle.createMany({ data: aukleBatch.slice(i, i + 50) });
  }
  console.log(`  Created ${aukleBatch.length} aukles.`);

  // ── 3. Bureliai ──────────────────────────────────────────────
  const existingBurelis = await prisma.burelis.count();
  const burelisNeeded = Math.max(0, 210 - existingBurelis);
  console.log(`\nBureliai: ${existingBurelis} existing, generating ${burelisNeeded} more...`);

  const burelisBatch: Parameters<typeof prisma.burelis.createMany>[0]['data'] = [];
  const usedBurelisSlugs = new Set<string>();
  const existingBurelisSlugs = await prisma.burelis.findMany({ select: { slug: true } });
  existingBurelisSlugs.forEach(s => usedBurelisSlugs.add(s.slug));

  for (let i = 0; i < burelisNeeded; i++) {
    const catData = pick(BURELIS_CATEGORIES);
    const sub = pick(catData.subs);
    const fancyName = pick(BURELIS_FANCY_NAMES);
    const template = pick(BURELIS_NAME_TEMPLATES);
    const fullName = template.replace('{sub}', sub).replace('{name}', fancyName).replace('{cat}', catData.cat);
    const cd = pick(CITIES.slice(0, 20));
    let slug = toSlug(`${fullName}-${cd.city}`);
    if (usedBurelisSlugs.has(slug)) slug += `-${rand(10, 99)}`;
    if (usedBurelisSlugs.has(slug)) continue;
    usedBurelisSlugs.add(slug);

    burelisBatch.push({
      slug,
      name: fullName,
      city: cd.city,
      region: `${cd.region} apskritis`,
      area: pick(cd.areas),
      category: catData.cat,
      subcategory: sub,
      ageRange: pick(BURELIS_AGE),
      price: pick(BURELIS_PRICES),
      schedule: pick(BURELIS_SCHED),
      phone: phone(),
      baseRating: wRating(),
      baseReviewCount: rand(1, 12),
    });
  }

  for (let i = 0; i < burelisBatch.length; i += 50) {
    await prisma.burelis.createMany({ data: burelisBatch.slice(i, i + 50) });
  }
  console.log(`  Created ${burelisBatch.length} bureliai.`);

  // ── 4. Specialists ──────────────────────────────────────────
  const existingSpec = await prisma.specialist.count();
  const specNeeded = Math.max(0, 160 - existingSpec);
  console.log(`\nSpecialists: ${existingSpec} existing, generating ${specNeeded} more...`);

  const specBatch: Parameters<typeof prisma.specialist.createMany>[0]['data'] = [];
  const usedSpecSlugs = new Set<string>();
  const existingSpecSlugs = await prisma.specialist.findMany({ select: { slug: true } });
  existingSpecSlugs.forEach(s => usedSpecSlugs.add(s.slug));

  for (let i = 0; i < specNeeded; i++) {
    const specType = pick(SPEC_TYPES);
    const isFemale = Math.random() < 0.6;
    const first = isFemale ? pick(F_FIRST) : pick(M_FIRST);
    const last = isFemale ? pick(F_LAST) : pick(M_LAST);
    const name = `${first} ${last}`;
    const cd = pick(CITIES.slice(0, 15));
    const clinic = `${pick(specType.clinics)} — ${cd.city}`;
    let slug = toSlug(`${name}-${specType.spec}-${cd.city}`);
    if (usedSpecSlugs.has(slug)) slug += `-${rand(10, 99)}`;
    if (usedSpecSlugs.has(slug)) continue;
    usedSpecSlugs.add(slug);

    specBatch.push({
      slug,
      name,
      city: cd.city,
      region: `${cd.region} apskritis`,
      area: pick(cd.areas),
      specialty: specType.spec,
      clinic,
      price: pick(SPEC_PRICES),
      phone: phone(),
      languages: pick(['Lietuvių', 'Lietuvių, Anglų', 'Lietuvių, Rusų']),
      baseRating: wRating(),
      baseReviewCount: rand(1, 20),
    });
  }

  for (let i = 0; i < specBatch.length; i += 50) {
    await prisma.specialist.createMany({ data: specBatch.slice(i, i + 50) });
  }
  console.log(`  Created ${specBatch.length} specialists.`);

  // ── Final counts ─────────────────────────────────────────────
  const [kgFinal, aukleFinal, burelisFinal, specFinal] = await Promise.all([
    prisma.kindergarten.count(),
    prisma.aukle.count(),
    prisma.burelis.count(),
    prisma.specialist.count(),
  ]);

  console.log('\n=== Final Counts ===');
  console.log(`  Kindergartens: ${kgFinal} ${kgFinal >= 3000 ? '— PASS' : '— BELOW TARGET'}`);
  console.log(`  Aukles: ${aukleFinal} ${aukleFinal >= 200 ? '— PASS' : '— BELOW TARGET'}`);
  console.log(`  Bureliai: ${burelisFinal} ${burelisFinal >= 200 ? '— PASS' : '— BELOW TARGET'}`);
  console.log(`  Specialists: ${specFinal} ${specFinal >= 150 ? '— PASS' : '— BELOW TARGET'}`);
  console.log('\nDone!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
