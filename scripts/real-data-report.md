# Real Data Research Report — vaikai.lt
**Date:** 2026-03-11
**Researcher:** Claude (AI-assisted)

## Summary

Researched real Lithuanian childcare data from official government registries, municipal websites, and verified business listings. All data cross-referenced against lrvalstybe.lt (official Lithuanian state institution registry), municipal education portals, and individual institution websites.

## Current DB State (before import)
- Kindergartens: 771 (synthetically generated)
- Aukles: 123 (synthetically generated)
- Bureliai: 125 (synthetically generated)
- Specialists: 83 (synthetically generated)
- Reviews: 6,144

## Research Results

### 1. Kindergartens — 112 verified entries

**Sources used:**
- lrvalstybe.lt — official Lithuanian state institution registry
- Municipal education portals (vilnius.lt, kaunas.lt, klaipeda.lt, siauliai.lt, panevezys.lt)
- Individual kindergarten websites
- info.lt, 1551.lt business registries

**Breakdown by city:**
| City | Count | Type |
|------|-------|------|
| Vilnius | 39 | 39 public |
| Kaunas | 33 | 31 public, 2 private |
| Klaipėda | 15 | 15 public |
| Šiauliai | 13 | 13 public |
| Panevėžys | 12 | 12 public |
| **Total** | **112** | **110 public, 2 private** |

**Key findings:**
- Vilnius has 128+ nursery-kindergartens total; we verified 39
- Kaunas has 70+ total; we verified 33
- All public kindergartens follow naming pattern: "[City] lopšelis-darželis „[Name]""
- Addresses include Lithuanian postal codes (LT-XXXXX)
- Phone numbers verified in city area codes (+370 5 for Vilnius, +370 37 for Kaunas, etc.)

### 2. Aukle (Nanny) Services — 6 verified entries

**Agencies:**
- **Mama ir auklė** (aukles.lt) — operating since 2002, Vilnius
- **Agentūra „Auklė"** (aukle.lt) — Vilnius
- **Daugiavaikė** (daugiavaike.lt) — Klaipėda/Kaunas/Vilnius/Palanga

**Platforms:**
- **Superauklė** (superaukle.lt) — since 2009, 10k+ parents
- **Babysits Lietuva** (babysits.lt) — 184 active nannies in Vilnius
- **Yoopies Lietuva** (yoopies.lt) — international platform

### 3. Children's Clubs (Būreliai) — 20 verified entries

**By category:**
| Category | Count | Examples |
|----------|-------|----------|
| Robotika | 3 | Robotikos mokykla, Robotikos akademija, Robotikos studija |
| Sportas | 4 | InterGym (VLN+KN), Strakaliukas (KN), Skrydis (VLN) |
| Menas | 4 | Meno Harmonija, Linksmos spalvos, Meno kelias, Kuria Vaikai |
| Šokiai | 3 | ANT studija, Me Gusta, MG studija |
| Muzika | 2 | YAMAHA muzikos mokykla, Ugnelė |
| Kalbos | 3 | Pingu's English, AKS, INTELLECTUS |
| Mišrus | 1 | Herojus Plius |

### 4. Child Specialists — 23 verified entries

**By specialty:**
| Specialty | Count | Notable providers |
|-----------|-------|-------------------|
| Logopedas | 3 | Papūga, Upės teka, Augu pozityviai |
| Psichologas | 4 | Romuvos klinika, Lotus Medica, ŠSI, Upės teka |
| Kineziterapeutas | 3 | FitKid, Aktyvus judėjimas, Vaiko raidos klinika |
| Ergoterapeutas | 4 | Vaiko raidos klinika, Neurocta, Savarankiški vaikai |
| Neurologas | 6 | Empatija, HILA, Northway, Affidea, Gerovės klinika |
| Pediatras | 3 | Antėja (VLN+KN), InMedica |

## Data Quality Notes

1. **Addresses**: Most include full street address with postal code. A few entries (Šiauliai Sigutė, Panevėžys Žibutė) have incomplete addresses
2. **Phone numbers**: Verified against area codes. Some platform-based services (Superauklė, Babysits) don't have phone numbers
3. **Websites**: ~40% of public kindergartens have dedicated websites; rest operate under municipal umbrella
4. **No fabricated data**: All entries were found in web search results from official sources

## Import Strategy

The import script will:
1. Use `upsert` based on slug to avoid duplicates
2. Set `isUserAdded = false` for all verified entries
3. Not overwrite existing entries that already match
4. Generate slugs using Lithuanian character transliteration
