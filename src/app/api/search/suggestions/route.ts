import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CITIES } from '@/lib/cities';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import {
  parseSearchQuery,
  SUGGESTION_FIELDS,
  buildWhereClause,
} from '@/lib/search-utils';

const cityNameToSlug: Record<string, string> = {};
for (const c of CITIES) {
  cityNameToSlug[c.name.toLocaleLowerCase('lt')] = c.slug;
}

function getCitySlug(cityName: string): string {
  const lower = cityName.toLocaleLowerCase('lt');
  if (cityNameToSlug[lower]) return cityNameToSlug[lower];
  for (const [name, slug] of Object.entries(cityNameToSlug)) {
    if (lower.includes(name) || name.includes(lower)) return slug;
  }
  return '';
}

const categoryMap: Record<string, string> = {
  kindergarten: 'darzeliai',
  aukle: 'aukles',
  burelis: 'bureliai',
  specialist: 'specialistai',
};

interface RawResult {
  id: string;
  name: string;
  city: string;
  slug: string;
  base_rating: number;
}

async function searchEntity(
  table: string,
  fields: string[],
  words: string[],
  synonymPatterns: string[],
  limit: number
): Promise<RawResult[]> {
  const patterns = words.map(w => `%${w}%`);
  const { clause, extraParams } = buildWhereClause(fields, words.length, synonymPatterns);
  const allParams = [...patterns, ...extraParams];

  const sql = `SELECT id, name, city, slug, "baseRating" as base_rating
    FROM "${table}"
    WHERE ${clause}
    ORDER BY "baseRating" DESC
    LIMIT ${limit}`;

  return prisma.$queryRawUnsafe(sql, ...allParams) as Promise<RawResult[]>;
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.PUBLIC_GET);
  if (rateLimitResponse) return rateLimitResponse;

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  // Sanitize: only allow alphanumeric, spaces, Lithuanian chars, basic punctuation
  const sanitized = q.replace(/[^a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ0-9\s\-.,:/]/g, '').slice(0, 100);
  if (sanitized.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const { searchWords, categoryFilter, synonymPatterns } = parseSearchQuery(sanitized);
    if (searchWords.every(w => w.length < 2) && !categoryFilter) {
      return NextResponse.json({ suggestions: [] });
    }

    const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
      !categoryFilter || categoryFilter === 'kindergarten'
        ? searchEntity('Kindergarten', SUGGESTION_FIELDS.kindergarten, searchWords, synonymPatterns, 4) : Promise.resolve([]),
      !categoryFilter || categoryFilter === 'aukle'
        ? searchEntity('Aukle', SUGGESTION_FIELDS.aukle, searchWords, synonymPatterns, 3) : Promise.resolve([]),
      !categoryFilter || categoryFilter === 'burelis'
        ? searchEntity('Burelis', SUGGESTION_FIELDS.burelis, searchWords, synonymPatterns, 3) : Promise.resolve([]),
      !categoryFilter || categoryFilter === 'specialist'
        ? searchEntity('Specialist', SUGGESTION_FIELDS.specialist, searchWords, synonymPatterns, 3) : Promise.resolve([]),
    ]);

    const suggestions = [
      ...kindergartens.map(i => ({ ...i, type: 'darzeliai' as const, itemType: 'kindergarten' as const })),
      ...aukles.map(i => ({ ...i, type: 'aukles' as const, itemType: 'aukle' as const })),
      ...bureliai.map(i => ({ ...i, type: 'bureliai' as const, itemType: 'burelis' as const })),
      ...specialists.map(i => ({ ...i, type: 'specialistai' as const, itemType: 'specialist' as const })),
    ].slice(0, 8).map(s => {
      const citySlug = getCitySlug(s.city);
      const categoryPath = categoryMap[s.itemType] || 'darzeliai';
      const url = citySlug
        ? `/${citySlug}/${categoryPath}/${s.slug}`
        : `/paieska?q=${encodeURIComponent(s.name)}`;
      return { id: s.id, name: s.name, city: s.city, slug: s.slug, type: s.type, rating: s.base_rating, url };
    });

    return NextResponse.json({ suggestions }, {
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
    });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
