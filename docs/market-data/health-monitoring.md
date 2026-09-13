# Market-data health monitoring

`GET /api/admin/market-health` is an authenticated operational health endpoint for the canonical market-data layer.

## What it checks

For every registered market (EG, MA, TN, DZ), the health service loads the canonical quote set and runs the existing data guardian invariants:

- positive prices;
- non-negative local and USD market caps;
- duplicate ticker detection;
- timestamp monotonicity;
- FX-to-market-cap reconciliation.

The response also reports the canonical mode (`database`, `live-http`, or `snapshot`), source, `asOf`, quote count, and issue details per market.

## Safety

The endpoint requires the same server-side `ADMIN_TOKEN` used by the refresh endpoint. It never returns provider API keys or other credentials.

A failing market returns HTTP 503 so external monitoring can alert on it without treating an unhealthy market as a successful response.
