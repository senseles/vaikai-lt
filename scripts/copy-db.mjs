// Copy all data from prod DB to dev DB
import { PrismaClient } from '@prisma/client';

const PROD_URL = "postgresql://neondb_owner:npg_UaNhwd2X0rek@ep-silent-term-altdxpx8.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const DEV_URL = "postgresql://neondb_owner:npg_UaNhwd2X0rek@ep-silent-term-altdxpx8.c-3.eu-central-1.aws.neon.tech/neondb_dev?sslmode=require";

const prod = new PrismaClient({ datasources: { db: { url: PROD_URL } } });
const dev = new PrismaClient({ datasources: { db: { url: DEV_URL } } });

async function copyTable(name, findFn, createFn) {
  const rows = await findFn();
  let count = 0;
  for (const row of rows) {
    try {
      await createFn({ data: row });
      count++;
    } catch (e) {
      // skip duplicates
    }
  }
  console.log(`  ${name}: ${count}/${rows.length}`);
}

async function main() {
  console.log('Copying prod → dev...\n');

  // Order matters (foreign keys)
  const tables = [
    ['User', () => prod.user.findMany(), (d) => dev.user.create(d)],
    ['Account', () => prod.account.findMany(), (d) => dev.account.create(d)],
    ['Session', () => prod.session.findMany(), (d) => dev.session.create(d)],
    ['Kindergarten', () => prod.kindergarten.findMany(), (d) => dev.kindergarten.create(d)],
    ['Review', () => prod.review.findMany(), (d) => dev.review.create(d)],
    ['Aukle', () => prod.aukle.findMany(), (d) => dev.aukle.create(d)],
    ['Burelis', () => prod.burelis.findMany(), (d) => dev.burelis.create(d)],
    ['Specialist', () => prod.specialist.findMany(), (d) => dev.specialist.create(d)],
    ['ForumCategory', () => prod.forumCategory.findMany(), (d) => dev.forumCategory.create(d)],
    ['ForumPost', () => prod.forumPost.findMany(), (d) => dev.forumPost.create(d)],
    ['ForumComment', () => prod.forumComment.findMany(), (d) => dev.forumComment.create(d)],
    ['ForumVote', () => prod.forumVote.findMany(), (d) => dev.forumVote.create(d)],
    ['Favorite', () => prod.favorite.findMany(), (d) => dev.favorite.create(d)],
    ['Submission', () => prod.submission.findMany(), (d) => dev.submission.create(d)],
    ['AuditLog', () => prod.auditLog.findMany(), (d) => dev.auditLog.create(d)],
    ['Newsletter', () => prod.newsletter.findMany(), (d) => dev.newsletter.create(d)],
    ['Report', () => prod.report.findMany(), (d) => dev.report.create(d)],
    ['Notification', () => prod.notification.findMany(), (d) => dev.notification.create(d)],
    ['MetricSnapshot', () => prod.metricSnapshot.findMany(), (d) => dev.metricSnapshot.create(d)],
  ];

  for (const [name, findFn, createFn] of tables) {
    try {
      await copyTable(name, findFn, createFn);
    } catch (e) {
      console.log(`  ${name}: SKIP (${e.message?.slice(0, 60)})`);
    }
  }

  console.log('\n✅ Done!');
  await prod.$disconnect();
  await dev.$disconnect();
}

main().catch(console.error);
