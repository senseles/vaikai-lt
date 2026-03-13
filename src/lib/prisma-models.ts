import prisma from '@/lib/prisma';

export type ValidItemType = 'kindergarten' | 'aukle' | 'burelis' | 'specialist';

/**
 * Get a typed Prisma model delegate by item type.
 * Avoids `(prisma as any)[itemType]` pattern.
 */
export function getModel(itemType: ValidItemType) {
  const models = {
    kindergarten: prisma.kindergarten,
    aukle: prisma.aukle,
    burelis: prisma.burelis,
    specialist: prisma.specialist,
  } as const;
  return models[itemType];
}

/** Allowed fields for admin create/update per entity type */
export const ALLOWED_FIELDS: Record<ValidItemType, readonly string[]> = {
  kindergarten: [
    'name', 'city', 'region', 'area', 'address', 'type', 'phone', 'website',
    'language', 'ageFrom', 'groups', 'hours', 'features', 'description',
    'imageUrl', 'note', 'isUserAdded',
  ],
  aukle: [
    'name', 'city', 'region', 'area', 'phone', 'email', 'experience',
    'ageRange', 'hourlyRate', 'languages', 'description', 'imageUrl',
    'availability', 'isServicePortal', 'isUserAdded',
  ],
  burelis: [
    'name', 'city', 'region', 'area', 'category', 'subcategory', 'ageRange',
    'price', 'schedule', 'phone', 'website', 'description', 'imageUrl',
    'isUserAdded',
  ],
  specialist: [
    'name', 'city', 'region', 'area', 'specialty', 'clinic', 'price',
    'phone', 'website', 'languages', 'description', 'imageUrl', 'isUserAdded',
  ],
} as const;

/** Pick only allowed fields from a body object */
export function pickAllowedFields(
  body: Record<string, unknown>,
  itemType: ValidItemType,
): Record<string, unknown> {
  const allowed = ALLOWED_FIELDS[itemType];
  const result: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) result[key] = body[key];
  }
  return result;
}
