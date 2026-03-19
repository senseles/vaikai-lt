/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Next.js Instrumentation — runs once on server startup.
 * Patches http.Server to track all incoming requests for monitoring.
 * Saves hourly metric snapshots to DB for historical charts.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { trackRequest } = await import('@/lib/request-tracker');
    const http = await import('http');

    const originalEmit = http.Server.prototype.emit;

    (http.Server.prototype as any).emit = function (this: any, event: string, ...args: any[]) {
      if (event === 'request') {
        const req = args[0] as import('http').IncomingMessage;
        const res = args[1] as import('http').ServerResponse;
        const start = Date.now();
        const path = req.url || '/';
        const method = req.method || 'GET';

        if (!path.startsWith('/_next/') && !path.includes('favicon') && !path.endsWith('.ico')) {
          const originalEnd = res.end.bind(res);
          (res as any).end = (...endArgs: any[]) => {
            trackRequest({
              timestamp: start,
              method,
              path: path.split('?')[0],
              status: res.statusCode,
              responseTime: Date.now() - start,
              userAgent: (req.headers['user-agent'] as string) || '',
              ip: ((req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '').split(',')[0]?.trim(),
            });
            return originalEnd(...endArgs);
          };
        }
      }
      return originalEmit.apply(this, [event, ...args] as any);
    };

    console.log('[Monitoring] Request tracking initialized');

    // Hourly metric snapshots
    const { saveSnapshot, cleanup } = await import('@/lib/metrics-snapshot');

    // Save first snapshot 5 minutes after startup (let metrics accumulate)
    setTimeout(() => {
      saveSnapshot();
    }, 5 * 60_000);

    // Then every hour
    setInterval(() => {
      saveSnapshot();
    }, 3600_000);

    // Cleanup old snapshots once per day (keep 90 days)
    setInterval(() => {
      cleanup(90);
    }, 24 * 3600_000);

    console.log('[Monitoring] Hourly snapshots scheduled');
  }
}
