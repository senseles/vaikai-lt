# TEAM BACKLOG — Vaikai.lt Production Sprint
## Updated by Tech Lead / PO continuously

### 🔴 Critical (Must Fix)
- [ ] Category tabs not switching data on city pages (backend fixing)
- [ ] Review form not submitting / not visible in some cases
- [ ] Favorites page (/megstamiausieji) not loading saved items
- [ ] Server crashes when left running (need pm2 or restart loop)
- [ ] Privacy/Contact pages removed but routes may still 404 ugly

### 🟡 Important (Should Do)
- [ ] Search case-insensitive for Lithuanian characters (ą,č,ę,ė,į,š,ų,ū,ž)
- [ ] Pagination broken when switching categories (resets to page 1 but shows wrong data)
- [ ] Admin panel - verify all CRUD operations work
- [ ] Admin panel - review moderation flow (approve/reject reviews)
- [ ] CompareTable component - verify it works or remove if broken
- [ ] Mobile responsive - test all pages on small screens
- [ ] Dark mode - verify consistency across all components
- [ ] SearchBar on home page - verify it navigates to /paieska correctly
- [ ] CitySelector - verify all city links work

### 🟢 Enhancements (Nice to Have)
- [ ] Add more seed data - at least 1000+ kindergartens for realism
- [ ] Add images/photos placeholders for listings
- [ ] Add map integration (Google Maps embed for addresses)
- [ ] Add breadcrumb navigation on all pages
- [ ] Add "back to top" button on long pages
- [ ] Add cookie consent banner (GDPR)
- [ ] Add analytics placeholder (Google Analytics / Plausible)
- [ ] Add OpenGraph images per city
- [ ] Add share buttons on detail modals
- [ ] Add print-friendly styles
- [ ] Add keyboard navigation support (accessibility)
- [ ] Add ARIA labels to all interactive elements
- [ ] Improve loading animations / transitions
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
- [ ] Add input sanitization/XSS prevention
- [ ] Cache API responses for better performance
- [ ] Add database indexes for frequent queries
- [ ] Optimize images with next/image
- [ ] Add Lighthouse score improvements (target 90+)

### ✅ Done
- [x] Initial MVP build (11 commits)
- [x] Remove privacy/contact links from footer
