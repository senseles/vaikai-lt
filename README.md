# Vaikai.lt — Vaikų priežiūros įstaigų apžvalgų platforma

Lietuviška platforma, padedanti tėveliams rasti ir palyginti darželius, aukles, būrelius ir vaikų specialistus visoje Lietuvoje. Vartotojai gali skaityti ir rašyti atsiliepimus, dalyvauti forumo diskusijose, ieškoti pagal miestą ir kategoriją.

---

## Turinys

- [Apie projektą](#apie-projektą)
- [Technologijos](#technologijos)
- [Funkcionalumas](#funkcionalumas)
- [Duomenų bazė](#duomenų-bazė)
- [Pradžia (Getting Started)](#pradžia-getting-started)
- [Aplinkos kintamieji (.env)](#aplinkos-kintamieji-env)
- [Komandinės eilutės](#komandinės-eilutės)
- [API endpoint'ai](#api-endpointai)
- [SEO](#seo)
- [Saugumas](#saugumas)
- [Kešavimas ir našumas](#kešavimas-ir-našumas)
- [Projekto struktūra](#projekto-struktūra)
- [Licencija](#licencija)

---

## Apie projektą

Vaikai.lt — tai didžiausia Lietuvos vaikų priežiūros paslaugų paieškos ir vertinimo platforma. Svetainė apjungia darželių, auklių, būrelių ir vaikų specialistų duomenis iš visos Lietuvos, leidžia tėvams palyginti paslaugų teikėjus, skaityti ir palikti atsiliepimus bei diskutuoti forumo bendruomenėje.

Platformoje šiuo metu yra:

- **~7 075** darželių (valstybinių, privačių, Montessori ir kt.)
- **~210** auklių profilių
- **~210** būrelių
- **~160** vaikų specialistų (logopedai, psichologai ir kt.)
- **~58 700** atsiliepimų su vertinimais
- **43** Lietuvos miestai su atskirais puslapiais
- **Forumas** su 8 kategorijomis, ~119 įrašų ir ~832 komentarų

---

## Technologijos

| Technologija | Versija | Paskirtis |
|---|---|---|
| [Next.js](https://nextjs.org) | 14.2 (App Router) | React karkasas su SSR/SSG ir API maršrutais |
| [React](https://react.dev) | 18.x | Vartotojo sąsajos biblioteka |
| [Prisma ORM](https://www.prisma.io) | 5.22 | Duomenų bazės ORM su tipų sauga |
| SQLite | — | Lengvasvorė reliacinė duomenų bazė |
| [Tailwind CSS](https://tailwindcss.com) | 3.4 | Utility-first CSS karkasas su dark mode |
| TypeScript | 5.x | Tipizuotas JavaScript |
| [tsx](https://github.com/privatenumber/tsx) | 4.21 | TypeScript seed skriptų paleidimas |

---

## Funkcionalumas

### Pagrindinis

- **Naršymas pagal miestą** — 43 Lietuvos miestai su dinaminiais puslapiais (SSG su `generateStaticParams`)
- **4 objektų tipai** — darželiai, auklės, būreliai, specialistai — kiekvienas su individualia kortele ir detalia informacija
- **Atsiliepimų sistema** — vertinimai (1–5 žvaigždutės), tekstiniai atsiliepimai su administratoriaus moderavimu
- **Globalinė paieška** — paieška per visus objektų tipus su realaus laiko pasiūlymais (autocomplete, maks. 8 rezultatai)
- **Mėgstamiausi** — objektų išsaugojimas per `localStorage` (be registracijos)
- **Tamsus režimas** — automatinis pagal sistemos nustatymus arba rankinis perjungimas, be FOUC (flash of unstyled content)
- **Filtravimas** — pagal tipą (valstybinis/privatus), reitingą, rajoną, kainą
- **Rūšiavimas** — pagal pavadinimą, reitingą, datą
- **Puslapiavimas** — efektyvus duomenų krovimas su serverine paginacija
- **Geolokacija** — „Rasti artimiausią miestą" funkcija per naršyklės API
- **Google Maps integravimas** — žemėlapio iframe'as objekto detalių lange

### Forumas

- **8 kategorijos** — darželiai, auklės, būreliai, specialistai, tėvystė, mokyklos, sveikata, laisvalaikis
- **Balsavimo sistema** — upvote/downvote su atominiu atnaujinimu (Prisma `$transaction`)
- **Gijiniai komentarai** — giluminės gijos iki 3 lygių su mobiliuoju optimizavimu
- **3 rūšiavimo režimai** — naujausi (`new`), populiariausi (`top`), „karšti" (`hot` — pagal balsų/laiko santykį)
- **Prisegti/užrakinti įrašai** — administratoriaus valdomas
- **Paieška forume** — pagal pavadinimą ir turinį
- **Anti-spam apsauga** — honeypot laukai, minimalaus laiko tikrinimas (3s)

### Administravimo skydelis

- **Statistikos dashboard'as** — objektų, atsiliepimų, forumo statistika su grafikais (atsiliepimų per dieną, objektų per savaitę)
- **Atsiliepimų moderavimas** — patvirtinimas, atmetimas, masinis valdymas (iki 100 vienu metu), šalinimas
- **CRUD operacijos** — pilnas darželių, auklių, būrelių, specialistų valdymas
- **Forumo valdymas** — įrašų prisegimas, užrakinimas, komentarų šalinimas
- **Duomenų eksportas** — JSON arba CSV formatu (su UTF-8 BOM dėl lietuviškų simbolių Excel'e)
- **Veiklos srautas** — paskutiniai 10 atsiliepimų ir forumo įrašų

### Vartotojų sistema

- **Registracija ir prisijungimas** — el. paštas + slaptažodis
- **HMAC-signed sesijos tokenai** — saugūs, stateless, Edge-compatible
- **30 dienų sesija** — httpOnly slapukai su `sameSite: strict`

### Mobilusis dizainas

- **Mobile-first responsive** — optimizuotas nuo 393px
- **Apatinė navigacija** — dedikuotas `MobileBottomNav` komponentas
- **44px minimalūs lietimo taikiniai** — visuose interaktyviuose elementuose
- **Scrollable tabs** — mobiliajame forume
- **Full-width mygtukai** — mobiliajame režime

### Kita

- **Slapukų sutikimas** — GDPR atitiktis (dinamiškai įkeltas komponentas)
- **Prieinamumas** — „Pereiti prie turinio" (skip to content) nuoroda, semantinis HTML
- **Kalbos kontekstas** — `LanguageProvider` su i18n žodynu
- **404 puslapis** — stilizuotas, lietuviškas, su nuoroda atgal
- **Error boundary** — globalinė klaidų tvarka (`error.tsx`, `global-error.tsx`)
- **Pranešimų sistema** — naujų atsiliepimų pranešimai administratoriui

---

## Duomenų bazė

### Schemos modeliai

| Modelis | Aprašymas | Apytikris kiekis |
|---|---|---|
| `Kindergarten` | Darželiai — pavadinimas, miestas, tipas, adresas, telefonas, svetainė, kalba, amžius, grupės, valandos, ypatybės | ~7 075 |
| `Aukle` | Auklės — patirtis, amžiaus grupė, valandinė kaina, kalbos, prieinamumas | ~210 |
| `Burelis` | Būreliai — kategorija, subkategorija, amžiaus grupė, kaina, tvarkaraštis | ~210 |
| `Specialist` | Vaikų specialistai — specializacija, klinika, kaina, kalbos | ~160 |
| `Review` | Atsiliepimai — vertinimas (1–5), tekstas, autorius, moderavimo būsena | ~58 700 |
| `User` | Registruoti vartotojai — el. paštas, slaptažodžio hash, rolė | — |
| `Favorite` | Mėgstamiausi — per sesijos ID | — |
| `ForumCategory` | Forumo kategorijos — pavadinimas, slug, aprašymas, ikona, eilė | 8 |
| `ForumPost` | Forumo įrašai — pavadinimas, turinys, autorius, balsai, peržiūros | ~119 |
| `ForumComment` | Forumo komentarai — turinys, autorius, balsai, self-referencing gijos | ~832 |
| `ForumVote` | Balsai — sesijos pagrindu, unikalūs per įrašą/komentarą | — |

### Indeksai

Visi pagrindiniai modeliai turi optimizuotus indeksus:

- **Objektai:** `city`, `city + baseRating`, `name`, `createdAt`
- **Atsiliepimai:** `itemId + itemType + isApproved`, `isApproved + createdAt`, `createdAt`
- **Forumas:** `categoryId + createdAt`, `slug`, `createdAt`, `upvotes`, `postId + createdAt`, `parentId`
- **Balsai:** `postId`, `commentId`, unikalūs `postId + sessionId` ir `commentId + sessionId`

### Ryšiai

```
ForumCategory 1───* ForumPost 1───* ForumComment (self-referencing, max 3 lygiai)
                                └───* ForumVote
ForumComment ───> ForumComment (tėvinis → vaikinis, parent-child)
User 1───* Review
Favorite ───> unique(itemId, itemType, sessionId)
```

---

## Pradžia (Getting Started)

### Reikalavimai

- Node.js 18+ (rekomenduojama 20 LTS)
- npm 9+

### Diegimas

```bash
# 1. Klonuoti repozitoriją
git clone <repository-url>
cd vaikai-lt

# 2. Įdiegti priklausomybes
npm install

# 3. Sukonfigūruoti aplinkos kintamuosius
#    Sukurkite .env failą projekto šaknyje (žr. skyrių žemiau)
echo 'DATABASE_URL="file:./dev.db"' > .env
echo 'ADMIN_PASSWORD=jusu_slaptazodis' >> .env

# 4. Sugeneruoti Prisma klientą
npx prisma generate

# 5. Sukurti duomenų bazę ir pritaikyti migracijas
npx prisma migrate deploy

# 6. Užpildyti duomenų bazę pradiniais duomenimis
npx tsx scripts/seed.ts                # Darželiai, auklės, būreliai, specialistai
npx tsx scripts/seed-reviews.ts        # Atsiliepimai
npx tsx scripts/seed-forum.ts          # Forumo kategorijos ir įrašai

# 7. Paleisti vystymo serverį
npm run dev
```

Svetainė bus pasiekiama adresu: [http://localhost:3000](http://localhost:3000)

### Produkcinis build'as

```bash
# Naudokite build-lock.sh — apsaugo nuo lygiagrečių build'ų
bash scripts/build-lock.sh
```

> **Svarbu:** Niekada nenaudokite `npx next build` tiesiogiai. Visada naudokite `bash scripts/build-lock.sh`, kuris sukuria lock failą `/tmp/vaikai-build.lock`, apsaugo nuo lygiagrečių build'ų, ir automatiškai perkrauna serverį sėkmingo build'o atveju.

### Produkcinis serveris su auto-restart

```bash
# Priekiniame plane
bash scripts/server.sh

# Foniniame plane
nohup bash scripts/server.sh &
```

---

## Aplinkos kintamieji (.env)

| Kintamasis | Privalomas | Aprašymas | Pavyzdys |
|---|---|---|---|
| `DATABASE_URL` | Taip | SQLite duomenų bazės kelias (Prisma formato) | `file:./dev.db` |
| `ADMIN_PASSWORD` | Taip | Administratoriaus prisijungimo slaptažodis | `mano_saugus_slaptazodis` |
| `ADMIN_SECRET` | Rekomenduojama | HMAC token'ų pasirašymo paslaptis (jei nenurodyta, naudoja `ADMIN_PASSWORD`) | `ilgas_atsitiktinis_raktas_64_simboliai` |
| `SITE_URL` | Ne | Svetainės URL (naudojamas SEO canonical nuorodose) | `https://vaikai.lt` |
| `NODE_ENV` | Ne | Aplinkos tipas (`development` arba `production`) | `production` |

> **Pastaba:** Produkcijoje būtinai nustatykite `ADMIN_SECRET` su ilgu atsitiktiniu raktu, atskirtu nuo `ADMIN_PASSWORD`.

---

## Komandinės eilutės

### npm komandos

| Komanda | Aprašymas |
|---|---|
| `npm run dev` | Paleisti vystymo serverį su hot-reload (http://localhost:3000) |
| `npm run build` | Sukurti produkcinį build'ą (geriau naudokite `build-lock.sh`) |
| `npm run start` | Paleisti produkcinį serverį (port 3000) |
| `npm run lint` | Paleisti ESLint kodo kokybės tikrinimą |

### Prisma komandos

| Komanda | Aprašymas |
|---|---|
| `npx prisma generate` | Sugeneruoti Prisma klientą iš schemos |
| `npx prisma migrate dev` | Sukurti ir pritaikyti naują migraciją (vystymui) |
| `npx prisma migrate deploy` | Pritaikyti migracijas (produkcijai) |
| `npx prisma db push` | Sinchronizuoti schemą su duomenų baze (be migracijos) |
| `npx prisma studio` | Atidaryti vizualų duomenų bazės redaktorių naršyklėje |

### Seed skriptai

| Skriptas | Aprašymas |
|---|---|
| `npx tsx scripts/seed.ts` | Pagrindiniai objektai (darželiai, auklės, būreliai, specialistai) |
| `npx tsx scripts/seed-reviews.ts` | Atsiliepimų generavimas |
| `npx tsx scripts/seed-forum.ts` | Forumo kategorijos ir įrašai |
| `npx tsx scripts/seed-forum-content.ts` | Papildomas forumo turinys |
| `npx tsx scripts/seed-expand.ts` | Duomenų bazės išplėtimas papildomais objektais |
| `npx tsx scripts/seed-kindergartens.ts` | Papildomi darželiai |
| `npx tsx scripts/seed-more.ts` | Papildomi duomenys |

### Serverio skriptai

| Skriptas | Aprašymas |
|---|---|
| `bash scripts/build-lock.sh` | Saugus produkcinis build'as su lock apsauga ir automatinu restartu |
| `bash scripts/server.sh` | Produkcinis serveris su automatinu restartu po crash'o |
| `bash scripts/restart.sh` | Perkrauti veikiantį serverį |
| `bash scripts/monitor.sh` | Stebėti serverio būseną |

---

## API endpoint'ai

Visi API maršrutai yra `/api/` prefikso. Administratoriaus endpoint'ai reikalauja autentifikacijos per `admin_token` slapuką arba `Authorization: Bearer <token>` antraštę.

### Viešieji — Objektai

| Metodas | Endpoint | Aprašymas | Parametrai |
|---|---|---|---|
| `GET` | `/api/kindergartens` | Darželių sąrašas | `city`, `region`, `type`, `search`, `ids`, `page`, `limit` |
| `GET` | `/api/kindergartens/[slug]` | Vienas darželis pagal slug | — |
| `GET` | `/api/aukles` | Auklių sąrašas | `city`, `search`, `page`, `limit` |
| `GET` | `/api/aukles/[slug]` | Viena auklė pagal slug | — |
| `GET` | `/api/bureliai` | Būrelių sąrašas | `city`, `search`, `page`, `limit` |
| `GET` | `/api/bureliai/[slug]` | Vienas būrelis pagal slug | — |
| `GET` | `/api/specialists` | Specialistų sąrašas | `city`, `search`, `page`, `limit` |
| `GET` | `/api/specialists/[slug]` | Vienas specialistas pagal slug | — |
| `GET` | `/api/cities` | Miestų sąrašas su objektų kiekiais | — |

### Viešieji — Paieška

| Metodas | Endpoint | Aprašymas | Parametrai |
|---|---|---|---|
| `GET` | `/api/search` | Globalinė paieška per visus tipus | `q` (min. 2 simboliai) |
| `GET` | `/api/search/suggestions` | Paieškos pasiūlymai (autocomplete) | `q` (min. 2 simboliai, maks. 8 rezultatai) |

### Viešieji — Atsiliepimai

| Metodas | Endpoint | Aprašymas | Parametrai/Body |
|---|---|---|---|
| `GET` | `/api/reviews` | Patvirtinti atsiliepimai | `itemId`, `itemType` (privalomi) |
| `POST` | `/api/reviews` | Naujas atsiliepimas (nepatvirtintas) | `itemId`, `itemType`, `authorName`, `rating` (1–5), `text` |
| `POST` | `/api/reviews/report` | Pranešti apie netinkamą atsiliepimą | `reviewId`, `reason` (neprivalomas) |

### Viešieji — Forumas

| Metodas | Endpoint | Aprašymas | Parametrai/Body |
|---|---|---|---|
| `GET` | `/api/forum/categories` | Forumo kategorijų sąrašas | — |
| `GET` | `/api/forum/posts` | Forumo įrašai | `category`, `sort` (`new`/`top`/`hot`), `search`, `page`, `limit` |
| `GET` | `/api/forum/posts/[slug]` | Vienas forumo įrašas su komentarais | — |
| `POST` | `/api/forum/posts` | Naujas forumo įrašas | `title`, `content`, `authorName`, `categorySlug`, `city` (neprivalomos) |
| `POST` | `/api/forum/comments` | Naujas komentaras | `postId`, `content`, `authorName`, `parentId` (neprivalomas, gijos) |
| `POST` | `/api/forum/vote` | Balsuoti už/prieš | `postId` arba `commentId`, `sessionId`, `value` (1 arba -1) |

### Viešieji — Autentifikacija

| Metodas | Endpoint | Aprašymas |
|---|---|---|
| `POST` | `/api/auth/register` | Vartotojo registracija (el. paštas, slaptažodis, vardas) |
| `POST` | `/api/auth/login` | Vartotojo prisijungimas |
| `POST` | `/api/auth/logout` | Atsijungimas (slapuko pašalinimas) |
| `GET` | `/api/auth/me` | Gauti prisijungusio vartotojo duomenis (HMAC validacija) |

### Administratoriaus API (reikalauja autentifikacijos)

| Metodas | Endpoint | Aprašymas |
|---|---|---|
| `POST` | `/api/admin/login` | Admin prisijungimas — grąžina HMAC-signed token slapuke (24h) |
| `GET` | `/api/admin/stats` | Statistikos dashboard'o duomenys (kiekiai, grafikai, veiklos srautas) |
| `GET` | `/api/admin/reviews` | Atsiliepimų sąrašas su filtrais (`pending`, `approved`, `itemType`, `rating`) |
| `PATCH` | `/api/admin/reviews` | Masinis patvirtinimas/atmetimas (`ids[]`, `action`: approve/reject) |
| `PATCH` | `/api/admin/reviews/[id]` | Vieno atsiliepimo patvirtinimas (tik `isApproved` laukas) |
| `DELETE` | `/api/admin/reviews/[id]` | Atsiliepimo ištrynimas |
| `GET` | `/api/admin/darzeliai` | Darželių sąrašas administravimui |
| `PATCH` | `/api/admin/darzeliai/[id]` | Darželio redagavimas |
| `GET` | `/api/admin/aukles` | Auklių sąrašas administravimui |
| `PATCH` | `/api/admin/aukles/[id]` | Auklės redagavimas |
| `GET` | `/api/admin/bureliai` | Būrelių sąrašas administravimui |
| `PATCH` | `/api/admin/bureliai/[id]` | Būrelio redagavimas |
| `GET` | `/api/admin/specialistai` | Specialistų sąrašas administravimui |
| `PATCH` | `/api/admin/specialistai/[id]` | Specialisto redagavimas |
| `GET`/`PATCH` | `/api/admin/forum` | Forumo įrašų valdymas (prisegimas, užrakinimas) |
| `DELETE` | `/api/admin/forum/comments` | Forumo komentarų šalinimas |
| `GET` | `/api/admin/export?format=json\|csv` | Visų duomenų eksportas (JSON arba CSV su UTF-8 BOM) |

---

## SEO

### Struktūrizuoti duomenys (JSON-LD)

| Tipas | Vieta | Aprašymas |
|---|---|---|
| `Organization` | Pagrindinis layout'as | Svetainės organizacijos informacija |
| `LocalBusiness` | Miestų puslapiai | Vietos verslo informacija su adresu |
| `BreadcrumbList` | Miestų puslapiai | Naršymo kelias (breadcrumbs) |
| `FAQPage` | Pagrindinis puslapis | Dažniausiai užduodami klausimai |
| `WebSite` + `SearchAction` | Pagrindinis puslapis | Paieškos integracija su Google |

### Meta duomenys

- **Open Graph** — `og:title`, `og:description`, `og:url`, `og:locale` (`lt_LT`), `og:type` visuose puslapiuose
- **Twitter Card** — `summary_large_image` formato kortelės
- **Dinaminė OG nuotrauka** — generuojama per `src/app/opengraph-image.tsx`
- **Canonical URL** — absoliučios `https://vaikai.lt/...` nuorodos visuose puslapiuose
- **Sitemap** (`/sitemap.xml`) — 43 miestai, 8 forumo kategorijos, ~119 forumo įrašų, statiniai puslapiai
- **robots.txt** (`/robots.txt`) — leidžia `/`, `/forumas`; blokuoja `/api/`, `/admin/`, `/prisijungti`, `/forumas/naujas`
- **`<html lang="lt">`** — teisingas kalbos žymėjimas
- **`noindex`** — mėgstamiausiuose ir prisijungimo puslapiuose
- **DNS prefetch / preconnect** — Google Maps, Google Fonts

---

## Saugumas

| Apsauga | Įgyvendinimas |
|---|---|
| **Admin autentifikacija** | HMAC-signed stateless tokenai per Web Crypto API (Edge-compatible), 24h galiojimas |
| **Vartotojų autentifikacija** | HMAC-signed sesijos tokenai (`userId:random:hmac` formatas), 30 dienų galiojimas |
| **CSRF apsauga** | Origin/Referer antraščių tikrinimas visuose rašymo endpoint'uose |
| **XSS prevencija** | HTML tag'ų pašalinimas prieš validaciją (`stripHtml`), tuščio turinio aptikimas |
| **SQL injection** | Prisma ORM — jokio tiesioginio SQL, parametrizuotos užklausos |
| **Rate limiting** | Admin login: 5 bandymai/15min, forumo įrašai: 3/5min, komentarai: 10/5min, atsiliepimai: 5/15s, balsai: 30/min, pranešimai: 3/min |
| **Anti-spam** | Honeypot laukai ir minimalaus pateikimo laiko tikrinimas (3s) forume |
| **Saugumo antraštės** | CSP, HSTS (1 metai + includeSubDomains), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, X-XSS-Protection |
| **Slapukai** | `httpOnly`, `secure` (produkcijoje), `sameSite: strict` |
| **Admin whitelist** | Atsiliepimų PATCH endpoint'as leidžia keisti tik `isApproved` lauką |
| **Permissions-Policy** | Kameros ir mikrofono blokavimas; geolokacija tik iš tos pačios kilmės (`self`) |
| **Turinio apribojimai** | Atsiliepimų tekstas maks. 2000 simb., autoriaus vardas maks. 100 simb., forumo turinys maks. 5000 simb. |
| **Objektų tikrinimas** | Atsiliepimų POST tikrina, ar nurodomas objektas egzistuoja duomenų bazėje |
| **`poweredByHeader: false`** | Pašalinta `X-Powered-By` antraštė Next.js konfigūracijoje |

---

## Kešavimas ir našumas

### In-memory cache

TTL pagrindu veikiantis serverio atminties kešas API atsakymams su automatinu valymu kas 60 sekundžių:

| Cache tipas | TTL | Paskirtis |
|---|---|---|
| `LIST` | 5 min (300s) | Objektų sąrašai (darželiai, auklės ir kt.) |
| `CITIES` | 10 min (600s) | Miestų sąrašas su kiekiais |
| `SEARCH` | 2 min (120s) | Paieškos rezultatai |

### Statiniai failai

- `favicon.svg`, `icons/*`, `_next/static/*` — `Cache-Control: public, max-age=31536000, immutable`

### Paveikslėlių optimizavimas

- Formatai: AVIF, WebP
- Cache TTL: 30 dienų
- Dydžiai: 640, 750, 828, 1080, 1200px (device), 16–256px (image)

### Našumo rodikliai

- Vidutinis atsakymo laikas: **~25ms**
- Greičiausias puslapis: `/robots.txt` — **4ms**
- Lėčiausias puslapis: `/paieska?q=darzelis` — **113ms**
- Joks endpoint neviršija **150ms**

---

## Projekto struktūra

```
vaikai-lt/
├── prisma/
│   ├── schema.prisma              # Duomenų bazės schema (11 modelių)
│   ├── migrations/                # Prisma migracijos
│   └── dev.db                     # SQLite duomenų bazė (gitignored)
├── scripts/
│   ├── build-lock.sh              # Saugus produkcinis build'as su lock apsauga
│   ├── server.sh                  # Produkcinis serveris su auto-restart
│   ├── restart.sh                 # Serverio perkrovimas
│   ├── monitor.sh                 # Serverio stebėjimas
│   ├── seed.ts                    # Pagrindiniai duomenys (objektai)
│   ├── seed-reviews.ts            # Atsiliepimų generavimas
│   ├── seed-forum.ts              # Forumo kategorijos ir įrašai
│   ├── seed-forum-content.ts      # Papildomas forumo turinys
│   ├── seed-expand.ts             # Papildomi objektai
│   ├── seed-kindergartens.ts      # Papildomi darželiai
│   └── seed-more.ts               # Papildomi duomenys
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Pagrindinis layout (Header, Footer, SEO, JSON-LD)
│   │   ├── page.tsx               # Pradinis puslapis (miestų tinklelis, DUK, paieška)
│   │   ├── globals.css            # Globalūs Tailwind stiliai
│   │   ├── error.tsx              # Klaidų puslapis
│   │   ├── global-error.tsx       # Globalinė klaidų tvarka
│   │   ├── not-found.tsx          # 404 puslapis
│   │   ├── sitemap.ts             # Dinaminis sitemap generavimas
│   │   ├── robots.ts              # robots.txt generavimas
│   │   ├── opengraph-image.tsx    # Dinaminė OG nuotrauka
│   │   ├── [city]/                # Dinaminiai miestų puslapiai (43 miestai)
│   │   │   ├── page.tsx           # Serverinis puslapis (generateStaticParams)
│   │   │   └── CityPageClient.tsx # Klientinis puslapis (filtrai, kortelės, paieška)
│   │   ├── admin/                 # Administratoriaus skydelis
│   │   │   ├── page.tsx           # Dashboard'as su statistika
│   │   │   ├── layout.tsx         # Admin layout su navigacija
│   │   │   ├── atsiliepimai/      # Atsiliepimų moderavimas
│   │   │   ├── darzeliai/         # Darželių CRUD
│   │   │   ├── aukles/            # Auklių CRUD
│   │   │   ├── bureliai/          # Būrelių CRUD
│   │   │   ├── specialistai/      # Specialistų CRUD
│   │   │   ├── forumas/           # Forumo valdymas
│   │   │   └── nustatymai/        # Nustatymai
│   │   ├── forumas/               # Forumo puslapiai
│   │   │   ├── page.tsx           # Forumo pagrindinis (kategorijos, įrašai)
│   │   │   ├── naujas/            # Naujo įrašo kūrimo puslapis
│   │   │   └── [category]/        # Kategorijų ir atskirų įrašų puslapiai
│   │   │       ├── page.tsx       # Kategorijos puslapis
│   │   │       └── [slug]/page.tsx # Konkretaus įrašo puslapis
│   │   ├── paieska/               # Paieškos puslapis
│   │   ├── megstamiausieji/       # Mėgstamiausi (localStorage)
│   │   ├── prisijungti/           # Prisijungimo / registracijos puslapis
│   │   ├── privatumo-politika/    # Privatumo politika
│   │   └── api/                   # API maršrutai
│   │       ├── kindergartens/     # Darželių API (GET, GET /[slug])
│   │       ├── aukles/            # Auklių API (GET, GET /[slug])
│   │       ├── bureliai/          # Būrelių API (GET, GET /[slug])
│   │       ├── specialists/       # Specialistų API (GET, GET /[slug])
│   │       ├── cities/            # Miestų API (GET)
│   │       ├── search/            # Paieškos API (GET, GET /suggestions)
│   │       ├── reviews/           # Atsiliepimų API (GET, POST, POST /report)
│   │       ├── forum/             # Forumo API (categories, posts, comments, vote)
│   │       ├── auth/              # Autentifikacijos API (register, login, logout, me)
│   │       └── admin/             # Admin API (login, stats, reviews, entities, forum, export)
│   ├── components/
│   │   ├── Header.tsx             # Navigacijos antraštė su paieška
│   │   ├── Footer.tsx             # Poraštė su nuorodomis
│   │   ├── DetailModal.tsx        # Objekto detalės (info, žemėlapis, atsiliepimai)
│   │   ├── SearchBar.tsx          # Paieškos juosta su autocomplete
│   │   ├── CitySelector.tsx       # Miestų tinklelis su geolokacija
│   │   ├── ForumClient.tsx        # Forumo klientinis komponentas
│   │   ├── ForumSubNav.tsx        # Forumo sub-navigacija
│   │   ├── ReviewForm.tsx         # Atsiliepimo pateikimo forma
│   │   ├── ReviewList.tsx         # Atsiliepimų sąrašas
│   │   ├── KindergartenCard.tsx   # Darželio kortelė
│   │   ├── AukleCard.tsx          # Auklės kortelė
│   │   ├── BurelisCard.tsx        # Būrelio kortelė
│   │   ├── SpecialistCard.tsx     # Specialisto kortelė
│   │   ├── CategoryTabs.tsx       # Kategorijų kortelės (darželiai/auklės/būreliai/specialistai)
│   │   ├── FavoriteButton.tsx     # Mėgstamiausio mygtukas
│   │   ├── StarRating.tsx         # Žvaigždučių vertinimo komponentas
│   │   ├── MobileBottomNav.tsx    # Mobilusis navigacijos meniu
│   │   ├── CookieConsent.tsx      # Slapukų sutikimas (GDPR)
│   │   ├── BackToTop.tsx          # „Grįžti į viršų" mygtukas
│   │   ├── AnimatedCounter.tsx    # Animuotas skaičiuotuvas
│   │   ├── CompareTable.tsx       # Palyginimo lentelė
│   │   ├── ErrorBoundary.tsx      # Klaidų ribojimas
│   │   ├── EmptyState.tsx         # Tuščios būsenos komponentas
│   │   ├── FaqAccordion.tsx       # DUK akordeonas
│   │   ├── Testimonials.tsx       # Atsiliepimai (testimonials)
│   │   ├── NewsletterSignup.tsx   # Naujienlaiškio registracija
│   │   ├── PlaceholderImage.tsx   # Paveikslėlio placeholder
│   │   ├── RecentlyViewed.tsx     # Neseniai peržiūrėti objektai
│   │   ├── PaginationServer.tsx   # Serverinė paginacija
│   │   ├── Pagination.tsx         # Klientinė paginacija
│   │   ├── SortSelect.tsx         # Rūšiavimo pasirinkimas
│   │   ├── TypeFilter.tsx         # Tipo filtras
│   │   ├── CityFilter.tsx         # Miesto filtras
│   │   ├── PriceFilter.tsx        # Kainos filtras
│   │   └── admin/                 # Admin komponentai
│   ├── lib/
│   │   ├── prisma.ts              # Prisma kliento singleton'as
│   │   ├── admin-tokens.ts        # HMAC admin token'ų kūrimas/tikrinimas (Web Crypto API)
│   │   ├── user-tokens.ts         # HMAC vartotojų token'ų tikrinimas
│   │   ├── cache.ts               # In-memory TTL cache (LIST, CITIES, SEARCH)
│   │   ├── rate-limit.ts          # Rate limiting middleware
│   │   ├── security.ts            # CSRF tikrinimas, honeypot, HTML stripping, timing
│   │   ├── api-utils.ts           # API atsakymų pagalbininkai (JSON, paginacija, cache headers)
│   │   ├── cities.ts              # 43 miestų sąrašas ir VALID_CITY_SLUGS
│   │   ├── regions.ts             # Regionų duomenys
│   │   ├── i18n.ts                # Vertimų žodynas
│   │   ├── LanguageContext.tsx     # Kalbos React kontekstas
│   │   ├── password.ts            # Slaptažodžių hash'inimas
│   │   ├── notifications.ts       # Pranešimų sistema (el. paštas)
│   │   ├── types.ts               # TypeScript tipai ir sąsajos
│   │   └── utils.ts               # Pagalbinės funkcijos
│   └── middleware.ts              # Maršrutų validacija, admin auth, saugumo antraštės, CSP
├── public/                        # Statiniai failai (favicon, icons, manifest.json)
├── next.config.mjs                # Next.js konfigūracija (antraštės, cache, paveikslėliai)
├── tailwind.config.ts             # Tailwind CSS konfigūracija
├── tsconfig.json                  # TypeScript konfigūracija
├── postcss.config.js              # PostCSS konfigūracija
└── package.json                   # Priklausomybės ir npm skriptai
```

---

## Žinomos pastabos

- **Middleware maršrutų validacija:** Visi nauji top-level maršrutai turi būti įtraukti į `KNOWN_ROUTES` masyvą `src/middleware.ts` faile, kitaip bus grąžintas 404.
- **SQLite Unicode paieška:** `contains` operatorius yra case-sensitive Unicode simboliams (ąčęėįšųūž) — paieškos puslapis naudoja JavaScript filtravimą kaip workaround.
- **`next start` ir senas build'as:** Po kodo pakeitimų būtina perkompiliuoti ir perkrauti serverį — `next start` naudoja seną `.next` katalogą.
- **Tailwind spalvos:** `slate-750` spalvos neegzistuoja — naudokite `slate-700` arba `slate-800`.

---

## Licencija

MIT

---

*Sukurta su Next.js, Prisma ir meile Lietuvos tėveliams.*
