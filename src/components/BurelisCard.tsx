'use client';

import type { Burelis } from '@/types';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';

interface BurelisCardProps {
  readonly item: Burelis;
  readonly onSelect: (item: Burelis) => void;
}

export default function BurelisCard({ item, onSelect }: BurelisCardProps) {
  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.city}</p>
        </div>
        <FavoriteButton itemId={item.id} itemType="burelis" />
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {item.category && (
          <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">{item.category}</span>
        )}
        {item.ageRange && (
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{item.ageRange}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <StarRating rating={item.baseRating} size="sm" />
          <span className="text-sm text-gray-500">({item.baseReviewCount})</span>
        </div>
        {item.price && <span className="text-sm font-medium text-gray-700">{item.price}</span>}
      </div>
    </div>
  );
}
