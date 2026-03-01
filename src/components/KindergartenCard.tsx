'use client';

import { memo } from 'react';
import type { Kindergarten } from '@/types';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';
import PlaceholderImage from './PlaceholderImage';

interface KindergartenCardProps {
  readonly item: Kindergarten;
  readonly onSelect: (item: Kindergarten) => void;
  readonly compareSelected?: boolean;
  readonly onCompareToggle?: (id: string) => void;
}

const typeBadge: Record<string, { label: string; cls: string }> = {
  valstybinis: { label: 'Valstybinis', cls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  privatus: { label: 'Privatus', cls: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
};

export default memo(function KindergartenCard({ item, onSelect, compareSelected = false, onCompareToggle }: KindergartenCardProps) {
  const badge = typeBadge[item.type] ?? { label: item.type, cls: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item); } }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary overflow-hidden group"
    >
      <PlaceholderImage category="darzeliai" name={item.name} />
      <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.city}{item.address ? `, ${item.address}` : ''}</p>
        </div>
        <FavoriteButton itemId={item.id} itemType="kindergarten" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <StarRating rating={item.baseRating} size="sm" />
          <span className="text-sm text-gray-500 dark:text-gray-400">({item.baseReviewCount})</span>
        </div>

        {onCompareToggle && (
          <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={compareSelected}
              onChange={() => onCompareToggle(item.id)}
              className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
            />
            Palyginti
          </label>
        )}
      </div>
      </div>
    </div>
  );
})
