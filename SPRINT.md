# Sprint — 2h Improvement Sprint (2026-03-06)

## Team
- **Team Lead** — koordinuoja darbą, code review, git merge conflicts
- **Dev 1 (Frontend)** — UI/UX, komponentai, responsive design
- **Dev 2 (Backend/Full-stack)** — API, DB, performance, security
- **QA/Tester** — testavimas, bug reporting, smoke tests
- **Product Owner** — prioritetai, UX review, acceptance criteria

## Sync-up: kas 20 min
Kiekvienas agentas po 20 min darbo turi:
1. Parašyti kas padaryta (DONE)
2. Kas daroma (IN PROGRESS)  
3. Ar yra blokerių (BLOCKERS)

## Backlog (prioritetų tvarka)

### P0 — Critical
- [ ] **BUG: API smoke test** — verify all API endpoints work with PostgreSQL
- [ ] **SEO: Sitemap regeneration** — ensure sitemap works with new DB
- [ ] **Performance: API response times** — test and optimize PG queries, add connection pooling if needed

### P1 — High
- [ ] **UX: Palyginimo funkcija** — darželių palyginimas šalia vienas kito (Compare feature)
- [ ] **Admin: Atsiliepimų moderavimas** — approve/reject workflow
- [ ] **Mobile: Bottom sheet modals** — full-screen modal on mobile devices
- [ ] **Search: Autocomplete/suggestions** — search suggestions dropdown

### P2 — Medium  
- [ ] **Forum: Notification system** — notify on replies
- [ ] **Maps: Integration** — show kindergarten on map (OpenStreetMap)
- [ ] **PWA: Offline support** — service worker for offline viewing
- [ ] **Analytics: Basic stats** — page views, popular searches
- [ ] **Photos: Kindergarten images** — upload/display photos
- [ ] **Aukle/Burelis: Detail pages** — dedicated detail pages (not just cards)

### P3 — Nice to have
- [ ] **Email: Contact forms** — contact kindergarten via email
- [ ] **Social: Share improvements** — better share cards, WhatsApp deep links
- [ ] **A11y: Full audit** — WCAG 2.1 AA compliance
- [ ] **i18n: Russian/English** — multi-language support

## Rules
- Commit often with clear messages
- Don't break the build
- Test before pushing
- Use Lithuanian for UI text
- Follow existing code style (Tailwind, Next.js App Router, Prisma)
- DB is now PostgreSQL on Neon (see .env)
