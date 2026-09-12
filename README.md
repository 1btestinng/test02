# iStocks

A minimal market-cap ranking and company intelligence experience for listed companies across North Africa.

## Company fundamentals
Company pages use **EOD Historical Data (EODHD)** as the primary fundamental-data provider when `EODHD_API_KEY` is configured. EODHD's Fundamentals API provides company profile, valuation, shares, dividends, earnings and annual/quarterly financial statements for supported non-US exchanges. urlEODHD Fundamentals API documentationhttps://eodhd.com/financial-apis/stock-etfs-fundamental-data-feeds

The application normalizes provider data into the internal iStocks financial model and calculates only transparent derived metrics such as TTM aggregates, margins, ROE/ROA, net debt and book value per share when the required provider inputs are present. Missing provider fields remain unavailable; the application does not invent financial values.

`EODHD_API_KEY` is server-side only and must be configured in Vercel Environment Variables. For automatic exchange discovery, iStocks uses EODHD's exchange list; optional `EODHD_EG_EXCHANGE`, `EODHD_MA_EXCHANGE`, `EODHD_TN_EXCHANGE`, and `EODHD_DZ_EXCHANGE` overrides can pin exchange codes when needed.

## Current Version 1 data
The repository includes market snapshots for Egypt, Morocco, Tunisia and Algeria. Prices and market caps are delayed/source-derived; the UI explicitly discloses this. The ranking engine calculates market cap from price × shares outstanding where configured shares are available.

## Architecture
`MarketDataProvider → normalization → company fundamentals adapter → ranking/company intelligence → Next.js UI`

The provider interface lives in `lib/providers`. No vendor credential is exposed to the browser. EODHD fundamentals are accessed only from the server.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` to PostgreSQL/Supabase/Neon.
4. Set `EODHD_API_KEY` for company fundamentals.
5. `npx prisma migrate dev --name init`
6. `npm run dev`

## Data contract
Required environment variables depend on the configured market-data and FX providers. If a provider is delayed or unavailable, the application must continue to display the delay/outage state rather than implying real-time data.

## Routes
- `/` — market ranking
- `/company/[ticker]` — company detail and intelligence
- `/industries` — industry overview
- `/industry/[industry]` — industry ranking
- `/methodology` — methodology and provenance
- `/api/companies/top100` — normalized ranking JSON
- `/api/market/summary` — market summary JSON

## Quality rules
Never fabricate prices, shares, historical data or financial statements. If a provider does not return a metric, iStocks leaves that metric unavailable. Derived metrics must be calculated only from provider-returned inputs and labeled as calculated where applicable.

## Deployment
Vercel is configured to deploy the `main` branch. The application is a standard Next.js App Router project and uses `npm run build` for production builds.
