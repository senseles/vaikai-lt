import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';
import prisma from '@/lib/prisma';

import SearchResultsClient from './SearchResultsClient';
import SearchLoading from './loading';
import SuggestButton from '@/components/SuggestButton';
import SearchBar from '@/components/SearchBar';

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
        <p className="text-gray-500 dark:text-gray-400 mb-8">Ieškokite darželių, auklių, būrelių ar specialistų visoje Lietuvoje.</p>
        <SearchBar autoFocus />
      </div>
    );
  }

  // Category keyword mapping: if a word matches a category, filter by entity type
  const CATEGORY_KEYWORDS: Record<string, string> = {
    'darželiai': 'kindergarten', 'darželis': 'kindergarten', 'darzeliai': 'kindergarten', 'darzelis': 'kindergarten',
    'auklė': 'aukle', 'auklės': 'aukle', 'aukle': 'aukle', 'aukles': 'aukle',
    'būreliai': 'burelis', 'būrelis': 'burelis', 'bureliai': 'burelis', 'burelis': 'burelis',
    'specialistai': 'specialist', 'specialistas': 'specialist',
  };

  const allWords = query.replace(/[%_]/g, '').split(/\s+/).filter(w => w.length > 0);
  let categoryFilter: string | null = null;
  const searchWords: string[] = [];
  for (const w of allWords) {
    const cat = CATEGORY_KEYWORDS[w.toLocaleLowerCase('lt')];
    if (cat && !categoryFilter) {
      categoryFilter = cat;
    } else {
      searchWords.push(w);
    }
  }
  // If all words were category keywords, use original words for search
  const wordsToSearch = searchWords.length > 0 ? searchWords : allWords;

  function buildWhereClause(fields: string[], wordCount: number): string {
    const andClauses = Array.from({ length: wordCount }, (_, i) => {
      const paramIdx = i + 1;
      const orParts = fields.map(f => `unaccent(${f}) ILIKE unaccent($${paramIdx})`);
      return `(${orParts.join(' OR ')})`;
    });
    return andClauses.join(' AND ');
  }

  const patterns = wordsToSearch.map(w => `%${w}%`);

  const getSearchResults = unstable_cache(
    async (...params: string[]) => {
      const shouldSearchKg = !categoryFilter || categoryFilter === 'kindergarten';
      const shouldSearchAu = !categoryFilter || categoryFilter === 'aukle';
      const shouldSearchBu = !categoryFilter || categoryFilter === 'burelis';
      const shouldSearchSp = !categoryFilter || categoryFilter === 'specialist';

      const [kg, au, bu, sp] = await Promise.all([
        shouldSearchKg ? prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, address, type, phone, website, language, hours, "ageFrom", groups, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Kindergarten" WHERE ${buildWhereClause(['name', 'city', 'COALESCE(description,\'\')'], params.length)} ORDER BY "baseRating" DESC LIMIT 20`,
          ...params
        ) : [],
        shouldSearchAu ? prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, phone, email, "hourlyRate", languages, experience, "ageRange", availability, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Aukle" WHERE ${buildWhereClause(['name', 'city', 'COALESCE(description,\'\')'], params.length)} ORDER BY "baseRating" DESC LIMIT 20`,
          ...params
        ) : [],
        shouldSearchBu ? prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, category, "ageRange", price, schedule, phone, website, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Burelis" WHERE ${buildWhereClause(['name', 'city', 'COALESCE(description,\'\')', 'COALESCE(category,\'\')'], params.length)} ORDER BY "baseRating" DESC LIMIT 20`,
          ...params
        ) : [],
        shouldSearchSp ? prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, specialty, clinic, phone, price, website, languages, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Specialist" WHERE ${buildWhereClause(['name', 'city', 'COALESCE(description,\'\')', 'COALESCE(specialty,\'\')'], params.length)} ORDER BY "baseRating" DESC LIMIT 20`,
          ...params
        ) : [],
      ]) as [unknown[], unknown[], unknown[], unknown[]];
      return { kg, au, bu, sp };
    },
    [`search-${query.toLowerCase()}`],
    { revalidate: 120 }
  );

  const { kg: kindergartens, au: aukles, bu: bureliai, sp: specialists } = await getSearchResults(...patterns);

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
        <div>
          <p className="text-center text-gray-400 dark:text-gray-500 py-12">Nieko nerasta pagal &bdquo;{query}&ldquo;. Pabandykite kitą paieškos frazę.</p>
          <SuggestButton searchQuery={query} resultCount={0} />
        </div>
      ) : (
        <Suspense fallback={<SearchLoading />}>
          <SearchResultsClient
            query={query}
            kindergartens={serialize(kindergartens)}
            aukles={serialize(aukles)}
            bureliai={serialize(bureliai)}
            specialists={serialize(specialists)}
          />
        </Suspense>
      )}
    </div>
  );
}
