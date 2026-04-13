# Epic 4: Calculation Engine
**Priority:** P0 — The core product value; nothing meaningful shows on the dashboard without this
**PRD refs:** FR-05, FR-06, NFR-04
**Arch refs:** `@firetrack/calculations` package, XIRR, TWR, CAGR, real return, FIRE trajectory, Monte Carlo (deferred to Epic 12)

## Goal
Implement all financial calculations as a tested, shared TypeScript library. Every number the user sees on the dashboard comes from this engine. Accuracy is non-negotiable — calculations validated against Excel and reference implementations.

## Stories

---

### Story 4.1 — XIRR (Money-Weighted Return)
**As a** developer,
**I want** a correct XIRR implementation in `@firetrack/calculations`,
**so that** users see their true personal return accounting for when and how much they invested.

**Acceptance Criteria:**
- [ ] `calculateXIRR(cashFlows: CashFlow[], guess?: number): number` exported from package
- [ ] `CashFlow` interface: `{ date: Date; amount: number }` (negative = outflow, positive = inflow/ending value)
- [ ] Newton-Raphson solver converges within 100 iterations for standard portfolios
- [ ] Throws descriptive error if no convergence (e.g. all cash flows same sign)
- [ ] Test suite: 10+ reference cases validated against Excel XIRR function to 4 decimal places
- [ ] Test cases include: simple buy-hold, regular DCA, multiple sells, dividend income, multi-year portfolio
- [ ] Edge cases handled: single transaction, zero return, negative return, very short periods
- [ ] Performance: 10,000 cash flows computed in < 100ms

**Technical notes:**
- `daysBetween(d1, d2)` uses actual calendar days, not 365-day approximation
- Days calculation relative to first cash flow date (standard XIRR convention)

---

### Story 4.2 — TWR (Time-Weighted Return)
**As a** developer,
**I want** a correct TWR implementation,
**so that** users can benchmark their investment strategy independently of their deposit timing.

**Acceptance Criteria:**
- [ ] `calculateTWR(subPeriods: SubPeriod[]): number` exported
- [ ] `SubPeriod`: `{ startValue: number; endValue: number; externalCashFlow: number }`
- [ ] Sub-period boundaries computed from transaction dates (each contribution/withdrawal creates a new sub-period)
- [ ] `buildTWRSubPeriods(transactions: Transaction[], priceHistory: PriceMap): SubPeriod[]` helper exported
- [ ] Test suite: 5+ reference cases matching industry-standard TWR results
- [ ] Edge case: no cash flows (TWR = XIRR = CAGR)
- [ ] Edge case: cash flow on first or last day

---

### Story 4.3 — CAGR
**As a** developer,
**I want** a CAGR calculation,
**so that** simplified annualised return can be shown on the dashboard and in holding detail views.

**Acceptance Criteria:**
- [ ] `calculateCAGR(startValue: number, endValue: number, years: number): number` exported
- [ ] `calculateCAGRForDateRange(startValue: number, endValue: number, startDate: Date, endDate: Date): number` exported (derives years from dates)
- [ ] Test suite: 5 reference cases
- [ ] Edge case: < 1 year period (partial year CAGR)
- [ ] Edge case: zero start value throws descriptive error

---

### Story 4.4 — Real Return (Inflation Adjustment)
**As a** developer,
**I want** a real return formula that correctly applies CPI data,
**so that** users see inflation-adjusted returns as the primary metric.

**Acceptance Criteria:**
- [ ] `toRealReturn(nominalReturn: number, inflationRate: number): number` exported
- [ ] Formula: `(1 + nominal) / (1 + inflation) - 1` (Fisher equation — NOT simple subtraction)
- [ ] `calculateAnnualisedInflation(cpiHistory: CPIDataPoint[], startDate: Date, endDate: Date): number` exported — derives the average annual inflation rate for a period from monthly HICP data
- [ ] `applyRealReturnToXIRR(xirr: number, inflationRate: number): number` convenience wrapper
- [ ] Test suite: 5 cases including the worked example from domain research (7.16% nominal, 3% inflation → 4.04% real)
- [ ] Test verifies Fisher equation vs naive subtraction produces different results (nominal 10%, inflation 10% → Fisher: 0%, naive: 0% — agree; nominal 10%, inflation 3% → Fisher: 6.796%, naive: 7% — differ by 0.2%)

---

### Story 4.5 — FIRE Number & Variant Classification
**As a** user,
**I want** my FIRE number calculated and my FIRE variant labelled automatically,
**so that** I immediately understand what I'm working toward.

**Acceptance Criteria:**
- [ ] `calculateFIRENumber(annualExpenses: number, swr: number): number` exported — `annualExpenses / swr`
- [ ] `classifyFIREVariant(annualExpenses: number): FIREVariant` exported
  - `annualExpenses < 40_000` → `'lean'`
  - `40_000 <= annualExpenses <= 100_000` → `'standard'`
  - `annualExpenses > 100_000` → `'fat'`
