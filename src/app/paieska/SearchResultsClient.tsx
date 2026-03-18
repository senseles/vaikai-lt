'use client';

import { useState, useMemo } from 'react';
import type { Kindergarten, Aukle, Burelis, Specialist } from '@/types';
import KindergartenCard from '@/components/KindergartenCard';
import AukleCard from '@/components/AukleCard';
import BurelisCard from '@/components/BurelisCard';
import SpecialistCard from '@/components/SpecialistCard';
import SearchBar from '@/components/SearchBar';
import ScrollReveal from '@/components/ScrollReveal';
import SuggestButton from '@/components/SuggestButton';
import { toSlug } from '@/lib/utils';

interface SearchResultsClientProps {
  readonly query?: string;
  readonly kindergartens: Kindergarten[];
  readonly aukles: Aukle[];
  readonly bureliai: Burelis[];
  readonly specialists: Specialist[];
}

const totalOriginal = (props: SearchResultsClientProps) =>
  props.kindergartens.length + props.aukles.length + props.bureliai.length + props.specialists.length;

type CategoryFilter = 'all' | 'kindergarten' | 'aukle' | 'burelis' | 'specialist';

export default function SearchResultsClient(props: SearchResultsClientProps) {
  const { kindergartens, aukles, bureliai, specialists, query } = props;
  const origTotal = totalOriginal(props);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [minRating, setMinRating] = useState(0);
  const [cityFilter, setCityFilter] = useState('');

  // Collect unique cities from all results
  const allCities = useMemo(() => {
    const cities = new Set<string>();
    [...kindergartens, ...aukles, ...bureliai, ...specialists].forEach(i => cities.add(i.city));
    return Array.from(cities).sort();
  }, [kindergartens, aukles, bureliai, specialists]);

  const filterItems = <T extends { baseRating: number; city: string }>(items: T[]): T[] => {
    return items.filter(i => {
      if (minRating > 0 && i.baseRating < minRating) return false;
      if (cityFilter && i.city !== cityFilter) return false;
      return true;
    });
  };

  const filteredKg = categoryFilter === 'all' || categoryFilter === 'kindergarten' ? filterItems(kindergartens) : [];
  const filteredAu = categoryFilter === 'all' || categoryFilter === 'aukle' ? filterItems(aukles) : [];
  const filteredBu = categoryFilter === 'all' || categoryFilter === 'burelis' ? filterItems(bureliai) : [];
  const filteredSp = categoryFilter === 'all' || categoryFilter === 'specialist' ? filterItems(specialists) : [];

  const totalFiltered = filteredKg.length + filteredAu.length + filteredBu.length + filteredSp.length;
  const hasFilters = categoryFilter !== 'all' || minRating > 0 || cityFilter !== '';

  return (
    <>
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as CategoryFilter)}
          className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none min-h-[40px]"
        >
          <option value="all">Visos kategorijos ({kindergartens.length + aukles.length + bureliai.length + specialists.length})</option>
          <option value="kindergarten">Darželiai ({kindergartens.length})</option>
          <option value="aukle">Auklės ({aukles.length})</option>
          <option value="burelis">Būreliai ({bureliai.length})</option>
          <option value="specialist">Specialistai ({specialists.length})</option>
        </select>

        {allCities.length > 1 && (
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none min-h-[40px]"
          >
            <option value="">Visi miestai</option>
            {allCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <select
          value={minRating}
          onChange={e => setMinRating(Number(e.target.value))}
          className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none min-h-[40px]"
        >
          <option value={0}>Visi įvertinimai</option>
          <option value={3}>3+ žvaigždutės</option>
          <option value={4}>4+ žvaigždutės</option>
          <option value={4.5}>4.5+ žvaigždutės</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => { setCategoryFilter('all'); setMinRating(0); setCityFilter(''); }}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 min-h-[40px]"
          >
            Išvalyti filtrus
          </button>
        )}
      </div>

      {hasFilters && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Filtruota: <span className="font-semibold text-gray-700 dark:text-gray-200">{totalFiltered}</span> rezultatų
        </p>
      )}

      {totalFiltered === 0 && hasFilters ? (
        <div className="text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-sm">Pagal pasirinktus filtrus rezultatų nerasta.</p>
          <button
            onClick={() => { setCategoryFilter('all'); setMinRating(0); setCityFilter(''); }}
            className="mt-2 text-primary text-sm hover:underline"
          >
            Pašalinti filtrus
          </button>
        </div>
      ) : (
        <>
          {filteredKg.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Darželiai ({filteredKg.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredKg.map((item, i) => (
                  <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                    <KindergartenCard item={item} href={`/${toSlug(item.city)}/darzeliai/${item.slug}`} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          {filteredAu.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Auklės ({filteredAu.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAu.map((item, i) => (
                  <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                    <AukleCard item={item} href={`/${toSlug(item.city)}/aukles/${item.slug}`} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          {filteredBu.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Būreliai ({filteredBu.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBu.map((item, i) => (
                  <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                    <BurelisCard item={item} href={`/${toSlug(item.city)}/bureliai/${item.slug}`} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          {filteredSp.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Specialistai ({filteredSp.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSp.map((item, i) => (
                  <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                    <SpecialistCard item={item} href={`/${toSlug(item.city)}/specialistai/${item.slug}`} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          <SuggestButton searchQuery={query} resultCount={origTotal} variant="inline" />
        </>
      )}
    </>
  );
}
