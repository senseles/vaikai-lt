'use client';

import { useState, useEffect, useCallback } from 'react';

interface Review {
  readonly id: string;
  readonly authorName: string;
  readonly rating: number;
  readonly text: string;
  readonly isApproved: boolean;
  readonly createdAt: string;
}

interface ReviewsModalProps {
  readonly itemId: string;
  readonly itemType: string;
  readonly itemName: string;
  readonly onClose: () => void;
}

export default function ReviewsModal({ itemId, itemType, itemName, onClose }: ReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ authorName: string; rating: number; text: string; isApproved: boolean }>({ authorName: '', rating: 5, text: '', isApproved: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?tab=all&itemId=${itemId}`);
      const data = await res.json();
      setReviews(data.reviews ?? data ?? []);
    } catch {
      setError('Nepavyko užkrauti atsiliepimų');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const startEdit = (r: Review) => {
    setEditingId(r.id);
    setEditData({ authorName: r.authorName, rating: r.rating, text: r.text, isApproved: r.isApproved });
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError('');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/reviews/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isApproved: editData.isApproved,
          text: editData.text,
          authorName: editData.authorName,
          rating: editData.rating,
        }),
      });
      if (!res.ok) throw new Error('Nepavyko atnaujinti');
      setSuccess('Atnaujinta!');
      setEditingId(null);
      fetchReviews();
    } catch {
      setError('Nepavyko išsaugoti pakeitimų');
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Tikrai ištrinti šį atsiliepimą?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Nepavyko ištrinti');
      setSuccess('Atsiliepimas ištrintas');
      fetchReviews();
    } catch {
      setError('Nepavyko ištrinti atsiliepimo');
    }
  };

  const toggleApproval = async (r: Review) => {
    try {
      const res = await fetch(`/api/admin/reviews/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !r.isApproved }),
      });
      if (!res.ok) throw new Error('Nepavyko pakeisti');
      fetchReviews();
    } catch {
      setError('Nepavyko pakeisti statuso');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Atsiliepimai</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{itemName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>

        {/* Messages */}
        {error && <div className="mx-6 mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded">{error}</div>}
        {success && <div className="mx-6 mt-3 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded">{success}</div>}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Kraunama...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nėra atsiliepimų</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className={`border rounded-lg p-4 ${r.isApproved ? 'border-gray-200 dark:border-slate-700' : 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10'}`}>
                {editingId === r.id ? (
                  /* Edit mode */
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Autorius</label>
                        <input
                          type="text"
                          value={editData.authorName}
                          onChange={(e) => setEditData({ ...editData, authorName: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Įvertinimas</label>
                        <select
                          value={editData.rating}
                          onChange={(e) => setEditData({ ...editData, rating: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>{'★'.repeat(n)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tekstas</label>
                      <textarea
                        value={editData.text}
                        onChange={(e) => setEditData({ ...editData, text: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editData.isApproved}
                        onChange={(e) => setEditData({ ...editData, isApproved: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Patvirtintas</span>
                    </label>
                    <div className="flex gap-2 justify-end">
                      <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Atšaukti</button>
                      <button onClick={saveEdit} disabled={saving} className="px-3 py-1.5 text-sm bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42] disabled:opacity-50">
                        {saving ? 'Saugoma...' : 'Išsaugoti'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{r.authorName}</span>
                        <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        {!r.isApproved && <span className="text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded">Nepatvirtintas</span>}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('lt-LT')}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{r.text}</p>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => toggleApproval(r)}
                        className={`px-2.5 py-1 text-xs rounded-lg ${r.isApproved ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                      >
                        {r.isApproved ? 'Atmesti' : 'Patvirtinti'}
                      </button>
                      <button onClick={() => startEdit(r)} className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">Redaguoti</button>
                      <button onClick={() => deleteReview(r.id)} className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Trinti</button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-slate-700 text-right">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
}
