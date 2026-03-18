# Epikas 2: Vartotoju Pasiulymu Sistema

## Apzvalga

**Pavadinimas:** Vartotoju Pasiulymu Sistema
**Tikslas:** Sukurti sistema, leidziancia vartotojams siulyti naujus irasus (darzelius, aukles, burelius, specialistus) platformai, su pilnu pasiulymu perziuros, patvirtinimo ir atmetimo darbo eigos procesu administratoriaus puseje. Tai padidins platformos duomenu apimti ir bendruomenes itraukima.
**Bendri istorijos taskai:** 34 SP
**Prioritetas:** Vidutinis-Aukstas

---

## Istorija 1: Submission duomenu modelis

**Pavadinimas:** Pasiulymo (Submission) duomenu modelio sukurimas

**Aprasymas:** Sukurti nauja Prisma Submission modeli, kuris saugos vartotoju pateiktus pasiulymus prideti naujus irasus i platforma. Modelis turi tureti statuso lauka (PENDING, APPROVED, REJECTED), visus reikalingus duomenu laukus (pavadinimas, adresas, telefonas, el. pastas, aprasymas, esybes tipas), pateikejo informacija ir laiko zymes. Modelis turi buti lankstus, kad tiktu visiems keturiems esybiu tipams.

**Istorijos taskai:** 3 SP

**Priklausomybes:** Jokiu — tai yra pagrindine istorija, nuo kurios priklauso kitos sio epiko istorijos.

**Priemimo kriterijai:**

- **Duota**, kad Prisma schema yra atnaujinama,
  **Kai** programuotojas paleidzia migracija,
  **Tada** sukuriamas Submission modelis su laukais: `id`, `status` (enum: PENDING, APPROVED, REJECTED), `entityType` (enum: KINDERGARTEN, AUKLE, BURELIS, SPECIALIST), `name`, `address`, `city`, `phone`, `email`, `website`, `description`, `submitterName`, `submitterEmail`, `submitterPhone`, `adminNotes`, `reviewedBy`, `reviewedAt`, `createdAt`, `updatedAt`.

- **Duota**, kad Submission modelis yra sukurtas,
  **Kai** programuotojas generuoja Prisma klienta,
  **Tada** TypeScript tipai teisingai atspindi visus modelio laukus ir enum reiksmes.

- **Duota**, kad Submission modelis turi `status` lauka,
  **Kai** naujas irasas yra kuriamas,
  **Tada** numatytoji `status` reiksme yra PENDING.

- **Duota**, kad migracija yra sukurta,
  **Kai** ji yra paleista gamybos ir testavimo aplinkose,
  **Tada** migracija sekmingai pritaikoma be duomenu praradimo esamose lentelese.

---

## Istorija 2: Pasiulymo forma

**Pavadinimas:** Vieša forma nauju irasu pasiulymui

**Aprasymas:** Sukurti patogia ir intuityvią vieša forma, leidziancia vartotojams pasiulyti nauja darżeli, aukle, bureli arba specialista. Forma turi buti pasiekiama is pagrindines navigacijos ir adaptyvi mobiliesiems irenginiams. Laukai turi dinamiškai keistis priklausomai nuo pasirinkto esybes tipo. Forma turi tureti keliu žingsniu (multi-step) isdestyma geresnes vartotojo patirties uztikrinimui.

**Istorijos taskai:** 8 SP

**Priklausomybes:** Istorija 1 (Submission duomenu modelis)

**Priemimo kriterijai:**

- **Duota**, kad vartotojas naviguoja i pasiulymo formos puslapi (`/pasiulyti`),
  **Kai** puslapis uzsikrauna,
  **Tada** rodoma forma su pirmu zingsniu — esybes tipo pasirinkimu (darzelis, aukle, burelis, specialistas).

- **Duota**, kad vartotojas pasirinko esybes tipa „Darzelis",
  **Kai** jis pereina i kita zingsni,
  **Tada** rodomi tik darbeliui relevantisci laukai: pavadinimas, adresas, miestas, telefonas, el. pastas, svetaine, aprasymas, darbo laikas.

- **Duota**, kad vartotojas pasirinko esybes tipa „Aukle",
  **Kai** jis pereina i kita zingsni,
  **Tada** rodomi aukles specifiniai laukai: vardas/pavarde, miestas/rajonas, kontaktine informacija, patirties aprasymas, teikiamos paslaugos.

