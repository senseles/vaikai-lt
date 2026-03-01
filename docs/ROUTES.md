# Vaikai.lt — Maršrutai (Routes)

## App Router struktūra (Next.js 14)

```
src/app/
├── layout.tsx              # Root layout: header, footer, providers
├── page.tsx                # / — Pradinis puslapis
├── globals.css
├── [city]/
│   ├── page.tsx            # /vilnius — Miesto sąrašas
│   └── [slug]/
│       └── page.tsx        # /vilnius/lopselis-darzelis-ziogelis — Detalus puslapis
├── megstamiausieji/
│   └── page.tsx            # /megstamiausieji — Mėgstamiausių puslapis
├── admin/
│   ├── page.tsx            # /admin — Admin panelė (protected)
│   └── layout.tsx          # Admin layout su auth check
├── api/
│   ├── darzeliai/
│   │   ├── route.ts        # GET (list), POST (create)
│   │   └── [id]/
│   │       └── route.ts    # GET, PUT, DELETE
│   ├── aukles/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── bureliai/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── specialistai/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── reviews/
│   │   ├── route.ts        # GET (by item), POST (create)
│   │   └── [id]/route.ts   # PUT (approve), DELETE
│   ├── favorites/
│   │   └── route.ts        # GET, POST, DELETE
│   ├── search/
│   │   └── route.ts        # GET ?q=...&category=...
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts    # NextAuth handler
└── sitemap.ts              # Dynamic sitemap generation
```

---

## Puslapių aprašymas

### `/` — Pradinis puslapis
- Hero sekcija su statistika (darželiai, miestai, atsiliepimai, vid. reitingas)
- Category tabs: Darželiai | Auklės | Būreliai | Specialistai
- Miestų kortelės su statistika
- TOP darželiai pagal reitingą
- D.U.K. sekcija
- Registracijos informacija

**SEO:**
- Title: `Vaikai.lt — Darželiai, auklės, būreliai ir specialistai`
- Description: `Padedame tėveliams visoje Lietuvoje rasti darželius, aukles, būrelius ir specialistus.`
- Structured data: WebSite, Organization, FAQPage

### `/[city]` — Miesto sąrašas
- URL pavyzdžiai: `/vilnius`, `/kaunas`, `/klaipeda`, `/siauliai`
- Slug generavimas: LT raidės → ASCII (`Šiauliai` → `siauliai`, `Panevėžys` → `panevezys`)
- Paieška + filtrai (tipas, rajonas)
- Kortelių grid
- Reitingo rikiavimas

**SEO:**
- Title: `Darželiai – Vilnius | Vaikai.lt`
- OG: miesto pavadinimas, darželių kiekis

### `/[city]/[slug]` — Detalus puslapis
- URL: `/vilnius/lopselis-darzelis-ziogelis`
- Visa informacija: kontaktai, valandos, ypatybės
- Atsiliepimų sąrašas + rašymo forma
- Panašūs darželiai (same city)
- Share, print mygtukai
- Breadcrumbs: Pradžia > Vilnius > Žiogelis

**SEO:**
- Title: `Lopšelis-darželis „Žiogelis" – Vilnius | Vaikai.lt`
- Structured data: LocalBusiness, AggregateRating

### `/megstamiausieji` — Mėgstamiausieji
- Visos kategorijos vienoje vietoje
- Kategorijos badge ant kiekvienos kortelės
- Tuščia būsena su CTA
- „Išvalyti visus" mygtukas

### `/admin` — Admin panelė
- **Protected** — reikia NextAuth sesijos su role=ADMIN
- Tabs: Darželiai | Auklės | Būreliai | Specialistai | Atsiliepimai
- CRUD lentelė su paieška
- Atsiliepimų moderavimas (approve/reject/delete)
- Statistikos dashboard

---

## Slug generavimo taisyklės

```typescript
const LT_MAP: Record<string, string> = {
  'ą':'a','č':'c','ę':'e','ė':'e','į':'i','š':'s','ų':'u','ū':'u','ž':'z'
};

function toSlug(str: string): string {
  return str.toLowerCase()
    .replace(/[ąčęėįšųūž]/g, ch => LT_MAP[ch] || ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

## Miestų slugai (pagrindiniai)

| Miestas | Slug | URL |
|---|---|---|
| Vilnius | `vilnius` | `/vilnius` |
| Kaunas | `kaunas` | `/kaunas` |
| Klaipėda | `klaipeda` | `/klaipeda` |
| Šiauliai | `siauliai` | `/siauliai` |
| Panevėžys | `panevezys` | `/panevezys` |
| Alytus | `alytus` | `/alytus` |
| Marijampolė | `marijampole` | `/marijampole` |
| Utena | `utena` | `/utena` |
| Telšiai | `telsiai` | `/telsiai` |
| Tauragė | `taurage` | `/taurage` |
| Palanga | `palanga` | `/palanga` |
| Druskininkai | `druskininkai` | `/druskininkai` |
| Visaginas | `visaginas` | `/visaginas` |
| Mažeikiai | `mazeikiai` | `/mazeikiai` |
| Jonava | `jonava` | `/jonava` |

## Kategorijų URL parametras

Kategorija perduodama per query string arba segment:
- `/vilnius?cat=aukles` — auklės Vilniuje
- `/vilnius?cat=bureliai` — būreliai Vilniuje

Alternatyva (jei SEO svarbu):
- `/vilnius/aukles`
- `/vilnius/bureliai`

**Rekomenduojama:** query string, nes viena page component su filtru.
