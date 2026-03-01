# SPRINT PLAN — Vaikai.lt Migration
## 24h Sprint | Start: 2026-03-01 03:00 EST | End: 2026-03-02 03:00 EST

## Team (7 members)
| Role | Agent | Responsibility |
|------|-------|----------------|
| **Tech Lead** | Main session | Architecture, code review, sync meetings, blockers |
| **Backend Dev 1** | `backend-1` | DB schema, Prisma, API routes (CRUD) |
| **Backend Dev 2** | `backend-2` | Data migration from script.js → PostgreSQL, seeding |
| **Frontend Dev 1** | `frontend-1` | React pages: Home, City, Category, Detail |
| **Frontend Dev 2** | `frontend-2` | React components: Cards, Modals, Filters, Admin |
| **QA** | `qa-sprint` | Testing every 40min, bug reports |
| **PO** | `po-sprint` | Acceptance criteria, UX decisions, priorities |

## Stack
- **Frontend:** Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes (App Router)
- **Database:** PostgreSQL (Neon free tier / local)
- **ORM:** Prisma
- **Auth:** NextAuth.js (admin)
- **Deploy:** Cloudflare Tunnel → localhost:3000

## Sprint Backlog (priority order)

### Phase 1 — Foundation (Hours 0-4)
- [ ] PostgreSQL schema (Prisma) — all tables
- [ ] Neon DB provisioning OR local SQLite for dev
- [ ] Data migration script (500+ items from script.js → DB)
- [ ] API routes: GET /api/darzeliai, /api/aukles, /api/bureliai, /api/specialistai
- [ ] Base layout (header, nav, footer, category tabs)
- [ ] Home page with hero + city selector

### Phase 2 — Core Features (Hours 4-12)
- [ ] City listing page with cards
- [ ] Detail modal/page
- [ ] Category filtering (type, price, city, specialty)
- [ ] Search with Lithuanian diacritics
- [ ] Review system (POST /api/reviews) — stored in DB!
- [ ] Star ratings
- [ ] Admin auth (NextAuth)
- [ ] Admin CRUD panel

### Phase 3 — Polish (Hours 12-20)
- [ ] Favorites (DB-backed for logged-in, localStorage for anonymous)
- [ ] Comparison feature
- [ ] Dark mode
- [ ] Mobile responsive (bottom-sheet modals, touch)
- [ ] SEO: meta tags, structured data, sitemap
- [ ] Share functionality

### Phase 4 — QA & Deploy (Hours 20-24)
- [ ] Full QA pass
- [ ] Performance optimization
- [ ] Deploy to Cloudflare Tunnel
- [ ] Data verification
- [ ] Documentation

## Sync Meetings (every 40 min)
Format:
1. Each dev: What did I do? What's next? Any blockers?
2. QA: Test results, open bugs
3. PO: Priority adjustments
4. Tech Lead: Architecture decisions

## Database Schema (target)
```
User (id, email, name, role, passwordHash, createdAt)
Kindergarten (id, name, city, region, area, address, type, phone, website, language, ageFrom, groups, hours, features, description, baseRating, baseReviewCount, createdAt)
Aykle (id, name, city, region, area, phone, email, experience, ageRange, hourlyRate, languages, description, availability, baseRating, baseReviewCount, createdAt)
Burelis (id, name, city, region, area, category, subcategory, ageRange, price, schedule, phone, website, description, baseRating, baseReviewCount, createdAt)
Specialist (id, name, city, region, area, specialty, clinic, price, phone, website, languages, description, baseRating, baseReviewCount, createdAt)
Review (id, itemId, itemType, authorName, rating, text, createdAt, isApproved)
Favorite (id, itemId, itemType, sessionId, userId?, createdAt)
```

## Working Directory
`/home/openclaw/Projects/vaikai-lt/`

## Source Data
`/home/openclaw/Projects/darzeliai-atsiliepimai/script.js`
- DEFAULT_KINDERGARTENS: ~343 items
- DEFAULT_AUKLES: ~50 items
- DEFAULT_BURELIAI: ~64 items
- DEFAULT_SPECIALISTAI: ~44 items
