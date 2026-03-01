'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Kindergarten, Aukle, Burelis, Specialist, ItemType } from '@/types';
import KindergartenCard from '@/components/KindergartenCard';
import AukleCard from '@/components/AukleCard';
import BurelisCard from '@/components/BurelisCard';
import SpecialistCard from '@/components/SpecialistCard';
import TypeFilter from '@/components/TypeFilter';
import SortSelect from '@/components/SortSelect';
import PriceFilter from '@/components/PriceFilter';
import EmptyState from '@/components/EmptyState';
import ErrorBoundary from '@/components/ErrorBoundary';

const DetailModal = dynamic(() => import('@/components/DetailModal'), {
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>,
});
const CompareTable = dynamic(() => import('@/components/CompareTable'), {
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>,
});

type Category = 'darzeliai' | 'aukles' | 'bureliai' | 'specialistai';

const categoryTabs: { id: Category; label: string }[] = [
  { id: 'darzeliai', label: 'Darželiai' },
  { id: 'aukles', label: 'Auklės' },
  { id: 'bureliai', label: 'Būreliai' },
  { id: 'specialistai', label: 'Specialistai' },
];

interface CityPageClientProps {
  readonly citySlug: string;
  readonly kindergartens: Kindergarten[];
  readonly aukles: Aukle[];
  readonly bureliai: Burelis[];
  readonly specialists: Specialist[];
  readonly initialCategory: Category;
  readonly initialType: string;
  readonly initialSort: string;
  readonly totalPages: Record<Category, number>;
  readonly currentPage: number;
  readonly areas: string[];
}

type AnyItem = Kindergarten | Aukle | Burelis | Specialist;

