import Link from 'next/link';
import prisma from '@/lib/prisma';
import { matchesSearch } from '@/lib/api-utils';
import SearchResultsClient from './SearchResultsClient';

interface SearchPageProps {
  readonly searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const q = searchParams.q ?? '';
  const title = q ? `„${q}“ — Paieška | Vaikai.lt` : 'Paieška | Vaikai.lt';
  const description = 'Ieškokite darželių, auklių, būrelių ir specialistų visoje Lietuvoje.';
  return {
    title,
    description,
    alternates: { canonical: 'https://vaikai.lt/paieska' },
    openGraph: {
      title,
      description,
      url: 'https://vaikai.lt/paieska',
      siteName: 'Vaikai.lt',
      locale: 'lt_LT',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = (searchParams.q ?? '').trim();

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Paieška</h1>
        <p className="text-gray-500 dark:text-gray-400">Įveskite paieškos frazę, kad rastumėte darželius, aukles, būrelius ar specialistus.</p>
      </div>
    );
  }

  // Two-pass search: DB-level contains first, then JS Lithuanian matching on smaller set
  const containsQ = { contains: query, mode: 'insensitive' as const };
  const dbWhere = {
    kg: { OR: [{ name: containsQ }, { city: containsQ }, { description: containsQ }] },
    aukle: { OR: [{ name: containsQ }, { city: containsQ }, { description: containsQ }] },
    burelis: { OR: [{ name: containsQ }, { city: containsQ }, { description: containsQ }, { category: containsQ }] },
    specialist: { OR: [{ name: containsQ }, { city: containsQ }, { description: containsQ }, { specialty: containsQ }] },
  };

  const [dbKg, dbAukles, dbBureliai, dbSpecialists] = await Promise.all([
    prisma.kindergarten.findMany({ where: dbWhere.kg, orderBy: { baseRating: 'desc' }, take: 20 }),
    prisma.aukle.findMany({ where: dbWhere.aukle, orderBy: { baseRating: 'desc' }, take: 20 }),
    prisma.burelis.findMany({ where: dbWhere.burelis, orderBy: { baseRating: 'desc' }, take: 20 }),
    prisma.specialist.findMany({ where: dbWhere.specialist, orderBy: { baseRating: 'desc' }, take: 20 }),
  ]);

  // If DB returned enough results, use them directly; otherwise fall back to JS filtering
  const needsJsFallback = dbKg.length < 5 && dbAukles.length < 3 && dbBureliai.length < 3 && dbSpecialists.length < 3;

  let kindergartens = dbKg;
  let aukles = dbAukles;
  let bureliai = dbBureliai;
  let specialists = dbSpecialists;

  if (needsJsFallback) {
    // Lithuanian case-insensitive search on a limited dataset
    const [allKg, allAukles, allBureliai, allSpecialists] = await Promise.all([
      prisma.kindergarten.findMany({ orderBy: { baseRating: 'desc' }, take: 2000 }),
      prisma.aukle.findMany({ orderBy: { baseRating: 'desc' } }),
      prisma.burelis.findMany({ orderBy: { baseRating: 'desc' } }),
      prisma.specialist.findMany({ orderBy: { baseRating: 'desc' } }),
    ]);

    kindergartens = allKg.filter((i) =>
      matchesSearch(i.name, query) || matchesSearch(i.city, query) || matchesSearch(i.description, query)
    ).slice(0, 20);
    aukles = allAukles.filter((i) =>
      matchesSearch(i.name, query) || matchesSearch(i.city, query) || matchesSearch(i.description, query)
    ).slice(0, 20);
    bureliai = allBureliai.filter((i) =>
      matchesSearch(i.name, query) || matchesSearch(i.city, query) || matchesSearch(i.description, query) || matchesSearch(i.category, query)
    ).slice(0, 20);
    specialists = allSpecialists.filter((i) =>
      matchesSearch(i.name, query) || matchesSearch(i.city, query) || matchesSearch(i.description, query) || matchesSearch(i.specialty, query)
    ).slice(0, 20);
  }

  const serialize = <T extends { createdAt: Date; updatedAt?: Date }>(items: T[]) =>
    items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString(), updatedAt: (i as { updatedAt?: Date }).updatedAt?.toISOString() ?? '' }));

  const totalResults = kindergartens.length + aukles.length + bureliai.length + specialists.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">Paieška</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Paieškos rezultatai: &bdquo;{query}&ldquo;
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Rasta: {totalResults}</p>

      {totalResults === 0 ? (
        <p className="text-center text-gray-400 dark:text-gray-500 py-12">Nieko nerasta pagal &bdquo;{query}&ldquo;. Pabandykite kitą paieškos frazę.</p>
      ) : (
        <SearchResultsClient
          query={query}
          kindergartens={serialize(kindergartens) as never[]}
          aukles={serialize(aukles) as never[]}
          bureliai={serialize(bureliai) as never[]}
          specialists={serialize(specialists) as never[]}
        />
      )}
    </div>
  );
}
