const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Common English filler patterns
const ENGLISH_PATTERNS = [
  /lorem ipsum/i,
  /\bthe\b.*\band\b.*\bfor\b/i,
  /\bThis is a\b/i,
  /\bWe offer\b/i,
  /\bOur (services|programs|team|staff|facility)\b/i,
  /\bWelcome to\b/i,
  /\bProviding quality\b/i,
  /\bProfessional (care|services|childcare)\b/i,
  /\bExperienced (staff|team|teachers)\b/i,
  /\bA great place\b/i,
  /\bLocated in\b/i,
  /\bWe provide\b/i,
  /\bChildren (will|can|learn)\b/i,
  /\bHigh quality\b/i,
  /\bSafe (and|environment)\b/i,
  /\bNurturing environment\b/i,
  /\bDedicated to\b/i,
  /\bState of the art\b/i,
  /\bComprehensive (program|curriculum)\b/i,
  /\bIndividual(ized)? approach\b/i,
];

// Lithuanian character check - real Lithuanian text should have these
const LT_CHARS = /[ąčęėįšųūž]/i;

function isLikelyEnglish(text) {
  if (!text || text.length < 10) return false;
  for (const pattern of ENGLISH_PATTERNS) {
    if (pattern.test(text)) return { match: true, pattern: pattern.source };
  }
  return false;
}

function hasNoLithuanianChars(text) {
  if (!text || text.length < 20) return false;
  return !LT_CHARS.test(text);
}

async function main() {
  const types = [
    { name: 'kindergarten', model: 'kindergarten' },
    { name: 'aukle', model: 'aukle' },
    { name: 'burelis', model: 'burelis' },
    { name: 'specialist', model: 'specialist' },
  ];

  for (const t of types) {
    const entities = await prisma[t.model].findMany({
      select: { id: true, name: true, description: true, city: true }
    });

    const withDesc = entities.filter(e => e.description && e.description.trim().length > 0);
    const englishFiller = [];
    const noLtChars = [];

    for (const e of withDesc) {
      const engCheck = isLikelyEnglish(e.description);
      if (engCheck && engCheck.match) {
        englishFiller.push({ ...e, pattern: engCheck.pattern });
      }
      if (hasNoLithuanianChars(e.description)) {
        noLtChars.push(e);
      }
    }

    console.log(`\n=== ${t.name.toUpperCase()} ===`);
    console.log(`Total: ${entities.length}, With description: ${withDesc.length}`);
    console.log(`English filler detected: ${englishFiller.length}`);
    englishFiller.slice(0, 5).forEach(e => {
      console.log(`  "${e.name}" (${e.city}): "${e.description.substring(0, 80)}..." [pattern: ${e.pattern}]`);
    });
    console.log(`No Lithuanian chars (suspicious): ${noLtChars.length}`);
    noLtChars.slice(0, 5).forEach(e => {
      console.log(`  "${e.name}" (${e.city}): "${e.description.substring(0, 80)}..."`);
    });
  }

  // Also check review texts
  const reviews = await prisma.review.findMany({ select: { id: true, authorName: true, text: true } });
  console.log(`\n=== REVIEWS ===`);
  console.log(`Total: ${reviews.length}`);
  for (const r of reviews) {
    const engCheck = isLikelyEnglish(r.text);
    if (engCheck && engCheck.match) {
      console.log(`  English review by "${r.authorName}": "${r.text.substring(0, 80)}"`);
    }
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
