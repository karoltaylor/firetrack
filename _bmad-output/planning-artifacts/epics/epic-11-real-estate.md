# Epic 11: Real Estate Tracking
**Priority:** P2 — Key differentiator; no competitor provides market benchmarks; important for Beata persona
**PRD refs:** FR-08
**Arch refs:** Manual entry, Numbeo API, Redis cache, real estate in portfolio aggregation

## Goal
Users can add real estate assets manually, track value history, calculate rental yield, and benchmark against local market data from Numbeo. Real estate is fully integrated into the FIRE number progress calculation.

## Stories

---

### Story 11.1 — Real Estate Asset Entry
**As a** user with property investments,
**I want** to add my real estate holdings to FIREtrack,
**so that** they are included in my total portfolio and FIRE number progress.

**Acceptance Criteria:**
- [ ] "Add Real Estate" button in portfolio or sidebar
- [ ] Form fields: property name/label, country (dropdown), city (text), purchase price, purchase date, current estimated value, currency, property size m² (optional)
- [ ] Optional rental income section: monthly gross rent (€/month), occupancy rate (%, default 100%)
- [ ] Gross rental yield auto-calculated: `(monthlyRent × 12 × occupancyRate) / currentValue × 100`
- [ ] Property saved to IndexedDB `realEstate` table (free tier) or encrypted cloud (premium)
- [ ] Real estate included in portfolio total value and asset class allocation (shown as "Real Estate" slice)
- [ ] Real estate included in FIRE number progress calculation

---

### Story 11.2 — Property Value History
**As a** user,
**I want** to update my property's estimated value over time and see how it has grown,
**so that** I can track real estate appreciation.

**Acceptance Criteria:**
- [ ] "Update Value" button on real estate detail page
- [ ] Each value update stored in `valueHistory` array: `{ date, value }`
- [ ] Historical value chart shows property value over time (from purchase to today)
- [ ] Real return on real estate calculated: `[(currentValue - purchasePrice) / purchasePrice]` adjusted for local CPI
- [ ] "Purchase price adjusted for inflation" shown alongside current value: "You paid {price} in {year}, which is {inflationAdjusted} in today's money"

---

### Story 11.3 — Numbeo Market Data Integration
**As a** user,
**I want** to see how my property compares to local market averages,
**so that** I know if I'm above or below market rate for price and rental yield.

**Acceptance Criteria:**
- [ ] `GET /api/numbeo/city/:country/:city` returns: average price per m², average gross rental yield
- [ ] Numbeo API integrated server-side, data cached in Redis for 30 days
- [ ] On real estate detail page: "Warsaw market average: {price}/m² · Your property: {price}/m²"
- [ ] If user entered property size (m²): property value per m² calculated and compared to market
- [ ] Rental yield comparison: "Your yield: {X}% · Warsaw average: {Y}%" with above/below indicator
- [ ] If Numbeo data not available for the city: graceful fallback "Market data unavailable for this city"
- [ ] Data source disclosed: "Market data: Numbeo, last updated {date}"
