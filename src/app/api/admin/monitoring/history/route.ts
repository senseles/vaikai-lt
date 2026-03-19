import { NextRequest, NextResponse } from 'next/server';
import { getHistory } from '@/lib/metrics-snapshot';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_PERIODS = ['24h', '7d', '30d', '90d'] as const;
type Period = (typeof VALID_PERIODS)[number];

export async function GET(req: NextRequest) {
  try {
    const period = (req.nextUrl.searchParams.get('period') || '7d') as Period;
    if (!VALID_PERIODS.includes(period)) {
      return NextResponse.json({ error: 'Netinkamas periodas' }, { status: 400 });
    }

    const data = await getHistory(period);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err) {
    console.error('Monitoring history API error:', err);
    return NextResponse.json(
      { error: 'Nepavyko gauti istorijos duomenų' },
      { status: 500 },
    );
  }
}
