'use client';

import { memo } from 'react';
import Link from 'next/link';
import type { Burelis } from '@/types';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';
import PlaceholderImage from './PlaceholderImage';

interface BurelisCardProps {
  readonly item: Burelis;
  readonly onSelect?: (item: Burelis) => void;
  readonly href?: string;
  readonly compareSelected?: boolean;
  readonly onCompareToggle?: (id: string) => void;
}

const cardClasses = "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary overflow-hidden group";

export default memo(function BurelisCard({ item, onSelect, href, compareSelected = false, onCompareToggle }: BurelisCardProps) {
  const content = (
    <>
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

        <div className="flex items-center justify-between gap-2 mt-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <StarRating rating={item.baseRating} size="sm" />
            <span className="text-sm text-gray-500 dark:text-gray-400">({item.baseReviewCount})</span>
          </div>
          {item.price && <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate min-w-0">{item.price}</span>}
        </div>

        {onCompareToggle && (
          <div className="flex items-center justify-end mt-2">
            <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={compareSelected}
                onChange={() => onCompareToggle(item.id)}
                className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              Palyginti
            </label>
          </div>
        )}
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
