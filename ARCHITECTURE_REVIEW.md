# Vaikai.lt — Architektūrinis Auditas

**Data:** 2026-03-13
**Auditorius:** Vyresnysis Software Architektas
**Technologijos:** Next.js 14 App Router, Prisma 5, PostgreSQL, NextAuth 4, Tailwind CSS
**Apimtis:** ~7,500 įstaigų, ~59,000 atsiliepimų, forumas, admin panel

---

## Executive Summary

**Bendras įvertinimas: C+**

Projektas turi solidų pagrindą — Next.js App Router su Prisma yra tinkamas pasirinkimas šiam produktui, o pagrindiniai saugumo mechanizmai (CSRF, rate limiting, XSS apsauga, HMAC tokenai) yra įdiegti. Tačiau auditas atskleidė **2 kritines saugumo spragas**, kelias architektūrines problemas, kurios neleis skalintis, ir nemažai techninio skolos, kuri apsunkina palaikymą.

### Greitoji rizikų suvestinė

| Sritis | Įvertinimas | Komentaras |
|--------|:-----------:|------------|
| Architektūriniai sprendimai | B | Tinkamas stack, bet polimorfinis entity modelis kelia problemų |
| DB schema | C+ | Dubliuoti modeliai, JSON string laukai, nėra FK entity→review |
| API dizainas | C | Nėra schema validacijos, nenuoseklūs response formatai |
| Auth architektūra | C- | Trys auth mechanizmai, `user_token` niekur neverifikuojamas |
| Security | D+ | **Kritinis: mass assignment admin PUT, timing attack legacy passwords** |
| Performance | C | In-memory cache/rate-limit neveiks serverless, hot sort be limito |
| Code quality | C+ | DRY pažeidimai, daug `as any`, bet gera struktūra |
| Scalability | C- | In-memory state neveiks su >1 instancija |

---

## 1. Architektūriniai Sprendimai (B)

### Teigiama
- **Next.js 14 App Router + Prisma + PostgreSQL** — tinkamas pasirinkimas lietuviškam content-heavy projektui su SEO poreikiais
- Server Components leidžia efektyviai generuoti statinį turinį
- `generateStaticParams` 43 miestams — geras ISR panaudojimas
- Dynamic imports (`next/dynamic`) Footer, BackToTop, CookieConsent — teisingas code splitting

### Problemos

**P1: Polimorfinis entity modelis be abstrakcijos**

4 entity modeliai (`Kindergarten`, `Aukle`, `Burelis`, `Specialist`) turi ~70% bendrų laukų, bet yra atskiros lentelės. `Review.itemId` + `Review.itemType` — tai "poor man's polymorphism" be DB-level FK enforcement.

```
Review.itemId → ??? (nėra FK constrainto)
```

**Pasekmė:** Galima sukurti review su neegzistuojančiu `itemId`. Nors kodas tikrina `entityExists`, DB lygmenyje referencial integrity negarantuotas.

**Rekomendacija:** Ilgainiui apsvarstyti vieningą `Entity` lentelę su `type` discriminator arba bent jau sukurti DB-level CHECK constraint. Trumpuoju laikotarpiu — šiuo metu kodas tikrina programiniu lygiu, tai priimtina MVP stadijoje.

**P2: `features` laukas — JSON string vietoj reliacijos**

```prisma
// schema.prisma:78
features String @default("[]")
```

```typescript
// kindergartens/route.ts:47
data: items.map((i) => { try { return { ...i, features: JSON.parse(i.features) }; } catch { return { ...i, features: [] }; } }),
```

Kiekvienas GET parse'ina JSON kiekvienam darželiui. Su 7,000+ darželių tai nereikalingas overhead.

**Rekomendacija:** Naudoti `Json` tipą Prisma schemoje arba sukurti atskirą `Feature` lentelę.

---

## 2. DB Schema (C+)

### Radiniai

**P3: Dubliuoti modeliai (DRY pažeidimas)**

`Kindergarten`, `Aukle`, `Burelis`, `Specialist` turi identišką indeksavimo strategiją ir daug bendrų laukų:
```prisma
// Kartojasi 4 kartus:
@@index([city])
@@index([city, baseRating])
@@index([name])
@@index([createdAt])
```

**P4: `ForumVote` modelis — nullable foreign keys**

```prisma
// schema.prisma:268-270
postId    String?
commentId String?
```

Tai leidžia sukurti balsą su `postId = null AND commentId = null`. Nėra CHECK constraint'o.

**P5: `Favorite` modelio `sessionId` — legacy field**

