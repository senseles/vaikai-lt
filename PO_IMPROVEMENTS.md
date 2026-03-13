# Vaikai.lt — Product Owner pagerinimų planas

**Data:** 2026-03-13
**Versija:** 2.0
**Analitikas:** PO analizė

---

## Santrauka (Executive Summary)

### Kas veikia gerai

- **Platus duomenų bazės turinys:** 7075 darželiai, 210 auklių, 210 būrelių, 160 specialistų, ~58k atsiliepimų — solidi pradinė bazė.
- **Miestų puslapiai:** 43 miestai su ISR (5 min), filtravimas pagal kategoriją/tipą/rajoną/reitingą, paginacija.
- **Individualūs entity puslapiai:** Kiekvienam darželiui/auklei/būreliui/specialistui atskiras SEO-optimizuotas puslapis su breadcrumbs, JSON-LD struktūriniais duomenimis.
- **Autentifikacija:** NextAuth su Google/Facebook OAuth + el. pašto/slaptažodžio registracija, slaptažodžio stiprumo indikatorius.
- **Forumas:** 8 kategorijos, 119 įrašų, 832 komentarų, balsavimo sistema, paieška.
- **Admin panelė:** Dashboard su statistika ir grafikais, atsiliepimų moderavimas (individual + bulk), forumo valdymas, duomenų eksportas (JSON/CSV).
- **UX:** Dark mode, kalbos perjungimas (LT/EN), mobile bottom nav, swipe-to-close modalas, animacijos, skeleton loading.
- **Saugumas:** CSP headeriai, CSRF apsauga, XSS strip, rate limiting, HSTS, admin HMAC tokenai.
- **SEO:** Canonical URLs, structured data (Organization, LocalBusiness, BreadcrumbList, FAQPage, SearchAction), robots.txt, sitemap.ts, OG images.

### Pagrindinės problemos

1. **Atsiliepimai automatiškai patvirtinami** (`isApproved: true` — `src/app/api/reviews/route.ts:105`) — moderavimas de facto neveikia.
2. **userId nesaugomas prie atsiliepimų** — nors vartotojas prisijungęs, review POST neištraukia userId iš sesijos.
3. **Admin panelėje nėra vartotojų valdymo** — User modelis egzistuoja, bet nėra jokio UI.
4. **Nėra „pamiršau slaptažodį" funkcionalumo** — vartotojai negali atstatyti slaptažodžio.
5. **Nėra vartotojo profilio puslapio** — prisijungęs vartotojas neturi kur peržiūrėti/redaguoti savo duomenų.
6. **Admin autentifikacija atskirta nuo NextAuth** — du lygiagrečiai auth mechanizmai padidina kompleksiškumą.

---

## P1 — Kritiniai (Sprint 1-2)

### P1.1 Atsiliepimų moderavimo taisymas

**Problema:** `src/app/api/reviews/route.ts:105` — nauji atsiliepimai kuriami su `isApproved: true`. Tai reiškia, kad bet koks turinys (šiukšlės, spam, įžeidimai) iškart matomas viešai.

**Tikslas:** Nauji atsiliepimai turi laukti admin patvirtinimo.

**Priėmimo kriterijai:**
- [ ] `isApproved` nustatytas į `false` review POST endpoint'e
- [ ] Vartotojas mato pranešimą „Jūsų atsiliepimas bus paskelbtas po peržiūros"
- [ ] Admin gauna pranešimą apie naujus laukiančius atsiliepimus
- [ ] Admin panelėje laukiantys atsiliepimai rodomi pirmi

**Failai:** `src/app/api/reviews/route.ts`

---

### P1.2 userId siejimas su atsiliepimais

**Problema:** Review POST endpoint neištraukia userId iš NextAuth sesijos. Dėl to negalima identifikuoti, kuris vartotojas paliko atsiliepimą, ir negalima rodyti „mano atsiliepimai" funkcionalumo.

**Tikslas:** Kiekvienas atsiliepimas turi būti susietas su prisijungusiu vartotoju.

**Priėmimo kriterijai:**
- [ ] POST `/api/reviews` ištraukia userId iš NextAuth sesijos (getServerSession)
- [ ] userId saugomas Review modelyje
- [ ] Atsiliepimą galima palikti TIK prisijungus (jau veikia frontend'e, bet backend'e netikrinama)
- [ ] Admin panelėje matomas atsiliepimo autoriaus vartotojo profilis

