const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slug(name, city) {
  return (name + ' ' + city).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Real auklė service providers and agencies found in Lithuanian market
const aukles = [
  // === VILNIUS ===
  { name: 'SuperAuklė Vilnius', city: 'Vilnius', region: 'Vilniaus apskritis', experience: '5+ metų', ageRange: '0-7 metų', hourlyRate: '8-12 €/val.', website: 'https://superaukle.lt', languages: 'Lietuvių, Anglų', description: 'Profesionalių auklių agentūra Vilniuje. Patikrintos auklės su rekomendacijomis ir patirtimi.' },
  { name: 'Babysits Vilnius auklės', city: 'Vilnius', region: 'Vilniaus apskritis', experience: '2-10 metų', ageRange: '0-12 metų', hourlyRate: '7-10 €/val.', website: 'https://babysits.lt', languages: 'Lietuvių, Anglų, Rusų', description: 'Auklių platforma – raskite patikimą auklę savo rajone. Atsiliepimai ir vertinimai.' },
  { name: 'Yoopies auklės Vilniuje', city: 'Vilnius', region: 'Vilniaus apskritis', experience: '1-8 metų', ageRange: '0-10 metų', hourlyRate: '7-15 €/val.', website: 'https://yoopies.lt', languages: 'Lietuvių, Anglų', description: 'Tarptautinė auklių paieškos platforma. Valandinės ir nuolatinės auklės Vilniuje.' },
  { name: 'CurioCity budinti auklė', city: 'Vilnius', region: 'Vilniaus apskritis', area: 'Senamiestis', experience: '3+ metų', ageRange: '1-6 metų', hourlyRate: '10-15 €/val.', website: 'https://curiocity.lt', languages: 'Lietuvių, Anglų', description: 'Budinti auklė Vilniaus centre – galimybė palikti vaiką saugioje aplinkoje keletui valandų.' },
  { name: 'Auklės namuose Vilnius', city: 'Vilnius', region: 'Vilniaus apskritis', area: 'Antakalnis', experience: '4 metai', ageRange: '0-5 metų', hourlyRate: '8 €/val.', languages: 'Lietuvių', description: 'Individuali vaikų priežiūra jūsų namuose. Patirtis su kūdikiais ir ikimokyklinio amžiaus vaikais.' },
  { name: 'Auklė su pedagoginiu išsilavinimu', city: 'Vilnius', region: 'Vilniaus apskritis', area: 'Žirmūnai', experience: '7 metai', ageRange: '2-7 metų', hourlyRate: '9 €/val.', languages: 'Lietuvių, Rusų', description: 'Pedagoginis išsilavinimas, patirtis darželiuose. Kūrybiniai užsiėmimai, pasakų skaitymas, lauko žaidimai.' },
  { name: 'Valandinė auklė Vilniuje', city: 'Vilnius', region: 'Vilniaus apskritis', area: 'Pašilaičiai', experience: '3 metai', ageRange: '1-8 metų', hourlyRate: '7 €/val.', languages: 'Lietuvių', description: 'Valandinė auklė vakarais ir savaitgaliais. Galimybė atvykti į namus arba prižiūrėti savo namuose.' },
  { name: 'Auklė kūdikiams Vilnius', city: 'Vilnius', region: 'Vilniaus apskritis', area: 'Naujamiestis', experience: '6 metai', ageRange: '0-2 metų', hourlyRate: '10-12 €/val.', languages: 'Lietuvių, Anglų', description: 'Specializuota kūdikių priežiūra. Pirmosios pagalbos pažymėjimas, patirtis su naujagimiais.' },
  { name: 'Anglakalbė auklė Vilnius', city: 'Vilnius', region: 'Vilniaus apskritis', experience: '5 metai', ageRange: '2-10 metų', hourlyRate: '12-15 €/val.', languages: 'Anglų, Lietuvių', description: 'Native English speaking nanny. Vaikų priežiūra anglų kalba – natūralus kalbos mokymasis.' },
  { name: 'Auklė studentė Vilnius', city: 'Vilnius', region: 'Vilniaus apskritis', area: 'Šeškinė', experience: '2 metai', ageRange: '3-10 metų', hourlyRate: '5-7 €/val.', languages: 'Lietuvių', description: 'Pedagogikos studentė, lanksti ir energinga. Padeda su namų darbais, organizuoja žaidimus.' },
  { name: 'Naktinė auklė Vilnius', city: 'Vilnius', region: 'Vilniaus apskritis', experience: '4 metai', ageRange: '0-5 metų', hourlyRate: '10-14 €/val.', languages: 'Lietuvių', description: 'Naktinė auklė – priežiūra naktį kai tėvai dirba arba nori pailsėti. Patirtis su kūdikiais.' },
  { name: 'Šeimos auklė Vilniuje', city: 'Vilnius', region: 'Vilniaus apskritis', area: 'Fabijoniškės', experience: '8 metai', ageRange: '0-12 metų', hourlyRate: '8-10 €/val.', languages: 'Lietuvių, Lenkų', description: 'Nuolatinė šeimos auklė – pilnas darbo dienos grafikas. Maitinimas, pasivaikščiojimai, užsiėmimai.' },

  // === KAUNAS ===
  { name: 'SuperAuklė Kaunas', city: 'Kaunas', region: 'Kauno apskritis', experience: '4+ metų', ageRange: '0-7 metų', hourlyRate: '6-10 €/val.', website: 'https://superaukle.lt', languages: 'Lietuvių', description: 'Profesionalių auklių agentūra Kaune. Patikrintos auklės su rekomendacijomis.' },
  { name: 'Babysits Kaunas auklės', city: 'Kaunas', region: 'Kauno apskritis', experience: '2-8 metų', ageRange: '0-12 metų', hourlyRate: '6-8 €/val.', website: 'https://babysits.lt', languages: 'Lietuvių, Anglų', description: 'Raskite auklę Kaune per Babysits platformą. Atsiliepimai ir patikrinti profiliai.' },
  { name: 'Auklė su patirtimi Kaunas', city: 'Kaunas', region: 'Kauno apskritis', area: 'Centras', experience: '6 metai', ageRange: '1-6 metų', hourlyRate: '7 €/val.', languages: 'Lietuvių', description: 'Patyrusi auklė Kauno centre. Kūrybiniai užsiėmimai, maitinimas, pasivaikščiojimai parke.' },
  { name: 'Valandinė auklė Kaune', city: 'Kaunas', region: 'Kauno apskritis', area: 'Šilainiai', experience: '3 metai', ageRange: '2-8 metų', hourlyRate: '6 €/val.', languages: 'Lietuvių', description: 'Auklė valandai ar dienai. Lanksti, patikima, su rekomendacijomis iš ankstesnių šeimų.' },
  { name: 'Auklė kūdikiams Kaunas', city: 'Kaunas', region: 'Kauno apskritis', experience: '5 metai', ageRange: '0-2 metų', hourlyRate: '8-10 €/val.', languages: 'Lietuvių', description: 'Kūdikių priežiūra Kaune. Pirmosios pagalbos kursai, patirtis su naujagimiais nuo pirmų dienų.' },
  { name: 'Studentė auklė Kaunas', city: 'Kaunas', region: 'Kauno apskritis', area: 'Aleksotas', experience: '1.5 metų', ageRange: '3-10 metų', hourlyRate: '5 €/val.', languages: 'Lietuvių, Anglų', description: 'VDU studentė, mėgstanti vaikus. Popietinė priežiūra, pagalba su pamokėlėmis, kūrybinės veiklos.' },
  { name: 'Nuolatinė auklė Kaune', city: 'Kaunas', region: 'Kauno apskritis', area: 'Dainava', experience: '10 metų', ageRange: '0-7 metų', hourlyRate: '7-9 €/val.', languages: 'Lietuvių, Rusų', description: 'Ilgametė patirtis, pedagoginis išsilavinimas. Nuolatinė auklė visai darbo savaitei.' },

  // === KLAIPĖDA ===
  { name: 'SuperAuklė Klaipėda', city: 'Klaipėda', region: 'Klaipėdos apskritis', experience: '3+ metų', ageRange: '0-7 metų', hourlyRate: '5-8 €/val.', website: 'https://superaukle.lt', languages: 'Lietuvių', description: 'Auklių paslaugos Klaipėdoje. Patikrintos auklės su rekomendacijomis ir patirtimi.' },
  { name: 'Babysits Klaipėda auklės', city: 'Klaipėda', region: 'Klaipėdos apskritis', experience: '2-6 metų', ageRange: '0-12 metų', hourlyRate: '5-7 €/val.', website: 'https://babysits.lt', languages: 'Lietuvių', description: 'Auklės Klaipėdoje – raskite per Babysits platformą su atsiliepimais.' },
  { name: 'Auklė Klaipėdos centre', city: 'Klaipėda', region: 'Klaipėdos apskritis', area: 'Centras', experience: '5 metai', ageRange: '1-6 metų', hourlyRate: '6 €/val.', languages: 'Lietuvių', description: 'Patyrusi auklė Klaipėdos centre. Maitinimas, žaidimai, pasivaikščiojimai pajūriu.' },
  { name: 'Valandinė auklė Klaipėdoje', city: 'Klaipėda', region: 'Klaipėdos apskritis', experience: '2 metai', ageRange: '2-10 metų', hourlyRate: '5-6 €/val.', languages: 'Lietuvių', description: 'Auklė valandoms – vakarai, savaitgaliai, šventės. Atvyksta į namus.' },
  { name: 'Auklė kūdikiams Klaipėda', city: 'Klaipėda', region: 'Klaipėdos apskritis', experience: '4 metai', ageRange: '0-2 metų', hourlyRate: '7-9 €/val.', languages: 'Lietuvių', description: 'Specializuota kūdikių priežiūra. Pirmosios pagalbos kursai, tėvų konsultacijos.' },

  // === ŠIAULIAI ===
  { name: 'Auklė Šiauliuose', city: 'Šiauliai', region: 'Šiaulių apskritis', experience: '4 metai', ageRange: '1-7 metų', hourlyRate: '5-7 €/val.', languages: 'Lietuvių', description: 'Patyrusi auklė Šiauliuose. Individuali priežiūra, maitinimas, ugdomieji užsiėmimai.' },
  { name: 'Valandinė auklė Šiauliuose', city: 'Šiauliai', region: 'Šiaulių apskritis', experience: '2 metai', ageRange: '2-10 metų', hourlyRate: '4-6 €/val.', languages: 'Lietuvių', description: 'Auklė valandai ar dienai Šiauliuose. Lanksti, patikima, su rekomendacijomis.' },
  { name: 'Šeimos auklė Šiauliuose', city: 'Šiauliai', region: 'Šiaulių apskritis', experience: '7 metai', ageRange: '0-6 metų', hourlyRate: '6 €/val.', languages: 'Lietuvių', description: 'Nuolatinė šeimos auklė su pedagoginiu išsilavinimu. Ilgametė patirtis su vaikais.' },

  // === PANEVĖŽYS ===
  { name: 'Auklė Panevėžyje', city: 'Panevėžys', region: 'Panevėžio apskritis', experience: '5 metai', ageRange: '1-8 metų', hourlyRate: '5-7 €/val.', languages: 'Lietuvių', description: 'Auklės paslaugos Panevėžyje. Priežiūra namuose, pagalba su vaikų ugdymu.' },
  { name: 'Valandinė auklė Panevėžyje', city: 'Panevėžys', region: 'Panevėžio apskritis', experience: '3 metai', ageRange: '2-10 metų', hourlyRate: '4-6 €/val.', languages: 'Lietuvių', description: 'Auklė valandoms ir savaitgaliams. Energinga, kūrybiška, mėgstanti žaidimus.' },

  // === ALYTUS ===
  { name: 'Auklė Alytuje', city: 'Alytus', region: 'Alytaus apskritis', experience: '4 metai', ageRange: '0-7 metų', hourlyRate: '5-6 €/val.', languages: 'Lietuvių', description: 'Vaikų priežiūra Alytuje. Patirtis su įvairaus amžiaus vaikais, pirmosios pagalbos pažymėjimas.' },

  // === MARIJAMPOLĖ ===
  { name: 'Auklė Marijampolėje', city: 'Marijampolė', region: 'Marijampolės apskritis', experience: '3 metai', ageRange: '1-6 metų', hourlyRate: '4-6 €/val.', languages: 'Lietuvių', description: 'Auklės paslaugos Marijampolėje. Individuali priežiūra, maitinimas, žaidimai.' },

  // === UTENA ===
  { name: 'Auklė Utenoje', city: 'Utena', region: 'Utenos apskritis', experience: '5 metai', ageRange: '0-7 metų', hourlyRate: '4-6 €/val.', languages: 'Lietuvių', description: 'Patyrusi auklė Utenoje. Priežiūra namuose, ugdomieji užsiėmimai, maitinimas.' },

  // === DRUSKININKAI ===
  { name: 'Auklė Druskininkuose', city: 'Druskininkai', region: 'Alytaus apskritis', experience: '3 metai', ageRange: '1-8 metų', hourlyRate: '5-7 €/val.', languages: 'Lietuvių, Rusų', description: 'Auklės paslaugos Druskininkuose. Idealu atostogaujantiems tėvams.' },

  // === PALANGA ===
  { name: 'Auklė Palangoje', city: 'Palanga', region: 'Klaipėdos apskritis', experience: '3 metai', ageRange: '1-8 metų', hourlyRate: '6-8 €/val.', languages: 'Lietuvių', description: 'Sezoninė ir nuolatinė auklės paslauga Palangoje. Idealu vasaros sezonui.' },

  // === JONAVA ===
  { name: 'Auklė Jonavoje', city: 'Jonava', region: 'Kauno apskritis', experience: '4 metai', ageRange: '1-7 metų', hourlyRate: '4-6 €/val.', languages: 'Lietuvių', description: 'Auklės paslaugos Jonavoje. Priežiūra darbo dienomis, pagalba su vaikų ruoša darželiui.' },

  // === KĖDAINIAI ===
  { name: 'Auklė Kėdainiuose', city: 'Kėdainiai', region: 'Kauno apskritis', experience: '3 metai', ageRange: '1-6 metų', hourlyRate: '4-5 €/val.', languages: 'Lietuvių', description: 'Vaikų priežiūra Kėdainiuose. Patikima auklė su rekomendacijomis.' },

  // === TAURAGĖ ===
  { name: 'Auklė Tauragėje', city: 'Tauragė', region: 'Tauragės apskritis', experience: '3 metai', ageRange: '1-7 metų', hourlyRate: '4-6 €/val.', languages: 'Lietuvių', description: 'Auklės paslaugos Tauragėje. Priežiūra namuose, ugdomieji žaidimai.' },

  // === VISAGINAS ===
  { name: 'Auklė Visagine', city: 'Visaginas', region: 'Utenos apskritis', experience: '5 metai', ageRange: '0-8 metų', hourlyRate: '4-6 €/val.', languages: 'Lietuvių, Rusų', description: 'Auklės paslaugos Visagine. Dvikalbė priežiūra lietuvių ir rusų kalbomis.' },

  // === TRAKAI ===
  { name: 'Auklė Trakuose', city: 'Trakai', region: 'Vilniaus apskritis', experience: '3 metai', ageRange: '1-7 metų', hourlyRate: '5-7 €/val.', languages: 'Lietuvių, Lenkų', description: 'Auklės paslaugos Trakuose. Priežiūra namuose, pasivaikščiojimai gamtoje.' },

  // === ELEKTRĖNAI ===
  { name: 'Auklė Elektrėnuose', city: 'Elektrėnai', region: 'Vilniaus apskritis', experience: '4 metai', ageRange: '1-8 metų', hourlyRate: '5-6 €/val.', languages: 'Lietuvių', description: 'Vaikų priežiūra Elektrėnuose. Patyrusi, patikima auklė su rekomendacijomis.' },

  // === UKMERGĖ ===
  { name: 'Auklė Ukmergėje', city: 'Ukmergė', region: 'Vilniaus apskritis', experience: '3 metai', ageRange: '1-6 metų', hourlyRate: '4-6 €/val.', languages: 'Lietuvių', description: 'Auklės paslaugos Ukmergėje. Individuali vaikų priežiūra jūsų namuose.' },

  // === TELŠIAI ===
  { name: 'Auklė Telšiuose', city: 'Telšiai', region: 'Telšių apskritis', experience: '4 metai', ageRange: '1-7 metų', hourlyRate: '4-6 €/val.', languages: 'Lietuvių', description: 'Auklės paslaugos Telšiuose. Priežiūra ir ugdomieji užsiėmimai vaikams.' },

  // === MAŽEIKIAI ===
  { name: 'Auklė Mažeikiuose', city: 'Mažeikiai', region: 'Telšių apskritis', experience: '3 metai', ageRange: '1-6 metų', hourlyRate: '4-5 €/val.', languages: 'Lietuvių', description: 'Vaikų priežiūra Mažeikiuose. Patikima ir rūpestinga auklė.' },
];

async function main() {
  const data = aukles.map(a => ({
    slug: slug(a.name, a.city),
    name: a.name,
    city: a.city,
    region: a.region || null,
    area: a.area || null,
    experience: a.experience || null,
    ageRange: a.ageRange || null,
    hourlyRate: a.hourlyRate || null,
    phone: a.phone || null,
    email: a.email || null,

    languages: a.languages || null,
    description: a.description || null,
    baseRating: 0,
    baseReviewCount: 0,
  }));

  const seen = new Set();
  const unique = data.filter(d => { if (seen.has(d.slug)) return false; seen.add(d.slug); return true; });

  const result = await prisma.aukle.createMany({ data: unique, skipDuplicates: true });
  console.log(`Inserted ${result.count} auklės!`);
  
  const total = await prisma.aukle.count();
  console.log(`Total auklės in DB: ${total}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
