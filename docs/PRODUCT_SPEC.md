# Vaikai.lt — Produkto specifikacija

## Vizija
Vaikai.lt — platforma tėveliams visoje Lietuvoje rasti darželius, aukles, būrelius ir vaikų specialistus. Atsiliepimai, vertinimai ir palyginimas vienoje vietoje.

---

## 1. Pilnas funkcijų sąrašas (senoji svetainė)

### 1.1 Kategorijos (tabs)
| Kategorija | Duomenų kiekis | Aprašymas |
|---|---|---|
| Darželiai | ~343 | Valstybiniai ir privatūs lopšeliai-darželiai |
| Auklės | ~50 | Individualios auklės su profiliais |
| Būreliai | ~64 | Sporto, meno, IT, kalbų būreliai |
| Specialistai | ~44 | Logopedai, psichologai, pediatrai, kt. |

### 1.2 Paieška ir filtravimas
- Teksto paieška su lietuviškų raidžių palaikymu (ą→a, č→c, ė→e, š→s, ž→z)
- Filtravimas pagal miestą/regioną
- Filtravimas pagal tipą (valstybinis/privatus/visi) — tik darželiams
- Debounce paieškos input'ui (mobili optimizacija)
- Screen reader pranešimai apie rezultatų kiekį

### 1.3 Darželių kortelės
- Pavadinimas, adresas, miestas, rajonas
- Žvaigždučių reitingas (1-5)
- Atsiliepimų skaičius
- Tipas (valstybinis/privatus) badge
- Privatūs: kaina, metodologija, grupės dydis
- Mėgstamiausių širdutė (❤️/🤍)
- Palyginimo mygtukas

### 1.4 Detalus vaizdas (modalas)
- Visa informacija: adresas, darbo valandos, grupių sk., ugdymo kalba, amžius nuo
- Ypatybės (features): logopedas, baseinas, sporto salė, kt.
- Pastabos (pvz. atvirų durų diena)
- Atsiliepimų sąrašas su datomis
- Spausdinti, dalintis mygtukai
- Privačių darželių papildoma info: kaina, metodologija, grupės dydis

### 1.5 Atsiliepimų sistema
- Žvaigždučių pasirinkimas (1-5)
- Autoriaus vardas
- Atsiliepimo tekstas
- Rekomenduočiau: Taip/Ne
- Saugoma localStorage

### 1.6 Palyginimo funkcija
- Iki N darželių palyginimas šalia vienas kito
- Modalas su lentele

### 1.7 Mėgstamiausieji
- Pridėti/pašalinti ❤️
- Atskiras puslapis su visomis kategprijomis
- Badge su skaičiumi navigacijoje
- Išvalyti visus mygtukas

### 1.8 Miestai ir regionai
- 10 apskričių, ~60 miestų
- Miestų kortelės su statistika
- Regiono puslapiai

### 1.9 Administravimas
- Admin mygtukas footer'yje (⚙️)
- Pridėti naują darželį/auklę/būrelį/specialistą (modalai su formomis)
- Duomenys saugomi localStorage

### 1.10 UX funkcijos
- Dark/light mode perjungimas
- PWA manifest (instaleable)
- Cookie consent banner
- Back-to-top mygtukas
- Share (Web Share API / clipboard)
- Skeleton loading
- Smooth scroll su prefers-reduced-motion palaikymu
- Skip-to-content link (a11y)
- Noscript fallback

### 1.11 SEO
- Structured data: WebSite, Organization, FAQPage
- Open Graph + Twitter Card meta
- Canonical URL
- Dinaminiai title/description pagal route
- hreflang lt + x-default

### 1.12 Statinis turinys
- D.U.K. sekcija (6 klausimai su atsakymais)
- Registracijos informacijos sekcija
- Footer su nuorodomis (Švietimo ministerija, Vilniaus švietimas)

---

## 2. User Stories

### P0 — Must-have (MVP)

#### US-01: Darželių peržiūra pagal miestą
**Kaip** tėvelis, **noriu** matyti darželių sąrašą savo mieste, **kad** galėčiau palyginti ir išsirinkti.
- **AC:** Pasirinkus miestą rodomas kortelių sąrašas su pavadinimu, adresu, reitingu, tipu
- **AC:** Galima filtruoti valstybinis/privatus
- **AC:** Veikia paieška su LT raidėmis

#### US-02: Darželio detalus puslapis
**Kaip** tėvelis, **noriu** matyti visą informaciją apie darželį, **kad** galėčiau nuspręsti ar jis tinka.
- **AC:** Rodoma: adresas, valandos, grupių sk., kalba, ypatybės, aprašymas
- **AC:** Rodomi atsiliepimai su reitingais
- **AC:** Galima dalintis nuoroda

#### US-03: Atsiliepimų rašymas
**Kaip** tėvelis, **noriu** parašyti atsiliepimą apie darželį, **kad** padėčiau kitiems tėvams.
- **AC:** Forma: žvaigždutės (1-5), vardas, tekstas, rekomenduočiau Taip/Ne
- **AC:** Po paskelbimo atsiliepimas iškart matomas
- **AC:** Duomenys saugomi DB (ne tik localStorage!)

#### US-04: Auklių, būrelių, specialistų peržiūra
**Kaip** tėvelis, **noriu** rasti aukles/būrelius/specialistus savo mieste.
- **AC:** Category tabs veikia: Darželiai, Auklės, Būreliai, Specialistai
- **AC:** Kiekviena kategorija turi atitinkamas korteles ir filtrus
- **AC:** Specialistai: specialybė, klinika, kaina, kontaktai

#### US-05: Mobili navigacija
**Kaip** tėvelis telefone, **noriu** patogiai naršyti svetainę.
- **AC:** Hamburger meniu
- **AC:** Responsive kortelės (1 stulpelis mobiliuose)
- **AC:** Touch-friendly mygtukai (min 44px)

