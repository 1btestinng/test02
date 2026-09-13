import type { FXObservation, MarketObservation, MarketStatus } from './pipeline';
import { validateFXObservation, validateMarketObservations } from './pipeline';
import type { MarketCompany } from '@/lib/markets/types';
import { algeriaCompanies, ALGERIA_FX_USD_DZD } from '@/lib/markets/algeria';

type ProviderPayload = {
  observations: MarketObservation[];
  fx: FXObservation;
  marketStatus?: MarketStatus;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

/**
 * Server-side boundary for an authorized SGBV feed or licensed redistributor.
 * No vendor-specific endpoint is hard-coded into the application.
 */
export class ConfiguredAlgeriaHttpProvider {
  readonly mode = 'live-http' as const;
  private readonly url = process.env.DZ_MARKET_DATA_URL;
  private readonly apiKey = process.env.DZ_MARKET_DATA_API_KEY;

  isConfigured() {
    return Boolean(this.url);
  }

  async fetch(): Promise<ProviderPayload> {
    if (!this.url) throw new Error('DZ_MARKET_DATA_URL is not configured.');

    const headers: Record<string, string> = { accept: 'application/json' };
    if (this.apiKey) headers.authorization = `Bearer ${this.apiKey}`;

    const response = await fetch(this.url, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Algeria market-data provider returned HTTP ${response.status}.`);

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.observations) || !isRecord(payload.fx)) {
      throw new Error('Algeria market-data provider returned an unsupported response shape.');
    }

    const observations: MarketObservation[] = payload.observations.map((item) => {
      if (!isRecord(item)) {
        return {
          ticker: '', price: Number.NaN, timestamp: '', source: '', currency: 'DZD', countryCode: 'DZ',
        };
      }
      return {
        ticker: asString(item.ticker) ?? '',
        price: asNumber(item.price) ?? Number.NaN,
        previousClose: asNumber(item.previousClose),
        changePercent: asNumber(item.changePercent),
        volume: asNumber(item.volume),
        timestamp: asString(item.timestamp) ?? '',
        source: asString(item.source) ?? 'configured-algeria-http-provider',
        currency: asString(item.currency) ?? 'DZD',
        countryCode: asString(item.countryCode) ?? 'DZ',
      };
    });

    const fx: FXObservation = {
      baseCurrency: asString(payload.fx.baseCurrency) ?? 'USD',
      quoteCurrency: asString(payload.fx.quoteCurrency) ?? 'DZD',
      rate: asNumber(payload.fx.rate) ?? Number.NaN,
      timestamp: asString(payload.fx.timestamp) ?? '',
      source: asString(payload.fx.source) ?? 'configured-algeria-http-provider',
    };

    const expectedTickers = algeriaCompanies.map((company) => company.ticker.toUpperCase());
    const observationValidation = validateMarketObservations(observations, expectedTickers);
    if (!observationValidation.ok) {
      throw new Error(`Algeria market-data validation failed: ${observationValidation.issues.map((issue) => issue.code).join(', ')}.`);
    }

    const fxIssues = validateFXObservation(fx);
    if (fxIssues.some((issue) => issue.severity === 'error')) {
      throw new Error(`Algeria FX validation failed: ${fxIssues.map((issue) => issue.code).join(', ')}.`);
    }
    if (fx.baseCurrency !== 'USD' || fx.quoteCurrency !== 'DZD') {
      throw new Error(`Algeria provider returned unsupported FX pair ${fx.baseCurrency}/${fx.quoteCurrency}.`);
    }

    const status = payload.marketStatus;
    const marketStatus: MarketStatus | undefined =
      status === 'open' || status === 'closed' || status === 'auction' ? status : undefined;

    return { observations, fx, marketStatus };
  }

  async getCompanies(): Promise<MarketCompany[]> {
    const payload = await this.fetch();
    const byTicker = new Map(algeriaCompanies.map((company) => [company.ticker.toUpperCase(), company]));
    const fx = payload.fx.rate > 0 ? payload.fx.rate : ALGERIA_FX_USD_DZD;

    return payload.observations.map((observation) => {
      const reference = byTicker.get(observation.ticker.toUpperCase());
      if (!reference) throw new Error(`Unknown Algeria ticker from provider: ${observation.ticker}`);
      const shares = reference.sharesOutstanding ??
        (reference.marketCapLocal && reference.price && reference.price > 0
          ? reference.marketCapLocal / reference.price
          : undefined);
      const marketCapLocal = shares !== undefined ? observation.price * shares : undefined;
      return {
        ...reference,
        price: observation.price,
        previousClose: observation.previousClose,
        changePercent: observation.changePercent,
        volume: observation.volume,
        sharesOutstanding: shares,
        marketCapLocal,
        marketCapUSD: marketCapLocal !== undefined ? marketCapLocal / fx : undefined,
        marketCapSource: marketCapLocal !== undefined ? 'calculated' : undefined,
        timestamp: observation.timestamp,
        dataSource: observation.source,
      } satisfies MarketCompany;
    });
  }
}
