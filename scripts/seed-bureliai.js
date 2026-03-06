const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const bureliai = [
  // === VILNIUS ===
  // Robotika
  { name: 'Robotikos akademija', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Robotika', ageRange: '4-12 metų', website: 'https://robotikosakademija.lt', description: 'Technologiniai būreliai vaikams – LEGO Education robotų konstravimas ir programavimas. Lavina loginį ir erdvinį mąstymą.' },
  { name: 'Robotikos mokykla', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Robotika', ageRange: '6-16 metų', website: 'https://robotikosmokykla.lt', description: 'STEAM inovatorių, dirbtinio intelekto ir inžinerijos būreliai. Programavimas, mechanika, elektronika.' },
  { name: 'Jaunųjų mokslininkų akademija', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Robotika', ageRange: '5-6 metų', website: 'https://jmakademija.lt', description: 'Robotika mažiesiems – per žaidimą supažindinama su technologijų pasauliu, LEGO BricQ rinkiniai.' },
  // Šokiai
  { name: 'Sportinių šokių klubas „Ratuto"', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Šokiai', ageRange: '3-18 metų', website: 'https://ratuto.lt', description: 'Hip Hop, sportiniai šokiai, breikas, šiuolaikiniai šokiai, Solo Latino, K-POP.' },
  { name: 'PrimeTime Kids šokių studija', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Šokiai', ageRange: '4-15 metų', website: 'https://primetimekids.lt', description: 'Šokių pamokos vaikams – kas du mėnesius naujos programos, įvairūs šiuolaikinio šokio stiliai.' },
  { name: '„Mažieji Stebuklai" šokių grupės', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Šokiai', ageRange: '2-10 metų', website: 'https://maziejistebuklai.lt', description: 'Šokių grupės vaikams – lavinama koordinacija ir disciplina.' },
  { name: 'SVJC šokių būreliai', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Šokiai', ageRange: '5-18 metų', website: 'https://svjc.lt', description: 'Lindy Hop, gatvės šokiai, Hip-Hop, baletas, šiuolaikinis šokis, flamenko, tautiniai šokiai.' },
  { name: 'VMKMC Choreografijos mokykla „Nuotaika"', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Šokiai', ageRange: '3-18 metų', website: 'https://vmkmc.lt', description: 'Choreografijos mokykla ir baleto studija vaikams.' },
  // Muzika
  { name: 'SVJC muzikos būreliai', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Muzika', ageRange: '5-18 metų', website: 'https://svjc.lt', description: 'Muzikinis teatriukas, DJ mokykla, ukulėlė, gitara, vokalinė studija KIVI.' },
  { name: 'Menų mokyklėlė „Debesėliai"', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Muzika', ageRange: '0-7 metų', website: 'https://debeseliai.lt', description: 'Muzikos ir judesio užsiėmimai kūdikiams, individualios fortepijono, kanklių, dainavimo pamokos.' },
  { name: 'VMKMC muzikos pamokos', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Muzika', ageRange: '4-18 metų', website: 'https://vmkmc.lt', description: 'Ankstyvasis muzikinis ugdymas, dainavimas, fortepijonas, smuikas, gitara.' },
  { name: 'Klubas „Verdenė" muzikos studijos', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Muzika', ageRange: '6-18 metų', website: 'https://klubasverdene.lt', description: 'Dainavimo ir gitaros studijos vaikams ir jaunimui.' },
  // Dailė
  { name: 'Dali akademija', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Dailė', ageRange: '6-16 metų', website: 'https://akademijadali.lt', description: 'Dailės ir tapybos būreliai, akademinis piešimas, skaitmeninis piešimas vaikams.' },
  { name: 'Klubas „Klevas" dailės būrelis', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Dailė', ageRange: '6-18 metų', website: 'https://klubasklevas.lt', description: 'Piešimas, keramika, siuvimas ir dizainas. Parodos ir konkursai.' },
  { name: '„Po Mokyklos" dailės būreliai', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Dailė', ageRange: '7-18 metų', website: 'https://pomokyklos.lt', description: 'Dailės ir tapybos būreliai, pirma pamoka nemokama. Registracija ištisus metus.' },
  { name: 'SVJC keramikos būrelis', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Dailė', ageRange: '5-18 metų', website: 'https://svjc.lt', description: 'Keramikos užsiėmimai – įvairios technologijos ir formavimo būdai.' },
  // Sportas
  { name: 'SVJC „Mažųjų sportas"', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Sportas', ageRange: '3-8 metų', website: 'https://svjc.lt', description: 'Per žaidimus ir estafetes vaikai susipažįsta su skirtingomis sporto šakomis. Taip pat dziudo.' },
  { name: 'Vaikų krepšinis Vilniuje', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Sportas', ageRange: '5-12 metų', website: 'https://krepsinis.pro', description: 'Krepšinio ir sporto būreliai berniukams ir mergaitėms Vilniuje.' },
  { name: 'Vaikų sporto centras „Strakaliukas" Vilnius', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Sportas', ageRange: '1-8 metų', website: 'https://strakaliukas.lt', description: 'Aktyvūs sportiniai užsiėmimai – vaikai mokosi per žaidimus ir atranda sporto džiaugsmą.' },
  { name: 'Krokodiliuko akrobatikos mokykla', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Sportas', ageRange: '3-14 metų', website: 'https://vilniusoutlet.lt/burelis', description: 'Akrobatikos pamokos vaikams Vilnius Outlet centre.' },
  { name: 'Vilniaus parkūro akademija', city: 'Vilnius', region: 'Vilniaus apskritis', category: 'Sportas', ageRange: '6-16 metų', website: 'https://vilniusoutlet.lt/burelis', description: 'Parkūro treniruotės vaikams ir paaugliams.' },
  { name: 'Žirmūnų klubas – sporto akademija', city: 'Vilnius', region: 'Vilniaus apskritis', area: 'Žirmūnai', category: 'Sportas', ageRange: '5-18 metų', website: 'https://zirmunuklubas.lt', description: 'Sporto akademija, rytų kovos menai, gimnastika ir šachmatai.' },

  // === KAUNAS ===
  // Robotika
  { name: 'Robotikos akademija Kaunas', city: 'Kaunas', region: 'Kauno apskritis', category: 'Robotika', ageRange: '4-10 metų', website: 'https://robotikosakademija.lt/bureliai', description: 'LEGO Education robotikos būreliai 4-6 ir 7-10 metų vaikams Kaune.' },
  { name: 'KMTKC technologijų būreliai', city: 'Kaunas', region: 'Kauno apskritis', category: 'Robotika', ageRange: '7-18 metų', website: 'https://mtkc.lt', description: 'Kauno moksleivių techninės kūrybos centras – robotika, inžinerija, technologijos. NVŠ krepšelis.' },
  { name: 'Robotikos mokykla Kaunas', city: 'Kaunas', region: 'Kauno apskritis', category: 'Robotika', ageRange: '6-16 metų', website: 'https://robotikosmokykla.lt', description: 'STEAM inovatoriai, inžinerija, dronų kūrimas, dirbtinio intelekto būreliai.' },
  { name: 'Bricks4Kidz Kaunas', city: 'Kaunas', region: 'Kauno apskritis', category: 'Robotika', ageRange: '4-12 metų', website: 'https://bricks4kidz.lt/bureliai', description: 'LEGO robotikos užsiėmimai – kūrybiškumas, erdvinis mąstymas, inžinerijos principai.' },
  { name: 'Edulando STEAM būreliai', city: 'Kaunas', region: 'Kauno apskritis', category: 'STEM', ageRange: '3-12 metų', website: 'https://edulando.lt', description: 'STEAM ir robotikos būreliai ikimokyklinio ir mokyklinio amžiaus vaikams Kaune.' },
  // Šokiai
  { name: 'Šokių studija „Me Gusta"', city: 'Kaunas', region: 'Kauno apskritis', category: 'Šokiai', ageRange: '4-18 metų', website: 'https://megusta.lt', description: 'Gatvės šokiai, breikas ir pop šokiai vaikams nuo 4 metų.' },
  { name: 'Šokių studija „GaDanza"', city: 'Kaunas', region: 'Kauno apskritis', category: 'Šokiai', ageRange: '3-18 metų', website: 'https://gadanza.lt', description: 'Klasikiniai ir Lotynų Amerikos šokiai mergaitėms ir berniukams nuo 3-4 metų.' },
  { name: 'No-name Studija', city: 'Kaunas', region: 'Kauno apskritis', category: 'Šokiai', ageRange: '6-18 metų', website: 'https://no-name.lt', description: 'Hip hop, heels, commercial, dancehall – gatvės šokių treniruotės vaikams ir paaugliams.' },
  { name: '„Ballare Loft" baleto studija', city: 'Kaunas', region: 'Kauno apskritis', category: 'Šokiai', ageRange: '3-9 metų', website: 'https://ballare.lt', description: 'Baleto pamokos mergaitėms, šokių ir kūrybos stovyklos.' },
  { name: 'Šokių studija „SAMBA"', city: 'Kaunas', region: 'Kauno apskritis', category: 'Šokiai', ageRange: '5-18 metų', website: 'https://sambasokiai.lt', description: 'Pramoginiai ir sportiniai šokiai vaikams ir jaunimui.' },
  // Sportas
  { name: 'Vaikų sporto centras „Strakaliukas" Kaunas', city: 'Kaunas', region: 'Kauno apskritis', category: 'Sportas', ageRange: '0.5-8 metų', website: 'https://strakaliukas.lt', description: 'Sporto užsiėmimai vaikams nuo 6 mėnesių iki 8+ metų, bendri sporto ir oro akrobatika.' },
  { name: '„International Gym" Kaunas', city: 'Kaunas', region: 'Kauno apskritis', category: 'Sportas', ageRange: '1.5-16 metų', website: 'https://intergym.lt', description: 'Gimnastikos treniruotės įvairaus amžiaus vaikams, vasaros stovyklos.' },
  { name: '„Startukas" treniruotės Kaune', city: 'Kaunas', region: 'Kauno apskritis', category: 'Sportas', ageRange: '2-13 metų', website: 'https://startukas.lt', description: 'Fizinio pasirengimo treniruotės aktyviems vaikams.' },
  { name: 'Kartlando mokykla', city: 'Kaunas', region: 'Kauno apskritis', category: 'Sportas', ageRange: '7-18 metų', website: 'https://kartlandas.lt', description: 'Kartingo užsiėmimai vaikams ir paaugliams Kaune.' },
  { name: 'TEMPLE KIDS lengvoji atletika', city: 'Kaunas', region: 'Kauno apskritis', category: 'Sportas', ageRange: '5-10 metų', website: 'https://uzjudek.lt', description: 'Lengvosios atletikos būreliai mažiesiems Kaune.' },

  // === KLAIPĖDA ===
  // Robotika
  { name: 'Robotikos būrelis „Sensorius"', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Robotika', ageRange: '7-12 metų', website: 'https://kvlc.lt', description: 'Robotikos būrelis Klaipėdos vaikų laisvalaikio centre.' },
  { name: 'Robotikos būrelis „Legotika"', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Robotika', ageRange: '7-12 metų', website: 'https://kvlc.lt', description: 'LEGO robotikos būrelis 1-5 klasių mokiniams Klaipėdoje.' },
  { name: 'Robotikos studija Klaipėda', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Robotika', ageRange: '5-12 metų', website: 'https://robotikosstudija.lt', description: 'Robotikos būreliai ir vasaros stovyklos Klaipėdos mieste ir regione.' },
  { name: '„Šviesos vaikai" robotikos būrelis', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Robotika', ageRange: '5-12 metų', website: 'https://sviesosvaikai.lt', description: 'Robotikos būrelis skatinantis loginį mąstymą ir kūrybiškumą.' },
  { name: 'Jaunimo dirbtuvės Klaipėda', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Robotika', ageRange: '8-16 metų', description: 'Programavimas, robotų kūrimas ir 3D spausdinimas be LEGO konstruktorių.' },
  // Šokiai
  { name: 'Vaikų šokių studija „Junga"', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Šokiai', ageRange: '5-19 metų', website: 'https://kkljc.lt', description: 'Šiuolaikinio, klasikinio ir sportinio šokio studija Klaipėdos jaunimo centre.' },
  { name: 'Šokio būrelis „Švyturiukai"', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Šokiai', ageRange: '4-12 metų', website: 'https://kvlc.lt', description: 'Šokių būrelis įvairioms amžiaus grupėms Klaipėdos laisvalaikio centre.' },
  { name: '„Intenso" šokių studija', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Šokiai', ageRange: '3-18 metų', website: 'https://paslaugos.lt/intenso-sokiu-studija-io125', description: 'Sportiniai šokiai vaikams nuo 3 metų Klaipėdoje.' },
  { name: 'Šokių studija „Žingsnis"', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Šokiai', ageRange: '4-18 metų', website: 'https://zingsnis.net', description: 'Sportiniai šokiai, breikas, baletas, gatvės ir disko šokiai.' },
  { name: '„Hatora" šokių mokykla', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Šokiai', ageRange: '3-14 metų', website: 'https://hatora.lt', description: 'Muzikinių žaidimų pamokos mažiesiems ir Pop dance šokiai vaikams.' },
  { name: 'Šokių klubas „Danė"', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Šokiai', ageRange: '5-16 metų', website: 'https://sokiuklubasdane.lt', description: 'Sportiniai, pop, hip hop, breiko ir tautiniai šokiai. Vasaros stovyklos.' },
  // Sportas
  { name: '„Startukas" treniruotės Klaipėdoje', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Sportas', ageRange: '2-10 metų', website: 'https://startukas.lt/treniruotes-vaikams-klaipedoje', description: 'Grupinės treniruotės – fizinė ištvermė, greitumas, vikrumas.' },
  { name: '„Baltic Power" vaikų treniruotės', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Sportas', ageRange: '4-12 metų', website: 'https://balticpower.co.uk', description: 'Aktyvios treniruotės pagal IAAF Kids Athletics programą.' },
  { name: '„Ginsvė" jogos ir pilateso studija vaikams', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Sportas', ageRange: '5-14 metų', website: 'https://ginsve.lt', description: 'Jogos ir pilateso užsiėmimai vaikams Klaipėdoje.' },
  { name: '„Dragūnas Fitness" vaikų fitnesas', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Sportas', ageRange: '8-17 metų', website: 'https://pauliusdragunas.lt', description: 'Kikbokso elementai, laikysenos stiprinimas, raumenų ugdymas.' },
  { name: 'Klaipėdos baseinas – plaukimo pamokos', city: 'Klaipėda', region: 'Klaipėdos apskritis', category: 'Sportas', ageRange: '4-16 metų', website: 'https://klaipedosbaseinas.lt', description: 'Plaukimo pamokos įvairaus amžiaus vaikams Klaipėdos baseine.' },

  // === ŠIAULIAI ===
  { name: 'Šiaulių moksleivių namai – robotika', city: 'Šiauliai', region: 'Šiaulių apskritis', category: 'Robotika', ageRange: '7-16 metų', description: 'Robotikos ir technologijų būreliai Šiaulių moksleivių namuose.' },
  { name: 'Šiaulių sportinių šokių klubas „Saulė"', city: 'Šiauliai', region: 'Šiaulių apskritis', category: 'Šokiai', ageRange: '4-18 metų', description: 'Sportiniai šokiai vaikams ir jaunimui Šiauliuose.' },
  { name: 'Šiaulių dailės galerija – vaikų studija', city: 'Šiauliai', region: 'Šiaulių apskritis', category: 'Dailė', ageRange: '5-16 metų', description: 'Dailės ir kūrybos užsiėmimai vaikams Šiauliuose.' },
  { name: 'Šiaulių plaukimo mokykla', city: 'Šiauliai', region: 'Šiaulių apskritis', category: 'Sportas', ageRange: '5-16 metų', description: 'Plaukimo treniruotės vaikams Šiaulių baseinuose.' },
  { name: 'Šiaulių muzikos mokykla – vaikų chorai', city: 'Šiauliai', region: 'Šiaulių apskritis', category: 'Muzika', ageRange: '6-18 metų', description: 'Chorai, instrumentų pamokos ir muzikinis ugdymas Šiauliuose.' },

  // === PANEVĖŽYS ===
  { name: 'Panevėžio vaikų ir jaunimo klubas – robotika', city: 'Panevėžys', region: 'Panevėžio apskritis', category: 'Robotika', ageRange: '7-14 metų', description: 'Robotikos ir programavimo būreliai Panevėžyje.' },
  { name: 'Panevėžio šokių studija „Pašėlę batai"', city: 'Panevėžys', region: 'Panevėžio apskritis', category: 'Šokiai', ageRange: '4-16 metų', description: 'Šiuolaikiniai, gatvės ir sportiniai šokiai Panevėžyje.' },
  { name: 'Panevėžio dailės mokykla', city: 'Panevėžys', region: 'Panevėžio apskritis', category: 'Dailė', ageRange: '6-18 metų', description: 'Piešimas, tapyba, grafika, keramika vaikams Panevėžyje.' },
  { name: 'Panevėžio vaikų sporto mokykla', city: 'Panevėžys', region: 'Panevėžio apskritis', category: 'Sportas', ageRange: '5-18 metų', description: 'Lengvoji atletika, krepšinis, futbolas, plaukimas Panevėžyje.' },

  // === ALYTUS ===
  { name: 'Alytaus jaunimo centras – būreliai', city: 'Alytus', region: 'Alytaus apskritis', category: 'STEM', ageRange: '7-16 metų', description: 'Technologijų, robotikos ir kūrybos būreliai Alytaus jaunimo centre.' },
  { name: 'Alytaus šokių studija', city: 'Alytus', region: 'Alytaus apskritis', category: 'Šokiai', ageRange: '4-18 metų', description: 'Sportiniai ir šiuolaikiniai šokiai vaikams Alytuje.' },

  // === MARIJAMPOLĖ ===
  { name: 'Marijampolės meno mokykla – dailė', city: 'Marijampolė', region: 'Marijampolės apskritis', category: 'Dailė', ageRange: '6-18 metų', description: 'Dailės, keramikos ir dizaino užsiėmimai Marijampolėje.' },
  { name: 'Marijampolės sporto centras', city: 'Marijampolė', region: 'Marijampolės apskritis', category: 'Sportas', ageRange: '5-18 metų', description: 'Sporto būreliai – krepšinis, futbolas, lengvoji atletika Marijampolėje.' },

  // === UTENA ===
  { name: 'Utenos vaikų ir jaunimo centras', city: 'Utena', region: 'Utenos apskritis', category: 'STEM', ageRange: '6-16 metų', description: 'Robotikos, dailės ir šokių būreliai Utenos vaikų centre.' },

  // === DRUSKININKAI ===
  { name: 'Druskininkų sporto centras – plaukimas', city: 'Druskininkai', region: 'Alytaus apskritis', category: 'Sportas', ageRange: '4-16 metų', description: 'Plaukimo treniruotės vaikams Druskininkų vandens parke.' },

  // === PALANGA ===
  { name: 'Palangos vaikų laisvalaikio centras', city: 'Palanga', region: 'Klaipėdos apskritis', category: 'Dailė', ageRange: '5-14 metų', description: 'Dailės, keramikos ir rankdarbių būreliai Palangoje.' },

  // === TRAKAI ===
  { name: 'Trakų kultūros rūmų vaikų būreliai', city: 'Trakai', region: 'Vilniaus apskritis', category: 'Šokiai', ageRange: '5-16 metų', description: 'Šokių, muzikos ir teatro būreliai Trakuose.' },
];

async function main() {
  const data = bureliai.map(b => ({
    slug: slug(b.name),
    name: b.name,
    city: b.city,
    region: b.region || null,
    area: b.area || null,
    category: b.category || null,
    ageRange: b.ageRange || null,
    price: b.price || null,
    schedule: b.schedule || null,
    phone: b.phone || null,
    website: b.website || null,
    description: b.description || null,
    baseRating: 0,
    baseReviewCount: 0,
  }));

  // Deduplicate slugs
  const seen = new Set();
  const unique = data.filter(d => {
    if (seen.has(d.slug)) return false;
    seen.add(d.slug);
    return true;
  });

  const result = await prisma.burelis.createMany({ data: unique, skipDuplicates: true });
  console.log(`Inserted ${result.count} būreliai!`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
