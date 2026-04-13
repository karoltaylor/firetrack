# Epic 6: External Data Integrations
**Priority:** P1 — Required for real-time prices, real returns, and benchmarks; dashboard incomplete without it
**PRD refs:** FR-05.5, FR-07, Section 8 (External Data Sources), NFR-01.5
**Arch refs:** Alpha Vantage, yahoo-finance2, ECB Exchange Rate API, Eurostat HICP, CoinGecko, Numbeo, Redis cache, BullMQ refresh jobs

## Goal
Connect FIREtrack to external data sources for market prices, exchange rates, CPI inflation, and property market data. All data is cached server-side — users are never blocked on external API calls, and rate limits are managed centrally.

## Stories

---

### Story 6.1 — ECB Exchange Rate Integration
**As a** user with a multi-currency portfolio,
**I want** accurate exchange rates applied to all my holdings,
**so that** my total portfolio value is correctly expressed in my base currency.

**Acceptance Criteria:**
- [ ] `GET /api/market/exchange-rates?base=EUR&date=2026-03-15` returns historical rate for any date
- [ ] ECB SDMX API used as primary source: `https://data-api.ecb.europa.eu/service/data/EXR/`
- [ ] Daily refresh job (BullMQ) fetches latest ECB rates and stores in `ExchangeRate` table
- [ ] Historical rates back to 2000 backfilled on first deployment (ECB provides full history)
- [ ] If rate not available for exact date: use most recent prior date (e.g. weekends use Friday's rate)
- [ ] Rates cached in Redis with 24h TTL for fast API response
- [ ] `GET /api/market/exchange-rates?base=USD` returns all available USD rates for today
- [ ] Client stores fetched rates in IndexedDB `exchangeRates` table for offline use

**Technical notes:**
- ECB API is free, no key required, official EU source — preferred for GDPR/EU credibility
- Fallback: Open Exchange Rates (free tier) if ECB API is unavailable

---

### Story 6.2 — Stock & ETF Price Integration
**As a** user,
**I want** current and historical prices for all stocks and ETFs in my portfolio,
**so that** my holdings show accurate current values.

**Acceptance Criteria:**
- [ ] `GET /api/market/prices?symbols=VWCE,IWDA,AAPL&date=2026-04-13` returns prices for requested symbols
- [ ] Alpha Vantage used for historical OHLCV data (25 req/day free tier — batched efficiently)
- [ ] `yahoo-finance2` npm package used for current day prices (unofficial but reliable, no rate limit concerns for V1 scale)
- [ ] Daily refresh job updates prices for all symbols held by any user (aggregate distinct symbols from all `Asset` records)
- [ ] Historical prices stored in `MarketPrice` table — never re-fetched for past dates
- [ ] Current prices (today) refreshed at market open (08:00 UTC) and market close (22:00 UTC) via BullMQ job
- [ ] If symbol not found: `null` returned, holding shown with "Price unavailable" label in UI
- [ ] Prices shown with last-updated timestamp in UI
- [ ] Client stores fetched prices in IndexedDB `marketPrices` for offline access

**Technical notes:**
- Alpha Vantage free tier: 25 req/day. At V1 scale (hundreds of unique symbols), consider batching. Premium tier ($50/month) unlocks 75 req/minute.
- `yahoo-finance2` handles ETFs listed on European exchanges (e.g. XETRA, Euronext) which Alpha Vantage sometimes misses

---

### Story 6.3 — Cryptocurrency Price Integration
**As a** user with crypto holdings,
**I want** accurate current and historical crypto prices,
**so that** my crypto portfolio value is correctly calculated.

**Acceptance Criteria:**
- [ ] CoinGecko API used: `https://api.coingecko.com/api/v3/`
- [ ] `GET /api/market/prices?symbols=BTC,ETH,SOL` returns current prices in EUR, USD, PLN
- [ ] Historical prices fetched on-demand for past transactions (CoinGecko `/coins/{id}/market_chart/range`)
- [ ] CoinGecko coin ID mapping maintained: user enters ticker (BTC) → system maps to CoinGecko ID (bitcoin)
- [ ] Common ticker → CoinGecko ID mappings pre-seeded (top 100 by market cap)
- [ ] Unknown tickers: user prompted to confirm CoinGecko ID via search
- [ ] Daily price refresh for all user-held crypto symbols
- [ ] Free tier: 10,000 calls/month — sufficient for V1 scale

---

### Story 6.4 — Eurostat HICP Inflation Data Integration
**As a** user wanting inflation-adjusted returns,
**I want** accurate CPI data for my country,
**so that** my real returns reflect actual purchasing power changes in my economy.

**Acceptance Criteria:**
- [ ] `GET /api/cpi/:country` returns latest HICP monthly rate and historical data for given country code
- [ ] Eurostat HICP API used: `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_aind`
- [ ] Monthly refresh job fetches HICP data for all countries in `users.countryOfResidence`
- [ ] Historical HICP data back to 2000 backfilled on first deployment
- [ ] `calculateAnnualisedInflation(country, startDate, endDate)` API endpoint for specific period
- [ ] World Bank API used as fallback for non-EU countries
- [ ] `CPIDataPoint` table stores: country (ISO 3166-1), yearMonth (YYYY-MM), hicp value, source
- [ ] Client stores fetched CPI data in IndexedDB `cpiData` for offline calculation

---

### Story 6.5 — Market Index Benchmark Data
**As a** user,
**I want** to benchmark my portfolio against MSCI World, S&P 500, and Euro Stoxx 50,
**so that** I can see if my strategy is beating the market.

**Acceptance Criteria:**
- [ ] Benchmark data available via `GET /api/market/benchmarks?index=MSCI_WORLD&from=2020-01-01`
- [ ] Supported benchmarks: MSCI World (proxy: `IWDA.AS`), S&P 500 (proxy: `^GSPC`), Euro Stoxx 50 (proxy: `^STOXX50E`)
- [ ] Benchmark data fetched via yahoo-finance2 (ETF proxy tickers available for free)
- [ ] Historical data back to 2000 backfilled on first deployment
- [ ] Daily refresh at market close
- [ ] Benchmark comparison: `GET /api/market/benchmarks/compare?userReturn=0.062&index=MSCI_WORLD&from=2020-01-01&to=2026-01-01` returns benchmark TWR for same period
- [ ] Data source disclosed in UI for each benchmark
