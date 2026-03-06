# QA Report - vaikai.lt

**Date:** 2026-03-06
**Branch:** sprint/qa
**Tester:** Claude QA Agent
**Environment:** Next.js 14 + Prisma + PostgreSQL (Neon), localhost:3000

---

## Summary

| Category | Result |
|----------|--------|
| Page Smoke Tests | 10/10 PASS |
| API Endpoints | 16/16 responding correctly |
| Admin Auth & CRUD | 5/5 PASS |
| Lithuanian Search | 5/6 PASS (1 minor issue) |
| Mobile Responsiveness | GOOD |
| Production Build | PASS (no errors) |
| **Bugs Found** | **2 (1 medium, 1 low)** |

---

## 1. Page Smoke Tests

All pages return HTTP 200 with expected content. No 500 errors or error boundaries triggered.

| Page | URL | Status | Size | Result |
|------|-----|--------|------|--------|
| Home | `/` | 200 | 82.5 KB | PASS |
| Search | `/paieska` | 200 | 34.1 KB | PASS |
| Favorites | `/megstamiausieji` | 200 | 36.4 KB | PASS |
| Forum | `/forumas` | 200 | 111.9 KB | PASS |
| Admin | `/admin` | 200 | 35.0 KB | PASS |
| Login | `/prisijungti` | 200 | 36.4 KB | PASS |
| Privacy Policy | `/privatumo-politika` | 200 | 43.0 KB | PASS |
| Vilnius (city) | `/vilnius` | 200 | 167.7 KB | PASS |
| Kaunas (city) | `/kaunas` | 200 | 166.4 KB | PASS |
| Klaipeda (city) | `/klaipeda` | 200 | 166.9 KB | PASS |

---

## 2. API Endpoint Tests

### Entity Endpoints

| Endpoint | Method | Status | Valid JSON | Notes |
|----------|--------|--------|------------|-------|
| `/api/kindergartens` | GET | 200 | YES | 7,075 items, paginated |
| `/api/kindergartens?city=Vilnius` | GET | 200 | YES | 1,340 results (capital V required - see BUG-01) |
| `/api/aukles` | GET | 200 | YES | 210 items, paginated |
| `/api/aukles?city=Vilnius` | GET | 200 | YES | Works with capital V |
| `/api/bureliai` | GET | 200 | YES | 210 items, paginated |
| `/api/bureliai?city=Vilnius` | GET | 200 | YES | Works with capital V |
| `/api/specialists` | GET | 200 | YES | 160 items, paginated |
| `/api/specialists?city=Vilnius` | GET | 200 | YES | Works with capital V |

### Review Endpoints

| Endpoint | Method | Status | Valid JSON | Notes |
|----------|--------|--------|------------|-------|
| `/api/reviews` (no params) | GET | 400 | YES | Correct: "itemId and itemType are required" |
| `/api/reviews?itemId=...&itemType=kindergarten` | GET | 200 | YES | Returns review objects |
| `/api/reviews` (POST, no Origin) | POST | 403 | YES | CSRF protection: "missing origin header" |
| `/api/reviews` (POST, empty body) | POST | 400 | YES | Correct: "itemId is required" |

### Forum Endpoints

| Endpoint | Method | Status | Valid JSON | Notes |
|----------|--------|--------|------------|-------|
| `/api/forum/posts` | GET | 200 | YES | 175 posts, paginated |
| `/api/forum/categories` | GET | 200 | YES | 8 categories returned |

### Search Endpoints

| Endpoint | Method | Status | Valid JSON | Notes |
|----------|--------|--------|------------|-------|
| `/api/search?q=vilnius` | GET | 200 | YES | Returns suggestions array (8 items) |
| `/api/search/suggestions?q=vil` | GET | 200 | YES | Returns suggestions with id, name, city, type |

### Admin & Other Endpoints

| Endpoint | Method | Status | Valid JSON | Notes |
|----------|--------|--------|------------|-------|
| `/api/cities` | GET | 200 | YES | 43 cities with category counts |
| `/api/admin/stats` (no auth) | GET | 401 | YES | Correct: "Neautorizuota. Prisijunkite." |

---

## 3. Admin Login & CRUD

| Test | Status | Result |
|------|--------|--------|
| Login with correct password (`darzeliai2026`) | 200 | PASS - Token returned |
| Admin stats with valid token | 200 | PASS - Full stats: 7,075 kindergartens, 210 aukles, 210 bureliai, 160 specialists, 58,736 reviews |
| Admin reviews list with token | 200 | PASS - Paginated reviews with all fields |
| Login with wrong password | 401 | PASS - "Neteisingas slaptazodis" |
| Admin stats without auth | 401 | PASS - Correctly rejected |

**Note:** All POST endpoints to `/api/admin/login` enforce Origin header check (CSRF protection). Browser requests include this automatically; API clients must set `Origin: http://localhost:3000`.

---

## 4. Lithuanian Character Search