- **Duota**, kad vartotojas uzpilde visus privalomus laukus ir paspaudzia „Siulyti",
  **Kai** forma yra sekmingai pateikta,
  **Tada** sukuriamas naujas Submission irasas su PENDING statusu ir vartotojas mato sekmingo pateikimo pranesima su nuoroda, kad pasiulymas bus perziuretas administratoriaus.

- **Duota**, kad vartotojas naršo mobiliuoju irenginiu,
  **Kai** jis atidaro pasiulymo forma,
  **Tada** forma yra pilnai adaptyvi, laukai yra lengvai uzpildomi ir mygtukai pasiekiami viena ranka.

- **Duota**, kad pasiulymo formos puslapis yra sukurtas,
  **Kai** programuotojas tikrina middleware konfiguracija,
  **Tada** `/pasiulyti` marsrutas yra pridetas prie KNOWN_ROUTES saraso `src/middleware.ts` faile.

---

## Istorija 3: Formos validacija

**Pavadinimas:** Kliento ir serverio puses validacija su sanitarizavimo pipeline

**Aprasymas:** Igyvendinti dvieju lygiu validacijos sistema pasiulymo formai: kliento puses validacija realiuoju laiku (React Hook Form arba panasus sprendimas) ir serverio puses validacija API endpointe. Sukurti centralizuota sanitarizavimo pipeline, kuris pavalys visus ivestus duomenis nuo HTML tagu, potencialiai pavojingu simboliu ir normalzuos teksta pries issaugojima duomenu bazeje.

**Istorijos taskai:** 5 SP

**Priklausomybes:** Istorija 1 (Submission duomenu modelis), Istorija 2 (Pasiulymo forma)

**Priemimo kriterijai:**

- **Duota**, kad vartotojas pildо pasiulymo forma,
  **Kai** jis palieka privaloma lauka tuscia ir bando pereiti i kita zingsni,
  **Tada** po lauku rodomas klaidos pranesimas lietuviu kalba (pvz., „Pavadinimas yra privalomas").

- **Duota**, kad vartotojas iveda el. pasto adresa,
  **Kai** adresas neatitinka el. pasto formato (pvz., truksta @),
  **Tada** rodomas klaidos pranesimas „Ivestas neteisingas el. pasto adresas".

- **Duota**, kad vartotojas iveda teksta su HTML tagais (pvz., `<script>alert('xss')</script>`),
  **Kai** forma yra pateikta ir duomenys pasiekia serveri,
  **Tada** visi HTML tagai yra pasalinti pries issaugojima duomenu bazeje, paliekant tik gryna teksta.

- **Duota**, kad vartotojas iveda telefono numeri,
  **Kai** numeris neatitinka lietuvisko telefono formato,
  **Tada** rodomas klaidos pranesimas „Ivestas neteisingas telefono numeris" su pavyzdziu (pvz., „+370 6XX XXXXX").

- **Duota**, kad serverio puses validacija aptinka klaida,
  **Kai** API grazina klaidos atsakyma,
  **Tada** kliento puseje rodomas aiškus klaidos pranesimas vartotojui be technines informacijos atskeidimo.

- **Duota**, kad vartotojas iveda labai ilga teksta (>5000 simboliu) i aprasymo lauka,
  **Kai** forma yra pateikta,
  **Tada** tekstas yra apkarpomas iki maksimalaus leistino ilgio ir vartotojas yra informuojamas.

---

## Istorija 4: Admin pasiulymu perziura

**Pavadinimas:** Administratoriaus puslapis pasiulymu perziurai ir tvarkymui

**Aprasymas:** Sukurti administratoriaus skydelio puslapi, kuriame rodomi visi vartotoju pateikti pasiulymai su galimybe juos filtruoti pagal statusa ir esybes tipa, perziureti detalia informacija, ir priimti sprendima — patvirtinti arba atmesti. Puslapis turi rodyti pateikejo kontaktine informacija ir leisti administratoriui prideti vidines pastabas.

**Istorijos taskai:** 8 SP

**Priklausomybes:** Istorija 1 (Submission duomenu modelis)

**Priemimo kriterijai:**

- **Duota**, kad administratorius yra prisijunges prie admin skydelio,
  **Kai** jis naviguoja i pasiulymu perziuros puslapi,
  **Tada** rodomas visu pasiulymu sarasas su stulpeliais: pavadinimas, esybes tipas, statusas, pateikimo data, pateikejo vardas.

