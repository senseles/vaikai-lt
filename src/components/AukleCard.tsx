'use client';

import type { Aukle } from '@/types';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';

interface AukleCardProps {
  readonly item: Aukle;
  readonly onSelect: (item: Aukle) => void;
}

export default function AukleCard({ item, onSelect }: AukleCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item); } }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.city}</p>
        </div>
        <FavoriteButton itemId={item.id} itemType="aukle" />
      </div>

      {item.languages && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.languages.split(',').map((lang) => (
            <span key={lang.trim()} className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
              {lang.trim()}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <StarRating rating={item.baseRating} size="sm" />
          <span className="text-sm text-gray-500 dark:text-gray-400">({item.baseReviewCount})</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          {item.hourlyRate && <span>{item.hourlyRate}</span>}
          {item.phone && <span>{item.phone}</span>}
        </div>
      </div>
    </div>
  );
}
