'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────

interface SystemMetrics {
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  memoryPercent: number;
  heapUsed: number;
  heapTotal: number;
  uptime: number;
  nodeVersion: string;
  platform: string;
  loadAvg: number[];
}

interface RequestMetrics {
  total: number;
  perMinute: number;
  avgResponseTime: number;
  errorRate: number;
  statusCodes: Record<string, number>;
  topEndpoints: { path: string; count: number; avgTime: number }[];
}

interface DatabaseMetrics {
  kindergartens: number;
  aukles: number;
  bureliai: number;
  specialists: number;
  reviews: number;
  users: number;
  submissions: number;
  forumPosts: number;
}

interface RecentRequest {
  time: string;
  method: string;
  path: string;
  status: number;
  ms: number;
}

interface MonitoringData {
  system: SystemMetrics;
  requests: RequestMetrics;
  database: DatabaseMetrics;
  recentRequests: RecentRequest[];
}

interface SnapshotRow {
  time: string;
  requests: number;
  avgResponse: number;
  cpu: number;
  memory: number;
  errors: number;
  loadAvg: number;
}

interface DailyAggregate {
  date: string;
  totalRequests: number;
  avgResponse: number;
  avgCpu: number;
  peakCpu: number;
  avgMemory: number;
  errors: number;
}

interface HistoryData {
  period: string;
  snapshots: SnapshotRow[];
  daily: DailyAggregate[];
}

