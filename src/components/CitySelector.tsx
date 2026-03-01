import Link from "next/link";

const topCities = [
  { name: "Vilnius", slug: "vilnius", emoji: "🏛️" },
  { name: "Kaunas", slug: "kaunas", emoji: "🏰" },
  { name: "Klaipėda", slug: "klaipeda", emoji: "⚓" },
  { name: "Šiauliai", slug: "siauliai", emoji: "☀️" },
  { name: "Panevėžys", slug: "panevezys", emoji: "🌿" },
] as const;

const regionCities: Record<string, ReadonlyArray<{ name: string; slug: string }>> = {
  "Vakarų Lietuva": [
    { name: "Palanga", slug: "palanga" },
    { name: "Šilutė", slug: "silute" },
    { name: "Tauragė", slug: "taurage" },
    { name: "Telšiai", slug: "telsiai" },
    { name: "Mažeikiai", slug: "mazeikiai" },
  ],
  "Vidurio Lietuva": [
    { name: "Kėdainiai", slug: "kedainiai" },
    { name: "Marijampolė", slug: "marijampole" },
    { name: "Utena", slug: "utena" },
    { name: "Alytus", slug: "alytus" },
    { name: "Jonava", slug: "jonava" },
  ],
  "Rytų Lietuva": [
    { name: "Visaginas", slug: "visaginas" },
    { name: "Druskininkai", slug: "druskininkai" },
    { name: "Elektrėnai", slug: "elektrenai" },
    { name: "Ukmergė", slug: "ukmerge" },
  ],
};

export default function CitySelector() {
  return (
    <section id="miestai" className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Pasirinkite miestą
        </h2>

        {/* Top cities */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
          {topCities.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="flex flex-col items-center gap-2 p-5 rounded-xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 hover:border-primary dark:hover:border-primary-light hover:shadow-lg transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{city.emoji}</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                {city.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Regional cities */}
        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(regionCities).map(([region, cities]) => (
            <div key={region}>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {region}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}`}
                    className="px-3 py-1.5 text-sm rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-primary-bg dark:hover:bg-primary-dark hover:text-primary-dark dark:hover:text-primary-bg transition-colors"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
