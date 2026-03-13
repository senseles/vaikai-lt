'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { ItemType } from '@/types';
import StarRating from './StarRating';

interface ReviewFormProps {
  readonly itemId: string;
  readonly itemType: ItemType;
  readonly onSubmitted?: () => void;
}

export default function ReviewForm({ itemId, itemType, onSubmitted }: ReviewFormProps) {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill author name from session
  useEffect(() => {
    if (session?.user?.name && !authorName) {
      setAuthorName(session.user.name);
    }
  }, [session, authorName]);

  // Auto-hide success message
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(false), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-5 h-5 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-48" />
        </div>
      </div>
    );
  }

  // Not logged in — show login prompt
  if (!session) {
    return (
      <div className="mt-4 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m-4.757 3.757A9.97 9.97 0 0112 21a9.97 9.97 0 016.757-2.243M15 9A3 3 0 119 9a3 3 0 016 0z" />
          </svg>
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
              Prisijunkite, kad galėtumėte rašyti atsiliepimą
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
              Norėdami palikti atsiliepimą, turite būti prisijungę prie savo paskyros.
            </p>
            <Link
              href="/prisijungti"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Prisijungti
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Pasirinkite įvertinimą'); return; }
    if (!text.trim()) { setError('Parašykite atsiliepimą'); return; }
    if (text.trim().length < 10) { setError('Atsiliepimas turi būti bent 10 simbolių'); return; }
    if (!authorName.trim()) { setError('Įveskite vardą'); return; }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ itemId, itemType, rating, text: text.trim(), authorName: authorName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Nepavyko išsaugoti');
      }
      setSuccess(true);
      setRating(0);
      setText('');
      setAuthorName(session?.user?.name || '');
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error && err.message !== 'Nepavyko išsaugoti' ? err.message : 'Klaida siunčiant atsiliepimą. Bandykite dar kartą.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm animate-scale-in flex items-start gap-2">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        <div>
          <p className="font-medium">Ačiū už atsiliepimą!</p>
          <p className="mt-0.5 text-green-600 dark:text-green-500">Jūsų atsiliepimas bus paskelbtas po administracijos peržiūros.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <h4 className="font-semibold text-gray-900 dark:text-white">Palikti atsiliepimą</h4>

      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Įvertinimas</label>
        <StarRating rating={rating} interactive onChange={setRating} />
      </div>

      <div>
        <label htmlFor="review-author" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Vardas</label>
        <input
          id="review-author"
          type="text"
          autoComplete="name"
          placeholder="Jūsų vardas"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label htmlFor="review-text" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Atsiliepimas</label>
        <textarea
          id="review-text"
          placeholder="Jūsų atsiliepimas..."
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 2000))}
          rows={3}
          maxLength={2000}
          className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-colors"
        />
        {text.length > 1800 && (
          <p className={`text-xs mt-1 ${text.length >= 2000 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{text.length}/2000</p>
        )}
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-white rounded-lg py-3 min-h-[48px] text-base font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Siunčiama...' : 'Siųsti atsiliepimą'}
      </button>
    </form>
  );
}
