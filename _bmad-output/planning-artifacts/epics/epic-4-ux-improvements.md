# Epikas 4: UX Patobulinimai ir Navigacijos Optimizavimas

## Apžvalga

**Pavadinimas:** UX/UI Patobulinimai — Navigacija, Formos ir Vartotojo Kelionė
**Tikslas:** Peržiūrėti visą platformos UX iš vartotojo perspektyvos. Identifikuoti ir ištaisyti „annoying" vietas kur vartotojas susiduria su nereikalinga trintimi — ypač formos, prisijungimo reikalavimai, navigacija tarp puslapių.
**Bendri istorijos taškai:** 21 SP
**Prioritetas:** Aukštas (tiesiogiai veikia vartotojų grįžtamumą)

---

## Istorija 1: Forumo/Atsiliepimų Rašymas be Prisijungimo

**Pavadinimas:** Leisti rašyti forume ir palikti atsiliepimus be prisijungimo

**Aprašymas:** Šiuo metu vartotojas užpildo formą, paspaudžia „Siųsti" ir TIK TADA sužino kad reikia prisijungti. Tai yra labai erzinantis patyrimas — prarandami įvesti duomenys ir motyvacija. Sprendimas: leisti rašyti anonimiškai su vardu/el. paštu ARBA išsaugoti draft'ą prieš nukreipiant prisijungti.

**Istorijos taškai:** 5 SP

**Priklausomybės:** Epic 3 (honeypot + CAPTCHA apsauga anoniminiams vartotojams)

**Priėmimo kriterijai:**

- **Duota**, kad neprisijungęs vartotojas nori parašyti atsiliepimą,
  **Kai** jis atidaro atsiliepimo formą,
  **Tada** forma turi leisti įvesti vardą, el. paštą (optional) ir atsiliepimo tekstą be prisijungimo, su CAPTCHA verifikacija.

