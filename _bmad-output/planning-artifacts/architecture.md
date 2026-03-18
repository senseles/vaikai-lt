---
stepsCompleted: [overview, data-model, api, security, components]
inputDocuments: [prd.md, product-brief-vaikai-lt-2026-03-18.md]
date: 2026-03-18
author: Daniel / Architect Agent
---

# Techninė Architektūra: Duomenų Kokybė ir Vartotojų Pasiūlymai

## 1. Sistemos Apžvalga

Vaikai.lt yra Next.js 14 (App Router) fullstack platforma su Prisma ORM, Neon PostgreSQL DB, NextAuth autentifikacija. Šis dokumentas aprašo architektūrinius pakeitimus dviem naujoms feature grupėms.

```
┌─────────────────────────────────────────────┐
│                 Klientas                     │
│  ┌──────────┐ ┌───────────┐ ┌─────────────┐ │
│  │ Naršymas │ │ Pasiūlymo │ │   Admin     │ │
│  │    UI    │ │   Forma   │ │  Dashboard  │ │
│  └────┬─────┘ └─────┬─────┘ └──────┬──────┘ │
└───────┼─────────────┼──────────────┼────────┘
        │             │              │
┌───────┼─────────────┼──────────────┼────────┐
│       ▼             ▼              ▼        │
│  ┌─────────────────────────────────────┐    │
│  │         Next.js API Routes          │    │
│  │  ┌──────────┐ ┌──────────────────┐  │    │
│  │  │Rate Limit│ │Input Sanitization│  │    │
│  │  └──────────┘ └──────────────────┘  │    │
│  │  ┌──────────┐ ┌──────────────────┐  │    │
│  │  │ hCaptcha │ │   Honeypot       │  │    │
│  │  └──────────┘ └──────────────────┘  │    │
│  └──────────────────┬──────────────────┘    │
│                     │                        │
│  ┌──────────────────▼──────────────────┐    │
│  │         Prisma ORM                   │    │
│  │  ┌────────────┐ ┌────────────────┐  │    │
│  │  │Verification│ │  Submission    │  │    │
│  │  │  Status    │ │  Queue        │  │    │
│  │  └────────────┘ └────────────────┘  │    │
│  └──────────────────┬──────────────────┘    │
│                     │                        │
│  ┌──────────────────▼──────────────────┐    │
│  │       Neon PostgreSQL               │    │
│  └─────────────────────────────────────┘    │
│                  Serveris                    │
└──────────────────────────────────────────────┘
```

## 2. Duomenų Modelio Pakeitimai (Prisma Schema)

### 2.1 Verifikavimo Statusas

```prisma
enum VerificationStatus {
  UNVERIFIED
  VERIFIED
  REJECTED
}

// Pridėti prie VISŲ esybių modelių (Kindergarten, Aukle, Burelis, Specialist):
// verificationStatus  VerificationStatus @default(UNVERIFIED)
// verifiedAt          DateTime?
// verifiedBy          String?
// rejectionReason     String?

// Pridėti prie Review modelio:
// moderationStatus    ModerationStatus @default(PENDING)
// moderatedAt         DateTime?
// moderatedBy         String?

enum ModerationStatus {
  PENDING
  APPROVED
  REJECTED
  FLAGGED
}
```

### 2.2 Pasiūlymų Sistema

```prisma
enum SubmissionStatus {
  PENDING
  APPROVED
  REJECTED
}

enum SubmissionType {
  KINDERGARTEN
  AUKLE
  BURELIS
  SPECIALIST
}

model Submission {
  id              String           @id @default(cuid())
  type            SubmissionType
  status          SubmissionStatus @default(PENDING)
  
  // Pasiūlymo duomenys (JSON — lankstus formatas skirtingiems tipams)
  data            Json
  
  // Siūlytojo info
  submitterName   String
  submitterEmail  String?
  submitterPhone  String?
  submitterIp     String
  
  // Admin review
  reviewedAt      DateTime?
  reviewedBy      String?
  rejectionReason String?
  
  // Apsauga
  honeypotField   String?          // Turi būti tuščias
  captchaToken    String?
  
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([status])
  @@index([type])
  @@index([createdAt])
}

model RateLimit {
  id          String   @id @default(cuid())
  identifier  String   // IP arba session ID
  action      String   // "submission", "review", "report"
  count       Int      @default(1)
  windowStart DateTime @default(now())
  
  @@unique([identifier, action])
  @@index([windowStart])
}
```

### 2.3 Migracijų Strategija

1. `add-verification-status` — Pridėti enum ir laukus prie visų esybių
2. `add-submission-system` — Sukurti Submission ir RateLimit modelius
3. `add-review-moderation` — Pridėti moderavimo laukus prie Review
4. `backfill-unverified` — Visiems esamiems įrašams nustatyti UNVERIFIED

## 3. API Endpoint'ai

### 3.1 Admin Verifikavimo API

| Metodas | Kelias | Aprašymas |
|---------|--------|-----------|
| GET | `/api/admin/verification` | Gauti įrašus pagal statusą/tipą su paginacija |
| PATCH | `/api/admin/verification/[id]` | Pakeisti vieno įrašo statusą |
| POST | `/api/admin/verification/bulk` | Masinis statusų keitimas |
| GET | `/api/admin/verification/stats` | Verifikavimo statistika |

### 3.2 Pasiūlymų API

| Metodas | Kelias | Aprašymas |
|---------|--------|-----------|
| POST | `/api/submissions` | Naujas pasiūlymas (public, su rate limit) |
| GET | `/api/admin/submissions` | Admin: visi pasiūlymai su filtrais |
| PATCH | `/api/admin/submissions/[id]` | Admin: patvirtinti/atmesti |
| GET | `/api/admin/submissions/[id]` | Admin: pasiūlymo detalės |

