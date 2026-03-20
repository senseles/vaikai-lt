import Link from 'next/link';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { CITY_NAMES } from '@/lib/cities';
import KindergartenCard from '@/components/KindergartenCard';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Visi darželiai Lietuvoje | ManoVaikai.lt',
  description: 'Pilnas darželių sąrašas Lietuvoje — valstybiniai ir privatūs. Atsiliepimai, kontaktai, vertinimai.',
  alternates: { canonical: 'https://manovaikai.lt/darzeliai' },
};

const CITY_SLUGS = Object.fromEntries(
  Object.entries(CITY_NAMES).map(([slug, name]) => [name, slug])
);

export default async function AllKindergartensPage() {
  const items = await prisma.kindergarten.findMany({
    orderBy: [{ city: 'asc' }, { name: 'asc' }],
  });

  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const list = grouped.get(item.city) ?? [];
    list.push(item);
    grouped.set(item.city, list);
  }

  const cities = [...grouped.keys()].sort((a, b) => a.localeCompare(b, 'lt'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">Visi darželiai</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        🏫 Visi darželiai Lietuvoje
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Iš viso: {items.length} darželių • {cities.length} miestų
      </p>

      {/* City quick nav */}
      <div className="flex flex-wrap gap-2 mb-8">
        {cities.map((city) => (
          <a
            key={city}
            href={`#${city}`}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-[#2d6a4f] hover:text-white transition-colors"
          >
            {city} ({grouped.get(city)?.length})
          </a>
        ))}
      </div>

      {cities.map((city) => {
        const citySlug = CITY_SLUGS[city];
        const cityItems = grouped.get(city) ?? [];
        return (
          <section key={city} id={city} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{city}</h2>
              {citySlug && (
                <Link href={`/${citySlug}?category=darzeliai`} className="text-sm text-[#2d6a4f] hover:underline">
                  Žiūrėti visus →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cityItems.map((item) => (
                <Link key={item.id} href={citySlug ? `/${citySlug}/darzeliai/${item.slug}` : '#'}>
                  <KindergartenCard item={item} />
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
