import { NextRequest, NextResponse } from 'next/server';
import { getMarketDataHealth } from '@/lib/market-data/health';

export async function GET(req: NextRequest) {
  const expectedToken = process.env.ADMIN_TOKEN;
  const authorization = req.headers.get('authorization');

  if (!expectedToken || authorization !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const health = await getMarketDataHealth();
    return NextResponse.json(health, { status: health.ok ? 200 : 503 });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Market-data health check failed',
    }, { status: 503 });
  }
}
