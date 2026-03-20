import { z } from 'zod';

/**
 * Sanitize a string by stripping all HTML tags and dangerous content.
 * Lightweight replacement for DOMPurify — no jsdom dependency.
 * Returns trimmed, clean text.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')   // Remove script tags + content
    .replace(/<style[\s\S]*?<\/style>/gi, '')      // Remove style tags + content
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')   // Remove event handlers
    .replace(/javascript\s*:/gi, '')                // Remove javascript: URIs
    .replace(/<[^>]*>/g, '')                        // Strip all remaining HTML tags
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')    // Decode common entities
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/')
    .trim();
}

/**
 * Recursively sanitize all string values in an object.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeString(val);
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(val as Record<string, unknown>);
    }
  }
  return result;
}

// --- Reusable Zod schemas with built-in sanitization ---

const sanitized = z.string().transform(sanitizeString);

export const reviewSchema = z.object({
  itemId: z.string().min(1),
  itemType: z.enum(['kindergarten', 'aukle', 'burelis', 'specialist']),
  authorName: sanitized.pipe(z.string().min(1, 'Vardas privalomas').max(100)),
  rating: z.number().int().min(1).max(5),
  text: sanitized.pipe(z.string().min(1, 'Tekstas privalomas').max(2000)),
});

export const forumPostSchema = z.object({
  title: sanitized.pipe(z.string().min(5, 'Pavadinimas per trumpas').max(200)),
  content: sanitized.pipe(z.string().min(10, 'Turinys per trumpas').max(5000)),
  authorName: sanitized.pipe(z.string().min(2).max(50)),
  categorySlug: z.string().min(1),
  city: z.string().optional(),
});

export const forumCommentSchema = z.object({
  postId: z.string().min(1),
  content: sanitized.pipe(z.string().min(2, 'Komentaras per trumpas').max(2000)),
  authorName: sanitized.pipe(z.string().min(2).max(50)),
  parentId: z.string().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email('Neteisingas el. pašto formatas').transform((e) => e.trim().toLowerCase()),
});

export const registrationSchema = z.object({
  email: z.string().email('Neteisingas el. pašto formatas'),
  password: z.string().min(8, 'Slaptažodis turi būti bent 8 simbolių'),
  name: sanitized.pipe(z.string().max(100)).optional(),
});

export const submissionSchema = z.object({
  entityType: z.enum(['KINDERGARTEN', 'AUKLE', 'BURELIS', 'SPECIALIST'], {
    message: 'Pasirinkite tipą',
  }),
  name: sanitized.pipe(z.string().min(2, 'Pavadinimas per trumpas').max(200, 'Pavadinimas per ilgas')),
  city: sanitized.pipe(z.string().min(2, 'Miestas privalomas').max(100)),
  address: sanitized.pipe(z.string().max(300)).optional(),
  phone: sanitized.pipe(z.string().max(30)).optional(),
  email: z.string().email('Neteisingas el. pašto formatas').optional().or(z.literal('')),
  website: sanitized.pipe(z.string().max(300)).optional(),
  description: sanitized.pipe(z.string().max(5000, 'Aprašymas per ilgas')).optional(),
  submitterName: sanitized.pipe(z.string().min(2, 'Vardas privalomas').max(100)),
  submitterEmail: z.string().email('Neteisingas el. pašto formatas').optional().or(z.literal('')),
  submitterPhone: sanitized.pipe(z.string().max(30)).optional(),
  // Extra fields per entity type (stored in data JSON)
  hours: sanitized.pipe(z.string().max(200)).optional(),
  experience: sanitized.pipe(z.string().max(500)).optional(),
  ageRange: sanitized.pipe(z.string().max(100)).optional(),
  category: sanitized.pipe(z.string().max(100)).optional(),
  specialty: sanitized.pipe(z.string().max(200)).optional(),
  clinic: sanitized.pipe(z.string().max(200)).optional(),
  price: sanitized.pipe(z.string().max(100)).optional(),
});
