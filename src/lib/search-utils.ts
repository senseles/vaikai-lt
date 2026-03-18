// Shared search utilities for Lithuanian text normalization, synonyms, and field mapping

// Category keyword → entity type mapping
export const CATEGORY_KEYWORDS: Record<string, string> = {
  'darželiai': 'kindergarten', 'darželis': 'kindergarten', 'darzeliai': 'kindergarten', 'darzelis': 'kindergarten',
  'auklė': 'aukle', 'auklės': 'aukle', 'aukle': 'aukle', 'aukles': 'aukle',
  'būreliai': 'burelis', 'būrelis': 'burelis', 'bureliai': 'burelis', 'burelis': 'burelis',
  'specialistai': 'specialist', 'specialistas': 'specialist',
  'logopedas': 'specialist', 'logopedė': 'specialist', 'logopede': 'specialist',
  'psichologas': 'specialist', 'psichologė': 'specialist', 'psichologe': 'specialist',
};

// Lithuanian city name declensions → nominative
export const CITY_DECLENSIONS: Record<string, string> = {
  'vilniuje': 'Vilnius', 'vilniaus': 'Vilnius', 'vilnių': 'Vilnius', 'vilniui': 'Vilnius',
  'kaune': 'Kaunas', 'kauno': 'Kaunas', 'kaunui': 'Kaunas',
  'klaipėdoje': 'Klaipėda', 'klaipedoje': 'Klaipėda', 'klaipėdos': 'Klaipėda', 'klaipedos': 'Klaipėda',
  'šiauliuose': 'Šiauliai', 'siauliuose': 'Šiauliai', 'šiaulių': 'Šiauliai', 'siauliu': 'Šiauliai',
  'panevėžyje': 'Panevėžys', 'panevėžio': 'Panevėžys', 'panevezyje': 'Panevėžys', 'panevezio': 'Panevėžys',
  'alytuje': 'Alytus', 'alytaus': 'Alytus',
  'marijampolėje': 'Marijampolė', 'marijampoleje': 'Marijampolė', 'marijampolės': 'Marijampolė',
  'utenoje': 'Utena', 'utenos': 'Utena',
  'telšiuose': 'Telšiai', 'telsiuose': 'Telšiai', 'telšių': 'Telšiai',
  'tauragėje': 'Tauragė', 'taurageje': 'Tauragė', 'tauragės': 'Tauragė',
};

// Vilnius neighborhood declensions → nominative
export const NEIGHBORHOOD_DECLENSIONS: Record<string, string> = {
  'pavilnyje': 'Pavilnys', 'pavilnio': 'Pavilnys',
  'žirmūnuose': 'Žirmūnai', 'zirmunuose': 'Žirmūnai', 'žirmūnų': 'Žirmūnai', 'zirmunu': 'Žirmūnai',
  'antakalnyje': 'Antakalnis', 'antakalnio': 'Antakalnis',
  'šeškinėje': 'Šeškinė', 'seskineje': 'Šeškinė', 'šeškinės': 'Šeškinė',
  'justiniškėse': 'Justiniškės', 'justiniskese': 'Justiniškės',
  'pilaitėje': 'Pilaitė', 'pilaiteje': 'Pilaitė', 'pilaitės': 'Pilaitė',
  'pašilaičiuose': 'Pašilaičiai', 'pasilaiciuose': 'Pašilaičiai',
  'fabijoniškėse': 'Fabijoniškės', 'fabijoniskese': 'Fabijoniškės',
  'naujininkuose': 'Naujininkai', 'naujininkų': 'Naujininkai',
  'viršuliškėse': 'Viršuliškės', 'virsuliskese': 'Viršuliškės',
  'centre': 'Centras', 'centro': 'Centras',
  'karoliniškėse': 'Karoliniškės', 'karoliniskese': 'Karoliniškės',
  'lazdynuose': 'Lazdynai', 'lazdynų': 'Lazdynai',
  'verkiuose': 'Verkiai', 'verkių': 'Verkiai',
  'baltupių': 'Baltupiai', 'baltupiuose': 'Baltupiai',
  'grigiškėse': 'Grigiškės', 'grigiskese': 'Grigiškės',
};

