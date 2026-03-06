# PO Review — Vaikai.lt (2026-03-06)

Product Owner peržiūra po sprinto pradžios. Apima UX, turinį, konkurentų analizę ir rekomendacijas.

---

## 1. Kas veikia gerai

### Bendras produktas
- **Stiprus pagrindinis srautas:** Pradžia → Miestas → Kategorija → Kortelė → Detalus vaizdas → Atsiliepimas — veikia sklandžiai
- **Duomenų kiekis imponuoja:** 7 075 darželiai, 210 auklių, 210 būrelių, 160 specialistų, ~58 736 atsiliepimai — tai rimta duomenų bazė Lietuvos rinkai
- **43 miestai** su individualiomis SEO puslapiais — gera aprėptis
- **Paieškos pasiūlymai** (autocomplete) jau veikia: debounce 300ms, spalvoti kategorijų badge, iki 8 rezultatų

### SEO ir technika
- Structured data (LocalBusiness, Organization, FAQPage, BreadcrumbList) — teisingai implementuota
- Sitemap.xml su visais miestais ir puslapiais
- OG meta tags, canonical URL, hreflang — viskas vietoje
- `lang="lt"` ant HTML — teisingai

### Lietuviškas turinys
- **Kokybiškas lietuviškas tekstas** visur: navigacija, formos, klaidos, footer, D.U.K.
- Visos lietuviškos raidės (ąčęėįšųūž) teisingai naudojamos
- 15 D.U.K. klausimų su išsamiais atsakymais — puikus turinys
- Privatumo politika (BDAR) — profesionaliai parašyta

### UX elementai
- Dark/light mode su localStorage išsaugojimu
- Cookie consent (aiškus, BDAR-tinkamas)
- Mobile bottom nav su 5 pagrindiniais tabs
- Breadcrumb navigacija visur
- Skip-to-content link (a11y)
- Skeleton loading states

### Forumas
- 8 kategorijos, 119 įrašų, 832 komentarai — aktyvi bendruomenė
- Balsavimo sistema (upvote/downvote)
- Prisegtų ir užrakintų įrašų palaikymas
- Komentarų gylis iki 3 lygių

### Admin
- Pilnas dashboard su statistikos kortelėmis ir grafikais
- Eksportas JSON/CSV
- Atskiri puslapiai darželiams, auklėms, būreliams, specialistams, forumui

---

## 2. Kas reikalauja tobulinimo

### UX problemos (kritinės)

#### 2.1 Vilniaus miesto puslapis — per daug turinio
- **Problema:** Vilniuje yra 1 340 darželių. Kortelių sąrašas be paginacijos arba lazy loading gali būti labai ilgas.
- **Rekomendacija:** Pagination (po 20-30 kortelių) arba infinite scroll. Turėti aiškų rezultatų skaičių viršuje.

#### 2.2 Palyginimo funkcija — neveikia arba paslėpta
- **Problema:** Produkto specifikacijoje ir testimonials minima "patogi palyginimo funkcija", bet realiai P1 backlog'e kaip nepadaryta.
- **Rekomendacija:** Arba pašalinti iš testimonial teksto kol neimplementuota, arba prioritetizuoti aukščiau.

#### 2.3 Forumas — tuščias hero sekcija SSR metu
- **Problema:** Forumo puslapis per curl grąžina tik navigaciją ir footer — forumo turinys renderinamas tik kliento pusėje. SEO prasme — tuščias puslapis.
- **Rekomendacija:** Perkelti forumo turinio fetch į server component.

#### 2.4 Prisijungimo/registracijos puslapis — ar veikia?
- **Problema:** Yra prisijungimo forma, bet neaišku koks autentifikacijos backengas. Jei tai tik UI be tikro auth — klaidinantis.
- **Rekomendacija:** Arba implementuoti pilną auth, arba pašalinti/paslėpti registracijos formą, paliekant tik admin prisijungimą.

#### 2.5 Naujienlaiškio prenumerata — ar veikia?
- **Problema:** Footer'yje yra newsletter signup forma. Jei nėra email siuntimo infrastruktūros — tai tuščias pažadas.
- **Rekomendacija:** Patikrinti ar yra API endpoint. Jei ne — pašalinti arba pakeisti į "Sekite mus" su social links.