- **Duota**, kad neprisijungęs vartotojas rašo forumo komentarą,
  **Kai** jis bando pateikti komentarą,
  **Tada** sistema turi priimti komentarą su vardu (ne „Anonimas" — privalo įvesti) ir CAPTCHA, be prisijungimo reikalavimo.

- **Duota**, kad vartotojas pradėjo pildyti formą ir paspaudė „Siųsti",
  **Kai** sistema nusprendžia kad reikia papildomo veiksmo (pvz. CAPTCHA),
  **Tada** formos duomenys TURI būti išsaugoti ir nerodyti tuščios formos.

---

## Istorija 2: „Nerandi? Pasiūlyk!" Kontekstiniai Raginimai

**Pavadinimas:** Proaktyvūs raginimai pridėti trūkstamą darželį/auklę

**Aprašymas:** Kai vartotojas ieško ir neranda rezultatų, arba naršo tuščią kategoriją — rodyti aiškų ir draugišką raginimą „Nerandi savo darželio? Pasiūlyk jį pridėti!" su tiesiogine nuoroda į pasiūlymo formą, užpildant kontekstą (pvz. miestą, paiešką).

**Istorijos taškai:** 3 SP

**Priklausomybės:** Epic 2 (pasiūlymų forma)

**Priėmimo kriterijai:**

- **Duota**, kad paieška grąžina 0 rezultatų,
  **Kai** vartotojas mato tuščią puslapį,
  **Tada** turi matyti CTA mygtuką „Nerandi? Pasiūlyk pridėti!" su nuoroda į pasiūlymo formą, kur paieškos tekstas pre-filled.

- **Duota**, kad vartotojas naršo darželius tam tikrame mieste ir yra mažai rezultatų (<3),
  **Kai** jis pasiekia sąrašo apačią,
  **Tada** turi matyti „Žinai daugiau darželių šiame mieste? Padėk kitiems tėvams — pasiūlyk pridėti!"

---

## Istorija 3: Navigacijos Breadcrumbs ir Grįžimo Mygtukas

**Pavadinimas:** Nuosekli navigacija su breadcrumbs ir „Atgal" funkcionalumu

**Aprašymas:** Peržiūrėti visus puslapius ir užtikrinti kad: (1) kiekviename puslapyje yra aiškūs breadcrumbs, (2) modal/detail langai turi aiškų grįžimą, (3) naršyklės „Back" mygtukas veikia logiškai (negrąžina per 5 modals atgal).

**Istorijos taškai:** 3 SP

**Priklausomybės:** Jokių

**Priėmimo kriterijai:**

- **Duota**, kad vartotojas yra darželio detalių puslapyje,
  **Kai** jis nori grįžti į sąrašą,
  **Tada** turi matyti breadcrumb navigaciją (Pradžia > Darželiai > Vilnius > Darželio Pavadinimas) ir galėti spustelėti bet kurį lygį.

- **Duota**, kad vartotojas atidarė 3 modalus iš eilės (darželis → atsiliepimas → atsakymas),
  **Kai** jis paspaudžia naršyklės „Back",
  **Tada** turi būti uždaromas tik paskutinis modalas, o ne grįžtama į ankstesnį puslapį.

---

## Istorija 4: Mobilios Navigacijos Optimizavimas

**Pavadinimas:** Mobilaus meniu ir filtrų UX pagerinimas

**Aprašymas:** Peržiūrėti mobilią navigaciją: hamburger meniu, filtrų prieinamumas, formos elementų dydis liečiamuosiuose ekranuose, sticky header elgesys, „back to top" mygtukas ilguose sąrašuose.

**Istorijos taškai:** 3 SP

**Priklausomybės:** Jokių

**Priėmimo kriterijai:**

- **Duota**, kad vartotojas naršo telefonu darželių sąrašą su aktyviais filtrais,
  **Kai** jis slenkia žemyn,
  **Tada** aktyvūs filtrai turi būti matomi (sticky bar viršuje arba compact chip'ai) su galimybe juos pašalinti vienu paspaudimu.

- **Duota**, kad vartotojas yra ilgo sąrašo apačioje mobiliu,
  **Kai** jis nori grįžti į viršų,
  **Tada** turi būti matomas „↑" (scroll to top) mygtukas.

- **Duota**, kad formos mygtukai ir input laukai rodomi mobiliame ekrane,
  **Kai** vartotojas bando juos paspausti/paliesti,
  **Tada** touch target turi būti ne mažesnis nei 44x44px pagal WCAG gaires.

---

## Istorija 5: Paieškos UX Pagerinimas

**Pavadinimas:** Geresnė paieškos patirtis su autosuggestions ir instant results

**Aprašymas:** Patobulinti paieškos laukelį: debounced search su instant rezultatais dropdown'e, populiarių paieškų pasiūlymai kai laukelis tuščias, aiškus „X" mygtukas valyti, paieškos istorija (localStorage).

**Istorijos taškai:** 5 SP

**Priklausomybės:** Jokių

**Priėmimo kriterijai:**

- **Duota**, kad vartotojas pradeda rašyti paieškos laukelyje,
  **Kai** jis įvedė 2+ simbolius,
  **Tada** po 300ms turi atsirasti dropdown su top 5 rezultatais (darželiai + auklės), kuriuos galima spustelėti.

- **Duota**, kad vartotojas paspaudžia ant tuščio paieškos laukelio,
  **Kai** jis dar nieko neįvedė,
  **Tada** turi matyti populiariausias paieškas arba savo paskutines paieškas.

- **Duota**, kad paieškos rezultatų nėra,
  **Kai** dropdown rodo „Nieko nerasta",
  **Tada** turi būti rodomas ir pasiūlymas „Nerandi? Pasiūlyk pridėti →"

---

## Istorija 6: Loading States ir Error Handling UX

**Pavadinimas:** Nuoseklūs loading indikatoriai ir draugiški klaidų pranešimai

**Aprašymas:** Peržiūrėti visus asinchroninius veiksmus (formos, filtrai, puslapiavimas) ir užtikrinti kad: (1) kiekvienas veiksmas turi loading state, (2) klaidos turi draugišką LT pranešimą su pasiūlymu ką daryti, (3) nėra „blank screen" momentų.

**Istorijos taškai:** 2 SP

**Priklausomybės:** Jokių

**Priėmimo kriterijai:**

- **Duota**, kad vartotojas paspaudžia „Siūlyti" formos mygtuką,
  **Kai** serveris apdoroja užklausą,
  **Tada** mygtukas turi rodyti spinner'į, būti disabled, ir tekstas pasikeisti į „Siunčiama..."

- **Duota**, kad API grąžina klaidą,
  **Kai** vartotojas mato klaidos pranešimą,
  **Tada** pranešimas turi būti lietuviškas, suprantamas (ne „Error 500") ir turėti „Bandyti dar kartą" mygtuką.
