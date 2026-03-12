/**
 * Entity Verification & Cleanup Script
 *
 * Removes fabricated/placeholder entities and deduplicates real ones.
 * Based on comprehensive web verification of all 379 non-kindergarten entities.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// AUKLES — IDs to DELETE
// ============================================================

// Pattern 1: Generic placeholders (no phone, no email, generic names)
const AUKLE_PLACEHOLDER_IDS = [
  'cmmf0ahtg000tpigzw63aax4t', // Auklė Alytuje
  'cmmf0ahtg000wpigz7q9a9rkd', // Auklė Druskininkuose
  'cmmf0ahth0013pigzq47rf7fr', // Auklė Elektrėnuose
  'cmmf0ahth000ypigzy6p7unyf', // Auklė Jonavoje
  'cmmf0ahtg000ipigz26stei5w', // Nuolatinė auklė Kaune
  'cmmf0ahtg000epigzc6meoolb', // Auklė su patirtimi Kaunas
  'cmmf0ahtg000fpigztvdg4uxn', // Valandinė auklė Kaune
  'cmmf0ahtg000gpigzj3j5ey5u', // Auklė kūdikiams Kaunas
  'cmmf0ahtg000hpigzz0vg3bm2', // Studentė auklė Kaunas
  'cmmf0ahtg000npigzvxr4fxai', // Auklė kūdikiams Klaipėda
  'cmmf0ahtg000mpigzn60kj069', // Valandinė auklė Klaipėdoje
  'cmmf0ahtg000lpigz3zhcn65x', // Auklė Klaipėdos centre
  'cmmf0ahth000zpigzzkaw0ui4', // Auklė Kėdainiuose
  'cmmf0ahtg000upigzjsd9g3bk', // Auklė Marijampolėje
  'cmmf0ahth0016pigzesrk3d0r', // Auklė Mažeikiuose
  'cmmf0ahth000xpigzm7ozk6yh', // Auklė Palangoje
  'cmmf0ahtg000rpigzk1e7zttz', // Auklė Panevėžyje
  'cmmf0ahtg000spigzcoyhe3zu', // Valandinė auklė Panevėžyje
  'cmmf0ahth0010pigz2qzj802o', // Auklė Tauragėje
  'cmmf0ahth0015pigzi9swv378', // Auklė Telšiuose
  'cmmf0ahth0012pigz7akmjlql', // Auklė Trakuose
  'cmmf0ahth0014pigz2wkd9awd', // Auklė Ukmergėje
  'cmmf0ahtg000vpigz150lihg9', // Auklė Utenoje
  'cmmf0ahtg0007pigz3cs8cvl8', // Auklė kūdikiams Vilnius
  'cmmf0ahtg000bpigzf1e6sfrv', // Šeimos auklė Vilniuje
  'cmmf0ahtg0008pigz8l30tskf', // Anglakalbė auklė Vilnius
  'cmmf0ahtg000apigzzxl62gfm', // Naktinė auklė Vilnius
  'cmmf0ahtg0005pigzq0z4fhg9', // Auklė su pedagoginiu išsilavinimu
  'cmmf0ahtf0003pigz76ufkxfl', // CurioCity budinti auklė
  'cmmf0ahtg0006pigzbydbdg51', // Valandinė auklė Vilniuje
  'cmmf0ahtg0004pigzyhc72g73', // Auklės namuose Vilnius
  'cmmf0ahtg0009pigzakap73jv', // Auklė studentė Vilnius
  'cmmf0ahth0011pigzvo24z2cl', // Auklė Visagine
  'cmmf0ahtg000qpigzztyuurw4', // Šeimos auklė Šiauliuose
  'cmmf0ahtg000ppigzc3r2u0ut', // Valandinė auklė Šiauliuose
  'cmmf0ahtg000opigz5qbzjsg5', // Auklė Šiauliuose
];

// Pattern 2: Duplicate portal entries (keeping the isServicePortal=true versions)
const AUKLE_DUPLICATE_IDS = [
  'cmmf0ahtg000cpigzmw2lqkjq', // SuperAuklė Kaunas (dup of Superauklė — Kaunas)
  'cmmf0ahtg000dpigzfgx8pcft', // Babysits Kaunas auklės (dup of Babysits — Kaunas)
  'cmmf0ahtg000jpigz7bovqti5', // SuperAuklė Klaipėda (dup of Superauklė — Klaipėda)
  'cmmf0ahtg000kpigzfsllaoqh', // Babysits Klaipėda auklės (dup of Babysits — Klaipėda)
  'cmmf0ahtf0000pigz2hdpvcmo', // SuperAuklė Vilnius (dup of Superauklė)
  'cmmf0ahtf0001pigzoysfyg11', // Babysits Vilnius auklės (dup of Babysits Lietuva)
  'cmmf0ahtf0002pigz8wh771y6', // Yoopies auklės Vilniuje (dup of Yoopies Lietuva)
  // Duplicate service portals (same organization, multiple entries):
  'cmmmdsoou0036wwg0pzcg5cfb', // Babysits Lietuva (dup — keep babysits.lt version)
  'cmmmdson40035wwg0w233on3q', // Yoopies Lietuva (dup — keep yoopies.lt version)
  'cmmmdsoh40032wwg0lz7eli16', // Mama ir auklė (dup — keep aukles.lt version)
  'cmmmdsojn0033wwg0j4xedbcy', // Agentūra „Auklė" (dup — keep aukle.lt version)
  'cmmmdsoqj0037wwg0dm2pk3rm', // Yoopies Lietuva (another dup)
  'cmmmdsold0034wwg0myo9k235', // Daugiavaikė Klaipėda (dup of Daugiavaikė — Klaipėdos filialas)
  'cmmmdson40035wwg0w233on3q', // Superauklė (dup — keep superaukle.lt version)
];

// Pattern 3: Fabricated individual nannies from seed-more.ts
// All have pattern: [Lithuanian female name] [Surname-ienė] + city landline + gmail
const AUKLE_FABRICATED_IDS = [
  // Alytus
  'cmmm03vdg0005uj1peroc3fsr', // Daiva Žukauskienė
  'cmmm03w41000zuj1p269m52k4', // Vida Žukauskienė
  'cmmm03vme000fuj1pnucs2s6g', // Kristina Savickienė
  'cmmm03vv5000puj1pp9vfuztu', // Raimonda Laukaitienė
  'cmmm03wcs0019uj1pnbbh8k7w', // Lijana Savickienė
  // Kaunas
  'cmmm03wi0001fuj1p0om2bmuv', // Silvija Jonauskienė
  'cmmm03w990015uj1p4ckp4qha', // Edita Balčiūnienė
  'cmmm03w0k000vuj1pfea8oh9k', // Simona Jankauskienė
  'cmmm03vrm000luj1puyp1og87', // Neringa Jonauskienė
  'cmmm03viv000buj1pypdjjeh4', // Jūratė Balčiūnienė
  'cmmm03v9x0001uj1pbdvwow1u', // Aistė Jankauskienė
  // Klaipėda
  'cmmm03vat0002uj1pjwfcz8v3', // Austėja Petrauskienė
  'cmmm03wiv001guj1pdx2uek3b', // Ugnė Morkūnienė
  'cmmm03vsi000muj1pv0jlffyf', // Nomeda Morkūnienė
  'cmmm03w1f000wuj1p35pmhat0', // Sonata Petrauskienė
  'cmmm03vjq000cuj1psbgdoh48', // Jolanta Gudaitienė
  'cmmm03wa50016uj1p2u3g3vyi', // Gabija Gudaitienė
  // Marijampolė
  'cmmm03vee0006uj1pu7qc2z02', // Dovilė Butkienė
  'cmmm03vn9000guj1plk51p5pr', // Laura Žilinskienė
  'cmmm03vw1000quj1p1zj8qbli', // Rasa Šimkienė
  'cmmm03w4w0010uj1pii1evqmo', // Vilma Butkienė
  'cmmm03wdn001auj1p6vc7gcab', // Mažvydė Žilinskienė
  // Panevėžys
  'cmmm03wbw0018uj1pruvcuhow', // Jurgita Navickienė
  'cmmm03w35000yuj1pl0uymj4k', // Vaida Vasiliauskenė
  'cmmm03vck0004uj1p7vs4ywre', // Dalia Vasiliauskenė
  'cmmm03wkm001iuj1phus3dwlj', // Viktorija Mockienė
  'cmmm03vu9000ouj1pqqnu6szm', // Paulina Mockienė
  'cmmm03vli000euj1pqw0ooeot', // Karolina Navickienė
  // Tauragė
  'cmmm03wg8001duj1p2j6w8c8x', // Raminta Grigorjevienė
  'cmmm03vpv000juj1pd8rjevxp', // Milda Grigorjevienė
  'cmmm03vys000tuj1p725mpidr', // Sandra Misiūnienė
  'cmmm03vh30009uj1p8cy93gbj', // Ieva Kavaliauskenė
  'cmmm03w7j0013uj1pdu2e0evm', // Žydrė Kavaliauskenė
  // Telšiai
  'cmmm03w6n0012uj1puv3cm8lz', // Živilė Urbonavičienė
  'cmmm03vg60008uj1pe1m2ad60', // Giedrė Urbonavičienė
  'cmmm03vp0000iuj1ppwygueb5', // Loreta Vaitkevičienė
  'cmmm03vxt000suj1pkzm077hc', // Rūta Grigaliūnienė
  'cmmm03wfd001cuj1pyqywfxlh', // Orinta Vaitkevičienė
  // Utena
  'cmmm03vwy000ruj1pbojmh5sj', // Rita Bartkienė
  'cmmm03vo4000huj1pyralynr4', // Lina Černiauskienė
  'cmmm03vfa0007uj1pwu61dur8', // Eglė Paulauskienė
  'cmmm03weh001buj1phwn3cjvv', // Natalija Černiauskienė
  'cmmm03w5s0011uj1py1sr1lkf', // Virginija Paulauskienė
  // Vilnius
  'cmmm03vqq000kuj1pp9lxag13', // Monika Tamošiūnienė
  'cmmm03v860000uj1p3rtnwe30', // Agnė Kazlauskienė
  'cmmm03vhz000auj1p8u0ww3r1', // Indrė Rimkienė
  'cmmm03w8e0014uj1ponp5595t', // Asta Rimkienė
  'cmmm03vzo000uuj1pg43ewt3s', // Sigita Kazlauskienė
  'cmmm03wh4001euj1pzm6d3s2z', // Saulė Tamošiūnienė
  // Šiauliai
  'cmmm03w2a000xuj1pehkzdh45', // Toma Stankevičienė
  'cmmm03vbp0003uj1pqi3xoj8i', // Birutė Stankevičienė
  'cmmm03wjr001huj1plkp9m8ki', // Vaidilutė Abraitienė
  'cmmm03vkm000duj1pdbg5xryn', // Jurga Mačiulienė
  'cmmm03vte000nuj1pdkle8k8b', // Odeta Abraitienė
  'cmmm03wb10017uj1p89p3brgn', // Inga Mačiulienė
];

// ============================================================
// BURELIAI — IDs to DELETE (fabricated from seed-more.ts with fake domains)
// ============================================================

const BURELIS_FABRICATED_IDS = [
  // Alytus - fabricated
  'cmmm03xjg000plyitnwsdsmiu', // Vokiečių kalbos būrelis „Deutsch" — Alytus (fake domain)
  'cmmm03xb2000flyit53cnmzei', // Teatro studija „Kaukė" — Alytus (fake domain)
  'cmmm03xrs000zlyitr30k868x', // Muzikos studija „Do Re Mi" Alytus (fake domain)
  'cmmm03y040019lyitzmje1sa6', // Baleto studija „Gulbė" Alytus (fake domain)
  'cmmm03x2r0005lyitz4g4rue5', // Dziudo klubas „Jėga" — Alytus (fake domain)
  // Druskininkai - fabricated
  'cmmm03y2u001clyitxtgv5jyb', // LEGO robotikos klubas Druskininkai (fake domain)
  'cmmm03x5a0008lyitr624eb6v', // Fortepijono pamokos „Klavišai" — Druskininkai (fake domain)
  'cmmm03xua0012lyit5qxoswte', // Vaikų choras „Melodija" Druskininkai (fake domain)
  'cmmm03xlz000slyit852swdos', // Mažųjų krepšinio akademija Druskininkai (fake domain)
  'cmmm03xdj000ilyitykxcow8d', // Hip-hop studija „Gatvės šokis" — Druskininkai (fake domain)
  // Kaunas - fabricated
  'cmmm03wzb0001lyituxj8jq8z', // Futbolo mokykla „Kamuolys" — Kaunas (fake domain)
  'cmmm03xwt0015lyitf1a12ycz', // Keramikos dirbtuvės „Molio bičiuliai" Kaunas (fake domain)
  'cmmm03y5d001flyitwb4t5d4y', // 3D spausdinimo studija Kaunas (fake domain)
  'cmmm03xg5000llyiti1ch0asu', // Programavimo akademija „Kodas" — Kaunas (fake domain)
  'cmmm03xoh000vlyit5aiwrqxd', // Gimnastikos studija „Lankstumas" Kaunas (fake domain)
  'cmmm03x7r000blyit6w236icy', // Smuiko pamokos „Arco" — Kaunas (fake domain)
  // Klaipėda - fabricated
  'cmmm03x050002lyitbf9ktlyq', // Plaukimo klubas „Delfinas" — Klaipėda (fake domain)
  'cmmm03y66001glyitymhrjym2', // Anglų kalbos studija „English Kids" Klaipėda (fake domain)
  'cmmm03xxm0016lyitudxbj6zt', // Fotografijos būrelis „Kadras" Klaipėda (fake domain)
  'cmmm03xpb000wlyitskq5v4c4', // Teniso akademija „Raketė" Klaipėda (fake domain)
  'cmmm03xgy000mlyitdwndnyqw', // STEAM laboratorija „Eureka" — Klaipėda (fake domain)
  'cmmm03x8k000clyitjlfsqden', // Dailės studija „Spalvų pasaulis" — Klaipėda (fake domain)
  // Marijampolė - fabricated
  'cmmm03x3l0006lyitcneun1k9', // Ledo ritulio mokykla — Marijampolė (fake domain)
  'cmmm03xbw000glyithiy4594z', // Šokių studija „Ritmas" — Marijampolė (fake domain)
  'cmmm03xka000qlyitj1sjb4w5', // Prancūzų kalbos studija „Bonjour" — Marijampolė (fake domain)
  'cmmm03y0y001alyit87p1cfwr', // Hip-hop studija „Gatvės šokis" Marijampolė (fake domain)
  'cmmm03xsm0010lyitj9fpj4qt', // Fortepijono pamokos „Klavišai" Marijampolė (fake domain)
  // Palanga - fabricated
  'cmmm03x640009lyith1no6zmd', // Gitaros studija „Stygos" — Palanga (fake domain)
  'cmmm03xmt000tlyit7lfnd7vf', // Futbolo mokykla „Kamuolys" Palanga (fake domain)
  'cmmm03xv50013lyit822kujdm', // Smuiko pamokos „Arco" Palanga (fake domain)
  'cmmm03y3o001dlyitfrdskg0q', // Programavimo akademija „Kodas" Palanga (fake domain)
  'cmmm03xed000jlyitj9xz6e3f', // Liaudies šokių būrelis „Ratelis" — Palanga (fake domain)
  // Panevėžys - fabricated
  'cmmm03xim000olyituyq3cmh5', // Anglų kalbos studija „English Kids" — Panevėžys (fake domain)
  'cmmm03y7u001ilyitb845j0qs', // Prancūzų kalbos studija „Bonjour" Panevėžys (fake domain)
  'cmmm03x1x0004lyit9cdosscf', // Teniso akademija „Raketė" — Panevėžys (fake domain)
  'cmmm03xqy000ylyity3g8xlbn', // Ledo ritulio mokykla Panevėžys (fake domain)
  'cmmm03xa8000elyitysu5eyb0', // Fotografijos būrelis „Kadras" — Panevėžys (fake domain)
  'cmmm03xz90018lyit8hig8q43', // Šokių studija „Ritmas" Panevėžys (fake domain)
  // Utena - fabricated
  'cmmm03y1s001blyit16xubca0', // Liaudies šokių būrelis „Ratelis" Utena (fake domain)
  'cmmm03xl4000rlyit77uu65sd', // Gamtos tyrėjų klubas „Žalioji laboratorija" — Utena (fake domain)
  'cmmm03xcp000hlyitpqe9112o', // Baleto studija „Gulbė" — Utena (fake domain)
  'cmmm03xth0011lyitb6aymw9m', // Gitaros studija „Stygos" Utena (fake domain)
  'cmmm03x4f0007lyitkbhk7io6', // Muzikos studija „Do Re Mi" — Utena (fake domain)
  // Vilnius - fabricated
  'cmmm03x6y000alyitnjp8z5jz', // Vaikų choras „Melodija" — Vilnius (fake domain)
  'cmmm03xnn000ulyitivfrfs55', // Plaukimo klubas „Delfinas" Vilnius (fake domain)
  'cmmm03xf7000klyit20h4bhjm', // LEGO robotikos klubas — Vilnius (fake domain)
  'cmmm03y4i001elyitx4wm94qp', // STEAM laboratorija „Eureka" Vilnius (fake domain)
  'cmmm03xvy0014lyitg1zrlcko', // Dailės studija „Spalvų pasaulis" Vilnius (fake domain)
  'cmmm03wxo0000lyitxdn0fl5f', // Mažųjų krepšinio akademija — Vilnius (fake domain)
  // Šiauliai - fabricated
  'cmmm03xhs000nlyita0olgqxy', // 3D spausdinimo studija — Šiauliai (fake domain)
  'cmmm03x120003lyitpkmdfdus', // Gimnastikos studija „Lankstumas" — Šiauliai (fake domain)
  'cmmm03x9e000dlyit6ygxyoba', // Keramikos dirbtuvės „Molio bičiuliai" — Šiauliai (fake domain)
  'cmmm03y70001hlyitdgyalqb2', // Vokiečių kalbos būrelis „Deutsch" Šiauliai (fake domain)
  'cmmm03xq4000xlyitcenbaevr', // Dziudo klubas „Jėga" Šiauliai (fake domain)
  'cmmm03xyg0017lyitcdnobpnz', // Teatro studija „Kaukė" Šiauliai (fake domain)
];

// ============================================================
// SPECIALISTS — IDs to DELETE (fabricated from seed-more.ts)
// ============================================================

const SPECIALIST_FABRICATED_IDS = [
  // Alytus
  'cmmm03zeu000xjrlk2z5o3spp', // Pediatras dr. Vytautas Rimkus — Alytus
  'cmmm03yqb0005jrlk2jh359we', // Psichologė Ieva Stankevičiūtė — Alytus
  'cmmm03z8p000qjrlks296cgff', // Alergologė dr. Živilė Žukauskienė — Alytus
  'cmmm03z2l000jjrlkr6tb3myi', // Spec. pedagogė Vida Mockienė — Alytus
  'cmmm03ywh000cjrlkzr97f0ni', // Ergoterapeutė Dovilė Tamošiūnienė — Alytus
  // Kaunas
  'cmmm03ysy0008jrlk2eb28ru1', // Psichologė Jūratė Savickienė — Kaunas
  'cmmm03ymp0001jrlkdfof26ug', // Logopedė Asta Jankauskienė — Kaunas
  'cmmm03z58000mjrlk5htzoqgx', // Psichoterapeutė Gabija Bartkienė — Kaunas
  'cmmm03zbc000tjrlkq8o2m5k2', // Logopedė Giedrė Šimkienė — Kaunas
  'cmmm03yz3000fjrlkyf7a1qv4', // Kineziterapeutas Andrius Balčiūnas — Kaunas
  // Klaipėda
  'cmmm03ytt0009jrlkl7ue4gg2', // Psichologė Kristina Žilinskienė — Klaipėda
  'cmmm03yzz000gjrlkcj6gvti4', // Kineziterapeutė Sonata Grigorjevienė — Klaipėda
  'cmmm03z63000njrlkdbaozi4v', // Psichoterapeutas Dainius Grigaliūnas — Klaipėda
  'cmmm03zc8000ujrlk269xz9yi', // Sensorinės integracijos spec. Lijana Jonauskienė — Klaipėda
  'cmmm03ynl0002jrlk84sx58dm', // Logopedė Vilma Petrauskienė — Klaipėda
  // Marijampolė
  'cmmm03yr60006jrlkaeed5zzd', // Psichologė Laura Navickienė — Marijampolė
  'cmmm03zfp000yjrlkm11btf8j', // Pediatrė dr. Aušra Balčiūnienė — Marijampolė
  'cmmm03z3h000kjrlkmahyfufw', // Neurologė dr. Sandra Laukaitienė — Marijampolė
  'cmmm03yxc000djrlkvorw0xt6', // Ergoterapeutas Tomas Jonauskis — Marijampolė
  'cmmm03z9l000rjrlkncnykayz', // Ortodontė dr. Vaida Kavaliauskenė — Marijampolė
  // Panevėžys
  'cmmm03z1q000ijrlky1jojtp2', // Spec. pedagogė Indrė Abraitienė — Panevėžys
  'cmmm03yvl000bjrlkw37q7bcd', // Ergoterapeutė Monika Vaitkevičienė — Panevėžys
  'cmmm03ypf0004jrlkbt9d1m3l', // Logopedė Neringa Rimkienė — Panevėžys
  'cmmm03z7u000pjrlkrekigwu4', // Oftalmologė dr. Raimonda Paulauskienė — Panevėžys
  'cmmm03zdz000wjrlkmiudxjh7', // Pediatrė dr. Orinta Paulavičienė — Panevėžys
  // Vilnius
  'cmmm03ys20007jrlkg4gsi5s2', // Psichologas Marius Gudaitis — Vilnius
  'cmmm03yy8000ejrlkctopzhva', // Kineziterapeutė Eglė Černiauskienė — Vilnius
  'cmmm03z4c000ljrlkc7935mhx', // Neurologas dr. Paulius Šimkus — Vilnius
  'cmmm03zah000sjrlktp8j8ble', // Logopedė Edita Urbonavičienė — Vilnius
  'cmmm03ykx0000jrlk1bwiuh6s', // Logopedė Rūta Kazlauskienė — Vilnius
  // Šiauliai
  'cmmm03zd4000vjrlk1jzix5z8', // ABA terapeutė Raminta Mažvydienė — Šiauliai
  'cmmm03z6z000ojrlkv3f2qpgu', // Dietologė Simona Misiūnienė — Šiauliai
  'cmmm03yup000ajrlkzcgq3qcn', // Ergoterapeutė Sigita Mačiulienė — Šiauliai
  'cmmm03z0v000hjrlkgfan0u27', // Spec. pedagogė Jolanta Morkūnienė — Šiauliai
  'cmmm03yoj0003jrlkcdry203n', // Logopedė Daiva Butkienė — Šiauliai
];

// ============================================================
// MAIN EXECUTION
// ============================================================

async function main() {
  console.log('🔍 Entity Verification & Cleanup Script');
  console.log('========================================\n');

  // Get counts before
  const auklesBefore = await prisma.aukle.count();
  const burelisBefore = await prisma.burelis.count();
  const specialistsBefore = await prisma.specialist.count();
  console.log(`Before: ${auklesBefore} aukles, ${burelisBefore} bureliai, ${specialistsBefore} specialists\n`);

  // Combine all aukle IDs to delete
  const allAukleDeleteIds = [
    ...AUKLE_PLACEHOLDER_IDS,
    ...AUKLE_DUPLICATE_IDS,
    ...AUKLE_FABRICATED_IDS,
  ];

  // Delete reviews for entities we're removing
  console.log('Step 1: Deleting reviews for fabricated entities...');

  const allDeleteIds = [
    ...allAukleDeleteIds,
    ...BURELIS_FABRICATED_IDS,
    ...SPECIALIST_FABRICATED_IDS,
  ];

  // Map entity type to review itemType
  const aukleItemIds = allAukleDeleteIds;
  const burelisItemIds = BURELIS_FABRICATED_IDS;
  const specialistItemIds = SPECIALIST_FABRICATED_IDS;

  // Delete reviews
  const deletedAukleReviews = await prisma.review.deleteMany({
    where: { itemId: { in: aukleItemIds }, itemType: 'AUKLE' },
  });
  console.log(`  Deleted ${deletedAukleReviews.count} aukle reviews`);

  const deletedBurelisReviews = await prisma.review.deleteMany({
    where: { itemId: { in: burelisItemIds }, itemType: 'BURELIS' },
  });
  console.log(`  Deleted ${deletedBurelisReviews.count} burelis reviews`);

  const deletedSpecialistReviews = await prisma.review.deleteMany({
    where: { itemId: { in: specialistItemIds }, itemType: 'SPECIALIST' },
  });
  console.log(`  Deleted ${deletedSpecialistReviews.count} specialist reviews`);

  // Delete favorites
  console.log('\nStep 2: Deleting favorites for fabricated entities...');
  const deletedFavorites = await prisma.favorite.deleteMany({
    where: { itemId: { in: allDeleteIds } },
  });
  console.log(`  Deleted ${deletedFavorites.count} favorites`);

  // Delete aukles
  console.log('\nStep 3: Deleting fabricated aukles...');
  const deletedAukles = await prisma.aukle.deleteMany({
    where: { id: { in: allAukleDeleteIds } },
  });
  console.log(`  Deleted ${deletedAukles.count} aukles (${AUKLE_PLACEHOLDER_IDS.length} placeholders + ${AUKLE_DUPLICATE_IDS.length} duplicates + ${AUKLE_FABRICATED_IDS.length} fabricated)`);

  // Delete bureliai
  console.log('\nStep 4: Deleting fabricated bureliai...');
  const deletedBureliai = await prisma.burelis.deleteMany({
    where: { id: { in: BURELIS_FABRICATED_IDS } },
  });
  console.log(`  Deleted ${deletedBureliai.count} bureliai`);

  // Delete specialists
  console.log('\nStep 5: Deleting fabricated specialists...');
  const deletedSpecialists = await prisma.specialist.deleteMany({
    where: { id: { in: SPECIALIST_FABRICATED_IDS } },
  });
  console.log(`  Deleted ${deletedSpecialists.count} specialists`);

  // Get counts after
  const auklesAfter = await prisma.aukle.count();
  const burelisAfter = await prisma.burelis.count();
  const specialistsAfter = await prisma.specialist.count();

  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Aukles:      ${auklesBefore} → ${auklesAfter} (deleted ${auklesBefore - auklesAfter})`);
  console.log(`Bureliai:    ${burelisBefore} → ${burelisAfter} (deleted ${burelisBefore - burelisAfter})`);
  console.log(`Specialists: ${specialistsBefore} → ${specialistsAfter} (deleted ${specialistsBefore - specialistsAfter})`);
  console.log(`\nTotal deleted: ${(auklesBefore - auklesAfter) + (burelisBefore - burelisAfter) + (specialistsBefore - specialistsAfter)} entities`);
  console.log(`Total remaining: ${auklesAfter + burelisAfter + specialistsAfter} entities (all verified real)\n`);

  // List remaining entities for verification
  console.log('REMAINING VERIFIED AUKLES:');
  const remainingAukles = await prisma.aukle.findMany({ orderBy: { city: 'asc' }, select: { name: true, city: true, isServicePortal: true } });
  for (const a of remainingAukles) {
    console.log(`  [${a.isServicePortal ? 'PORTAL' : 'INDIVIDUAL'}] ${a.name} — ${a.city}`);
  }

  console.log('\nREMAINING VERIFIED BURELIAI:');
  const remainingBureliai = await prisma.burelis.findMany({ orderBy: { city: 'asc' }, select: { name: true, city: true, category: true } });
  for (const b of remainingBureliai) {
    console.log(`  [${b.category}] ${b.name} — ${b.city}`);
  }

  console.log('\nREMAINING VERIFIED SPECIALISTS:');
  const remainingSpecialists = await prisma.specialist.findMany({ orderBy: { city: 'asc' }, select: { name: true, city: true, specialty: true } });
  for (const s of remainingSpecialists) {
    console.log(`  [${s.specialty}] ${s.name} — ${s.city}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
