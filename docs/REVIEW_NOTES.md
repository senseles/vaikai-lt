# Kodo peržiūros pastabos (PO)

**Data:** 2026-03-01  
**Peržiūrėjau:** Pradinę projekto struktūrą ir kodą

---

## ✅ Kas gerai

### Architektūra
- **Prisma schema** — gerai sudėliotas, visi 4 modeliai + Review + Favorite + User. Atitinka senosios svetainės duomenų struktūrą.
- **SQLite dev** — protingas pasirinkimas development'ui, lengva migruoti į PostgreSQL produkcijai.
- **Tailwind config** — teisingos spalvos iš senosios svetainės (#2d6a4f primary), Inter šriftas. Dark mode per `class` — gerai.

### Komponentai
- **Layout** — teisingas SEO metadata, OG tags, lang="lt", dark mode FOUC prevention script. Profesionalu.
- **Header** — veikia hamburger, dark mode toggle, category tabs. Clean code.
- **StarRating** — geras: half-star support, interactive mode, accessible aria-label.
- **CategoryTabs** — veikia, bet state yra local (žr. pastabas žemiau).

### TypeScript tipai
- `src/types/index.ts` — visi tipai sudėlioti, atitinka Prisma schema. `ItemType` union type — gerai.

---

## ⚠️ Pastabos ir pasiūlymai

### 1. CategoryTabs state — global vs local (P0)
**Problema:** `CategoryTabs` laiko `active` state viduje su `useState`. Tai reiškia, kad `page.tsx` nežino kokia kategorija pasirinkta ir negali filtruoti duomenų.

**Sprendimas:** Naudoti URL search params (`?cat=aukles`) arba React Context/Zustand. Rekomenduoju URL params — SEO friendly ir sharable.

### 2. Stats hardcoded (P1)
**Problema:** Home page stats yra hardcoded: `"2,400+"`, `"15,000+"`. Turėtų būti iš DB.

**Sprendimas:** Server component su `prisma.kindergarten.count()` ir pan.

### 3. Trūksta komponentų (P0)
Dar nematau šių svarbių komponentų:
- **KindergartenCard** — kortelė sąrašuose
- **CitySelector** — importuojamas page.tsx, bet ar jau yra?
- **SearchBar** — importuojamas page.tsx
- **FaqAccordion** — importuojamas page.tsx
- **Footer** — importuojamas layout.tsx

Jei jie dar kuriantis — OK, bet tai blokers Phase 1 pabaigai.

### 4. Schema — trūksta indeksų (P1)
**Problema:** Prisma schema neturi indeksų ant dažnai filtruojamų laukų.

**Sprendimas:**
```prisma
model Kindergarten {
  // ...
  @@index([city])
  @@index([region])
  @@index([type])
}

model Review {
  // ...
  @@index([itemId, itemType])
  @@index([isApproved])
}
```

### 5. Schema — Review.recommend laukas trūksta (P1)
Senojoje svetainėje yra „Ar rekomenduotumėte?" (Taip/Ne). Prisma Review modelyje šio lauko nėra.

**Sprendimas:** Pridėti `recommend Boolean?` į Review modelį.

### 6. Kindergarten.features — String vs JSON (P1)
`features String @default("[]")` — saugomas kaip JSON string. SQLite kontekste tai OK, bet pereinant į PostgreSQL reikėtų `Json` tipo arba atskiros lentelės.

### 7. Prisma — trūksta Kindergarten privataus darželio laukų (P1)
Senojoje svetainėje privatūs darželiai turi: `price`, `methodology`, `groupSize`. Prisma schema neturi šių laukų.

**Sprendimas:** Pridėti:
```prisma
model Kindergarten {
  // ...
  price       String?
  methodology String?
  groupSize   String?
}
```

### 8. package.json — nėra NextAuth (P0 blocker Phase 2)
Admin auth reikia `next-auth`. Dar nėra dependencies. Reikės pridėti:
```
"next-auth": "^4.24.0"
"bcryptjs": "^2.4.3"
```

### 9. Aukle schema — `experience` turėtų būti Int (P2)
`experience String?` — senojoje svetainėje tai yra skaičius (metai). Geriau `Int?`.

---

## 📋 Prioritetinis TODO (PO perspektyva)

1. **🔴 P0:** Sukurti trūkstamus komponentus (SearchBar, CitySelector, Footer, FaqAccordion, KindergartenCard)
2. **🔴 P0:** CategoryTabs state perkelti į URL params
3. **🟡 P1:** Prisma schema: pridėti indeksus, recommend lauką, privataus darželio laukus
4. **🟡 P1:** Stats iš DB
5. **🟡 P1:** Seed script — ar jau veikia? Reikia patikrinti.
6. **🟢 P2:** NextAuth setup (Phase 2)

---

## 🎯 UX prioritetai

1. **Mobili patirtis** — 70%+ vartotojų bus telefone. Bottom-sheet modals, didelis touch target.
2. **Paieška** — turi veikti iš karto, su LT raidėmis, debounce.
3. **Greitis** — skeleton loading, ISR/SSG miestų puslapiams.
4. **Patikimumas** — atsiliepimai DB, ne localStorage!