#### US-06: Mėgstamiausieji
**Kaip** tėvelis, **noriu** išsisaugoti patikusius darželius, **kad** galėčiau vėliau palyginti.
- **AC:** ❤️ mygtukas ant kiekvienos kortelės
- **AC:** Atskiras /megstamiausieji puslapis
- **AC:** Badge su skaičiumi navigacijoje
- **AC:** Anoniminiams — localStorage, prisijungusiems — DB

### P1 — Should-have

#### US-07: Palyginimo funkcija
**Kaip** tėvelis, **noriu** palyginti kelis darželius šalia vienas kito.
- **AC:** Palyginimo mygtukas ant kortelės
- **AC:** Modalas/puslapis su lentele
- **AC:** Palyginama: reitingas, tipas, kaina, ypatybės, valandos

#### US-08: Admin panelė
**Kaip** admin, **noriu** tvarkyti duomenis be programavimo.
- **AC:** Prisijungimas su slaptažodžiu (NextAuth)
- **AC:** CRUD: pridėti/redaguoti/trinti darželius, aukles, būrelius, specialistus
- **AC:** Atsiliepimų moderavimas (approve/reject)

#### US-09: Dark mode
**Kaip** vartotojas, **noriu** tamsaus režimo, **kad** būtų patogiau naudotis vakare.
- **AC:** Toggle mygtukas header'yje
- **AC:** Respektuoja prefers-color-scheme
- **AC:** Išsaugoma localStorage

#### US-10: SEO ir Structured Data
**Kaip** svetainės savininkas, **noriu** gero SEO, **kad** tėveliai rastų per Google.
- **AC:** Dinaminiai meta tags kiekvienam puslapiui
- **AC:** JSON-LD: WebSite, Organization, FAQPage, LocalBusiness
- **AC:** Sitemap.xml
- **AC:** OG image

### P2 — Nice-to-have

#### US-11: PWA
- Manifest.json, offline support, install prompt

#### US-12: Share funkcionalumas
- Web Share API arba clipboard copy

#### US-13: D.U.K. sekcija
- Accordion su 6+ klausimais

#### US-14: Registracijos informacija
- Nuorodos į savivaldybių sistemas

#### US-15: Cookie consent
- Banner su sutinku/atmesti

#### US-16: Print funkcija
- Darželio kortelės spausdinimas

---

## 3. Mobili UX reikalavimai

| Elementas | Reikalavimas |
|---|---|
| Touch targets | Min 44×44px visi mygtukai |
| Kortelės | 1 stulpelis iki 640px, 2 stulpeliai iki 1024px |
| Meniu | Hamburger su slide-out |
| Category tabs | Horizontalus scroll jei netelpa |
| Modals | Full-screen bottom-sheet mobiliuose |
| Paieška | Sticky header su search |
| Font size | Min 16px body (išvengia iOS zoom) |
| Spacing | Min 8px tarp elementų |
| Images | Lazy loading, responsive |

---

## 4. Lietuviški tekstai / vertimai

### Navigacija
- Darželiai, Auklės, Būreliai, Specialistai
- Miestai, Mėgstamiausieji, D.U.K., Registracija
- Dalintis, Tamsus/Šviesus režimas, Atidaryti meniu

### Formos
- Pridėti darželį / auklę / būrelį / specialistą
- Pavadinimas, Tipas, Apskritis, Miestas, Adresas, Rajonas
- Ugdymo kalba, Amžius nuo, Aprašymas
- Vertinimas, Jūsų vardas, Atsiliepimas
- Ar rekomenduotumėte? Taip / Ne
- Atšaukti, Pridėti, Paskelbti

### Tipai
- Valstybinis darželis, Privatus darželis
- Valstybiniai darželiai, Privatūs darželiai, Visi

### Specialistų specialybės
- Logopedas, Psichologas, Kineziterapeutas, Ergoterapeutas
- Neurologas, Pediatras, Alergologas, Ortodontas

### Būrelių kategorijos
- Sportas, Menai, Muzika, Šokiai, IT/Programavimas
- Robotika, Kalbos, Gamta/Mokslas, Teatras, Kita

### Auklių laukai
- Vardas, Pavardė, Kaina (€/val.), Patirtis (metai)
- Kalbos, Amžiaus grupė, Prieinamumas
- Pilnas etatas, Pusė etato, Valandinis, Savaitgaliais

### Apskritys
- Vilniaus, Kauno, Klaipėdos, Šiaulių, Panevėžio
- Alytaus, Marijampolės, Utenos, Telšių, Tauragės

### Statusų pranešimai
- Nieko nerasta pagal pasirinktus filtrus
- Rastas 1 rezultatas / Rasta rezultatų: N
- Kol kas neturite mėgstamiausių
- Ar tikrai norite išvalyti visus mėgstamiausius?

### Footer
- Navigacija, Naudingos nuorodos, Kontaktai
- Švietimo ministerija, Ikimokyklinis ugdymas, Vilniaus švietimas
- Informacija pateikiama orientaciniais tikslais
- © 2026 Vaikai.lt. Visos teisės saugomos.

### Cookie banner
- 🍪 Šis tinklalapis naudoja slapukus (localStorage) jūsų nuostatoms ir atsiliepimams išsaugoti.
- Sutinku / Atmesti

### D.U.K.
1. Kaip registruoti vaiką į darželį?
2. Nuo kokio amžiaus priimami vaikai?
3. Kiek kainuoja darželis?
4. Kaip ilgai reikia laukti vietos?
5. Ar galiu pasirinkti ugdymo kalbą?
6. Kokios darbo valandos?
