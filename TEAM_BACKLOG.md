# TEAM BACKLOG — Vaikai.lt Production Sprint
## Updated by Tech Lead / PO continuously

### 🔴 Critical (Must Fix)
- [x] ~~Category tabs not switching data on city pages~~ (works correctly via server refetch)
- [x] ~~Review form not submitting / not visible in some cases~~ (tested, works end-to-end)
- [x] ~~Favorites page (/megstamiausieji) not loading saved items~~ (localStorage + API fetch works)
- [x] ~~Server crashes when left running~~ (scripts/server.sh with auto-restart loop)
- [x] ~~Privacy/Contact pages removed but routes may still 404 ugly~~ (proper 404 page added)

### 🟡 Important (Should Do)
- [x] ~~Search case-insensitive for Lithuanian characters (ą,č,ę,ė,į,š,ų,ū,ž)~~ (JS toLocaleLowerCase)
- [x] ~~Pagination broken when switching categories~~ (resets page on category change)
- [x] ~~Admin panel - verify all CRUD operations work~~ (tested: list, search, delete, create, edit)
- [x] ~~Admin panel - review moderation flow (approve/reject reviews)~~ (PATCH/DELETE tested)
- [x] ~~Admin panel - add item forms~~ (create/edit forms for all 4 item types)
- [x] ~~Admin panel - export data~~ (/api/admin/export endpoint for JSON/CSV)
- [x] ~~Admin panel - pending reviews count~~ (shows accurate count from DB)
- [x] ~~CompareTable component - verify it works in browser~~ (integrated into city page with checkbox + floating compare bar)
- [x] ~~Mobile responsive - test all pages on small screens~~ (verified: proper breakpoints, mobile menu, modals)
- [x] ~~Dark mode - verify consistency across all components~~ (all cards, filters, admin, modals fixed)
- [x] ~~SearchBar on home page - verify it navigates to /paieska correctly~~ (works)
- [x] ~~CitySelector - verify all city links work~~ (43 cities mapped)

### 🟢 Enhancements (Nice to Have)
- [x] ~~Add more seed data - at least 1000+ kindergartens for realism~~ (1437 kindergartens, 150 aukles, 164 bureliai, 124 specialists)
- [ ] Add images/photos placeholders for listings
- [ ] Add map integration (Google Maps embed for addresses)
- [x] ~~Add breadcrumb navigation on all pages~~ (city + search pages have breadcrumbs)
- [x] ~~Add "back to top" button on long pages~~ (BackToTop component, appears at 400px scroll)
- [x] ~~Add cookie consent banner (GDPR)~~ (CookieConsent component, localStorage persistence)
- [x] ~~Add analytics placeholder (Google Analytics / Plausible)~~ (Plausible script placeholder in layout.tsx)
- [x] ~~Add OpenGraph images per city~~ (dynamic OG image generation via next/og, 1200x630 green gradient)
- [x] ~~Add share buttons on detail modals~~ (copy link, Facebook, email in DetailModal)
- [x] ~~Add print-friendly styles~~ (print media query in globals.css)
- [x] ~~Add keyboard navigation support (accessibility)~~ (Enter/Space on all cards, Escape on modals, focus rings)
- [x] ~~Add ARIA labels to all interactive elements~~ (header, modal, tabs, buttons)
- [x] ~~Improve loading animations / transitions~~ (loading.tsx skeletons added)
- [x] ~~Add category filter for bureliai~~ (dropdown: Menai, Sportas, Muzika, etc.)
- [x] ~~Add specialty filter for specialists~~ (dropdown: Logopedas, Psichologas, etc.)
- [x] ~~Add filter by district/area within city~~ (area dropdown on city pages)
- [ ] Add sorting by distance (if geolocation available)
- [x] ~~Add "recently viewed" section~~ (localStorage-backed, horizontal scroll, shown on home page)
- [x] ~~Add newsletter signup form in footer~~ (NewsletterSignup component in Footer)
- [x] ~~Add testimonials section on home page~~ (Testimonials component with 3 reviews)
- [x] ~~Improve FAQ section with more questions~~ (expanded to 14 questions)
- [x] ~~Add language switcher (LT/EN/RU) placeholder~~ (dropdown in header, EN/RU disabled)
- [x] ~~Add SSL/security headers config~~ (HSTS, X-Frame-Options, X-Content-Type-Options, etc. via middleware)
- [x] ~~Add rate limiting on API routes~~ (30 req/15s public, 5 req/15s reviews, 10 req/60s admin login)
- [x] ~~Add input sanitization/XSS prevention~~ (HTML tag stripping on reviews)
- [x] ~~Cache API responses for better performance~~ (src/lib/cache.ts with TTL, applied to all GET routes)
- [x] ~~Add database indexes for frequent queries~~ (city, baseRating, name indexes on all models)
- [x] ~~Optimize font loading~~ (next/font/google Inter, self-hosted, preloaded)
- [x] ~~Add Lighthouse score improvements (target 90+)~~ (dynamic imports, compression, X-Powered-By removed, lazy DetailModal/CompareTable)

### ✅ Done (Sprint 3 — QA & Polish)
- [x] Fix /prisijungti 404 (middleware KNOWN_ROUTES missing)
- [x] Safe JSON.parse in kindergartens API (try-catch with fallback)
- [x] Accessibility: form labels on ReviewForm, Escape key + ARIA role on CookieConsent
- [x] 191 seed reviews added (243 total: kg, aukles, bureliai, specialists)
- [x] Performance: dynamic import DetailModal/CompareTable, gzip compression, no X-Powered-By
- [x] Search API expanded to cover city, specialty, category fields
- [x] Area/district filter on city pages
- [x] Lighthouse optimizations (lazy loading, compression, header cleanup)
- [x] Build-lock.sh script to prevent concurrent builds

### ✅ Done (Sprint 2)
- [x] QA V2 bugs fixed (BUG-1 XSS, BUG-2 sitemap, BUG-3 404 status, WARN-2, WARN-3)
- [x] Reviews require admin approval (isApproved default: false)
- [x] Rate limiting on all API routes
- [x] Security headers via middleware (HSTS, X-Frame-Options, CSP)
- [x] Database indexes for city/rating/name queries
- [x] Back to top button + GDPR cookie consent
- [x] CompareTable integration (kindergarten comparison with floating bar)
- [x] Server stability scripts (auto-restart loop)
- [x] Share buttons (copy link, Facebook, email)
- [x] Accessibility: keyboard nav, focus rings, ARIA labels
- [x] Print styles, newsletter, analytics placeholder
- [x] FAQ expanded to 14 questions + testimonials section
- [x] Admin panel: create/edit forms, export endpoint, pending reviews count
- [x] Recently viewed section (localStorage, shown on home page)
- [x] Dynamic OpenGraph images per city (next/og)
- [x] Font optimization (next/font/google, self-hosted)
- [x] Category/specialty filters for bureliai and specialists
- [x] Language switcher placeholder (LT active, EN/RU disabled)

### ✅ Done (Sprint 1)
- [x] Initial MVP build (11 commits)
- [x] Remove privacy/contact links from footer
- [x] SEO: robots.ts, sitemap.ts, full metadata, JSON-LD
- [x] Dark mode consistency across all components
- [x] Lithuanian case-insensitive search
- [x] Review security (HTML stripping, approved-only public display)
- [x] Proper 404 for unknown routes (HTTP 404 via middleware)
- [x] 43 city slugs mapped (was 19)
- [x] Loading skeletons for city and search pages
- [x] Error boundary page
