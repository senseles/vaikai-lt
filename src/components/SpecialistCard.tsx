'use client';

import type { Specialist } from '@/types';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';

interface SpecialistCardProps {
  readonly item: Specialist;
  readonly onSelect: (item: Specialist) => void;
}

export default function SpecialistCard({ item, onSelect }: SpecialistCardProps) {
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
        <FavoriteButton itemId={item.id} itemType="specialist" />
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {item.specialty && (
          <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{item.specialty}</span>
        )}
        {item.clinic && (
          <span className="text-xs text-gray-500">{item.clinic}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <StarRating rating={item.baseRating} size="sm" />
          <span className="text-sm text-gray-500">({item.baseReviewCount})</span>
        </div>
        {item.phone && <span className="text-sm text-gray-600">{item.phone}</span>}
      </div>
    </div>
  );
}