```prisma
// schema.prisma:203
sessionId String
```

Bet kodas naudoja `userId` autentikacijai, o `sessionId` nustatomas kaip `userId`:
```typescript
// favorites/route.ts:55
data: { itemId, itemType, userId, sessionId: userId },
```

Tai legacy campo, kuris turėtų būti pašalintas.

**P6: Review modelyje nėra `updatedAt`**

Kiti modeliai turi `@updatedAt`, bet Review — ne. Jei ateityje norėsite leisti redaguoti atsiliepimus, reikės migracijos.

**P7: `NewsletterSubscriber.email` indeksas perteklinis**

```prisma
email String @unique  // @unique jau sukuria indeksą
@@index([email])       // dubliuotas indeksas
```

### Rekomendacijos
- Pašalinti `@@index([email])` iš `NewsletterSubscriber` (perteklinis)
- Pridėti `updatedAt DateTime @updatedAt` į `Review`
- Pridėti DB-level check: `ForumVote` turi turėti ARBA `postId` ARBA `commentId`
- Pašalinti `sessionId` iš `Favorite` arba padaryti optional

---

## 3. API Dizainas (C)

### Radiniai

**P8: Nėra schema validacijos bibliotekos**

Kiekvienas endpoint'as rankiniu būdu tikrina kiekvieną lauką:
```typescript
// reviews/route.ts:74-109 — 35+ eilutės validacijos
if (!itemId || typeof itemId !== 'string') { ... }
if (rating == null || typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) { ... }
```

**Rekomendacija:** Įdiegti `zod` validaciją. Pavyzdys:

```typescript
import { z } from 'zod';

const reviewSchema = z.object({
  itemId: z.string().min(1),
  itemType: z.enum(['kindergarten', 'aukle', 'burelis', 'specialist']),
  authorName: z.string().min(1).max(100).transform(stripHtml),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(2000).transform(stripHtml),
});
```

**P9: Nenuoseklūs response formatai**

```typescript
// admin routes: { success: true, data: {...} }
// reviews GET:  [...]  (plain array)
// kindergartens: { data: [...], pagination: {...} }
// favorites:    { favorites: [...] } / { isFavorited: true }
// newsletter:   { message: '...' }
```

**Rekomendacija:** Standartizuoti: `{ success: boolean, data?: T, error?: string, pagination?: P }`.

**P10: Forum "hot" sort užkrauna VISUS post'us į atmintį**

```typescript
// forum/posts/route.ts:75-76
const allPosts = await prisma.forumPost.findMany({
  where,
  include: { category: ..., _count: ... },
});
```

Su 1,000+ postų tai sunaudos daug atminties. Su 100,000+ — užmuš serverless funkciją.

**Rekomendacija:** Naudoti SQL window function arba materialized score stulpelį, atnaujinamą cron'u.

---

## 4. Auth Architektūra (C-)

### Radiniai

**P11: Trys skirtingi auth mechanizmai**

1. **NextAuth JWT** — OAuth + Credentials (pagrindinė vartotojų autentikacija)
2. **Custom `user_token` cookie** — HMAC-signed, sukuriamas `/api/auth/login` ir `/api/auth/register`
3. **Admin HMAC token** — stateless, naudojamas middleware

**Problema:** `user_token` cookie sukuriamas registracijos ir login metu, BET niekur neverifikuojamas. API endpoints naudoja `getServerSession(authOptions)`, o ne `user_token`.

```typescript
// auth/register/route.ts:61 — sukuriamas
response.cookies.set('user_token', `${user.id}:${randomPart}:${hmac}`, { ... });

// Bet favorites/route.ts:10 — naudojamas NextAuth
const session = await getServerSession(authOptions);
```

**Pasekmė:** Dead code. `user_token` cookie siunčiamas pirmyn ir atgal bet niekada neskaitomas.

**Rekomendacija:** Pašalinti `user_token` mechanizmą arba nuosekliai jį naudoti. NextAuth JWT pakanka.

**P12: Session user tipų casting**

```typescript
// Kartojasi 10+ vietų:
const userId = (session.user as { id: string }).id;
```

**Rekomendacija:** Extend NextAuth types:

```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: { id: string; email: string; name?: string; image?: string }
  }
}
```

---

## 5. Security — KRITINIAI RADINIAI (D+)

### 🔴 KRITINIS P13: Mass Assignment — Admin PUT endpoint

