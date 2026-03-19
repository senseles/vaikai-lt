/**
 * Seed 30 days of realistic monitoring history.
 * Run: npx tsx scripts/seed-metrics-history.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.round(rand(min, max));
}

async function main() {
  // Clear existing snapshots
  const deleted = await prisma.metricSnapshot.deleteMany();
  console.log(`Ištrinta senų snapshot'ų: ${deleted.count}`);

  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 3600_000;
  const startTime = now - THIRTY_DAYS;

  // Get current DB counts for baseline
  const [kg, rev, usr] = await Promise.all([
    prisma.kindergarten.count(),
    prisma.review.count(),
    prisma.user.count(),
  ]);

  const snapshots = [];
  let totalHours = 0;

  for (let t = startTime; t < now; t += 3600_000) {
    const date = new Date(t);
    const hour = date.getHours();
    const isDay = hour >= 8 && hour <= 22;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dayFactor = isWeekend ? 0.6 : 1.0;

    // Requests: more during day, less at night
    const requestCount = isDay
      ? randInt(50 * dayFactor, 500 * dayFactor)
      : randInt(5, 30);

    // CPU: correlates with requests
    const baseCpu = isDay ? rand(8, 35) : rand(1, 8);
    const cpuSpike = Math.random() < 0.05 ? rand(15, 30) : 0; // 5% chance of spike
    const cpuUsage = Math.round(Math.min(baseCpu + cpuSpike, 95) * 10) / 10;

    // Memory: relatively constant
    const memoryPercent = Math.round(rand(55, 70) * 10) / 10;

    // Load average
    const loadAvg = Math.round(rand(0.1, cpuUsage / 20) * 100) / 100;

    // Response time: 30-150ms normally, occasional spikes
    const baseResponse = isDay ? rand(40, 120) : rand(20, 60);
    const responseSpike = Math.random() < 0.03 ? rand(100, 400) : 0;
    const avgResponseTime = Math.round(baseResponse + responseSpike);

    // Errors: mostly low, occasional spikes
    const hasErrorSpike = Math.random() < 0.04; // 4% chance
    const errorRate = hasErrorSpike
      ? Math.round(rand(5, 12) * 10) / 10
      : Math.round(rand(0, 2.5) * 10) / 10;
    const errorCount = Math.round(requestCount * errorRate / 100);

    // Status codes
    const ok = requestCount - errorCount;
    const notFound = randInt(0, Math.max(1, Math.floor(errorCount * 0.6)));
    const serverError = errorCount - notFound;
    const statusCodes: Record<string, number> = { '200': Math.max(0, ok) };
    if (notFound > 0) statusCodes['404'] = notFound;
    if (serverError > 0) statusCodes['500'] = Math.max(0, serverError);
    if (Math.random() < 0.3) statusCodes['301'] = randInt(1, 20);

    // Top endpoints
    const topEndpoints = [
      { path: '/', count: randInt(50, 200), avgTime: randInt(30, 80) },
      { path: '/vilnius', count: randInt(20, 100), avgTime: randInt(40, 100) },
      { path: '/kaunas', count: randInt(15, 80), avgTime: randInt(35, 90) },
      { path: '/api/reviews', count: randInt(5, 40), avgTime: randInt(50, 150) },
      { path: '/paieska', count: randInt(10, 50), avgTime: randInt(60, 120) },
    ].filter(() => Math.random() > 0.2);

    // DB counts grow slightly over time
    const dayIndex = Math.floor((t - startTime) / (24 * 3600_000));
    const reviewGrowth = dayIndex * randInt(2, 8);
    const userGrowth = dayIndex * randInt(0, 2);

    snapshots.push({
      timestamp: date,
      cpuUsage,
      memoryPercent,
      loadAvg,
      requestCount,
      avgResponseTime,
      errorRate,
      errorCount,
      statusCodes,
      topEndpoints,
      totalKindergartens: kg,
      totalReviews: Math.max(0, rev - 30 * 5 + reviewGrowth),
      totalUsers: Math.max(0, usr - 30 + userGrowth),
    });

    totalHours++;
  }

  // Batch insert (100 at a time for Prisma)
  const BATCH = 100;
  for (let i = 0; i < snapshots.length; i += BATCH) {
    const batch = snapshots.slice(i, i + BATCH);
    await prisma.metricSnapshot.createMany({ data: batch });
    process.stdout.write(`\rĮrašyta: ${Math.min(i + BATCH, snapshots.length)} / ${snapshots.length}`);
  }

  console.log(`\nSukurta ${totalHours} valandinių snapshot'ų (30 dienų)`);
}

main()
  .catch((e) => {
    console.error('Klaida:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
