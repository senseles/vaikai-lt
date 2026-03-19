/**
 * In-memory circular buffer for request tracking.
 * Shared via globalThis between middleware (Edge) and API routes (Node.js)
 * in production (next start) where they run in the same process.
 */

interface RequestEntry {
  timestamp: number;
  method: string;
  path: string;
  status: number;
  responseTime: number;
  userAgent: string;
  ip: string;
}

interface RequestMetrics {
  total: number;
  perMinute: number;
  avgResponseTime: number;
  errorRate: number;
  statusCodes: Record<string, number>;
  topEndpoints: { path: string; count: number; avgTime: number }[];
}

const BUFFER_SIZE = 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

// Use globalThis to share state across Edge middleware and Node.js API routes
const globalKey = '__vaikai_request_tracker__' as const;

interface TrackerState {
  buffer: RequestEntry[];
  head: number;
  totalCount: number;
}

function getState(): TrackerState {
  const g = globalThis as Record<string, unknown>;
  if (!g[globalKey]) {
    g[globalKey] = {
      buffer: [] as RequestEntry[],
      head: 0,
      totalCount: 0,
    };
  }
  return g[globalKey] as TrackerState;
}

export function trackRequest(data: RequestEntry): void {
  const state = getState();
  if (state.buffer.length < BUFFER_SIZE) {
    state.buffer.push(data);
  } else {
    state.buffer[state.head] = data;
    state.head = (state.head + 1) % BUFFER_SIZE;
  }
  state.totalCount++;
}

export function getRecentRequests(limit: number = 50): RequestEntry[] {
  const state = getState();
  const len = state.buffer.length;
  if (len === 0) return [];

  const result: RequestEntry[] = [];
  // Read from newest to oldest
  if (len < BUFFER_SIZE) {
    // Buffer not full yet — items are in order
    for (let i = len - 1; i >= 0 && result.length < limit; i--) {
      result.push(state.buffer[i]);
    }
  } else {
    // Circular buffer full — head points to oldest, newest is head-1
    let idx = (state.head - 1 + BUFFER_SIZE) % BUFFER_SIZE;
    for (let i = 0; i < BUFFER_SIZE && result.length < limit; i++) {
      result.push(state.buffer[idx]);
      idx = (idx - 1 + BUFFER_SIZE) % BUFFER_SIZE;
    }
  }
  return result;
}

export function getMetrics(): RequestMetrics {
  const state = getState();
  const now = Date.now();
  const fiveMinAgo = now - FIVE_MINUTES_MS;

  const statusCodes: Record<string, number> = {};
  const endpointMap: Record<string, { count: number; totalTime: number }> = {};
  let recentCount = 0;
  let totalTime = 0;
  let errorCount = 0;
  const len = state.buffer.length;

  for (let i = 0; i < len; i++) {
    const entry = state.buffer[i];

    // Status codes
    const code = String(entry.status);
    statusCodes[code] = (statusCodes[code] || 0) + 1;

    // Response time
    totalTime += entry.responseTime;

    // Errors (4xx/5xx)
    if (entry.status >= 400) errorCount++;

    // Requests in last 5 min
    if (entry.timestamp >= fiveMinAgo) recentCount++;

    // Endpoint stats — normalize dynamic paths
    const normalized = normalizePath(entry.path);
    if (!endpointMap[normalized]) {
      endpointMap[normalized] = { count: 0, totalTime: 0 };
    }
    endpointMap[normalized].count++;
    endpointMap[normalized].totalTime += entry.responseTime;
  }

  // Top endpoints
  const topEndpoints = Object.entries(endpointMap)
    .map(([path, data]) => ({
      path,
      count: data.count,
      avgTime: Math.round(data.totalTime / data.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Requests per minute (over last 5 min window)
  const minuteWindow = Math.min((now - (state.buffer[0]?.timestamp || now)) / 60000, 5);
  const perMinute = minuteWindow > 0 ? Math.round(recentCount / minuteWindow) : 0;

  return {
    total: state.totalCount,
    perMinute,
    avgResponseTime: len > 0 ? Math.round(totalTime / len) : 0,
    errorRate: len > 0 ? Math.round((errorCount / len) * 1000) / 10 : 0,
    statusCodes,
    topEndpoints,
  };
}

function normalizePath(path: string): string {
  // Strip query string
  const base = path.split('?')[0];
  // Collapse dynamic segments like /api/admin/reviews/clxyz123 → /api/admin/reviews/[id]
  return base.replace(/\/cl[a-z0-9]{20,}/g, '/[id]');
}
