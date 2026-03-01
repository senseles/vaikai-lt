import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar";
import CitySelector from "@/components/CitySelector";
import prisma from "@/lib/prisma";

const RecentlyViewed = dynamic(() => import("@/components/RecentlyViewed"), {
  loading: () => <div className="h-32" />,
});

const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <div className="h-32" />,
});

const FaqAccordion = dynamic(() => import("@/components/FaqAccordion"), {
  loading: () => <div className="h-32" />,
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

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-bg via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Raskite geriausią darželį,{" "}
            <span className="text-primary">auklę ar būrelį</span>{" "}
            savo vaikui
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Atsiliepimai, vertinimai ir palyginimas — viskas vienoje vietoje
          </p>
          <SearchBar />

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center min-h-[5rem]">
                <span className="text-3xl mb-1" role="img" aria-hidden="true">{stat.emoji}</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
              </div>
            ))}
          </div>
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
