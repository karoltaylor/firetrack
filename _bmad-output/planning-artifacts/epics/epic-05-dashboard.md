# Epic 5: Dashboard & Portfolio UI
**Priority:** P0 — Users must see their FIRE date on first session; this is the product
**PRD refs:** FR-04, FR-07, FR-11
**Arch refs:** Next.js App Router, Recharts, Zustand, client-side rendering, responsive design

## Goal
Build the dashboard that makes FIREtrack's value immediately visible. Retirement date is the most prominent element. Real returns are the default metric. Every number traces back to the calculation engine.

## Stories

---

### Story 5.1 — Main Dashboard Layout
**As a** user,
**I want** a clear dashboard that shows my retirement date and portfolio health above the fold,
**so that** I get the answer to my main question the moment I log in.

**Acceptance Criteria:**
- [ ] Dashboard is a `'use client'` page — all data read from IndexedDB (or decrypted cloud for premium)
- [ ] Above the fold (no scroll required on 1280px wide screen): retirement date card, FIRE progress bar, real return vs CPI, portfolio total value
- [ ] Retirement date card is the largest element — prominently styled, shows the moderate scenario date by default
- [ ] Three scenario retirement dates shown: conservative / moderate / optimistic with labels
- [ ] FIRE progress bar: "€{current} of €{fireNumber} — {percent}% to FIRE"
- [ ] If FIRE number not yet set: prominent CTA to complete onboarding wizard
- [ ] If no transactions yet: empty state with "Import your first portfolio" CTA
- [ ] Dashboard updates instantly when new transactions are imported (reactive to IndexedDB changes via Dexie liveQuery)
- [ ] Responsive: usable on mobile (≥ 375px), tablet, desktop

---

### Story 5.2 — FIRE Trajectory Chart
**As a** user,
**I want** to see a chart showing my portfolio growth trajectory toward my FIRE number,
**so that** I can visualise my journey over time.

**Acceptance Criteria:**
- [ ] Chart shows: historical portfolio value (solid line) + projected trajectory (dashed lines for 3 scenarios)
- [ ] X-axis: timeline from first transaction to projected FIRE date (moderate scenario)
- [ ] Y-axis: portfolio value in base currency
- [ ] Horizontal reference line at FIRE number (labelled)
- [ ] Vertical reference line at today
- [ ] Scenario lines coloured: conservative (amber), moderate (blue), optimistic (green)
- [ ] Hover tooltip: shows date + value for each line at that point
- [ ] Toggle: switch between nominal and real (inflation-adjusted) projections
- [ ] Chart built with Recharts `ComposedChart`
- [ ] Mobile: chart scrollable horizontally on small screens

---

### Story 5.3 — Portfolio Total Value & Holdings List
**As a** user,
**I want** to see my total portfolio value and a list of all holdings,
**so that** I know what I own and how each position is performing.

**Acceptance Criteria:**
- [ ] Total current value displayed in base currency (large, prominent)
- [ ] Total cost basis and total gain/loss (€ and %) shown below total
- [ ] Real gain/loss (inflation-adjusted) shown as the primary gain metric
- [ ] Holdings table: columns = Asset, Account, Quantity, Current Price, Current Value, Cost Basis, Real Gain/Loss (%), Weight
- [ ] Holdings sortable by any column
- [ ] Holdings filterable by asset class
- [ ] Clicking a holding opens a detail drawer: full history chart, all transactions for that asset
- [ ] Current prices fetched from server market data cache (Epic 6) — shown with last-updated timestamp
- [ ] Prices older than 24h shown with stale indicator

---

### Story 5.4 — Allocation Breakdown Charts
**As a** user,
**I want** to see how my portfolio is split by asset class and geography,
**so that** I can assess my diversification and spot concentration risks.

**Acceptance Criteria:**
- [ ] Donut chart: allocation by asset class (equities, bonds, crypto, real estate, pension, cash)
- [ ] Donut chart: allocation by geography (country, using ISO flags)
- [ ] Donut chart: allocation by currency
- [ ] Clicking a segment filters the holdings list to that class/country/currency
- [ ] Home country bias warning banner: if any country > 40% of equity allocation, show amber banner: "Your portfolio has significant home country exposure (X%). Consider broader geographic diversification."
- [ ] Warning threshold configurable in settings (default 40%)

---

### Story 5.5 — Real Return vs CPI Benchmark Display
**As a** user,
**I want** to see my portfolio's real return compared to inflation,
**so that** I know if my money is actually growing in purchasing power.

**Acceptance Criteria:**
- [ ] Benchmark panel shows: "Your real return: +X.X% vs CPI (inflation): +0% → You are beating inflation by X.X%"
- [ ] Language is plain and declarative — not just numbers
- [ ] Time period selector: 1Y, 3Y, 5Y, all-time
- [ ] Additional benchmarks shown below CPI: MSCI World, S&P 500, Euro Stoxx 50 (data from Epic 6)
- [ ] Benchmark lines shown on the same chart as the FIRE trajectory chart (toggle-able)
- [ ] Inflation data source disclosed: "Inflation data: Eurostat HICP (Poland), last updated {date}"
- [ ] If CPI data not yet loaded: skeleton loader shown, not a blank panel

---

### Story 5.6 — Performance Chart (Historical)
**As a** user,
**I want** to see a chart of my portfolio's value and returns over time,
**so that** I can see how my investments have actually performed historically.

**Acceptance Criteria:**
- [ ] Line chart of portfolio value over time (from first transaction to today)
- [ ] Toggle: total value / invested amount / real return % / nominal return %
- [ ] Date range selector: 3M, 6M, 1Y, 3Y, 5Y, all-time
- [ ] XIRR and TWR displayed as numeric summary above the chart (for selected period)
- [ ] Real return and nominal return shown side-by-side: "Real: +4.1% · Nominal: +7.2%"
- [ ] Tooltip on hover: date + portfolio value + invested + gain/loss

---

### Story 5.7 — What-If Contribution Simulator UI
**As a** user,
**I want** to use a slider to explore how changing my monthly contribution affects my retirement date,
**so that** I can make informed decisions about my savings rate.

**Acceptance Criteria:**
- [ ] Slider component below the retirement date card
- [ ] Slider range: €0 to 3× current average monthly contribution
- [ ] Numeric input field synced with slider (direct entry allowed)
- [ ] Retirement date updates in real-time (debounced 100ms) as slider moves — all 3 scenarios
- [ ] Delta display: "+€{amount}/month → retire {N} years earlier / later"
- [ ] Reset button returns to actual contribution
- [ ] Simulation state not persisted — resets on page refresh
