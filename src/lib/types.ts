/**
 * Shared TypeScript types for Vaikai.lt
 * Matches Prisma schema models + API response types.
 */

// Re-export model interfaces from types/index.ts
export type {
  Kindergarten,
  Aukle,
  Burelis,
  Specialist,
  Review,
} from '@/types';

export type { ItemType } from '@/types';

/** URL-friendly category slugs used in routes */
export type CategoryType = 'darzeliai' | 'aukles' | 'bureliai' | 'specialistai';

/** Maps CategoryType to Prisma model name */
export const CATEGORY_TO_MODEL: Record<CategoryType, string> = {
  darzeliai: 'kindergarten',
  aukles: 'aukle',
  bureliai: 'burelis',
  specialistai: 'specialist',
} as const;

/** Maps ItemType to CategoryType */
export const ITEM_TYPE_TO_CATEGORY: Record<string, CategoryType> = {
  kindergarten: 'darzeliai',
  aukle: 'aukles',
  burelis: 'bureliai',
  specialist: 'specialistai',
} as const;

// ─── API Response Types ───

export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface AdminStats {
  readonly kindergartenCount: number;
  readonly aukleCount: number;
  readonly burelisCount: number;
  readonly specialistCount: number;
  readonly reviewCount: number;
  readonly pendingReviewCount: number;
  readonly userCount: number;
  readonly dataQuality: {
    readonly kindergartens: number;
    readonly aukles: number;
    readonly bureliai: number;
    readonly specialists: number;
  };
}

export interface LoginResponse {
  readonly token: string;
}
