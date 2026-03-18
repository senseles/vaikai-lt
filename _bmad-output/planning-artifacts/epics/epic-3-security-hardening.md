# Epikas 3: Saugumo Sustiprinimas

## Apžvalga

**Pavadinimas:** Saugumo Sustiprinimas ir Apsauga nuo Piktnaudžiavimo
**Tikslas:** Įdiegti visapusišką saugumo sluoksnį, apsaugantį platformą nuo botų, spam'o, injection atakų ir kenkėjiškų vartotojų. Užtikrinti, kad visos vartotojų įvestys būtų saugios ir validuotos.
**Bendri istorijos taškai:** 26 SP
**Prioritetas:** Kritinis (blokuoja Epic 2)

---

## Istorija 1: Input Sanitization Middleware

**Pavadinimas:** Globalus įvesties sanitizavimo ir validavimo sluoksnis

**Aprašymas:** Sukurti centralizuotą input sanitization biblioteką naudojant DOMPurify ir Zod, kuri bus taikoma visoms API route'ams. Kiekvienas string laukas turi būti sanitizuotas prieš patekdamas į DB. Apsauga nuo XSS, HTML injection ir SQL injection.

**Istorijos taškai:** 5 SP

**Priklausomybės:** Jokių

**Priėmimo kriterijai:**

- **Duota**, kad vartotojas siunčia POST/PATCH užklausą su HTML tagais string lauke (pvz. `<script>alert('xss')</script>`),
  **Kai** užklausa apdorojama serverio pusėje,
  **Tada** visi HTML tagai turi būti pašalinti prieš duomenų įrašymą, o grąžinamas švarus tekstas.

- **Duota**, kad vartotojas siunčia string su SQL injection bandymu (pvz. `'; DROP TABLE users; --`),
  **Kai** užklausa patenka į Prisma ORM,
  **Tada** užklausa turi būti saugiai parametrizuota ir injection neturi turėti jokio efekto.

- **Duota**, kad programuotojas kuria naują API endpoint'ą,
  **Kai** jis naudoja centralizuotą sanitization biblioteką,
  **Tada** visi laukai turi būti automatiškai validuojami per Zod schemą ir sanitizuojami per DOMPurify.

---

## Istorija 2: Rate Limiting Sistema

**Pavadinimas:** Sliding window rate limiting API endpoint'ams

**Aprašymas:** Įdiegti rate limiting sistemą naudojant DB (RateLimit modelis), kuri riboja užklausų skaičių per IP/session pagal veiksmų tipą. Taikoma pasiūlymams, atsiliepimams, pranešimams ir kontaktų formoms.

**Istorijos taškai:** 5 SP

**Priklausomybės:** Prisma schema (RateLimit modelis)

**Priėmimo kriterijai:**

- **Duota**, kad vartotojas iš to paties IP jau pateikė 3 pasiūlymus per paskutinę valandą,
  **Kai** jis bando pateikti 4-ąjį pasiūlymą,
  **Tada** API turi grąžinti 429 statusą su pranešimu „Per daug užklausų. Bandykite vėliau." ir neleisti sukurti įrašo.

- **Duota**, kad praėjo daugiau nei 60 minučių nuo pirmojo pasiūlymo,
  **Kai** vartotojas pateikia naują pasiūlymą,
  **Tada** skaitiklis turi būti atstatytas ir pasiūlymas priimtas.

- **Duota**, kad skirtingi veiksmai turi skirtingus limitus (submission: 3/h, review: 5/h, report: 10/h),
  **Kai** vartotojas pasiekia vieną limitą,
  **Tada** kiti veiksmai turi likti prieinami (limitai yra nepriklausomi).

---

## Istorija 3: hCaptcha Integracija

**Pavadinimas:** hCaptcha integracija į vartotojų formas

**Aprašymas:** Integruoti hCaptcha (privacy-friendly CAPTCHA) į pasiūlymų formą, atsiliepimų formą ir forumo komentarų formą. Server-side verifikacija prieš priimant duomenis.

**Istorijos taškai:** 5 SP

**Priklausomybės:** hCaptcha site key ir secret key (Daniel turi sukurti paskyrą)

**Priėmimo kriterijai:**

- **Duota**, kad vartotojas užpildo pasiūlymo formą ir išsprendžia CAPTCHA,
  **Kai** jis paspaudžia „Siūlyti",
  **Tada** serveris turi patikrinti CAPTCHA token per hCaptcha API ir priimti pasiūlymą tik jei token validus.

