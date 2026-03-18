'use client';

import { useState, useEffect, useCallback } from 'react';

interface VerificationItem {
  id: string;
  name: string;
  city: string;
  entityType: string;
  verificationStatus: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

interface Stats {
  overall: { UNVERIFIED: number; VERIFIED: number; REJECTED: number; total: number };
  byType: Record<string, { UNVERIFIED: number; VERIFIED: number; REJECTED: number; total: number }>;
}

type StatusFilter = 'all' | 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
type EntityTypeFilter = '' | 'kindergarten' | 'aukle' | 'burelis' | 'specialist';

const ENTITY_LABELS: Record<string, string> = {
  kindergarten: 'Darželiai',
  aukle: 'Auklės',
  burelis: 'Būreliai',
  specialist: 'Specialistai',
};

const ENTITY_COLORS: Record<string, string> = {
  kindergarten: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  aukle: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  burelis: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  specialist: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

const STATUS_LABELS: Record<string, string> = {
  UNVERIFIED: 'Nepatikrintas',
  VERIFIED: 'Patvirtintas',
  REJECTED: 'Atmestas',
};

const STATUS_COLORS: Record<string, string> = {
  UNVERIFIED: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400',
  VERIFIED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminVerification() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<EntityTypeFilter>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Map<string, string>>(new Map()); // id -> entityType
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [processing, setProcessing] = useState(false);
  const [detailItem, setDetailItem] = useState<VerificationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState<'verify' | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/verification/stats');
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(currentPage));
      params.set('limit', '20');

      const res = await fetch(`/api/admin/verification?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery, currentPage]);

  useEffect(() => { loadItems(); loadStats(); }, [loadItems, loadStats]);
  useEffect(() => { setSelectedIds(new Map()); }, [items]);
  useEffect(() => { setCurrentPage(1); }, [statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    if (!actionSuccess) return;
    const timer = setTimeout(() => setActionSuccess(''), 3000);
    return () => clearTimeout(timer);
  }, [actionSuccess]);

  const clearMessages = () => { setActionError(''); setActionSuccess(''); };

  // Single item actions
  const updateStatus = async (id: string, entityType: string, status: string, reason?: string) => {
    clearMessages();
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/verification/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, status, rejectionReason: reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Nepavyko atnaujinti');
      }
      setActionSuccess(status === 'VERIFIED' ? 'Įrašas patvirtintas' : 'Įrašas atmestas');
      setDetailItem(null);
      setRejectReason('');
      loadItems();
      loadStats();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Nepavyko atnaujinti');
    } finally {
      setProcessing(false);
    }
  };

  // Bulk actions
  const executeBulk = async (status: 'VERIFIED' | 'REJECTED', reason?: string) => {
    clearMessages();
    setProcessing(true);

    // Group by entity type
    const grouped = new Map<string, string[]>();
    Array.from(selectedIds.entries()).forEach(([id, type]) => {
      if (!grouped.has(type)) grouped.set(type, []);
      grouped.get(type)!.push(id);
    });

    let totalSuccess = 0;
    let totalFail = 0;

    try {
      const entries = Array.from(grouped.entries());
      for (const [entityType, ids] of entries) {
        const res = await fetch('/api/admin/verification/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids, entityType, status, rejectionReason: reason }),
        });
        if (res.ok) {
          const data = await res.json();
          totalSuccess += data.successCount || 0;
          totalFail += data.failCount || 0;
        } else {
          totalFail += ids.length;
        }
      }

      if (totalFail > 0) {
        setActionSuccess(`${totalSuccess} sėkmingai, ${totalFail} nepavyko`);
      } else {
        setActionSuccess(`${totalSuccess} įrašų ${status === 'VERIFIED' ? 'patvirtinta' : 'atmesta'}`);
      }
      setSelectedIds(new Map());
      setShowBulkRejectModal(false);
      setShowBulkConfirm(null);
      setBulkRejectReason('');
      loadItems();
      loadStats();
    } catch {
      setActionError('Nepavyko atlikti masinio veiksmo');
    } finally {
      setProcessing(false);
    }
  };

  const toggleSelect = (id: string, entityType: string) => {
    setSelectedIds(prev => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, entityType);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (items.length > 0 && items.every(i => selectedIds.has(i.id))) {
      setSelectedIds(new Map());
    } else {
      const next = new Map<string, string>();
      items.forEach(i => next.set(i.id, i.entityType));
      setSelectedIds(next);
    }
  };

  const allSelected = items.length > 0 && items.every(i => selectedIds.has(i.id));

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Visi' },
    { key: 'UNVERIFIED', label: 'Nepatikrinti' },
    { key: 'VERIFIED', label: 'Patvirtinti' },
    { key: 'REJECTED', label: 'Atmesti' },
  ];

  const renderProgressBar = (verified: number, total: number) => {
    const pct = total > 0 ? Math.round((verified / total) * 100) : 0;
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500 dark:text-gray-400">Progresas</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-[#2d6a4f]' : 'bg-[#40916c]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Verifikavimas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tikrinkite ir tvirtinkite platformos įrašus</p>
      </div>

      {/* Messages */}
      {actionError && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2"><span>✕</span><span>{actionError}</span></div>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 ml-2 p-1" aria-label="Uždaryti">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      {actionSuccess && (
        <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400 flex items-center justify-between">
          <div className="flex items-center gap-2"><span>✓</span><span>{actionSuccess}</span></div>
          <button onClick={() => setActionSuccess('')} className="text-green-400 hover:text-green-600 dark:hover:text-green-300 ml-2 p-1" aria-label="Uždaryti">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {(['kindergarten', 'aukle', 'burelis', 'specialist'] as const).map((type) => {
            const s = stats.byType[type];
            if (!s) return null;
            return (
              <div key={type} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ENTITY_COLORS[type]}`}>
                    {ENTITY_LABELS[type]}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{s.total}</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span className="text-green-600 dark:text-green-400">{s.VERIFIED} patv.</span>
                  <span>{s.UNVERIFIED} laukia</span>
                  <span className="text-red-500 dark:text-red-400">{s.REJECTED} atm.</span>
                </div>
                {renderProgressBar(s.VERIFIED, s.total)}
              </div>
            );
          })}
        </div>
      )}

      {/* Overall progress */}
      {stats && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bendras progresas</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {stats.overall.VERIFIED} / {stats.overall.total} patikrinta
            </span>
          </div>
          {renderProgressBar(stats.overall.VERIFIED, stats.overall.total)}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setStatusFilter(t.key); setSelectedIds(new Map()); }}
            className={`px-4 py-2 text-sm rounded-md transition-all duration-200 font-medium whitespace-nowrap ${
              statusFilter === t.key
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ieškoti pagal pavadinimą..."
          className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none min-h-[40px] min-w-[220px]"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as EntityTypeFilter)}
          className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none min-h-[40px]"
        >
          <option value="">Visi tipai</option>
          <option value="kindergarten">Darželiai</option>
          <option value="aukle">Auklės</option>
          <option value="burelis">Būreliai</option>
          <option value="specialist">Specialistai</option>
        </select>
        {(typeFilter || searchQuery) && (
          <button
            onClick={() => { setTypeFilter(''); setSearchQuery(''); }}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 min-h-[40px]"
          >
            Išvalyti filtrus
          </button>
        )}
      </div>

      {/* Items list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-gray-200 dark:bg-slate-700 rounded mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-48" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-gray-300 dark:text-gray-600 text-2xl">✓</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Nėra įrašų pagal pasirinktus filtrus</p>
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
              {selectedIds.size > 0 ? `Pasirinkta: ${selectedIds.size} iš ${items.length}` : `Rodoma: ${items.length}`}
            </span>
          </div>

          {/* Item cards */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={`${item.entityType}-${item.id}`}
                className={`bg-white dark:bg-slate-800 rounded-xl border transition-all duration-200 ${
                  selectedIds.has(item.id) ? 'border-[#2d6a4f] ring-1 ring-[#2d6a4f]/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id, item.entityType)}
                      className="rounded border-gray-300 dark:border-slate-600 text-[#2d6a4f] focus:ring-[#2d6a4f] mt-0.5 w-4 h-4 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ENTITY_COLORS[item.entityType] ?? ''}`}>
                          {ENTITY_LABELS[item.entityType] ?? item.entityType}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.verificationStatus] ?? ''}`}>
                          {STATUS_LABELS[item.verificationStatus] ?? item.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                        {item.city}
                        {item.verifiedAt && ` · Patikrinta ${new Date(item.verifiedAt).toLocaleDateString('lt-LT')}`}
                      </p>
                      {item.rejectionReason && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                          Priežastis: {item.rejectionReason}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                        {item.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => updateStatus(item.id, item.entityType, 'VERIFIED')}
                            disabled={processing}
                            className="px-3 py-1.5 text-xs bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] disabled:opacity-50 font-medium transition-colors min-h-[32px]"
                          >
                            Patvirtinti
                          </button>
                        )}
                        {item.verificationStatus !== 'REJECTED' && (
                          <button
                            onClick={() => { setDetailItem(item); setRejectReason(''); }}
                            disabled={processing}
                            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 font-medium transition-colors min-h-[32px]"
                          >
                            Atmesti
                          </button>
                        )}
                        {item.verificationStatus !== 'UNVERIFIED' && (
                          <button
                            onClick={() => updateStatus(item.id, item.entityType, 'UNVERIFIED')}
                            disabled={processing}
                            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 font-medium transition-colors min-h-[32px]"
                          >
                            Grąžinti
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 font-medium text-gray-700 dark:text-gray-300 transition-colors min-h-[40px]"
              >
                Ankstesnis
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentPage} iš {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 font-medium text-gray-700 dark:text-gray-300 transition-colors min-h-[40px]"
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
            onClick={() => setShowBulkConfirm('verify')}
            disabled={processing}
            className="px-3 py-2 min-h-[44px] text-sm bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] disabled:opacity-50 font-medium transition-colors"
          >
            Patvirtinti pasirinktus
          </button>
          <button
            onClick={() => setShowBulkRejectModal(true)}
            disabled={processing}
            className="px-3 py-2 min-h-[44px] text-sm bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 font-medium transition-colors"
          >
            Atmesti pasirinktus
          </button>
          <button
            onClick={() => setSelectedIds(new Map())}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors min-h-[44px] px-2"
          >
            Atšaukti
          </button>
        </div>
      )}

      {/* Reject modal (single item) */}
      {detailItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setDetailItem(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Atmesti įrašą</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{detailItem.name} ({ENTITY_LABELS[detailItem.entityType]})</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Įveskite atmetimo priežastį (privaloma)..."
              rows={3}
              maxLength={500}
              className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none resize-none"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => setDetailItem(null)} className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors min-h-[36px]">
                Atšaukti
              </button>
              <button
                onClick={() => updateStatus(detailItem.id, detailItem.entityType, 'REJECTED', rejectReason)}
                disabled={processing || !rejectReason.trim()}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition-colors min-h-[36px]"
              >
                {processing ? 'Vykdoma...' : 'Atmesti'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk verify confirmation modal */}
      {showBulkConfirm === 'verify' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowBulkConfirm(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Patvirtinti {selectedIds.size} įrašų?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Visi pasirinkti įrašai bus pažymėti kaip patvirtinti.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowBulkConfirm(null)} className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors min-h-[36px]">
                Atšaukti
              </button>
              <button
                onClick={() => executeBulk('VERIFIED')}
                disabled={processing}
                className="px-4 py-2 text-sm bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] disabled:opacity-50 font-medium transition-colors min-h-[36px]"
              >
                {processing ? 'Vykdoma...' : 'Patvirtinti'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk reject modal */}
      {showBulkRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowBulkRejectModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Atmesti {selectedIds.size} įrašų?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Įveskite bendrą atmetimo priežastį visiems pasirinktiems įrašams.</p>
            <textarea
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              placeholder="Atmetimo priežastis (privaloma)..."
              rows={3}
              maxLength={500}
              className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none resize-none"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => setShowBulkRejectModal(false)} className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors min-h-[36px]">
                Atšaukti
              </button>
              <button
                onClick={() => executeBulk('REJECTED', bulkRejectReason)}
                disabled={processing || !bulkRejectReason.trim()}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition-colors min-h-[36px]"
              >
                {processing ? 'Vykdoma...' : 'Atmesti'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
