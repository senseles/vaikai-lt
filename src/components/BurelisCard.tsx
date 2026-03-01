'use client';

import { memo } from 'react';
import type { Burelis } from '@/types';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';
import PlaceholderImage from './PlaceholderImage';

interface BurelisCardProps {
  readonly item: Burelis;
  readonly onSelect: (item: Burelis) => void;
}

export default memo(function BurelisCard({ item, onSelect }: BurelisCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item); } }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary overflow-hidden group"
    >
      <PlaceholderImage category="bureliai" name={item.name} />
      <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.city}</p>
        </div>
        <FavoriteButton itemId={item.id} itemType="burelis" />
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {item.category && (
          <span className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">{item.category}</span>
        )}
        {item.ageRange && (
          <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">{item.ageRange}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <StarRating rating={item.baseRating} size="sm" />
          <span className="text-sm text-gray-500 dark:text-gray-400">({item.baseReviewCount})</span>
        </div>
        {item.price && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.price}</span>}
      </div>
      </div>
    </div>
  );
})
