import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalPrices } from '@/lib/market-data/historical-prices';

export const dynamic = 'force-dynamic';

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
  return date;
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const ticker = params.get('ticker') ?? '';
    const from = parseDate(params.get('from'));
    const to = parseDate(params.get('to'));
    const limitValue = params.get('limit');
    const limit = limitValue === null ? undefined : Number(limitValue);

    const data = await getHistoricalPrices({ ticker, from, to, limit });
    return NextResponse.json({
      data,
      meta: {
        ticker: ticker.trim().toUpperCase(),
        count: data.length,
        from: from?.toISOString() ?? null,
        to: to?.toISOString() ?? null,
        source: 'database',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Historical prices request failed';
    const status = /not found/i.test(message) ? 404 : /invalid|limit|range/i.test(message) ? 400 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}