### UX problemos (vidutinės)

#### 2.6 Footer teksto stilistika
- **Dabartinis:** "Gaukite naujausias žinias apie vaikiškų paslaugų naujienas."
- **Problema:** Tautologija — "naujausias žinias" + "naujienas" = tas pats.
- **Siūlymas:** "Gaukite naujienas apie geriausias paslaugas vaikams."

#### 2.7 Miestų statistika — nepilna
- **Problema:** Daugelis miestų turi 0 auklių, 0 būrelių, 0 specialistų (pvz. Akmenė: 56 darželiai, bet 0 viso kito). Tai sukuria tuščių kategorijų tabs.
- **Rekomendacija:** Slėpti kategorijų tabs kurios turi 0 rezultatų arba rodyti "Kol kas nėra duomenų."

#### 2.8 Darželio kortelėje — informacijos trūkumas
- **Problema:** Kortelė rodo tik pavadinimą, adresą, reitingą. Nėra darbo valandų ar kontaktinio telefono.
- **Rekomendacija:** Pridėti tel. numerį ir darbo valandas (bent sutrumpintai) ant kortelės.

#### 2.9 EN kalbos palaikymas — nepilnas
- **Problema:** i18n sistema egzistuoja (lt/en), bet angliškas vertimas tikriausiai nepilnas arba nepatikrintas.
- **Rekomendacija:** Šiame sprinte — ignoruoti EN, fokusuotis į LT kokybę. Pašalinti kalbos selektorių jei EN neparuoštas.

---

## 3. Lietuviškų tekstų kokybė ir siūlymai

### Tekstai kuriuos siūlau pataisyti:

| Vieta | Dabartinis | Siūlomas | Priežastis |
|-------|-----------|----------|------------|
| Footer newsletter | "Gaukite naujausias žinias apie vaikiškų paslaugų naujienas." | "Gaukite naujienas apie geriausias paslaugas vaikams." | Tautologija |
| Pagrindinis hero | "Atsiliepimai, vertinimai ir palyginimas — viskas vienoje vietoje." | "Atsiliepimai, vertinimai ir palyginimas — viskas vienoje vietoje." | OK, nekeisti |
| Forumo CTA | "Klauskite kitų tėvelių, dalinkitės patirtimi ir gaukite patarimų apie darželius, aukles ir būrelius." | Trumpinti: "Dalinkitės patirtimi ir gaukite patarimų iš kitų tėvelių." | Per ilgas sakinys |
| Prisijungimo aprašas | "Prisijunkite, kad galėtumėte rašyti atsiliepimus" | "Prisijunkite, kad galėtumėte rašyti atsiliepimus ir dalyvauti forume" | Platesnis value proposition |
| Mėgstamiausieji tuščias | "Kraunama..." | Jei tuščia: "Kol kas neturite mėgstamiausių. Naršykite darželius ir paspauskite ❤️" | Geresnis empty state |

### Tekstai kurie yra GERI (nekeisti):
- Hero: "Raskite geriausią darželį, auklę ar būrelį savo vaikui" — aiškus, tiesioginis
- D.U.K. sekcija — išsamūs, natūralūs atsakymai
- Atsiliepimų forma — aiškios validacijos žinutės
- Cookie consent — tikslus, BDAR-tinkamas
- Forumo laiko žymės (ką tik, prieš X min.) — natūralios

---

## 4. Konkurentų analizė

### Pagrindiniai konkurentai:

| Svetainė | Funkcijos | Mūsų privalumas |
|----------|-----------|-----------------|
| **tevu-darzelis.lt** | Forumas su 400+ kategorijų, tėvystės turinys, podcastas, skaičiuoklės | Mes turime struktūrizuotą duomenų bazę su reitingais (jie — tik forumas) |
| **old-maps.vilnius.lt/darzeliai** | Interaktyvus žemėlapis, paieška pagal adresą, tipą, kalbą, amžių | Jie tik Vilnius; mes — visa Lietuva |
| **darzelis.vilnius.lt** | Oficiali registracija, statistika, žemėlapis | Oficialūs duomenys, bet tik registracija |
| **svietimas.vilnius.lt** | Eilių valdymas, priskyrimas | Tik administracinis, ne atsiliepimų platforma |
| **musudarzelis.com** | Elektroninis dienynas darželiams | Kitas segmentas (B2B), ne mūsų konkurentas |

