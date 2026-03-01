'use client';

import { useState, useEffect, useCallback } from 'react';
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
    fetch('/api/admin/stats')
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
          {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
            Prisijungti
          </button>
        </form>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Suvestinė' },
    { key: 'kindergartens', label: 'Darželiai' },
    { key: 'aukles', label: 'Auklės' },
    { key: 'bureliai', label: 'Būreliai' },
    { key: 'specialists', label: 'Specialistai' },
    { key: 'reviews', label: 'Atsiliepimai' },
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
        <nav className="flex gap-1 overflow-x-auto mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'dashboard' && <Dashboard stats={stats} />}
        {activeTab === 'kindergartens' && <CrudTable itemType="kindergarten" label="Darželiai" />}
        {activeTab === 'aukles' && <CrudTable itemType="aukle" label="Auklės" />}
        {activeTab === 'bureliai' && <CrudTable itemType="burelis" label="Būreliai" />}
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
    { label: 'Darželiai', count: stats.kindergartens, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    { label: 'Auklės', count: stats.aukles, color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    { label: 'Būreliai', count: stats.bureliai, color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
    { label: 'Specialistai', count: stats.specialists, color: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
    { label: 'Atsiliepimai', count: stats.reviews, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
    { label: 'Laukia patvirtinimo', count: stats.pendingReviews, color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-4 ${c.color}`}>
            <p className="text-2xl font-bold">{c.count}</p>
            <p className="text-sm">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => exportData('json')} className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
          Eksportuoti JSON
        </button>
        <button onClick={() => exportData('csv')} className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
          Eksportuoti CSV
        </button>
      </div>
    </div>
  );
}

// ─── Item Form (Create / Edit) ───

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

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

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
    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {isEdit ? 'Redaguoti' : 'Pridėti naują'}
        </h3>
        <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">Atšaukti</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {f.type === 'select' && f.options ? (
              <select
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm"
              >
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={3}
                className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm resize-none"
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                required={f.required}
                className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm"
              />
            )}
          </div>
        ))}

        {error && <p className="sm:col-span-2 text-red-500 text-sm">{error}</p>}

        <div className="sm:col-span-2 flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Saugoma...' : isEdit ? 'Atnaujinti' : 'Pridėti'}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
            Atšaukti
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── CRUD Table with Create/Edit ───

function CrudTable({ itemType, label }: { readonly itemType: ItemType; readonly label: string }) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
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

  const deleteItem = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti?')) return;
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

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Ieškoti..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white">
          <option value="name">Pavadinimas</option>
          <option value="city">Miestas</option>
          <option value="baseRating">Įvertinimas</option>
        </select>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
        >
          + Pridėti {label.toLowerCase().slice(0, -1) === 'darželiai'.slice(0, -1) ? '' : ''}
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
                <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Pavadinimas</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Miestas</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Įvertinimas</th>
                <th className="text-right px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Veiksmai</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={String(item.id)} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{String(item.name ?? '')}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{String(item.city ?? '')}</td>
                  <td className="px-4 py-2">
                    <StarRating rating={Number(item.baseRating ?? 0)} size="sm" />
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 text-sm">
                      Redaguoti
                    </button>
                    <button onClick={() => deleteItem(String(item.id))} className="text-red-500 hover:text-red-700 text-sm">
                      Ištrinti
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nėra duomenų</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">Viso: {total} | Puslapis {page}/{totalPages}</p>
        <div className="flex gap-1">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 text-sm border dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-30">←</button>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 text-sm border dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-30">→</button>
        </div>
      </div>
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

  const action = async (id: string, act: 'approve' | 'delete') => {
    if (act === 'approve') {
      await fetch(`/api/admin/reviews/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: true }) });
    } else {
      await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    }
    load();
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">Laukiantys patvirtinimo</h3>
      {reviews.length === 0 && <p className="text-sm text-gray-400">Nėra laukiančių atsiliepimų.</p>}
      {reviews.map((r) => (
        <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">{r.authorName}</span>
              <span className="text-xs text-gray-400 ml-2">{r.itemType} · {new Date(r.createdAt).toLocaleDateString('lt-LT')}</span>
            </div>
            <StarRating rating={r.rating} size="sm" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.text}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => action(r.id, 'approve')} className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
              Patvirtinti
            </button>
            <button onClick={() => action(r.id, 'delete')} className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50">
              Ištrinti
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
