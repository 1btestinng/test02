# Historical market prices

The canonical historical-price service reads persisted `MarketQuote` observations from PostgreSQL. It does not fabricate history and does not fall back to snapshot data.

## API

`GET /api/v1/market/history?ticker=...`

Optional query parameters:

- `from` — ISO date/time lower bound, inclusive.
- `to` — ISO date/time upper bound, inclusive.
- `limit` — positive integer; defaults to 365 and is capped at 5,000.

The response includes timestamp, price, previous close, percentage change, volume, source, and query metadata.

If the company does not exist, the endpoint returns `404`. Invalid dates, limits, or ranges return `400`. Database/provider failures return `503`.

## Data policy

Only persisted `MarketQuote` observations are returned. The historical layer therefore reflects the configured ingestion pipeline and its source metadata. A missing historical observation remains missing rather than being synthesized.
