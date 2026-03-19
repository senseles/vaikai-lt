# Tech Spec: Monitoring Dashboard

## Overview
Real-time admin monitoring dashboard at `/admin/monitoring` showing server metrics, request analytics, and system health.

## Features
1. **System Metrics** — CPU, memory, uptime, Node.js heap
2. **Request Analytics** — requests/min, response times, status codes, top endpoints
3. **Database Stats** — total records per model, recent activity
4. **Live Request Log** — last 100 requests with timing
5. **Auto-refresh** every 10s

## Implementation
- Middleware-based request tracking (in-memory circular buffer, no DB overhead)
- API: `/api/admin/monitoring` — returns all metrics
- SSE endpoint or polling for live updates
- Admin-only access (existing auth)

## Acceptance Criteria
- Admin sees real-time CPU/memory/uptime
- Admin sees request count, avg response time, error rate
- Admin sees top 10 endpoints by traffic
- Admin sees DB record counts
- Dashboard auto-refreshes