### Funkcijos kurias turi konkurentai, bet MES neturime:

1. **Interaktyvus žemėlapis** (old-maps.vilnius.lt) — paieška pagal adresą, darželių vizualizacija žemėlapyje. **KRITINIS trūkumas.**
2. **Tiesioginės nuorodos į registracijos sistemas** — svietimas.vilnius.lt, kaunas.lt ir kt. Tėvai nori ne tik rasti, bet ir REGISTRUOTIS.
3. **Filtravimas pagal ugdymo kalbą** — old-maps.vilnius.lt leidžia filtruoti LT/RU/PL kalba
4. **Filtravimas pagal amžiaus grupę** — nuo kokio amžiaus priima
5. **Tėvystės turinio skyrius** (tevu-darzelis.lt) — straipsniai, patarimai, skaičiuoklės
6. **Podcast/video turinys** (tevu-darzelis.lt)
7. **Darželio nuotraukos** — vizualinis turinys labai svarbus renkantis

---

## 5. Rekomenduojami kito sprinto prioritetai

### Kitas sprintas: TOP 5 prioritetai

| # | Funkcija | Priežastis | Effort |
|---|---------|-----------|--------|
| 1 | **Žemėlapio integracija (OpenStreetMap)** | Konkurentai turi, tėvai tikisi. Didžiausias UX privalumas. | M |
| 2 | **Nuorodos į registracijos sistemas** | Didžiausia tėvų poreikis — ne tik rasti, bet registruotis. Mažas effort, didelis value. | S |
| 3 | **Palyginimo funkcija** | Jau minima testimonials, produkto specifikacijoje. Vartotojai tikisi. | M |
| 4 | **Darželio nuotraukos** | Vizualinis turinys dramatiškai padidina konversiją. | M |
| 5 | **Filtravimas pagal kalbą ir amžių** | Konkurentai turi, tėvams labai aktualu (ypač Vilniuje su RU/PL darželiais). | S |

### Techninė skola (spręsti lygiagrečiai):
- Forumo SSR (SEO)
- Paginacija/infinite scroll miestų puslapiuose
- Auth sistemos išgryninimas (arba pilnas, arba pašalinti)
- EN vertimo pašalinimas jei neparuoštas

---

## 6. Bendras produkto vertinimas

| Kriterijus | Balas (1-5) | Komentaras |
|-----------|-------------|-----------|
| **Funkcionalumas** | 4/5 | Pagrindinis flow veikia puikiai. Trūksta palyginimo ir žemėlapio. |
| **Lietuviškas turinys** | 4.5/5 | Labai geras. Keletas smulkių pataisymų. |
| **SEO** | 4/5 | Structured data, sitemap, OG — viskas. Forumo SSR reikia taisyti. |
| **Mobile UX** | 3.5/5 | Bottom nav yra, bet modalai nėra bottom-sheet. Ilgi sąrašai be paginacijos. |
| **Admin** | 4/5 | Dashboard su grafikais, eksportas. Trūksta masinio atsiliepimų tvirtinimo. |
| **Konkurencingumas** | 3.5/5 | Vienintelė Lietuvoje su tokia atsiliepimų baze. Bet trūksta žemėlapio ir registracijos nuorodų. |

### Vienu sakiniu:
**Vaikai.lt yra stiprus produktas su unikalia rinkos pozicija (vienintelė atsiliepimų platforma ikimokykliniams), bet norint tapti "go-to" įrankiu tėvams, reikia žemėlapio, registracijos nuorodų ir palyginimo funkcijos.**

---

*PO Review atlikta: 2026-03-06*
*Product Owner: Claude (AI PO)*
