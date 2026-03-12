# Address & Contact Fixer — Status Log

## 2026-03-12 — Session Start

**Time:** Start
**Status:** Beginning data remediation
**Current city:** Alytus (16 kindergartens — verified reference data available)
**Records fixed:** 0
**Issues found:** Per verification report: 769 broken websites, 78 vague addresses, 86 wrong-format phones, 43 placeholder aukles

### Plan
1. Fix Alytus with verified data
2. Remove placeholder aukles
3. Null broken *.lm.lt websites
4. Work through cities: Vilnius → Kaunas → Klaipėda → Šiauliai → Panevėžys → smaller

---

## 2026-03-12 — Entity Verification Complete

**Time:** Entity verification session
**Status:** DONE — all 379 non-kindergarten entities verified

### Results

| Entity Type | Before | Deleted | Added | After |
|---|---|---|---|---|
| Aukles | 129 | 104 | 2 | 27 |
| Bureliai | 145 | 55 | 6 | 96 |
| Specialists | 105 | 35 | 2 | 72 |
| **TOTAL** | **379** | **194** | **10** | **195** |

### What was removed
- **36 generic placeholder aukles** ("Aukle Alytuje", "Valandine aukle Kaune", etc.)
- **55 fabricated individual nannies** from seed-more.ts (fake names + city landlines + gmail)
- **13 duplicate portal entries** (same portal listed 2-3x under different names)
- **55 fabricated bureliai** with non-existent domain names
- **35 fabricated specialist individuals** with fake clinic names

### What was added
- CodeAcademy Kids (Vilnius, Kaunas, Klaipeda)
- Algorithmics (Vilnius)
- Bricks4Kidz (Vilnius, Klaipeda)
- Gijos klinikos, Mano Seimos Gydytojas
- Babysits + Superaukle for Panevezys

### Verification method
Every entity web-searched. Real ones confirmed via official websites, Facebook, business registries, manodaktaras.lt. Fabricated ones identified by non-existent domains, generated name patterns, seed-more.ts code analysis.

### Scripts
- `scripts/verify-entities.ts` — cleanup (194 deletions)
- `scripts/add-missing-entities.ts` — additions (10 new verified entities)

---

## 2026-03-12 — Address & Contact Fixer — Progress Update 1

**Time:** ~15 min into session
**Status:** Major cleanup in progress

### Completed
| Action | Count |
|---|---|
| Alytus kindergartens fixed (addresses, phones, websites from verified sources) | 8 updated |
| Alytus fabricated kindergartens deleted | 8 deleted |
| Placeholder aukles deleted (generic entries with no contact info) | 43 deleted |
| Broken *.lm.lt kindergarten websites nulled | 760 nulled |
| Fabricated bureliai websites nulled (kebab-case generated domains) | 55 nulled |
| Malformed phone numbers nulled (wrong digit count) | 86 nulled |
| Vilnius fabricated kindergartens deleted (no city prefix, fake addresses) | 168 deleted |
| Kaunas fabricated + duplicate kindergartens deleted | 80 deleted |
| All other cities fabricated + duplicate kindergartens deleted | 289 deleted |

### Current state
| Metric | Before | After |
|---|---|---|
| Total kindergartens | 771 | 337 |
| Kindergartens with broken websites | 769 | ~0 |
| Malformed phone numbers | 86 | 0 |
| Placeholder aukles | 43 | 0 |

### In progress
- Researching correct addresses for ~45 remaining unverified Vilnius entries
- Researching correct addresses for ~50 remaining unverified Kaunas entries
- Background agents running web searches for verified data

### Issues
- Many "Vilniaus l-d" / "Kauno l-d" entries have addresses that look plausible but can't be verified without individual lookup
- Phone numbers may still be fabricated even when format is correct
- Some cities left with 0 kindergartens (Neringa, Švenčionys, Kazlų Rūda, etc.) — need to add real entries

---

## 2026-03-12 — Review Quality Checker — COMPLETE

**Status:** DONE

### Audit findings
- **Before:** 6,144 reviews, only 435 unique texts (most repeated 35x!)
- Reviews were completely generic — same text on 30+ different kindergartens
- No reviews referenced entity-specific features (Logopedas, Baseinas, etc.)
- 10 entities had >15 reviews

### What was fixed
Rewrote `scripts/seed-reviews.ts` with:
1. **Feature injection** — 50+ feature types mapped to natural review snippets (logopedė, baseinas, Montessori, etc.)
2. **Category-specific** reviews for būreliai (Robotika, Šokiai, Sportas)
3. **Specialty-specific** reviews for specialists (Logopedas, Psichologas)
4. **Location-aware** reviews ("šalia Pavilnio parko")
5. **Real parent concerns** — eilė ilga, adaptuotis sunku, per didelės grupės
6. **Max 15 reviews/entity** enforced
7. **baseReviewCount + baseRating synced** and verified

### Results
| Metric | Before | After |
|--------|--------|-------|
| Total reviews | 6,144 | 3,850 |
| Unique texts | 435 | 884 |
| Max text repetition | 35x | 17x |
| Feature-specific reviews | 0 | ~336 |
| Max reviews/entity | 18 | 15 |
| Rating distribution | ✓ | ✓ (5/10/20/35/30%) |
