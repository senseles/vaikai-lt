/**
 * Import kindergartens from lrvalstybe.lt (official Lithuanian government contacts portal).
 * Sources: Vilnius and Kaunas municipal kindergarten listings.
 *
 * Run: npx tsx scripts/import-kindergartens.ts
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Vilnius postal code → neighborhood ──────────────────────────────────────

const VILNIUS_POSTAL_MAP: Record<string, string> = {
  '01': 'Senamiestis',
  '02': 'Žirmūnai',
  '03': 'Antakalnis',
  '04': 'Naujamiestis',
  '05': 'Justiniškės',
  '06': 'Šeškinė',
  '07': 'Fabijoniškės',
  '08': 'Antakalnis',
  '09': 'Šnipiškės',
  '10': 'Naujininkai',
  '11': 'Naujininkai',
  '12': 'Pilaitė',
  '13': 'Lazdynai',
  '14': 'Žvėrynas',
};

// More specific postal code ranges for Vilnius
const VILNIUS_POSTAL_DETAILED: [string, string][] = [
  ['LT-010', 'Senamiestis'],
  ['LT-011', 'Senamiestis'],
  ['LT-012', 'Senamiestis'],
  ['LT-021', 'Žirmūnai'],
  ['LT-022', 'Žirmūnai'],
  ['LT-023', 'Žirmūnai'],
  ['LT-030', 'Antakalnis'],
  ['LT-031', 'Antakalnis'],
  ['LT-040', 'Naujamiestis'],
  ['LT-041', 'Naujamiestis'],
  ['LT-042', 'Naujamiestis'],
  ['LT-050', 'Justiniškės'],
  ['LT-051', 'Viršuliškės'],
  ['LT-060', 'Šeškinė'],
  ['LT-061', 'Šeškinė'],
  ['LT-070', 'Fabijoniškės'],
  ['LT-071', 'Pašilaičiai'],
  ['LT-072', 'Pašilaičiai'],
  ['LT-080', 'Antakalnis'],
  ['LT-081', 'Antakalnis'],
  ['LT-082', 'Verkiai'],
  ['LT-083', 'Verkiai'],
  ['LT-084', 'Bajorai'],
  ['LT-090', 'Šnipiškės'],
  ['LT-091', 'Šnipiškės'],
  ['LT-100', 'Naujininkai'],
  ['LT-101', 'Rasos'],
  ['LT-102', 'Naujininkai'],
  ['LT-110', 'Naujininkai'],
  ['LT-111', 'Naujininkai'],
  ['LT-120', 'Pilaitė'],
  ['LT-121', 'Pilaitė'],
  ['LT-130', 'Lazdynai'],
  ['LT-131', 'Karoliniškės'],
  ['LT-132', 'Karoliniškės'],
  ['LT-140', 'Žvėrynas'],
  ['LT-141', 'Žvėrynas'],
];

// Kaunas postal code → neighborhood
const KAUNAS_POSTAL_MAP: Record<string, string> = {
  '44': 'Centras',
  '45': 'Dainava',
  '46': 'Žaliakalnis',
  '47': 'Eiguliai',
  '48': 'Petrašiūnai',
  '49': 'Šančiai',
  '50': 'Aleksotas',
  '51': 'Vilijampolė',
  '52': 'Šilainiai',
};

function getNeighborhoodFromAddress(address: string, city: string): string | null {
  if (!address) return null;

  // Extract postal code (LT-XXXXX or just XXXXX)
  const postalMatch = address.match(/LT[-\s]?(\d{5})/i) || address.match(/(\d{5})\s/);
  if (postalMatch) {
    const code = postalMatch[1];
    const prefix2 = code.substring(0, 2);

    if (city === 'Vilnius') {
      // Try detailed first
      const ltPrefix = `LT-${code.substring(0, 3)}`;
      for (const [prefix, area] of VILNIUS_POSTAL_DETAILED) {
        if (ltPrefix.startsWith(prefix)) return area;
      }
      return VILNIUS_POSTAL_MAP[prefix2] || null;
    }

    if (city === 'Kaunas') {
      return KAUNAS_POSTAL_MAP[prefix2] || null;
    }
  }

  return null;
}

// ── Cloudflare email decoding ───────────────────────────────────────────────

function decodeCfEmail(encoded: string): string {
  const key = parseInt(encoded.substring(0, 2), 16);
  let email = '';
  for (let i = 2; i < encoded.length; i += 2) {
    email += String.fromCharCode(parseInt(encoded.substring(i, i + 2), 16) ^ key);
  }
  return email;
}

// ── Fetch with retry ────────────────────────────────────────────────────────

async function fetchPage(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VaikaiLT/1.0)' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`  Retry ${i + 1} for ${url}`);
      await sleep(1000);
    }
  }
  throw new Error('Unreachable');
}

// ── Extract kindergarten links from list page ───────────────────────────────

interface KindergartenLink {
  url: string;
  name: string;
}

function extractLinks(html: string, cityPrefix: string): KindergartenLink[] {
  const $ = cheerio.load(html);
  const links: KindergartenLink[] = [];

  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const name = $(el).text().trim();
    // Filter to only kindergarten detail links (contain city prefix in URL)
    if (
      href.includes('/kontaktai/') &&
      href.includes(cityPrefix) &&
      !href.includes('svietimo-') &&
      !href.includes('neformaliojo-') &&
      !href.includes('lopseliai-darzeliai-') &&
      !href.includes('darzeliai-3') &&
      name.length > 5
    ) {
      links.push({ url: href, name: decodeHtmlEntities(name) });
    }
  });

  return links;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Extract detail info from a kindergarten page ────────────────────────────

interface KindergartenDetail {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}

function extractDetail(html: string, fallbackName: string): KindergartenDetail {
  const $ = cheerio.load(html);

  // Name from h1.card-header (strip " - Lopšeliai-darželiai" etc. suffixes)
  let name = '';
  $('h1.card-header').each((_, el) => {
    let text = $(el).text().trim();
    // Remove category suffixes like " - Lopšeliai-darželiai", " - Darželiai"
    text = text.replace(/\s*-\s*(Lopšeliai-darželiai|Darželiai|Mokyklos).*$/i, '').trim();
    if (text.length > 3) name = text;
  });
  if (!name) name = fallbackName;

  // Use regex to extract fields from the HTML - more reliable than DOM traversal
  // because the data is in text nodes after <span class="font-weight-bold"> elements.

  // Address: text after "Adresas </span>"
  let address: string | null = null;
  const addrMatch = html.match(/<span class="font-weight-bold">Adresas\s*<\/span>([^<]+)/);
  if (addrMatch) {
    address = addrMatch[1].trim();
  }

  // Phone: text after "Telefonas </span>" or "Mobilus telefonas"
  let phone: string | null = null;
  const phoneMatch = html.match(/<span class="font-weight-bold">(?:Mobilus\s+)?[Tt]elefonas\s*<\/span>([^<]+)/);
  if (phoneMatch) {
    phone = phoneMatch[1].trim();
  }

  // Email: decode Cloudflare-protected emails (first in card-list__item-info)
  let email: string | null = null;
  const cfMatch = html.match(/data-cfemail="([a-f0-9]+)"/);
  if (cfMatch) {
    email = decodeCfEmail(cfMatch[1]);
  }

  // Website: from <a href="..."> after "Internetinis adresas" or from icon-link
  let website: string | null = null;
  const webMatch = html.match(/Internetinis adresas\s*<\/span>\s*\n?\s*<a href="(https?:\/\/[^"]+)"/);
  if (webMatch && !webMatch[1].includes('lrvalstybe.lt') && !webMatch[1].includes('vilnius.lt')) {
    website = webMatch[1];
  }
  // Fallback: icon-link section
  if (!website) {
    const linkMatch = html.match(/icon-link[\s\S]*?Nuoroda\s*<a href="(https?:\/\/[^"]+)"/);
    if (linkMatch && !linkMatch[1].includes('lrvalstybe.lt') && !linkMatch[1].includes('vilnius.lt') && !linkMatch[1].includes('kaunas.lt')) {
      website = linkMatch[1];
    }
  }

  return { name: decodeHtmlEntities(name), address, phone, email, website };
}

// ── Duplicate detection ─────────────────────────────────────────────────────

function normalizeForComparison(name: string): string {
  return name
    .toLowerCase()
    .replace(/[„""''«»\u201e\u201c\u201d\u2018\u2019]/g, '')
    .replace(/lopšelis[-\s]*darželis/gi, '')
    .replace(/vaikų/gi, '')
    .replace(/vilniaus|kauno/gi, '')
    .replace(/l[-\s]*d\b/gi, '')
    .replace(/specialusis/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function isDuplicate(name: string, city: string): Promise<boolean> {
  const normalized = normalizeForComparison(name);
  const existing = await prisma.kindergarten.findMany({
    where: { city },
    select: { name: true },
  });

  for (const e of existing) {
    const existingNorm = normalizeForComparison(e.name);
    // Exact match after normalization
    if (existingNorm === normalized) return true;
    // One contains the other (handles "Saulutė" vs "Darželis Saulutė")
    if (existingNorm.includes(normalized) || normalized.includes(existingNorm)) return true;
    // Check core name similarity (last significant word)
    const words1 = normalized.split(' ').filter(w => w.length > 3);
    const words2 = existingNorm.split(' ').filter(w => w.length > 3);
    if (words1.length > 0 && words2.length > 0) {
      const last1 = words1[words1.length - 1];
      const last2 = words2[words2.length - 1];
      if (last1 === last2 && last1.length > 4) return true;
    }
  }
  return false;
}

// ── Ensure unique slug ──────────────────────────────────────────────────────

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 1;
  while (await prisma.kindergarten.findUnique({ where: { slug } })) {
    slug = `${base}-${i}`;
    i++;
  }
  return slug;
}

// ── Main import ─────────────────────────────────────────────────────────────

interface CityConfig {
  city: string;
  listUrls: string[];
  linkPrefix: string;
}

const CITIES: CityConfig[] = [
  {
    city: 'Vilnius',
    listUrls: ['https://www.lrvalstybe.lt/kontaktai/lopseliai-darzeliai-52'],
    linkPrefix: 'vilniaus-',
  },
  {
    city: 'Kaunas',
    listUrls: [
      'https://www.lrvalstybe.lt/kontaktai/lopseliai-darzeliai-12',
      'https://www.lrvalstybe.lt/kontaktai/darzeliai-3',
    ],
    linkPrefix: 'kauno-',
  },
];

async function importCity(config: CityConfig) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Importing ${config.city} kindergartens...`);
  console.log(`${'='.repeat(60)}`);

  // 1. Fetch all list pages and extract links
  const allLinks: KindergartenLink[] = [];
  for (const listUrl of config.listUrls) {
    console.log(`Fetching list: ${listUrl}`);
    const listHtml = await fetchPage(listUrl);
    const links = extractLinks(listHtml, config.linkPrefix);
    console.log(`  Found ${links.length} links`);
    allLinks.push(...links);
  }

  // Deduplicate links by URL
  const uniqueLinks = [...new Map(allLinks.map(l => [l.url, l])).values()];
  console.log(`Total unique links: ${uniqueLinks.length}`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  // Cache existing names for this city to speed up duplicate detection
  const existingNames = (await prisma.kindergarten.findMany({
    where: { city: config.city },
    select: { name: true },
  })).map(e => e.name);
  console.log(`Existing ${config.city} kindergartens in DB: ${existingNames.length}`);

  for (let i = 0; i < uniqueLinks.length; i++) {
    const link = uniqueLinks[i];
    const progress = `[${i + 1}/${uniqueLinks.length}]`;

    try {
      // Check for duplicate before fetching detail page
      if (await isDuplicate(link.name, config.city)) {
        console.log(`  ${progress} SKIP (duplicate): ${link.name}`);
        skipped++;
        continue;
      }

      // Fetch detail page
      await sleep(500); // Rate limiting
      const detailHtml = await fetchPage(link.url);
      const detail = extractDetail(detailHtml, link.name);

      // Determine neighborhood from address
      const area = detail.address
        ? getNeighborhoodFromAddress(detail.address, config.city)
        : null;

      // Clean up name: remove quotes artifacts
      let cleanName = detail.name
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();

      const slug = await uniqueSlug(toSlug(cleanName));

      await prisma.kindergarten.create({
        data: {
          name: cleanName,
          slug,
          city: config.city,
          address: detail.address,
          area,
          phone: detail.phone,
          website: detail.website,
          type: 'valstybinis',
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date(),
          verifiedBy: 'lrvalstybe.lt',
        },
      });

      console.log(`  ${progress} CREATED: ${cleanName} | ${area || 'no area'} | ${detail.address || 'no addr'}`);
      created++;

      // Refresh existing names cache
      existingNames.push(cleanName);
    } catch (e: any) {
      console.error(`  ${progress} ERROR: ${link.name} - ${e.message}`);
      errors++;
    }
  }

  console.log(`\n${config.city} Summary: ${created} created, ${skipped} duplicates skipped, ${errors} errors`);
  return { created, skipped, errors };
}

async function main() {
  console.log('Starting kindergarten import from lrvalstybe.lt');
  console.log('================================================\n');

  const totals = { created: 0, skipped: 0, errors: 0 };

  for (const city of CITIES) {
    const result = await importCity(city);
    totals.created += result.created;
    totals.skipped += result.skipped;
    totals.errors += result.errors;
  }

  // Final counts
  const vilnius = await prisma.kindergarten.count({ where: { city: 'Vilnius' } });
  const kaunas = await prisma.kindergarten.count({ where: { city: 'Kaunas' } });
  const total = await prisma.kindergarten.count();

  console.log(`\n${'='.repeat(60)}`);
  console.log('FINAL TOTALS');
  console.log(`${'='.repeat(60)}`);
  console.log(`New: ${totals.created} | Skipped: ${totals.skipped} | Errors: ${totals.errors}`);
  console.log(`DB counts — Vilnius: ${vilnius}, Kaunas: ${kaunas}, Total: ${total}`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Fatal error:', e);
  prisma.$disconnect();
  process.exit(1);
});
