# Tech Spec: Security Hardening V2 — Scan Report Fixes

## Source
Security Scan Report 2026-03-19 — 6 issues found (1 HIGH, 3 MEDIUM, 2 LOW)

## Stories

### Story 1: Login Rate Limiting (HIGH) — 3 SP
- Rate limit `/api/auth/callback/credentials` — 5 attempts per IP per 5 minutes
- After 5 failed attempts → block IP for 15 min + return error message
- Log failed attempts with IP + timestamp
- Use existing `checkRateLimitDb()` infrastructure

**AC:** 10 rapid login attempts → first 5 return normal, attempts 6-10 return 429 Too Many Requests

### Story 2: NEXTAUTH_URL Fix (MEDIUM) — 1 SP
- Set `NEXTAUTH_URL` in `.env` to production URL
- Providers endpoint should show https URLs, not localhost

**AC:** `/api/auth/providers` returns https URLs, not http://localhost:3000

### Story 3: Login Audit + IP Logging (MEDIUM) — 2 SP
- Log all admin login attempts (success + failure) to AuditLog
- Include IP, userAgent, timestamp
- Show in `/admin/audit` page

**AC:** Failed and successful logins visible in audit log

### Story 4: Autocomplete Attribute (LOW) — 0.5 SP
- Add `autocomplete="current-password"` to login form password input

### Story 5: CSP Nonce-based (LOW) — 3 SP
- Replace `unsafe-inline` with nonce-based CSP for scripts
- Use Next.js middleware to generate per-request nonce

### Story 6: Block Auth Info Endpoints (MEDIUM) — 1 SP
- Block/restrict `/api/auth/providers` and `/api/auth/csrf` for unauthenticated requests via middleware

## Out of Scope (Future)
- Username + 2FA (Story 3 from report) — significant effort, park for later epic
- Would require full auth system redesign

## Total: ~10.5 SP
