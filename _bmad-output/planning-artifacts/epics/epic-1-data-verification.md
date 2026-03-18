# Epikas 1: Duomenu Verifikavimo Sistema

## Apzvalga

**Pavadinimas:** Duomenu Verifikavimo Sistema
**Tikslas:** Sukurti visapusiska duomenu verifikavimo sistema, leidziancia administratoriams patikrinti, patvirtinti arba atmesti visus platformoje esancius irasus (darzelius, aukles, burelius, specialistus), uztikrinant duomenu kokybe ir patikimuma vartotojams.
**Bendri istorijos taskai:** 32 SP
**Prioritetas:** Aukstas

---

## Istorija 1: Verifikavimo statuso pridejimas

**Pavadinimas:** Verifikavimo statuso pridejimas prie visu esybiu modeliu

**Aprasymas:** Prideti `verificationStatus` enum lauka (UNVERIFIED, VERIFIED, REJECTED) prie visu keturiu esybiu modeliu (Kindergarten, Aukle, Burelis, Specialist) per Prisma migracija. Taip pat prideti `verifiedAt` (DateTime) ir `verifiedBy` (String) laukus, kad butu galima sekti, kada ir kas atliko verifikavima. Visi esami irasai turi gauti numatytaji UNVERIFIED statusa.

**Istorijos taskai:** 5 SP

**Priklausomybes:** Jokiu — tai yra pagrindine istorija, nuo kurios priklauso visos kitos sio epiko istorijos.

**Priemimo kriterijai:**

- **Duota**, kad egzistuoja Prisma schema su Kindergarten, Aukle, Burelis ir Specialist modeliais,
  **Kai** programuotojas paleidzia Prisma migracija,
  **Tada** visi keturi modeliai turi tureti naujus laukus: `verificationStatus` (enum: UNVERIFIED, VERIFIED, REJECTED), `verifiedAt` (DateTime, nullable), ir `verifiedBy` (String, nullable).

- **Duota**, kad duomenu bazeje jau yra esamu irasu,
  **Kai** migracija yra sekmingai pritaikyta,
  **Tada** visi esami irasai turi tureti `verificationStatus` reiksme nustatyta i UNVERIFIED, o `verifiedAt` ir `verifiedBy` laukai turi buti null.

- **Duota**, kad Prisma schema yra atnaujinta,
  **Kai** programuotojas generuoja Prisma klienta (`npx prisma generate`),
  **Tada** TypeScript tipai turi atspindeti naujus laukus ir enum tipo reiksmes be klaidu.

- **Duota**, kad migracija yra sukurta,
  **Kai** ji yra paleista tiek tusti, tiek uzpildyti duomenu baze,
  **Tada** migracija turi sekmingai iveikti be klaidu abiem atvejais.

---

## Istorija 2: Admin verifikavimo dashboard

**Pavadinimas:** Administratoriaus verifikavimo valdymo skydelis

**Aprasymas:** Sukurti nauja administratoriaus skydelio puslapi, kuriame rodomi verifikavimo statistikos skaiciai pagal statusa (kiek nepatikrintu, patvirtintu, atmestu) kiekvienam esybiu tipui. Puslapis turi tureti filtravimo galimybes pagal statusa, esybes tipa ir paieska pagal pavadinima. Sarasas turi buti puslapiuojamas ir rodyti pagrindine informacija apie kiekviena irasa.

**Istorijos taskai:** 8 SP

**Priklausomybes:** Istorija 1 (Verifikavimo statuso pridejimas)

**Priemimo kriterijai:**

- **Duota**, kad administratorius yra prisijunges prie admin skydelio,
  **Kai** jis naviguoja i verifikavimo valdymo puslapi,
  **Tada** jis mato statistikos korteles su irasu skaiciais pagal kiekviena statusa (UNVERIFIED, VERIFIED, REJECTED) kiekvienam esybiu tipui (darzeliai, aukles, bureliai, specialistai).

