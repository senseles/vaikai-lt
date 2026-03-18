'use client';

import { useState, useEffect, useCallback } from 'react';

interface AuditEntry {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  adminId: string;
  oldValue: string | null;
  newValue: string | null;
  details: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  REVIEW_APPROVE: 'Atsiliepimas patvirtintas',
  REVIEW_REJECT: 'Atsiliepimas atmestas',
  REVIEW_DELETE: 'Atsiliepimas ištrintas',
  ENTITY_CREATE: 'Objektas sukurtas',
  ENTITY_UPDATE: 'Objektas atnaujintas',
  ENTITY_DELETE: 'Objektas ištrintas',
  USER_BLOCK: 'Vartotojas užblokuotas',
  USER_UNBLOCK: 'Vartotojas atblokuotas',
  FORUM_LOCK: 'Forumas užrakintas',
  FORUM_DELETE: 'Forumo įrašas ištrintas',
  REPORT_REVIEW: 'Pranešimas peržiūrėtas',
};

const ACTION_COLORS: Record<string, string> = {
  REVIEW_APPROVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REVIEW_REJECT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REVIEW_DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ENTITY_CREATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ENTITY_UPDATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ENTITY_DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  USER_BLOCK: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  USER_UNBLOCK: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  FORUM_LOCK: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  FORUM_DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REPORT_REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (actionFilter) params.set('action', actionFilter);
      const res = await fetch(`/api/admin/audit?${params}`);
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      setEntries(json.data ?? []);
      setTotalPages(json.pagination?.totalPages ?? 1);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Nepavyko užkrauti audito įrašų</p>
        <button onClick={() => { setError(false); fetchLogs(); }} className="mt-3 text-sm text-primary hover:underline">
          Bandyti dar kartą
        </button>
      </div>
    );
  }

  const uniqueActions = Object.keys(ACTION_LABELS);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Audito žurnalas</h1>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2"
        >
          <option value="">Visi veiksmai</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Nėra audito įrašų</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
          {entries.map((entry) => (
            <div key={entry.id} className="px-4 py-3 flex items-start gap-3">
              <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap mt-0.5 ${ACTION_COLORS[entry.action] ?? 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'}`}>
                {ACTION_LABELS[entry.action] ?? entry.action}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-medium">{entry.targetType}</span>
                  <span className="text-gray-400 dark:text-gray-500 mx-1">#{entry.targetId.slice(0, 8)}</span>
                </p>
                {entry.details && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{entry.details}</p>
                )}
                {(entry.oldValue || entry.newValue) && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {entry.oldValue && <span className="line-through mr-2">{entry.oldValue}</span>}
                    {entry.newValue && <span>{entry.newValue}</span>}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(entry.createdAt).toLocaleDateString('lt-LT', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{entry.adminId}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Atgal
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Pirmyn
          </button>
        </div>
      )}
    </div>
  );
}