export default function CityPageClient({
  citySlug,
  kindergartens,
  aukles,
  bureliai,
  specialists,
  initialCategory,
  initialType,
  initialSort,
  totalPages,
  currentPage,
  areas,
}: CityPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ItemType>('kindergarten');
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  const category = (searchParams.get('category') as Category) || initialCategory;
  const type = searchParams.get('type') ?? initialType;
  const sort = searchParams.get('sort') ?? initialSort;
  const page = Number(searchParams.get('page') ?? currentPage);

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    // Reset page when changing filters
    if (!('page' in updates)) params.delete('page');
    router.push(`/${citySlug}?${params.toString()}`);
  }, [router, citySlug, searchParams]);

  const openDetail = (item: AnyItem, itemType: ItemType) => {
    setSelectedItem(item);
    setSelectedItemType(itemType);
  };

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  }, []);

  // Extract numeric price from string fields like "8 €/val.", "10", "25 €"
  const extractPrice = (val: string | null | undefined): number | null => {
    if (!val) return null;
    const match = val.match(/(\d+(?:[.,]\d+)?)/);
    return match ? parseFloat(match[1].replace(',', '.')) : null;
  };

  const priceParam = searchParams.get('price') ?? '';

  const filterByPrice = <T extends { hourlyRate?: string | null; price?: string | null }>(items: T[]): T[] => {
    if (!priceParam) return items;
    const [minStr, maxStr] = priceParam.split('-');
    const isPlus = minStr.endsWith('+');
    const min = parseFloat(isPlus ? minStr.slice(0, -1) : minStr);
    const max = maxStr ? parseFloat(maxStr) : null;

    return items.filter((item) => {
      const p = extractPrice(item.hourlyRate ?? item.price ?? null);
      if (p === null) return false;
      if (isPlus) return p >= min;
      if (max !== null) return p >= min && p <= max;
      return true;
    });
  };

  const itemsForCategory = () => {
    switch (category) {
      case 'darzeliai': return kindergartens;
      case 'aukles': return filterByPrice(aukles);
      case 'bureliai': return bureliai;
      case 'specialistai': return filterByPrice(specialists);
    }
  };

  const items = itemsForCategory();
  const tp = totalPages[category] ?? 1;

  return (
    <>
      {/* Category Tabs */}
      <nav className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={category === tab.id}
            onClick={() => updateParams({ category: tab.id, type: '', sub: '', spec: '', page: '' })}
            className={`px-4 py-2.5 min-h-[44px] min-w-[5rem] text-sm font-semibold rounded-lg whitespace-nowrap transition-all duration-200 active:scale-[0.97] ${
              category === tab.id
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
        {category === 'darzeliai' && (
          <TypeFilter value={type} onChange={(v) => updateParams({ type: v })} />
        )}
        {category === 'bureliai' && (
          <select
            value={searchParams.get('sub') ?? ''}
            onChange={(e) => updateParams({ sub: e.target.value })}
            aria-label="Pasirinkti kategoriją"
            className="w-full sm:w-auto border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2.5 min-h-[44px] text-base bg-white dark:bg-slate-700 dark:text-white transition-colors focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="">Visos kategorijos</option>
            {['Menai', 'Sportas', 'Muzika', 'Šokiai', 'Kalbos', 'IT', 'Gamta/Mokslas', 'Kita'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        {category === 'specialistai' && (
          <select
            value={searchParams.get('spec') ?? ''}
            onChange={(e) => updateParams({ spec: e.target.value })}
            aria-label="Pasirinkti specializaciją"
            className="w-full sm:w-auto border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2.5 min-h-[44px] text-base bg-white dark:bg-slate-700 dark:text-white transition-colors focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="">Visos specializacijos</option>
            {['Logopedas', 'Psichologas', 'Pediatras', 'Ergoterapeutas', 'Kineziterapeutas', 'Ortodontas', 'Alergologas'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        {/* Area / district filter -- shown when city has areas */}
        {areas.length > 0 && (
          <select
            value={searchParams.get('area') ?? ''}
            onChange={(e) => updateParams({ area: e.target.value })}
            aria-label="Pasirinkti rajoną"
            className="w-full sm:w-auto border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2.5 min-h-[44px] text-base bg-white dark:bg-slate-700 dark:text-white transition-colors focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="">Visi rajonai</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        )}
        {/* Price range filter -- shown for aukles and specialists */}
        {(category === 'aukles' || category === 'specialistai') && (
          <PriceFilter
            value={searchParams.get('price') ?? ''}
            onChange={(v) => updateParams({ price: v })}
          />
        )}
        <div className="w-full sm:w-auto sm:ml-auto">
          <SortSelect value={sort} onChange={(v) => updateParams({ sort: v })} />
        </div>
      </div>

      {/* Cards */}
      <h2 className="sr-only">{categoryTabs.find(t => t.id === category)?.label ?? 'Rezultatai'}</h2>
      {items.length === 0 ? (
        <EmptyState
          icon="filter"
          title="Nerasta rezultatų"
          description="Šiame mieste su pasirinktais filtrais rezultatų nerasta. Pabandykite pakeisti filtrus."
        />
      ) : (
        <ErrorBoundary fallback={<EmptyState icon="filter" title="Klaida" description="Nepavyko atvaizduoti rezultatų. Pabandykite perkrauti puslapį." />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {category === 'darzeliai' && kindergartens.map((item, i) => (
              <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 5) * 50}ms`, animationFillMode: 'both' }}>
                <KindergartenCard
                  item={item}
                  onSelect={(it) => openDetail(it, 'kindergarten')}
                  compareSelected={compareIds.has(item.id)}
                  onCompareToggle={toggleCompare}
                />
              </div>
            ))}
            {category === 'aukles' && (filterByPrice(aukles) as Aukle[]).map((item, i) => (
              <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 5) * 50}ms`, animationFillMode: 'both' }}>
                <AukleCard item={item} onSelect={(it) => openDetail(it, 'aukle')} />
              </div>
            ))}
            {category === 'bureliai' && bureliai.map((item, i) => (
              <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 5) * 50}ms`, animationFillMode: 'both' }}>
                <BurelisCard item={item} onSelect={(it) => openDetail(it, 'burelis')} />
              </div>
            ))}
            {category === 'specialistai' && (filterByPrice(specialists) as Specialist[]).map((item, i) => (
              <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 5) * 50}ms`, animationFillMode: 'both' }}>
                <SpecialistCard item={item} onSelect={(it) => openDetail(it, 'specialist')} />
              </div>
            ))}
          </div>
        </ErrorBoundary>
      )}

      {/* Pagination */}
      {tp > 1 && (
        <nav aria-label="Puslapių navigacija" className="flex items-center justify-center gap-2 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
            className="px-4 py-2.5 min-h-[44px] text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700 active:bg-gray-100 dark:active:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            aria-label={`Ankstesnis puslapis (${page - 1})`}
          >
            &larr; Ankstesnis
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 px-2" aria-current="page">
            {page} / {tp}
          </span>
          <button
            disabled={page >= tp}
            onClick={() => updateParams({ page: String(page + 1) })}
            className="px-4 py-2.5 min-h-[44px] text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700 active:bg-gray-100 dark:active:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            aria-label={`Kitas puslapis (${page + 1})`}
          >
            Kitas &rarr;
          </button>
        </nav>
      )}

      {/* Compare bar */}
      {compareIds.size >= 2 && (
        <div role="status" aria-live="polite" className="fixed bottom-[5.5rem] md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-primary text-white px-4 sm:px-6 py-3 rounded-full shadow-lg flex items-center gap-2 sm:gap-3 max-w-[calc(100%-2rem)] sm:max-w-md animate-scale-in">
          <span className="text-sm font-medium whitespace-nowrap">Pasirinkta: {compareIds.size}</span>
          <button
            onClick={() => setShowCompare(true)}
            className="bg-white text-primary font-semibold text-sm px-4 py-1.5 min-h-[36px] rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            Palyginti
          </button>
          <button
            onClick={() => setCompareIds(new Set())}
            className="text-white/70 hover:text-white text-sm underline min-h-[36px] flex items-center"
          >
            Išvalyti
          </button>
        </div>
      )}

      {/* Compare Table */}
      {showCompare && (
        <CompareTable
          items={kindergartens.filter((k) => compareIds.has(k.id))}
          onClose={() => setShowCompare(false)}
        />
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          itemType={selectedItemType}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
