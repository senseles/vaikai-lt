'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Review, ItemType } from '@/types';
import StarRating from './StarRating';

interface ReviewListProps {
  readonly itemId: string;
  readonly itemType: ItemType;
}

export default function ReviewList({ itemId, itemType }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch(`/api/reviews?itemId=${itemId}&itemType=${itemType}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        } else {
          setError(true);
        }
      } catch {
        if (controller.signal.aborted) return;
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [itemId, itemType]);

  if (loading) return <p className="text-sm text-gray-400 dark:text-gray-500">Kraunami atsiliepimai...</p>;

  if (error) {
    return (
      <p className="text-sm text-red-500 dark:text-red-400 py-4 text-center">
        Nepavyko užkrauti atsiliepimų. Pabandykite vėliau.
      </p>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-400 dark:text-gray-500 text-2xl mb-2">{'\u{1F4AC}'}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Atsiliepimų dar nėra.</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Būkite pirmas ir pasidalinkite savo patirtimi!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900 dark:text-white">Visi atsiliepimai ({reviews.length})</h4>
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}

// ─── Individual Review with Report button ───

function ReviewItem({ review }: { readonly review: Review }) {
  const [reportState, setReportState] = useState<'idle' | 'confirming' | 'sending' | 'sent' | 'error'>('idle');

  const handleReport = useCallback(async () => {
    if (reportState === 'confirming') {
      setReportState('sending');
      try {
        const res = await fetch('/api/reviews/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewId: review.id }),
        });
        if (res.ok) {
          setReportState('sent');
        } else if (res.status === 429) {
          setReportState('error');
        } else {
          setReportState('error');
        }
      } catch {
        setReportState('error');
      }
    } else {
      setReportState('confirming');
    }
  }, [reportState, review.id]);

  const cancelReport = useCallback(() => {
    setReportState('idle');
  }, []);

  return (
    <div className="border-b border-gray-100 dark:border-slate-700 pb-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{review.authorName}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(review.createdAt).toLocaleDateString('lt-LT')}</span>
      </div>
      <StarRating rating={review.rating} size="sm" />
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{review.text}</p>

      {/* Report section */}
      <div className="mt-2 flex items-center gap-2">
        {reportState === 'idle' && (
          <button
            onClick={handleReport}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
            title="Pranešti apie atsiliepimą"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
            </svg>
            Pranešti
          </button>
        )}

        {reportState === 'confirming' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400">Ar tikrai norite pranešti apie šį atsiliepimą?</span>
            <button
              onClick={handleReport}
              className="text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Taip
            </button>
            <button
              onClick={cancelReport}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Ne
            </button>
          </div>
        )}

        {reportState === 'sending' && (
          <span className="text-xs text-gray-400">Siunčiama...</span>
        )}

        {reportState === 'sent' && (
          <span className="text-xs text-green-600 dark:text-green-400">Ačiū! Jūsų pranešimas bus peržiūrėtas.</span>
        )}

        {reportState === 'error' && (
          <span className="text-xs text-red-500">Nepavyko išsiųsti. Bandykite vėliau.</span>
        )}
      </div>
    </div>
  );
}