```typescript
// admin/[itemType]/[id]/route.ts:23-33
const body = await request.json();
delete body.id;
delete body.createdAt;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const model = (prisma as any)[itemType];
const updated = await model.update({
  where: { id },
  data: body,  // ⚠️ VISAS body perduodamas Prisma
});
```

**Rizika:** Autentikuotas admin gali pakeisti BET KURĮ lauką, įskaitant `slug` (SEO manipulation), `baseRating`/`baseReviewCount` (reitingų klastojimas). Nors tai admin endpoint, **principle of least privilege** reikalauja whitelist.

**Pataisymas:**

```typescript
const ALLOWED_FIELDS: Record<string, string[]> = {
  kindergarten: ['name', 'city', 'region', 'area', 'address', 'type', 'phone', 'website', 'language', 'ageFrom', 'groups', 'hours', 'features', 'description', 'imageUrl', 'note'],
  aukle: ['name', 'city', 'region', 'area', 'phone', 'email', 'experience', 'ageRange', 'hourlyRate', 'languages', 'description', 'imageUrl', 'availability'],
  // ...
};

const allowedFields = ALLOWED_FIELDS[itemType] ?? [];
const data: Record<string, unknown> = {};
for (const key of allowedFields) {
  if (key in body) data[key] = body[key];
}
```

### 🔴 KRITINIS P14: Mass Assignment — Admin POST endpoint

```typescript
// admin/[itemType]/route.ts:65-69
const created = await model.create({
  data: {
    ...body,  // ⚠️ VISAS body, galima perduoti bet ką
    slug,
    isUserAdded: body.isUserAdded ?? false,
  },
});
```

Toks pats whitelist pataisymas kaip P13.

### 🟠 AUKŠTA P15: Legacy SHA-256 password timing attack

```typescript
// password.ts:36-37
const check = createHash('sha256').update(salt + password).digest('hex');
return check === hash;  // ⚠️ Nėra constant-time comparison!
```

Scrypt dalis naudoja `timingSafeEqual` (gerai), bet legacy SHA-256 dalis naudoja `===`.

**Pataisymas:**

```typescript
const check = createHash('sha256').update(salt + password).digest('hex');
const checkBuf = Buffer.from(check, 'hex');
const hashBuf = Buffer.from(hash, 'hex');
if (checkBuf.length !== hashBuf.length) return false;
return timingSafeEqual(checkBuf, hashBuf);
```

### 🟠 AUKŠTA P16: Newsletter endpoint'as be rate limiting ir CSRF

```typescript
// newsletter/route.ts:6 — nėra nei checkCsrf, nei checkRateLimit
export async function POST(request: NextRequest) {
  const body = await request.json();
```

**Rizika:** Botas gali siųsti tūkstančius prenumeratų per sekundę, perkraunant DB.

**Pataisymas:** Pridėti `checkCsrf` ir `checkRateLimit` su nauju `NEWSLETTER` limitu.

### 🟡 VIDUTINĖ P17: Forum postai nereikalauja autentikacijos

```typescript
// forum/posts/route.ts:139 — nėra session check
export async function POST(request: NextRequest) {
  const csrfResponse = checkCsrf(request);
  // ... honeypot ir timing check, bet nėra auth
```

Honeypot ir timing check nėra patikima apsauga. Botas gali lengvai palaukti 3s ir nesiųsti honeypot.

**Rekomendacija:** Reikalauti NextAuth sesijos forumui arba bent jau CAPTCHA.

### 🟡 VIDUTINĖ P18: CSP su `unsafe-inline` script'ams

```typescript
// middleware.ts:76
"script-src 'self' 'unsafe-inline'",
```

Tai panaikina didelę dalį XSS apsaugos, kurią CSP teikia. Next.js palaiko nonce-based CSP.

**Rekomendacija:** Pereiti prie nonce-based CSP su `next/headers`.

### 🟡 VIDUTINĖ P19: Silpna slaptažodžio politika

```typescript
// auth/register/route.ts:33
if (password.length < 6) {
```

6 simbolių — labai silpna. OWASP rekomenduoja minimum 8 su sudėtingumo reikalavimais.

### Teigiami saugumo aspektai
- ✅ HMAC admin tokenai su constant-time comparison
- ✅ CSRF apsauga per Origin/Referer headers
- ✅ XSS: HTML strip'inimas prieš validaciją
- ✅ Admin PATCH whitelist'as (tik `isApproved`)
- ✅ Rate limiting su Retry-After header
- ✅ Password reset: apsauga nuo email enumeration
- ✅ Comprehensive security headers
- ✅ `poweredByHeader: false`

---

## 6. Performance (C)

### Radiniai