**Failai:** `src/app/api/reviews/route.ts`, `src/lib/auth.ts`

---

### P1.3 Slaptažodžio atstatymas (Forgot Password)

**Problema:** Vartotojas, pamiršęs slaptažodį, negali jo atstatyti. Vienintelė išeitis — registruotis iš naujo.

**Tikslas:** Standartinis „pamiršau slaptažodį" srautas su el. pašto nuoroda.

**Priėmimo kriterijai:**
- [ ] Prisijungimo puslapyje yra „Pamiršote slaptažodį?" nuoroda
- [ ] Vartotojas įveda el. paštą ir gauna atstatymo nuorodą
- [ ] Nuoroda galioja 1 valandą, vienkartinė
- [ ] Sėkmingas slaptažodžio pakeitimas ir automatinis prisijungimas
- [ ] Rate limiting ant reset endpoint'o (max 3 per valandą)

**Failai:** Nauji: `src/app/slaptazodis/page.tsx`, `src/app/api/auth/reset/route.ts`

---

### P1.4 Admin vartotojų valdymas

**Problema:** User modelis turi `role` lauką, bet nėra jokio UI vartotojams valdyti. Negalima peržiūrėti registruotų vartotojų, blokuoti spam paskyras, priskirti admin teises.

**Tikslas:** Admin panelėje pridėti vartotojų valdymo skyrių.

**Priėmimo kriterijai:**
- [ ] Admin meniu punktas „Vartotojai" (`/admin/vartotojai`)
- [ ] Vartotojų sąrašas su paieška ir filtravimu (pagal rolę, registracijos datą)
- [ ] Galimybė keisti vartotojo rolę (USER → ADMIN ir atvirkščiai)
- [ ] Galimybė blokuoti/atblokuoti vartotoją
- [ ] Rodomas vartotojo atsiliepimų skaičius ir forumo aktyvumas
- [ ] Paginacija (vartotojų gali būti daug)

**Failai:** Nauji: `src/app/admin/vartotojai/page.tsx`, `src/app/api/admin/users/route.ts`

---

### P1.5 Atsiliepimų backend sesijos tikrinimas

**Problema:** Review POST endpoint'as netikrina, ar vartotojas tikrai prisijungęs. Frontend'as rodo „prisijunkite" pranešimą, bet backend'as priima atsiliepimus be autentifikacijos — galima siųsti atsiliepimus tiesiogiai per API.

**Tikslas:** Backend'as turi reikalauti autentifikacijos.

**Priėmimo kriterijai:**
- [ ] POST `/api/reviews` grąžina 401 jei nėra validžios NextAuth sesijos
- [ ] Rate limiting susietas su userId, ne tik su IP
- [ ] Apsauga nuo vieno vartotojo kelių atsiliepimų tam pačiam subjektui (1 review per user per entity)

**Failai:** `src/app/api/reviews/route.ts`

---

## P2 — Svarbūs (Sprint 3-4)

### P2.1 Vartotojo profilio puslapis

**Problema:** Prisijungęs vartotojas neturi jokio profilio puslapio. Negali redaguoti savo vardo, matyti savo atsiliepimų ar forumo įrašų.

**Tikslas:** Asmeninis profilio puslapis su vartotojo veiklos suvestine.

**Priėmimo kriterijai:**
- [ ] Puslapis `/profilis` (arba per Header dropdown meniu)
- [ ] Rodo: vardas, el. paštas, registracijos data, prisijungimo būdas (Google/Facebook/el. paštas)
- [ ] Galimybė redaguoti vardą
- [ ] „Mano atsiliepimai" sąrašas su statusu (patvirtintas/laukia)
- [ ] „Mano forumo įrašai" sąrašas
- [ ] „Mano mėgstamiausieji" (jau yra localStorage, perkelti į DB su userId)
- [ ] Galimybė ištrinti savo paskyrą (GDPR)

**Failai:** Nauji: `src/app/profilis/page.tsx`, `src/app/api/user/route.ts`

---

### P2.2 Atsiliepimų puslapiavimas admin panelėje

**Problema:** Admin atsiliepimų puslapis kraunasi VISUS atsiliepimus iš karto. Su 58k+ atsiliepimų tai sukels rimtų performance problemų.

