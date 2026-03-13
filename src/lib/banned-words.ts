/**
 * Banned words filter for forum content moderation.
 * Covers common Lithuanian profanity, slurs, and spam/advertising terms.
 */

export const BANNED_WORDS: readonly string[] = [
  'šūdas', 'šūdo', 'pisk', 'pist', 'nachui', 'blet', 'suka', 'kurva',
  'debil', 'idiot', 'spam', 'reklama', 'pirk', 'nuolaida', 'kazino',
  'casino', 'viagra', 'crypto', 'bitcoin',
];

/** Check if text (lowercased) contains any banned word */
export function containsBannedWords(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => lower.includes(word));
}

/** Return which banned words were found in the text */
export function filterBannedContent(text: string): { clean: boolean; found: string[] } {
  const lower = text.toLowerCase();
  const found = BANNED_WORDS.filter((word) => lower.includes(word));
  return { clean: found.length === 0, found };
}
