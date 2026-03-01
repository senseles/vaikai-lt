'use client';

import { useEffect, useState } from 'react';
import type { Review, ItemType } from '@/types';
import StarRating from './StarRating';

interface ReviewListProps {
  readonly itemId: string;
  readonly itemType: ItemType;
}

export default function ReviewList({ itemId, itemType }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/reviews?itemId=${itemId}&itemType=${itemType}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [itemId, itemType]);

  if (loading) return <p className="text-sm text-gray-400 dark:text-gray-500">Kraunami atsiliepimai...</p>;

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-400 dark:text-gray-500 text-2xl mb-2">💬</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Atsiliepimų dar nėra.</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Būkite pirmas ir pasidalinkite savo patirtimi!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900 dark:text-white">Atsiliepimai ({reviews.length})</h4>
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-100 dark:border-slate-700 pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{review.authorName}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(review.createdAt).toLocaleDateString('lt-LT')}</span>
          </div>
          <StarRating rating={review.rating} size="sm" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{review.text}</p>
        </div>
      ))}
    </div>
  );
}
