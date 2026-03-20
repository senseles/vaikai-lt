"use client";

import { useState } from "react";

import Link from "next/link";
import { type ReactNode } from "react";

interface FaqItem {
  readonly question: string;
  readonly answer: string;
  readonly richAnswer?: ReactNode;
}

const linkCls = "text-primary hover:underline font-medium";

const faqItems: readonly FaqItem[] = [
  {
    question: "Kaip registruoti vaiką į darželį?",
    answer:
      "Registracija vykdoma per savivaldybės sistemą. Vilniuje — svietimas.vilnius.lt, Kaune — darzelis.kaunas.lt, kituose miestuose — per atitinkamą savivaldybės portalą. Prašymus galima teikti internetu.",
    richAnswer: (
      <>
        Registracija vykdoma per savivaldybės sistemą. Prašymus galima teikti internetu:
        <ul className="mt-2 ml-4 space-y-1 list-disc">
          <li>Vilniuje — <a href="https://svietimas.vilnius.lt" target="_blank" rel="noopener noreferrer" className={linkCls}>svietimas.vilnius.lt</a></li>
          <li>Kaune — <a href="https://www.kaunas.lt/" target="_blank" rel="noopener noreferrer" className={linkCls}>kaunas.lt</a></li>
          <li>Klaipėdoje — <a href="https://www.klaipeda.lt/svietimas" target="_blank" rel="noopener noreferrer" className={linkCls}>klaipeda.lt/svietimas</a></li>
          <li>Šiauliuose — <a href="https://www.siauliai.lt" target="_blank" rel="noopener noreferrer" className={linkCls}>siauliai.lt</a></li>
          <li>Panevėžyje — <a href="https://www.panevezys.lt" target="_blank" rel="noopener noreferrer" className={linkCls}>panevezys.lt</a></li>
        </ul>
        <p className="mt-2">Kituose miestuose — per atitinkamą savivaldybės portalą.</p>
      </>
    ),
  },
  {
    question: "Nuo kokio amžiaus priimami vaikai?",
    answer:
      "Dauguma lopšelių-darželių priima vaikus nuo 2 metų. Kai kuriose įstaigose veikia lopšelio grupės, priimančios vaikus nuo 1,5 metų. Darželio grupės skirtos vaikams nuo 3 metų.",
  },
  {
    question: "Kiek kainuoja darželis?",
    answer:
      "Savivaldybės darželiuose mėnesinis mokestis sudaro apie 30–50 € už maitinimą. Ugdymas yra nemokamas. Privačiuose darželiuose kainos svyruoja nuo 300 iki 700 € per mėnesį.",
  },
  {
    question: "Kaip ilgai reikia laukti vietos?",
    answer:
      "Laukimo eilės priklauso nuo miesto ir darželio populiarumo. Didžiuosiuose miestuose laukimas gali trukti nuo kelių mėnesių iki metų. Rekomenduojama registruotis kuo anksčiau.",
  },
  {
    question: "Kaip pasirinkti tinkamą darželį savo vaikui?",
    answer:
      "Atkreipkite dėmesį į darželio vietą, ugdymo programą, grupių dydį ir auklėtojų kvalifikaciją. Naudinga aplankyti darželį asmeniškai ir pasikalbėti su kitais tėvais.",
    richAnswer: (
      <>
        Atkreipkite dėmesį į darželio vietą, ugdymo programą, grupių dydį ir auklėtojų kvalifikaciją. Naudinga aplankyti darželį asmeniškai ir pasikalbėti su kitais tėvais. Mūsų svetainėje galite <Link href="/paieska" className={linkCls}>ieškoti darželių</Link> pagal įvairius kriterijus ir skaityti <Link href="/forumas" className={linkCls}>tėvų atsiliepimus forume</Link>.
      </>
    ),
  },
  {
    question: "Kuo skiriasi valstybinis ir privatus darželis?",
    answer:
      "Valstybiniuose darželiuose ugdymas nemokamas — tėvai moka tik už maitinimą. Privačiuose darželiuose dažnai siūlomos mažesnės grupės, lankstesnis darbo laikas ir papildomos ugdymo programos, tačiau kaina yra žymiai didesnė.",
  },
  {
    question: "Kaip rasti gerą auklę?",
    answer:
      "Mūsų kataloge galite ieškoti auklių pagal miestą, patirtį ir teikiamas paslaugas. Rekomenduojame pasitikrinti rekomendacijas, susitarti dėl bandomojo laikotarpio ir aptarti visas sąlygas iš anksto.",
    richAnswer: (
      <>
        Mūsų <Link href="/paieska?q=auklė" className={linkCls}>auklių kataloge</Link> galite ieškoti pagal miestą, patirtį ir teikiamas paslaugas. Rekomenduojame pasitikrinti rekomendacijas, susitarti dėl bandomojo laikotarpio ir aptarti visas sąlygas iš anksto.
      </>
    ),
  },
  {
    question: "Nuo kokio amžiaus galima vesti vaiką į būrelius?",
    answer:
      "Daugelis būrelių priima vaikus nuo 3–4 metų, tačiau kai kurie — pavyzdžiui, ankstyvojo muzikinio lavinimo ar judesio užsiėmimai — skirti jau nuo 1,5 metų. Kiekvieno būrelio aprašyme nurodomas rekomenduojamas amžius.",
  },
  {
    question: "Ar galiu palikti atsiliepimą apie įstaigą?",
    answer:
      "Taip, kviečiame dalintis savo patirtimi. Prie kiekvienos įstaigos kortelės rasite atsiliepimų skiltį, kurioje galite įvertinti paslaugą ir palikti komentarą. Tai padeda kitiems tėvams priimti sprendimą.",
  },
  {
    question: "Kaip veikia palyginimo funkcija?",
    answer:
      'Pasirinkite kelias įstaigas ir spauskite „Palyginti". Sistema parodys jų pagrindines savybes greta — kainas, darbo laiką, ugdymo programas ir atsiliepimų vertinimus, kad galėtumėte lengvai palyginti.',
    richAnswer: (
      <>
        Pridėkite įstaigas į <Link href="/megstamiausieji" className={linkCls}>mėgstamiausius</Link> paspaudę ❤️ mygtuką. Sistema parodys jų pagrindines savybes greta — kainas, darbo laiką, ugdymo programas ir atsiliepimų vertinimus, kad galėtumėte lengvai palyginti.
      </>
    ),
  },
  {
    question: "Ar informacija svetainėje yra nemokama?",
    answer:
      "Taip, visa informacija apie darželius, auklių paslaugas, būrelius ir specialistus yra visiškai nemokama. Mūsų tikslas — padėti tėvams lengvai rasti geriausias paslaugas savo vaikams.",
  },
  {
    question: "Kaip pridėti savo įstaigą į katalogą?",
    answer:
      'Jei esate paslaugų teikėjas, galite užregistruoti savo įstaigą. Užpildykite informaciją apie teikiamas paslaugas, ir jūsų profilis bus matomas tėvams po patvirtinimo.',
    richAnswer: (
      <>
        Jei esate paslaugų teikėjas, galite <Link href="/pasiulyti" className={linkCls}>užregistruoti savo įstaigą</Link> — užpildykite informaciją apie teikiamas paslaugas, ir jūsų profilis bus matomas tėvams po patvirtinimo.
      </>
    ),
  },
  {
    question: "Ar galiu pasirinkti ugdymo kalbą?",
    answer:
      "Taip. Daugelyje miestų veikia darželiai, kuriuose ugdymas vyksta lietuvių, lenkų, rusų kalbomis. Kai kuriose įstaigose vykdomas daugiakalbis ugdymas.",
  },
  {
    question: "Kokios darbo valandos?",
    answer:
      "Dauguma savivaldybės darželių dirba nuo 7:00 iki 18:00. Kai kuriuose darželiuose siūlomos pratęsto darbo grupės iki 19:00.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section id="duk" className="py-12 md:py-16 bg-gray-50 dark:bg-slate-800/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Dažniausiai užduodami klausimai
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <button
                id={`faq-question-${i}`}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-4 min-h-[52px] text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light active:bg-gray-50 dark:active:bg-slate-700/50 transition-colors"
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span className="text-sm sm:text-base">{item.question}</span>
                <span className={`text-xl shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-200 ${openIndex === i ? "rotate-45" : ""}`} aria-hidden="true">+</span>
              </button>
              {openIndex === i && (
                <div id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} className="px-4 sm:px-5 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed animate-fade-in">
                  {item.richAnswer || item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