**P20: In-memory cache ir rate limiting neveiks serverless aplinkoje**

```typescript
// cache.ts:14
const cache = new Map<string, CacheEntry<unknown>>();

// rate-limit.ts:10
const store = new Map<string, RateLimitEntry>();
```

Netlify/Vercel sukuria naują funkciją kiekvienam request'ui (arba cold start po idle). Kiekvienas instancija turės savo `Map`.

**Pasekmė:**
- Rate limiting realiai neveikia — kiekviena funkcija turės švarų counter
- Cache miss kiekviename cold start

**Rekomendacija:**
- Rate limiting: naudoti Redis (Upstash) arba Netlify/Vercel native rate limiting
- Cache: naudoti `unstable_cache` (Next.js) arba Redis

**P21: `getCommentDepth` — N+1 užklausos**

```typescript
// forum/comments/route.ts:10-25
async function getCommentDepth(parentId: string): Promise<number> {
  let depth = 1;
  let currentId: string | null = parentId;
  while (currentId) {
    const parent = await prisma.forumComment.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    // ... walks up the chain
  }
}
```

Blogiausia atvejis: 3 DB queries (depth=3). Tai priimtina, bet CTE būtų efektyvesnis.

**P22: Search suggestions — 4 lygiagrečios DB užklausos**

```typescript
// search/route.ts:16-41
const [kindergartens, aukles, bureliai, specialists] = await Promise.all([...4 queries...]);
```

4 lygiagrečios užklausos = 4 DB connection'ai. PostgreSQL connection pool gali baigtis esant dideliam traffic'ui.

**Rekomendacija:** Vienas SQL UNION ALL query arba full-text search su pg_trgm.

**P23: Favorites GET — nėra paginacijos**

```typescript
// favorites/route.ts:27-30
const favorites = await prisma.favorite.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  // ⚠️ Nėra `take` limito
});
```

Vartotojas su 10,000 favorite'ų gaus milžinišką response.

---

## 7. Code Quality (C+)

### Radiniai

**P24: Lietuviškų simbolių mapas dubliuojamas 3+ kartus**

```typescript
// src/lib/utils.ts:10-15 — LT_CHAR_MAP
// src/lib/api-utils.ts:30-34 — LT_MAP
// src/app/api/forum/posts/route.ts:10-15 — map (local)
```

**Rekomendacija:** Vienas `src/lib/lithuanian.ts` su eksportuojamu map'u ir `slugify` funkcija.

**P25: `json()` helper dubliuojamas**

```typescript
// admin/login/route.ts:11 — function json<T>(data: T, status = 200)
// auth/register/route.ts:9  — function json<T>(data: T, status = 200)
// auth/login/route.ts:9     — function json<T>(data: T, status = 200)
// auth/reset/route.ts:8     — function json<T>(data: T, status = 200)
```

Yra `jsonResponse` iš `api-utils.ts`, bet ne visi endpoint'ai jį naudoja.

**P26: `(prisma as any)[itemType]` pattern**

```typescript
// admin/[itemType]/route.ts:26,64
// admin/[itemType]/[id]/route.ts:30,65
const model = (prisma as any)[itemType];
```

**Rekomendacija:** Sukurti tipizuotą helper'į:

```typescript
function getModel(itemType: ValidItemType) {
  const models = {
    kindergarten: prisma.kindergarten,
    aukle: prisma.aukle,
    burelis: prisma.burelis,
    specialist: prisma.specialist,
  } as const;
  return models[itemType];
}
```

**P27: Security headers dubliuojami middleware + next.config.mjs**

Tie patys security headers nustatomi ir `middleware.ts:65-98`, ir `next.config.mjs:15-42`. Middleware headers turi prioritetą per API routes, bet `next.config` veikia static assets.

**Rekomendacija:** Palikti `next.config.mjs` ir pašalinti iš middleware (arba atvirkščiai), vengiant prieštaravimų.

---

## 8. Scalability (C-)

### Kas lūš esant 10,000 vartotojų/dieną?

| Komponentas | Statusas | Problema |
|-------------|----------|----------|
| In-memory rate limit | 🔴 Lūš | Neveiks su >1 serverless instancija |
| In-memory cache | 🔴 Lūš | Cache miss kiekviename cold start |
| Forum hot sort | 🟠 Lėtės | Visų postų fetch'inimas |
| Search suggestions | 🟡 Lėtės | 4 lygiagrečios DB queries |
| Favorites GET | 🟠 Lėtės | Be limito |

### Kas lūš esant 100,000 vartotojų/dieną?

