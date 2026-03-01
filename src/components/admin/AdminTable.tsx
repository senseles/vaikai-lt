'use client';

import { useState, useEffect, useCallback } from 'react';

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
  if (!active) return <span className="text-gray-300 ml-1 text-xs">↕</span>;
  return <span className="text-[#2d6a4f] ml-1 text-xs">{direction === 'asc' ? '↑' : '↓'}</span>;
}

// ─── Phone validation ───

function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  const cleaned = phone.trim().replace(/[\s\-()]/g, '');
  return /^\+370\d{8}$/.test(cleaned) || /^8\d{8}$/.test(cleaned);
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
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {isEdit ? 'Redaguoti' : 'Pridėti naują'}
        </h3>
        <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600">Atšaukti</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3" noValidate>
        {fields.map((f) => (
          <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {f.type === 'select' && f.options ? (
              <select
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className={`w-full border ${fieldErrors[f.key] ? 'border-red-400' : 'border-gray-200'} bg-white text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none`}
              >
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={3}
                className={`w-full border ${fieldErrors[f.key] ? 'border-red-400' : 'border-gray-200'} bg-white text-gray-900 rounded-lg px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none`}
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={`w-full border ${fieldErrors[f.key] ? 'border-red-400' : 'border-gray-200'} bg-white text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none`}
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
          <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Atšaukti
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main AdminTable Component ───

export default function AdminTable({ apiPath, columns, fields, entityLabel, perPage = 25 }: AdminTableProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const deleteItem = async (id: string) => {
    await fetch(`${apiPath}/${id}`, { method: 'DELETE' });
    setDeleteConfirmId(null);
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
    if (!confirm(`Ar tikrai norite ištrinti ${selectedIds.size} įrašų?`)) return;
    await Promise.all(
      Array.from(selectedIds).map((id) => fetch(`${apiPath}/${id}`, { method: 'DELETE' }))
    );
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
              : 'text-gray-600 hover:bg-gray-100'
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
      {/* Top bar: search + add */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">&#128269;</span>
          <input
            type="text"
            placeholder={`Ieškoti ${entityLabel.toLowerCase()}...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="px-4 py-2.5 text-sm bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
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
                    className={`text-left px-4 py-3 font-medium text-gray-500 ${col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700' : ''} ${col.hideOnMobile ? 'hidden md:table-cell' : ''} ${col.className || ''}`}
                    onClick={() => col.sortable !== false && handleColumnSort(col.key)}
                  >
                    {col.label}
                    {col.sortable !== false && <SortArrow active={sortBy === col.key} direction={sortDir} />}
                  </th>
                ))}
                <th className="text-right px-4 py-3 font-medium text-gray-500 w-32">Veiksmai</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-gray-400">
                    <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-[#2d6a4f] rounded-full animate-spin" />
                    <p className="mt-2">Kraunama...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-gray-400">
                    Nėra duomenų
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={String(item.id)}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      index % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
                    } ${selectedIds.has(String(item.id)) ? 'bg-green-50/50' : ''}`}
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
                          : <span className="text-gray-700">{String(item[col.key] ?? '—')}</span>
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
                      {deleteConfirmId === String(item.id) ? (
                        <span className="inline-flex items-center gap-1">
                          <button
                            onClick={() => deleteItem(String(item.id))}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Taip
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            Ne
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(String(item.id))}
                          className="text-red-500 hover:text-red-700 text-sm transition-colors"
                        >
                          Ištrinti
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
        <p className="text-sm text-gray-500">
          Rodoma {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} iš {total}
        </p>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="w-8 h-8 text-sm border border-gray-200 text-gray-600 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            ‹
          </button>
          {renderPaginationButtons()}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="w-8 h-8 text-sm border border-gray-200 text-gray-600 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm font-medium text-gray-700">
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
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] px-2"
          >
            Atšaukti
          </button>
        </div>
      )}
    </div>
  );
}
