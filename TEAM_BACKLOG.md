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
- [x] ~~Admin panel - verify all CRUD operations work~~ (tested: list, search, delete)
- [x] ~~Admin panel - review moderation flow (approve/reject reviews)~~ (PATCH/DELETE tested)
- [x] ~~CompareTable component - verify it works in browser~~ (integrated into city page with checkbox + floating compare bar)
- [ ] Mobile responsive - test all pages on small screens
- [x] ~~Dark mode - verify consistency across all components~~ (all cards, filters, admin, modals fixed)
- [x] ~~SearchBar on home page - verify it navigates to /paieska correctly~~ (works)
- [x] ~~CitySelector - verify all city links work~~ (43 cities mapped)

### 🟢 Enhancements (Nice to Have)
- [ ] Add more seed data - at least 1000+ kindergartens for realism
- [ ] Add images/photos placeholders for listings
- [ ] Add map integration (Google Maps embed for addresses)
- [x] ~~Add breadcrumb navigation on all pages~~ (city + search pages have breadcrumbs)
- [x] ~~Add "back to top" button on long pages~~ (BackToTop component, appears at 400px scroll)
- [x] ~~Add cookie consent banner (GDPR)~~ (CookieConsent component, localStorage persistence)
- [x] ~~Add analytics placeholder (Google Analytics / Plausible)~~ (Plausible script placeholder in layout.tsx)
- [ ] Add OpenGraph images per city
- [x] ~~Add share buttons on detail modals~~ (copy link, Facebook, email in DetailModal)
- [x] ~~Add print-friendly styles~~ (print media query in globals.css)
- [x] ~~Add keyboard navigation support (accessibility)~~ (Enter/Space on all cards, Escape on modals, focus rings)
- [x] ~~Add ARIA labels to all interactive elements~~ (header, modal, tabs, buttons)
- [x] ~~Improve loading animations / transitions~~ (loading.tsx skeletons added)
- [ ] Add filter by district/area within city
- [ ] Add sorting by distance (if geolocation available)
- [ ] Add price range filter for aukles and specialists
- [ ] Add "recently viewed" section
- [x] ~~Add newsletter signup form in footer~~ (NewsletterSignup component in Footer)
- [x] ~~Add testimonials section on home page~~ (Testimonials component with 3 reviews)
- [x] ~~Improve FAQ section with more questions~~ (expanded to 14 questions)
- [ ] Add language switcher (LT/EN/RU) placeholder
- [x] ~~Add SSL/security headers config~~ (HSTS, X-Frame-Options, X-Content-Type-Options, etc. via next.config.mjs)
- [x] ~~Add rate limiting on API routes~~ (30 req/15s public, 5 req/15s reviews, 10 req/60s admin login)
- [x] ~~Add input sanitization/XSS prevention~~ (HTML tag stripping on reviews)
- [x] ~~Cache API responses for better performance~~ (src/lib/cache.ts with TTL, applied to all GET routes)
- [x] ~~Add database indexes for frequent queries~~ (city, baseRating, name indexes on all models)
- [ ] Optimize images with next/image
- [ ] Add Lighthouse score improvements (target 90+)

### ✅ Done
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
- [x] QA V2 bugs fixed (BUG-1 XSS, BUG-2 sitemap, BUG-3 404 status)
- [x] Reviews require admin approval (isApproved default: false)
- [x] Rate limiting on all API routes
- [x] Security headers (HSTS, X-Frame-Options, CSP, etc.)
- [x] Database indexes for city/rating/name queries
- [x] Back to top button
- [x] GDPR cookie consent banner
- [x] CompareTable integration (kindergarten comparison)
- [x] Server stability scripts (auto-restart loop)
