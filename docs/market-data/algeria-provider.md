# Algeria production market-data provider

## Source policy

The production boundary is designed for an authorized SGBV (Bourse d'Alger) feed or a licensed redistributor. The repository does **not** hard-code a vendor endpoint or claim that an unlicensed public endpoint is a production feed.

SGBV publishes official Algerian market quotations and historical trading bulletins. The application keeps the upstream connection server-side and requires an explicitly configured provider before it can enter live HTTP mode.

## Configuration

```env
DZ_MARKET_DATA_URL=""
DZ_MARKET_DATA_API_KEY=""
```

- `DZ_MARKET_DATA_URL` is the HTTPS endpoint supplied by the authorized data provider.
- `DZ_MARKET_DATA_API_KEY` is optional and is sent as a Bearer token when present.
- Never expose either value through `NEXT_PUBLIC_*` variables.

## Expected provider contract

```json
{
  "observations": [
    {
      "ticker": "CPA",
      "price": 2049,
      "previousClose": 2039,
      "changePercent": 0.49,
      "volume": 1000,
      "timestamp": "2026-09-10T15:00:00Z",
      "source": "authorized-provider",
      "currency": "DZD",
      "countryCode": "DZ"
    }
  ],
  "fx": {
    "baseCurrency": "USD",
    "quoteCurrency": "DZD",
    "rate": 132.975,
    "timestamp": "2026-09-10T15:00:00Z",
    "source": "authorized-fx-provider"
  },
  "marketStatus": "closed"
}
```

The configured provider must return the complete configured Algeria universe. Missing or unknown tickers fail closed rather than silently producing a partial market.

## Validation and safety

The provider validates:

- positive finite prices;
- valid previous closes, changes and volumes when supplied;
- valid, non-future timestamps;
- non-empty source and market metadata;
- duplicate and unknown tickers;
- missing configured tickers;
- positive FX;
- the exact USD/DZD FX pair.

Market caps are calculated from the canonical Algeria share-count registry and the provider price. USD market cap is calculated as DZD market cap divided by the validated USD/DZD rate.

If no authorized endpoint is configured, the canonical API continues to use the existing explicitly labeled snapshot data. It does not silently pretend that snapshot data is live.
