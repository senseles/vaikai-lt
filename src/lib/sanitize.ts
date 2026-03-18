import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

/**
 * Sanitize a string by stripping all HTML tags via DOMPurify.
 * Returns trimmed, clean text.
 */
export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
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
