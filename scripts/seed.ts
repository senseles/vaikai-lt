import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const LT_CHAR_MAP: Record<string, string> = {
  'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
  'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
};
const LT_CHAR_RE = new RegExp('[' + Object.keys(LT_CHAR_MAP).join('') + ']', 'g');

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(LT_CHAR_RE, (ch) => LT_CHAR_MAP[ch] || ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractArrays(scriptPath: string) {
  const content = fs.readFileSync(scriptPath, 'utf-8');

  function extractArray(varName: string): unknown[] {
    const regex = new RegExp(`const ${varName}\\s*=\\s*\\[`, 'g');
    const match = regex.exec(content);
    if (!match) throw new Error(`Could not find ${varName}`);

    let depth = 0;
    let start = match.index + match[0].length - 1;
    let i = start;
    for (; i < content.length; i++) {
      if (content[i] === '[') depth++;
      else if (content[i] === ']') {
        depth--;
        if (depth === 0) break;
      }
    }
    const arrayStr = content.slice(start, i + 1);
    // Use Function to evaluate the array literal
    const fn = new Function(`return ${arrayStr}`);
    return fn() as unknown[];
  }

  return {
    kindergartens: extractArray('DEFAULT_KINDERGARTENS'),
    aukles: extractArray('DEFAULT_AUKLES'),
    bureliai: extractArray('DEFAULT_BURELIAI'),
    specialists: extractArray('DEFAULT_SPECIALISTAI'),
  };
}

interface KindergartenData {
  id?: string; name: string; city: string; region?: string; area?: string;
  address?: string; type?: string; phone?: string; website?: string;
  language?: string; ageFrom?: number; groups?: number | null; hours?: string;
  features?: string[]; description?: string; note?: string;
  baseRating?: number; baseReviewCount?: number; isUserAdded?: boolean;
}

interface AukleData {
  id?: string; name: string; city: string; region?: string; area?: string;
  phone?: string; email?: string; experience?: number; ageRange?: string;
  hourlyRate?: string; languages?: string; description?: string;
  availability?: string; baseRating?: number; baseReviewCount?: number;
  isServicePortal?: boolean; isUserAdded?: boolean;
}

interface BurelisData {
  id?: string; name: string; city: string; region?: string; area?: string;
  category?: string; subcategory?: string; ageRange?: string; price?: string;
  schedule?: string; phone?: string; website?: string; description?: string;
  baseRating?: number; baseReviewCount?: number; isUserAdded?: boolean;
}

interface SpecialistData {
  id?: string; name: string; city: string; region?: string; area?: string;
  specialty?: string; clinic?: string; price?: string; phone?: string;
  website?: string; email?: string; languages?: string; description?: string;
  baseRating?: number; baseReviewCount?: number; isUserAdded?: boolean;
}

async function main() {
  const scriptPath = path.resolve(__dirname, '../../darzeliai-atsiliepimai/script.js');
  console.log(`Reading source data from: ${scriptPath}`);

  const data = extractArrays(scriptPath);

  console.log(`Found: ${data.kindergartens.length} kindergartens, ${data.aukles.length} aukles, ${data.bureliai.length} bureliai, ${data.specialists.length} specialists`);

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.kindergarten.deleteMany();
  await prisma.aukle.deleteMany();
  await prisma.burelis.deleteMany();
  await prisma.specialist.deleteMany();

  // Seed kindergartens
  const slugCounts: Record<string, number> = {};
  function uniqueSlug(name: string): string {
    let slug = toSlug(name);
    if (slugCounts[slug]) {
      slugCounts[slug]++;
      slug = `${slug}-${slugCounts[slug]}`;
    } else {
      slugCounts[slug] = 1;
    }
    return slug;
  }

  for (const raw of data.kindergartens as KindergartenData[]) {
    const slug = uniqueSlug(raw.name);
    await prisma.kindergarten.create({
      data: {
        slug,
        name: raw.name,
        city: raw.city,
        region: raw.region ?? null,
        area: raw.area ?? null,
        address: raw.address ?? null,
        type: raw.type ?? 'valstybinis',
        phone: raw.phone ?? null,
        website: raw.website ?? null,
        language: raw.language ?? null,
        ageFrom: raw.ageFrom ?? null,
        groups: raw.groups ?? null,
        hours: raw.hours ?? null,
        features: JSON.stringify(raw.features ?? []),
        description: raw.description ?? null,
        note: raw.note ?? null,
        baseRating: raw.baseRating ?? 0,
        baseReviewCount: raw.baseReviewCount ?? 0,
        isUserAdded: raw.isUserAdded ?? false,
      },
    });
  }
  console.log(`Seeded ${data.kindergartens.length} kindergartens`);

  for (const raw of data.aukles as AukleData[]) {
    const slug = uniqueSlug(raw.name);
    await prisma.aukle.create({
      data: {
        slug,
        name: raw.name,
        city: raw.city,
        region: raw.region ?? null,
        area: raw.area ?? null,
        phone: raw.phone ?? null,
        email: raw.email ?? null,
        experience: raw.experience != null ? String(raw.experience) : null,
        ageRange: raw.ageRange ?? null,
        hourlyRate: raw.hourlyRate ?? null,
        languages: raw.languages ?? null,
        description: raw.description ?? null,
        availability: raw.availability ?? null,
        baseRating: raw.baseRating ?? 0,
        baseReviewCount: raw.baseReviewCount ?? 0,
        isServicePortal: raw.isServicePortal ?? false,
        isUserAdded: raw.isUserAdded ?? false,
      },
    });
  }
  console.log(`Seeded ${data.aukles.length} aukles`);

  for (const raw of data.bureliai as BurelisData[]) {
    const slug = uniqueSlug(raw.name);
    await prisma.burelis.create({
      data: {
        slug,
        name: raw.name,
        city: raw.city,
        region: raw.region ?? null,
        area: raw.area ?? null,
        category: raw.category ?? null,
        subcategory: raw.subcategory ?? null,
        ageRange: raw.ageRange ?? null,
        price: raw.price ?? null,
        schedule: raw.schedule ?? null,
        phone: raw.phone ?? null,
        website: raw.website ?? null,
        description: raw.description ?? null,
        baseRating: raw.baseRating ?? 0,
        baseReviewCount: raw.baseReviewCount ?? 0,
        isUserAdded: raw.isUserAdded ?? false,
      },
    });
  }
  console.log(`Seeded ${data.bureliai.length} bureliai`);

  for (const raw of data.specialists as SpecialistData[]) {
    const slug = uniqueSlug(raw.name);
    await prisma.specialist.create({
      data: {
        slug,
        name: raw.name,
        city: raw.city,
        region: raw.region ?? null,
        area: raw.area ?? null,
        specialty: raw.specialty ?? null,
        clinic: raw.clinic ?? null,
        price: raw.price ?? null,
        phone: raw.phone ?? null,
        website: raw.website ?? null,
        languages: raw.languages ?? null,
        description: raw.description ?? null,
        baseRating: raw.baseRating ?? 0,
        baseReviewCount: raw.baseReviewCount ?? 0,
        isUserAdded: raw.isUserAdded ?? false,
      },
    });
  }
  console.log(`Seeded ${data.specialists.length} specialists`);

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