- [ ] `calculateFIREProgress(currentPortfolioValue: number, fireNumber: number): number` exported — returns 0–100 percentage
- [ ] All thresholds use user's base currency equivalent (currency conversion applied before classification)
- [ ] Test suite: classification boundaries, progress 0% / 50% / 100% / over 100%

---

### Story 4.6 — Retirement Date Trajectory
**As a** user,
**I want** to see my projected retirement date across three scenarios,
**so that** I know when I'm likely to reach financial independence.

**Acceptance Criteria:**
- [ ] `projectFIRE(params: FIREProjectionParams): FIREProjection` exported
- [ ] `FIREProjectionParams`: `{ currentPortfolioValue, monthlyContribution, fireNumber, currentAge, targetRetirementAge, realReturnRate? }`
- [ ] `FIREProjection` includes: `retirementDate`, `yearsToFIRE`, `progressPercent`, `fireVariant`, `coastFIREDate`, `scenarios`
- [ ] Three scenarios in `scenarios`: conservative (4% real), moderate (6% real), optimistic (8% real)
- [ ] Default `realReturnRate` is 5% if not provided
- [ ] SWR default: 3.5% for `targetRetirementAge < 55`, 4% for `>= 55`
- [ ] Binary search solver for `n` months: converges within 0.01 month precision
- [ ] `monthlyContribution` derived from last 3 months average of transaction history if not explicitly provided
- [ ] Test suite: Beata persona (36yo, €900K FIRE number, current €100K, €2K/mo contrib, 5% real → ~age 54)
- [ ] Edge case: already past FIRE number (returns `retirementDate: now`, `yearsToFIRE: 0`)
- [ ] Edge case: zero contribution (portfolio growth only)

---

### Story 4.7 — Coast FIRE Milestone
**As a** user pursuing Coast FIRE,
**I want** to know when I'll reach the point where I can stop contributing and still retire on time,
**so that** I can plan for reduced work intensity earlier.

**Acceptance Criteria:**
- [ ] `calculateCoastFIREDate(params: CoastFIREParams): Date | null` exported
- [ ] `CoastFIREParams`: `{ currentPortfolioValue, fireNumber, currentAge, targetRetirementAge, realReturnRate }`
- [ ] Coast FIRE value = `fireNumber / (1 + realReturnRate)^yearsToTraditionalRetirement`
- [ ] Returns the date when `currentPortfolioValue` (growing at `realReturnRate` with continued contributions) reaches the Coast FIRE value
- [ ] Returns `null` if already past Coast FIRE value (user has already coasted)
- [ ] Dashboard shows "Coast FIRE reached!" if already there
- [ ] Test suite: standard case, already coasted, zero growth edge case

---

### Story 4.8 — What-If Contribution Simulator
**As a** user,
**I want** to slide a contribution amount and immediately see how it changes my retirement date,
**so that** I can understand the impact of saving more or less.

**Acceptance Criteria:**
- [ ] `simulateContribution(baseProjection: FIREProjection, newMonthlyContribution: number): FIREProjection` exported — reuses `projectFIRE` with overridden contribution
- [ ] UI: slider from €0 to 3× current contribution, with numeric input override
- [ ] Retirement date updates in real-time as slider moves (debounced 100ms)
- [ ] Shows delta vs current plan: "+€200/month → retire 2.3 years earlier"
- [ ] All three scenarios (conservative/moderate/optimistic) update simultaneously
- [ ] Slider value not persisted — it's a simulation only

---

### Story 4.9 — Portfolio Aggregation Calculations
**As a** user,
**I want** to see my total portfolio value, cost basis, and overall gain/loss,
**so that** I can understand my portfolio at a glance.

**Acceptance Criteria:**
- [ ] `aggregatePortfolio(transactions: Transaction[], currentPrices: PriceMap, exchangeRates: ExchangeRateMap, baseCurrency: string): PortfolioSummary` exported
- [ ] `PortfolioSummary` includes: `totalCurrentValue`, `totalCostBasis`, `totalGainLoss`, `totalGainLossPercent` (all in base currency)
- [ ] `PortfolioSummary` includes: `byAssetClass: Record<AssetClass, number>`, `byCurrency: Record<string, number>`, `byGeography: Record<string, number>`
- [ ] Each holding: `{ symbol, quantity, currentPrice, currentValue, costBasis, gainLoss, gainLossPercent, weightInPortfolio }`
- [ ] All values converted to base currency using historical rates for cost basis, current rates for current value
- [ ] Home country bias flag: if any country > 40% of equity allocation, `homeBiasFlagged: true` in summary
- [ ] Test suite: multi-currency portfolio with 5 holdings, correct aggregation and conversion
