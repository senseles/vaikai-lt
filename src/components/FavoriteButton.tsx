'use client';

import { useState, useEffect } from 'react';
import type { ItemType } from '@/types';

interface FavoriteButtonProps {
  readonly itemId: string;
  readonly itemType: ItemType;
}

export default function FavoriteButton({ itemId, itemType }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/favorites?itemId=${itemId}&itemType=${itemType}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.isFavorited) setFavorited(true);
      })
      .catch(() => {});
  }, [itemId, itemType]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (favorited) {
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, itemType }),
        });
        setFavorited(false);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, itemType }),
        });
        setFavorited(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="p-3 -m-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 transition-colors active:scale-110 disabled:opacity-50"
      aria-label={favorited ? 'Pašalinti iš mėgstamų' : 'Pridėti prie mėgstamų'}
    >
      <svg
        className={`w-5 h-5 transition-all duration-200 ${favorited ? 'text-red-500 fill-red-500 animate-heart-pop' : 'text-gray-400 dark:text-gray-500 fill-none'}`}
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
