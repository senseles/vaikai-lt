const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const specialists = [
  // === VILNIUS – Logopedai ===
  { name: 'Logopedės.lt', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Logopedas', website: 'https://logopedes.lt', description: 'Profesionalios logopedo ir specialiojo pedagogo paslaugos ikimokyklinio ir jaunesniojo mokyklinio amžiaus vaikams.' },
  { name: '„Upės teka" logopedas', city: 'Vilnius', region: 'Vilniaus apskritis', area: 'Naujamiestis', specialty: 'Logopedas', website: 'https://upesteka.lt', description: 'Logopedo paslaugos vaikams ir suaugusiems – kalbos, rašymo, skaitymo, mikčiojimo korekcija. Konsultacijos ir nuotoliniu būdu.' },
  { name: 'LOGOTERA centras', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Logopedas', website: 'https://logotera.lt', description: 'Logopedo, ergoterapeuto, kineziterapeuto ir psichologo pagalba vaikams. Individualizuota terapija, raidos vertinimas.' },
  { name: 'Kalbos terapijos studija „Fonema"', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Logopedas', website: 'https://fonema.lt', description: 'Klinikinio logopedo paslaugos vaikams ir suaugusiems, specialiojo pedagogo paslaugos mokyklinio amžiaus vaikams.' },
  { name: 'Klinikinė logopedė Jolanta Repšienė', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Logopedas', website: 'https://logopedinis.lt', description: 'Logopedinės paslaugos visų amžiaus grupių vaikams, paaugliams ir suaugusiems.' },

  // === VILNIUS – Psichologai ===
  { name: 'Vilniaus psichoterapijos ir psichoanalizės centras', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Psichologas', website: 'https://vppc.lt', description: 'Privatus vaikų ir paauglių psichologas – konsultacijos dėl psichikos ir elgesio sutrikimų. Ir nuotoliniu būdu.' },
  { name: 'Neuromeda – vaikų psichologas', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Psichologas', clinic: 'Neuromeda klinika', website: 'https://neuromeda.lt', description: 'Privatūs vaikų ir paauglių psichologai – konsultacijos dėl psichikos ir elgesio sutrikimų.' },
  { name: '„Vidinis Vaiko Pasaulis"', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Psichologas', website: 'https://vidinisvaikopasaulis.lt', description: 'Vaikų psichologas – konsultacijos vaikams ir tėvams, emocinė pagalba kasdieniams sunkumams.' },
  { name: 'Vaikų psichologijos ir psichoterapijos centras', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Psichologas', website: 'https://vaikuppc.lt', description: 'Padeda vaikams ir tėvams suprasti vaiko vidinį pasaulį, įveikti sunkumus ir kurti darnius santykius.' },
  { name: 'Psichologo konsultacija – vaikų psichologas', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Psichologas', website: 'https://psichologokabinetas.lt', description: 'Pagalba vaikams įveikti bendravimo sunkumus, baimes, nerimą, problemas mokykloje.' },

  // === VILNIUS – Kineziterapeutai ===
  { name: 'BabyTherapy.lt', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Kineziterapeutas', website: 'https://babytherapy.lt', description: 'Kineziterapija kūdikiams ir vaikams – masažai, mankštos, konsultacijos. Atvyksta į namus arba studijoje.' },
  { name: 'Kizi M – vaikų kineziterapeutai Vilniuje', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Kineziterapeutas', website: 'https://kizim.lt', description: 'Platforma padedanti rasti vaikų kineziterapijos specialistą pagal vietą, laiką ir kainą.' },

  // === VILNIUS – Vaiko raidos centrai ===
  { name: 'VUL Santaros klinikų Vaiko raidos centras', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Vaiko raidos specialistas', clinic: 'Santaros klinikos', website: 'https://santa.lt', description: 'Specializuota sveikatos priežiūra vaikams su raidos, psichikos ir elgesio sutrikimais.' },
  { name: '„Avevitus" vaiko raidos centras', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Vaiko raidos specialistas', website: 'https://avevitus.lt', description: 'Individuali pagalba vaikams su specialiaisiais poreikiais.' },
  { name: 'Baltijos vaiko raidos klinika', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Vaiko raidos specialistas', website: 'https://bvrk.lt', description: 'Ergoterapija, kineziterapija, logopedija, sensorinė integracija ir kitos vaikų raidos paslaugos.' },
  { name: 'Vaiko raidos klinika Vilnius', city: 'Vilnius', region: 'Vilniaus apskritis', specialty: 'Vaiko raidos specialistas', website: 'https://vaikoraidosklinika.lt', description: 'Kompleksinės reabilitacinės paslaugos vaikams su raidos sutrikimais.' },

  // === KAUNAS – Logopedai ===
  { name: 'Logopedė Indrė – individuali pagalba', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Logopedas', website: 'https://logopedaskaune.lt', description: 'Daugiau nei 30 metų pedagoginio darbo patirtis, 16 metų logopede Kaune su įvairiais kalbos iššūkiais.' },
  { name: 'Klinikinė logopedė Indrė Ilevičienė', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Logopedas', website: 'https://logopedopagalba.lt', description: 'Kalbėjimo, kalbos ir komunikacijos sutrikimų pagalba – pažangios ugdymo metodikos, smagus mokymasis.' },
  { name: 'Neuromeda – logopedas Kaune', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Logopedas', clinic: 'Neuromeda klinika', website: 'https://neuromeda.lt', description: 'Logopedinės paslaugos vaikams Neuromeda klinikoje Kaune.' },

  // === KAUNAS – Psichologai ===
  { name: 'Neuromeda – vaikų psichologas Kaune', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Psichologas', clinic: 'Neuromeda klinika', website: 'https://neuromeda.lt', description: 'Privatus vaikų ir paauglių psichologo konsultacijos Kaune.' },
  { name: 'Psichologija sveikatai – vaikų psichologas', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Psichologas', website: 'https://psichologija-sveikatai.lt', description: 'Individualios psichologinės konsultacijos vaikams ir jų tėveliams Kaune.' },
  { name: 'Baltų šeimos klinika – psichologai', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Psichologas', clinic: 'Baltų šeimos klinika', website: 'https://baltuklinika.lt', description: 'Psichologų ir psichiatrų konsultacijos vaikams ir paaugliams Kaune.' },
  { name: 'Lotus Medica – vaikų psichologai', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Psichologas', clinic: 'Lotus Medica', website: 'https://lotusmedica.lt', description: 'Vaikų ir paauglių psichologai – konsultacijos kontaktiniu būdu ir internetu.' },
  { name: 'Mokymų ir psichologinio konsultavimo centras', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Psichologas', website: 'https://psichologijoscentras.lt', description: 'Vaikų psichologinis konsultavimas Kaune.' },

  // === KAUNAS – Kineziterapeutai ===
  { name: 'RehaTera – Deimantė Stankevičienė', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Kineziterapeutas', clinic: 'RehaTera', website: 'https://rehatera.lt', description: 'Vaikų kineziterapeutė – darbas su vaikais, turinčiais vėluojančią ar sutrikusią judesių raidą.' },
  { name: 'Gijos klinikos – kineziterapeutas Kaunas', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Kineziterapeutas', clinic: 'Gijos klinikos', website: 'https://gijosklinikos.lt', description: 'Gydymas judesiu naujagimiams, vaikams ir suaugusiems.' },
  { name: 'Hedo medicinos centras – vaikų kineziterapija', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Kineziterapeutas', clinic: 'Hedo medicinos centras', website: 'https://hedomedicinoscentras.lt', description: 'Individualios vaikų kineziterapijos procedūros Kaune.' },
  { name: 'Vaiko raidos klinika Kaunas', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Vaiko raidos specialistas', website: 'https://vaikoraidosklinika.lt', description: 'Kompleksinės reabilitacinės paslaugos vaikams su raidos sutrikimais Kaune.' },
  { name: 'Vaikų kineziterapeutė Vaida Vasiliauskienė', city: 'Kaunas', region: 'Kauno apskritis', specialty: 'Kineziterapeutas', website: 'https://vaikukineziterapeute.lt', description: 'Kūdikių ir vaikų kineziterapeutė, dirba LSMUL Vaikų reabilitacijos ligoninėje „Lopšelis".' },

  // === KLAIPĖDA – Logopedai ===
  { name: 'Logopedijos ir pedagogikos centras Klaipėda', city: 'Klaipėda', region: 'Klaipėdos apskritis', specialty: 'Logopedas', description: 'Logopedijos ir specialiosios pedagogikos paslaugos vaikams Klaipėdoje.' },

  // === KLAIPĖDA – Psichologai ===
  { name: 'VPPC Klaipėdos skyrius', city: 'Klaipėda', region: 'Klaipėdos apskritis', specialty: 'Psichologas', clinic: 'Vilniaus psichoterapijos centras', website: 'https://vppc.lt', description: 'Psichologinė pagalba vaikams, paaugliams ir šeimoms Klaipėdoje.' },
  { name: '„Vaiko raida" pagalbos centras', city: 'Klaipėda', region: 'Klaipėdos apskritis', specialty: 'Psichologas', description: 'Pagalbos vaikui ir šeimai centras Klaipėdoje.' },
  { name: 'VŠĮ „Testas" – raidos vertinimas', city: 'Klaipėda', region: 'Klaipėdos apskritis', specialty: 'Vaiko raidos specialistas', description: 'Vaikų raidos sutrikimų ankstyvoji reabilitacija, raidos vertinimas, psichologas komandoje.' },

  // === KLAIPĖDA – Kineziterapeutai ===
  { name: '„Nefridos Reabilitacija" – vaikų kineziterapija', city: 'Klaipėda', region: 'Klaipėdos apskritis', specialty: 'Kineziterapeutas', website: 'https://nefridosreabilitacija.lt', description: 'Vaikų kineziterapija – kūdikių ir vaikų fizinė būklė, psichologinė savijauta, vystymosi raida.' },
  { name: '„Pajūrio hipoterapija"', city: 'Klaipėda', region: 'Klaipėdos apskritis', specialty: 'Kineziterapeutas', website: 'https://hipoterapija.com', description: 'Specializuotos hipoterapijos ir kineziterapijos paslaugos vaikams.' },
  { name: 'Empatija vaikų ir jaunimo klinika', city: 'Klaipėda', region: 'Klaipėdos apskritis', specialty: 'Kineziterapeutas', clinic: 'Empatija klinika', website: 'https://vaikuklinika.empatija.lt', description: 'Vaikų kineziterapijos ir kitos sveikatos paslaugos Klaipėdoje.' },
  { name: 'Šeimos gerovės centras Klaipėda', city: 'Klaipėda', region: 'Klaipėdos apskritis', specialty: 'Vaiko raidos specialistas', website: 'https://seimosgerovescentras.lt', description: 'Vaikų sveikatingumas nuo nėštumo iki 5 metų – užsiėmimai vandenyje ir kitos programos.' },
  { name: 'Ankstyvosios reabilitacijos centras Klaipėda', city: 'Klaipėda', region: 'Klaipėdos apskritis', specialty: 'Vaiko raidos specialistas', description: 'Ankstyvasis raidos sutrikimų nustatymas ir kompleksinė pagalba vaikams nuo 0 iki 7 metų.' },

  // === ŠIAULIAI ===
  { name: 'Šiaulių vaikų reabilitacijos centras', city: 'Šiauliai', region: 'Šiaulių apskritis', specialty: 'Kineziterapeutas', description: 'Vaikų reabilitacija ir kineziterapija Šiauliuose.' },
  { name: 'Šiaulių logopedinis centras', city: 'Šiauliai', region: 'Šiaulių apskritis', specialty: 'Logopedas', description: 'Logopedinės paslaugos vaikams Šiauliuose.' },
  { name: 'Šiaulių vaikų psichologas', city: 'Šiauliai', region: 'Šiaulių apskritis', specialty: 'Psichologas', description: 'Psichologinės konsultacijos vaikams ir paaugliams Šiauliuose.' },

  // === PANEVĖŽYS ===
  { name: 'Panevėžio vaikų reabilitacijos centras', city: 'Panevėžys', region: 'Panevėžio apskritis', specialty: 'Kineziterapeutas', description: 'Vaikų kineziterapija ir reabilitacija Panevėžyje.' },
  { name: 'Panevėžio logopedas vaikams', city: 'Panevėžys', region: 'Panevėžio apskritis', specialty: 'Logopedas', description: 'Logopedinės paslaugos vaikams Panevėžyje.' },
  { name: 'Panevėžio vaikų psichologas', city: 'Panevėžys', region: 'Panevėžio apskritis', specialty: 'Psichologas', description: 'Psichologinė pagalba vaikams ir šeimoms Panevėžyje.' },

  // === ALYTUS ===
  { name: 'Alytaus vaiko raidos centras', city: 'Alytus', region: 'Alytaus apskritis', specialty: 'Vaiko raidos specialistas', description: 'Vaiko raidos vertinimas ir reabilitacija Alytuje.' },

  // === MARIJAMPOLĖ ===
  { name: 'Marijampolės logopedas vaikams', city: 'Marijampolė', region: 'Marijampolės apskritis', specialty: 'Logopedas', description: 'Logopedinė pagalba vaikams Marijampolėje.' },

  // === UTENA ===
  { name: 'Utenos vaikų psichologas', city: 'Utena', region: 'Utenos apskritis', specialty: 'Psichologas', description: 'Psichologinė pagalba vaikams Utenoje.' },

  // === DRUSKININKAI ===
  { name: 'Druskininkų reabilitacijos centras – vaikai', city: 'Druskininkai', region: 'Alytaus apskritis', specialty: 'Kineziterapeutas', description: 'Vaikų reabilitacija ir kineziterapija Druskininkuose.' },
];

async function main() {
  const data = specialists.map(s => ({
    slug: slug(s.name),
    name: s.name,
    city: s.city,
    region: s.region || null,
    area: s.area || null,
    specialty: s.specialty || null,
    clinic: s.clinic || null,
    price: s.price || null,
    phone: s.phone || null,
    website: s.website || null,
    languages: s.languages || null,
    description: s.description || null,
    baseRating: 0,
    baseReviewCount: 0,
  }));

  const seen = new Set();
  const unique = data.filter(d => {
    if (seen.has(d.slug)) return false;
    seen.add(d.slug);
    return true;
  });

  const result = await prisma.specialist.createMany({ data: unique, skipDuplicates: true });
  console.log(`Inserted ${result.count} specialists!`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
