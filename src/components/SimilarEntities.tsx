'use client';

import { useEffect, useState } from 'react';
import StarRating from './StarRating';

interface SimilarItem {
  id: string;
  name: string;
  baseRating: number;
  baseReviewCount: number;
  slug: string;
}

interface SimilarEntitiesProps {
  readonly itemId: string;
  readonly itemType: 'kindergarten' | 'aukle' | 'burelis' | 'specialist';
  readonly city: string;
}

export default function SimilarEntities({ itemId, itemType, city }: SimilarEntitiesProps) {
  const [items, setItems] = useState<SimilarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/similar?itemId=${encodeURIComponent(itemId)}&itemType=${encodeURIComponent(itemType)}&city=${encodeURIComponent(city)}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items ?? []);
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [itemId, itemType, city]);

  if (loading) {
    return (
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Panašios paslaugos</h3>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Panašios paslaugos</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((similar) => (
          <div
            key={similar.id}
            className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 p-3 transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={similar.name}>
              {similar.name}
            </p>
            {similar.baseRating > 0 ? (
              <div className="flex items-center gap-1.5 mt-1.5">
                <StarRating rating={similar.baseRating} size="sm" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {similar.baseRating.toFixed(1)} ({similar.baseReviewCount})
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Dar nera atsiliepimų</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
