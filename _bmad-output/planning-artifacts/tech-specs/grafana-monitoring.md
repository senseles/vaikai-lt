# Tech Spec: Professional Monitoring with Grafana + Prometheus

## Stack
- **Grafana** — dashboards, drill-down, alerts (port 3001)
- **Prometheus** — metrics collection & storage (port 9090)
- **node_exporter** — system metrics (CPU, RAM, disk, network)
- **Next.js /metrics endpoint** — app metrics in Prometheus format (requests, response times, DB stats)

## Architecture
```
node_exporter:9100 ──→ Prometheus:9090 ──→ Grafana:3001
Next.js /api/metrics ──→ Prometheus:9090 ──→ Grafana:3001
PostgreSQL (MetricSnapshot) ──→ Grafana:3001 (direct DB datasource)
```

## Dashboards
1. System Overview — CPU, RAM, disk, load, network
2. Application — requests/sec, response times, error rates, top endpoints
3. Database — record counts, growth trends
4. Alerts — high CPU, high error rate, server down

## AC
- Grafana accessible at /admin/monitoring (proxied) or port 3001
- Pre-configured dashboards with real data
- Auto-start on boot
