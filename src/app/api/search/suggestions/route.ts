import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CITIES } from '@/lib/cities';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

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

const CATEGORY_KEYWORDS: Record<string, string> = {
  'darželiai': 'kindergarten', 'darželis': 'kindergarten', 'darzeliai': 'kindergarten', 'darzelis': 'kindergarten',
  'auklė': 'aukle', 'auklės': 'aukle', 'aukle': 'aukle', 'aukles': 'aukle',
  'būreliai': 'burelis', 'būrelis': 'burelis', 'bureliai': 'burelis', 'burelis': 'burelis',
  'specialistai': 'specialist', 'specialistas': 'specialist',
};

function parseSearchWords(q: string): { searchWords: string[]; categoryFilter: string | null } {
  const allWords = q.split(/\s+/).filter(w => w.length > 0);
  let categoryFilter: string | null = null;
  const searchWords: string[] = [];
  for (const w of allWords) {
    const cat = CATEGORY_KEYWORDS[w.toLocaleLowerCase('lt')];
    if (cat && !categoryFilter) {
      categoryFilter = cat;
    } else {
      searchWords.push(w);
    }
  }
  return { searchWords: searchWords.length > 0 ? searchWords : allWords, categoryFilter };
}

async function searchWithUnaccent(
  table: string,
  fields: string[],
  words: string[],
  limit: number
): Promise<RawResult[]> {
  const patterns = words.map(w => `%${w}%`);
  const andClauses = patterns.map((_, i) => {
    const paramIdx = i + 1;
    const orParts = fields.map(f => `unaccent(${f}) ILIKE unaccent($${paramIdx})`);
    return `(${orParts.join(' OR ')})`;
  });

  const sql = `SELECT id, name, city, slug, "baseRating" as base_rating
    FROM "${table}"
    WHERE ${andClauses.join(' AND ')}
    ORDER BY "baseRating" DESC
    LIMIT ${limit}`;

  return prisma.$queryRawUnsafe(sql, ...patterns) as Promise<RawResult[]>;
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.PUBLIC_GET);
  if (rateLimitResponse) return rateLimitResponse;

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  // Sanitize: only allow alphanumeric, spaces, Lithuanian chars, basic punctuation
  const sanitized = q.replace(/[^a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ0-9\s\-.,]/g, '').slice(0, 100);
  if (sanitized.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const { searchWords, categoryFilter } = parseSearchWords(sanitized);
    if (searchWords.every(w => w.length < 2) && !categoryFilter) {
      return NextResponse.json({ suggestions: [] });
    }

    const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
      !categoryFilter || categoryFilter === 'kindergarten'
        ? searchWithUnaccent('Kindergarten', ['name', 'city', 'address'], searchWords, 4) : Promise.resolve([]),
      !categoryFilter || categoryFilter === 'aukle'
        ? searchWithUnaccent('Aukle', ['name', 'city'], searchWords, 3) : Promise.resolve([]),
      !categoryFilter || categoryFilter === 'burelis'
        ? searchWithUnaccent('Burelis', ['name', 'city', 'category'], searchWords, 3) : Promise.resolve([]),
      !categoryFilter || categoryFilter === 'specialist'
        ? searchWithUnaccent('Specialist', ['name', 'city', 'specialty'], searchWords, 3) : Promise.resolve([]),
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
