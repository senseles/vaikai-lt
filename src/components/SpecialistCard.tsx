'use client';

import { memo } from 'react';
import type { Specialist } from '@/types';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';
import PlaceholderImage from './PlaceholderImage';

interface SpecialistCardProps {
  readonly item: Specialist;
  readonly onSelect: (item: Specialist) => void;
}

export default memo(function SpecialistCard({ item, onSelect }: SpecialistCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item); } }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary overflow-hidden group"
    >
      <PlaceholderImage category="specialistai" name={item.name} />
      <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.city}</p>
        </div>
        <FavoriteButton itemId={item.id} itemType="specialist" />
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {item.specialty && (
          <span className="text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full">{item.specialty}</span>
        )}
        {item.clinic && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{item.clinic}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <StarRating rating={item.baseRating} size="sm" />
          <span className="text-sm text-gray-500 dark:text-gray-400">({item.baseReviewCount})</span>
        </div>
        {item.phone && <span className="text-sm text-gray-600 dark:text-gray-400">{item.phone}</span>}
      </div>
      </div>
    </div>
  );
})