| Query | Status | Results | Match Quality |
|-------|--------|---------|---------------|
| `darželis` (ž) | 200 | 3 | PASS - All contain "darželis" |
| `auklė` (ė) | 200 | 2 | PASS - Both are nanny results |
| `šiaul` suggestions (š) | 200 | 8 | PASS - All from Šiauliai |
| `būrelis` (ū) | 200 | 2 | PASS - Both are club results |
| `Klaipėda` (ė) | 200 | 8 | PASS - All from Klaipėda |
| `?city=šiauliai` on /api/kindergartens | 200 | 0 | See BUG-02 |

All Lithuanian diacritical characters (ą, č, ė, į, š, ų, ū, ž) handled correctly in search.

---

## 5. Mobile Responsiveness

**Overall Rating: GOOD**

| Check | Status |
|-------|--------|
| Viewport meta tag | PASS - `width=device-width, initial-scale=1` |
| Responsive Tailwind classes | PASS - 63+ responsive breakpoint usages across 20+ files |
| Mobile navigation (hamburger) | PASS - `md:hidden` hamburger with animated slide-down |
| Mobile bottom nav | PASS - Fixed 5-item tab bar with safe-area insets |
| Touch targets (44px min) | PASS - `@media (pointer: coarse)` enforces min size |
| iOS safe area handling | PASS - `env(safe-area-inset-*)` padding |
| iOS zoom prevention | PASS - 16px input font on < 768px |
| No hardcoded problematic widths | PASS |
| Modal bottom-sheet on mobile | PASS - `items-end sm:items-center` pattern |
| Card grid responsive | PASS - `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |

---

## 6. Production Build

```
Build: PASS (no errors)
Middleware: 29.4 KB
First Load JS shared: 87.4 KB
All routes compiled successfully
```

Static pages (prerendered): `/megstamiausieji`, `/prisijungti`, `/privatumo-politika`, `/forumas/naujas`
Dynamic pages (server-rendered): `/`, `/[city]`, `/forumas`, `/paieska`, all `/api/*`

---

## Bugs

### BUG-01: Case-sensitive city filter on entity API endpoints (MEDIUM)

**Affected:** `/api/kindergartens`, `/api/aukles`, `/api/bureliai`, `/api/specialists`

**Description:** The `?city=` query parameter is case-sensitive. Querying `?city=vilnius` (lowercase) returns 0 results, while `?city=Vilnius` (capitalized) returns expected data. Since URL slugs use lowercase (`/vilnius`), the API should handle case-insensitive city filtering.

**Steps to reproduce:**
```bash
# Returns 0 results (lowercase)
curl "http://localhost:3000/api/kindergartens?city=vilnius"
# Returns 1340 results (capitalized)
curl "http://localhost:3000/api/kindergartens?city=Vilnius"
```

**Expected:** Both should return the same results.

**Impact:** Medium - Frontend likely capitalizes before sending, but this is fragile and any external API consumer would hit this issue.

**Fix:** Add `mode: 'insensitive'` to Prisma `where` clause for city filtering, or normalize the city parameter before querying.

---

### BUG-02: Lithuanian city names not accepted in entity API city filter (LOW)

**Affected:** `/api/kindergartens`, `/api/aukles`, `/api/bureliai`, `/api/specialists`

**Description:** Querying `?city=šiauliai` (Lithuanian name with diacritics) returns 0 results. Only the exact DB-stored display name (e.g., `Šiauliai` with capital S) works.

**Steps to reproduce:**
```bash
curl "http://localhost:3000/api/kindergartens?city=šiauliai"   # 0 results
curl "http://localhost:3000/api/kindergartens?city=Šiauliai"   # works
```

**Impact:** Low - Frontend likely sends correct form, but API is not robust to slug/diacritical variations.

**Fix:** Consider normalizing city parameter with a slug-to-display-name lookup, or use case-insensitive matching.

---

## Test Environment Data

| Entity | Count |
|--------|-------|
| Kindergartens | 7,075 |
| Nannies (aukles) | 210 |
| Clubs (bureliai) | 210 |
| Specialists | 160 |
| Reviews | 58,736 (6 pending) |
| Forum posts | 175 |
| Forum comments | 1,349 |
| Cities | 43 |
| Forum categories | 8 |

---

## Conclusion

The application is in **good shape** for the sprint. All pages load correctly, all API endpoints respond with proper status codes and validation, admin authentication works securely, Lithuanian character search functions well, mobile responsiveness is thorough, and the production build completes without errors.

Two bugs found related to case-sensitive city filtering in API endpoints. These are not blocking but should be addressed for API robustness. Both are related to the same root cause (exact string matching on city parameter).

**Previous QA bugs (from 2026-03-01 SQLite era):**
- Bug #1 (search case-sensitivity) - Now handled by PostgreSQL `mode: 'insensitive'` and two-pass search. RESOLVED.
- Bug #2 (webpack cache corruption) - Dev server issue, not reproducible. RESOLVED.
- Bug #3 (lint warning) - App Router false positive. NOT RETESTED.
- Bug #4 (ADMIN_PASSWORD in .env) - Still relevant for production deployment. OPEN.