### 3.3 Atsiliepimų Moderavimo API

| Metodas | Kelias | Aprašymas |
|---------|--------|-----------|
| GET | `/api/admin/reviews` | Atsiliepimai su moderavimo filtrais |
| PATCH | `/api/admin/reviews/[id]/moderate` | Moderuoti atsiliepimą |
| POST | `/api/admin/reviews/bulk-moderate` | Masinis moderavimas |

## 4. Saugumo Architektūra

### 4.1 Input Sanitization (Visur)

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// Visi string laukai sanitizuojami per middleware
const sanitizeString = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
    .trim()
    .replace(/[<>\"\'`;]/g, '');
};

// Zod schemos su sanitizacija kiekvienam endpoint'ui
const submissionSchema = z.object({
  type: z.enum(['KINDERGARTEN', 'AUKLE', 'BURELIS', 'SPECIALIST']),
  name: z.string().min(2).max(200).transform(sanitizeString),
  address: z.string().min(5).max(500).transform(sanitizeString),
  description: z.string().max(2000).transform(sanitizeString).optional(),
  phone: z.string().regex(/^[\d\s\+\-\(\)]{6,20}$/).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  submitterName: z.string().min(2).max(100).transform(sanitizeString),
  captchaToken: z.string().min(1),
  honeypot: z.string().max(0), // TURI būti tuščias
});
```

### 4.2 Rate Limiting

```typescript
// lib/rate-limit.ts
// Sliding window per IP + action
const LIMITS = {
  submission: { max: 3, windowMinutes: 60 },    // 3 pasiūlymai per valandą
  review: { max: 5, windowMinutes: 60 },         // 5 atsiliepimai per valandą
  report: { max: 10, windowMinutes: 60 },        // 10 pranešimų per valandą
};
```

### 4.3 hCaptcha Integracija

```typescript
// lib/captcha.ts
// Server-side verification
const verifyCaptcha = async (token: string): Promise<boolean> => {
  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`,
  });
  const data = await res.json();
  return data.success === true;
};
```

### 4.4 Honeypot Laukai

```html
<!-- Paslėptas laukas — botai užpildo, žmonės ne -->
<div style="position:absolute;left:-9999px" aria-hidden="true">
  <input name="website_url" tabindex="-1" autoComplete="off" />
</div>
<!-- Jei laukas užpildytas → atmesti kaip botą -->
```

### 4.5 CSP ir Security Headers

```typescript
// next.config.js headers
{
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://hcaptcha.com; frame-src https://hcaptcha.com; style-src 'self' 'unsafe-inline';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}
```

### 4.6 SQL Injection Prevencija

- Prisma ORM automatiškai parametrizuoja visas užklausas
- Jokių raw SQL užklausų be `Prisma.$queryRaw` su parametrais
- Input validacija per Zod prieš bet kokią DB operaciją

## 5. Komponentų Architektūra

### 5.1 Admin Dashboard Komponentai

```
src/app/admin/
├── verification/
│   ├── page.tsx                    # Verifikavimo dashboard
│   ├── VerificationTable.tsx       # Lentelė su filtrais
│   ├── VerificationActions.tsx     # Approve/Reject mygtukai
│   ├── BulkActions.tsx             # Masinis veiksmas
│   └── VerificationStats.tsx       # Statistikos kortelės
├── submissions/
│   ├── page.tsx                    # Pasiūlymų sąrašas
│   ├── SubmissionDetail.tsx        # Pasiūlymo peržiūra
│   ├── SubmissionReview.tsx        # Approve/Reject su komentaru
│   └── SubmissionCompare.tsx       # Palyginimas su esamais duomenimis
└── reviews/
    ├── page.tsx                    # Atsiliepimų moderavimas
    ├── ReviewModerationTable.tsx   # Lentelė su filtrais
    └── ReviewActions.tsx           # Moderate veiksmai
```

### 5.2 Public Komponentai

```
src/components/
├── SubmissionForm/
│   ├── SubmissionForm.tsx          # Pagrindinė forma
│   ├── KindergartenFields.tsx      # Darželio specifiniai laukai
│   ├── AukleFields.tsx             # Auklės specifiniai laukai
│   ├── CaptchaWidget.tsx           # hCaptcha komponentas
│   └── SubmissionSuccess.tsx       # Sėkmės pranešimas
├── VerificationBadge.tsx           # ✅ Patvirtintas ženkliukas
└── SuggestButton.tsx               # "Nerandi? Pasiūlyk!" mygtukas
```

### 5.3 Admin Verifikavimo Workflow

```
Admin atidaro /admin/verification
        │
        ▼
┌───────────────────┐
│ Filtrai: Tipas,   │
│ Statusas, Paieška │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐    ┌──────────────┐
│ Įrašų lentelė    │───▶│ Detalės      │
│ (paginuota)       │    │ modal/pusl.  │
└────────┬──────────┘    └──────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│Vienas  │ │ Bulk   │
│veiksmas│ │veiksmai│
└────┬───┘ └───┬────┘
     │         │
     ▼         ▼
┌───────────────────┐
│ PATCH/POST API    │
│ Atnaujina statusą │
└───────────────────┘
```

## 6. Rodiklių Stebėjimas

Admin dashboard'e rodyti:
- Verifikuotų vs neverifikuotų įrašų skaičius (per tipą)
- Laukiančių pasiūlymų skaičius
- Šiandienos/savaitės veiksmų skaičius
- Atblokuotų botų/spam bandymų skaičius
