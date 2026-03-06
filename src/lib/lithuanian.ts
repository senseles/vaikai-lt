/**
 * Lithuanian character normalization for search.
 * Maps accented Lithuanian letters to ASCII equivalents.
 */
const LT_CHAR_MAP: Record<string, string> = {
  'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
  'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
  'Ą': 'A', 'Č': 'C', 'Ę': 'E', 'Ė': 'E', 'Į': 'I',
  'Š': 'S', 'Ų': 'U', 'Ū': 'U', 'Ž': 'Z',
  '„': '', '\u201c': '', '\u201d': '', '–': '-',
};

/** Strip Lithuanian diacritics: Žiogelis → Ziogelis */
export function normalizeLt(text: string): string {
  return text.replace(/[ąčęėįšųūžĄČĘĖĮŠŲŪŽ„""–]/g, (ch) => LT_CHAR_MAP[ch] ?? ch);
}

/**
 * Build Prisma OR conditions that match both the original query
 * AND the normalized (ASCII) version against a field.
 * This way "zogelis" finds "Žiogelis" and "Žiogelis" also works.
 */
export function ltSearchConditions(
  query: string,
  fields: string[]
): Record<string, unknown>[] {
  const normalized = normalizeLt(query);
  const conditions: Record<string, unknown>[] = [];

  for (const field of fields) {
    // Original query (handles: user types "Žiogelis")
    conditions.push({ [field]: { contains: query, mode: 'insensitive' } });
    // Normalized query (handles: user types "zogelis" → search for "zogelis")
    if (normalized !== query) {
      conditions.push({ [field]: { contains: normalized, mode: 'insensitive' } });
    }
  }

  return conditions;
}
