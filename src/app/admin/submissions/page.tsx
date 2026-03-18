'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  entityType: 'KINDERGARTEN' | 'AUKLE' | 'BURELIS' | 'SPECIALIST';
  data: Record<string, string>;
  submitterName: string;
  submitterEmail: string | null;
  submitterPhone: string | null;
  submitterIp: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdEntityId: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  KINDERGARTEN: 'Darželis',
  AUKLE: 'Auklė',
  BURELIS: 'Būrelis',
  SPECIALIST: 'Specialistas',
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Laukia',
  APPROVED: 'Patvirtintas',
  REJECTED: 'Atmestas',
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('entityType', typeFilter);

      const res = await fetch(`/api/admin/submissions?${params}`);
      const json = await res.json();
      if (json.success) {
        setSubmissions(json.data);
        setTotal(json.total);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  async function handleAction(action: 'approve' | 'reject') {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          adminNotes: adminNotes || undefined,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelected(null);
        setShowRejectDialog(false);
        setAdminNotes('');
        setRejectionReason('');
        fetchSubmissions();
      } else {
        alert(json.error || 'Klaida');
      }
    } catch {
      alert('Tinklo klaida');
    } finally {
      setActionLoading(false);
    }
  }

  const totalPages = Math.ceil(total / 20);
  const inputCls = 'w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pasiūlymai</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Vartotojų pateikti pasiūlymai pridėti naujus įrašus</p>
        </div>
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          &larr; Grįžti
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
          >
            {s === '' ? 'Visi' : STATUS_LABELS[s]}
          </button>
        ))}
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-0 outline-none"
        >
          <option value="">Visi tipai</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Total count */}
      <p className="text-xs text-gray-400 mb-3">Iš viso: {total}</p>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Kraunama...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Pasiūlymų nerasta.</div>
      ) : (
        <div className="space-y-2">
          {submissions.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelected(s); setAdminNotes(s.adminNotes || ''); }}
              className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[s.status]}`}>
                    {STATUS_LABELS[s.status]}
                  </span>
                  <span className="text-xs text-gray-400">{TYPE_LABELS[s.entityType]}</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {s.data.name || '—'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(s.createdAt).toLocaleDateString('lt-LT')}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Pateikė: {s.submitterName} {s.data.city && `• ${s.data.city}`}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 disabled:opacity-30"
          >
            &larr;
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 disabled:opacity-30"
          >
            &rarr;
          </button>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pasiūlymo detalės</h2>
              <button onClick={() => { setSelected(null); setShowRejectDialog(false); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[selected.status]}`}>
                  {STATUS_LABELS[selected.status]}
                </span>
                <span className="text-xs text-gray-400">{TYPE_LABELS[selected.entityType]}</span>
              </div>

              {Object.entries(selected.data).map(([key, value]) => (
                <div key={key}>
                  <span className="text-xs text-gray-400 uppercase">{key}</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{String(value)}</p>
                </div>
              ))}

              <hr className="border-gray-200 dark:border-slate-700" />
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p><strong>Pateikė:</strong> {selected.submitterName}</p>
                {selected.submitterEmail && <p><strong>El. paštas:</strong> {selected.submitterEmail}</p>}
                {selected.submitterPhone && <p><strong>Telefonas:</strong> {selected.submitterPhone}</p>}
                {selected.submitterIp && <p><strong>IP:</strong> {selected.submitterIp}</p>}
                <p><strong>Data:</strong> {new Date(selected.createdAt).toLocaleString('lt-LT')}</p>
              </div>

              {selected.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">Atmetimo priežastis:</span>
                  <p className="text-sm text-red-700 dark:text-red-300">{selected.rejectionReason}</p>
                </div>
              )}
            </div>

            {selected.status === 'PENDING' && (
              <>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Admin pastabos</label>
                  <textarea className={inputCls} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} />
                </div>

                {showRejectDialog ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Atmetimo priežastis</label>
                      <textarea className={inputCls} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={2} placeholder="Paaiškinkite, kodėl atmetate..." />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction('reject')}
                        disabled={actionLoading}
                        className="flex-1 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                      >
                        {actionLoading ? '...' : 'Atmesti'}
                      </button>
                      <button
                        onClick={() => setShowRejectDialog(false)}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      >
                        Atšaukti
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      {actionLoading ? '...' : 'Patvirtinti'}
                    </button>
                    <button
                      onClick={() => setShowRejectDialog(true)}
                      className="flex-1 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-sm"
                    >
                      Atmesti
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
