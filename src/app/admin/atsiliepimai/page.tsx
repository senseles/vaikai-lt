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
  reply?: { id: string; text: string; authorName: string; createdAt: string } | null;
}

type TabFilter = 'pending' | 'approved' | 'all';

const ITEM_TYPE_LABELS: Record<string, string> = {
  kindergarten: 'Darželis',
  aukle: 'Auklė',
  burelis: 'Būrelis',
  specialist: 'Specialistas',
};

const ITEM_TYPE_COLORS: Record<string, string> = {
  kindergarten: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  aukle: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  burelis: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  specialist: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('date_desc');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab === 'pending') params.set('pending', 'true');
      else if (tab === 'approved') params.set('approved', 'true');
      if (filterType) params.set('itemType', filterType);
      if (filterRating) params.set('rating', filterRating);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(currentPage));
      params.set('limit', '20');
      if (sortBy) params.set('sort', sortBy);

      const res = await fetch(`/api/admin/reviews?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : (data.reviews ?? []));
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [tab, filterType, filterRating, searchQuery, currentPage, sortBy]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSelectedIds(new Set()); }, [reviews]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [tab, filterType, filterRating, searchQuery, sortBy]);

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
    if (!confirm('Ar tikrai norite ištrinti šį atsiliepimą? Šis veiksmas negrįžtamas.')) return;
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

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    clearMessages();
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Nepavyko išsaugoti atsakymo');
      }
      setActionSuccess('Atsakymas išsaugotas');
      setReplyingTo(null);
      setReplyText('');
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Nepavyko išsaugoti atsakymo');
    } finally {
      setReplySubmitting(false);
    }
  };

  const allSelected = reviews.length > 0 && reviews.every((r) => selectedIds.has(r.id));

  const tabs: { key: TabFilter; label: string; count?: number }[] = [
    { key: 'pending', label: 'Laukiantys', count: counts.pending },
    { key: 'approved', label: 'Patvirtinti', count: counts.approved },
    { key: 'all', label: 'Visi', count: counts.all },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-500' : 'text-gray-200 dark:text-gray-600'}`}>★</span>
    ));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Atsiliepimai</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Moderuokite vartotojų atsiliepimus</p>
      </div>

      {/* Messages */}
      {actionError && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-center justify-between animate-in">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0">✕</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 ml-2 p-1" aria-label="Uždaryti">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      {actionSuccess && (
        <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400 flex items-center justify-between animate-in">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0">✓</span>
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-green-400 hover:text-green-600 dark:hover:text-green-300 ml-2 p-1" aria-label="Uždaryti">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Tabs with counts */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelectedIds(new Set()); }}
            className={`px-4 py-2 text-sm rounded-md transition-all duration-200 font-medium whitespace-nowrap flex items-center gap-1.5 ${
              tab === t.key
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                tab === t.key
                  ? t.key === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-gray-300'
                  : 'bg-gray-200/60 text-gray-500 dark:bg-slate-700 dark:text-gray-400'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ieškoti pagal autorių ar tekstą..."
          className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none min-h-[40px] min-w-[220px]"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none min-h-[40px]"
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
          className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none min-h-[40px]"
        >
          <option value="">Visi įvertinimai</option>
          <option value="1">1 žvaigždutė</option>
          <option value="2">2 žvaigždutės</option>
          <option value="3">3 žvaigždutės</option>
          <option value="4">4 žvaigždutės</option>
          <option value="5">5 žvaigždutės</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none min-h-[40px]"
        >
          <option value="date_desc">Naujausi pirmi</option>
          <option value="date_asc">Seniausi pirmi</option>
          <option value="rating_desc">Aukščiausias įvertinimas</option>
          <option value="rating_asc">Žemiausias įvertinimas</option>
        </select>
        {(filterType || filterRating || searchQuery) && (
          <button
            onClick={() => { setFilterType(''); setFilterRating(''); setSearchQuery(''); }}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 min-h-[40px]"
          >
            Išvalyti filtrus
          </button>
        )}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-gray-200 dark:bg-slate-700 rounded mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16" />
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-gray-300 dark:text-gray-600 text-2xl">★</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {tab === 'pending' ? 'Nėra laukiančių atsiliepimų' : tab === 'approved' ? 'Nėra patvirtintų atsiliepimų' : 'Nėra atsiliepimų'}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
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
              className="rounded border-gray-300 dark:border-slate-600 text-[#2d6a4f] focus:ring-[#2d6a4f] w-4 h-4"
              aria-label="Pasirinkti visus"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
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
                  className={`bg-white dark:bg-slate-800 rounded-xl border transition-all duration-200 ${
                    selectedIds.has(r.id) ? 'border-[#2d6a4f] ring-1 ring-[#2d6a4f]/20 bg-green-50/20 dark:bg-green-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                  } ${isProcessing ? 'opacity-60' : ''}`}
                >
                  {/* Card content */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        className="rounded border-gray-300 dark:border-slate-600 text-[#2d6a4f] focus:ring-[#2d6a4f] mt-0.5 w-4 h-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        {/* Header row: author, type badge, status */}
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{r.authorName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            ITEM_TYPE_COLORS[r.itemType] ?? 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                          }`}>
                            {ITEM_TYPE_LABELS[r.itemType] ?? r.itemType}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            r.isApproved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {r.isApproved ? 'Patvirtintas' : 'Laukia'}
                          </span>
                        </div>

                        {/* Item name if available */}
                        {r.itemName && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                            Apie: <span className="text-gray-600 dark:text-gray-300 font-medium">{r.itemName}</span>
                          </p>
                        )}

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 mb-2">
                          {renderStars(r.rating)}
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({r.rating}/5)</span>
                        </div>

                        {/* Review text */}
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.text}</p>

                        {/* Footer: date and actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                          <time className="text-xs text-gray-400 dark:text-gray-500">
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
                                className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 disabled:opacity-50 font-medium transition-colors whitespace-nowrap min-h-[32px]"
                              >
                                Atmesti
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (replyingTo === r.id) { setReplyingTo(null); setReplyText(''); }
                                else { setReplyingTo(r.id); setReplyText(''); }
                              }}
                              disabled={isProcessing}
                              className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 font-medium transition-colors whitespace-nowrap min-h-[32px]"
                            >
                              Atsakyti
                            </button>
                            <button
                              onClick={() => deleteReview(r.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 text-xs bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 font-medium transition-colors whitespace-nowrap min-h-[32px]"
                            >
                              Ištrinti
                            </button>
                          </div>
                        </div>

                        {/* Existing reply */}
                        {r.reply && (
                          <div className="mt-3 ml-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">{r.reply.authorName}</span>
                              <time className="text-xs text-blue-400 dark:text-blue-500">
                                {new Date(r.reply.createdAt).toLocaleDateString('lt-LT', {
                                  year: 'numeric', month: 'long', day: 'numeric',
                                })}
                              </time>
                            </div>
                            <p className="text-sm text-blue-800 dark:text-blue-300">{r.reply.text}</p>
                          </div>
                        )}

                        {/* Inline reply form */}
                        {replyingTo === r.id && (
                          <div className="mt-3 ml-4 p-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Rašykite atsakymą..."
                              rows={3}
                              maxLength={2000}
                              className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none resize-none"
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400 dark:text-gray-500">{replyText.length}/2000</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                  className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors min-h-[32px]"
                                >
                                  Atšaukti
                                </button>
                                <button
                                  onClick={() => submitReply(r.id)}
                                  disabled={replySubmitting || !replyText.trim()}
                                  className="px-3 py-1.5 text-xs bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] disabled:opacity-50 font-medium transition-colors min-h-[32px]"
                                >
                                  {replySubmitting ? 'Siunčiama...' : 'Siųsti atsakymą'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 dark:text-gray-300 transition-colors min-h-[40px]"
              >
                Ankstesnis
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentPage} iš {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 dark:text-gray-300 transition-colors min-h-[40px]"
              >
                Kitas
              </button>
            </div>
          )}
        </>
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg px-4 py-3 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
            className="px-3 py-2 min-h-[44px] text-sm bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 font-medium transition-colors"
          >
            Atmesti visus
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors min-h-[44px] px-2"
          >
            Atšaukti
          </button>
        </div>
      )}
    </div>
  );
}
