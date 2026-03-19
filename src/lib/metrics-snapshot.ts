/**
 * Metric snapshots — saves hourly system/request metrics to DB.
 * Provides history retrieval and cleanup for the monitoring dashboard.
 */
import os from 'os';
import prisma from '@/lib/prisma';
import { getMetrics } from '@/lib/request-tracker';

/** Collect current metrics and save a snapshot to DB. */
export async function saveSnapshot(): Promise<void> {
  try {
    const cpus = os.cpus();
    const cpuUsage = cpus.length > 0
      ? Math.round(cpus.reduce((acc, cpu) => {
          const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
          const idle = cpu.times.idle;
          return acc + ((total - idle) / total) * 100;
        }, 0) / cpus.length * 10) / 10
      : 0;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryPercent = Math.round(((totalMem - freeMem) / totalMem) * 1000) / 10;
    const loadAvg = os.loadavg()[0];

    const requestMetrics = getMetrics();

    const errorCount = Object.entries(requestMetrics.statusCodes)
      .filter(([code]) => parseInt(code) >= 400)
      .reduce((sum, [, count]) => sum + count, 0);

    const [kindergartens, reviews, users] = await Promise.all([
      prisma.kindergarten.count(),
      prisma.review.count(),
      prisma.user.count(),
    ]);

    await prisma.metricSnapshot.create({
      data: {
        cpuUsage,
        memoryPercent,
        loadAvg: Math.round(loadAvg * 100) / 100,
        requestCount: requestMetrics.total,
        avgResponseTime: requestMetrics.avgResponseTime,
        errorRate: requestMetrics.errorRate,
        errorCount,
        statusCodes: requestMetrics.statusCodes,
        topEndpoints: requestMetrics.topEndpoints,
        totalKindergartens: kindergartens,
        totalReviews: reviews,
        totalUsers: users,
      },
    });

    console.log('[Metrics] Snapshot saved');
  } catch (err) {
    console.error('[Metrics] Failed to save snapshot:', err);
  }
}

export interface SnapshotRow {
  time: string;
  requests: number;
  avgResponse: number;
  cpu: number;
  memory: number;
  errors: number;
  loadAvg: number;
}

export interface DailyAggregate {
  date: string;
  totalRequests: number;
  avgResponse: number;
  avgCpu: number;
  peakCpu: number;
  avgMemory: number;
  errors: number;
}

/** Get snapshots for a given period. */
export async function getHistory(period: '24h' | '7d' | '30d' | '90d') {
  const now = new Date();
  const hoursMap: Record<string, number> = { '24h': 24, '7d': 168, '30d': 720, '90d': 2160 };
  const hours = hoursMap[period] || 168;
  const since = new Date(now.getTime() - hours * 3600_000);

  const snapshots = await prisma.metricSnapshot.findMany({
    where: { timestamp: { gte: since } },
    orderBy: { timestamp: 'asc' },
    select: {
      timestamp: true,
      cpuUsage: true,
      memoryPercent: true,
      loadAvg: true,
      requestCount: true,
      avgResponseTime: true,
      errorRate: true,
      errorCount: true,
    },
  });

  const rows: SnapshotRow[] = snapshots.map((s) => ({
    time: s.timestamp.toISOString(),
    requests: s.requestCount,
    avgResponse: s.avgResponseTime,
    cpu: s.cpuUsage,
    memory: s.memoryPercent,
    errors: s.errorCount,
    loadAvg: s.loadAvg,
  }));

  // Build daily aggregates
  const dayMap = new Map<string, typeof snapshots>();
  for (const s of snapshots) {
    const day = s.timestamp.toISOString().slice(0, 10);
    if (!dayMap.has(day)) dayMap.set(day, []);
    dayMap.get(day)!.push(s);
  }

  const daily: DailyAggregate[] = [];
  for (const [date, items] of Array.from(dayMap.entries())) {
    const n = items.length;
    daily.push({
      date,
      totalRequests: items.reduce((s, i) => s + i.requestCount, 0),
      avgResponse: Math.round(items.reduce((s, i) => s + i.avgResponseTime, 0) / n),
      avgCpu: Math.round(items.reduce((s, i) => s + i.cpuUsage, 0) / n * 10) / 10,
      peakCpu: Math.round(Math.max(...items.map((i) => i.cpuUsage)) * 10) / 10,
      avgMemory: Math.round(items.reduce((s, i) => s + i.memoryPercent, 0) / n * 10) / 10,
      errors: items.reduce((s, i) => s + i.errorCount, 0),
    });
  }

  return { period, snapshots: rows, daily };
}

/** Delete snapshots older than retainDays. */
export async function cleanup(retainDays: number = 90): Promise<number> {
  const cutoff = new Date(Date.now() - retainDays * 24 * 3600_000);
  const result = await prisma.metricSnapshot.deleteMany({
    where: { timestamp: { lt: cutoff } },
  });
  if (result.count > 0) {
    console.log(`[Metrics] Cleaned up ${result.count} old snapshots`);
  }
  return result.count;
}
