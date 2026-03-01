'use client';

import { useState, useEffect } from 'react';
import type { ItemType } from '@/types';
import StarRating from './StarRating';

interface ReviewFormProps {
  readonly itemId: string;
  readonly itemType: ItemType;
  readonly onSubmitted?: () => void;
}

export default function ReviewForm({ itemId, itemType, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, itemType, rating, text: text.trim(), authorName: authorName.trim() }),
      });
      if (!res.ok) throw new Error('Nepavyko išsaugoti');
      setSuccess(true);
      setRating(0);
      setText('');
      setAuthorName('');
      onSubmitted?.();
    } catch {
      setError('Klaida siunčiant atsiliepimą. Bandykite dar kartą.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(false), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  if (success) {
    return (
      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm animate-scale-in flex items-center gap-2">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        Ačiū už atsiliepimą! Jis bus paskelbtas po peržiūros.
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
          placeholder="Jūsų vardas"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
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
          className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-colors"
        />
        {text.length > 1800 && (
          <p className={`text-xs mt-1 ${text.length >= 2000 ? 'text-red-500' : 'text-gray-400'}`}>{text.length}/2000</p>
        )}
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Siunčiama...' : 'Siųsti atsiliepimą'}
      </button>
    </form>
  );
}
