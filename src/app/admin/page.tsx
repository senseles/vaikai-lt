'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Review, ItemType } from '@/types';
import StarRating from '@/components/StarRating';

interface Stats {
  kindergartens: number;
  aukles: number;
  bureliai: number;
  specialists: number;
  reviews: number;
  pendingReviews: number;
}

type Tab = 'dashboard' | 'kindergartens' | 'aukles' | 'bureliai' | 'specialists' | 'reviews';

// ─── Form field definitions per item type ───

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

const FIELDS: Record<ItemType, FieldDef[]> = {
  kindergarten: [
    { key: 'name', label: 'Pavadinimas', type: 'text', required: true, placeholder: 'Darželio pavadinimas' },
    { key: 'city', label: 'Miestas', type: 'text', required: true, placeholder: 'Vilnius' },
    { key: 'type', label: 'Tipas', type: 'select', options: [{ value: 'valstybinis', label: 'Valstybinis' }, { value: 'privatus', label: 'Privatus' }] },
    { key: 'address', label: 'Adresas', type: 'text', placeholder: 'Gatvė 1' },
    { key: 'phone', label: 'Telefonas', type: 'text', placeholder: '+370 ...' },
    { key: 'website', label: 'Svetainė', type: 'text', placeholder: 'https://...' },
    { key: 'language', label: 'Kalba', type: 'text', placeholder: 'Lietuvių' },
    { key: 'ageFrom', label: 'Amžius nuo (metai)', type: 'number' },
    { key: 'groups', label: 'Grupių skaičius', type: 'number' },
    { key: 'hours', label: 'Darbo laikas', type: 'text', placeholder: '7:00 – 18:00' },
    { key: 'description', label: 'Aprašymas', type: 'textarea' },
  ],
  aukle: [
    { key: 'name', label: 'Vardas', type: 'text', required: true, placeholder: 'Vardas Pavardė' },
    { key: 'city', label: 'Miestas', type: 'text', required: true, placeholder: 'Vilnius' },
    { key: 'phone', label: 'Telefonas', type: 'text', placeholder: '+370 ...' },
    { key: 'email', label: 'El. paštas', type: 'text', placeholder: 'el@pastas.lt' },
    { key: 'experience', label: 'Patirtis', type: 'text', placeholder: '5 metai' },
    { key: 'ageRange', label: 'Amžiaus grupė', type: 'text', placeholder: '1-6 m.' },
    { key: 'hourlyRate', label: 'Valandinis tarifas', type: 'text', placeholder: '15 €/val.' },
    { key: 'languages', label: 'Kalbos', type: 'text', placeholder: 'Lietuvių, anglų' },
    { key: 'availability', label: 'Prieinamumas', type: 'text', placeholder: 'Darbo dienomis' },
    { key: 'description', label: 'Aprašymas', type: 'textarea' },
  ],
  burelis: [
    { key: 'name', label: 'Pavadinimas', type: 'text', required: true, placeholder: 'Būrelio pavadinimas' },
    { key: 'city', label: 'Miestas', type: 'text', required: true, placeholder: 'Vilnius' },
    { key: 'category', label: 'Kategorija', type: 'text', placeholder: 'Menai, sportas...' },
    { key: 'subcategory', label: 'Subkategorija', type: 'text', placeholder: 'Piešimas, futbolas...' },
    { key: 'ageRange', label: 'Amžiaus grupė', type: 'text', placeholder: '5-12 m.' },
    { key: 'price', label: 'Kaina', type: 'text', placeholder: '50 €/mėn.' },
    { key: 'schedule', label: 'Tvarkaraštis', type: 'text', placeholder: 'Pirm., Treč. 16:00' },
    { key: 'phone', label: 'Telefonas', type: 'text', placeholder: '+370 ...' },
    { key: 'website', label: 'Svetainė', type: 'text', placeholder: 'https://...' },
    { key: 'description', label: 'Aprašymas', type: 'textarea' },
  ],
  specialist: [
    { key: 'name', label: 'Vardas', type: 'text', required: true, placeholder: 'Vardas Pavardė' },
    { key: 'city', label: 'Miestas', type: 'text', required: true, placeholder: 'Vilnius' },
    { key: 'specialty', label: 'Specializacija', type: 'text', placeholder: 'Logopedas, psichologas...' },
    { key: 'clinic', label: 'Klinika', type: 'text', placeholder: 'Klinikos pavadinimas' },
    { key: 'price', label: 'Kaina', type: 'text', placeholder: '40 €/vizitas' },
    { key: 'phone', label: 'Telefonas', type: 'text', placeholder: '+370 ...' },
    { key: 'website', label: 'Svetainė', type: 'text', placeholder: 'https://...' },
    { key: 'languages', label: 'Kalbos', type: 'text', placeholder: 'Lietuvių, anglų' },
    { key: 'description', label: 'Aprašymas', type: 'textarea' },
  ],
};