// ── Helpers ──────────────────────────────────────────────

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}val`);
  parts.push(`${m}min`);
  return parts.join(' ');
}

function timeAgo(isoStr: string): string {
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 5) return 'ką tik';
  if (diff < 60) return `prieš ${diff}s`;
  if (diff < 3600) return `prieš ${Math.floor(diff / 60)}min`;
  return `prieš ${Math.floor(diff / 3600)}val`;
}

function cpuColor(v: number): string {
  if (v < 50) return 'text-green-400';
  if (v < 80) return 'text-yellow-400';
  return 'text-red-400';
}
function cpuBg(v: number): string {
  if (v < 50) return 'bg-green-500';
  if (v < 80) return 'bg-yellow-500';
  return 'bg-red-500';
}
function memBg(v: number): string {
  if (v < 60) return 'bg-green-500';
  if (v < 85) return 'bg-yellow-500';
  return 'bg-red-500';
}
function msColor(ms: number): string {
  if (ms < 100) return 'text-green-400';
  if (ms < 500) return 'text-yellow-400';
  return 'text-red-400';
}
function statusColor(s: number): string {
  if (s < 300) return 'bg-green-500/20 text-green-400';
  if (s < 400) return 'bg-blue-500/20 text-blue-400';
  if (s < 500) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-red-500/20 text-red-400';
}
function methodColor(m: string): string {
  switch (m) {
    case 'GET': return 'text-green-400';
    case 'POST': return 'text-blue-400';
    case 'PUT': case 'PATCH': return 'text-yellow-400';
    case 'DELETE': return 'text-red-400';
    default: return 'text-slate-400';
  }
}
function statusBarColor(code: string): string {
  const c = parseInt(code);
  if (c < 300) return 'bg-green-500';
  if (c < 400) return 'bg-blue-500';
  if (c < 500) return 'bg-yellow-500';
  return 'bg-red-500';
}
function responseBarColor(ms: number): string {
  if (ms < 100) return 'bg-green-500';
  if (ms < 300) return 'bg-yellow-500';
  return 'bg-red-500';
}

const DB_LABELS: Record<string, { label: string; icon: string }> = {
  kindergartens: { label: 'Darželiai', icon: '🏫' },
  aukles: { label: 'Auklės', icon: '👩‍🍼' },
  bureliai: { label: 'Būreliai', icon: '🎨' },
  specialists: { label: 'Specialistai', icon: '👨‍⚕️' },
  reviews: { label: 'Atsiliepimai', icon: '⭐' },
  users: { label: 'Vartotojai', icon: '👤' },
  submissions: { label: 'Pasiūlymai', icon: '📝' },
  forumPosts: { label: 'Forumo įrašai', icon: '💬' },
};

type Period = '24h' | '7d' | '30d' | '90d';
const PERIODS: { value: Period; label: string }[] = [
  { value: '24h', label: '24 val' },
  { value: '7d', label: '7 d.' },
  { value: '30d', label: '30 d.' },
  { value: '90d', label: '90 d.' },
];

// ── Chart helper: format time labels ──────────────────

function formatChartLabel(iso: string, period: Period): string {
  const d = new Date(iso);
  if (period === '24h') return d.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });
  if (period === '7d') return d.toLocaleDateString('lt-LT', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('lt-LT', { month: '2-digit', day: '2-digit' });
}

// Downsample for chart display (max ~80 bars)
function downsample<T>(arr: T[], maxBars: number): T[] {
  if (arr.length <= maxBars) return arr;
  const step = Math.ceil(arr.length / maxBars);
  return arr.filter((_, i) => i % step === 0);
}

// ── Bar Chart Component ──────────────────────────────

function BarChart({
  data,
  maxValue,
  barColor,
  label,
  period,
}: {
  data: { time: string; value: number }[];
  maxValue: number;
  barColor: (v: number) => string;
  label: string;
  period: Period;
}) {
  const display = downsample(data, 80);
  const avg = data.length > 0 ? data.reduce((s, d) => s + d.value, 0) / data.length : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{label}</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Vid: {Math.round(avg).toLocaleString('lt-LT')}
        </span>
      </div>
      <div className="flex items-end gap-px h-40">
        {display.map((d, i) => (
          <div
            key={i}
            className={`flex-1 ${barColor(d.value)} rounded-t relative group cursor-pointer transition-opacity hover:opacity-80`}
            style={{ height: maxValue > 0 ? `${Math.max((d.value / maxValue) * 100, d.value > 0 ? 1.5 : 0)}%` : '0%' }}
          >
            <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
              {formatChartLabel(d.time, period)}: {d.value.toLocaleString('lt-LT')}
            </div>
          </div>
        ))}
      </div>
      {/* X axis labels */}
      <div className="flex justify-between mt-1">
        {display.length > 0 && (
          <>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatChartLabel(display[0].time, period)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatChartLabel(display[display.length - 1].time, period)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Dual Bar Chart (CPU + Memory) ─────────────────────

function DualBarChart({
  data,
  period,
}: {
  data: SnapshotRow[];
  period: Period;
}) {
  const display = downsample(data, 80);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sistemos resursai</h3>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> CPU
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" /> Atmintis
          </span>
        </div>
      </div>
      <div className="flex items-end gap-px h-40">
        {display.map((d, i) => (
          <div key={i} className="flex-1 flex items-end gap-[1px] relative group cursor-pointer">
            {/* CPU bar */}
            <div
              className="flex-1 bg-blue-500 rounded-t opacity-70 group-hover:opacity-100 transition-opacity"
              style={{ height: `${Math.max(d.cpu, 1)}%` }}
            />
            {/* Memory bar */}
            <div
              className="flex-1 bg-purple-500 rounded-t opacity-70 group-hover:opacity-100 transition-opacity"
              style={{ height: `${Math.max(d.memory, 1)}%` }}
            />
            <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
              {formatChartLabel(d.time, period)} — CPU: {d.cpu}% | Atm: {d.memory}%
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {display.length > 0 && (
          <>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatChartLabel(display[0].time, period)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatChartLabel(display[display.length - 1].time, period)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Error Sparkline ──────────────────────────────────

function ErrorSparkline({
  data,
  period,
}: {
  data: { time: string; value: number; rate: number }[];
  period: Period;
}) {
  const display = downsample(data, 80);
  const maxVal = Math.max(...display.map((d) => d.value), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Klaidos</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Iš viso: {data.reduce((s, d) => s + d.value, 0).toLocaleString('lt-LT')}
        </span>
      </div>
      <div className="flex items-end gap-px h-24">
        {display.map((d, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t relative group cursor-pointer transition-opacity hover:opacity-80 ${
              d.rate > 5 ? 'bg-red-500' : d.rate > 2 ? 'bg-yellow-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
            style={{ height: maxVal > 0 ? `${Math.max((d.value / maxVal) * 100, d.value > 0 ? 3 : 0)}%` : '0%' }}
          >
            <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
              {formatChartLabel(d.time, period)}: {d.value} kl. ({d.rate}%)
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {display.length > 0 && (
          <>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatChartLabel(display[0].time, period)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatChartLabel(display[display.length - 1].time, period)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // History state
  const [period, setPeriod] = useState<Period>('7d');
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/monitoring', { credentials: 'include' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Klaida');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (p: Period) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/monitoring/history?period=${p}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setHistory(json);
    } catch (e) {
      console.error('History fetch error:', e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    fetchHistory(period);
  }, [period, fetchHistory]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-[3px] border-slate-700 border-t-[#2d6a4f] rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500">Kraunama...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-2">Klaida: {error}</p>
        <button onClick={fetchData} className="text-sm text-[#2d6a4f] hover:underline">Bandyti dar kartą</button>
        {error.includes('401') && (
          <p className="text-xs text-slate-500 mt-2">Gali reikėti iš naujo prisijungti prie admin</p>
        )}
      </div>
    );
  }

  if (!data) return null;

  const { system, requests, database, recentRequests } = data;
  const totalStatusCodes = Object.values(requests.statusCodes).reduce((a, b) => a + b, 0);

  // Prepare history chart data
  const snapshots = history?.snapshots || [];
  const daily = history?.daily || [];

  const requestChartData = snapshots.map((s) => ({ time: s.time, value: s.requests }));
  const responseChartData = snapshots.map((s) => ({ time: s.time, value: s.avgResponse }));
  const errorChartData = snapshots.map((s) => ({ time: s.time, value: s.errors, rate: Math.round(s.requests > 0 ? (s.errors / s.requests) * 100 * 10 : 0) / 10 }));

  const maxRequests = Math.max(...requestChartData.map((d) => d.value), 1);
  const maxResponse = Math.max(...responseChartData.map((d) => d.value), 1);

  // Summary stats for the period
  const totalPeriodRequests = snapshots.reduce((s, d) => s + d.requests, 0);
  const avgPeriodResponse = snapshots.length > 0 ? Math.round(snapshots.reduce((s, d) => s + d.avgResponse, 0) / snapshots.length) : 0;
  const peakCpu = snapshots.length > 0 ? Math.round(Math.max(...snapshots.map((d) => d.cpu)) * 10) / 10 : 0;
  const totalErrors = snapshots.reduce((s, d) => s + d.errors, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Monitoringas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Serverio būklė ir užklausų analitika
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Atnaujinta: {lastUpdated.toLocaleTimeString('lt-LT')}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-500 font-medium">Gyvai</span>
          </div>
        </div>
      </div>

      {/* Row 1 — System Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🖥️</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">CPU</span>
          </div>
          <p className={`text-2xl font-bold ${cpuColor(system.cpuUsage)}`}>
            {system.cpuUsage}%
          </p>
          <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${cpuBg(system.cpuUsage)} rounded-full transition-all duration-500`} style={{ width: `${Math.min(system.cpuUsage, 100)}%` }} />
          </div>
        </div>

        {/* Memory */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💾</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Atmintis</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {system.memoryPercent}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {system.memoryUsed} / {system.memoryTotal} MB
          </p>
          <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${memBg(system.memoryPercent)} rounded-full transition-all duration-500`} style={{ width: `${Math.min(system.memoryPercent, 100)}%` }} />
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⏱️</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Veikimo laikas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatUptime(system.uptime)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {system.nodeVersion} / {system.platform}
          </p>
        </div>

        {/* Load Average */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📊</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Apkrova</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{system.loadAvg[0]}</p>
            <span className="text-sm text-slate-500 dark:text-slate-400">1min</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            5min: {system.loadAvg[1]} · 15min: {system.loadAvg[2]}
          </p>
        </div>
      </div>

      {/* Row 2 — Request Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📈</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Iš viso užklausų</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.total.toLocaleString('lt-LT')}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Užkl./min</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.perMinute}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">per 5 min langą</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🕐</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vid. atsakymo laikas</span>
          </div>
          <p className={`text-2xl font-bold ${msColor(requests.avgResponseTime)}`}>{requests.avgResponseTime} ms</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">❌</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Klaidų dažnis</span>
          </div>
          <p className={`text-2xl font-bold ${requests.errorRate > 5 ? 'text-red-400' : requests.errorRate > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
            {requests.errorRate}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">4xx + 5xx</p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ISTORIJA — Historical Charts
         ════════════════════════════════════════════════════════════════ */}

      <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Istorija</h2>
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === p.value
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {historyLoading && !history ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block w-6 h-6 border-2 border-slate-700 border-t-[#2d6a4f] rounded-full animate-spin" />
            <span className="ml-2 text-sm text-slate-500">Kraunama istorija...</span>
          </div>
        ) : snapshots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nėra istorinių duomenų. Snapshot&apos;ai bus automatiškai kuriami kas valandą.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Statistikos suvestinė */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Iš viso užklausų</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalPeriodRequests.toLocaleString('lt-LT')}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Vid. atsakymo laikas</p>
                <p className={`text-xl font-bold ${msColor(avgPeriodResponse)}`}>{avgPeriodResponse} ms</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Didžiausias CPU pikas</p>
                <p className={`text-xl font-bold ${cpuColor(peakCpu)}`}>{peakCpu}%</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Klaidų skaičius</p>
                <p className={`text-xl font-bold ${totalErrors > 100 ? 'text-red-400' : totalErrors > 20 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {totalErrors.toLocaleString('lt-LT')}
                </p>
              </div>
            </div>

            {/* A) Užklausų grafikas */}
            <BarChart
              data={requestChartData}
              maxValue={maxRequests}
              barColor={(v) => {
                const avg = maxRequests * 0.5;
                return v > avg ? 'bg-yellow-500' : 'bg-green-500';
              }}
              label="Užklausų grafikas"
              period={period}
            />

            {/* B) Atsakymo laiko grafikas */}
            <BarChart
              data={responseChartData}
              maxValue={maxResponse}
              barColor={(ms) => responseBarColor(ms)}
              label="Atsakymo laiko grafikas"
              period={period}
            />

            {/* C) Klaidų grafikas */}
            <ErrorSparkline data={errorChartData} period={period} />

            {/* D) Sistemos resursai */}
            <DualBarChart data={snapshots} period={period} />

            {/* Daily aggregates table */}
            {daily.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Dienos suvestinė</h3>
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Užklausos</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vid. ats.</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vid. CPU</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pikas CPU</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vid. atm.</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Klaidos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                      {daily.slice().reverse().map((d) => (
                        <tr key={d.date} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                          <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-200">{d.date}</td>
                          <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{d.totalRequests.toLocaleString('lt-LT')}</td>
                          <td className={`px-3 py-2 text-right font-mono ${msColor(d.avgResponse)}`}>{d.avgResponse} ms</td>
                          <td className={`px-3 py-2 text-right ${cpuColor(d.avgCpu)}`}>{d.avgCpu}%</td>
                          <td className={`px-3 py-2 text-right font-bold ${cpuColor(d.peakCpu)}`}>{d.peakCpu}%</td>
                          <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{d.avgMemory}%</td>
                          <td className={`px-3 py-2 text-right ${d.errors > 50 ? 'text-red-400 font-bold' : d.errors > 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {d.errors.toLocaleString('lt-LT')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          Existing real-time sections
         ════════════════════════════════════════════════════════════════ */}

      {/* Row 3 — Top Endpoints */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Populiariausi keliai</h2>
        </div>
        {requests.topEndpoints.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500 dark:text-slate-400 text-center">Dar nėra duomenų</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700/50">
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kelias</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Užklausos</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vid. laikas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {requests.topEndpoints.map((ep) => (
                  <tr key={ep.path} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-gray-200">{ep.path}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">{ep.count.toLocaleString('lt-LT')}</td>
                    <td className={`px-4 py-2.5 text-right font-mono ${msColor(ep.avgTime)}`}>{ep.avgTime} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Row 4 — Status Code Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Būsenos kodų pasiskirstymas</h2>
        {totalStatusCodes === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Dar nėra duomenų</p>
        ) : (
          <>
            <div className="flex h-6 rounded-lg overflow-hidden mb-4">
              {Object.entries(requests.statusCodes)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([code, count]) => (
                  <div
                    key={code}
                    className={`${statusBarColor(code)} transition-all duration-500 relative group`}
                    style={{ width: `${(count / totalStatusCodes) * 100}%`, minWidth: count > 0 ? '2px' : '0' }}
                    title={`${code}: ${count}`}
                  />
                ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.entries(requests.statusCodes)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([code, count]) => (
                  <div key={code} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-sm ${statusBarColor(code)}`} />
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{code}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{count.toLocaleString('lt-LT')} ({Math.round((count / totalStatusCodes) * 100)}%)</span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Row 5 — Database Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Duomenų bazė</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(database).map(([key, value]) => {
            const meta = DB_LABELS[key];
            if (!meta) return null;
            return (
              <div key={key} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                <span className="text-xl">{meta.icon}</span>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{value.toLocaleString('lt-LT')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{meta.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 6 — Live Request Log */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Paskutinės užklausos</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">{recentRequests.length} įrašų</span>
        </div>
        {recentRequests.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-500 dark:text-slate-400 text-center">Dar nėra užklausų</p>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Laikas</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Metodas</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kelias</th>
                  <th className="text-center px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Būsena</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Laikas (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {recentRequests.map((req, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">{timeAgo(req.time)}</td>
                    <td className={`px-3 py-2 font-mono font-bold ${methodColor(req.method)}`}>{req.method}</td>
                    <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-200 max-w-[300px] truncate">{req.path}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${msColor(req.ms)}`}>{req.ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
