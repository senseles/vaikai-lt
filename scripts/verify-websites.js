#!/usr/bin/env node

/**
 * verify-websites.js
 * Checks all website URLs across kindergartens, bureliai, and specialists.
 * Aukle model has no website field.
 *
 * Usage: node scripts/verify-websites.js
 */

const { PrismaClient } = require('@prisma/client');
const { writeFileSync } = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;
const TIMEOUT_MS = 5000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeUrl(url) {
  if (!url) return null;
  let u = url.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) {
    u = 'https://' + u;
  }
  return u;
}

async function checkUrl(rawUrl) {
  const url = normalizeUrl(rawUrl);
  if (!url) return { status: 'FAIL', code: null, error: 'empty/invalid URL' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'vaikai-link-checker/1.0' },
    });
    clearTimeout(timer);

    const code = res.status;
    if (code >= 200 && code <= 399) {
      // Check if we were redirected (fetch with redirect:'follow' gives final response)
      if (res.redirected) {
        return { status: 'PASS', code, note: `redirected to ${res.url}` };
      }
      return { status: 'PASS', code };
    }
    return { status: 'FAIL', code };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { status: 'FAIL', code: null, error: 'timeout' };
    }
    // Some servers reject HEAD; try GET as fallback
    const controller2 = new AbortController();
    const timer2 = setTimeout(() => controller2.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller2.signal,
        headers: { 'User-Agent': 'vaikai-link-checker/1.0' },
      });
      clearTimeout(timer2);
      const code = res.status;
      if (code >= 200 && code <= 399) {
        return { status: 'PASS', code, note: 'HEAD failed, GET ok' };
      }
      return { status: 'FAIL', code };
    } catch (err2) {
      clearTimeout(timer2);
      if (err2.name === 'AbortError') {
        return { status: 'FAIL', code: null, error: 'timeout' };
      }
      return { status: 'FAIL', code: null, error: err2.message?.slice(0, 120) };
    }
  }
}

async function processBatches(items, entityType) {
  const results = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const check = await checkUrl(item.website);
        const label = check.status === 'PASS' ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
        const detail = check.error || `${check.code}`;
        console.log(`  ${label}  ${item.name} — ${item.website} [${detail}]${check.note ? ' (' + check.note + ')' : ''}`);
        return {
          entityType,
          id: item.id,
          name: item.name,
          city: item.city,
          website: item.website,
          ...check,
        };
      })
    );
    results.push(...batchResults);
    if (i + BATCH_SIZE < items.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }
  return results;
}

async function main() {
  console.log('Fetching entities with websites from database...\n');

  const [kindergartens, bureliai, specialists] = await Promise.all([
    prisma.kindergarten.findMany({
      where: { website: { not: null } },
      select: { id: true, name: true, city: true, website: true },
    }),
    prisma.burelis.findMany({
      where: { website: { not: null } },
      select: { id: true, name: true, city: true, website: true },
    }),
    prisma.specialist.findMany({
      where: { website: { not: null } },
      select: { id: true, name: true, city: true, website: true },
    }),
  ]);

  // Filter out empty-string websites
  const kgFiltered = kindergartens.filter((k) => k.website?.trim());
  const buFiltered = bureliai.filter((b) => b.website?.trim());
  const spFiltered = specialists.filter((s) => s.website?.trim());

  const total = kgFiltered.length + buFiltered.length + spFiltered.length;
  console.log(`Found ${total} entities with websites:`);
  console.log(`  Kindergartens: ${kgFiltered.length}`);
  console.log(`  Bureliai:      ${buFiltered.length}`);
  console.log(`  Specialists:   ${spFiltered.length}`);
  console.log(`\nNote: Aukle model has no website field — skipped.\n`);

  const allResults = [];

  if (kgFiltered.length > 0) {
    console.log(`\n--- Kindergartens (${kgFiltered.length}) ---`);
    allResults.push(...(await processBatches(kgFiltered, 'kindergarten')));
  }

  if (buFiltered.length > 0) {
    console.log(`\n--- Bureliai (${buFiltered.length}) ---`);
    allResults.push(...(await processBatches(buFiltered, 'burelis')));
  }

  if (spFiltered.length > 0) {
    console.log(`\n--- Specialists (${spFiltered.length}) ---`);
    allResults.push(...(await processBatches(spFiltered, 'specialist')));
  }

  // Summary
  const summary = {};
  for (const r of allResults) {
    if (!summary[r.entityType]) {
      summary[r.entityType] = { total: 0, pass: 0, fail: 0 };
    }
    summary[r.entityType].total++;
    if (r.status === 'PASS') summary[r.entityType].pass++;
    else summary[r.entityType].fail++;
  }

  console.log('\n\n========== SUMMARY ==========');
  let grandPass = 0, grandFail = 0;
  for (const [type, counts] of Object.entries(summary)) {
    console.log(`${type}: ${counts.pass} PASS / ${counts.fail} FAIL (${counts.total} total)`);
    grandPass += counts.pass;
    grandFail += counts.fail;
  }
  console.log(`------`);
  console.log(`TOTAL: ${grandPass} PASS / ${grandFail} FAIL (${grandPass + grandFail} total)`);
  console.log('=============================\n');

  // Save results
  const outputPath = path.join(__dirname, 'website-check-results.json');
  const output = {
    checkedAt: new Date().toISOString(),
    summary,
    grandTotal: { pass: grandPass, fail: grandFail, total: grandPass + grandFail },
    results: allResults,
  };
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Results saved to ${outputPath}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
