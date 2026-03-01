'use client';

import { useState } from 'react';
import type { ItemType } from '@/types';

interface FavoriteButtonProps {
  readonly itemId: string;
  readonly itemType: ItemType;
  readonly initialFavorited?: boolean;
}

export default function FavoriteButton({ itemId, itemType, initialFavorited = false }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch('/api/favorites', {
        method: favorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, itemType }),
      });
      if (res.ok) setFavorited(!favorited);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
      aria-label={favorited ? 'Pašalinti iš mėgstamų' : 'Pridėti prie mėgstamų'}
    >
      <svg
        className={`w-5 h-5 transition-colors ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-400 fill-none'}`}
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
