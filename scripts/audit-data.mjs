import { PrismaClient } from '@prisma/client';

const PROD_URL = "postgresql://neondb_owner:npg_UaNhwd2X0rek@ep-silent-term-altdxpx8.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const prisma = new PrismaClient({ datasources: { db: { url: PROD_URL } } });

const mode = process.argv[2]; // audit | delete

async function run() {
  const toDelete = { aukle: [], burelis: [], specialist: [] };

  // Auklės — no phone AND no email = delete
  const aukles = await prisma.aukle.findMany();
  for (const a of aukles) {
    const hasPhone = a.phone && a.phone.trim().length > 3;
    const hasEmail = a.email && a.email.includes('@');
    if (!hasPhone && !hasEmail) toDelete.aukle.push(a);
  }

  // Bureliai — no phone AND no website = delete
  const bureliai = await prisma.burelis.findMany();
  for (const b of bureliai) {
    const hasPhone = b.phone && b.phone.trim().length > 3;
    const hasWeb = b.website && b.website.includes('.');
    if (!hasPhone && !hasWeb) toDelete.burelis.push(b);
  }

  // Specialistai — no phone AND no website = delete  
  const specialists = await prisma.specialist.findMany();
  for (const s of specialists) {
    const hasPhone = s.phone && s.phone.trim().length > 3;
    const hasWeb = s.website && s.website.includes('.');
    if (!hasPhone && !hasWeb) toDelete.specialist.push(s);
  }

  console.log(`\n📊 PRODUCTION DATA AUDIT`);
  console.log(`========================`);
  console.log(`Auklės:      ${aukles.length} total, ${toDelete.aukle.length} be kontaktų`);
  console.log(`Bureliai:    ${bureliai.length} total, ${toDelete.burelis.length} be kontaktų`);
  console.log(`Specialistai: ${specialists.length} total, ${toDelete.specialist.length} be kontaktų`);
  console.log(`\nIš viso trinti: ${toDelete.aukle.length + toDelete.burelis.length + toDelete.specialist.length}\n`);

  for (const [type, items] of Object.entries(toDelete)) {
    if (items.length > 0) {
      console.log(`--- ${type.toUpperCase()} (trinti: ${items.length}) ---`);
      for (const item of items) {
        console.log(`  ❌ ${item.name} (${item.city}) | tel:${item.phone||'–'} email:${item.email||'–'} web:${item.website||'–'}`);
      }
      console.log('');
    }
  }

  if (mode === 'delete') {
    console.log('\n🗑️  DELETING...\n');
    
    for (const a of toDelete.aukle) {
      await prisma.aukle.delete({ where: { id: a.id } }).catch(e => console.log(`  ⚠️ Aukle ${a.name}: ${e.message.slice(0,80)}`));
      console.log(`  ✅ Aukle deleted: ${a.name}`);
    }
    for (const b of toDelete.burelis) {
      await prisma.burelis.delete({ where: { id: b.id } }).catch(e => console.log(`  ⚠️ Burelis ${b.name}: ${e.message.slice(0,80)}`));
      console.log(`  ✅ Burelis deleted: ${b.name}`);
    }
    for (const s of toDelete.specialist) {
      await prisma.specialist.delete({ where: { id: s.id } }).catch(e => console.log(`  ⚠️ Specialist ${s.name}: ${e.message.slice(0,80)}`));
      console.log(`  ✅ Specialist deleted: ${s.name}`);
    }
    
    console.log('\n✅ Production cleanup done!');
  } else {
    console.log('ℹ️  Dry run. Run with "delete" to execute: node scripts/audit-data.mjs delete');
  }

  await prisma.$disconnect();
}

run().catch(console.error);
