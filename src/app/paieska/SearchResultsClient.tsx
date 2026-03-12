'use client';

import type { Kindergarten, Aukle, Burelis, Specialist } from '@/types';
import KindergartenCard from '@/components/KindergartenCard';
import AukleCard from '@/components/AukleCard';
import BurelisCard from '@/components/BurelisCard';
import SpecialistCard from '@/components/SpecialistCard';
import SearchBar from '@/components/SearchBar';
import ScrollReveal from '@/components/ScrollReveal';
import { toSlug } from '@/lib/utils';

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
  return (
    <>
      <div className="mb-8">
        <SearchBar />
      </div>

      {kindergartens.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Darželiai ({kindergartens.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kindergartens.map((item, i) => (
              <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                <KindergartenCard item={item} href={`/${toSlug(item.city)}/darzeliai/${item.slug}`} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {aukles.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Auklės ({aukles.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aukles.map((item, i) => (
              <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                <AukleCard item={item} href={`/${toSlug(item.city)}/aukles/${item.slug}`} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {bureliai.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Būreliai ({bureliai.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bureliai.map((item, i) => (
              <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                <BurelisCard item={item} href={`/${toSlug(item.city)}/bureliai/${item.slug}`} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {specialists.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Specialistai ({specialists.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialists.map((item, i) => (
              <ScrollReveal key={item.id} delay={Math.min(i % 6, 5) * 60}>
                <SpecialistCard item={item} href={`/${toSlug(item.city)}/specialistai/${item.slug}`} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