// ─── Phone validation helper ───

function isValidPhone(phone: string): boolean {
  if (!phone) return true; // phone is optional
  const trimmed = phone.trim();
  // +370XXXXXXXX or 8XXXXXXXX format
  const internationalPattern = /^\+370\d{8}$/;
  const localPattern = /^8\d{8}$/;
  // Also allow formatted versions with spaces/dashes
  const cleaned = trimmed.replace(/[\s\-()]/g, '');
  return internationalPattern.test(cleaned) || localPattern.test(cleaned);
}

// ─── Main Admin Page ───

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Neteisingas slaptažodis');
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    const controller = new AbortController();
    fetch('/api/admin/stats', { signal: controller.signal })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data;
          setStats({
            kindergartens: d.kindergartenCount ?? 0,
            aukles: d.aukleCount ?? 0,
            bureliai: d.burelisCount ?? 0,
            specialists: d.specialistCount ?? 0,
            reviews: d.reviewCount ?? 0,
            pendingReviews: d.pendingReviewCount ?? 0,
          });
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
        <form onSubmit={login} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700 max-w-sm w-full space-y-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Administravimas</h1>
          <input
            type="password"
            placeholder="Slaptažodis"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
          {loginError && <p className="text-red-500 dark:text-red-400 text-sm">{loginError}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
            Prisijungti
          </button>
        </form>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Suvestin\u0117', icon: '\u{1F4CA}' },
    { key: 'kindergartens', label: 'Dar\u017eeliai', icon: '\u{1F3EB}' },
    { key: 'aukles', label: 'Aukl\u0117s', icon: '\u{1F469}\u200D\u{1F467}' },
    { key: 'bureliai', label: 'B\u016breliai', icon: '\u{1F3A8}' },
    { key: 'specialists', label: 'Specialistai', icon: '\u{1F468}\u200D\u2695\uFE0F' },
    { key: 'reviews', label: 'Atsiliepimai', icon: '\u2B50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Vaikai.lt Admin</h1>
          <button onClick={() => setAuthenticated(false)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            Atsijungti
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4" aria-label="Navigacija">
          <Link href="/" className="hover:text-primary transition-colors">Prad\u017eia</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Administravimas</span>
        </nav>

        <nav className="flex gap-1 overflow-x-auto mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'dashboard' && <Dashboard stats={stats} />}
        {activeTab === 'kindergartens' && <CrudTable itemType="kindergarten" label="Dar\u017eeliai" />}
        {activeTab === 'aukles' && <CrudTable itemType="aukle" label="Aukl\u0117s" />}
        {activeTab === 'bureliai' && <CrudTable itemType="burelis" label="B\u016breliai" />}
        {activeTab === 'specialists' && <CrudTable itemType="specialist" label="Specialistai" />}
        {activeTab === 'reviews' && <ReviewModeration />}
      </div>
    </div>
  );
}

// ─── Dashboard ───

function Dashboard({ stats }: { readonly stats: Stats | null }) {
  if (!stats) return <p className="text-gray-400">Kraunama...</p>;

  const cards = [
    { label: 'Dar\u017eeliai', count: stats.kindergartens, icon: '\u{1F3EB}', color: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800', textColor: 'text-blue-700 dark:text-blue-300', iconBg: 'bg-blue-100 dark:bg-blue-900/50' },
    { label: 'Aukl\u0117s', count: stats.aukles, icon: '\u{1F469}\u200D\u{1F467}', color: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800', textColor: 'text-green-700 dark:text-green-300', iconBg: 'bg-green-100 dark:bg-green-900/50' },
    { label: 'B\u016breliai', count: stats.bureliai, icon: '\u{1F3A8}', color: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800', textColor: 'text-orange-700 dark:text-orange-300', iconBg: 'bg-orange-100 dark:bg-orange-900/50' },
    { label: 'Specialistai', count: stats.specialists, icon: '\u{1F468}\u200D\u2695\uFE0F', color: 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800', textColor: 'text-teal-700 dark:text-teal-300', iconBg: 'bg-teal-100 dark:bg-teal-900/50' },
    { label: 'Atsiliepimai', count: stats.reviews, icon: '\u{1F4AC}', color: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800', textColor: 'text-purple-700 dark:text-purple-300', iconBg: 'bg-purple-100 dark:bg-purple-900/50' },
    { label: 'Laukia patvirtinimo', count: stats.pendingReviews, icon: '\u{23F3}', color: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800', textColor: 'text-red-700 dark:text-red-300', iconBg: 'bg-red-100 dark:bg-red-900/50' },
  ];

  const exportData = async (format: 'json' | 'csv') => {
    const res = await fetch(`/api/admin/export?format=${format}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaikai-export.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-4 border ${c.color} flex items-start gap-3`}>
            <div className={`rounded-lg p-2 text-xl ${c.iconBg}`}>
              {c.icon}
            </div>
            <div>
              <p className={`text-2xl font-bold ${c.textColor}`}>{c.count}</p>
              <p className={`text-sm ${c.textColor} opacity-80`}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => exportData('json')} className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          Eksportuoti JSON
        </button>
        <button onClick={() => exportData('csv')} className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          Eksportuoti CSV
        </button>
      </div>
    </div>
  );
}

// ─── Item Form (Create / Edit) with validation ───

interface ItemFormProps {
  readonly itemType: ItemType;
  readonly editItem?: Record<string, unknown> | null;
  readonly onSave: () => void;
  readonly onCancel: () => void;
}

function ItemForm({ itemType, editItem, onSave, onCancel }: ItemFormProps) {
  const fields = FIELDS[itemType];
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
    // Clear field error on change
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

      // Required field validation
      if (f.required && !val) {
        errors[f.key] = `${f.label} yra privalomas laukas`;
      }

      // Phone validation
      if (f.key === 'phone' && val && !isValidPhone(val)) {
        errors[f.key] = 'Telefonas turi prasid\u0117ti +370 arba 8 ir tur\u0117ti 8 skaitmenis (pvz. +37061234567 arba 861234567)';
      }

      // Rating range validation (for number fields that look like ratings)
      if (f.key === 'baseRating' && val) {
        const num = Number(val);
        if (isNaN(num) || num < 1 || num > 5) {
          errors[f.key] = '\u012evertinimas turi b\u016bti nuo 1 iki 5';
        }
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

    // Build body with proper types
    const body: Record<string, unknown> = {};
    for (const f of fields) {
      const val = form[f.key]?.trim();
      if (!val) continue;
      if (f.type === 'number') {
        body[f.key] = Number(val);
      } else {
        body[f.key] = val;
      }
    }

    try {
      const url = isEdit ? `/api/admin/${itemType}/${editItem!.id}` : `/api/admin/${itemType}`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        setError(data.error || 'Nepavyko i\u0161saugoti');
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
    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {isEdit ? 'Redaguoti' : 'Prid\u0117ti nauj\u0105'}
        </h3>
        <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">Atsaukti</button>
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
                className={`w-full border ${fieldErrors[f.key] ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm`}
              >
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={3}
                className={`w-full border ${fieldErrors[f.key] ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm resize-none`}
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={`w-full border ${fieldErrors[f.key] ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm`}
              />
            )}
            {fieldErrors[f.key] && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{fieldErrors[f.key]}</p>
            )}
          </div>
        ))}

        {error && <p className="sm:col-span-2 text-red-500 dark:text-red-400 text-sm">{error}</p>}

        <div className="sm:col-span-2 flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
          >
            {saving ? 'Saugoma...' : isEdit ? 'Atnaujinti' : 'Prid\u0117ti'}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            Atsaukti
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Sort arrow indicator ───

function SortArrow({ active, direction }: { readonly active: boolean; readonly direction: 'asc' | 'desc' }) {
  if (!active) {
    return <span className="text-gray-300 dark:text-gray-600 ml-1">{'\u2195'}</span>;
  }
  return <span className="text-blue-500 ml-1">{direction === 'asc' ? '\u2191' : '\u2193'}</span>;
}

// ─── CRUD Table with Create/Edit, Bulk Actions, Better UX ───

function CrudTable({ itemType }: { readonly itemType: ItemType; readonly label: string }) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const perPage = 20;

  const load = useCallback(async () => {
    const params = new URLSearchParams({ search, page: String(page), limit: String(perPage), sort: sortBy });
    const res = await fetch(`/api/admin/${itemType}?${params}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? data);
      setTotal(data.total ?? 0);
    }
  }, [search, page, sortBy, itemType]);

  useEffect(() => { load(); }, [load]);

  // Clear selection when data changes
  useEffect(() => { setSelectedIds(new Set()); }, [items]);

  const deleteItem = async (id: string) => {
    if (!confirm('Ar tikrai norite i\u0161trinti?')) return;
    await fetch(`/api/admin/${itemType}/${id}`, { method: 'DELETE' });
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

  // Bulk selection
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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Ar tikrai norite i\u0161trinti ${selectedIds.size} \u012fra\u0161\u0173?`)) return;
    const promises = Array.from(selectedIds).map((id) =>
      fetch(`/api/admin/${itemType}/${id}`, { method: 'DELETE' })
    );
    await Promise.all(promises);
    setSelectedIds(new Set());
    load();
  };

  const handleBulkExport = () => {
    if (selectedIds.size === 0) return;
    const selectedItems = items.filter((item) => selectedIds.has(String(item.id)));
    const blob = new Blob([JSON.stringify(selectedItems, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itemType}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sort items locally for display (API sort is primary, this adds direction)
  const sortedItems = [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = typeof aVal === 'number' && typeof bVal === 'number'
      ? aVal - bVal
      : String(aVal).localeCompare(String(bVal), 'lt');
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Ie\u0161koti..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap transition-colors"
        >
          + Prid\u0117ti
        </button>
      </div>

      {showForm && (
        <ItemForm
          itemType={itemType}
          editItem={editItem}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                    aria-label="Pasirinkti visus"
                  />
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleColumnSort('name')}
                >
                  Pavadinimas
                  <SortArrow active={sortBy === 'name'} direction={sortDir} />
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleColumnSort('city')}
                >
                  Miestas
                  <SortArrow active={sortBy === 'city'} direction={sortDir} />
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleColumnSort('baseRating')}
                >
                  \u012evertinimas
                  <SortArrow active={sortBy === 'baseRating'} direction={sortDir} />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Apra\u0161ymas</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Veiksmai</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, index) => (
                <tr
                  key={String(item.id)}
                  className={`border-b border-gray-50 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors cursor-default ${
                    index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/50 dark:bg-slate-800/50'
                  } ${selectedIds.has(String(item.id)) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(String(item.id))}
                      onChange={() => toggleSelectItem(String(item.id))}
                      className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                      aria-label={`Pasirinkti ${String(item.name ?? '')}`}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-gray-900 dark:text-white font-medium">{String(item.name ?? '')}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{String(item.city ?? '')}</td>
                  <td className="px-4 py-2.5">
                    <StarRating rating={Number(item.baseRating ?? 0)} size="sm" />
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    <span className="block max-w-xs truncate" title={String(item.description ?? '')}>
                      {String(item.description ?? '\u2014')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 text-sm transition-colors">
                      Redaguoti
                    </button>
                    <button onClick={() => deleteItem(String(item.id))} className="text-red-500 hover:text-red-700 text-sm transition-colors">
                      I\u0161trinti
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">N\u0117ra duomen\u0173</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">Viso: {total} | Puslapis {page}/{totalPages}</p>
        <div className="flex gap-1">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 text-sm border dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">{'\u2190'}</button>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 text-sm border dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">{'\u2192'}</button>
        </div>
      </div>

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-xl shadow-lg px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Pasirinkta: {selectedIds.size}
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            I\u0161trinti ({selectedIds.size})
          </button>
          <button
            onClick={handleBulkExport}
            className="px-4 py-1.5 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 font-medium transition-colors"
          >
            Eksportuoti
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            Atsaukti
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Review Moderation ───

function ReviewModeration() {
  const [reviews, setReviews] = useState<Review[]>([]);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/reviews?pending=true');
    if (res.ok) setReviews(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const [actionError, setActionError] = useState('');

  const action = async (id: string, act: 'approve' | 'delete') => {
    setActionError('');
    try {
      const res = act === 'approve'
        ? await fetch(`/api/admin/reviews/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: true }) })
        : await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Klaida: ${res.status}`);
      load();
    } catch {
      setActionError('Nepavyko atlikti veiksmo. Bandykite dar kart\u0105.');
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">Laukiantys patvirtinimo</h3>
      {actionError && <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{actionError}</p>}
      {reviews.length === 0 && <p className="text-sm text-gray-400">N\u0117ra laukian\u010di\u0173 atsiliepimu\u0173.</p>}
      {reviews.map((r) => (
        <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">{r.authorName}</span>
              <span className="text-xs text-gray-400 ml-2">{r.itemType} {'\u00B7'} {new Date(r.createdAt).toLocaleDateString('lt-LT')}</span>
            </div>
            <StarRating rating={r.rating} size="sm" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.text}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => action(r.id, 'approve')} className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Patvirtinti
            </button>
            <button onClick={() => action(r.id, 'delete')} className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
              I\u0161trinti
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