**Tikslas:** Server-side puslapiavimas su efektyviu duomenų krovimu.

**Priėmimo kriterijai:**
- [ ] API `/api/admin/reviews` palaiko `page` ir `limit` parametrus
- [ ] UI rodo puslapiavimo kontroles (ankstesnis/kitas)
- [ ] Rodomas bendras atsiliepimų skaičius ir dabartinis puslapis
- [ ] Paieška pagal autorių arba tekstą
- [ ] Rikiavimas pagal datą, reitingą, statusą

**Failai:** `src/app/admin/atsiliepimai/page.tsx`, `src/app/api/admin/reviews/route.ts`

---

### P2.3 Atsiliepimų atsakymai (įstaigos atsakas)

**Problema:** Negalima atsakyti į atsiliepimą — nei įstaigos savininkas, nei admin. Tai standartinė funkcija tokiose platformose (kaip Google Maps, TripAdvisor).

**Tikslas:** Leisti administruojantiems atsakyti į atsiliepimus.

**Priėmimo kriterijai:**
- [ ] Admin gali parašyti atsakymą prie bet kurio atsiliepimo
- [ ] Atsakymas rodomas po atsiliepimu su „Atsakymas" žyma
- [ ] DB schema: `ReviewReply` modelis (reviewId, text, authorName, createdAt)
- [ ] Viešai matomas atsakymas entity puslapyje

**Failai:** `prisma/schema.prisma`, `src/app/api/admin/reviews/[id]/reply/route.ts`

---

### P2.4 Nuotraukų palaikymas

**Problema:** Jokiame objekte nėra nuotraukų. Darželio puslapis be nuotraukos atrodo tuščiai ir nepasitikėtinai.

**Tikslas:** Leisti pridėti nuotraukas prie entity ir atsiliepimų.

**Priėmimo kriterijai:**
- [ ] Entity modeliai turi `imageUrl` lauką
- [ ] Admin gali įkelti nuotrauką per admin panelę
- [ ] Nuotraukos optimizuojamos (Next.js Image component su `next/image`)
- [ ] Placeholder image kai nuotrauka nepateikta (jau yra `PlaceholderImage.tsx`)
- [ ] Ateityje: vartotojai gali pridėti nuotraukas prie atsiliepimų

**Failai:** `prisma/schema.prisma`, entity admin puslapiai

---

### P2.5 Forumo pranešimai (notifikacijos)

**Problema:** Vartotojas parašo forumo įrašą arba komentarą, bet negauna jokių pranešimų apie atsakymus.

**Tikslas:** Pranešimų sistema forumo veiklai.

**Priėmimo kriterijai:**
- [ ] Vartotojas gauna pranešimą kai kas nors atsako į jo forumo įrašą
- [ ] Vartotojas gauna pranešimą kai kas nors atsako į jo komentarą
- [ ] Pranešimai rodomi per „varpelio" ikoną header'yje
- [ ] Galimybė pažymėti pranešimus kaip perskaitytus
- [ ] El. pašto pranešimai (opt-in)

**Failai:** Naujas: `src/app/api/notifications/route.ts`, `Notification` modelis schema.prisma

---

### P2.6 Entity palyginimo funkcionalumas

**Problema:** Yra `CompareTable.tsx` komponentas, bet neaišku kaip vartotojas patenka į palyginimą. Trūksta „Pridėti į palyginimą" mygtuko kortelėse.

**Tikslas:** Aiškus ir intuityvus palyginimo srautas.

**Priėmimo kriterijai:**
- [ ] Kiekvienoje entity kortelėje (KindergartenCard, AukleCard, etc.) yra „Palyginti" checkbox
- [ ] Floating bar apačioje rodo pasirinktų palyginimui skaičių (max 4)
- [ ] Paspaudus „Palyginti" atsidaro side-by-side palyginimo lentelė
- [ ] Palyginimas veikia tarp skirtingų kategorijų (pvz., du darželiai)

**Failai:** `src/components/CompareTable.tsx`, entity kortelių komponentai

---

### P2.7 Patobulinta paieška su filtrais

**Problema:** Paieška grąžina rezultatus, bet negalima filtruoti pagal miestą, kategoriją, reitingą paieškos rezultatuose.