- **Duota**, kad administratorius yra pasiulymu sarase,
  **Kai** jis pasirenka filtra „Laukiantys perziuros" (PENDING),
  **Tada** rodomi tik tie pasiulymai, kuriu statusas yra PENDING, surusiuoti nuo seniausio.

- **Duota**, kad administratorius paspaudzia ant konkretaus pasiulymo,
  **Kai** atsidaro detalus rodinys,
  **Tada** rodoma visa pateikta informacija: visi formos laukai, pateikejo kontaktai, pateikimo data ir esamas statusas.

- **Duota**, kad administratorius perziuri pasiulymo detales,
  **Kai** jis paspaudzia „Patvirtinti" arba „Atmesti",
  **Tada** atsidaro patvirtinimo dialogas su galimybe prideti administratoriaus pastabas.

- **Duota**, kad administratorius atmetia pasiulyma su pastabomis,
  **Kai** veiksmas yra patvirtintas,
  **Tada** pasiulymo statusas keiciamas i REJECTED, `reviewedBy` ir `reviewedAt` laukai uzpildomi, o pastabos issaugomos `adminNotes` lauke.

---

## Istorija 5: Pasiulymo patvirtinimas

**Pavadinimas:** Patvirtinto pasiulymo konvertavimas i tikra esybes irasa

**Aprasymas:** Kai administratorius patvirtina pasiulyma, sistema turi automatiskai sukurti nauja irasa atitinkamoje esybiu lenteleje (Kindergarten, Aukle, Burelis arba Specialist) naudojant pasiulymo duomenis. Administratorius turi galeti redaguoti duomenis pries galutini patvirtinima. Naujas irasas turi buti pazymetas kaip `isUserAdded: true` ir gauti tinkamus numatytuosius laukus.

**Istorijos taskai:** 5 SP

**Priklausomybes:** Istorija 1 (Submission duomenu modelis), Istorija 4 (Admin pasiulymu perziura)

**Priemimo kriterijai:**

- **Duota**, kad administratorius paspaudzia „Patvirtinti" ant PENDING pasiulymo,
  **Kai** atsidaro patvirtinimo forma,
  **Tada** rodoma redaguojama forma su visais pasiulymo duomenimis, leidzianti administratoriui pataisyti informacija pries sukurima.

- **Duota**, kad administratorius patvirtina pasiulyma su esybes tipu „Darzelis",
  **Kai** jis paspaudzia galutinio patvirtinimo mygtuka,
  **Tada** sukuriamas naujas Kindergarten irasas duomenu bazeje su `isUserAdded: true`, o Submission statuso laukas pakeiciamas i APPROVED.

- **Duota**, kad pasiulymo konvertavimas i esybe yra vykdomas,
  **Kai** ivyksta klaida kuriant nauja irasa (pvz., dublikatas),
  **Tada** Submission statusas lieka PENDING, administratorius mato klaidos pranesima, ir jokiu dalinu pakeitimu nera atlikta (transakcija atšaukiama).

- **Duota**, kad naujas irasas yra sekmingai sukurtas is pasiulymo,
  **Kai** administratorius grizta i pasiulymu sarasa,
  **Tada** patvirtintas pasiulymas rodo APPROVED statusa su nuoroda i naujai sukurta irasa.

- **Duota**, kad naujas irasas yra sukurtas per pasiulymo patvirtinima,
  **Kai** vartotojas naršo atitinkama miesto puslapi,
  **Tada** naujas irasas yra matomas sarase (jei verifikavimo sistema isijungta — su UNVERIFIED statusu).

---

## Istorija 6: El. pašto pranesimai

**Pavadinimas:** El. pasto pranesimai pateikejui apie pasiulymo statusa

**Aprasymas:** Igyvendinti automatini el. pasto pranesimu siuntima pasiulymo pateikejui, kai administratorius patvirtina arba atmeta jo pasiulyma. Laiskas turi buti lietuviu kalba, tureti profesionalu dizaina ir aiškiai komunikuoti sprendima. Patvirtinimo atveju — pranesti, kad irasas pridetas. Atmetimo atveju — paaiskinanti priezasti (jei administratorius ja nurodé).

**Istorijos taskai:** 3 SP