- **Duota**, kad administratorius yra verifikavimo valdymo puslapyje,
  **Kai** jis pasirenka filtra pagal statusa (pvz., tik UNVERIFIED),
  **Tada** sarase rodomi tik tie irasai, kuriu verifikavimo statusas atitinka pasirinkta filtra.

- **Duota**, kad administratorius yra verifikavimo valdymo puslapyje,
  **Kai** jis pasirenka filtra pagal esybes tipa (pvz., tik darzeliai),
  **Tada** sarase rodomi tik pasirinkto tipo irasai.

- **Duota**, kad sarasa sudaro daugiau nei 20 irasu,
  **Kai** administratorius peržiuri sarasa,
  **Tada** irasai yra rodomi puslapiuojamai po 20 irasu puslapyje su navigacijos mygtukais.

- **Duota**, kad administratorius iveda teksta i paieskas lauka,
  **Kai** jis paspaudzia paieska arba praejo 300ms debounce laikas,
  **Tada** sarasas yra filtruojamas pagal iraso pavadinima, atitinkanti ivesta teksta.

---

## Istorija 3: Individualaus iraso verifikavimas

**Pavadinimas:** Individualaus iraso verifikavimas su pastabomis

**Aprasymas:** Leisti administratoriui perziureti individualaus iraso detalia informacija ir atlikti verifikavimo veiksma — patvirtinti (VERIFIED) arba atmesti (REJECTED). Administratorius turi galeti prideti pastabas, paaiskinancias verifikavimo sprendima. Statusas, data ir administratoriaus informacija turi buti issaugoti duomenu bazeje.

**Istorijos taskai:** 3 SP

**Priklausomybes:** Istorija 1 (Verifikavimo statuso pridejimas), Istorija 2 (Admin verifikavimo dashboard)

**Priemimo kriterijai:**

- **Duota**, kad administratorius perziuri individualaus iraso detalia informacija verifikavimo puslapyje,
  **Kai** jis paspaudzia „Patvirtinti" mygtuka,
  **Tada** iraso `verificationStatus` yra pakeiciamas i VERIFIED, `verifiedAt` nustatomas i dabartine data/laika, o `verifiedBy` uzpildomas administratoriaus identifikatoriumi.

- **Duota**, kad administratorius perziuri individualaus iraso detalia informacija,
  **Kai** jis paspaudzia „Atmesti" mygtuka ir iveda atmetimo priezasti,
  **Tada** iraso `verificationStatus` yra pakeiciamas i REJECTED, o pastaba yra issaugoma kartu su verifikavimo informacija.

- **Duota**, kad administratorius bando atmesti irasa,
  **Kai** jis nepateikia jokios pastabos ar priezasties,
  **Tada** sistema rodo klaidos pranesima, reikalaudama ivesti atmetimo priezasti, ir veiksmas nera atliekamas.

- **Duota**, kad iraso statusas buvo sekmingai pakeistas,
  **Kai** puslapis persikrauna arba administratorius grįzta i sarasa,
  **Tada** naujas statusas yra matomas ir teisingai atvaizduojamas.

---

## Istorija 4: Masinis verifikavimas (Bulk)

**Pavadinimas:** Masinis irasu verifikavimas ir atmetimas

**Aprasymas:** Igyvendinti galimybe administratoriui pasirinkti kelis irasus is verifikavimo saraso ir atlikti masini veiksma — patvirtinti arba atmesti visus pasirinktus irasus vienu metu. Turi buti patvirtinimo dialogas pries veiksmo atlikima ir progreso indikatorius dideliems kiekiams. Sistema turi tvarkyti klaidas gracefully ir pranesti apie dalini sekme.

**Istorijos taskai:** 5 SP

**Priklausomybes:** Istorija 1 (Verifikavimo statuso pridejimas), Istorija 2 (Admin verifikavimo dashboard)

**Priemimo kriterijai:**

