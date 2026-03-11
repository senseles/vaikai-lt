/**
 * Kindergarten Data Verification Script
 * Cross-checks DB data against verified real Lithuanian kindergarten data
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

// VERIFIED REAL DATA from official sources (alytus.lt, tavovardas.com, lrvalstybe.lt, etc.)
const REAL_ALYTUS_KINDERGARTENS = [
  { name: 'Alytaus Drevinuko mokykla-darželis', address: 'Topolių g. 19, LT-63331 Alytus', phone: '+370 315 70525' },
  { name: 'Alytaus vaikų darželis Boružėlė', address: 'Likiškėlių g. 14, LT-63163 Alytus', phone: '+370 315 76620' },
  { name: 'Alytaus lopšelis-darželis Du Gaideliai', address: 'Jaunimo g. 15, LT-63314 Alytus', phone: '+370 315 76581' },
  { name: 'Alytaus lopšelis-darželis Eglutė', address: 'Vilties g. 28a, LT-63205 Alytus', phone: '+370 315 76650' },
  { name: 'Alytaus lopšelis-darželis Gintarėlis', address: 'Jaunimo g. 3, LT-63348 Alytus', phone: '+370 315 76571' },
  { name: 'Alytaus lopšelis-darželis Girinukas', address: 'Daugų g. 8, LT-62172 Alytus', phone: '+370 315 76560' },
  { name: 'Alytaus lopšelis-darželis Linelis', address: 'Jaunimo g. 13, LT-63313 Alytus', phone: '+370 315 76630' },
  { name: 'Alytaus lopšelis-darželis Nykštukas', address: 'A. Juozapavičiaus g. 44, LT-62256 Alytus', phone: '+370 315 76521' },
  { name: 'Alytaus lopšelis-darželis Obelėlė', address: 'Šaltinių g. 3, LT-62346 Alytus', phone: '+370 315 72930' },
  { name: 'Alytaus lopšelis-darželis Pasaka', address: 'Vingio g. 7a, LT-63219 Alytus', phone: '+370 315 76600' },
  { name: 'Alytaus lopšelis-darželis Pušynėlis', address: 'Margio g. 1, LT-62153 Alytus', phone: '+370 315 76551' },
  { name: 'Alytaus lopšelis-darželis Putinėlis', address: 'Putinų g. 18, LT-62324 Alytus', phone: '+370 315 76510' },
  { name: 'Alytaus lopšelis-darželis Šaltinėlis', address: 'Šaltinių g. 26, LT-62341 Alytus', phone: '+370 315 72940' },
  { name: 'Alytaus lopšelis-darželis Saulutė', address: 'Naujoji g. 32, LT-63254 Alytus', phone: '+370 315 72960' },
  { name: 'Alytaus lopšelis-darželis Volungėlė', address: 'Volungės g. 25, LT-63175 Alytus', phone: '+370 315 76590' },
  { name: 'Alytaus lopšelis-darželis Vyturėlis', address: 'Miklusėnų g. 38a, LT-62332 Alytus', phone: '+370 315 72921' },
];

// Real Vilnius kindergartens (verified from lrvalstybe.lt, gintarelisvilnius.lt)
const VERIFIED_VILNIUS_SAMPLES = [
  { name: 'Vilniaus lopšelis-darželis „Gintarėlis"', address: 'Didlaukio g. 35, LT-08320 Vilnius', phone: '+370 5 277 7786', website: 'https://www.gintarelisvilnius.lt' },
  { name: 'Vilniaus lopšelis-darželis „Vieversys"', address: 'Žirmūnų g. 89, LT-09116 Vilnius', phone: '+370 5 277 0736' },
  { name: 'Vilniaus Markučių lopšelis-darželis', address: 'Pakraščio g. 15', phone: null },
];

// Real Kaunas kindergartens (from kaunas.lt, web search)
const VERIFIED_KAUNAS_SAMPLES = [
  { name: 'Kauno lopšelis-darželis „Pagrandukas"', address: 'V. Krėvės pr. 58, LT-50459 Kaunas' },
  { name: 'Kauno lopšelis-darželis „Vaivorykštė"', address: 'Geležinio Vilko 9, Kaunas' },
  { name: 'Kauno lopšelis-darželis „Pušaitė"', address: 'Varnių g. 49, Kaunas' },
  { name: 'Kauno lopšelis-darželis „Malūnėlis"', address: 'Kovo 11-osios g. 48, LT-51325 Kaunas' },
  { name: 'Kauno lopšelis-darželis „Obelėlė"', address: 'K. Baršausko g. 76, LT-51439, Kaunas' },
];

function extractKeyName(name) {
  // Extract the main name from various naming patterns
  const patterns = [
    /[„"](.+?)[""]/,
    /l-d\s+(.+)/i,
    /darželis\s+(.+)/i,
    /lopšelis-darželis\s+(.+)/i,
  ];
  for (const p of patterns) {
    const m = name.match(p);
    if (m) return m[1].trim().replace(/[„""]/g, '');
  }
  return name;
}

async function verify() {
  const findings = [];

  // === 1. Get all kindergartens ===
  const all = await prisma.kindergarten.findMany({ orderBy: { name: 'asc' } });
  console.log(`Total kindergartens in DB: ${all.length}`);

  // === 2. Check Alytus kindergartens against real data ===
  console.log('\n=== ALYTUS VERIFICATION ===');
  const alytus = all.filter(k => k.city === 'Alytus');
  console.log(`DB has ${alytus.length} Alytus kindergartens, real count: ${REAL_ALYTUS_KINDERGARTENS.length}`);

  // Cross-reference by name
  const realAlytusNames = REAL_ALYTUS_KINDERGARTENS.map(r => extractKeyName(r.name).toLowerCase());

  for (const dbK of alytus) {
    const dbKeyName = extractKeyName(dbK.name).toLowerCase();
    const realMatch = REAL_ALYTUS_KINDERGARTENS.find(r =>
      extractKeyName(r.name).toLowerCase() === dbKeyName ||
      r.name.toLowerCase().includes(dbKeyName) ||
      dbKeyName.includes(extractKeyName(r.name).toLowerCase())
    );

    if (realMatch) {
      const issues = [];
      // Compare address
      const realAddr = realMatch.address.split(',')[0].trim();
      if (dbK.address && !dbK.address.includes(realAddr.split(' ')[0])) {
        issues.push(`ADDRESS MISMATCH: DB="${dbK.address}" vs REAL="${realMatch.address}"`);
      }
      // Compare phone
      const realPhoneDigits = realMatch.phone.replace(/\D/g, '');
      const dbPhoneDigits = (dbK.phone || '').replace(/\D/g, '');
      if (dbPhoneDigits && dbPhoneDigits !== realPhoneDigits) {
        issues.push(`PHONE MISMATCH: DB="${dbK.phone}" vs REAL="${realMatch.phone}"`);
      }

      if (issues.length > 0) {
        console.log(`  ⚠️  ${dbK.name}: ${issues.join('; ')}`);
        findings.push({ city: 'Alytus', entity: dbK.name, type: 'DATA_MISMATCH', details: issues, realData: realMatch });
      } else {
        console.log(`  ✅ ${dbK.name}: matches real data`);
      }
    } else {
      console.log(`  ❌ ${dbK.name}: NOT FOUND in real Alytus kindergarten list`);
      findings.push({ city: 'Alytus', entity: dbK.name, type: 'NOT_FOUND_IN_REAL', details: 'Kindergarten not in official Alytus list' });
    }
  }

  // Check for real kindergartens missing from DB
  for (const real of REAL_ALYTUS_KINDERGARTENS) {
    const realKeyName = extractKeyName(real.name).toLowerCase();
    const dbMatch = alytus.find(k => {
      const kn = extractKeyName(k.name).toLowerCase();
      return kn === realKeyName || kn.includes(realKeyName) || realKeyName.includes(kn);
    });
    if (!dbMatch) {
      console.log(`  ➕ MISSING from DB: ${real.name} (${real.address})`);
      findings.push({ city: 'Alytus', entity: real.name, type: 'MISSING_FROM_DB', details: real });
    }
  }

  // === 3. Check for fabricated addresses (name-matching pattern) ===
  console.log('\n=== FABRICATED ADDRESS CHECK ===');
  let fabricatedCount = 0;
  for (const k of all) {
    if (!k.address) continue;
    const keyName = extractKeyName(k.name).toLowerCase();
    const addrLower = k.address.toLowerCase();
    // Check if address street matches the kindergarten name (strong indicator of fabrication)
    if (keyName.length > 3 && addrLower.includes(keyName.substring(0, Math.min(keyName.length, 6)))) {
      // Could be legitimate (e.g., "Šaltinėlis" at "Šaltinių g.") — but suspicious
      // Check if address ends with " 1" which is very suspect
      if (/\s1$/.test(k.address)) {
        fabricatedCount++;
        findings.push({ city: k.city, entity: k.name, type: 'LIKELY_FABRICATED_ADDRESS', details: `Address "${k.address}" matches name pattern and uses house number 1` });
      }
    }
  }
  console.log(`Found ${fabricatedCount} kindergartens with likely fabricated addresses (name-matching + house #1)`);

  // === 4. Check for vague addresses ===
  console.log('\n=== VAGUE/INCOMPLETE ADDRESSES ===');
  let vagueCount = 0;
  const vaguePatterns = [
    /^[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+,\s*[A-ZĄČĘĖĮŠŲŪŽ]/,  // "Antakalnis, Vilnius"
    /^[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+$/,  // Just "Kaunas"
  ];
  for (const k of all) {
    const addr = k.address || '';
    if (!addr || vaguePatterns.some(p => p.test(addr)) || addr === k.city) {
      vagueCount++;
      if (vagueCount <= 30) {
        console.log(`  ${k.name} (${k.city}): "${addr || 'NULL'}"`);
      }
    }
  }
  console.log(`Total vague/missing addresses: ${vagueCount} out of ${all.length}`);

  // === 5. City distribution check ===
  console.log('\n=== CITY DISTRIBUTION ===');
  const cityCount = {};
  all.forEach(k => { cityCount[k.city] = (cityCount[k.city] || 0) + 1; });
  const sorted = Object.entries(cityCount).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([city, count]) => console.log(`  ${city}: ${count}`));

  // === 6. Website pattern analysis ===
  console.log('\n=== WEBSITE PATTERN ANALYSIS ===');
  const websitePatterns = {};
  all.forEach(k => {
    if (!k.website) return;
    try {
      const domain = new URL(k.website).hostname;
      const parts = domain.split('.');
      const tld = parts.slice(-2).join('.');
      websitePatterns[tld] = (websitePatterns[tld] || 0) + 1;
    } catch {}
  });
  Object.entries(websitePatterns).sort((a, b) => b[1] - a[1]).forEach(([pat, cnt]) => {
    console.log(`  ${pat}: ${cnt}`);
  });

  // Write findings
  const report = {
    timestamp: new Date().toISOString(),
    totalKindergartens: all.length,
    findings,
    summary: {
      dataMismatches: findings.filter(f => f.type === 'DATA_MISMATCH').length,
      notFoundInReal: findings.filter(f => f.type === 'NOT_FOUND_IN_REAL').length,
      missingFromDB: findings.filter(f => f.type === 'MISSING_FROM_DB').length,
      fabricatedAddresses: findings.filter(f => f.type === 'LIKELY_FABRICATED_ADDRESS').length,
      vagueAddresses: vagueCount,
    },
  };

  fs.writeFileSync('scripts/kindergarten-verification.json', JSON.stringify(report, null, 2));
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(report.summary, null, 2));

  await prisma.$disconnect();
}

verify().catch(e => { console.error(e); process.exit(1); });
