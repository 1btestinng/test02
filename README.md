# EGX 100

A minimal market-cap ranking experience for Egypt's listed companies.

## Current Version 1 data
The repository includes a 100-company snapshot sourced from public EGX market research captured on 11 September 2026. Prices and market caps are delayed/source-derived; the UI explicitly discloses this. The ranking engine calculates market cap from price × shares outstanding. For the seed snapshot, shares outstanding are reconstructed from the published price/market-cap pair and must be replaced with verified issuer share counts before production use.

## Architecture
`MarketDataProvider → normalization → database → market-cap engine → ranking engine → API → Next.js UI`

The provider interface lives in `lib/providers`. No vendor credential is exposed to the browser. Replace `FreeEGXProvider` with a licensed EGX-compatible implementation when credentials are available.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` to PostgreSQL/Supabase/Neon.
4. `npx prisma migrate dev --name init`
5. `npm run dev`

The initial UI can run from the verified seed module without a database; production ingestion should persist normalized quotes and FX rates in PostgreSQL.

## Data contract
Required environment variables are `MARKET_DATA_API_KEY` for the configured provider and `FX_API_KEY` if the selected FX vendor needs one. If a provider is delayed, the application must continue to display the delay rather than implying real-time data.

## Routes
- `/` — Top 100 ranking
- `/company/[ticker]` — company detail
- `/industries` — industry overview
- `/industry/[industry]` — industry ranking
- `/methodology` — methodology and provenance
- `/api/companies/top100` — normalized ranking JSON
- `/api/market/summary` — market summary JSON

## Quality rules
Never fabricate prices, shares, historical data or market status. If provider data is unavailable, preserve the last verified dataset and expose the outage state.

## Deployment
Vercel is configured to deploy the `main` branch. The application is a standard Next.js App Router project and uses `npm run build` for production builds.
