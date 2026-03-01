# TEAM BACKLOG — Vaikai.lt Production Sprint
## Updated by Tech Lead / PO continuously

### 🔴 Critical (Must Fix)
- [x] ~~Category tabs not switching data on city pages~~ (works correctly via server refetch)
- [x] ~~Review form not submitting / not visible in some cases~~ (tested, works end-to-end)
- [x] ~~Favorites page (/megstamiausieji) not loading saved items~~ (localStorage + API fetch works)
- [ ] Server crashes when left running (need pm2 or restart loop)
- [x] ~~Privacy/Contact pages removed but routes may still 404 ugly~~ (proper 404 page added)

### 🟡 Important (Should Do)
- [x] ~~Search case-insensitive for Lithuanian characters (ą,č,ę,ė,į,š,ų,ū,ž)~~ (JS toLocaleLowerCase)
- [x] ~~Pagination broken when switching categories~~ (resets page on category change)
- [x] ~~Admin panel - verify all CRUD operations work~~ (tested: list, search, delete)
- [x] ~~Admin panel - review moderation flow (approve/reject reviews)~~ (PATCH/DELETE tested)
- [ ] CompareTable component - verify it works in browser
- [ ] Mobile responsive - test all pages on small screens
- [x] ~~Dark mode - verify consistency across all components~~ (all cards, filters, admin, modals fixed)
- [x] ~~SearchBar on home page - verify it navigates to /paieska correctly~~ (works)
- [x] ~~CitySelector - verify all city links work~~ (43 cities mapped)

### 🟢 Enhancements (Nice to Have)
- [ ] Add more seed data - at least 1000+ kindergartens for realism
- [ ] Add images/photos placeholders for listings
- [ ] Add map integration (Google Maps embed for addresses)
- [x] ~~Add breadcrumb navigation on all pages~~ (city + search pages have breadcrumbs)
- [ ] Add "back to top" button on long pages
- [ ] Add cookie consent banner (GDPR)
- [ ] Add analytics placeholder (Google Analytics / Plausible)
- [ ] Add OpenGraph images per city
- [ ] Add share buttons on detail modals
- [ ] Add print-friendly styles
- [ ] Add keyboard navigation support (accessibility)
- [x] ~~Add ARIA labels to all interactive elements~~ (header, modal, tabs, buttons)
- [x] ~~Improve loading animations / transitions~~ (loading.tsx skeletons added)
- [ ] Add filter by district/area within city
- [ ] Add sorting by distance (if geolocation available)
- [ ] Add price range filter for aukles and specialists
- [ ] Add "recently viewed" section
- [ ] Add newsletter signup form in footer
- [ ] Add testimonials section on home page
- [ ] Improve FAQ section with more questions
- [ ] Add language switcher (LT/EN/RU) placeholder
- [ ] Add SSL/security headers config
- [ ] Add rate limiting on API routes
- [x] ~~Add input sanitization/XSS prevention~~ (HTML tag stripping on reviews)
- [ ] Cache API responses for better performance
- [ ] Add database indexes for frequent queries
- [ ] Optimize images with next/image
- [ ] Add Lighthouse score improvements (target 90+)

### ✅ Done
- [x] Initial MVP build (11 commits)
- [x] Remove privacy/contact links from footer
- [x] SEO: robots.ts, sitemap.ts, full metadata, JSON-LD
- [x] Dark mode consistency across all components
- [x] Lithuanian case-insensitive search
- [x] Review security (HTML stripping, approved-only public display)
- [x] Proper 404 for unknown routes
- [x] 43 city slugs mapped (was 19)
- [x] Loading skeletons for city and search pages
- [x] Error boundary page
