const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const backupDir = path.join(__dirname, 'backup');

async function backup() {
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const tables = [
    { name: 'kindergartens', query: () => prisma.kindergarten.findMany() },
    { name: 'aukles', query: () => prisma.aukle.findMany() },
    { name: 'bureliai', query: () => prisma.burelis.findMany() },
    { name: 'specialists', query: () => prisma.specialist.findMany() },
    { name: 'reviews', query: () => prisma.review.findMany() },
    { name: 'users', query: () => prisma.user.findMany() },
    { name: 'favorites', query: () => prisma.favorite.findMany() },
    { name: 'forum-categories', query: () => prisma.forumCategory.findMany() },
    { name: 'forum-posts', query: () => prisma.forumPost.findMany() },
    { name: 'forum-comments', query: () => prisma.forumComment.findMany() },
    { name: 'forum-votes', query: () => prisma.forumVote.findMany() },
  ];

  for (const table of tables) {
    console.log(`Backing up ${table.name}...`);
    const data = await table.query();
    const filePath = path.join(backupDir, `${table.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`  -> ${data.length} records saved to ${filePath}`);
  }

  console.log('\nBackup complete!');
  await prisma.$disconnect();
}

backup().catch(e => { console.error(e); process.exit(1); });
