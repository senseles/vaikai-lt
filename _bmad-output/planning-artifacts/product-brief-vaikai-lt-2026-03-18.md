---
stepsCompleted: [step-01, step-02, step-03, step-04, step-05, step-06]
inputDocuments: []
date: 2026-03-18
author: Daniel
---

# Product Brief: Vaikai.lt — Duomenų Kokybė ir Vartotojų Pasiūlymai

## 1. Vizija ir Problema

### Problema
Vaikai.lt platforma turi ~304 darželius ir ~3823 atsiliepimus duomenų bazėje, tačiau:
- Duomenys nėra patikrinti — gali būti pasenę, netikslūs ar sugeneruoti
- Vartotojai negali pridėti trūkstamų darželių/auklių — jei nerado savo, jie tiesiog palieka puslapį
- Nėra apsaugos nuo spam'o, botų ir kenkėjiškų įvedimų
- Production-ready duomenų kokybė yra **pagrindinis veiksnys** dėl kurio žmonės naudos platformą

### Sprendimas
Dviejų dalių sistema:
1. **Duomenų validavimo/atnaujinimo mechanizmas** — administratorius gali tikrinti, patvirtinti, redaguoti ir atmesti visus esamus duomenis (darželiai, auklės, būreliai, specialistai, atsiliepimai)
2. **Vartotojų pasiūlymų sistema** — vartotojai gali siūlyti naujus darželius/aukles, admin patvirtina/atmeta, su pilna apsauga nuo injection, botų ir spam'o

### Unikali Vertė
- Patikimi, realūs duomenys (ne iš generatoriaus) — tai #1 priežastis kodėl tėvai grįš
- Bendruomenės kuriamas turinys su kokybės kontrole
- Pirmoji LT platforma kur tėvai patys gali papildyti darželių bazę

## 2. Tiksliniai Vartotojai

### Persona A: Tėvai/Globėjai (Pagrindiniai)
- Ieško darželio, auklės ar būrelio savo vaikui
- Nori matyti tikrus, aktualius duomenis ir atsiliepimus
- Jei neranda savo darželio — nori jį pridėti
- Vertina patikimumą ir bendruomenės atsiliepimus

### Persona B: Administratorius (Daniel)
- Valdo visą duomenų kokybę
- Tikrina, redaguoja, patvirtina/atmeta įrašus
- Tvarko vartotojų pasiūlymus
- Stebi duomenų kokybės metrikas

### Persona C: Potencialūs Spam'eriai/Botai (Priešininkai)
- Bandys pridėti reklaminį turinį
- Automatizuoti botai
- SQL/XSS/NoSQL injection bandymai

## 3. Sėkmės Metrikos

| Metrika | Tikslas |
|---------|---------|
| Patikrintų darželių % | >90% per 1 mėn |
| Vartotojų pasiūlymų per savaitę | >5 |
| Spam'o praslydimo rodiklis | <1% |
| Admin patvirtinimo laikas | <24h vidutiniškai |
| Vartotojų grįžtamumas | +20% po duomenų valymo |

## 4. MVP Apimtis

### Įeina (Must Have)
- [ ] Admin duomenų tikrinimo dashboard'as su bulk operacijomis
- [ ] Kiekvieno įrašo verifikavimo statusas (nepatikrintas/patvirtintas/atmestas)
- [ ] Vartotojo forma siūlyti naują darželį/auklę
- [ ] Admin pasiūlymų peržiūra ir patvirtinimas/atmetimas
- [ ] Rate limiting, CAPTCHA, input sanitization
- [ ] Honeypot laukai prieš botus
- [ ] CSP headers, XSS/SQL injection apsauga
- [ ] Atsiliepimų validavimas ir moderavimas

### Neįeina (Ateičiai)
- Automatinis duomenų scraping'as iš viešų šaltinių
- AI-powered spam detektas
- Vartotojų reputacijos sistema
- Duomenų importas iš oficialių registrų
