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
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats).catch(() => {});
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={login} className="bg-white p-6 rounded-xl shadow-sm border max-w-sm w-full space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Administravimas</h1>
          <input
            type="password"
            placeholder="Slaptažodis"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Vaikai.lt Admin</h1>
          <button onClick={() => setAuthenticated(false)} className="text-sm text-gray-500 hover:text-gray-700">
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
                activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
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

function Dashboard({ stats }: { readonly stats: Stats | null }) {
  if (!stats) return <p className="text-gray-400">Kraunama...</p>;

  const cards = [
    { label: 'Darželiai', count: stats.kindergartens, color: 'bg-blue-50 text-blue-700' },
    { label: 'Auklės', count: stats.aukles, color: 'bg-green-50 text-green-700' },
    { label: 'Būreliai', count: stats.bureliai, color: 'bg-orange-50 text-orange-700' },
    { label: 'Specialistai', count: stats.specialists, color: 'bg-teal-50 text-teal-700' },
    { label: 'Atsiliepimai', count: stats.reviews, color: 'bg-purple-50 text-purple-700' },
    { label: 'Laukia patvirtinimo', count: stats.pendingReviews, color: 'bg-red-50 text-red-700' },
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
        <button onClick={() => exportData('json')} className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50">
          Eksportuoti JSON
        </button>
        <button onClick={() => exportData('csv')} className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50">
          Eksportuoti CSV
        </button>
      </div>
    </div>
  );
}

function CrudTable({ itemType, label }: { readonly itemType: ItemType; readonly label: string }) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const perPage = 20;

  const apiPath = itemType === 'kindergarten' ? 'kindergartens' : itemType === 'aukle' ? 'aukles' : itemType === 'burelis' ? 'bureliai' : 'specialists';

  const load = useCallback(async () => {
    const params = new URLSearchParams({ search, page: String(page), limit: String(perPage), sort: sortBy });
    const res = await fetch(`/api/admin/${apiPath}?${params}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? data);
      setTotal(data.total ?? 0);
    }
  }, [search, page, sortBy, apiPath]);

  useEffect(() => { load(); }, [load]);

  const deleteItem = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti?')) return;
    await fetch(`/api/admin/${apiPath}/${id}`, { method: 'DELETE' });
    load();
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
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="name">Pavadinimas</option>
          <option value="city">Miestas</option>
          <option value="baseRating">Įvertinimas</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Pavadinimas</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Miestas</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Įvertinimas</th>
                <th className="text-right px-4 py-2 font-medium text-gray-500">Veiksmai</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={String(item.id)} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-900">{String(item.name ?? '')}</td>
                  <td className="px-4 py-2 text-gray-600">{String(item.city ?? '')}</td>
                  <td className="px-4 py-2">
                    <StarRating rating={Number(item.baseRating ?? 0)} size="sm" />
                  </td>
                  <td className="px-4 py-2 text-right">
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
        <p className="text-sm text-gray-500">Viso: {total} | Puslapis {page}/{totalPages}</p>
        <div className="flex gap-1">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-30">←</button>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-30">→</button>
        </div>
      </div>
    </div>
  );
}

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
      <h3 className="font-semibold text-gray-900">Laukiantys patvirtinimo</h3>
      {reviews.length === 0 && <p className="text-sm text-gray-400">Nėra laukiančių atsiliepimų.</p>}
      {reviews.map((r) => (
        <div key={r.id} className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900">{r.authorName}</span>
              <span className="text-xs text-gray-400 ml-2">{r.itemType} · {new Date(r.createdAt).toLocaleDateString('lt-LT')}</span>
            </div>
            <StarRating rating={r.rating} size="sm" />
          </div>
          <p className="text-sm text-gray-600 mt-1">{r.text}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => action(r.id, 'approve')} className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
              Patvirtinti
            </button>
            <button onClick={() => action(r.id, 'delete')} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
              Ištrinti
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
