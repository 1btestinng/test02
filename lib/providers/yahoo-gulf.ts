import type { MarketCompany, MarketDataProvider, MarketSummary } from '@/lib/markets/types';
import type { GulfCode } from '@/lib/markets/gulf';

type Seed = [string, string, string, number, string?];

type YahooQuote = {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  regularMarketChangePercent?: number;
  regularMarketTime?: number;
  marketCap?: number;
  sharesOutstanding?: number;
  currency?: string;
};

type YahooQuoteResponse = {
  quoteResponse?: {
    result?: YahooQuote[];
  };
};

type YahooChartQuote = {
  close?: Array<number | null>;
};

type YahooChartIndicators = {
  quote?: YahooChartQuote[];
};

type YahooChartMeta = {
  regularMarketPrice?: number;
  previousClose?: number;
  regularMarketTime?: number;
  currency?: string;
};

type YahooChartResult = {
  meta?: YahooChartMeta;
  indicators?: YahooChartIndicators;
};

type YahooChartResponse = {
  chart?: {
    result?: YahooChartResult[];
  };
};

const SUFFIX: { [K in GulfCode]?: string } = {
  SA: '.SR',
  KW: '.KW',
  QA: '.QA',
  BH: '.BH',
  OM: '.OM',
};

const UAE_SUFFIX = {
  ADX: '.AB',
  DFM: '.AE',
} as const;

