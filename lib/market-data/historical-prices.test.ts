import { describe, expect, it } from 'vitest';
import { validateHistoricalRange } from './historical-prices';

describe('historical price range validation', () => {
  it('accepts a valid range', () => {
    expect(() => validateHistoricalRange(new Date('2026-01-01'), new Date('2026-02-01'))).not.toThrow();
  });

  it('rejects an inverted range', () => {
    expect(() => validateHistoricalRange(new Date('2026-02-01'), new Date('2026-01-01'))).toThrow(/range/i);
  });

  it('rejects invalid dates', () => {
    expect(() => validateHistoricalRange(new Date('invalid'))).toThrow(/date/i);
  });
});