// Synonym/keyword mapping: search term → { field patterns to search, extra search words }
interface SynonymMapping {
  extraPatterns: string[];  // additional ILIKE patterns to inject
  specialtyMatch?: string;  // for specialist specialty field
}

const SYNONYM_MAP: Record<string, SynonymMapping> = {
  'visą dieną': { extraPatterns: ['%I-V%', '%09:00%', '%08:00%', '%pilna%'] },
  'visa diena': { extraPatterns: ['%I-V%', '%09:00%', '%08:00%', '%pilna%'] },
  'pilna diena': { extraPatterns: ['%I-V%', '%09:00%', '%08:00%', '%pilna%'] },
  'po pamokų': { extraPatterns: ['%po pamokų%', '%popiet%', '%14:%', '%15:%'] },
  'popiet': { extraPatterns: ['%popiet%', '%po pamokų%', '%14:%', '%15:%'] },
  'montessori': { extraPatterns: ['%montessori%'] },
};

const SINGLE_WORD_SYNONYMS: Record<string, SynonymMapping> = {
  'anglų': { extraPatterns: ['%anglų%', '%english%', '%anglakalbis%'] },
  'anglu': { extraPatterns: ['%anglų%', '%english%', '%anglakalbis%'] },
  'anglakalbis': { extraPatterns: ['%anglų%', '%english%', '%anglakalbis%'] },
  'rusų': { extraPatterns: ['%rusų%', '%russian%'] },
  'rusu': { extraPatterns: ['%rusų%', '%russian%'] },
  'logopedas': { extraPatterns: ['%logoped%'], specialtyMatch: 'logoped' },
  'logopedė': { extraPatterns: ['%logoped%'], specialtyMatch: 'logoped' },
  'logopede': { extraPatterns: ['%logoped%'], specialtyMatch: 'logoped' },
  'psichologas': { extraPatterns: ['%psicholog%'], specialtyMatch: 'psicholog' },
  'psichologė': { extraPatterns: ['%psicholog%'], specialtyMatch: 'psicholog' },
  'psichologe': { extraPatterns: ['%psicholog%'], specialtyMatch: 'psicholog' },
  'montessori': { extraPatterns: ['%montessori%'] },
  'ergoterapeutas': { extraPatterns: ['%ergoterapeut%'], specialtyMatch: 'ergoterapeut' },
  'kineziterapeutas': { extraPatterns: ['%kineziterapeut%'], specialtyMatch: 'kineziterapeut' },
};

/**
 * Normalize a single word: resolve city declensions, neighborhood declensions
 */
export function normalizeWord(w: string): string {
  const lower = w.toLocaleLowerCase('lt');
  return CITY_DECLENSIONS[lower] || NEIGHBORHOOD_DECLENSIONS[lower] || w;
}

/**
 * Parse search query into normalized words + category filter + synonym patterns
 */
export function parseSearchQuery(q: string): {
  searchWords: string[];
  categoryFilter: string | null;
  synonymPatterns: string[];
} {
  const allWords = q.replace(/[%_]/g, '').split(/\s+/).filter(w => w.length > 0);
  let categoryFilter: string | null = null;
  const searchWords: string[] = [];
  const synonymPatterns: string[] = [];

  // Check multi-word synonyms first
  const lowerQ = q.toLocaleLowerCase('lt');
  for (const [phrase, mapping] of Object.entries(SYNONYM_MAP)) {
    if (lowerQ.includes(phrase)) {
      synonymPatterns.push(...mapping.extraPatterns);
    }
  }

  for (const w of allWords) {
    const lower = w.toLocaleLowerCase('lt');
    const cat = CATEGORY_KEYWORDS[lower];
    if (cat && !categoryFilter) {
      categoryFilter = cat;
    } else {
      searchWords.push(normalizeWord(w));
    }

    // Single-word synonyms
    const syn = SINGLE_WORD_SYNONYMS[lower];
    if (syn) {
      synonymPatterns.push(...syn.extraPatterns);
    }
  }

  // Deduplicate synonym patterns
  const uniquePatterns = Array.from(new Set(synonymPatterns));

  return {
    searchWords: searchWords.length > 0 ? searchWords : allWords,
    categoryFilter,
    synonymPatterns: uniquePatterns,
  };
}