| Komponentas | Statusas | Problema |
|-------------|----------|----------|
| PostgreSQL connections | 🔴 Lūš | Nėra connection pooling (PgBouncer) |
| `features` JSON parse | 🟠 Lėtės | 7000+ parse per request |
| Review GET (be paginacijos) | 🟠 Lėtės | Populiari įstaiga su 1000+ reviews |
| DB: nėra partial indexes | 🟡 Lėtės | `isApproved = true` reviews — partial index padėtų |

### Rekomendacijos skalei
1. **Redis/Upstash** — rate limiting + cache (būtina prieš production)
2. **PgBouncer** arba Prisma Accelerate — connection pooling
3. Paginuoti reviews GET
4. Full-text search su PostgreSQL `pg_trgm` + GIN indeksais
5. Materialized `hotScore` stulpelis forum posts

---

## Prioritetizuotas Veiksmų Planas

### 🔴 P0 — Kritiniai (taisyti DABAR, prieš production)

| # | Problema | Failas | Pastanga |
|---|----------|--------|----------|
| P13 | Mass assignment admin PUT | `src/app/api/admin/[itemType]/[id]/route.ts` | 1h |
| P14 | Mass assignment admin POST | `src/app/api/admin/[itemType]/route.ts` | 1h |
| P15 | Legacy password timing attack | `src/lib/password.ts:37` | 15min |
| P16 | Newsletter be rate limit/CSRF | `src/app/api/newsletter/route.ts` | 30min |

### 🟠 P1 — Aukštas prioritetas (per 1-2 savaites)

| # | Problema | Failas | Pastanga |
|---|----------|--------|----------|
| P11 | Pašalinti dead `user_token` mechanizmą | `src/lib/user-tokens.ts`, auth routes | 2h |
| P17 | Forum auth arba CAPTCHA | `src/app/api/forum/posts/route.ts` | 3h |
| P19 | Stipresnė slaptažodžio politika | `src/app/api/auth/register/route.ts` | 30min |
| P20 | Redis rate limiting | `src/lib/rate-limit.ts` | 4h |
| P23 | Favorites paginacija | `src/app/api/favorites/route.ts` | 30min |

### 🟡 P2 — Vidutinis prioritetas (per 1 mėnesį)

| # | Problema | Failas | Pastanga |
|---|----------|--------|----------|
| P8 | Zod validacija | Visi API routes | 8h |
| P9 | Standartizuoti response format | Visi API routes | 4h |
| P10 | Forum hot sort optimizacija | `forum/posts/route.ts` | 3h |
| P18 | Nonce-based CSP | `middleware.ts`, `next.config.mjs` | 4h |
| P22 | Search UNION ALL | `search/route.ts` | 2h |
| P24 | DRY: Lithuanian slugify | Sukurti `src/lib/slugify.ts` | 1h |
| P27 | Security headers dedup | `middleware.ts` + `next.config.mjs` | 1h |

### 🟢 P3 — Žemas prioritetas (tech debt)

| # | Problema | Failas | Pastanga |
|---|----------|--------|----------|
| P2 | `features` → Json tipas | `schema.prisma` + migration | 2h |
| P4 | ForumVote CHECK constraint | `schema.prisma` + migration | 1h |
| P5 | Pašalinti `Favorite.sessionId` | `schema.prisma` + migration | 1h |
| P6 | Review `updatedAt` | `schema.prisma` + migration | 30min |
| P7 | Pašalinti perteklinį indeksą | `schema.prisma` + migration | 15min |
| P12 | NextAuth type augmentation | `types/next-auth.d.ts` | 30min |
| P25 | Pašalinti `json()` duplikatus | Auth routes | 30min |
| P26 | Tipizuotas Prisma model helper | `src/lib/prisma-models.ts` | 1h |

---

## Baigiamosios Pastabos

Vaikai.lt turi tvirtą fundamentą ir daug gerų sprendimų (HMAC tokenai, CSRF apsauga, review moderavimas, email enumeration prevention). Pagrindinė kryptis turėtų būti:

1. **Sutvarkyti 4 kritinius P0 radinnius** — tai gali būti padaryta per vieną darbo dieną
2. **Pereiti prie Redis** rate limiting ir cache — būtina prieš production su serverless
3. **Supaprastinti auth** — pašalinti `user_token` dead code, palikti tik NextAuth
4. **Įvesti Zod** — sumažins boilerplate ir pagerins type safety

Su šiais pataisymais projektas pasiektų **B/B+** lygį ir būtų paruoštas production deploy'ui.
