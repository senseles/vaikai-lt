'use client';

import { useState } from 'react';
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

  if (success) {
    return (
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
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

      <input
        type="text"
        placeholder="Jūsų vardas"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <textarea
        placeholder="Jūsų atsiliepimas..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />

      {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Siunčiama...' : 'Siųsti atsiliepimą'}
      </button>
    </form>
  );
}