**Tikslas:** Paieškos rezultatų filtravimas ir rikiavimas.

**Priėmimo kriterijai:**
- [ ] Paieškos rezultatų puslapyje (`/paieska`) yra filtrai: miestas, kategorija, min. reitingas
- [ ] URL parametrai atspindi filtrus (shareable)
- [ ] Rezultatų skaičius rodomas prie kiekvieno filtro
- [ ] „Nerasta rezultatų" būsena su pasiūlymu plėsti paiešką

**Failai:** `src/app/paieska/page.tsx`, `src/app/api/search/route.ts`

---

## P3 — Gera turėti (Sprint 5+)

### P3.1 Google Maps integracija entity puslapiuose

**Tikslas:** Interaktyvus žemėlapis su entity lokacija, ne tik embed iframe.

**Priėmimo kriterijai:**
- [ ] Žemėlapio komponentas su markeriu entity adrese
- [ ] „Kaip nuvykti" nuoroda į Google Maps
- [ ] Miesto puslapyje — visų entity žemėlapis su cluster'iais

---

### P3.2 Email notifikacijos admin'ui

**Tikslas:** Admin gauna el. laiškus apie svarbius įvykius.

**Priėmimo kriterijai:**
- [ ] Naujas atsiliepimas (jau yra `notifications.ts`, bet reikia patikrinti ar veikia)
- [ ] Naujas forumo įrašas
- [ ] Naujas vartotojas registruotas
- [ ] Dienos/savaitės suvestinė

---

### P3.3 Statistikos dashboard pagerinimas

**Tikslas:** Detalesnė analitika admin panelėje.

**Priėmimo kriterijai:**
- [ ] Vartotojų registracijų grafikas (per dieną/savaitę)
- [ ] Populiariausios paieškos užklausos
- [ ] Populiariausi entity (pagal peržiūras)
- [ ] Atsiliepimų sentimento analizė (teigiami/neigiami pagal ratingą)
- [ ] Konversijų metrika: lankytojas → registracija → atsiliepimas

---

### P3.4 SEO pagerinimų paketas

**Tikslas:** Papildomi SEO signalai ir kritinių spragų taisymas.

**Priėmimo kriterijai:**
- [ ] **Sitemap papildymas entity puslapiais** — dabartinis sitemap neturi 7000+ entity URL (tik miestai ir forumas)
- [ ] Sitemap.xml paginacija (vienas failas gali viršyti 50k URL limitą)
- [ ] hreflang tagai LT/EN versijoms
- [ ] Entity puslapiuose „Panašūs darželiai" sekcija (internal linking)
- [ ] FAQ schema kiekvienam miesto puslapiui (ne tik pagrindiniame)
- [ ] Review schema atskiriems entity puslapiams (ne tik AggregateRating)
- [ ] CSP suvienodinimas — pašalinti CSP iš `next.config.mjs` (middleware versija pilnesnė)

---

### P3.5 PWA (Progressive Web App) palaikymas

**Tikslas:** Vartotojai gali „instaliuoti" svetainę kaip app.

**Priėmimo kriterijai:**
- [ ] manifest.json su tinkamais parametrais
- [ ] Service worker offline režimui (bent statinis turinys)
- [ ] App ikona (192x192, 512x512)
- [ ] „Pridėti į namų ekraną" prompt

---

### P3.6 Newsletter integracija

**Problema:** Yra `NewsletterSignup.tsx` komponentas, bet nėra backend'o.

**Tikslas:** Veikiantis naujienlaiškio prenumeratos mechanizmas.

**Priėmimo kriterijai:**
- [ ] El. pašto surinkimo forma su validacija
- [ ] API endpoint'as prenumeratos saugojimui
- [ ] Double opt-in patvirtinimas el. paštu
- [ ] Atsisakymo (unsubscribe) nuoroda

---

### P3.7 Forumo moderavimo įrankiai

**Tikslas:** Galingesni forumo moderavimo įrankiai admin panelėje.

**Priėmimo kriterijai:**
- [ ] Masinis komentarų trynimas
- [ ] Vartotojų blokavimas nuo forumo
- [ ] Automatiniai filtrai (draudžiami žodžiai)
- [ ] Pranešimų apie netinkamą turinį sistema (report button)
- [ ] Komentarų redagavimo istorija

---

