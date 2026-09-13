import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfiguredAlgeriaHttpProvider } from './algeria-provider';

const payload = {
  observations: [
    ...[
      ['CPA', 2049, 0.49], ['BDL', 1400, 0], ['BIO', 2516, 0], ['AYRD', 815, 0], ['ALL', 360, 4.35],
      ['SAI', 431, 0], ['AUR', 360, 0], ['AOM', 290, 0], ['MST', 779, 0], ['CREX', 1600, 0],
    ].map(([ticker, price, change]) => ({
      ticker, price, changePercent: change, previousClose: Number(price), volume: 100,
      timestamp: '2026-09-10T15:00:00Z', source: 'authorized-sgbv-provider', currency: 'DZD', countryCode: 'DZ',
    })),
  ],
  fx: { baseCurrency: 'USD', quoteCurrency: 'DZD', rate: 132.975, timestamp: '2026-09-10T15:00:00Z', source: 'authorized-fx-provider' },
  marketStatus: 'closed',
};

describe('ConfiguredAlgeriaHttpProvider', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('is disabled when no production endpoint is configured', () => {
    vi.stubEnv('DZ_MARKET_DATA_URL', '');
    expect(new ConfiguredAlgeriaHttpProvider().isConfigured()).toBe(false);
  });

  it('normalizes a complete authorized provider payload', async () => {
    vi.stubEnv('DZ_MARKET_DATA_URL', 'https://provider.example.test/algeria');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })));

    const rows = await new ConfiguredAlgeriaHttpProvider().getCompanies();
    expect(rows).toHaveLength(10);
    expect(rows[0].ticker).toBe('CPA');
    expect(rows[0].price).toBe(2049);
    expect(rows[0].marketCapLocal).toBeGreaterThan(0);
    expect(rows[0].marketCapUSD).toBeGreaterThan(0);
  });

  it('fails closed when the provider omits a listed security', async () => {
    vi.stubEnv('DZ_MARKET_DATA_URL', 'https://provider.example.test/algeria');
    const incompletePayload = { ...payload, observations: payload.observations.slice(1) };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(incompletePayload), { status: 200 })));

    await expect(new ConfiguredAlgeriaHttpProvider().getCompanies()).rejects.toThrow('MISSING_TICKER');
  });

  it('fails closed on an unknown provider ticker', async () => {
    vi.stubEnv('DZ_MARKET_DATA_URL', 'https://provider.example.test/algeria');
    const unknownPayload = { ...payload, observations: payload.observations.map((row, index) => index === 0 ? { ...row, ticker: 'UNKNOWN' } : row) };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(unknownPayload), { status: 200 })));

    await expect(new ConfiguredAlgeriaHttpProvider().getCompanies()).rejects.toThrow('UNKNOWN_TICKER');
  });

  it('rejects an invalid FX pair', async () => {
    vi.stubEnv('DZ_MARKET_DATA_URL', 'https://provider.example.test/algeria');
    const invalidFxPayload = { ...payload, fx: { ...payload.fx, quoteCurrency: 'EUR' } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(invalidFxPayload), { status: 200 })));

    await expect(new ConfiguredAlgeriaHttpProvider().fetch()).rejects.toThrow('unsupported FX pair');
  });

  it('rejects provider HTTP failures', async () => {
    vi.stubEnv('DZ_MARKET_DATA_URL', 'https://provider.example.test/algeria');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('upstream failure', { status: 503 })));

    await expect(new ConfiguredAlgeriaHttpProvider().fetch()).rejects.toThrow('HTTP 503');
  });
});
