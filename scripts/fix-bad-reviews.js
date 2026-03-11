const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Delete test/malicious reviews
  const badIds = [
    'cmmm03w480000q92sti8mhrxx',
    'cmmm07hu90001q92s8mwlkp9o',
    'cmmm07i3k0002q92s3ukosxfg',
    'cmmm07i630003q92syevtzen9',
    'cmmm07iqh0004q92stx9chky6',
    'cmmm07it70005q92smvxoo6hh',
    'cmmm088ai0006q92s2c41dbuz',
    'cmmm088lp0007q92s2tdrvkag',
    'cmmm088oe0008q92s61hqb9s0',
    'cmmm088up0009q92sta5y2f4v',
    'cmmm088xc000aq92sa7hrzxya',
  ];

  const result = await p.review.deleteMany({
    where: { id: { in: badIds } }
  });
  console.log(`Deleted ${result.count} test/malicious reviews`);

  const remaining = await p.review.count();
  console.log(`Remaining reviews: ${remaining}`);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