### P3.8 Accessibility (a11y) audit

**Tikslas:** WCAG 2.1 AA atitiktis.

**Priėmimo kriterijai:**
- [ ] Visi interaktyvūs elementai turi aria-labels (dalinis — Header ir Modal jau turi)
- [ ] Keyboard navigacija per visus modalus ir dropdown
- [ ] Spalvų kontrastas atitinka AA standartą
- [ ] Screen reader testavimas su NVDA/VoiceOver
- [ ] Focus visible stiliai visuose komponentuose
- [ ] Skip to content nuoroda

---

## Admin panelės pagerinimų skyrius

### Dabartinė būsena

Admin panelė turi šiuos skyrius:
| Skyrius | Puslapis | Funkcionalumas |
|---|---|---|
| Dashboard | `/admin` | Statistikos kortelės, grafikai, naujausia veikla |
| Darželiai | `/admin/darzeliai` | CRUD operacijos |
| Auklės | `/admin/aukles` | CRUD operacijos |
| Būreliai | `/admin/bureliai` | CRUD operacijos |
| Specialistai | `/admin/specialistai` | CRUD operacijos |
| Atsiliepimai | `/admin/atsiliepimai` | Moderavimas (approve/reject/delete, bulk actions) |
| Forumas | `/admin/forumas` | Įrašų ir komentarų valdymas |
| Nustatymai | `/admin/nustatymai` | Eksportas, sistema info, atsijungimas |

### Trūksta

1. **Vartotojų valdymas** (P1.4) — kritinis, nes yra User modelis ir auth, bet nėra admin sąsajos
2. **Atsiliepimų puslapiavimas** (P2.2) — su 58k+ atsiliepimų dabartinis UI neveiks
3. **Atsiliepimų atsakymai** (P2.3) — standartinė review platformos funkcija
4. **Audit log** — kas, ką ir kada patvirtino/atmetė/ištrynė
5. **Dashboard filtravimas** — pagal datų intervalą, miestą
6. **Bulk entity import** — CSV/JSON importas naujų darželių/auklių pridėjimui
7. **Admin rolės** — tik vienas admin lygis, nėra moderatorių rolės
8. **Realtime pranešimai** — admin nemato naujų atsiliepimų be puslapio perkrovimo

---

## Techninės skolos sąrašas

### Kritinė

| # | Problema | Failas | Aprašymas |
|---|---|---|---|
| T1 | Reviews auto-approved | `src/app/api/reviews/route.ts:105` | `isApproved: true` — atsiliepimų moderavimas neveikia |
| T2 | userId nepriskirtas | `src/app/api/reviews/route.ts` | Review POST neištraukia userId iš sesijos |
| T3 | Backend nesaugomas nuo neautentifikuotų review | `src/app/api/reviews/route.ts` | Tik frontend blokuoja, API priima be autentifikacijos |

### Vidutinė

| # | Problema | Failas | Aprašymas |
|---|---|---|---|
| T4 | Dviguba auth sistema | `src/lib/admin-tokens.ts` + `src/lib/auth.ts` | Admin naudoja HMAC tokenus, vartotojai NextAuth — galima suvienodinti |
| T5 | Favorites per localStorage | `src/components/FavoriteButton.tsx` | Mėgstamiausieji saugomi localStorage, ne DB — prarandami keičiant įrenginį |
| T6 | `as never[]` type castai | `src/app/[city]/page.tsx:252-255` | Silpnas tipų saugumas serializuojant entity duomenis |
| T7 | DB counts per 3 API calls | `src/app/admin/atsiliepimai/page.tsx:67-71` | Tabs skaičiui gauti daromi 3 atskiri fetch — galima vienu API call |
| T8 | ForumVote per sessionId | `prisma/schema.prisma` | Balsavimas per sessionId, ne userId — lengva manipuliuoti |
| T9 | `eslint-disable` komentarai | `src/app/api/reviews/route.ts:60` | `(prisma as any)` — type-unsafe dynamic model access |
| T10 | Price sort fallback | `src/app/[city]/page.tsx:28-29` | `price_asc`/`price_desc` iš tikrųjų rūšiuoja pagal `baseRating` — misleading |

### Saugumas

