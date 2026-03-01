'use client';

import { useState, useEffect } from 'react';
import type { ItemType } from '@/types';

interface FavoriteButtonProps {
  readonly itemId: string;
  readonly itemType: ItemType;
}

interface FavoriteEntry {
  itemId: string;
  itemType: ItemType;
}

function getFavorites(): FavoriteEntry[] {
  try {
    const raw = localStorage.getItem('vaikai-favorites');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setFavorites(favorites: FavoriteEntry[]) {
  localStorage.setItem('vaikai-favorites', JSON.stringify(favorites));
}

export default function FavoriteButton({ itemId, itemType }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const favs = getFavorites();
    setFavorited(favs.some((f) => f.itemId === itemId && f.itemType === itemType));
  }, [itemId, itemType]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favs = getFavorites();
    const idx = favs.findIndex((f) => f.itemId === itemId && f.itemType === itemType);
    if (idx >= 0) {
      favs.splice(idx, 1);
      setFavorited(false);
    } else {
      favs.push({ itemId, itemType });
      setFavorited(true);
    }
    setFavorites(favs);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2.5 -m-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 transition-colors active:scale-110"
      aria-label={favorited ? 'Pašalinti iš mėgstamų' : 'Pridėti prie mėgstamų'}
    >
      <svg
        className={`w-5 h-5 transition-all duration-200 ${favorited ? 'text-red-500 fill-red-500 animate-heart-pop' : 'text-gray-400 fill-none'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
