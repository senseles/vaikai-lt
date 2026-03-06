# Sprint — 2h Improvement Sprint (2026-03-06)

## Team
- **Team Lead** — koordinuoja darbą, code review, git merge conflicts
- **Dev 1 (Frontend)** — UI/UX, komponentai, responsive design
- **Dev 2 (Backend/Full-stack)** — API, DB, performance, security
- **QA/Tester** — testavimas, bug reporting, smoke tests
- **Product Owner** — prioritetai, UX review, acceptance criteria

## Sync-up: kas 20 min
Kiekvienas agentas po 20 min darbo turi:
1. Parašyti kas padaryta (DONE)
2. Kas daroma (IN PROGRESS)  
3. Ar yra blokerių (BLOCKERS)

## Backlog (prioritetų tvarka)

### P0 — Critical
- [ ] **BUG: API smoke test** — verify all API endpoints work with PostgreSQL
- [ ] **SEO: Sitemap regeneration** — ensure sitemap works with new DB
- [ ] **Performance: API response times** — test and optimize PG queries, add connection pooling if needed

### P1 — High (Acceptance Criteria)

#### P1-1: UX: Palyginimo funkcija (Compare feature)
- [ ] Darželių palyginimas šalia vienas kito
- **AC-1:** Ant kiekvienos darželio kortelės yra "Palyginti" mygtukas (toggle)
- **AC-2:** Pasirinkus ≥2 darželius, atsiranda "Palyginti (N)" floating mygtukas ekrano apačioje
- **AC-3:** Paspaudus atidaromas modalas/puslapis su lentele: pavadinimas, reitingas, tipas (valst./priv.), kaina, darbo valandos, rajonas, ypatybės, atsiliepimų skaičius
- **AC-4:** Maksimalus palyginimo skaičius — 4 darželiai (su pranešimu jei bandoma pridėti daugiau)
- **AC-5:** Galima pašalinti darželį iš palyginimo tiesiogiai iš lentelės
- **AC-6:** Palyginimas veikia ir auklėms/būreliams/specialistams (atitinkami laukai)
- **AC-7:** Palyginimo pasirinkimai išsaugomi localStorage (nepradingsta perkrovus)
- **AC-8:** Mobile: lentelė scrollinama horizontaliai, sticky pirmas stulpelis su laukų pavadinimais
- **AC-9:** Lietuviški tekstai: "Palyginti", "Pašalinti", "Palyginimas", "Pasirinkite bent 2"

#### P1-2: Admin: Atsiliepimų moderavimas (approve/reject workflow)
- [ ] Pilnas approve/reject workflow admin panelėje
- **AC-1:** `/admin/atsiliepimai` puslapyje rodomas laukiančių atsiliepimų sąrašas su filtrais (visi/laukiantys/patvirtinti/atmesti)
- **AC-2:** Kiekvienas atsiliepimas rodo: autorius, tekstas, įvertinimas (žvaigždutės), data, susijęs darželis/įstaiga
- **AC-3:** "Patvirtinti" mygtukas (žalias) — patvirtina ir atsiliepimas iškart matomas viešai
- **AC-4:** "Atmesti" mygtukas (raudonas) — su patvirtinimo dialogu "Ar tikrai norite atmesti?"
- **AC-5:** Masinis veiksmas: pažymėti kelis atsiliepimus ir patvirtinti/atmesti vienu metu
- **AC-6:** Paieška atsiliepimų sąraše pagal tekstą arba autorių
- **AC-7:** Pagination — po 20 atsiliepimų puslapyje
- **AC-8:** Badge su laukiančių skaičiumi admin navigacijoje (matomas iš bet kurio admin puslapio)

#### P1-3: Mobile: Bottom sheet modals
- [ ] Full-screen modal on mobile devices
- **AC-1:** Darželio detalus vaizdas mobiliuose (<768px) atidaromas kaip bottom sheet (slide-up from bottom)
- **AC-2:** Bottom sheet turi drag handle (braukimo juostą viršuje)
- **AC-3:** Galima uždaryti braukiant žemyn (swipe down gesture)
- **AC-4:** Desktop (≥768px) — išlieka dabartinis centered modal
- **AC-5:** Bottom sheet užima ≥90% ekrano aukščio, su scroll viduje
- **AC-6:** Backdrop overlay su click-to-close
- **AC-7:** Body scroll lock kai modalas atidarytas (jokio background scrolling)
- **AC-8:** Smooth animation (300ms ease-out) atidarymo/uždarymo metu

#### P1-4: Search: Autocomplete/suggestions
- [ ] Search suggestions dropdown
- **AC-1:** ✅ JAU VEIKIA — paieškos pasiūlymai su debounce 300ms, API endpoint `/api/search/suggestions`
- **AC-2:** ✅ JAU VEIKIA — rodomi iki 8 pasiūlymų su kategorijos badge (spalvotas)
- **AC-3:** Papildyti: klaviatūros navigacija (↑↓ rodyklėmis, Enter pasirinkimui)
- **AC-4:** Papildyti: "Rodyti visus rezultatus" apačioje → nukreipia į /paieska?q=...
- **AC-5:** Papildyti: paieškos istorija (paskutiniai 5 ieškojimai) kai input tuščias
- **AC-6:** Mobile: pasiūlymų dropdown neturi slėptis po klaviatūra

### P2 — Medium (prioritetų tvarka)
- [ ] **Maps: Integration** — show kindergarten on map (OpenStreetMap) ← **pakeltas: konkurentai turi žemėlapius**
- [ ] **Aukle/Burelis: Detail pages** — dedicated detail pages (not just modal cards) ← **pakeltas: SEO vertė**
- [ ] **Photos: Kindergarten images** — upload/display photos
- [ ] **Analytics: Basic stats** — page views, popular searches
- [ ] **Forum: Notification system** — notify on replies
- [ ] **Nuorodos į registracijos sistemas** — tiesioginės nuorodos į svietimas.vilnius.lt, darzelis.vilnius.lt, kaunas.lt ir kt. savivaldybių registracijos puslapius ← **NAUJAS: didžiausia tėvų poreikis**
- [ ] **PWA: Offline support** — service worker for offline viewing

### P3 — Nice to have
- [ ] **Social: Share improvements** — better share cards, WhatsApp deep links
- [ ] **Email: Contact forms** — contact kindergarten via email
- [ ] **A11y: Full audit** — WCAG 2.1 AA compliance
- [ ] **i18n: Russian/English** — multi-language support

## Rules
- Commit often with clear messages
- Don't break the build
- Test before pushing
- Use Lithuanian for UI text
- Follow existing code style (Tailwind, Next.js App Router, Prisma)
- DB is now PostgreSQL on Neon (see .env)
