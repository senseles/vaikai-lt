import dynamicImport from "next/dynamic";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import prisma from "@/lib/prisma";

const CitySelector = dynamicImport(() => import("@/components/CitySelector"), {
  loading: () => (
    <section className="py-12 md:py-16 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  ),
});

const RecentlyViewed = dynamicImport(() => import("@/components/RecentlyViewed"), {
  ssr: false,
  loading: () => <div className="h-32" />,
});

const Testimonials = dynamicImport(() => import("@/components/Testimonials"), {
  loading: () => (
    <div className="py-12 md:py-16 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-8 w-64 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-gray-200 dark:bg-slate-700 rounded-xl" />)}
        </div>
      </div>
    </div>
  ),
});

const FaqAccordion = dynamicImport(() => import("@/components/FaqAccordion"), {
  loading: () => (
    <div className="py-12 md:py-16 bg-gray-50 dark:bg-slate-800/50 animate-pulse">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="h-8 w-72 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-8" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700" />)}
        </div>
      </div>
    </div>
  ),
});

async function getStats() {
  const [kindergartens, aukles, bureliai, specialists, reviews] = await Promise.all([
    prisma.kindergarten.count(),
    prisma.aukle.count(),
    prisma.burelis.count(),
    prisma.specialist.count(),
    prisma.review.count(),
  ]);

  const cities = await prisma.kindergarten.groupBy({ by: ['city'] });

  return { kindergartens, aukles, bureliai, specialists, reviews, cities: cities.length };
}

export default async function HomePage() {
  const s = await getStats();

  const stats = [
    { label: "Darželiai", value: s.kindergartens.toLocaleString('lt-LT'), emoji: "🏫" },
    { label: "Auklės", value: s.aukles.toLocaleString('lt-LT'), emoji: "👩‍👧" },
    { label: "Būreliai", value: s.bureliai.toLocaleString('lt-LT'), emoji: "🎨" },
    { label: "Specialistai", value: s.specialists.toLocaleString('lt-LT'), emoji: "👨‍⚕️" },
    { label: "Miestai", value: `${s.cities}+`, emoji: "🏙️" },
    { label: "Atsiliepimai", value: s.reviews.toLocaleString('lt-LT'), emoji: "⭐" },
  ];

  const searchActionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Vaikai.lt',
    url: 'https://vaikai.lt',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://vaikai.lt/paieska?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchActionJsonLd) }}
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-bg via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-10 md:py-24 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-72 sm:w-[28rem] h-72 sm:h-[28rem] bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="animate-fade-in-up">
            <p className="inline-block text-xs sm:text-sm font-medium text-primary dark:text-green-400 bg-primary/10 dark:bg-green-900/30 px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-6">
              Didžiausia vaikų paslaugų platforma Lietuvoje
            </p>
            <h1 className="text-[1.625rem] leading-tight sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-5">
              Raskite geriausią darželį,{" "}
              <span className="text-primary dark:text-green-400">auklę ar būrelį</span>{" "}
              savo vaikui
            </h1>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Atsiliepimai, vertinimai ir palyginimas — viskas vienoje vietoje.
              Patikima informacija iš tikrų tėvelių.
            </p>
          </div>
          <SearchBar />

          {/* Stats */}
          <div className="mt-8 sm:mt-14 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center min-h-[4.5rem] sm:min-h-[5rem] animate-fade-in-up stagger-${i + 1}`}
              >
                <span className="text-xl sm:text-3xl mb-0.5 sm:mb-1" role="img" aria-hidden="true">{stat.emoji}</span>
                <span className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                <span className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Forum CTA */}
      <section className="bg-white dark:bg-slate-800 border-y border-gray-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-10 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Turite klausimų? Prisijunkite prie diskusijų!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-5 max-w-xl mx-auto">
            Klauskite kitų tėvelių, dalinkitės patirtimi ir gaukite patarimų apie darželius, aukles ir būrelius.
          </p>
          <Link
            href="/forumas"
            prefetch={true}
            className="inline-flex items-center gap-2 bg-[#2d6a4f] hover:bg-[#40916c] text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            Aplankykite tėvų forumą
          </Link>
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Cities */}
      <CitySelector />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FaqAccordion />
    </>
  );
}
