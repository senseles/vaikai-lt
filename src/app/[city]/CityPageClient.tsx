'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Kindergarten, Aukle, Burelis, Specialist, ItemType } from '@/types';
import KindergartenCard from '@/components/KindergartenCard';
import AukleCard from '@/components/AukleCard';
import BurelisCard from '@/components/BurelisCard';
import SpecialistCard from '@/components/SpecialistCard';
import DetailModal from '@/components/DetailModal';
import CompareTable from '@/components/CompareTable';
import TypeFilter from '@/components/TypeFilter';
import SortSelect from '@/components/SortSelect';

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

  const itemsForCategory = () => {
    switch (category) {
      case 'darzeliai': return kindergartens;
      case 'aukles': return aukles;
      case 'bureliai': return bureliai;
      case 'specialistai': return specialists;
    }
  };

  const items = itemsForCategory();
  const tp = totalPages[category] ?? 1;

  return (
    <>
      {/* Category Tabs */}
      <nav className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-none" role="tablist">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={category === tab.id}
            onClick={() => updateParams({ category: tab.id, type: '', sub: '', spec: '', page: '' })}
            className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
              category === tab.id
                ? 'bg-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {category === 'darzeliai' && (
          <TypeFilter value={type} onChange={(v) => updateParams({ type: v })} />
        )}
        {category === 'bureliai' && (
          <select
            value={searchParams.get('sub') ?? ''}
            onChange={(e) => updateParams({ sub: e.target.value })}
            className="border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white"
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
            className="border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white"
          >
            <option value="">Visos specializacijos</option>
            {['Logopedas', 'Psichologas', 'Pediatras', 'Ergoterapeutas', 'Kineziterapeutas', 'Ortodontas', 'Alergologas'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        <div className="ml-auto">
          <SortSelect value={sort} onChange={(v) => updateParams({ sort: v })} />
        </div>
      </div>

      {/* Cards */}
      {items.length === 0 ? (
        <p className="text-center text-gray-400 py-12">Nerasta rezultatų šiame mieste.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {category === 'darzeliai' && kindergartens.map((item) => (
            <KindergartenCard
              key={item.id}
              item={item}
              onSelect={(i) => openDetail(i, 'kindergarten')}
              compareSelected={compareIds.has(item.id)}
              onCompareToggle={toggleCompare}
            />
          ))}
          {category === 'aukles' && aukles.map((item) => (
            <AukleCard key={item.id} item={item} onSelect={(i) => openDetail(i, 'aukle')} />
          ))}
          {category === 'bureliai' && bureliai.map((item) => (
            <BurelisCard key={item.id} item={item} onSelect={(i) => openDetail(i, 'burelis')} />
          ))}
          {category === 'specialistai' && specialists.map((item) => (
            <SpecialistCard key={item.id} item={item} onSelect={(i) => openDetail(i, 'specialist')} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {tp > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
            className="px-4 py-2 text-sm border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            ← Ankstesnis
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {page} / {tp}
          </span>
          <button
            disabled={page >= tp}
            onClick={() => updateParams({ page: String(page + 1) })}
            className="px-4 py-2 text-sm border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Kitas →
          </button>
        </div>
      )}

      {/* Compare bar */}
      {compareIds.size >= 2 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
          <span className="text-sm font-medium">Pasirinkta: {compareIds.size}</span>
          <button
            onClick={() => setShowCompare(true)}
            className="bg-white text-primary font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            Palyginti
          </button>
          <button
            onClick={() => setCompareIds(new Set())}
            className="text-white/70 hover:text-white text-sm underline"
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
      <DetailModal
        item={selectedItem}
        itemType={selectedItemType}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
