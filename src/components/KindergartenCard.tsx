'use client';

import type { Kindergarten } from '@/types';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';

interface KindergartenCardProps {
  readonly item: Kindergarten;
  readonly onSelect: (item: Kindergarten) => void;
  readonly compareSelected?: boolean;
  readonly onCompareToggle?: (id: string) => void;
}

const typeBadge: Record<string, { label: string; cls: string }> = {
  valstybinis: { label: 'Valstybinis', cls: 'bg-blue-100 text-blue-700' },
  privatus: { label: 'Privatus', cls: 'bg-purple-100 text-purple-700' },
};

export default function KindergartenCard({ item, onSelect, compareSelected = false, onCompareToggle }: KindergartenCardProps) {
  const badge = typeBadge[item.type] ?? { label: item.type, cls: 'bg-gray-100 text-gray-700' };

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
          </div>
          <p className="text-sm text-gray-500">{item.city}{item.address ? `, ${item.address}` : ''}</p>
        </div>
        <FavoriteButton itemId={item.id} itemType="kindergarten" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <StarRating rating={item.baseRating} size="sm" />
          <span className="text-sm text-gray-500">({item.baseReviewCount})</span>
        </div>

        {onCompareToggle && (
          <label className="flex items-center gap-1.5 text-sm text-gray-600" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={compareSelected}
              onChange={() => onCompareToggle(item.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Palyginti
          </label>
        )}
      </div>
    </div>
  );
}
