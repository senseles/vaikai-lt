'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatsCard from '@/components/admin/StatsCard';

interface DashboardStats {
  kindergartenCount: number;
  aukleCount: number;
  burelisCount: number;
  specialistCount: number;
  reviewCount: number;
  pendingReviewCount: number;
  forumPostCount: number;
  forumCommentCount: number;
  recentReviews: {
    id: string;
    authorName: string;
    rating: number;
    text: string;
    itemType: string;
    isApproved: boolean;
    createdAt: string;
  }[];
  recentForumPosts: {
    id: string;
    title: string;
    authorName: string;
    createdAt: string;
  }[];
  reviewsPerDay: { date: string; count: number }[];
  entitiesPerWeek: { week: string; count: number }[];
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  kindergarten: 'Darželis',
  aukle: 'Auklė',
  burelis: 'Būrelis',
  specialist: 'Specialistas',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/stats', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => {
        if (res.success && res.data) {
          setStats(res.data);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error('Stats fetch error:', err);
        setError(true);
      });
    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-red-500 text-xl">!</span>
        </div>
        <p className="text-red-600 font-medium">Nepavyko užkrauti statistikos</p>
        <p className="text-red-500 text-sm mt-1">Perkraukite puslapį arba bandykite vėliau.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
        >
          Perkrauti
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  const totalEntities = stats.kindergartenCount + stats.aukleCount + stats.burelisCount + stats.specialistCount;

  const cards = [
    { icon: '▣', label: 'Darželiai', count: stats.kindergartenCount, color: 'blue' as const },
    { icon: '♀', label: 'Auklės', count: stats.aukleCount, color: 'green' as const },
    { icon: '◈', label: 'Būreliai', count: stats.burelisCount, color: 'orange' as const },
    { icon: '✚', label: 'Specialistai', count: stats.specialistCount, color: 'teal' as const },
    { icon: '★', label: 'Atsiliepimai', count: stats.reviewCount, color: 'purple' as const },
    { icon: '⏳', label: 'Laukia patvirtinimo', count: stats.pendingReviewCount, color: 'red' as const },
    { icon: '◬', label: 'Forumo įrašai', count: stats.forumPostCount ?? 0, color: 'blue' as const },
    { icon: '∑', label: 'Viso įstaigų', count: totalEntities, color: 'teal' as const },
  ];

  // Bar chart dimensions
  const chartHeight = 140;

  // Reviews per day chart
  const reviewDays = stats.reviewsPerDay ?? [];
  const maxReviewCount = Math.max(...reviewDays.map((d) => d.count), 1);

  // Entities per week chart
  const entityWeeks = stats.entitiesPerWeek ?? [];
  const maxEntityCount = Math.max(...entityWeeks.map((w) => w.count), 1);

  // Recent activity
  const recentReviews = stats.recentReviews ?? [];
  const recentPosts = stats.recentForumPosts ?? [];

  // Merge and sort recent activity
  const recentActivity = [
    ...recentReviews.map((r) => ({
      id: r.id,
      type: 'review' as const,
      title: `${r.authorName} — ${r.rating}★`,
      subtitle: r.text.slice(0, 80) + (r.text.length > 80 ? '...' : ''),
      meta: ITEM_TYPE_LABELS[r.itemType] ?? r.itemType,
      badge: r.isApproved ? 'Patvirtintas' : 'Laukia',
      badgeColor: r.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700',
      href: '/admin/atsiliepimai',
      date: r.createdAt,
    })),
    ...recentPosts.map((p) => ({
      id: p.id,
      type: 'forum' as const,
      title: p.title,
      subtitle: p.authorName,
      meta: 'Forumo įrašas',
      badge: 'Forumas',
      badgeColor: 'bg-blue-100 text-blue-700',
      href: '/admin/forumas',
      date: p.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c) => (
          <StatsCard key={c.label} icon={c.icon} label={c.label} count={c.count} color={c.color} />
        ))}
      </div>

      {/* Forum stats row */}
      {(stats.forumCommentCount ?? 0) > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2.5 text-base flex-shrink-0">💬</div>
          <div>
            <p className="text-sm font-medium text-blue-800">
              Forumo komentarai: <span className="font-bold">{(stats.forumCommentCount ?? 0).toLocaleString('lt-LT')}</span>
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              {stats.forumPostCount ?? 0} įrašų, {stats.forumCommentCount ?? 0} komentarų
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/atsiliepimai"
          className="px-4 py-2.5 text-sm bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] font-medium transition-colors inline-flex items-center gap-2 min-h-[44px]"
        >
          <span>★</span> Peržiūrėti laukiančius atsiliepimus
          {stats.pendingReviewCount > 0 && (
            <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {stats.pendingReviewCount}
            </span>
          )}
        </Link>
        <Link
          href="/admin/forumas"
          className="px-4 py-2.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-medium transition-colors inline-flex items-center gap-2 min-h-[44px]"
        >
          <span>◬</span> Eiti į forumą
        </Link>
        <button
          onClick={() => exportData('json')}
          className="px-4 py-2.5 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors min-h-[44px]"
        >
          Eksportuoti JSON
        </button>
        <button
          onClick={() => exportData('csv')}
          className="px-4 py-2.5 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors min-h-[44px]"
        >
          Eksportuoti CSV
        </button>
      </div>

      {/* Charts - stack vertically on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Reviews per day chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Atsiliepimai per dieną (7 dienos)</h3>
          {reviewDays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-400 text-lg">★</span>
              </div>
              <p className="text-sm text-gray-400">Nėra duomenų</p>
            </div>
          ) : (
            <div className="flex items-end gap-1 sm:gap-2" style={{ height: chartHeight }}>
              {reviewDays.map((d) => {
                const barHeight = Math.max(4, (d.count / maxReviewCount) * chartHeight);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className="text-xs text-gray-500 font-medium">{d.count}</span>
                    <div
                      className="w-full bg-[#2d6a4f] rounded-t-md transition-all duration-500 ease-out"
                      style={{ height: barHeight }}
                      title={`${d.date}: ${d.count} atsiliepimų`}
                    />
                    <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap truncate w-full text-center">
                      {new Date(d.date).toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Entities per week chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Nauji įrašai per savaitę (4 savaitės)</h3>
          {entityWeeks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-400 text-lg">◈</span>
              </div>
              <p className="text-sm text-gray-400">Nėra duomenų</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 sm:gap-3" style={{ height: chartHeight }}>
              {entityWeeks.map((w) => {
                const barHeight = Math.max(4, (w.count / maxEntityCount) * chartHeight);
                return (
                  <div key={w.week} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className="text-xs text-gray-500 font-medium">{w.count}</span>
                    <div
                      className="w-full bg-teal-500 rounded-t-md transition-all duration-500 ease-out"
                      style={{ height: barHeight }}
                      title={`${w.week}: ${w.count} įrašų`}
                    />
                    <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap truncate w-full text-center">{w.week}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Naujausia veikla</h3>
          <span className="text-xs text-gray-400">{recentActivity.length} įrašų</span>
        </div>
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-gray-300 text-xl">■</span>
            </div>
            <p className="text-sm text-gray-400">Nėra naujausios veiklos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentActivity.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors group block"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                  item.type === 'review' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {item.type === 'review' ? '★' : '◬'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-[#2d6a4f] transition-colors">{item.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    {item.meta && (
                      <span className="text-xs text-gray-400 hidden sm:inline">{item.meta}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{item.subtitle}</p>
                </div>
                <time className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                  {new Date(item.date).toLocaleDateString('lt-LT', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </time>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
