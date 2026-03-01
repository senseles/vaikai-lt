import Link from 'next/link';
import prisma from '@/lib/prisma';
import SearchResultsClient from './SearchResultsClient';

interface SearchPageProps {
  readonly searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const q = searchParams.q ?? '';
  return {
    title: q ? `„${q}" — Paieška | Vaikai.lt` : 'Paieška | Vaikai.lt',
    description: `Ieškokite darželių, auklių, būrelių ir specialistų visoje Lietuvoje.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = (searchParams.q ?? '').trim();

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Paieška</h1>
        <p className="text-gray-500">Įveskite paieškos frazę, kad rastumėte darželius, aukles, būrelius ar specialistus.</p>
      </div>
    );
  }

  // SQLite contains is case-insensitive for ASCII but not for Lithuanian chars.
  // Use Prisma contains which maps to LIKE %...%
  const searchFilter = (field: string) => ({ [field]: { contains: query } });

  const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
    prisma.kindergarten.findMany({
      where: { OR: [searchFilter('name'), searchFilter('city'), searchFilter('description')] },
      take: 20,
      orderBy: { baseRating: 'desc' },
    }),
    prisma.aukle.findMany({
      where: { OR: [searchFilter('name'), searchFilter('city'), searchFilter('description')] },
      take: 20,
      orderBy: { baseRating: 'desc' },
    }),
    prisma.burelis.findMany({
      where: { OR: [searchFilter('name'), searchFilter('city'), searchFilter('description'), searchFilter('category')] },
      take: 20,
      orderBy: { baseRating: 'desc' },
    }),
    prisma.specialist.findMany({
      where: { OR: [searchFilter('name'), searchFilter('city'), searchFilter('description'), searchFilter('specialty')] },
      take: 20,
      orderBy: { baseRating: 'desc' },
    }),
  ]);

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
      <p className="text-gray-500 mb-8">Rasta: {totalResults}</p>

      {totalResults === 0 ? (
        <p className="text-center text-gray-400 py-12">Nieko nerasta pagal &bdquo;{query}&ldquo;. Pabandykite kitą paieškos frazę.</p>
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
