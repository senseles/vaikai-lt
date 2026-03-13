/**
 * Utility functions for Vaikai.lt
 */

import { CITY_TO_REGION } from './regions';
import type { CategoryType } from './types';
import { slugify } from './lithuanian';

/**
 * Convert a string to a URL-friendly slug.
 * Handles Lithuanian diacritics (ą→a, č→c, etc.).
 */
export function toSlug(str: string): string {
  return slugify(str);
}

/**
 * Escape HTML special characters to prevent XSS.
 */
export function escapeHtml(str: string | number | null | undefined): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format a numeric rating to one decimal place.
 * Returns '—' for zero/null values.
 */
export function formatRating(n: number | null | undefined): string {
  if (n == null || n === 0) return '—';
  return n.toFixed(1);
}

/**
 * Get Lithuanian label for a category slug.
 */
export function getCategoryLabel(cat: CategoryType): string {
  const labels: Record<CategoryType, string> = {
    darzeliai: 'Darželiai',
    aukles: 'Auklės',
    bureliai: 'Būreliai',
    specialistai: 'Specialistai',
  };
  return labels[cat] ?? cat;
}

/**
 * Look up the region for a given city name.
 * Returns undefined if city is not found.
 */
export function getRegionForCity(city: string): string | undefined {
  return CITY_TO_REGION[city];
}

/**
 * Validate that a string is a valid ItemType.
 */
export function isValidItemType(value: string): value is 'kindergarten' | 'aukle' | 'burelis' | 'specialist' {
  return ['kindergarten', 'aukle', 'burelis', 'specialist'].includes(value);
}

/**
 * Get Prisma model delegate name from itemType.
 */
export function getPrismaModelName(itemType: string): string | null {
  const map: Record<string, string> = {
    kindergarten: 'kindergarten',
    aukle: 'aukle',
    burelis: 'burelis',
    specialist: 'specialist',
  };
  return map[itemType] ?? null;
}
