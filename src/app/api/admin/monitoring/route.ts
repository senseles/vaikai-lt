import { NextResponse } from 'next/server';
import os from 'os';
import prisma from '@/lib/prisma';
import { getMetrics, getRecentRequests } from '@/lib/request-tracker';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // System metrics
    const cpus = os.cpus();
    const cpuUsage = cpus.length > 0
      ? Math.round(cpus.reduce((acc, cpu) => {
          const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
          const idle = cpu.times.idle;
          return acc + ((total - idle) / total) * 100;
        }, 0) / cpus.length * 10) / 10
      : 0;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryInfo = process.memoryUsage();

    const system = {
      cpuUsage,
      memoryUsed: Math.round(usedMem / 1024 / 1024),
      memoryTotal: Math.round(totalMem / 1024 / 1024),
      memoryPercent: Math.round((usedMem / totalMem) * 1000) / 10,
      heapUsed: Math.round(memoryInfo.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryInfo.heapTotal / 1024 / 1024),
      uptime: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      loadAvg: os.loadavg().map((v) => Math.round(v * 100) / 100),
    };

    // Request metrics from in-memory tracker
    const requests = getMetrics();

    // Database counts — all in parallel
    const [
      kindergartens,
      aukles,
      bureliai,
      specialists,
      reviews,
      users,
      submissions,
      forumPosts,
    ] = await Promise.all([
      prisma.kindergarten.count(),
      prisma.aukle.count(),
      prisma.burelis.count(),
      prisma.specialist.count(),
      prisma.review.count(),
      prisma.user.count(),
      prisma.submission.count(),
      prisma.forumPost.count(),
    ]);

    const database = { kindergartens, aukles, bureliai, specialists, reviews, users, submissions, forumPosts };

    // Recent requests
    const recentRequests = getRecentRequests(50).map((r) => ({
      time: new Date(r.timestamp).toISOString(),
      method: r.method,
      path: r.path,
      status: r.status,
      ms: r.responseTime,
    }));

    return NextResponse.json(
      { system, requests, database, recentRequests },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (err) {
    console.error('Monitoring API error:', err);
    return NextResponse.json(
      { error: 'Nepavyko gauti monitoringo duomenų' },
      { status: 500 },
    );
  }
}
