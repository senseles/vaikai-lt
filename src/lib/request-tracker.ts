/**
 * In-memory request tracking — Node.js runtime only.
 * Uses a file-based approach to bridge Edge middleware → Node.js:
 * Middleware writes to a tmp file, monitoring API reads from it.
 * 
 * BUT simpler approach: track directly from API routes + use OS-level 
 * process metrics for system stats. Since all API routes run in Node.js,
 * globalThis works fine for API-level tracking.
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

/**
 * Wrapper for API route handlers that automatically tracks requests.
 * Use in API routes: export const GET = withTracking(async (req) => { ... });
 */
export function withTracking(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const start = Date.now();
    const url = new URL(req.url);
    let response: Response;
    try {
      response = await handler(req);
    } catch (err) {
      response = new Response('Internal Server Error', { status: 500 });
      throw err;
    } finally {
      trackRequest({
        timestamp: start,
        method: req.method,
        path: url.pathname,
        status: response!.status,
        responseTime: Date.now() - start,
        userAgent: req.headers.get('user-agent') || '',
        ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      });
    }
    return response;
  };
}

/**
 * Track a page-level request (call from server components / generateMetadata).
 */
export function trackPageView(path: string, method: string = 'GET', status: number = 200, responseTime: number = 0): void {
  trackRequest({
    timestamp: Date.now(),
    method,
    path,
    status,
    responseTime,
    userAgent: '',
    ip: '',
  });
}

export function getRecentRequests(limit: number = 50): RequestEntry[] {
  const state = getState();
  const len = state.buffer.length;
  if (len === 0) return [];

  const result: RequestEntry[] = [];
  if (len < BUFFER_SIZE) {
    for (let i = len - 1; i >= 0 && result.length < limit; i--) {
      result.push(state.buffer[i]);
    }
  } else {
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
    const code = String(entry.status);
    statusCodes[code] = (statusCodes[code] || 0) + 1;
    totalTime += entry.responseTime;
    if (entry.status >= 400) errorCount++;
    if (entry.timestamp >= fiveMinAgo) recentCount++;

    const normalized = normalizePath(entry.path);
    if (!endpointMap[normalized]) {
      endpointMap[normalized] = { count: 0, totalTime: 0 };
    }
    endpointMap[normalized].count++;
    endpointMap[normalized].totalTime += entry.responseTime;
  }

  const topEndpoints = Object.entries(endpointMap)
    .map(([path, data]) => ({
      path,
      count: data.count,
      avgTime: Math.round(data.totalTime / data.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

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
  const base = path.split('?')[0];
  // Collapse dynamic IDs
  return base
    .replace(/\/cl[a-z0-9]{20,}/g, '/[id]')
    .replace(/\/cm[a-z0-9]{20,}/g, '/[id]');
}
