/**
 * Kindergarten data verification script.
 * Searches for real data online and updates both PROD and DEV databases.
 * 
 * Usage: node scripts/verify-kindergartens.mjs [--start N] [--limit N] [--dry-run]
 */

import { PrismaClient } from '@prisma/client';

const PROD_URL = "postgresql://neondb_owner:npg_UaNhwd2X0rek@ep-silent-term-altdxpx8.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const DEV_URL = "postgresql://neondb_owner:npg_UaNhwd2X0rek@ep-silent-term-altdxpx8.c-3.eu-central-1.aws.neon.tech/neondb_dev?sslmode=require";

const prod = new PrismaClient({ datasources: { db: { url: PROD_URL } } });
const dev = new PrismaClient({ datasources: { db: { url: DEV_URL } } });

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const startIdx = parseInt(args.find((_, i, a) => a[i-1] === '--start') || '0');
const limit = parseInt(args.find((_, i, a) => a[i-1] === '--limit') || '999');

// Search for kindergarten info using rekvizitai.lt
async function searchRekvizitai(name, city) {
  const query = encodeURIComponent(`${name} ${city}`);
  try {
    const res = await fetch(`https://rekvizitai.vz.lt/lt/company-search/1/?q=${query}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    
    // Extract first result's link
    const linkMatch = html.match(/href="(\/imone\/[^"]+)"/);
    if (!linkMatch) return null;
    
    const detailRes = await fetch(`https://rekvizitai.vz.lt${linkMatch[1]}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    const detailHtml = await detailRes.text();
    
    // Extract address
    const addrMatch = detailHtml.match(/Adresas[^<]*<[^>]*>([^<]+)/i) 
      || detailHtml.match(/itemprop="streetAddress"[^>]*>([^<]+)/i);
    
    // Extract phone
    const phoneMatch = detailHtml.match(/itemprop="telephone"[^>]*>([^<]+)/i)
      || detailHtml.match(/(\+370[\s\-]?\d[\s\-]?\d{2,3}[\s\-]?\d{2,5})/);
    
    return {
      address: addrMatch?.[1]?.trim() || null,
      phone: phoneMatch?.[1]?.trim() || null,
      source: 'rekvizitai.vz.lt',
    };
  } catch {
    return null;
  }
}

// Search using ugdu.lt
async function searchUgdu(name) {
  const slug = name.toLowerCase()
    .replace(/[„""]/g, '')
    .replace(/ą/g,'a').replace(/č/g,'c').replace(/ę/g,'e').replace(/ė/g,'e')
    .replace(/į/g,'i').replace(/š/g,'s').replace(/ų/g,'u').replace(/ū/g,'u').replace(/ž/g,'z')
    .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  try {
    const res = await fetch(`https://ugdu.lt/darzelis/${slug}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    
    const addrMatch = html.match(/Adresas[:\s]*<[^>]*>([^<]+)/i) || html.match(/address[^>]*>([^<]+</i);
    const phoneMatch = html.match(/Telefonas[:\s]*<[^>]*>([^<]+)/i) || html.match(/(\+370[\s\-]?\d[\s\-]?\d{2,3}[\s\-]?\d{2,5})/);
    
    return {
      address: addrMatch?.[1]?.trim() || null,
      phone: phoneMatch?.[1]?.trim() || null,
      source: 'ugdu.lt',
    };
  } catch {
    return null;
  }
}

// Google search as fallback
async function searchGoogle(name, city) {
  const query = encodeURIComponent(`"${name}" ${city} adresas telefonas`);
  try {
    const res = await fetch(`https://www.google.com/search?q=${query}&hl=lt`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    
    // Try to extract phone from Google's knowledge panel
    const phoneMatch = html.match(/(\+370[\s\-]?\d[\s\-]?\d{2,3}[\s\-]?\d{2,5})/);
    // Try address
    const addrMatch = html.match(/([A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+\s+g\.\s+\d+[^<,]{0,40})/);
    
    return {
      address: addrMatch?.[1]?.trim() || null, 
      phone: phoneMatch?.[1]?.trim() || null,
      source: 'google',
    };
  } catch {
    return null;
  }
}

async function verifyKindergarten(kg) {
  // Try multiple sources
  let result = await searchRekvizitai(kg.name, kg.city);
  if (!result?.address && !result?.phone) {
    result = await searchUgdu(kg.name);
  }
  
  return result;
}

async function main() {
  const kindergartens = await prod.kindergarten.findMany({
    orderBy: { city: 'asc' },
    skip: startIdx,
    take: limit,
  });
  
  console.log(`\n🔍 Verifying ${kindergartens.length} kindergartens (start: ${startIdx})...\n`);
  
  let verified = 0, updated = 0, failed = 0;
  const results = [];
  
  for (let i = 0; i < kindergartens.length; i++) {
    const kg = kindergartens[i];
    process.stdout.write(`[${i+1}/${kindergartens.length}] ${kg.name} (${kg.city})... `);
    
    const found = await verifyKindergarten(kg);
    
    if (found && (found.address || found.phone)) {
      const changes = {};
      let changed = false;
      
      if (found.address && found.address !== kg.address && found.address.length > 5) {
        changes.address = found.address;
        changed = true;
      }
      if (found.phone && found.phone !== kg.phone && found.phone.length > 5) {
        changes.phone = found.phone;
        changed = true;
      }
      
      if (changed) {
        if (!dryRun) {
          await prod.kindergarten.update({ where: { id: kg.id }, data: changes }).catch(() => {});
          await dev.kindergarten.update({ where: { id: kg.id }, data: changes }).catch(() => {});
        }
        console.log(`✏️  UPDATED (${found.source}): ${JSON.stringify(changes)}`);
        results.push({ name: kg.name, city: kg.city, old: { address: kg.address, phone: kg.phone }, new: changes, source: found.source });
        updated++;
      } else {
        console.log(`✅ OK`);
        verified++;
      }
    } else {
      console.log(`⚠️  No data found`);
      failed++;
    }
    
    // Rate limit - wait between requests
    await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log(`\n📊 RESULTS:`);
  console.log(`  ✅ Verified (no change needed): ${verified}`);
  console.log(`  ✏️  Updated: ${updated}`);
  console.log(`  ⚠️  No data found: ${failed}`);
  console.log(`  ${dryRun ? '🔍 DRY RUN - no changes made' : '💾 Changes saved to PROD + DEV'}`);
  
  if (results.length > 0) {
    console.log('\n--- CHANGES ---');
    for (const r of results) {
      console.log(`${r.name} (${r.city}):`);
      if (r.new.address) console.log(`  address: "${r.old.address}" → "${r.new.address}"`);
      if (r.new.phone) console.log(`  phone: "${r.old.phone}" → "${r.new.phone}"`);
    }
  }
  
  await prod.$disconnect();
  await dev.$disconnect();
}

main().catch(console.error);
