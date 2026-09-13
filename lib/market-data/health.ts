import { marketCodes } from '@/lib/markets/registry';
import { getCanonicalMarketCompanies } from './canonical';
import { validateMarketDataInvariants } from './guardian';

export type MarketHealth = {
  market: string;
  ok: boolean;
  mode: 'database' | 'live-http' | 'snapshot';
  source: string;
  asOf: string;
  quoteCount: number;
  issueCount: number;
  issues: string[];
};

export async function getMarketDataHealth(): Promise<{ ok: boolean; generatedAt: string; markets: MarketHealth[] }> {
  const markets = await Promise.all(marketCodes().map(async (market): Promise<MarketHealth> => {
    try {
      const canonical = await getCanonicalMarketCompanies(market);
      const fxRates = canonical.data
        .map((row) => row.marketCapLocal !== undefined && row.marketCapUSD !== undefined && row.marketCapUSD > 0
          ? row.marketCapLocal / row.marketCapUSD
          : undefined)
        .filter((rate): rate is number => rate !== undefined);
      const fxRate = fxRates[0] ?? 0;
      const issues = validateMarketDataInvariants(
        canonical.data.map((row) => ({
          ticker: row.ticker,
          price: row.price ?? Number.NaN,
          marketCapLocal: row.marketCapLocal ?? Number.NaN,
          marketCapUSD: row.marketCapUSD ?? Number.NaN,
          timestamp: new Date(row.timestamp ?? canonical.meta.asOf),
        })),
        { rate: fxRate },
      );
      return {
        market,
        ok: issues.length === 0,
        mode: canonical.meta.mode,
        source: canonical.meta.source,
        asOf: canonical.meta.asOf,
        quoteCount: canonical.data.length,
        issueCount: issues.length,
        issues,
      };
    } catch (error) {
      return {
        market,
        ok: false,
        mode: 'snapshot',
        source: 'health-check-error',
        asOf: new Date().toISOString(),
        quoteCount: 0,
        issueCount: 1,
        issues: [error instanceof Error ? error.message : 'Unknown market-data health failure'],
      };
    }
  }));

  return {
    ok: markets.every((market) => market.ok),
    generatedAt: new Date().toISOString(),
    markets,
  };
}
