import { NextResponse } from 'next/server';
import os from 'os';
import prisma from '@/lib/prisma';
import { getMetrics, getRecentRequests } from '@/lib/request-tracker';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Prometheus-compatible metrics endpoint.
 * Returns metrics in Prometheus exposition format.
 */
export async function GET() {
  try {
    const metrics = getMetrics();
    const recent = getRecentRequests(100);
    const memInfo = process.memoryUsage();
    const cpus = os.cpus();
    const cpuUsage = cpus.length > 0
      ? cpus.reduce((acc, cpu) => {
          const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
          return acc + ((total - cpu.times.idle) / total) * 100;
        }, 0) / cpus.length
      : 0;

    // DB counts (cached, don't query every 10s)
    const [kindergartens, aukles, bureliai, specialists, reviews, users] = await Promise.all([
      prisma.kindergarten.count(),
      prisma.aukle.count(),
      prisma.burelis.count(),
      prisma.specialist.count(),
      prisma.review.count(),
      prisma.user.count(),
    ]);

    // Calculate percentiles from recent requests
    const times = recent.map(r => r.responseTime).sort((a, b) => a - b);
    const p50 = times[Math.floor(times.length * 0.5)] || 0;
    const p95 = times[Math.floor(times.length * 0.95)] || 0;
    const p99 = times[Math.floor(times.length * 0.99)] || 0;

    // Status code counts from recent
    const statusCounts: Record<string, number> = {};
    for (const r of recent) {
      const group = `${Math.floor(r.status / 100)}xx`;
      statusCounts[group] = (statusCounts[group] || 0) + 1;
    }

    // Endpoint counts
    const endpointCounts: Record<string, number> = {};
    for (const r of recent) {
      const path = r.path.split('?')[0].replace(/\/cl[a-z0-9]{20,}/g, '/:id').replace(/\/cm[a-z0-9]{20,}/g, '/:id');
      endpointCounts[path] = (endpointCounts[path] || 0) + 1;
    }

    const lines: string[] = [
      '# HELP vaikai_process_cpu_usage CPU usage percentage',
      '# TYPE vaikai_process_cpu_usage gauge',
      `vaikai_process_cpu_usage ${cpuUsage.toFixed(2)}`,
      '',
      '# HELP vaikai_process_memory_heap_bytes Heap memory used in bytes',
      '# TYPE vaikai_process_memory_heap_bytes gauge',
      `vaikai_process_memory_heap_bytes ${memInfo.heapUsed}`,
      '',
      '# HELP vaikai_process_memory_rss_bytes RSS memory in bytes',
      '# TYPE vaikai_process_memory_rss_bytes gauge',
      `vaikai_process_memory_rss_bytes ${memInfo.rss}`,
      '',
      '# HELP vaikai_process_uptime_seconds Process uptime in seconds',
      '# TYPE vaikai_process_uptime_seconds gauge',
      `vaikai_process_uptime_seconds ${Math.floor(process.uptime())}`,
      '',
      '# HELP vaikai_system_memory_used_bytes System memory used',
      '# TYPE vaikai_system_memory_used_bytes gauge',
      `vaikai_system_memory_used_bytes ${os.totalmem() - os.freemem()}`,
      '',
      '# HELP vaikai_system_memory_total_bytes System total memory',
      '# TYPE vaikai_system_memory_total_bytes gauge',
      `vaikai_system_memory_total_bytes ${os.totalmem()}`,
      '',
      '# HELP vaikai_system_load_average System load average',
      '# TYPE vaikai_system_load_average gauge',
      `vaikai_system_load_average{period="1m"} ${os.loadavg()[0].toFixed(2)}`,
      `vaikai_system_load_average{period="5m"} ${os.loadavg()[1].toFixed(2)}`,
      `vaikai_system_load_average{period="15m"} ${os.loadavg()[2].toFixed(2)}`,
      '',
      '# HELP vaikai_http_requests_total Total HTTP requests tracked',
      '# TYPE vaikai_http_requests_total counter',
      `vaikai_http_requests_total ${metrics.total}`,
      '',
      '# HELP vaikai_http_requests_per_minute Requests per minute (5min window)',
      '# TYPE vaikai_http_requests_per_minute gauge',
      `vaikai_http_requests_per_minute ${metrics.perMinute}`,
      '',
      '# HELP vaikai_http_response_time_avg_ms Average response time',
      '# TYPE vaikai_http_response_time_avg_ms gauge',
      `vaikai_http_response_time_avg_ms ${metrics.avgResponseTime}`,
      '',
      '# HELP vaikai_http_response_time_percentile Response time percentiles',
      '# TYPE vaikai_http_response_time_percentile gauge',
      `vaikai_http_response_time_percentile{quantile="0.5"} ${p50}`,
      `vaikai_http_response_time_percentile{quantile="0.95"} ${p95}`,
      `vaikai_http_response_time_percentile{quantile="0.99"} ${p99}`,
      '',
      '# HELP vaikai_http_error_rate Error rate percentage',
      '# TYPE vaikai_http_error_rate gauge',
      `vaikai_http_error_rate ${metrics.errorRate}`,
      '',
      '# HELP vaikai_http_status_total HTTP responses by status group',
      '# TYPE vaikai_http_status_total gauge',
      ...Object.entries(statusCounts).map(([group, count]) =>
        `vaikai_http_status_total{code="${group}"} ${count}`
      ),
      '',
      '# HELP vaikai_db_records Database record counts',
      '# TYPE vaikai_db_records gauge',
      `vaikai_db_records{model="kindergartens"} ${kindergartens}`,
      `vaikai_db_records{model="aukles"} ${aukles}`,
      `vaikai_db_records{model="bureliai"} ${bureliai}`,
      `vaikai_db_records{model="specialists"} ${specialists}`,
      `vaikai_db_records{model="reviews"} ${reviews}`,
      `vaikai_db_records{model="users"} ${users}`,
      '',
    ];

    // Top endpoints
    const topEps = Object.entries(endpointCounts).sort(([,a],[,b]) => b - a).slice(0, 15);
    if (topEps.length > 0) {
      lines.push('# HELP vaikai_http_endpoint_requests Requests per endpoint');
      lines.push('# TYPE vaikai_http_endpoint_requests gauge');
      for (const [path, count] of topEps) {
        lines.push(`vaikai_http_endpoint_requests{path="${path}"} ${count}`);
      }
      lines.push('');
    }

    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Metrics error:', err);
    return new NextResponse('# Error generating metrics\n', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
