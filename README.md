# iStocks

A minimal market-cap ranking and company intelligence experience for listed companies across North Africa.

## Company fundamentals
Company pages use **Alpha Vantage** as the optional primary fundamental-data provider when `ALPHA_VANTAGE_API_KEY` is configured, with the existing free Yahoo Finance market-data/fundamentals path retained as a fallback. Alpha Vantage provides annual and quarterly income statements, balance sheets, cash flow statements and company overview/fundamental fields through its API. urlAlpha Vantage API documentationhttps://www.alphavantage.co/documentation/

Alpha Vantage offers a free API key. Its current standard free service allows 25 API requests per day for most datasets, and Alpha Vantage says verified open-source or educational projects can receive unlimited API requests. urlAlpha Vantage support / free API limitshttps://www.alphavantage.co/support/

The application normalizes provider data into the internal iStocks financial model and calculates only transparent derived metrics such as TTM aggregates, margins, ROE/ROA, net debt, free cash flow and book value per share when the required provider inputs are present. Missing provider fields remain unavailable; the application does not invent financial values.

`ALPHA_VANTAGE_API_KEY` is server-side only and must be configured in Vercel Environment Variables if Alpha Vantage fundamentals are desired. If no key is configured, iStocks continues to use its existing free market-data/fundamentals fallback instead of breaking company pages.

## Current Version 1 data
The repository includes market snapshots for Egypt, Morocco, Tunisia and Algeria. Prices and market caps are delayed/source-derived; the UI explicitly discloses this. The ranking engine calculates market cap from price × shares outstanding where configured shares are available.

## Architecture
`MarketDataProvider → normalization → free fundamentals adapter → ranking/company intelligence → Next.js UI`

No vendor credential is exposed to the browser. Fundamentals API calls are server-side and cached.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` to PostgreSQL/Supabase/Neon.
4. Optionally set `ALPHA_VANTAGE_API_KEY` using a free Alpha Vantage key.
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
