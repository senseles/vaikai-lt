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

  if (loading) return <p className="text-sm text-gray-400">Kraunami atsiliepimai...</p>;
  if (reviews.length === 0) return <p className="text-sm text-gray-400">Atsiliepimų dar nėra.</p>;

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900">Atsiliepimai ({reviews.length})</h4>
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{review.authorName}</span>
            <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('lt-LT')}</span>
          </div>
          <StarRating rating={review.rating} size="sm" />
          <p className="text-sm text-gray-600 mt-1">{review.text}</p>
        </div>
      ))}
    </div>
  );
}
