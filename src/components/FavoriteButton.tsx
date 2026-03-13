'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { ItemType } from '@/types';

interface FavoriteButtonProps {
  readonly itemId: string;
  readonly itemType: ItemType;
}

interface FavoriteEntry {
  itemId: string;
  itemType: ItemType;
}

function getLocalFavorites(): FavoriteEntry[] {
  try {
    const raw = localStorage.getItem('vaikai-favorites');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalFavorites(favorites: FavoriteEntry[]) {
  localStorage.setItem('vaikai-favorites', JSON.stringify(favorites));
}

export default function FavoriteButton({ itemId, itemType }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // Check DB
      fetch(`/api/favorites?itemId=${itemId}&itemType=${itemType}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.isFavorited) setFavorited(true);
        })
        .catch(() => {});
    } else {
      // Check localStorage
      const favs = getLocalFavorites();
      setFavorited(favs.some(f => f.itemId === itemId && f.itemType === itemType));
    }
  }, [itemId, itemType, session]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;

    if (session?.user) {
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
    } else {
      const favs = getLocalFavorites();
      const idx = favs.findIndex(f => f.itemId === itemId && f.itemType === itemType);
      if (idx >= 0) {
        favs.splice(idx, 1);
        setFavorited(false);
      } else {
        favs.push({ itemId, itemType });
        setFavorited(true);
      }
      setLocalFavorites(favs);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="p-3 -m-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 transition-colors active:scale-110 disabled:opacity-50"
      aria-label={favorited ? 'Pa\u0161alinti i\u0161 m\u0117gstam\u0173' : 'Prid\u0117ti prie m\u0117gstam\u0173'}
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