- **Duota**, kad administratorius yra verifikavimo saraso puslapyje,
  **Kai** jis pazymi kelis irasus naudodamas checkboxus,
  **Tada** atsiranda veiksmu juosta su „Patvirtinti pasirinktus" ir „Atmesti pasirinktus" mygtukais bei pasirinktu irasu skaiciumi.

- **Duota**, kad administratorius pazymejo 5 irasus ir paspaudzia „Patvirtinti pasirinktus",
  **Kai** patvirtinimo dialoge jis patvirtina veiksma,
  **Tada** visi 5 irasai yra atnaujinami su VERIFIED statusu, `verifiedAt` ir `verifiedBy` laukais viename API kvietime.

- **Duota**, kad administratorius atlieka masini atmetima,
  **Kai** jis patvirtina veiksma,
  **Tada** sistema reikalauja ivesti bendra atmetimo priezasti, kuri yra pritaikoma visiems pasirinktiems irasams.

- **Duota**, kad masinio veiksmo metu vienas is irasu nepavyksta atnaujinti,
  **Kai** procesas baigiasi,
  **Tada** sistema praneša, kiek irasu buvo sekmingai atnaujinta ir kiek nepavyko, o nepavykusiu irasu statusas lieka nepakeistas.

- **Duota**, kad administratorius pazymejo „Pasirinkti visus" checkbox,
  **Kai** sarase yra 50 irasu (su puslapiavimu),
  **Tada** pazymimi tik dabartiniame puslapyje matomi irasai (iki 20), o ne visi filtruoti irasai.

---

## Istorija 5: Verifikavimo zenkliukas UI

**Pavadinimas:** Verifikavimo zenkliuko rodymas viešuose puslapiuose

**Aprasymas:** Rodyti vizualiai aisku verifikavimo zenkliuka (badge) ant visu viesu irasu korteliu ir detaliu puslapiuose. Patvirtinti irasai turi rodyti zalią varnele su uzrasu „Patikrinta", o nepatikrinti irasai gali rodyti neutralu indikatoriu. Atmesti irasai neturi buti rodomi viešuose puslapiuose.

**Istorijos taskai:** 3 SP

**Priklausomybes:** Istorija 1 (Verifikavimo statuso pridejimas)

**Priemimo kriterijai:**

- **Duota**, kad vartotojas perziuri miesto puslapi su darzeliu sarasą,
  **Kai** darbelis turi VERIFIED statusa,
  **Tada** ant jo korteles rodomas žalias zenkliukas su varnele ir uzrasu „Patikrinta".

- **Duota**, kad vartotojas perziuri iraso detaliojo rodinio modali (DetailModal),
  **Kai** irasas turi VERIFIED statusa,
  **Tada** salia pavadinimo rodomas verifikavimo zenkliukas su data, kada buvo patikrinta.

- **Duota**, kad irasas turi REJECTED statusa,
  **Kai** vartotojas naršo viešuose puslapiuose,
  **Tada** atmestas irasas nera rodomas sarasuose nei paieškos rezultatuose.

- **Duota**, kad irasas turi UNVERIFIED statusa,
  **Kai** vartotojas perziuri jo kortele,
  **Tada** zenkliukas nerodomas arba rodomas neutralus pilkas indikatorius be neigiamos konotacijos.

- **Duota**, kad verifikavimo zenkliukas yra rodomas,
  **Kai** vartotojas perziuri puslapi mobiliajame irengyje,
  **Tada** zenkliukas yra tinkamai isdestytas ir neiškraipo korteles maketo.

---

## Istorija 6: Audito zurnalas

**Pavadinimas:** Audito zurnalo modelis verifikavimo veiksmu sekimui

**Aprasymas:** Sukurti AuditLog Prisma modeli, kuris fiksuoja kiekviena administratoriaus atliekama verifikavimo veiksma. Kiekvienas zurnalas turi irasas turi saugoti veiksmo tipa, esybes tipa ir ID, sena ir nauja statusa, administratoriaus informacija, laiko žyma ir papildomas pastabas. Audito zurnalas turi buti nekeiciamas (immutable) — irasu trinti ar redaguoti negalima.