// Search fields per entity type (for suggestions API raw SQL)
export const SUGGESTION_FIELDS = {
  kindergarten: ['name', 'city', 'COALESCE(area,\'\')', 'COALESCE(address,\'\')', 'COALESCE(description,\'\')'],
  aukle: ['name', 'city', 'COALESCE(area,\'\')', 'COALESCE(description,\'\')', 'COALESCE(availability,\'\')', 'COALESCE(languages,\'\')'],
  burelis: ['name', 'city', 'COALESCE(area,\'\')', 'COALESCE(description,\'\')', 'COALESCE(category,\'\')', 'COALESCE(schedule,\'\')'],
  specialist: ['name', 'city', 'COALESCE(area,\'\')', 'COALESCE(description,\'\')', 'COALESCE(specialty,\'\')', 'COALESCE(clinic,\'\')'],
};

// Search fields per entity type (for full search page)
export const FULL_SEARCH_FIELDS = {
  kindergarten: ['name', 'city', 'COALESCE(area,\'\')', 'COALESCE(address,\'\')', 'COALESCE(description,\'\')', 'COALESCE(type,\'\')', 'COALESCE(language,\'\')', 'COALESCE(hours,\'\')'],
  aukle: ['name', 'city', 'COALESCE(area,\'\')', 'COALESCE(description,\'\')', 'COALESCE(availability,\'\')', 'COALESCE(languages,\'\')', 'COALESCE(experience,\'\')'],
  burelis: ['name', 'city', 'COALESCE(area,\'\')', 'COALESCE(description,\'\')', 'COALESCE(category,\'\')', 'COALESCE(schedule,\'\')', 'COALESCE("ageRange",\'\')'],
  specialist: ['name', 'city', 'COALESCE(area,\'\')', 'COALESCE(description,\'\')', 'COALESCE(specialty,\'\')', 'COALESCE(clinic,\'\')', 'COALESCE(languages,\'\')'],
};

/**
 * Build SQL WHERE clause with unaccent ILIKE matching.
 * Each word must match at least one field. Synonym patterns are OR'd as additional match options.
 */
export function buildWhereClause(
  fields: string[],
  wordCount: number,
  synonymPatterns: string[] = [],
  paramOffset: number = 0,
): { clause: string; extraParams: string[] } {
  const andClauses = Array.from({ length: wordCount }, (_, i) => {
    const paramIdx = paramOffset + i + 1;
    const fieldOrs = fields.map(f => `unaccent(${f}) ILIKE unaccent($${paramIdx})`);
    // Add synonym pattern matches as additional OR options for this word
    const synOrs = synonymPatterns.map((_, si) => {
      const synParamIdx = paramOffset + wordCount + si + 1;
      return fields.map(f => `unaccent(${f}) ILIKE unaccent($${synParamIdx})`).join(' OR ');
    });
    const allOrs = [...fieldOrs, ...synOrs.map(s => `(${s})`)];
    return `(${allOrs.join(' OR ')})`;
  });

  return {
    clause: andClauses.join(' AND '),
    extraParams: synonymPatterns,
  };
}

/**
 * Build Prisma where conditions for the /api/search route (uses Prisma ORM).
 * Returns { AND: [...] } style conditions.
 */
export function buildPrismaWhere(
  fields: string[],
  words: string[],
  synonymPatterns: string[] = [],
) {
  return {
    AND: words.map(w => ({
      OR: [
        // Standard field matching
        ...fields.map(f => ({ [f]: { contains: w, mode: 'insensitive' as const } })),
        // Synonym pattern matching (without % wildcards, just the core term)
        ...synonymPatterns.map(p => {
          const term = p.replace(/%/g, '');
          return fields.map(f => ({ [f]: { contains: term, mode: 'insensitive' as const } }));
        }).flat(),
      ],
    })),
  };
}
