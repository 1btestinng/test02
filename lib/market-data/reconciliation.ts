export type ReconciliationObservation = {
  ticker: string;
  price: number;
  timestamp: string;
  source: string;
};

export type ReconciliationResult = {
  ticker: string;
  status: 'agreed' | 'disagreed' | 'missing-secondary' | 'invalid';
  primary: ReconciliationObservation;
  secondary?: ReconciliationObservation;
  relativeDifference?: number;
  reason?: string;
};

export type ReconciliationSummary = {
  ok: boolean;
  compared: number;
  agreed: number;
  disagreed: number;
  missingSecondary: number;
  invalid: number;
  results: ReconciliationResult[];
};

export type ReconciliationOptions = {
  priceTolerancePercent?: number;
  maxTimestampSkewMs?: number;
};

const DEFAULT_PRICE_TOLERANCE_PERCENT = 0.5;
const DEFAULT_MAX_TIMESTAMP_SKEW_MS = 15 * 60 * 1000;

function relativeDifferencePercent(a: number, b: number) {
  const denominator = Math.max(Math.abs(a), Math.abs(b));
  return denominator === 0 ? Number.POSITIVE_INFINITY : Math.abs(a - b) / denominator * 100;
}

function validObservation(observation: ReconciliationObservation) {
  return observation.ticker.trim().length > 0 &&
    Number.isFinite(observation.price) && observation.price > 0 &&
    Number.isFinite(Date.parse(observation.timestamp)) &&
    observation.source.trim().length > 0;
}

/**
 * Compares a primary feed against a secondary feed without inventing a value.
 * A disagreement is returned as a hard reconciliation failure so callers can
 * fail closed instead of silently publishing an unverified quote.
 */
export function reconcileMarketObservations(
  primary: ReconciliationObservation[],
  secondary: ReconciliationObservation[],
  options: ReconciliationOptions = {},
): ReconciliationSummary {
  const tolerance = options.priceTolerancePercent ?? DEFAULT_PRICE_TOLERANCE_PERCENT;
  const maxSkew = options.maxTimestampSkewMs ?? DEFAULT_MAX_TIMESTAMP_SKEW_MS;
  const secondaryByTicker = new Map(secondary.map((observation) => [observation.ticker.toUpperCase(), observation]));
  const results: ReconciliationResult[] = [];

  for (const primaryObservation of primary) {
    const ticker = primaryObservation.ticker.toUpperCase();
    if (!validObservation(primaryObservation)) {
      results.push({ ticker, status: 'invalid', primary: primaryObservation, reason: 'Primary observation is invalid.' });
      continue;
    }

    const secondaryObservation = secondaryByTicker.get(ticker);
    if (!secondaryObservation) {
      results.push({ ticker, status: 'missing-secondary', primary: primaryObservation, reason: 'Secondary provider has no observation for this ticker.' });
      continue;
    }

    if (!validObservation(secondaryObservation)) {
      results.push({ ticker, status: 'invalid', primary: primaryObservation, secondary: secondaryObservation, reason: 'Secondary observation is invalid.' });
      continue;
    }

    const skew = Math.abs(Date.parse(primaryObservation.timestamp) - Date.parse(secondaryObservation.timestamp));
    if (skew > maxSkew) {
      results.push({ ticker, status: 'disagreed', primary: primaryObservation, secondary: secondaryObservation, reason: `Observation timestamps differ by more than ${maxSkew}ms.` });
      continue;
    }

    const relativeDifference = relativeDifferencePercent(primaryObservation.price, secondaryObservation.price);
    results.push({
      ticker,
      status: relativeDifference <= tolerance ? 'agreed' : 'disagreed',
      primary: primaryObservation,
      secondary: secondaryObservation,
      relativeDifference,
      reason: relativeDifference <= tolerance ? undefined : `Price difference ${relativeDifference.toFixed(4)}% exceeds ${tolerance}% tolerance.`,
    });
  }

  const agreed = results.filter((result) => result.status === 'agreed').length;
  const disagreed = results.filter((result) => result.status === 'disagreed').length;
  const missingSecondary = results.filter((result) => result.status === 'missing-secondary').length;
  const invalid = results.filter((result) => result.status === 'invalid').length;

  return {
    ok: disagreed === 0 && invalid === 0 && missingSecondary === 0,
    compared: results.length,
    agreed,
    disagreed,
    missingSecondary,
    invalid,
    results,
  };
}