**Istorijos taskai:** 5 SP

**Priklausomybes:** Istorija 1 (Verifikavimo statuso pridejimas)

**Priemimo kriterijai:**

- **Duota**, kad Prisma schema yra atnaujinta,
  **Kai** programuotojas paleidzia migracija,
  **Tada** sukuriamas naujas AuditLog modelis su laukais: `id`, `action` (VERIFY, REJECT, REVERT), `entityType` (KINDERGARTEN, AUKLE, BURELIS, SPECIALIST), `entityId`, `previousStatus`, `newStatus`, `adminId`, `notes`, `createdAt`.

- **Duota**, kad administratorius patvirtina arba atmeta irasa (individualiai ar masiskai),
  **Kai** verifikavimo veiksmas yra sekmingai atliktas,
  **Tada** automatiskai sukuriamas AuditLog irasas su visa relevantiska informacija.

- **Duota**, kad administratorius naviguoja i audito zurnalo puslapi admin skydelyje,
  **Kai** puslapis uzsikrauna,
  **Tada** rodomas chronologinis veiksmu sarasas su filtravimo galimybemis pagal data, esybes tipa ir administratoriu.

- **Duota**, kad egzistuoja AuditLog irasai duomenu bazeje,
  **Kai** bet kas bando istrinti arba redaguoti AuditLog irasa per API,
  **Tada** sistema atmeta uzklausa su klaidos pranestimu, nes audito irasai yra nekeiciami.

---

## Istorija 7: Verifikavimo statistikos

**Pavadinimas:** Verifikavimo progreso metrikos ir statistikos dashboard

**Aprasymas:** Sukurti statistikos valdiklius administratoriaus skydelyje, rodancius verifikavimo progresa: bendras patikrintu/nepatikrintu/atmestu irasu procentas, progreso juostos pagal esybes tipa, verifikavimo greicio metrikos (kiek irasu patikrinta per diena/savaite) ir tendenciju grafikai. Tai padeda administratoriams stebeti verifikavimo darbo eiga.

**Istorijos taskai:** 3 SP

**Priklausomybes:** Istorija 1 (Verifikavimo statuso pridejimas), Istorija 6 (Audito zurnalas)

**Priemimo kriterijai:**

- **Duota**, kad administratorius atidaro verifikavimo statistikos puslapi,
  **Kai** puslapis uzsikrauna,
  **Tada** rodomas bendras verifikavimo progresas procentais su progreso juosta kiekvienam esybes tipui (darzeliai: X% patikrinta, aukles: Y% patikrinta ir t.t.).

- **Duota**, kad administratorius perziuri statistikos puslapi,
  **Kai** duomenu bazeje yra AuditLog irasu,
  **Tada** rodoma verifikavimo greicio metrika: vidutinis patikrintu irasu skaicius per diena ir per savaite.

- **Duota**, kad administratorius perziuri statistikos puslapi,
  **Kai** jis pasirenka laiko intervala (pvz., paskutines 7 dienos, 30 dienu),
  **Tada** statistikos atnaujinamos rodyti tik pasirinkto laikotarpio duomenis.

- **Duota**, kad visi tam tikro tipo irasai yra patikrinti (100% VERIFIED),
  **Kai** administratorius perziuri statistika,
  **Tada** to tipo progreso juosta rodo 100% ir specialu „Uzbaigta" zenkliuka.

---

## Technines pastabos

- Verifikavimo enum turetu buti apibreziamas Prisma schemoje kaip `enum VerificationStatus { UNVERIFIED VERIFIED REJECTED }`
- API endpointai: `PATCH /api/admin/verification/[entityType]/[id]` ir `PATCH /api/admin/verification/bulk`
- Audito zurnalas turetu naudoti Prisma middleware arba service layer pattern automatiniam irasymui
- Visi API endpointai turi buti apsaugoti admin autentifikacija per HMAC tokenus
- Frontend komponentai turi naudoti esama Tailwind CSS stiliu sistema ir ScrollReveal animacijas
