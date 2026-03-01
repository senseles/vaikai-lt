'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Kindergarten, Aukle, Burelis, Specialist, ItemType } from '@/types';
import KindergartenCard from '@/components/KindergartenCard';
import AukleCard from '@/components/AukleCard';
import BurelisCard from '@/components/BurelisCard';
import SpecialistCard from '@/components/SpecialistCard';
import DetailModal from '@/components/DetailModal';
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
            onClick={() => updateParams({ category: tab.id, type: '', page: '' })}
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
            <KindergartenCard key={item.id} item={item} onSelect={(i) => openDetail(i, 'kindergarten')} />
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
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50"
          >
            ← Ankstesnis
          </button>
          <span className="text-sm text-gray-500">
            {page} / {tp}
          </span>
          <button
            disabled={page >= tp}
            onClick={() => updateParams({ page: String(page + 1) })}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50"
          >
            Kitas →
          </button>
        </div>
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
