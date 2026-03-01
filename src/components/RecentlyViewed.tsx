'use client';

import { useEffect, useState } from 'react';
import StarRating from './StarRating';

const STORAGE_KEY = 'recently-viewed';
const MAX_ITEMS = 10;

export interface RecentlyViewedItem {
  id: string;
  name: string;
  city: string;
  itemType: 'kindergarten' | 'aukle' | 'burelis' | 'specialist';
  baseRating: number;
  viewedAt: string;
}

const badgeConfig: Record<
  RecentlyViewedItem['itemType'],
  { label: string; classes: string }
> = {
  kindergarten: {
    label: 'Darželis',
    classes:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  },
  aukle: {
    label: 'Auklė',
    classes:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  },
  burelis: {
    label: 'Būrelis',
    classes:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  },
  specialist: {
    label: 'Specialistas',
    classes:
      'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  },
};

function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: RecentlyViewedItem[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addToRecentlyViewed(item: {
  id: string;
  name: string;
  city: string;
  itemType: string;
  baseRating: number;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter((i) => i.id !== item.id);
    const newItem: RecentlyViewedItem = {
      id: item.id,
      name: item.name,
      city: item.city,
      itemType: item.itemType as RecentlyViewedItem['itemType'],
      baseRating: item.baseRating,
      viewedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

interface RecentlyViewedProps {
  onItemClick?: (item: RecentlyViewedItem) => void;
}

export default function RecentlyViewed({ onItemClick }: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Neseniai peržiūrėti
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {items.map((item) => {
            const badge = badgeConfig[item.itemType] ?? badgeConfig.kindergarten;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemClick?.(item)}
                className="flex-shrink-0 w-48 rounded-xl border border-gray-200 dark:border-gray-700
                  bg-white dark:bg-slate-800 p-3 text-left shadow-sm
                  hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${badge.classes}`}
                >
                  {badge.label}
                </span>
                <p
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                  title={item.name}
                >
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {item.city}
                </p>
                <div className="mt-2">
                  <StarRating rating={item.baseRating} size="sm" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