- **Duota**, kad botas bando pateikti formą be CAPTCHA tokeno arba su netinkamu tokenu,
  **Kai** užklausa pasiekia serverį,
  **Tada** API turi grąžinti 400 statusą su pranešimu „CAPTCHA patikrinimas nepavyko" ir neįrašyti duomenų.

- **Duota**, kad vartotojas naudoja mobilų įrenginį,
  **Kai** jis mato CAPTCHA widget'ą,
  **Tada** widget'as turi būti responsive ir netrukdyti formos naudojimui.

---

## Istorija 4: Honeypot Laukai

**Pavadinimas:** Honeypot anti-bot apsauga formose

**Aprašymas:** Pridėti paslėptus honeypot laukus (CSS hidden, aria-hidden, tabindex=-1) į visas viešas formas. Jei laukas užpildytas — atmesti kaip botą be klaidos pranešimo (silent reject, grąžinti 200 su fake success).

**Istorijos taškai:** 3 SP

**Priklausomybės:** Jokių

**Priėmimo kriterijai:**

- **Duota**, kad formoje yra paslėptas laukas `website_url` su `aria-hidden="true"` ir `tabindex="-1"`,
  **Kai** tikras vartotojas pildo formą,
  **Tada** paslėptas laukas lieka tuščias ir forma pateikiama normaliai.

- **Duota**, kad botas automatiškai užpildo visus laukus įskaitant honeypot lauką,
  **Kai** forma pateikiama su netuščiu honeypot lauku,
  **Tada** serveris turi tyliai atmesti užklausą — grąžinti 200 su sėkmės pranešimu (apgauti botą), bet neįrašyti duomenų į DB.

- **Duota**, kad vartotojas naudoja screen reader'į,
  **Kai** jis naviguoja per formą,
  **Tada** honeypot laukas turi būti nematomas screen reader'iui (aria-hidden).

---

## Istorija 5: Security Headers ir CSP

**Pavadinimas:** Content Security Policy ir saugumo antraštės

**Aprašymas:** Konfigūruoti Next.js middleware ir `next.config.js` su pilnu saugumo antraščių rinkiniu: CSP, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy.

**Istorijos taškai:** 3 SP

**Priklausomybės:** hCaptcha integracija (reikia leisti hcaptcha.com CSP)

**Priėmimo kriterijai:**

- **Duota**, kad puslapis kraunamas naršyklėje,
  **Kai** patikrinamos response antraštės,
  **Tada** turi būti: `Content-Security-Policy` (su hcaptcha.com whitelist), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

- **Duota**, kad kenkėjas bando įterpti iframe su Vaikai.lt turiniu savo puslapyje,
  **Kai** naršyklė gauna `X-Frame-Options: DENY`,
  **Tada** iframe turi būti blokuojamas.

- **Duota**, kad CSP yra aktyvuotas,
  **Kai** puslapis bando vykdyti inline script'ą ne iš leistinų šaltinių,
  **Tada** script'as turi būti blokuojamas ir pranešimas turi atsirasti naršyklės konsolėje.

---

## Istorija 6: Admin Audit Log

**Pavadinimas:** Administratoriaus veiksmų registravimas

**Aprašymas:** Sukurti AuditLog modelį Prisma schemoje, kuris fiksuoja visus admin veiksmus: verifikavimus, atmetimus, pasiūlymų peržiūras, moderavimus. Rodyti audit log admin dashboard'e.

**Istorijos taškai:** 5 SP

**Priklausomybės:** Istorijos 1-5

**Priėmimo kriterijai:**

- **Duota**, kad administratorius patvirtina darželio verifikaciją,
  **Kai** veiksmas įvykdomas,
  **Tada** AuditLog turi užfiksuoti: admin ID, veiksmo tipą (VERIFY), tikslo tipą (KINDERGARTEN), tikslo ID, seną ir naują statusą, timestamp.

- **Duota**, kad administratorius nori peržiūrėti paskutinių veiksmų istoriją,
  **Kai** jis atidaro audit log puslapį,
  **Tada** turi matyti pagal datą surūšiuotą sąrašą su filtrais pagal veiksmo tipą ir administratorių.

- **Duota**, kad du administratoriai dirba tuo pačiu metu,
  **Kai** abu bando patvirtinti tą patį įrašą,
  **Tada** tik vienas veiksmas turi būti įrašytas, o antras turi gauti conflict pranešimą.