**Priklausomybes:** Istorija 5 (Pasiulymo patvirtinimas)

**Priemimo kriterijai:**

- **Duota**, kad administratorius patvirtina pasiulyma,
  **Kai** Submission statusas yra pakeiciamas i APPROVED,
  **Tada** pateikejo el. pastu issiunciamas laiskas su tema „Jusu pasiulymas priimtas — Vaikai.lt" ir informacija, kad irasas buvo pridetas i platforma.

- **Duota**, kad administratorius atmeta pasiulyma su pastabomis,
  **Kai** Submission statusas yra pakeiciamas i REJECTED,
  **Tada** pateikejo el. pastu issiunciamas laiskas su tema „Del Jusu pasiulymo — Vaikai.lt" ir administratoriaus nurodyta atmetimo priezastis.

- **Duota**, kad pateikejo el. pasto adresas yra neteisingas arba neegzistuojantis,
  **Kai** sistema bando issiusti pranesima,
  **Tada** klaida yra uzregistruojama loguose, taciau administratoriaus veiksmas (patvirtinimas/atmetimas) nera atšaukiamas.

- **Duota**, kad el. pasto siuntimo paslauga yra laikinai nepasiekiama,
  **Kai** pasiulymas yra patvirtintas arba atmestas,
  **Tada** statusas vis tiek pakeiciamas sekmingai, o el. laisko siuntimas yra pakartojamas veliau (retry mechanizmas).

---

## Istorija 7: "Neradote?" CTA

**Pavadinimas:** Ragavimo veiksmo mygtukas paieškos rezultatuose

**Aprasymas:** Prideti „Neradote ko ieskojote?" ragavimo veiksmo (CTA) mygtuka, kuris atsiranda paieškos rezultatu puslapyje, kai paieška grazina mazai rezultatu arba visai jokiu. Mygtukas turi nukreipti vartotoja i pasiulymo forma su is anksto uzpildytu paieškos tekstu kaip pasiulymo pavadinimas. CTA taip pat gali buti rodomas miesto puslapio apatineje dalyje.

**Istorijos taskai:** 2 SP

**Priklausomybes:** Jokiu tiesiоginiu — gali buti igyvendinta nepriklausomai nuo kitu istoriju (reikia tik pasiulymo formos URL).

**Priemimo kriterijai:**

- **Duota**, kad vartotojas atlieka paieška ir rezultatu nera (0 rezultatu),
  **Kai** paieškos rezultatu puslapis uzsikrauna,
  **Tada** po „Nieko nerasta" prasinimu rodomas CTA blokas su tekstu „Neradote ko ieskojote? Pasiulykite nauja irasa!" ir mygtuku „Pasiulyti".

- **Duota**, kad vartotojas atlieka paieška ir rezultatu yra maziau nei 3,
  **Kai** paieškos rezultatu puslapis uzsikrauna,
  **Tada** po rezultatu saraso rodomas subtilus CTA su tekstu „Zinote dar? Pasiulykite nauja irasa musu platformai."

- **Duota**, kad vartotojas paspaudzia CTA mygtuka „Pasiulyti",
  **Kai** jis yra nukreipiamas i pasiulymo forma,
  **Tada** paieškos uzklausos tekstas yra automatiskai irasomas i formos pavadinimo lauka kaip pradine reiksme.

- **Duota**, kad vartotojas naršo miesto puslapi (pvz., `/vilnius`),
  **Kai** jis slenkia iki puslapio apacios,
  **Tada** rodomas CTA skyrelis su kvietimu pasiulyti nauja irasa tam miestui su nuoroda i forma, kurioje miestas yra is anksto pasirinktas.

---

## Technines pastabos

- Pasiulymo forma turetu buti naujame puslapyje `/pasiulyti` — butina prideti i KNOWN_ROUTES middleware
- Naudoti Prisma transakcijas pasiulymo patvirtinimui (Submission update + Entity create)
- El. pasto siuntimui galima naudoti Resend, Nodemailer arba panasu sprendima
- API endpointai: `POST /api/submissions` (viesam pateikimui), `GET/PATCH /api/admin/submissions/[id]` (admin perziurai)
- Formos validacijai rekomenduojama naudoti Zod schemas tiek kliento, tiek serverio puseje
- CTA komponentas turetu buti pakartotinai naudojamas (reusable) ir priimti props: `searchQuery`, `city`
