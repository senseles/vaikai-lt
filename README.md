# Vaikai.lt — Lietuvos vaikų priežiūros paslaugų platforma

Didžiausia Lietuvos vaikų priežiūros įstaigų ir paslaugų paieškos bei vertinimo platforma. Tėvai gali rasti, palyginti ir vertinti darželius, aukles, būrelius ir specialistus visoje Lietuvoje.

## Turinys

- [Funkcijos](#funkcijos)
- [Technologijos](#technologijos)
- [Duomenų bazė](#duomenų-bazė)
- [Diegimas](#diegimas)
- [Aplinkos kintamieji](#aplinkos-kintamieji)
- [Kūrimas](#kūrimas)
- [Projektų struktūra](#projektų-struktūra)

## Funkcijos

### Paieška ir naršymas
- **3100+ darželių** visuose Lietuvos miestuose (43 miestai)
- **210 auklių**, **210 būrelių**, **160 specialistų** profiliai
- **58 700+ atsiliepimų** su reitingais (1–5 žvaigždutės)
- Autocomplete paieška su realaus laiko pasiūlymais
- Geolokacija — „Rasti artimiausią miestą"
- Filtravimas pagal tipą, reitingą, rajoną
- Puslapiavimas su efektyviu duomenų krovimu

### Forumas
- 8 kategorijos: Darželiai, Auklės, Būreliai, Specialistai, Tėvystė, Mokyklos, Sveikata, Laisvalaikis
- 233 įrašai su 1868 komentarais
- Balsavimo sistema (sesijos pagrindu, be registracijos)
- Gijiniai komentarai (iki 3 lygių)
- Įrašų prisegimas ir užrakinimas (admin)
- Paieška forume

### Administravimo panelė
- Statistikos dashboard su grafikais
- CRUD operacijos visiems objektų tipams
- Atsiliepimų moderavimas (tvirtinimas/atmetimas/šalinimas)
- Forumo valdymas (prisegimas/užrakinimas/šalinimas)
- Masinės operacijos
- Duomenų eksportas

### Saugumas
- HMAC pagrįsti stateless admin tokenai (Edge suderinami)
- HTML žymų valymas prieš validaciją (XSS prevencija)
- CSRF apsauga, honeypot laukai, laiko tikrinimas
- Spartos ribojimas (rate limiting) rašymo endpoint'uose
- CSP, X-Frame-Options ir kiti saugumo antraštės
- Admin PATCH whitelist — tik `isApproved` laukas

### SEO
- Struktūrizuoti duomenys: Organization, LocalBusiness, BreadcrumbList, FAQPage
- Dinaminė sitemap su forumo puslapiais
- Canonical URL visuose puslapiuose
- Open Graph vaizdai
- robots.txt blokuoja /api/, /admin/, /prisijungti

### Mobilusis dizainas
- Mobile-first responsive dizainas
- 393px breakpoint optimizacija
- 44px minimalūs lietimo taikiniai
- Tamsus režimas (dark mode)

## Technologijos

| Technologija | Naudojimas |
|---|---|
| **Next.js 14** | App Router, SSR/SSG, API routes |
| **React 18** | UI komponentai |
| **TypeScript** | Tipų sauga |
| **Prisma** | ORM, duomenų bazės migracija |
| **SQLite** | Duomenų bazė |
| **Tailwind CSS 3** | Stiliai, responsive, dark mode |

## Duomenų bazė

```
Kindergarten (3100)  ──┐
Aukle (210)          ──┤
Burelis (210)        ──┼── Review (58730)
Specialist (160)     ──┘
ForumCategory (8) ── ForumPost (233) ── ForumComment (1868)
                                     ── ForumVote
User, Favorite
```

## Diegimas

### Reikalavimai
- Node.js 18+
- npm

### Žingsniai

```bash
# 1. Klonuoti repozitoriją
git clone <repo-url>
cd vaikai-lt

# 2. Įdiegti priklausomybes
npm install

# 3. Sukurti aplinkos failą
cp .env.example .env
# Redaguoti .env su savo reikšmėmis

# 4. Inicializuoti duomenų bazę
npx prisma generate
npx prisma db push

# 5. Užpildyti duomenimis (seed)
npx tsx prisma/seed.ts              # Pagrindiniai objektai
npx tsx scripts/seed-reviews.ts     # Atsiliepimai
npx tsx scripts/seed-forum.ts       # Forumo kategorijos ir įrašai
npx tsx scripts/seed-forum-content.ts  # Papildomas forumo turinys

# 6. Sukompiliuoti ir paleisti
bash scripts/build-lock.sh          # VISADA naudokite build-lock.sh
npm start
```

Aplikacija bus pasiekiama adresu [http://localhost:3000](http://localhost:3000).

## Aplinkos kintamieji

| Kintamasis | Aprašymas | Numatytoji reikšmė |
|---|---|---|
| `ADMIN_PASSWORD` | Admin prisijungimo slaptažodis | — |
| `ADMIN_SECRET` | HMAC token pasirašymo raktas | — |
| `DATABASE_URL` | Duomenų bazės URL | `file:./dev.db` |

## Kūrimas

```bash
# Kūrimo serveris
npm run dev

# Kompiliavimas (naudokite build-lock.sh!)
bash scripts/build-lock.sh

# Paleidimas
npm start

# Lint tikrinimas
npm run lint
```

**Svarbu**: Visada naudokite `bash scripts/build-lock.sh` vietoj `npx next build` — tai užtikrina, kad vienu metu nevyktų keli kompiliavimo procesai.

## Projektų struktūra

```
src/
├── app/
│   ├── [city]/           # Dinamiški miesto puslapiai (43 miestai)
│   ├── admin/            # Administravimo panelė
│   ├── forumas/          # Forumo puslapiai
│   ├── paieska/          # Paieškos puslapis
│   ├── prisijungti/      # Prisijungimo puslapis
│   ├── api/              # API endpoint'ai
│   │   ├── admin/        # Admin API (reviews, entities, forum, stats)
│   │   ├── forum/        # Forumo API (posts, categories, comments, vote)
│   │   ├── search/       # Paieškos API su autocomplete
│   │   ├── items/        # Objektų API
│   │   └── cities/       # Miestų API
│   ├── sitemap.ts        # Dinaminė sitemap
│   └── layout.tsx        # Root layout su meta duomenimis
├── components/           # React komponentai
│   ├── SearchBar.tsx     # Autocomplete paieška
│   ├── DetailModal.tsx   # Objekto detalės su žemėlapiu
│   ├── CitySelector.tsx  # Miestų tinklelis + geolokacija
│   └── ForumClient.tsx   # Forumo klientinis komponentas
├── lib/
│   ├── admin-tokens.ts   # HMAC token kūrimas/tikrinimas
│   ├── cache.ts          # TTL cache sistema
│   ├── rate-limit.ts     # Spartos ribojimas
│   └── prisma.ts         # Prisma klientas
└── middleware.ts          # Maršrutizavimas, auth, saugumo antraštės

prisma/
├── schema.prisma         # Duomenų bazės schema
├── seed.ts               # Pagrindinių objektų seed
└── dev.db                # SQLite duomenų bazė (gitignored)

scripts/
├── build-lock.sh         # Saugus kompiliavimas su lock
├── seed-reviews.ts       # Atsiliepimų generavimas
├── seed-forum.ts         # Forumo seed duomenys
└── seed-forum-content.ts # Papildomas forumo turinys
```
