# Produkto Reikalavimų Dokumentas (PRD)

## Vaikai.lt — Duomenų Kokybės ir Vartotojų Pasiūlymų Sistema

**Versija:** 1.0
**Data:** 2026-03-18
**Autorius:** Daniel
**Statusas:** Paruoštas diegimui

---

## Turinys

1. [Santrauka](#1-santrauka)
2. [Problemos Aprašymas](#2-problemos-aprašymas)
3. [Vartotojų Istorijos](#3-vartotojų-istorijos)
4. [Funkciniai Reikalavimai](#4-funkciniai-reikalavimai)
5. [Nefunkciniai Reikalavimai](#5-nefunkciniai-reikalavimai)
6. [Sėkmės Metrikos](#6-sėkmės-metrikos)
7. [Neįeina į Apimtį](#7-neįeina-į-apimtį)
8. [Priklausomybės ir Rizikos](#8-priklausomybės-ir-rizikos)

---

## 1. Santrauka

Vaikai.lt yra lietuviška vaikų priežiūros paslaugų paieškos ir atsiliepimų platforma, apimanti darželius, aukles, būrelius ir specialistus. Šiuo metu duomenų bazėje yra **304 darželiai**, **~3823 atsiliepimai** bei šimtai auklių, būrelių ir specialistų įrašų. Tačiau esami duomenys neturi patikrinimo statuso — nėra galimybės atskirti patikrintus nuo nepatikrintų įrašų. Be to, vartotojai negali siūlyti naujų įstaigų, jei jų nerado platformoje.

Šis PRD aprašo dvi tarpusavyje susijusias sistemas:

1. **Duomenų kokybės ir verifikavimo sistema** — administratoriaus įrankiai kiekvienam įrašui suteikti verifikavimo statusą (nepatikrintas / patvirtintas / atmestas), su masinėmis operacijomis ir filtravimo galimybėmis.
2. **Vartotojų pasiūlymų sistema** — vieša forma, leidžianti vartotojams siūlyti naujus darželius, aukles, būrelius ar specialistus, su pilna apsauga nuo spam'o, botų ir kenkėjiškų įvedimų.

Abi sistemos integruojasi į esamą admin panelę (`/admin`) ir naudoja esamą technologinę bazę: Next.js 14 App Router, Prisma ORM, PostgreSQL (Neon), NextAuth autentifikaciją.

---

## 2. Problemos Aprašymas

### 2.1. Duomenų kokybės problema

Vaikai.lt duomenų bazėje esantys įrašai buvo sukurti iš įvairių šaltinių (seed skriptai, vartotojų pridejimai), tačiau **nė vienas neturi formalaus patikrinimo statuso**. Kiekvienas modelis (`Kindergarten`, `Aukle`, `Burelis`, `Specialist`) turi `isUserAdded` lauką, bet nėra mechanizmo atskirti, ar įrašas buvo patikrintas ir ar jo informacija yra teisinga.

**Pasekmės:**
- Vartotojai mato potencialiai pasenusią ar neteisingą informaciją (telefonai, adresai, darbo laikas)
- Nėra būdo filtruoti tik patikrintus įrašus
- Administratorius neturi centralizuoto darbo srauto duomenų tikrinimui
- Platformos patikimumas priklauso nuo duomenų kokybės — tai #1 priežastis, kodėl tėvai grįžta arba negrįžta

### 2.2. Vartotojų pasiūlymų trūkumas

Šiuo metu vartotojai gali tik rašyti atsiliepimus esamiems įrašams, bet **negali pasiūlyti naujo darželio, auklės ar kitos paslaugos**, jei jos nėra platformoje. Tai reiškia:

- Vartotojas, neradęs savo darželio, tiesiog palieka puslapį
- Platforma praranda vertingą bendruomenės turinį
- Duomenų bazė auga tik administratoriaus pastangomis

### 2.3. Saugumo kontekstas

Bet kokia vieša forma yra atakų vektorius. Esama sistema jau turi rate limiting infrastruktūrą (`src/lib/rate-limit.ts` su konfigūruojamais langais), XSS sanitizavimą ir CSP headerius. Nauja vartotojų pasiūlymų sistema privalo integruotis į šią saugumo infrastruktūrą ir ją papildyti CAPTCHA bei honeypot apsauga.

---

## 3. Vartotojų Istorijos

### 3.1. Duomenų verifikavimas (Administratorius)

#### US-1: Verifikavimo statuso peržiūra

> **Kaip** administratorius,
> **noriu** matyti kiekvieno įrašo verifikavimo statusą admin lentelėje,
> **kad** galėčiau greitai identifikuoti nepatikrintus įrašus.

**Priėmimo kriterijai:**

```
GIVEN administratorius yra prisijungęs prie admin panelės
  AND atidaro bet kurią įstaigų lentelę (darželiai, auklės, būreliai, specialistai)
WHEN lentelė užsikrauna
THEN kiekvienas įrašas turi matomą verifikavimo statuso žymę:
  - "Nepatikrintas" (pilka) — numatytasis
  - "Patvirtintas" (žalia)
  - "Atmestas" (raudona)
```

```
GIVEN administratorius mato įrašų lentelę
WHEN paspaudžia ant statuso filtro
THEN gali filtruoti pagal verifikavimo statusą (visi / nepatikrinti / patvirtinti / atmesti)
```

#### US-2: Individualus įrašo verifikavimas

> **Kaip** administratorius,
> **noriu** patvirtinti arba atmesti konkretų įrašą su komentaru,
> **kad** galėčiau sekti, kodėl įrašas buvo atmestas.

**Priėmimo kriterijai:**

```
GIVEN administratorius peržiūri konkretaus darželio / auklės / būrelio / specialisto detalę
WHEN paspaudžia "Patvirtinti" mygtuką
THEN įrašo verificationStatus keičiasi į "verified"
  AND verifiedAt užpildomas dabartine data
  AND verifiedBy užpildomas administratoriaus identifikatoriumi
  AND lentelėje statuso žymė pasikeičia į žalią "Patvirtintas"
```

```
GIVEN administratorius peržiūri konkretaus įrašo detalę
WHEN paspaudžia "Atmesti" mygtuką
  AND įveda atmetimo priežastį (privalomas laukas)
THEN įrašo verificationStatus keičiasi į "rejected"
  AND rejectionReason išsaugomas
  AND lentelėje statuso žymė pasikeičia į raudoną "Atmestas"
```

```
GIVEN administratorius yra patvirtinęs arba atmetęs įrašą
WHEN paspaudžia "Atstatyti į nepatikrintą"
THEN įrašo verificationStatus grįžta į "unverified"
  AND verifiedAt, verifiedBy, rejectionReason išvalomi
```

#### US-3: Masinės verifikavimo operacijos

> **Kaip** administratorius,
> **noriu** vienu veiksmu patvirtinti arba atmesti kelis įrašus,
> **kad** galėčiau efektyviai dirbti su dideliu kiekiu nepatikrintų duomenų.

**Priėmimo kriterijai:**

```
GIVEN administratorius mato įrašų lentelę
WHEN pažymi kelis įrašus (checkbox) arba paspaudžia "Pasirinkti visus matomus"
  AND paspaudžia "Patvirtinti pasirinktus"
THEN visi pasirinkti įrašai pakeičia statusą į "verified"
  AND rodomas patvirtinimo pranešimas su skaičiumi (pvz., "12 įrašų patvirtinta")
  AND lentelė atsinaujina
```

```
GIVEN administratorius pažymėjo kelis įrašus
WHEN paspaudžia "Atmesti pasirinktus"
  AND įveda bendrą atmetimo priežastį
THEN visi pasirinkti įrašai pakeičia statusą į "rejected"
  AND kiekvienam įrašui priskiria tą pačią atmetimo priežastį
```

```
GIVEN administratorius atlieka masinę operaciją su >50 įrašų
WHEN operacija vyksta
THEN rodomas progreso indikatorius
  AND operacija vykdoma batch'ais (po 50 įrašų) kad neapkrautų DB
```

#### US-4: Verifikavimo statistika

> **Kaip** administratorius,
> **noriu** matyti verifikavimo pažangos statistiką dashboard'e,
> **kad** žinočiau, kiek darbo dar liko.

**Priėmimo kriterijai:**

```
GIVEN administratorius atidaro admin dashboard'ą
WHEN puslapius užsikrauna
THEN mato verifikavimo statistikos kortelę su:
  - Bendras įrašų skaičius pagal tipą
  - Patikrintų / nepatikrintų / atmestų skaičiai ir procentai
  - Progreso juosta kiekvienam tipui
```

### 3.2. Vartotojų pasiūlymai

#### US-5: Naujo darželio siūlymas

> **Kaip** registruotas vartotojas,
> **noriu** pasiūlyti naują darželį, kurio nėra platformoje,
> **kad** kiti tėvai galėtų jį rasti ir palikti atsiliepimus.

**Priėmimo kriterijai:**

```
GIVEN registruotas vartotojas yra prisijungęs
  AND naršo darželių sąrašą konkrečiame mieste
WHEN neranda savo darželio ir paspaudžia "Nerandi? Siūlyk naują darželį"
THEN atidaroma pasiūlymo forma su laukais:
  - Pavadinimas (privalomas, 3-200 simbolių)
  - Miestas (privalomas, pasirinkimas iš esamų miestų)
  - Tipas (privatus / valstybinis)
  - Adresas (neprivalomas, max 300 simbolių)
  - Telefonas (neprivalomas, LT formato validacija)
  - Svetainė (neprivaloma, URL formato validacija)
  - Aprašymas (neprivalomas, max 1000 simbolių)
```

```
GIVEN vartotojas užpildė pasiūlymo formą teisingai
  AND praėjo CAPTCHA verifikaciją
WHEN paspaudžia "Siūlyti"
THEN forma išsiunčiama
  AND vartotojas mato patvirtinimo pranešimą: "Jūsų pasiūlymas priimtas! Administratorius jį peržiūrės per 24 val."
  AND įrašas sukuriamas su verificationStatus = "unverified" ir isUserAdded = true
  AND administratorius gauna pranešimą (Notification modelis)
```

```
GIVEN neregistruotas (anoniminis) vartotojas
WHEN paspaudžia "Siūlyk naują darželį"
THEN nukreipiamas į prisijungimo puslapį su grįžimo URL
  AND po prisijungimo grąžinamas atgal į pasiūlymo formą
```

#### US-6: Naujos auklės / būrelio / specialisto siūlymas

> **Kaip** registruotas vartotojas,
> **noriu** pasiūlyti naują auklę, būrelį arba specialistą,
> **kad** platforma turėtų daugiau aktualių paslaugų.

**Priėmimo kriterijai:**

```
GIVEN registruotas vartotojas naršo auklių / būrelių / specialistų sąrašą
WHEN paspaudžia "Nerandi? Siūlyk naują"
THEN atidaroma atitinkama pasiūlymo forma su laukais pagal tipą:

  Auklė:
  - Vardas (privalomas, 2-100 simbolių)
  - Miestas (privalomas)
  - Patirtis, amžiaus grupė, valandinis įkainis (neprivalomi)
  - Aprašymas (max 1000 simbolių)

  Būrelis:
  - Pavadinimas (privalomas, 3-200 simbolių)
  - Miestas (privalomas)
  - Kategorija, subkategorija (neprivalomi)
  - Amžiaus grupė, kaina, tvarkaraštis (neprivalomi)

  Specialistas:
  - Vardas (privalomas, 2-100 simbolių)
  - Miestas (privalomas)
  - Specializacija (privaloma)
  - Klinika, kaina (neprivalomi)
```

#### US-7: Administratorius peržiūri pasiūlymus

> **Kaip** administratorius,
> **noriu** peržiūrėti, redaguoti ir patvirtinti arba atmesti vartotojų pasiūlymus,
> **kad** galėčiau kontroliuoti kokybę prieš pasiūlymui pasirodant viešai.

**Priėmimo kriterijai:**

```
GIVEN administratorius atidaro admin panelę
WHEN yra naujų vartotojų pasiūlymų (isUserAdded=true AND verificationStatus="unverified")
THEN dashboard'e matomas pranešimo ženklelis su laukiančių pasiūlymų skaičiumi
  AND kiekvienoje kategorijos lentelėje galima filtruoti "Tik vartotojų pasiūlymai"
```

```
GIVEN administratorius peržiūri vartotojo pasiūlymą
WHEN paspaudžia "Redaguoti ir patvirtinti"
THEN gali redaguoti visus įrašo laukus (patikslinti adresą, telefoną ir kt.)
  AND paspaudus "Išsaugoti ir patvirtinti" — įrašas tampa verified ir matomas viešai
```

```
GIVEN administratorius peržiūri vartotojo pasiūlymą
WHEN paspaudžia "Atmesti"
  AND įveda atmetimo priežastį
THEN įrašo verificationStatus keičiasi į "rejected"
  AND pasiūlymą pateikęs vartotojas gauna pranešimą su priežastimi (per Notification modelį)
```

#### US-8: Dublikatų aptikimas

> **Kaip** sistema,
> **noriu** įspėti apie galimus dublikatus, kai vartotojas siūlo naują įrašą,
> **kad** būtų išvengta pasikartojančių duomenų.

**Priėmimo kriterijai:**

```
GIVEN vartotojas pildydamas formą įveda pavadinimą
WHEN pavadinimas atitinka (fuzzy match) esamą įrašą tame pačiame mieste
THEN po pavadinimo lauku rodomas perspėjimas:
  "Radome panašų įrašą: [Pavadinimas]. Gal jūs ieškote jo?"
  AND pateikiamas nuoroda į esamą įrašą
  AND vartotojas vis tiek gali tęsti siūlymą (ne blokuojantis perspėjimas)
```

```
GIVEN administratorius peržiūri naują pasiūlymą
WHEN sistema aptinka galimą dublikatą
THEN šalia pasiūlymo rodomas perspėjimas su nuoroda į esamą panašų įrašą
  AND administratorius gali pasirinkti: sujungti, patvirtinti kaip atskirą, arba atmesti
```

### 3.3. Saugumo istorijos

#### US-9: Apsauga nuo botų

> **Kaip** sistema,
> **noriu** blokuoti automatizuotus pasiūlymus,
> **kad** duomenų bazė nebūtų užteršta spam'u.

**Priėmimo kriterijai:**

```
GIVEN botas bando užpildyti pasiūlymo formą
WHEN užpildo paslėptą honeypot lauką (CSS hidden, name="website_url")
THEN forma yra tyliai atmetama (grąžina 200, bet neišsaugo duomenų)
  AND IP adresas užregistruojamas log'uose
```

```
GIVEN vartotojas (arba botas) siunčia pasiūlymo formą
WHEN CAPTCHA (Google reCAPTCHA v3 arba hCaptcha) verifikacija nepraėjo
THEN forma atmetama su klaidos pranešimu: "Nepavyko patvirtinti, kad esate tikras vartotojas"
  AND duomenys neišsaugomi
```

```
GIVEN vartotojas siunčia pasiūlymą
WHEN viršija rate limitą (3 pasiūlymai per 15 minučių)
THEN gauna 429 atsakymą su pranešimu: "Per daug užklausų. Bandykite vėliau."
  AND Retry-After headeris nurodo, kiek laukti
```

#### US-10: Apsauga nuo kenkėjiškų įvedimų

> **Kaip** sistema,
> **noriu** sanitizuoti ir validuoti visus vartotojų įvedimus,
> **kad** būtų išvengta XSS, SQL injection ir kitų atakų.

**Priėmimo kriterijai:**

```
GIVEN vartotojas įveda tekstą su HTML žymėmis (pvz., <script>alert('xss')</script>)
WHEN forma apdorojama serveryje
THEN visos HTML žymės pašalinamos PRIEŠ validaciją
  AND jei po sanitizavimo laukas tuščias — validacija nepraėjo
  AND duomenys išsaugomi tik kaip grynas tekstas
```

```
GIVEN vartotojas bando SQL injection (pvz., "'; DROP TABLE kindergartens; --")
WHEN forma apdorojama per Prisma ORM
THEN Prisma parametrizuoti užklausos automatiškai apsaugo nuo SQL injection
  AND papildoma validacija tikrina, ar įvestis neviršija maksimalaus ilgio
  AND neturi draudžiamų simbolių sekų
```

```
GIVEN vartotojas siunčia formą su per dideliu turiniu (>1MB)
WHEN serveris gauna užklausą
THEN užklausa atmetama su 413 statuso kodu
  AND atsakyme pateikiamas pranešimas: "Per didelis užklausos dydis"
```

---

## 4. Funkciniai Reikalavimai

### 4.1. Duomenų modelio pakeitimai

#### FR-1: Verifikavimo laukai visuose entiteto modeliuose

Prie kiekvieno iš keturių pagrindinių modelių (`Kindergarten`, `Aukle`, `Burelis`, `Specialist`) pridedami šie laukai:

| Laukas | Tipas | Numatytoji reikšmė | Aprašymas |
|--------|-------|---------------------|-----------|
| `verificationStatus` | `String` | `"unverified"` | Galimos reikšmės: `unverified`, `verified`, `rejected` |
| `verifiedAt` | `DateTime?` | `null` | Data, kada įrašas buvo patvirtintas/atmestas |
| `verifiedBy` | `String?` | `null` | Patvirtinusio administratoriaus ID arba identifikatorius |
| `rejectionReason` | `String?` | `null` | Atmetimo priežastis (privaloma atmetant) |
| `submittedBy` | `String?` | `null` | Vartotojo ID, kuris pasiūlė įrašą (jei `isUserAdded=true`) |

**Indeksai:**
- `@@index([verificationStatus])` — filtrui pagal statusą
- `@@index([isUserAdded, verificationStatus])` — vartotojų pasiūlymų filtravimui

#### FR-2: Prisma migracija

- Sukuriama nauja Prisma migracija su `ALTER TABLE` operacijomis
- Visi esami įrašai automatiškai gauna `verificationStatus = "unverified"`
- Migracija neturi pakeisti esamų duomenų struktūros ar prarasti duomenų
- Migracija turi būti atgalinio suderinamumo (backward-compatible)

### 4.2. Admin verifikavimo API

#### FR-3: Individualaus įrašo verifikavimas

**Endpoint:** `PATCH /api/admin/{itemType}/{id}`

Esami admin PATCH endpointai (`src/app/api/admin/darzeliai/[id]/route.ts` ir kt.) papildomi verifikavimo operacija.

**Request body (verifikavimas):**
```json
{
  "verificationStatus": "verified" | "rejected",
  "rejectionReason": "Priežastis..." // privalomas tik kai status = "rejected"
}
```

**Verslo logika:**
- Leidžiami tik `verificationStatus` perėjimai: `unverified -> verified`, `unverified -> rejected`, `verified -> unverified`, `rejected -> unverified`
- Kai `verificationStatus = "verified"`: užpildomas `verifiedAt` ir `verifiedBy`
- Kai `verificationStatus = "rejected"`: `rejectionReason` privalomas (min 5 simboliai)
- Kai `verificationStatus = "unverified"`: išvalomi `verifiedAt`, `verifiedBy`, `rejectionReason`

**Atsakymas:** Atnaujinto įrašo JSON su nauju verifikavimo statusu.

#### FR-4: Masinės verifikavimo operacijos

**Endpoint:** `POST /api/admin/{itemType}/bulk-verify`

**Request body:**
```json
{
  "ids": ["id1", "id2", ...],
  "action": "verify" | "reject" | "reset",
  "rejectionReason": "Priežastis..." // privalomas tik kai action = "reject"
}
```

**Verslo logika:**
- Maksimalus vieno batch'o dydis: 100 įrašų
- Jei pateikiama daugiau nei 100 ID — grąžinama 400 klaida
- Operacija vykdoma Prisma `updateMany` per vieną transakciją
- Jei dalis ID neegzistuoja — ignoruojami, atnaujinami tik esami
- Atsakyme grąžinamas atnaujintų įrašų skaičius

**Atsakymas:**
```json
{
  "success": true,
  "updated": 45,
  "message": "45 įrašų statusas pakeistas į 'verified'"
}
```

#### FR-5: Verifikavimo filtravimas lentelėse

Esami admin GET endpointai (`/api/admin/darzeliai`, `/api/admin/aukles` ir kt.) papildomi filtravimo parametrais:

- `?verificationStatus=unverified|verified|rejected` — filtruoti pagal statusą
- `?isUserAdded=true|false` — filtruoti tik vartotojų pasiūlymus
- Galimi kombinuoti su esamais filtrais (city, search ir kt.)

#### FR-6: Verifikavimo statistikos API

**Endpoint:** `GET /api/admin/stats`

Esamas statistikos endpointas papildomas verifikavimo duomenimis:

```json
{
  "verification": {
    "kindergartens": { "total": 304, "verified": 150, "unverified": 140, "rejected": 14 },
    "aukles": { "total": 210, "verified": 80, "unverified": 120, "rejected": 10 },
    "bureliai": { "total": 210, "verified": 90, "unverified": 110, "rejected": 10 },
    "specialists": { "total": 160, "verified": 60, "unverified": 90, "rejected": 10 }
  },
  "pendingSubmissions": 5
}
```

### 4.3. Vartotojų pasiūlymų sistema

#### FR-7: Pasiūlymo forma (frontend)

Kiekvienoje kategorijos puslapyje (`/[city]`) pridedamas mygtukas "Nerandi? Siūlyk naują", kuris:

- **Registruotiems vartotojams:** atveria modalą arba atskirą puslapį su forma
- **Neregistruotiems:** peradresuoja į `/prisijungti?callbackUrl=/[city]?suggest=[itemType]`

Formos laukai priklauso nuo entiteto tipo (žr. US-5, US-6). Bendri reikalavimai:

- Visi tekstiniai laukai turi `maxLength` apribojimą (atributas `maxlength` HTML ir server-side validacija)
- Miestas pasirenkamas iš dropdown'o su esamų miestų sąrašu (43 miestai)
- Telefonas validuojamas pagal LT formatą: `+370XXXXXXXX` arba `8XXXXXXXXX`
- Svetainės URL validuojamas: turi prasidėti `http://` arba `https://`
- Forma turi honeypot lauką (paslėptas CSS, name="website_url" arba pan.)
- CAPTCHA widgetas rodomas prieš pateikimo mygtuką

#### FR-8: Pasiūlymo API

**Endpoint:** `POST /api/suggestions`

**Request body (darželio pavyzdys):**
```json
{
  "itemType": "kindergarten",
  "data": {
    "name": "Darželis Saulutė",
    "city": "vilnius",
    "type": "privatus",
    "address": "Žirmūnų g. 50",
    "phone": "+37061234567",
    "website": "https://saulute.lt",
    "description": "Privatus darželis Žirmūnuose..."
  },
  "captchaToken": "...",
  "honeypot": ""
}
```

**Verslo logika:**
1. Tikrinama, ar vartotojas autentifikuotas (NextAuth session)
2. Tikrinama, ar vartotojas nėra užblokuotas (`isBlocked = false`)
3. Tikrinama rate limit (3 pasiūlymai per 15 minučių per vartotoją)
4. Tikrinamas honeypot — jei užpildytas, tyliai atmetama (grąžina 200)
5. Tikrinamas CAPTCHA token per atitinkamo providerio API
6. Sanitizuojami visi tekstiniai laukai (HTML žymių pašalinimas)
7. Validuojami laukai pagal tipą (ilgiai, formatai, privalomumas)
8. Tikrinama dublikatų (fuzzy pavadinimo paieška tame pačiame mieste)
9. Generuojamas slug iš pavadinimo
10. Sukuriamas įrašas su `isUserAdded = true`, `verificationStatus = "unverified"`, `submittedBy = userId`
11. Sukuriamas Notification administratoriui

**Atsakymas (sėkmė):**
```json
{
  "success": true,
  "message": "Jūsų pasiūlymas priimtas! Administratorius jį peržiūrės.",
  "duplicateWarning": null | { "id": "...", "name": "...", "slug": "..." }
}
```

#### FR-9: Dublikatų tikrinimas

**Endpoint:** `GET /api/suggestions/check-duplicate?itemType=kindergarten&name=Saulute&city=vilnius`

- Grąžina esamų įrašų sąrašą, kurių pavadinimas panašus (Levenshtein atstumas <= 3 arba `contains` paieška)
- Naudojamas realiu laiku, kai vartotojas pildydamas formą įveda pavadinimą (debounce 500ms)
- Rate limit: 10 užklausų per minutę

#### FR-10: Vartotojo pasiūlymų istorija

**Endpoint:** `GET /api/suggestions/my`

- Grąžina prisijungusio vartotojo visus pasiūlymus su jų statusais
- Vartotojas gali matyti, ar jo pasiūlymas laukia, patvirtintas ar atmestas
- Jei atmestas — matoma atmetimo priežastis

### 4.4. Admin UI pakeitimai

#### FR-11: Lentelių papildymas verifikavimo stulpeliu

Visuose admin lentelių puslapiuose (`/admin/darzeliai`, `/admin/aukles`, `/admin/bureliai`, `/admin/specialistai`):

- Pridedamas **Statusas** stulpelis su spalvota žyme
- Pridedamas **filtro dropdown'as** virš lentelės: Visi / Nepatikrinti / Patvirtinti / Atmesti / Vartotojų pasiūlymai
- Pridedamas **checkbox** kiekvienoje eilutėje masinėms operacijoms
- Pridedamas **masinių veiksmų toolbar'as** (rodomas tik kai pažymėti > 0 įrašų):
  - "Patvirtinti pasirinktus (N)" mygtukas
  - "Atmesti pasirinktus (N)" mygtukas
  - "Atšaukti pasirinkimą"

#### FR-12: Verifikavimo veiksmai įrašo detalėje

Atidarant įrašo redagavimo modalą / formą:

- Rodomas dabartinis verifikavimo statusas su data ir verifikuotojo vardu
- Mygtukai "Patvirtinti", "Atmesti", "Atstatyti" pagal dabartinį statusą
- Jei įrašas yra vartotojo pasiūlymas — rodomas pasiūliusio vartotojo vardas ir el. paštas
- Atmetimo dialoge — privalomas priežasties laukas (min 5 simboliai)

#### FR-13: Dashboard'o papildymas

Admin dashboard'e (`/admin/page.tsx`) pridedamos:

- **Verifikavimo progreso kortelė** su progreso juostomis kiekvienam tipui
- **Vartotojų pasiūlymų skaičius** su nuoroda į filtruotą vaizdą
- **Laukiantys pasiūlymai** recent activity sąraše

### 4.5. Viešo puslapio pakeitimai

#### FR-14: "Siūlyk naują" mygtukas

Kiekviename miesto puslapyje (`/[city]`), CityPageClient komponente:

- Virš rezultatų sąrašo arba po filtravimo juostos pridedamas mygtukas / nuoroda
- Mygtukas stilizuotas subtiliai, neužgožiantis pagrindinės navigacijos
- Tekstas priklauso nuo pasirinkto tipo: "Nerandi darželio? Siūlyk naują" / "Nerandi auklės?" ir t.t.

#### FR-15: Verifikavimo ženklelis viešuose įrašuose

Viešuose miesto puslapiuose ir paieškos rezultatuose:

- Patvirtinti įrašai gali turėti subtilų "Patikrinta" ženklelį (žalia varnelė)
- Nepatikrinti rodomi be ženklelio (nieko neslepiama — visi matomi)
- Atmesti įrašai **NERODOMI** viešuose sąrašuose (filtruojami server-side)
- `isUserAdded = true` įrašai su `verificationStatus = "unverified"` taip pat **NERODOMI** viešai (matomi tik po admin patvirtinimo)

---

## 5. Nefunkciniai Reikalavimai

### 5.1. Saugumas

| ID | Reikalavimas | Detalės |
|----|-------------|---------|
| NFR-S1 | **Rate limiting** | Pasiūlymų forma: 3 per 15 min per vartotoją. Dublikatų tikrinimas: 10 per min. Naudoti esamą `checkRateLimit` iš `src/lib/rate-limit.ts` su nauju `RATE_LIMITS.SUGGESTION_POST` ir `RATE_LIMITS.SUGGESTION_CHECK` |
| NFR-S2 | **CAPTCHA** | Google reCAPTCHA v3 (score-based) arba hCaptcha. Server-side token verifikacija per atitinkamo providerio API. Minimalus score: 0.5 |
| NFR-S3 | **Honeypot** | Paslėptas laukas CSS `position: absolute; left: -9999px; opacity: 0; pointer-events: none; tab-index: -1`. Jei užpildytas — tylusis atmetimas (200 OK, bet neišsaugoma) |
| NFR-S4 | **Įvedimų sanitizavimas** | HTML žymės šalinamos PRIEŠ validaciją (esama logika). Maksimalūs ilgiai: pavadinimas 200, aprašymas 1000, kiti tekstiniai laukai 300 |
| NFR-S5 | **SQL injection apsauga** | Prisma ORM parametrizuotos užklausos. Papildoma validacija: neleidžiami `'; --`, `DROP TABLE`, `UNION SELECT` fragmentai tekstiniuose laukuose |
| NFR-S6 | **XSS apsauga** | Esami CSP headeriai middleware'e. Visi vartotojo tekstai rodomi per React (automatinis escapinimas). Jokių `dangerouslySetInnerHTML` |
| NFR-S7 | **Autorizacija** | Pasiūlymo API reikalauja NextAuth sesijos. Admin API reikalauja admin rolės. Bulk operacijos reikalauja admin rolės |
| NFR-S8 | **Request body limitas** | Maksimalus payload dydis: 100KB pasiūlymams. Next.js config `api.bodyParser.sizeLimit` |
| NFR-S9 | **Audito logai** | Visos verifikavimo operacijos loginamos: kas, kada, ką pakeitė, iš kokio statuso į kokį |

### 5.2. Našumas

| ID | Reikalavimas | Detalės |
|----|-------------|---------|
| NFR-P1 | **Masinių operacijų greitis** | Bulk verify 100 įrašų turi užtrukti < 2 sekundės |
| NFR-P2 | **Verifikavimo filtravimas** | Filtravimas pagal statusą turi naudoti DB indeksą ir atsakyti per < 200ms |
| NFR-P3 | **Dublikatų tikrinimas** | `check-duplicate` API turi atsakyti per < 300ms (naudoti DB `contains` + indeksą pagal miestą) |
| NFR-P4 | **Formos pateikimas** | Pasiūlymo forma turi būti interaktyvi per < 100ms, pilnas ciklas (submit -> response) per < 1s |
| NFR-P5 | **Statistikos cache** | Verifikavimo statistika admin dashboard'e gali būti kešuojama 60s (TTL cache) |
| NFR-P6 | **Viešų sąrašų filtravimas** | Atmestų ir nepatvirtintų vartotojų pasiūlymų filtravimas turi būti serveryje (ne kliento pusėje), naudojant `WHERE` sąlygą |

### 5.3. Prieinamumas (Accessibility)

| ID | Reikalavimas | Detalės |
|----|-------------|---------|
| NFR-A1 | **Klaviatūros navigacija** | Visos formos, mygtukai, checkbox'ai pasiekiami Tab + Enter/Space |
| NFR-A2 | **Screen reader** | Verifikavimo statuso žymės turi `aria-label` (pvz., `aria-label="Statusas: patvirtintas"`) |
| NFR-A3 | **Spalvų kontrastas** | Statuso žymės turi >= 4.5:1 kontrasto santykį su fonu (WCAG AA) |
| NFR-A4 | **Klaidos pranešimai** | Formos validacijos klaidos susietos su laukais per `aria-describedby`, `aria-invalid` |
| NFR-A5 | **Honeypot prieinamumas** | Honeypot laukas turi `aria-hidden="true"` ir `tabindex="-1"`, kad screen readeriai ir Tab navigacija jį ignoruotų |
| NFR-A6 | **Progreso indikatorius** | Masinių operacijų progreso juosta turi `role="progressbar"` su `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

---

## 6. Sėkmės Metrikos

### 6.1. Duomenų kokybės metrikos

| KPI | Tikslas | Matavimo būdas | Terminas |
|-----|---------|----------------|----------|
| Patikrintų darželių procentas | >= 90% | `verified / total * 100` Kindergarten modelyje | 30 dienų po diegimo |
| Patikrintų auklių procentas | >= 80% | `verified / total * 100` Aukle modelyje | 45 dienų po diegimo |
| Patikrintų būrelių procentas | >= 80% | `verified / total * 100` Burelis modelyje | 45 dienų po diegimo |
| Patikrintų specialistų procentas | >= 80% | `verified / total * 100` Specialist modelyje | 45 dienų po diegimo |
| Atmestų įrašų procentas | < 15% | `rejected / total * 100` per visus tipus | Nuolatinis |
| Vidutinis verifikavimo laikas | < 48 val. nuo sukūrimo | `AVG(verifiedAt - createdAt)` | Po pirmo mėnesio |

### 6.2. Vartotojų pasiūlymų metrikos

| KPI | Tikslas | Matavimo būdas | Terminas |
|-----|---------|----------------|----------|
| Pasiūlymų per savaitę | >= 5 | `COUNT(WHERE isUserAdded=true AND createdAt >= 7d ago)` | Po 2 mėnesių |
| Pasiūlymų patvirtinimo rodiklis | >= 60% | `verified / (verified + rejected) * 100` kur `isUserAdded=true` | Nuolatinis |
| Vidutinis admin atsako laikas | < 24 val. | `AVG(verifiedAt - createdAt)` kur `isUserAdded=true` | Po 1 mėnesio |
| Spam'o praslydimo rodiklis | < 1% | Spam pasiūlymai, kurie praėjo visas apsaugas / visi bandymai | Nuolatinis |
| "Siūlyk naują" mygtuko paspaudimai | >= 2% CTR | Analytics eventai / puslapio peržiūros | Po 1 mėnesio |

### 6.3. Saugumo metrikos

| KPI | Tikslas | Matavimo būdas | Terminas |
|-----|---------|----------------|----------|
| Užblokuoti botų bandymai | Registruojami | Honeypot + CAPTCHA atmetimų logai | Nuolatinis |
| Rate limit atmetimai | < 5% visų užklausų | 429 atsakymų skaičius / visos užklausos | Nuolatinis |
| XSS/injection aptikimai | 0 praleistų | Sanitizavimo logai + periodinis auditas | Nuolatinis |

### 6.4. Verslo metrikos

| KPI | Tikslas | Matavimo būdas | Terminas |
|-----|---------|----------------|----------|
| Grįžtančių vartotojų procentas | +20% | Analytics returning visitors | Po 3 mėnesių |
| Puslapio bounce rate | -10% | Analytics bounce rate miestų puslapiuose | Po 2 mėnesių |
| Atsiliepimų augimas | +30% | Naujų atsiliepimų per mėnesį prieš vs. po | Po 3 mėnesių |

---

## 7. Neįeina į Apimtį

Šie elementai yra svarbūs, bet neįtraukti į šią iteraciją:

| Elementas | Priežastis | Galimas terminas |
|-----------|-----------|------------------|
| **Automatinis duomenų scraping'as** iš viešų šaltinių (rekvizitai.vz.lt, aikos.smm.lt) | Reikia atskiro teisinio ir techninio vertinimo | v2.0 |
| **AI-powered spam detektas** | Dabartinis CAPTCHA + honeypot + rate limit pakanka MVP | v2.0 |
| **Vartotojų reputacijos / pasitikėjimo sistema** | Per daug sudėtinga pradžiai; pakanka admin peržiūros | v2.0 |
| **Duomenų importas iš oficialių registrų** (ŠVIS, JAR) | Reikia oficialių API prieigų ir sutarčių | v2.0 |
| **Nuotraukų įkėlimas** prie pasiūlymų | Reikia failų saugojimo infrastruktūros (S3/Cloudinary) | v1.5 |
| **Vartotojo įrašo redagavimas** po pateikimo | Pradžioje tik admin gali redaguoti pasiūlymus | v1.5 |
| **Emailo pranešimai** vartotojams (pasiūlymo statusas) | Naudojami tik in-app Notification pranešimai | v1.5 |
| **Viešas "pasiūlymų" sąrašas** (laukiančių patvirtinimo) | Privatumo ir kokybės sumetimais — tik admin mato | v2.0 |
| **Automatinis verifikavimas** pagal taisykles (pvz., jei yra website ir phone — auto-verify) | Reikia daugiau duomenų apie klaidų procentą | v2.0 |
| **Mobiliosios programėlės** versija | Web first strategija | v3.0 |

---

## 8. Priklausomybės ir Rizikos

### 8.1. Techninės priklausomybės

| Priklausomybė | Tipas | Poveikis | Statusas |
|----------------|-------|----------|----------|
| **Prisma ORM migracija** | Duomenų bazė | Naujų laukų pridėjimas prie 4 modelių. Reikia `npx prisma migrate dev` ir `npx prisma generate`. Neon PostgreSQL palaiko `ALTER TABLE` be downtime | Paruošta |
| **NextAuth sesijos** | Autentifikacija | Pasiūlymų sistema reikalauja aktyvios sesijos. Esama NextAuth konfiguracija palaiko Google + credentials providerius | Veikia |
| **CAPTCHA provideris** | Išorinė paslauga | Google reCAPTCHA v3 (nemokamas iki 1M užklausų/mėn) arba hCaptcha. Reikia API raktų (`RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`) | Reikia sukonfigūruoti |
| **Esami admin API endpointai** | Backend | `src/app/api/admin/[itemType]/[id]/route.ts` ir `src/app/api/admin/[itemType]/route.ts` bus papildyti. Atgalinis suderinamumas būtinas | Veikia |
| **AdminTable komponentas** | Frontend | `src/components/admin/AdminTable.tsx` reikia papildyti checkbox, bulk actions ir statuso stulpeliu | Veikia |
| **Middleware KNOWN_ROUTES** | Routing | Jei kuriami nauji puslapiai (pvz., `/pasiulyti`), turi būti pridėti prie `KNOWN_ROUTES` masyvo `src/middleware.ts` | Reikia atnaujinti |

### 8.2. Rizikos ir mitigavimo planas

#### R1: Didelis kiekis nepatikrintų duomenų sukuria "audit fatigue"

- **Tikimybė:** Vidutinė
- **Poveikis:** Didelis — administratorius gali išsekti tikrinant 304+ darželius po vieną
- **Mitigavimas:**
  - Masinės operacijos (bulk verify) leidžia patvirtinti daugelį vienu paspaudimu
  - Filtravimas pagal miestą leidžia dirbti dalimis
  - Progreso indikatorius dashboard'e motyvuoja tęsti
  - Pirmenybė — pradėti nuo miestų su daugiausia lankytojų (Vilnius, Kaunas, Klaipėda)

#### R2: CAPTCHA provideris neveikia arba keičia kainas

- **Tikimybė:** Žema
- **Poveikis:** Vidutinis — be CAPTCHA botai gali spaminti pasiūlymus
- **Mitigavimas:**
  - Honeypot ir rate limiting veikia nepriklausomai nuo CAPTCHA
  - Abstrakcinis CAPTCHA sluoksnis kode leidžia lengvai pakeisti providerį
  - Feature flag CAPTCHA įjungimui/išjungimui (`NEXT_PUBLIC_CAPTCHA_ENABLED`)

#### R3: Vartotojai nepateikia pasiūlymų (maža adopcija)

- **Tikimybė:** Vidutinė
- **Poveikis:** Vidutinis — sistema veikia, bet nenaudojama
- **Mitigavimas:**
  - Aiškus ir matomas "Nerandi? Siūlyk naują" CTA kiekviename sąraše
  - Paprastas formos dizainas (tik privalomi laukai + nebūtina informacija)
  - Po patvirtinimo — vartotojas gauna pranešimą, kuris motyvuoja tęsti
  - Galimybė pridėti gamification elementus ateityje (v2.0)

#### R4: SQL injection per Prisma ORM apėjimą

- **Tikimybė:** Labai žema
- **Poveikis:** Kritinis — duomenų praradimas ar nutekėjimas
- **Mitigavimas:**
  - Prisma naudoja tik parametrizuotas užklausas — SQL injection praktiškai neįmanoma
  - Papildoma server-side validacija su `zod` schema kiekvienam laukui
  - Jokios `$queryRaw` ar `$executeRaw` be parametrų
  - Reguliarus priklausomybių auditas (`npm audit`)

#### R5: Masinė operacija sugadina duomenis (neteisingas bulk reject)

- **Tikimybė:** Žema
- **Poveikis:** Didelis — gali būti atmesti geri įrašai
- **Mitigavimas:**
  - Patvirtinimo dialogas prieš masinę operaciją su aiškiu įrašų skaičiumi
  - "Atstatyti" veiksmas leidžia grąžinti atgal į "unverified"
  - Audito logas fiksuoja visas operacijas su administratoriaus ID
  - Prisma migracija leidžia atstatyti per DB, jei reikia

#### R6: Neon PostgreSQL cold start lėtumas

- **Tikimybė:** Žema-vidutinė
- **Poveikis:** Žemas — pirma užklausa po neveiklumo gali užtrukti 1-3s
- **Mitigavimas:**
  - Neon "always-on" compute endpoint (jei biudžetas leidžia)
  - Verifikavimo statistikos kešavimas (60s TTL)
  - Optimistic UI atnaujinimai admin panelėje (rodyti statuso pakeitimą iš karto, nebelaukiant API)

#### R7: Honeypot lauką aptinka pažangūs botai

- **Tikimybė:** Žema
- **Poveikis:** Žemas — CAPTCHA ir rate limiting vis tiek veikia kaip papildomos apsaugos
- **Mitigavimas:**
  - Honeypot yra tik vienas iš trijų apsaugos sluoksnių (honeypot + CAPTCHA + rate limit)
  - Kaskart keisti honeypot lauko pavadinimą deploy metu (env kintamasis `HONEYPOT_FIELD_NAME`)
  - Stebėti honeypot atmetimų logus — jei skaičius krenta iki 0, gali reikšti adaptavimąsi

---

---

## Epikas 4: UX/UI Patobulinimai (Papildomas)

### Identifikuotos Problemos
1. **Formos reikalauja prisijungimo per vėlai** — vartotojas užpildo, tik tada sužino kad reikia auth → duomenys prarandami
2. **Navigacija galėtų būti geresnė** — trūksta breadcrumbs, „Back" logika neaiški
3. **Paieška galėtų rodyti instant rezultatus** — debounced dropdown
4. **Mobilios patirties optimizavimas** — filtrai, touch targets, scroll-to-top
5. **„Nerandi? Pasiūlyk!"** — proaktyvūs raginimai kai nėra rezultatų

Detali specifikacija: `epics/epic-4-ux-improvements.md`

---

*Šis dokumentas yra gyvas ir bus atnaujinamas pagal diegimo eigą ir grįžtamąjį ryšį.*
