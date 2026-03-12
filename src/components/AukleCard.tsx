'use client';

import { memo } from 'react';
import Link from 'next/link';
import type { Aukle } from '@/types';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';
import PlaceholderImage from './PlaceholderImage';

interface AukleCardProps {
  readonly item: Aukle;
  readonly onSelect?: (item: Aukle) => void;
  readonly href?: string;
}

const cardClasses = "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary overflow-hidden group";

export default memo(function AukleCard({ item, onSelect, href }: AukleCardProps) {
  const content = (
    <>
      <PlaceholderImage category="aukles" name={item.name} />
      <div className="p-4">
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

        <div className="flex items-center justify-between gap-2 mt-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <StarRating rating={item.baseRating} size="sm" />
            <span className="text-sm text-gray-500 dark:text-gray-400">({item.baseReviewCount})</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 min-w-0 overflow-hidden">
            {item.hourlyRate && <span className="shrink-0">{item.hourlyRate}</span>}
            {item.phone && <span className="truncate min-w-0">{item.phone}</span>}
          </div>
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`block ${cardClasses}`}>
        {content}
      </Link>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(item); } }}
      className={cardClasses}
    >
      {content}
    </div>
  );
});
