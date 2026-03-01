import Link from "next/link";

interface CityPageProps {
  readonly params: { city: string };
  readonly searchParams: { type?: string; sort?: string };
}

interface KindergartenCard {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly address: string;
}

const cityNames: Record<string, string> = {
  vilnius: "Vilnius",
  kaunas: "Kaunas",
  klaipeda: "Klaipėda",
  siauliai: "Šiauliai",
  panevezys: "Panevėžys",
  palanga: "Palanga",
  silute: "Šilutė",
  taurage: "Tauragė",
  telsiai: "Telšiai",
  mazeikiai: "Mažeikiai",
  kedainiai: "Kėdainiai",
  marijampole: "Marijampolė",
  utena: "Utena",
  alytus: "Alytus",
  jonava: "Jonava",
  visaginas: "Visaginas",
  druskininkai: "Druskininkai",
  elektrenai: "Elektrėnai",
  ukmerge: "Ukmergė",
};

const filterTypes = [
  { value: "", label: "Visi" },
  { value: "valstybinis", label: "Valstybiniai" },
  { value: "privatus", label: "Privatūs" },
  { value: "montessori", label: "Montessori" },
] as const;

const sortOptions = [
  { value: "rating", label: "Pagal vertinimą" },
  { value: "reviews", label: "Pagal atsiliepimus" },
  { value: "name", label: "Pagal pavadinimą" },
] as const;

async function getKindergartens(city: string): Promise<readonly KindergartenCard[]> {
  // TODO: Replace with real API call
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kindergartens?city=${city}`, { next: { revalidate: 3600 } });
  return [
    { id: 1, name: `${cityNames[city] ?? city} lopšelis-darželis "Saulutė"`, type: "Valstybinis", rating: 4.5, reviewCount: 42, address: "Mokyklos g. 5" },
    { id: 2, name: `Privatusis darželis "Žiogelis"`, type: "Privatus", rating: 4.8, reviewCount: 28, address: "Sodų g. 12" },
    { id: 3, name: `Montessori darželis "Mažasis genijus"`, type: "Montessori", rating: 4.7, reviewCount: 35, address: "Parko g. 3" },
    { id: 4, name: `Lopšelis-darželis "Nykštukas"`, type: "Valstybinis", rating: 4.2, reviewCount: 19, address: "Ąžuolų g. 8" },
    { id: 5, name: `Darželis "Gandriukas"`, type: "Valstybinis", rating: 4.4, reviewCount: 55, address: "Beržų g. 15" },
    { id: 6, name: `Privatus darželis "Smalsučiai"`, type: "Privatus", rating: 4.6, reviewCount: 31, address: "Liepos g. 22" },
  ];
}

export async function generateMetadata({ params }: CityPageProps) {
  const cityName = cityNames[params.city] ?? params.city;
  return {
    title: `Darželiai ${cityName} mieste — Vaikai.lt`,
    description: `Darželių, auklių ir būrelių sąrašas ${cityName} mieste. Atsiliepimai ir vertinimai.`,
  };
}

function StarRating({ rating }: { readonly rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-amber-400" aria-label={`Vertinimas: ${rating} iš 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < full ? "★" : i === full && half ? "★" : "☆"}</span>
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">{rating}</span>
    </span>
  );
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const cityName = cityNames[params.city] ?? params.city;
  const items = await getKindergartens(params.city);
  const activeType = searchParams.type ?? "";
  const activeSort = searchParams.sort ?? "rating";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Navigacija">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{cityName}</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Darželiai {cityName} mieste
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex gap-2 flex-wrap">
          {filterTypes.map((f) => (
            <Link
              key={f.value}
              href={`/${params.city}?type=${f.value}&sort=${activeSort}`}
              className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                activeType === f.value
                  ? "bg-primary text-white border-primary"
                  : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto">
          <select
            defaultValue={activeSort}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"
            aria-label="Rūšiavimas"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <article
            key={item.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-bg dark:bg-primary-dark/30 text-primary-dark dark:text-primary-bg">
                {item.type}
              </span>
            </div>
            <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-primary transition-colors">
              {item.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">📍 {item.address}</p>
            <div className="flex items-center justify-between">
              <StarRating rating={item.rating} />
              <span className="text-xs text-gray-400 dark:text-gray-500">{item.reviewCount} atsiliepimai</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
