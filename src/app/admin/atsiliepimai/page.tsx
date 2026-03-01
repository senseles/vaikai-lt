'use client';

import { useState, useEffect, useCallback } from 'react';

interface Review {
  id: string;
  itemId: string;
  itemType: string;
  itemName?: string;
  authorName: string;
  rating: number;
  text: string;
  isApproved: boolean;
  createdAt: string;
}

type TabFilter = 'pending' | 'approved' | 'rejected' | 'all';

const ITEM_TYPE_LABELS: Record<string, string> = {
  kindergarten: 'Darželis',
  aukle: 'Auklė',
  burelis: 'Būrelis',
  specialist: 'Specialistas',
};

const ITEM_TYPE_COLORS: Record<string, string> = {
  kindergarten: 'bg-blue-50 text-blue-700',
  aukle: 'bg-green-50 text-green-700',
  burelis: 'bg-orange-50 text-orange-700',
  specialist: 'bg-teal-50 text-teal-700',
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
  const [counts, setCounts] = useState({ pending: 0, approved: 0, all: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab === 'pending') params.set('pending', 'true');
      else if (tab === 'approved') params.set('approved', 'true');
      else if (tab === 'rejected') params.set('pending', 'true');
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

  // Load counts for tabs
  const loadCounts = useCallback(async () => {
    try {
      const [pendingRes, approvedRes, allRes] = await Promise.all([
        fetch('/api/admin/reviews?pending=true'),
        fetch('/api/admin/reviews?approved=true'),
        fetch('/api/admin/reviews'),
      ]);
      const [pendingData, approvedData, allData] = await Promise.all([
        pendingRes.ok ? pendingRes.json() : [],
        approvedRes.ok ? approvedRes.json() : [],
        allRes.ok ? allRes.json() : [],
      ]);
      setCounts({
        pending: (Array.isArray(pendingData) ? pendingData : pendingData.reviews ?? []).length,
        approved: (Array.isArray(approvedData) ? approvedData : approvedData.reviews ?? []).length,
        all: (Array.isArray(allData) ? allData : allData.reviews ?? []).length,
      });
    } catch {
      // Silently fail, counts are not critical
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => { setSelectedIds(new Set()); }, [reviews]);

  // Auto-dismiss success messages
  useEffect(() => {
    if (!actionSuccess) return;
    const timer = setTimeout(() => setActionSuccess(''), 3000);
    return () => clearTimeout(timer);
  }, [actionSuccess]);

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
      loadCounts();
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
      loadCounts();
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
    if (!confirm('Ar tikrai norite ištrinti šį atsiliepimą? Šis veiksmas negrįžtamas.')) return;
    clearMessages();
    setProcessing((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setActionSuccess('Atsiliepimas ištrintas');
      load();
      loadCounts();
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
      loadCounts();
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
      loadCounts();
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
    { key: 'pending', label: 'Laukiantys', count: counts.pending },
    { key: 'approved', label: 'Patvirtinti', count: counts.approved },
    { key: 'all', label: 'Visi', count: counts.all },
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
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between animate-in">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0">✕</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600 ml-2 p-1" aria-label="Uždaryti">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      {actionSuccess && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center justify-between animate-in">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0">✓</span>
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-green-400 hover:text-green-600 ml-2 p-1" aria-label="Uždaryti">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Tabs with counts */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelectedIds(new Set()); }}
            className={`px-4 py-2 text-sm rounded-md transition-all duration-200 font-medium whitespace-nowrap flex items-center gap-1.5 ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                tab === t.key
                  ? t.key === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'
                  : 'bg-gray-200/60 text-gray-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-200 bg-white text-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none min-h-[40px]"
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
          className="border border-gray-200 bg-white text-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none min-h-[40px]"
        >
          <option value="">Visi įvertinimai</option>
          <option value="1">1 žvaigždutė</option>
          <option value="2">2 žvaigždutės</option>
          <option value="3">3 žvaigždutės</option>
          <option value="4">4 žvaigždutės</option>
          <option value="5">5 žvaigždutės</option>
        </select>
        {(filterType || filterRating) && (
          <button
            onClick={() => { setFilterType(''); setFilterRating(''); }}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 min-h-[40px]"
          >
            Išvalyti filtrus
          </button>
        )}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-gray-300 text-2xl">★</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            {tab === 'pending' ? 'Nėra laukiančių atsiliepimų' : tab === 'approved' ? 'Nėra patvirtintų atsiliepimų' : 'Nėra atsiliepimų'}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {tab === 'pending' ? 'Visi atsiliepimai peržiūrėti!' : 'Pakeiskite filtrus norėdami rasti atsiliepimų'}
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
              className="rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f] w-4 h-4"
              aria-label="Pasirinkti visus"
            />
            <span className="text-sm text-gray-500">
              {selectedIds.size > 0 ? `Pasirinkta: ${selectedIds.size} iš ${reviews.length}` : `Rodoma: ${reviews.length}`}
            </span>
          </div>

          {/* Review cards */}
          <div className="space-y-2">
            {reviews.map((r) => {
              const isProcessing = processing.has(r.id);
              return (
                <div
                  key={r.id}
                  className={`bg-white rounded-xl border transition-all duration-200 ${
                    selectedIds.has(r.id) ? 'border-[#2d6a4f] ring-1 ring-[#2d6a4f]/20 bg-green-50/20' : 'border-gray-200 hover:border-gray-300'
                  } ${isProcessing ? 'opacity-60' : ''}`}
                >
                  {/* Card content */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        className="rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f] mt-0.5 w-4 h-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        {/* Header row: author, type badge, status */}
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-semibold text-gray-900 text-sm">{r.authorName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            ITEM_TYPE_COLORS[r.itemType] ?? 'bg-gray-100 text-gray-600'
                          }`}>
                            {ITEM_TYPE_LABELS[r.itemType] ?? r.itemType}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            r.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {r.isApproved ? 'Patvirtintas' : 'Laukia'}
                          </span>
                        </div>

                        {/* Item name if available */}
                        {r.itemName && (
                          <p className="text-xs text-gray-400 mb-1.5">
                            Apie: <span className="text-gray-600 font-medium">{r.itemName}</span>
                          </p>
                        )}

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 mb-2">
                          {renderStars(r.rating)}
                          <span className="text-xs text-gray-400 ml-1">({r.rating}/5)</span>
                        </div>

                        {/* Review text */}
                        <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>

                        {/* Footer: date and actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
                          <time className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString('lt-LT', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </time>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5">
                            {!r.isApproved && (
                              <button
                                onClick={() => approveReview(r.id)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-xs bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] disabled:opacity-50 font-medium transition-colors whitespace-nowrap min-h-[32px]"
                              >
                                Patvirtinti
                              </button>
                            )}
                            {r.isApproved && (
                              <button
                                onClick={() => rejectReview(r.id)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:opacity-50 font-medium transition-colors whitespace-nowrap min-h-[32px]"
                              >
                                Atmesti
                              </button>
                            )}
                            <button
                              onClick={() => deleteReview(r.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 font-medium transition-colors whitespace-nowrap min-h-[32px]"
                            >
                              Ištrinti
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto z-50 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 flex flex-wrap items-center justify-center gap-3">
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
