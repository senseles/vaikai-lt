'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───

export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  /** Render function for custom cell display */
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  /** CSS class for the th/td */
  className?: string;
  /** Hide on mobile */
  hideOnMobile?: boolean;
}

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdminTableProps {
  readonly apiPath: string;
  readonly columns: ColumnDef[];
  readonly fields: FieldDef[];
  readonly entityLabel: string;
  readonly perPage?: number;
}

// ─── Sort Arrow ───

function SortArrow({ active, direction }: { readonly active: boolean; readonly direction: 'asc' | 'desc' }) {
  if (!active) return <span className="text-gray-300 dark:text-slate-600 ml-1 text-xs">↕</span>;
  return <span className="text-[#2d6a4f] dark:text-green-400 ml-1 text-xs">{direction === 'asc' ? '↑' : '↓'}</span>;
}

// ─── Phone validation ───

function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  const cleaned = phone.trim().replace(/[\s\-()]/g, '');
  return /^\+370\d{8}$/.test(cleaned) || /^8\d{8}$/.test(cleaned);
}

// ─── Debounce hook ───

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Item Form ───

function ItemForm({
  fields,
  editItem,
  apiPath,
  onSave,
  onCancel,
}: {
  readonly fields: FieldDef[];
  readonly editItem?: Record<string, unknown> | null;
  readonly apiPath: string;
  readonly onSave: () => void;
  readonly onCancel: () => void;
}) {
  const isEdit = !!editItem;

  const getInitial = () => {
    const data: Record<string, string> = {};
    for (const f of fields) {
      data[f.key] = editItem ? String(editItem[f.key] ?? '') : (f.type === 'select' && f.options ? f.options[0].value : '');
    }
    return data;
  };

  const [form, setForm] = useState<Record<string, string>>(getInitial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    for (const f of fields) {
      const val = form[f.key]?.trim() ?? '';
      if (f.required && !val) {
        errors[f.key] = `${f.label} yra privalomas laukas`;
      }
      if (f.key === 'phone' && val && !isValidPhone(val)) {
        errors[f.key] = 'Netinkamas telefono formatas (pvz. +37061234567)';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setSaving(true);

    const body: Record<string, unknown> = {};
    for (const f of fields) {
      const val = form[f.key]?.trim();
      if (!val) continue;
      body[f.key] = f.type === 'number' ? Number(val) : val;
    }

    try {
      const url = isEdit ? `${apiPath}/${editItem!.id}` : apiPath;
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        setError(data.error || 'Nepavyko išsaugoti');
        setSaving(false);
        return;
      }
      onSave();
    } catch {
      setError('Tinklo klaida');
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {isEdit ? 'Redaguoti' : 'Pridėti naują'}
        </h3>
        <button onClick={onCancel} className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Atšaukti</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3" noValidate>
        {fields.map((f) => (
          <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {f.type === 'select' && f.options ? (
              <select
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className={`w-full border ${fieldErrors[f.key] ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none`}
              >
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={3}
                className={`w-full border ${fieldErrors[f.key] ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none`}
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={`w-full border ${fieldErrors[f.key] ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none`}
              />
            )}
            {fieldErrors[f.key] && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors[f.key]}</p>
            )}
          </div>
        ))}

        {error && <p className="sm:col-span-2 text-red-500 text-sm">{error}</p>}

        <div className="sm:col-span-2 flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 text-sm bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] disabled:opacity-50 font-medium transition-colors"
          >
            {saving ? 'Saugoma...' : isEdit ? 'Atnaujinti' : 'Pridėti'}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            Atšaukti
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Delete Confirmation Modal ───

function DeleteConfirmDialog({
  itemName,
  onConfirm,
  onCancel,
}: {
  readonly itemName: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="fixed inset-0 bg-black/30" />
      <div
        ref={dialogRef}
        className="relative bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-red-600 dark:text-red-400 text-xl">!</span>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center mb-2">Patvirtinkite ištrynimą</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">
          Ar tikrai norite ištrinti <strong className="text-gray-700 dark:text-gray-200">{itemName}</strong>? Šis veiksmas negrįžtamas.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition-colors"
          >
            Atšaukti
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Ištrinti
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Card View ───

function MobileCardView({
  items,
  columns,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDeleteRequest,
}: {
  readonly items: Record<string, unknown>[];
  readonly columns: ColumnDef[];
  readonly selectedIds: Set<string>;
  readonly onToggleSelect: (id: string) => void;
  readonly onEdit: (item: Record<string, unknown>) => void;
  readonly onDeleteRequest: (item: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const id = String(item.id);
        const isSelected = selectedIds.has(id);
        // First column is the primary field (name)
        const primaryCol = columns[0];
        const primaryValue = primaryCol?.render
          ? primaryCol.render(item[primaryCol.key], item)
          : String(item[primaryCol?.key] ?? '—');

        return (
          <div
            key={id}
            className={`bg-white dark:bg-slate-800 rounded-xl border transition-all duration-200 p-4 ${
              isSelected ? 'border-[#2d6a4f] ring-1 ring-[#2d6a4f]/20' : 'border-gray-200 dark:border-slate-700'
            }`}
          >
            {/* Card header with checkbox and primary field */}
            <div className="flex items-start gap-3 mb-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(id)}
                className="rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f] mt-0.5 w-4 h-4 flex-shrink-0"
                aria-label={`Pasirinkti ${String(item.name ?? '')}`}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{primaryValue}</div>
              </div>
            </div>

            {/* Secondary fields */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm pl-7 mb-3">
              {columns.slice(1).map((col) => {
                const value = col.render
                  ? col.render(item[col.key], item)
                  : String(item[col.key] ?? '—');
                return (
                  <div key={col.key}>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block">{col.label}</span>
                    <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pl-7 pt-2 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => onEdit(item)}
                className="px-3 py-1.5 text-xs bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] font-medium transition-colors min-h-[32px]"
              >
                Redaguoti
              </button>
              <button
                onClick={() => onDeleteRequest(item)}
                className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors min-h-[32px]"
              >
                Ištrinti
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main AdminTable Component ───

export default function AdminTable({ apiPath, columns, fields, entityLabel, perPage = 25 }: AdminTableProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: String(page),
        limit: String(perPage),
        sort: sortBy,
        dir: sortDir,
      });
      const res = await fetch(`${apiPath}?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? data);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [search, page, sortBy, sortDir, apiPath, perPage]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSelectedIds(new Set()); }, [items]);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [search]);

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Auto-dismiss messages
  useEffect(() => {
    if (!actionSuccess) return;
    const timer = setTimeout(() => setActionSuccess(''), 3000);
    return () => clearTimeout(timer);
  }, [actionSuccess]);

  const deleteItem = async (id: string) => {
    setActionError('');
    try {
      const res = await fetch(`${apiPath}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setActionError(data?.error ?? 'Nepavyko istrinti iraso');
        setDeleteTarget(null);
        return;
      }
      setActionSuccess('Irasas istrintas');
    } catch {
      setActionError('Tinklo klaida istrynimo metu');
    }
    setDeleteTarget(null);
    load();
  };

  const handleEdit = (item: Record<string, unknown>) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditItem(null);
    load();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleColumnSort = (column: string) => {
    if (sortBy === column) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(String(item.id)));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => String(item.id))));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Ar tikrai norite istrinti ${selectedIds.size} irasu? Sis veiksmas negriztamas.`)) return;
    setActionError('');
    const results = await Promise.all(
      Array.from(selectedIds).map((id) => fetch(`${apiPath}/${id}`, { method: 'DELETE' }).then((r) => r.ok))
    );
    const failedCount = results.filter((ok) => !ok).length;
    if (failedCount > 0) {
      setActionError(`Nepavyko istrinti ${failedCount} is ${selectedIds.size} irasu`);
    } else {
      setActionSuccess(`${selectedIds.size} irasu istrinta`);
    }
    setSelectedIds(new Set());
    load();
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const renderPaginationButtons = () => {
    const buttons: React.ReactNode[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
            i === page
              ? 'bg-[#2d6a4f] text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div>
      {/* Action messages */}
      {actionError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600 ml-2 p-1" aria-label="Uzdaryti">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      {actionSuccess && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-green-400 hover:text-green-600 ml-2 p-1" aria-label="Uzdaryti">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirmDialog
          itemName={String(deleteTarget.name ?? 'šį įrašą')}
          onConfirm={() => deleteItem(String(deleteTarget.id))}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Top bar: search + add */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={`Ieškoti ${entityLabel.toLowerCase()}...`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Išvalyti paiešką"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="px-4 py-2.5 text-sm bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <span>+</span> Pridėti naują
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <ItemForm
          fields={fields}
          editItem={editItem}
          apiPath={apiPath}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f]"
                      aria-label="Pasirinkti visus"
                    />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 ${col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''} ${col.hideOnMobile ? 'hidden md:table-cell' : ''} ${col.className || ''}`}
                      onClick={() => col.sortable !== false && handleColumnSort(col.key)}
                    >
                      {col.label}
                      {col.sortable !== false && <SortArrow active={sortBy === col.key} direction={sortDir} />}
                    </th>
                  ))}
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-32">Veiksmai</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                      <div className="inline-block w-5 h-5 border-2 border-gray-300 dark:border-slate-600 border-t-[#2d6a4f] rounded-full animate-spin" />
                      <p className="mt-2">Kraunama...</p>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-16 text-center">
                      <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Nėra duomenų</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        {searchInput ? 'Bandykite pakeisti paieškos užklausą' : 'Pridėkite pirmą įrašą paspausdami mygtuką viršuje'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={String(item.id)}
                      className={`border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                        index % 2 === 1 ? 'bg-gray-50/50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'
                      } ${selectedIds.has(String(item.id)) ? 'bg-green-50/50 dark:bg-green-900/20' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(String(item.id))}
                          onChange={() => toggleSelectItem(String(item.id))}
                          className="rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f]"
                          aria-label={`Pasirinkti ${String(item.name ?? '')}`}
                        />
                      </td>
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 ${col.hideOnMobile ? 'hidden md:table-cell' : ''} ${col.className || ''}`}
                        >
                          {col.render
                            ? col.render(item[col.key], item)
                            : <span className="text-gray-700 dark:text-gray-300">{String(item[col.key] ?? '—')}</span>
                          }
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-[#2d6a4f] hover:text-[#40916c] text-sm font-medium transition-colors mr-3"
                        >
                          Redaguoti
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="text-red-500 hover:text-red-700 text-sm transition-colors"
                        >
                          Ištrinti
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View (visible only on mobile) */}
      <div className="md:hidden">
        {loading && items.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Nėra duomenų</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              {searchInput ? 'Bandykite pakeisti paieškos užklausą' : 'Pridėkite pirmą įrašą'}
            </p>
          </div>
        ) : (
          <>
            {/* Select all on mobile */}
            <div className="flex items-center gap-3 mb-3 px-1">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f] w-4 h-4"
                aria-label="Pasirinkti visus"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedIds.size > 0 ? `Pasirinkta: ${selectedIds.size}` : `Rodoma: ${items.length} iš ${total}`}
              </span>
            </div>
            <MobileCardView
              items={items}
              columns={columns}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelectItem}
              onEdit={handleEdit}
              onDeleteRequest={(item) => setDeleteTarget(item)}
            />
          </>
        )}
      </div>

      {/* Pagination */}
      {total > perPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rodoma {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} iš {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="w-8 h-8 text-sm border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 rounded-lg disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              ‹
            </button>
            {renderPaginationButtons()}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="w-8 h-8 text-sm border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 rounded-lg disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg px-4 py-3 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Pasirinkta: {selectedIds.size}
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-2 min-h-[44px] text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Ištrinti ({selectedIds.size})
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
