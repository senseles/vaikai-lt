import SearchBar from "@/components/SearchBar";
import CitySelector from "@/components/CitySelector";
import FaqAccordion from "@/components/FaqAccordion";

interface StatsData {
  readonly label: string;
  readonly value: string;
  readonly emoji: string;
}

const stats: readonly StatsData[] = [
  { label: "Darželiai", value: "2,400+", emoji: "🏫" },
  { label: "Miestai", value: "60+", emoji: "🏙️" },
  { label: "Atsiliepimai", value: "15,000+", emoji: "⭐" },
  { label: "Tėveliai", value: "50,000+", emoji: "👨‍👩‍👧‍👦" },
];

export default function HomePage() {
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
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-3xl mb-1">{stat.emoji}</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <CitySelector />

      {/* FAQ */}
      <FaqAccordion />
    </>
  );
}