| # | Problema | Failas | Aprašymas |
|---|---|---|---|
| T11 | CSP neatitikimas tarp middleware ir next.config | `middleware.ts` + `next.config.mjs` | Dviejose vietose skirtingas CSP — middleware versija pilnesnė, config gali blokuoti OAuth |
| T12 | User token secret hardcoded fallback | `src/lib/user-tokens.ts:3` | Numatytasis `'vaikai-session-key'` jei env kintamieji nepateikti |
| T13 | ADMIN_SECRET fallback į tuščią string | `src/lib/admin-tokens.ts:7` | Tuščias secret leistų token falsifikavimą |
| T14 | In-memory rate limiting | `src/lib/rate-limit.ts` | Neveikia su keliais procesais (PM2 cluster) — reikia Redis |
| T15 | Nėra email verifikacijos registruojantis | `src/app/api/auth/register/route.ts` | Galima registruotis su bet kokiu email — spam rizika |

### Žema

| # | Problema | Failas | Aprašymas |
|---|---|---|---|
| T16 | Hardcoded admin password | CLAUDE.md / env | Default `darzeliai2026` — reikėtų primygtinai reikalauti keisti |
| T17 | Next.js 14.2.35 | `package.json` | Galimas atnaujinimas į Next.js 15 (patikrinti suderinamumą) |
| T18 | Nėra testų | — | Vitest dependency yra, bet testų failų nematyti |
| T19 | i18n nebaigtas | `src/lib/i18n.ts` | EN vertimas egzistuoja, bet ne visi tekstai verčiami (hardcoded LT strings komponentuose) |
| T20 | Sitemap trūksta entity puslapių | `src/app/sitemap.ts` | 7000+ entity puslapių nėra sitemap — didelė SEO spraga |
| T21 | Komentarų reload per window.location.reload() | `src/components/ForumClient.tsx` | Galėtų būti optimistic update be viso puslapio perkrovimo |
| T22 | ErrorBoundary neloguoja klaidų | `src/components/ErrorBoundary.tsx` | Tyliai suvalgoma klaida — sunkina debuginimą |

---

## Rekomenduojama sprintų tvarka

### Sprint 1 (1-2 savaitės) — Saugumo taisymai
- **P1.1** — Atsiliepimų moderavimo taisymas (isApproved: false)
- **P1.2** — userId siejimas su atsiliepimais
- **P1.5** — Backend sesijos tikrinimas review endpoint'e
- **T1, T2, T3** — Techninė skola (kritikinė)

### Sprint 2 (1-2 savaitės) — Admin ir vartotojų valdymas
- **P1.4** — Admin vartotojų valdymo puslapis
- **P1.3** — Slaptažodžio atstatymas
- **P2.2** — Atsiliepimų puslapiavimas admin panelėje
- **T7** — Admin counts optimizacija

### Sprint 3 (2 savaitės) — Vartotojų patirtis
- **P2.1** — Vartotojo profilio puslapis
- **P2.6** — Entity palyginimo srautas
- **P2.7** — Paieškos filtrai
- **T5** — Favorites migracija į DB

### Sprint 4 (2 savaitės) — Turinys ir komunikacija
- **P2.3** — Atsiliepimų atsakymai
- **P2.4** — Nuotraukų palaikymas
- **P2.5** — Forumo pranešimai
- **T8** — ForumVote migracija į userId

### Sprint 5+ (ilgalaikis) — Augimas
- **P3.1-P3.8** — SEO, PWA, newsletter, accessibility, moderavimo įrankiai
- **T4** — Auth sistemos suvienodinimas
- **T12** — Next.js upgrade
- **T13** — Testų rašymas
- **T14** — i18n užbaigimas

---

## Metrikos stebėjimui

| Metrika | Dabartinė | Tikslas (3 mėn.) |
|---|---|---|
| Registruoti vartotojai | Nežinoma | 500+ |
| Atsiliepimų per savaitę | Nežinoma | 50+ (tikrų, moderuotų) |
| Forumo aktyvumas | 119 postų / 832 koment. | +100 postų / +500 koment. |
| Bounce rate | Nematuojama | <50% |
| Mobile naudojimas | Nematuojama | Stebėti (Analytics) |

**Pastaba:** Rekomenduojama pridėti analytics (Google Analytics 4 arba Plausible/Umami privacy-friendly alternatyva) kaip pirminį žingsnį metrikos stebėjimui.
