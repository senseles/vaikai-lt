'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Kindergarten, Aukle, Burelis, Specialist, ItemType } from '@/types';
import KindergartenCard from '@/components/KindergartenCard';
import AukleCard from '@/components/AukleCard';
import BurelisCard from '@/components/BurelisCard';
import SpecialistCard from '@/components/SpecialistCard';
import SearchBar from '@/components/SearchBar';
import ScrollReveal from '@/components/ScrollReveal';

const DetailModal = dynamic(() => import('@/components/DetailModal'), {
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>,
});

type AnyItem = Kindergarten | Aukle | Burelis | Specialist;

interface SearchResultsClientProps {
  readonly query?: string;
  readonly kindergartens: Kindergarten[];
  readonly aukles: Aukle[];
  readonly bureliai: Burelis[];
  readonly specialists: Specialist[];
}

export default function SearchResultsClient({
  kindergartens,
  aukles,
  bureliai,
  specialists,
}: SearchResultsClientProps) {
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ItemType>('kindergarten');

  const openDetail = (item: AnyItem, itemType: ItemType) => {
    setSelectedItem(item);
    setSelectedItemType(itemType);
  };

  return (
    <>
      <div className="mb-8">
        <SearchBar />
      </div>

      {kindergartens.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🏫 Darželiai ({kindergartens.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kindergartens.map((item, i) => (
              <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                <KindergartenCard item={item} onSelect={(it) => openDetail(it, 'kindergarten')} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {aukles.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👩‍👧 Auklės ({aukles.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aukles.map((item, i) => (
              <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                <AukleCard item={item} onSelect={(it) => openDetail(it, 'aukle')} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {bureliai.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🎨 Būreliai ({bureliai.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bureliai.map((item, i) => (
              <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                <BurelisCard item={item} onSelect={(it) => openDetail(it, 'burelis')} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {specialists.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👨‍⚕️ Specialistai ({specialists.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialists.map((item, i) => (
              <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                <SpecialistCard item={item} onSelect={(it) => openDetail(it, 'specialist')} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      <DetailModal
        item={selectedItem}
        itemType={selectedItemType}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