function providerSymbol(code: GulfCode, ticker: string, exchangeCode: string): string {
  if (code === 'AE') {
    return `${ticker}${exchangeCode === 'ADX' ? UAE_SUFFIX.ADX : UAE_SUFFIX.DFM}`;
  }

  const suffix = SUFFIX[code];
  return `${ticker}${suffix ?? ''}`;
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

async function fetchQuotes(symbols: string[]): Promise<Map<string, YahooQuote>> {
  const result = new Map<string, YahooQuote>();
  if (symbols.length === 0) return result;

  const url =
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}` +
    '&fields=symbol,regularMarketPrice,regularMarketPreviousClose,regularMarketChangePercent,regularMarketTime,marketCap,sharesOutstanding,currency';

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 iStocks/1.0' },
      next: { revalidate: 60 },
    });

    if (!response.ok) return result;

    const payload = (await response.json()) as YahooQuoteResponse;
    for (const quote of payload.quoteResponse?.result ?? []) {
      if (quote.symbol) result.set(quote.symbol, quote);
    }
  } catch {
    // Chart endpoint below is the price fallback when quote is unavailable.
  }

  return result;
}

async function fetchChartQuote(symbol: string): Promise<YahooQuote | undefined> {
  try {
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
      '?interval=1d&range=5d';

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 iStocks/1.0' },
      next: { revalidate: 60 },
    });

    if (!response.ok) return undefined;

    const payload = (await response.json()) as YahooChartResponse;
    const result = payload.chart?.result?.[0];
    if (!result) return undefined;

    const closes = (result.indicators?.quote?.[0]?.close ?? []).filter(finite);
    const price = finite(result.meta?.regularMarketPrice)
      ? result.meta.regularMarketPrice
      : closes.length > 0
        ? closes[closes.length - 1]
        : undefined;

    const previousClose = finite(result.meta?.previousClose)
      ? result.meta.previousClose
      : closes.length > 1
        ? closes[closes.length - 2]
        : undefined;

    if (!finite(price)) return undefined;

    const changePercent =
      finite(previousClose) && previousClose !== 0
        ? ((price - previousClose) / previousClose) * 100
        : undefined;

    return {
      symbol,
      regularMarketPrice: price,
      regularMarketPreviousClose: previousClose,
      regularMarketChangePercent: changePercent,
      regularMarketTime: result.meta?.regularMarketTime,
      currency: result.meta?.currency,
    };
  } catch {
    return undefined;
  }
}

export async function getLiveGulfCompanies(
  code: GulfCode,
  seeds: Seed[],
  currency: string,
  localPerUsd: number,
): Promise<MarketCompany[]> {
  const mappings = seeds.map(([name, ticker, sector, _snapshot, exchangeCode]) => ({
    name,
    ticker,
    sector,
    exchangeCode: exchangeCode ?? code,
    providerSymbol: providerSymbol(code, ticker, exchangeCode ?? code),
  }));

  const quotes = await fetchQuotes(mappings.map((item) => item.providerSymbol));
  const missing = mappings.filter((item) => !quotes.has(item.providerSymbol));

  if (missing.length > 0) {
    const fallback = await Promise.all(
      missing.map(async (item) => {
        return [item.providerSymbol, await fetchChartQuote(item.providerSymbol)] as const;
      }),
    );

    for (const [symbol, quote] of fallback) {
      if (quote) quotes.set(symbol, quote);
    }
  }

  const now = new Date().toISOString();

  return mappings.map((item) => {
    const quote = quotes.get(item.providerSymbol);
    const price = finite(quote?.regularMarketPrice)
      ? quote.regularMarketPrice
      : undefined;
    const previousClose = finite(quote?.regularMarketPreviousClose)
      ? quote.regularMarketPreviousClose
      : undefined;

    const changePercent = finite(quote?.regularMarketChangePercent)
      ? quote.regularMarketChangePercent
      : finite(price) && finite(previousClose) && previousClose !== 0
        ? ((price - previousClose) / previousClose) * 100
        : undefined;

    const marketCapLocal = finite(quote?.marketCap)
      ? quote.marketCap
      : finite(quote?.sharesOutstanding) && finite(price)
        ? quote.sharesOutstanding * price
        : undefined;

    const marketCapUSD = finite(marketCapLocal)
      ? marketCapLocal / localPerUsd
      : undefined;

    return {
      id: `${code}-${item.exchangeCode}-${item.ticker}`,
      countryCode: code,
      exchangeCode: item.exchangeCode,
      ticker: item.ticker,
      name: item.name,
      sector: item.sector,
      industry: item.sector,
      currency,
      price,
      previousClose,
      changePercent,
      sharesOutstanding: finite(quote?.sharesOutstanding)
        ? quote.sharesOutstanding
        : undefined,
      marketCapLocal,
      marketCapUSD,
      marketCapSource: finite(quote?.marketCap) ? 'provider' : 'calculated',
      timestamp: finite(quote?.regularMarketTime)
        ? new Date(quote.regularMarketTime * 1000).toISOString()
        : now,
      dataSource: 'Yahoo Finance delayed market data',
    } satisfies MarketCompany;
  });
}

export function createYahooGulfProvider(
  code: GulfCode,
  seeds: Seed[],
  config: {
    currencyCode: string;
    timezone: string;
    dataSource: string;
    delay: string;
  },
  localPerUsd: number,
): MarketDataProvider {
  const load = (): Promise<MarketCompany[]> =>
    getLiveGulfCompanies(code, seeds, config.currencyCode, localPerUsd);

  return {
    async getCompanies() {
      return load();
    },
    async getCompany(ticker) {
      const companies = await load();
      return companies.find(
        (company) => company.ticker.toUpperCase() === ticker.toUpperCase(),
      );
    },
    async getMarketSummary() {
      const rows = await load();
      const lastUpdated = rows.reduce(
        (latest, row) =>
          row.timestamp && row.timestamp > latest ? row.timestamp : latest,
        '',
      );

      return {
        count: rows.length,
        totalLocal: rows.reduce(
          (sum, row) => sum + (row.marketCapLocal ?? 0),
          0,
        ),
        totalUSD: rows.reduce(
          (sum, row) => sum + (row.marketCapUSD ?? 0),
          0,
        ),
        industries: new Set(rows.map((row) => row.sector).filter(Boolean)).size,
        fxRate: localPerUsd,
        fxSource: `${config.currencyCode}/USD reference rate`,
        lastUpdated: lastUpdated || new Date().toISOString(),
        dataSource: config.dataSource,
        delay: config.delay,
      } satisfies MarketSummary;
    },
    async getFX() {
      return localPerUsd;
    },
    async getMarketStatus() {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: config.timezone,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date());

      const weekday = parts.find((part) => part.type === 'weekday')?.value;
      const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
      const minute = Number(
        parts.find((part) => part.type === 'minute')?.value ?? 0,
      );
      const minutes = hour * 60 + minute;
      const weekend = weekday === 'Fri' || weekday === 'Sat';

      return weekend || minutes < 600 || minutes >= 900 ? 'closed' : 'open';
    },
  };
}
