"use client";

import { useState } from "react";

interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

const faqItems: readonly FaqItem[] = [
  {
    question: "Kaip registruoti vaiką į darželį?",
    answer: "Registracija vykdoma per savivaldybės sistemą. Vilniuje — svietimas.vilnius.lt, Kaune — darzelis.kaunas.lt, kituose miestuose — per atitinkamą savivaldybės portalą. Prašymus galima teikti internetu.",
  },
  {
    question: "Nuo kokio amžiaus priimami vaikai?",
    answer: "Dauguma lopšelių-darželių priima vaikus nuo 2 metų. Kai kuriose įstaigose veikia lopšelio grupės, priimančios vaikus nuo 1,5 metų. Darželio grupės skirtos vaikams nuo 3 metų.",
  },
  {
    question: "Kiek kainuoja darželis?",
    answer: "Savivaldybės darželiuose mėnesinis mokestis sudaro apie 30–50 € už maitinimą. Ugdymas yra nemokamas. Privačiuose darželiuose kainos svyruoja nuo 300 iki 700 € per mėnesį.",
  },
  {
    question: "Kaip ilgai reikia laukti vietos?",
    answer: "Laukimo eilės priklauso nuo miesto ir darželio populiarumo. Didžiuosiuose miestuose laukimas gali trukti nuo kelių mėnesių iki metų. Rekomenduojama registruotis kuo anksčiau.",
  },
  {
    question: "Ar galiu pasirinkti ugdymo kalbą?",
    answer: "Taip. Daugelyje miestų veikia darželiai, kuriuose ugdymas vyksta lietuvių, lenkų, rusų kalbomis. Kai kuriose įstaigose vykdomas daugiakalbis ugdymas.",
  },
  {
    question: "Kokios darbo valandos?",
    answer: "Dauguma savivaldybės darželių dirba nuo 7:00 iki 18:00. Kai kuriuose darželiuose siūlomos pratęsto darbo grupės iki 19:00.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="duk" className="py-12 md:py-16 bg-gray-50 dark:bg-slate-800/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Dažniausiai užduodami klausimai
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
                aria-expanded={openIndex === i}
              >
                <span>{item.question}</span>
                <span className={`text-xl transition-transform ${openIndex === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
