'use client';

import { useState, useEffect, useCallback } from 'react';

interface Review {
  id: string;
  itemId: string;
  itemType: string;
  authorName: string;
  rating: number;
  text: string;
  isApproved: boolean;
  createdAt: string;
}

type TabFilter = 'pending' | 'approved' | 'all';

const ITEM_TYPE_LABELS: Record<string, string> = {
  kindergarten: 'Darželis',
  aukle: 'Auklė',
  burelis: 'Būrelis',
  specialist: 'Specialistas',
};

export default function AdminAtsiliepimai() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>('pending');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab === 'pending') params.set('pending', 'true');
      else if (tab === 'approved') params.set('approved', 'true');
      if (filterType) params.set('itemType', filterType);
      if (filterRating) params.set('rating', filterRating);

      const res = await fetch(`/api/admin/reviews?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : (data.reviews ?? []));
      }
    } finally {
      setLoading(false);
    }
  }, [tab, filterType, filterRating]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSelectedIds(new Set()); }, [reviews]);

  const clearMessages = () => {
    setActionError('');
    setActionSuccess('');
  };

  const approveReview = async (id: string) => {
    clearMessages();
    setProcessing((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true }),
      });
      if (!res.ok) throw new Error();
      setActionSuccess('Atsiliepimas patvirtintas');
      load();
    } catch {
      setActionError('Nepavyko patvirtinti atsiliepimo');
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const rejectReview = async (id: string) => {
    clearMessages();
    setProcessing((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: false }),
      });
      if (!res.ok) throw new Error();
      setActionSuccess('Atsiliepimas atmestas');
      load();
    } catch {
      setActionError('Nepavyko atmesti atsiliepimo');
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį atsiliepimą?')) return;
    clearMessages();
    setProcessing((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setActionSuccess('Atsiliepimas ištrintas');
      load();
    } catch {
      setActionError('Nepavyko ištrinti atsiliepimo');
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Bulk actions
  const bulkApprove = async () => {
    if (selectedIds.size === 0) return;
    clearMessages();
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), action: 'approve' }),
      });
      if (!res.ok) throw new Error();
      setActionSuccess(`${selectedIds.size} atsiliepimų patvirtinta`);
      setSelectedIds(new Set());
      load();
    } catch {
      setActionError('Nepavyko atlikti masinio patvirtinimo');
    }
  };

  const bulkReject = async () => {
    if (selectedIds.size === 0) return;
    clearMessages();
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), action: 'reject' }),
      });
      if (!res.ok) throw new Error();
      setActionSuccess(`${selectedIds.size} atsiliepimų atmesta`);
      setSelectedIds(new Set());
      load();
    } catch {
      setActionError('Nepavyko atlikti masinio atmetimo');
    }
  };

  const toggleSelectAll = () => {
    if (reviews.length > 0 && reviews.every((r) => selectedIds.has(r.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviews.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = reviews.length > 0 && reviews.every((r) => selectedIds.has(r.id));

  const tabs: { key: TabFilter; label: string; count?: number }[] = [
    { key: 'pending', label: 'Laukiantys' },
    { key: 'approved', label: 'Patvirtinti' },
    { key: 'all', label: 'Visi' },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-500' : 'text-gray-200'}`}>★</span>
    ));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Atsiliepimai</h1>
        <p className="text-sm text-gray-500 mt-1">Moderuokite vartotojų atsiliepimus</p>
      </div>

      {/* Messages */}
      {actionError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600 ml-2">✕</button>
        </div>
      )}
      {actionSuccess && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-green-400 hover:text-green-600 ml-2">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelectedIds(new Set()); }}
            className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-200 bg-white text-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none"
        >
          <option value="">Visi tipai</option>
          <option value="kindergarten">Darželiai</option>
          <option value="aukle">Auklės</option>
          <option value="burelis">Būreliai</option>
          <option value="specialist">Specialistai</option>
        </select>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="border border-gray-200 bg-white text-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none"
        >
          <option value="">Visi įvertinimai</option>
          <option value="1">1 žvaigždutė</option>
          <option value="2">2 žvaigždutės</option>
          <option value="3">3 žvaigždutės</option>
          <option value="4">4 žvaigždutės</option>
          <option value="5">5 žvaigždutės</option>
        </select>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">
            {tab === 'pending' ? 'Nėra laukiančių atsiliepimų' : 'Nėra atsiliepimų'}
          </p>
        </div>
      ) : (
        <>
          {/* Select all header */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f]"
              aria-label="Pasirinkti visus"
            />
            <span className="text-sm text-gray-500">
              {selectedIds.size > 0 ? `Pasirinkta: ${selectedIds.size}` : `Rodoma: ${reviews.length}`}
            </span>
          </div>

          <div className="space-y-2">
            {reviews.map((r) => (
              <div
                key={r.id}
                className={`bg-white rounded-xl border transition-colors ${
                  selectedIds.has(r.id) ? 'border-[#2d6a4f] bg-green-50/30' : 'border-gray-200'
                } p-4`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(r.id)}
                    onChange={() => toggleSelect(r.id)}
                    className="rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f] mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{r.authorName}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        ITEM_TYPE_LABELS[r.itemType]
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ITEM_TYPE_LABELS[r.itemType] ?? r.itemType}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        r.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {r.isApproved ? 'Patvirtintas' : 'Laukia'}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {renderStars(r.rating)}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
                    <time className="text-xs text-gray-400 mt-2 block">
                      {new Date(r.createdAt).toLocaleDateString('lt-LT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {!r.isApproved && (
                      <button
                        onClick={() => approveReview(r.id)}
                        disabled={processing.has(r.id)}
                        className="px-3 py-1.5 text-xs bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] disabled:opacity-50 font-medium transition-colors whitespace-nowrap"
                      >
                        Patvirtinti
                      </button>
                    )}
                    {r.isApproved && (
                      <button
                        onClick={() => rejectReview(r.id)}
                        disabled={processing.has(r.id)}
                        className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:opacity-50 font-medium transition-colors whitespace-nowrap"
                      >
                        Atmesti
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(r.id)}
                      disabled={processing.has(r.id)}
                      className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 font-medium transition-colors whitespace-nowrap"
                    >
                      Ištrinti
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            Pasirinkta: {selectedIds.size}
          </span>
          <button
            onClick={bulkApprove}
            className="px-3 py-2 min-h-[44px] text-sm bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] font-medium transition-colors"
          >
            Patvirtinti visus
          </button>
          <button
            onClick={bulkReject}
            className="px-3 py-2 min-h-[44px] text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-medium transition-colors"
          >
            Atmesti visus
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] px-2"
          >
            Atšaukti
          </button>
        </div>
      )}
    </div>
  );
}
