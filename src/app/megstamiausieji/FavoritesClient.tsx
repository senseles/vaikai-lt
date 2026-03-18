'use client';

import { useEffect, useState } from 'react';
import type { Kindergarten, Aukle, Burelis, Specialist, ItemType } from '@/types';
import KindergartenCard from '@/components/KindergartenCard';
import AukleCard from '@/components/AukleCard';
import BurelisCard from '@/components/BurelisCard';
import SpecialistCard from '@/components/SpecialistCard';
import DetailModal from '@/components/DetailModal';

type AnyItem = Kindergarten | Aukle | Burelis | Specialist;

interface FavoriteEntry {
  itemId: string;
  itemType: ItemType;
}

export default function FavoritesClient() {
  const [loading, setLoading] = useState(true);
  const [kindergartens, setKindergartens] = useState<Kindergarten[]>([]);
  const [aukles, setAukles] = useState<Aukle[]>([]);
  const [bureliai, setBureliai] = useState<Burelis[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ItemType>('kindergarten');

  useEffect(() => {
    const controller = new AbortController();

    const loadFavorites = async () => {
      try {
        const res = await fetch('/api/favorites', { signal: controller.signal });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        const favorites: FavoriteEntry[] = data.favorites ?? [];
        if (favorites.length === 0) {
          setLoading(false);
          return;
        }

        const grouped: Record<string, string[]> = {};
        for (const f of favorites) {
          (grouped[f.itemType] ??= []).push(f.itemId);
        }

        const fetchByType = async (type: string, ids: string[]) => {
          if (ids.length === 0) return [];
          const params = new URLSearchParams();
          ids.forEach((id) => params.append('ids', id));
          const apiPath = type === 'kindergarten' ? 'kindergartens' : type === 'aukle' ? 'aukles' : type === 'burelis' ? 'bureliai' : 'specialists';
          try {
            const r = await fetch(`/api/${apiPath}?${params.toString()}`, {
              signal: controller.signal,
            });
            if (!r.ok) return [];
            const d = await r.json();
            return d.data ?? d ?? [];
          } catch {
            return [];
          }
        };

        const [k, a, b, s] = await Promise.all([
          fetchByType('kindergarten', grouped['kindergarten'] ?? []),
          fetchByType('aukle', grouped['aukle'] ?? []),
          fetchByType('burelis', grouped['burelis'] ?? []),
          fetchByType('specialist', grouped['specialist'] ?? []),
        ]);

        if (controller.signal.aborted) return;
        setKindergartens(k);
        setAukles(a);
        setBureliai(b);
        setSpecialists(s);
      } catch {
        // aborted or failed
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadFavorites();
    return () => controller.abort();
  }, []);

  const openDetail = (item: AnyItem, itemType: ItemType) => {
    setSelectedItem(item);
    setSelectedItemType(itemType);
  };

  if (loading) {
    return <p className="text-center text-gray-400 dark:text-gray-500 py-12">Kraunama...</p>;
  }

  const total = kindergartens.length + aukles.length + bureliai.length + specialists.length;

  if (total === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">💔</p>
        <p className="text-gray-500 dark:text-gray-400">Dar neturite mėgstamiausių. Naršykite ir pridėkite paspaudę ❤️</p>
      </div>
    );
  }

  return (
    <>
      {kindergartens.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🏫 Darželiai ({kindergartens.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kindergartens.map((item) => (
              <KindergartenCard key={item.id} item={item} onSelect={(i) => openDetail(i, 'kindergarten')} />
            ))}
          </div>
        </section>
      )}

      {aukles.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👩‍👧 Auklės ({aukles.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aukles.map((item) => (
              <AukleCard key={item.id} item={item} onSelect={(i) => openDetail(i, 'aukle')} />
            ))}
          </div>
        </section>
      )}

      {bureliai.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🎨 Būreliai ({bureliai.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bureliai.map((item) => (
              <BurelisCard key={item.id} item={item} onSelect={(i) => openDetail(i, 'burelis')} />
            ))}
          </div>
        </section>
      )}

      {specialists.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👨‍⚕️ Specialistai ({specialists.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialists.map((item) => (
              <SpecialistCard key={item.id} item={item} onSelect={(i) => openDetail(i, 'specialist')} />
            ))}
          </div>
        </section>
      )}

      <DetailModal
        item={selectedItem}
        itemType={selectedItemType}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
