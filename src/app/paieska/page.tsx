import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';
import prisma from '@/lib/prisma';

import SearchResultsClient from './SearchResultsClient';
import SearchLoading from './loading';
import SuggestButton from '@/components/SuggestButton';
import SearchBar from '@/components/SearchBar';
import { parseSearchQuery, FULL_SEARCH_FIELDS, buildWhereClause } from '@/lib/search-utils';

interface SearchPageProps {
  readonly searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const q = searchParams.q ?? '';
  const title = q ? `„${q}" — Paieška | Vaikai.lt` : 'Paieška | Vaikai.lt';
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

const QUICK_SUGGESTIONS = [
  { label: 'Vilnius', href: '/vilnius' },
  { label: 'Kaunas', href: '/kaunas' },
  { label: 'Klaipėda', href: '/klaipeda' },
  { label: 'Darželiai', href: '/paieska?q=darželiai' },
  { label: 'Auklės', href: '/paieska?q=auklės' },
  { label: 'Būreliai', href: '/paieska?q=būreliai' },
  { label: 'Specialistai', href: '/paieska?q=specialistai' },
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = (searchParams.q ?? '').trim();

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Paieška</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Ieškokite darželių, auklių, būrelių ar specialistų visoje Lietuvoje.</p>
        <SearchBar autoFocus />
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {QUICK_SUGGESTIONS.map(s => (
            <Link
              key={s.label}
              href={s.href}
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const { searchWords: wordsToSearch, categoryFilter, synonymPatterns, neighborhoodSearch } = parseSearchQuery(query);

  function buildClause(fields: string[], wordCount: number): { clause: string; extraParams: string[] } {
    return buildWhereClause(fields, wordCount, synonymPatterns);
  }

  const patterns = wordsToSearch.map(w => `%${w}%`);

  const getSearchResults = unstable_cache(
    async (...params: string[]) => {
      const wordCount = params.length - synonymPatterns.length;
      const shouldSearchKg = !categoryFilter || categoryFilter === 'kindergarten';
      const shouldSearchAu = !categoryFilter || categoryFilter === 'aukle';
      const shouldSearchBu = !categoryFilter || categoryFilter === 'burelis';
      const shouldSearchSp = !categoryFilter || categoryFilter === 'specialist';

      const kgFields = FULL_SEARCH_FIELDS.kindergarten;
      const auFields = FULL_SEARCH_FIELDS.aukle;
      const buFields = FULL_SEARCH_FIELDS.burelis;
      const spFields = FULL_SEARCH_FIELDS.specialist;

      const kgClause = buildClause(kgFields, wordCount);
      const auClause = buildClause(auFields, wordCount);
      const buClause = buildClause(buFields, wordCount);
      const spClause = buildClause(spFields, wordCount);

      // For neighborhood searches, add OR clause matching area/address
      const nbParam = neighborhoodSearch || '';
      const hasNb = !!neighborhoodSearch;
      const nbIdx = params.length + 1;
      const nbIdx2 = params.length + 2;
      const nbClause = hasNb
        ? ` OR (unaccent(COALESCE(area,'')) ILIKE unaccent($${nbIdx}) OR unaccent(COALESCE(address,'')) ILIKE unaccent($${nbIdx2}))`
        : '';
      const nbParams = hasNb ? [nbParam, `%${nbParam}%`] : [];
      const allSqlParams = [...params, ...nbParams];

      const [kg, au, bu, sp] = await Promise.all([
        shouldSearchKg ? prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, address, type, phone, website, language, hours, "ageFrom", groups, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Kindergarten" WHERE (${kgClause.clause})${nbClause} ORDER BY "baseRating" DESC LIMIT 20`,
          ...allSqlParams
        ) : [],
        shouldSearchAu ? prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, phone, email, "hourlyRate", languages, experience, "ageRange", availability, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Aukle" WHERE (${auClause.clause})${nbClause} ORDER BY "baseRating" DESC LIMIT 20`,
          ...allSqlParams
        ) : [],
        shouldSearchBu ? prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, category, "ageRange", price, schedule, phone, website, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Burelis" WHERE (${buClause.clause})${nbClause} ORDER BY "baseRating" DESC LIMIT 20`,
          ...allSqlParams
        ) : [],
        shouldSearchSp ? prisma.$queryRawUnsafe(
          `SELECT id, name, slug, city, specialty, clinic, phone, price, website, languages, description, "baseRating", "baseReviewCount", "createdAt", "updatedAt" FROM "Specialist" WHERE (${spClause.clause})${nbClause} ORDER BY "baseRating" DESC LIMIT 20`,
          ...allSqlParams
        ) : [],
      ]) as [unknown[], unknown[], unknown[], unknown[]];
      return { kg, au, bu, sp };
    },
    [`search-${query.toLowerCase()}`],
    { revalidate: 120 }
  );

  const allParams = [...patterns, ...synonymPatterns];
  const { kg: kindergartens, au: aukles, bu: bureliai, sp: specialists } = await getSearchResults(...allParams);

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
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Nieko nerasta pagal &bdquo;{query}&ldquo;.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
            Pabandykite kitą paieškos frazę arba naršykite pagal kategoriją:
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {QUICK_SUGGESTIONS.map(s => (
              <Link
                key={s.label}
                href={s.href}
                className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {s.label}
              </Link>
            ))}
          </div>
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
