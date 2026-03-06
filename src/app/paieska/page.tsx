import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

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

  // Use PostgreSQL unaccent for Lithuanian diacritics-insensitive search
  const pattern = `%${query.replace(/[%_]/g, '')}%`;

  const getSearchResults = unstable_cache(
    async (p: string) => {
      const [kg, au, bu, sp] = await Promise.all([
        prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, address, type, phone, website, language, hours, "ageFrom", groups, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Kindergarten" WHERE unaccent(name) ILIKE unaccent($1) OR unaccent(city) ILIKE unaccent($1) OR unaccent(COALESCE(description,'')) ILIKE unaccent($1) ORDER BY "baseRating" DESC LIMIT 20`,
          p
        ),
        prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, phone, email, "hourlyRate", languages, experience, "ageRange", availability, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Aukle" WHERE unaccent(name) ILIKE unaccent($1) OR unaccent(city) ILIKE unaccent($1) OR unaccent(COALESCE(description,'')) ILIKE unaccent($1) ORDER BY "baseRating" DESC LIMIT 20`,
          p
        ),
        prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, category, "ageRange", price, schedule, phone, website, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Burelis" WHERE unaccent(name) ILIKE unaccent($1) OR unaccent(city) ILIKE unaccent($1) OR unaccent(COALESCE(description,'')) ILIKE unaccent($1) OR unaccent(COALESCE(category,'')) ILIKE unaccent($1) ORDER BY "baseRating" DESC LIMIT 20`,
          p
        ),
        prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, specialty, clinic, phone, price, website, languages, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Specialist" WHERE unaccent(name) ILIKE unaccent($1) OR unaccent(city) ILIKE unaccent($1) OR unaccent(COALESCE(description,'')) ILIKE unaccent($1) OR unaccent(COALESCE(specialty,'')) ILIKE unaccent($1) ORDER BY "baseRating" DESC LIMIT 20`,
          p
        ),
      ]) as [unknown[], unknown[], unknown[], unknown[]];
      return { kg, au, bu, sp };
    },
    [`search-${query.toLowerCase()}`],
    { revalidate: 120 }
  );

  const { kg: kindergartens, au: aukles, bu: bureliai, sp: specialists } = await getSearchResults(pattern);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serialize = (items: any[]) =>
    items.map((i) => ({
      ...i,
      createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : (i.createdAt ?? ''),
      updatedAt: i.updatedAt instanceof Date ? i.updatedAt.toISOString() : (i.updatedAt ?? ''),
    }));

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
