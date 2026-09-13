import { describe, expect, it } from 'vitest';
import { reconcileMarketObservations } from './reconciliation';

const primary = (price: number, timestamp = '2026-09-13T14:00:00Z') => ({ ticker: 'CPA', price, timestamp, source: 'primary' });
const secondary = (price: number, timestamp = '2026-09-13T14:00:00Z') => ({ ticker: 'CPA', price, timestamp, source: 'secondary' });

describe('reconcileMarketObservations', () => {
  it('accepts quotes within the configured tolerance', () => {
    const result = reconcileMarketObservations([primary(2049)], [secondary(2052)], { priceTolerancePercent: 0.5 });
    expect(result.ok).toBe(true);
    expect(result.agreed).toBe(1);
  });

  it('fails closed on material price disagreement', () => {
    const result = reconcileMarketObservations([primary(2049)], [secondary(2100)], { priceTolerancePercent: 0.5 });
    expect(result.ok).toBe(false);
    expect(result.disagreed).toBe(1);
    expect(result.results[0].status).toBe('disagreed');
  });

  it('fails closed when the secondary provider is missing a ticker', () => {
    const result = reconcileMarketObservations([primary(2049)], []);
    expect(result.ok).toBe(false);
    expect(result.missingSecondary).toBe(1);
  });

  it('fails closed when provider timestamps are too far apart', () => {
    const result = reconcileMarketObservations(
      [primary(2049, '2026-09-13T14:00:00Z')],
      [secondary(2049, '2026-09-13T14:20:01Z')],
      { maxTimestampSkewMs: 20 * 60 * 1000 },
    );
    expect(result.ok).toBe(true);
    expect(result.agreed).toBe(1);

    const strict = reconcileMarketObservations(
      [primary(2049, '2026-09-13T14:00:00Z')],
      [secondary(2049, '2026-09-13T14:20:01Z')],
      { maxTimestampSkewMs: 20 * 60 * 1000 - 1 },
    );
    expect(strict.ok).toBe(false);
    expect(strict.disagreed).toBe(1);
  });

  it('rejects invalid primary observations', () => {
    const result = reconcileMarketObservations(
      [{ ticker: 'CPA', price: 0, timestamp: '2026-09-13T14:00:00Z', source: 'primary' }],
      [secondary(2049)],
    );
    expect(result.ok).toBe(false);
    expect(result.invalid).toBe(1);
  });
});
