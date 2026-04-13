# Product Requirements Document — FIREtrack
**Product Manager:** John, PM Agent
**Date:** April 2026
**Version:** 1.0
**Status:** Draft — Ready for Architecture Phase
**Inputs:** prfaq-firetrack.md · market-research-firetrack.md · domain-research-firetrack.md

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [User Journeys](#5-user-journeys)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Data & Integration Requirements](#8-data--integration-requirements)
9. [Pricing & Tier Model](#9-pricing--tier-model)
10. [Out of Scope (V1)](#10-out-of-scope-v1)
11. [Constraints & Assumptions](#11-constraints--assumptions)
12. [Open Questions & Risks](#12-open-questions--risks)

---

## 1. Executive Summary

### Product Vision
FIREtrack is the portfolio intelligence layer for FIRE (Financial Independence, Retire Early) investors. It answers the one question no existing tool answers: **"Will I retire at my target date — and what do I need to change right now?"**

### Market Opportunity
- $3.8B market (2025), growing to $7.9B by 2033 at 12.8% CAGR
- 15M+ FIRE followers in the US alone; growing European community severely underserved by US-centric tools
- Zero competitors provide FIRE retirement date trajectory as a primary output

### Primary Differentiators
1. **Retirement trajectory as north star** — the product is organised around one output: are you on track for your target retirement date?
2. **Real (inflation-adjusted) returns as the primary metric** — not nominal; not benchmark-relative; purchasing power is what matters
3. **Any-format document import** — AI-powered parsing for any broker export, not just a predefined list of supported formats
4. **Zero-knowledge encryption** — user-key architecture; FIREtrack cannot read user data by design, not by policy
5. **Real estate with market benchmarks** — the only tracker to enrich property assets with local market price data from Numbeo/Eurostat

### Primary Competitor
trefolio (€7.99/mo, European-native) is the most direct threat. trefolio tracks performance well but does not answer the FIRE retirement question, does not calculate real returns, and does not offer zero-knowledge encryption. FIREtrack is not competing on breadth of broker integrations — it is competing on FIRE-specific depth of insight.

---

## 2. Problem Statement

### Who Has This Problem
FIRE-focused investors in Europe and globally, primarily aged 25–45, who:
- Hold investments across 3–5+ platforms (pension, brokerage, crypto, real estate)
- Have investments in multiple currencies
- Are making regular automated contributions (DCA) across platforms
- Cannot easily see their complete financial picture in one place
- Cannot answer the fundamental question: "Am I on track to retire by my target date?"

### The Current Reality
Most FIRE investors currently manage their portfolio using manually-maintained spreadsheets. These spreadsheets:
- Require hours of manual monthly updates (transaction entry, exchange rate updates, price refreshes)
- Break under multi-currency automated transfers at scale
- Cannot calculate inflation-adjusted real returns correctly
- Cannot model retirement trajectory with contribution projections
- Require significant financial and technical skill to maintain accurately

When they move beyond spreadsheets to commercial tools (trefolio, Sharesight, Kubera), those tools track portfolio performance but still do not answer the FIRE-specific question: "Will I reach my FIRE number by my target retirement date?"

### The Cost of the Status Quo
Every year without clear trajectory data is a year of suboptimal decisions — wrong asset allocation, wrong savings rate, wrong risk exposure — with compounding consequences. FIRE investors who miscalculate by even 1 year in retirement planning may work 2–3 additional years due to compound growth dynamics.

---

## 3. Goals & Success Metrics

### Product Goals
| Goal | Rationale |
|---|---|
| G1: Answer the FIRE retirement date question accurately | Primary product differentiator and reason users choose FIREtrack over trefolio |
| G2: Support any broker's export format without predefined templates | Core accessibility differentiator; removes the "my broker isn't supported" barrier |
| G3: Display real (inflation-adjusted) returns as the default metric | Honest reporting is the product's integrity promise |
| G4: Be architecturally trustworthy, not just policy-trustworthy | Zero-knowledge encryption enables adoption from privacy-conscious FIRE community |
| G5: Support all major FIRE-relevant asset classes | Portfolio completeness is prerequisite to accurate retirement trajectory |

### Success Metrics

#### Acquisition
| Metric | Target (Month 6) | Target (Month 12) |
|---|---|---|
| Total registered users | 500 | 2,000 |
| Paid users (annual subscribers) | 50 | 400 |
| First 100 early adopter users enrolled | Month 1 | — |

#### Activation
| Metric | Target |
|---|---|
| Users who complete first portfolio import | ≥ 70% of registered users within 7 days |
| Users who see their retirement date projection | ≥ 60% within first session |
| Free-to-paid conversion rate (via AI parse trial) | ≥ 25% |

#### Retention
| Metric | Target |
|---|---|
| Month 3 retention (paid users) | ≥ 85% |
| Month 12 retention (annual subscribers) | ≥ 75% |
| Monthly active users (MAU) among paid | ≥ 80% |

#### Quality
| Metric | Target |
|---|---|
| Document parse accuracy (known format) | ≥ 99% transaction accuracy |
| Document parse accuracy (unknown format — AI) | ≥ 95% field extraction accuracy, 100% flagging of uncertain fields |
| Retirement trajectory calculation correctness | 100% (validated against reference calculations) |
| Uptime (premium tier) | ≥ 99.5% monthly |

---

## 4. User Personas

### Primary Persona — The FIRE Chaser
**Name:** Beata, 36, Director at a multinational company, Warsaw
**Portfolio:** Employer pension, crypto (2–3 exchanges), real estate (apartment), Trading 212, DEGIRO
**Currencies:** PLN, EUR, USD
**FIRE goal:** Retire at 50 (14 years)
**Current behaviour:** No systematic tracking; vague awareness of total value; concerned she is not saving enough or allocating correctly
**Key frustration:** Cannot see the whole picture; does not know if her retirement goal is realistic
**Willingness to pay:** High — she earns well and values tools that save time and reduce financial anxiety
**Technical literacy:** Moderate; comfortable with apps, not a developer
**Primary job-to-be-done:** "Tell me if I'm on track to retire at 50, and what I should change if I'm not."

### Secondary Persona — The Spreadsheet Outgrower
**Name:** Tomasz, 31, Software Engineer, Kraków
**Portfolio:** IBKR (global ETFs), Revolut (stocks/savings), employer ESPP, small crypto allocation
**Currencies:** PLN, EUR, USD
**FIRE goal:** Lean FIRE at 42 (11 years)
**Current behaviour:** Maintains a sophisticated Google Sheet with XIRR calculations; spending 4+ hours/month maintaining it; frustrated by multi-currency automation breaking formulas
**Key frustration:** The spreadsheet is becoming a part-time job; no mobile access; cannot model scenarios easily
**Technical literacy:** High; will evaluate technical claims (will check Network tab, will read GitHub code)
**Primary job-to-be-done:** "Replace my spreadsheet with something accurate that I can trust and that actually saves me time."

### Tertiary Persona — The Late FIRE Starter
**Name:** Miriam, 44, Marketing Manager, Prague
**Portfolio:** Czech pension fund, some ETFs via broker, savings account
**Currencies:** CZK, EUR
**FIRE goal:** Retire at 58 (14 years); just starting to take FIRE seriously
**Current behaviour:** No tracking; relies on pension fund statements; recently discovered FIRE movement
**Key frustration:** Does not know where to start; intimidated by financial complexity
**Technical literacy:** Low-moderate; needs guided onboarding and simple language
**Primary job-to-be-done:** "Show me what I have, explain if it's enough, and tell me what I should do differently."

---

## 5. User Journeys

### Journey 1: First-Time Setup (Beata)
1. Beata lands on firetrack.io from r/EuropeFIRE recommendation
2. Creates account (email + password; no broker OAuth required)
3. Onboarding wizard: sets retirement target age (50), current age (36), target annual expenses (€36,000/yr)
4. FIREtrack calculates her FIRE number: **€900,000**
5. Prompted to add her first account — selects "Upload a file"
6. Uploads DEGIRO CSV export — AI auto-parse trial activated (one free parse)
7. Transactions imported, portfolio visible; she sees her first real return figure
8. Prompted to add remaining accounts (pension, crypto, real estate)
9. After all accounts added: retirement date projection appears — **"At your current trajectory, you will reach your FIRE number at age 54, not 50."**
10. FIREtrack surfaces: "Increasing monthly contributions by €400 would move your retirement date to age 50."
11. Beata upgrades to premium to unlock AI parsing for remaining broker files

### Journey 2: Monthly Update (Tomasz)
1. Tomasz receives automated monthly import reminder
2. Downloads CSVs from IBKR and Revolut
3. Uploads both — AI parses automatically (premium)
4. FIREtrack reconciles new transactions; updates XIRR, TWR, real return
5. Dashboard shows updated retirement trajectory: "11.2 years to Lean FIRE at current rate"
6. Benchmark panel shows: portfolio real return 6.4% vs CPI 3.1% — beating inflation by 3.3%
7. Allocation check: flagged 68% equities vs recommended 80% for accumulation phase — Tomasz adjusts in next buy

### Journey 3: Real Estate Addition (Beata)
1. Beata adds Warsaw apartment as a real estate asset
2. Enters: purchase price (PLN 650,000), purchase year (2019), current estimated value (PLN 820,000), monthly rent received (PLN 3,200)
3. FIREtrack fetches Numbeo data for Warsaw: avg price per m² = PLN 14,200; her property at PLN 12,300/m² = below market average
4. Rental yield displayed: 4.7% gross vs Warsaw average 5.1%
5. Real estate now included in total FIRE number progress: portfolio shows complete picture for the first time

---

## 6. Functional Requirements

Requirements are tagged: **[FREE]** available on free tier, **[PRE]** premium only, **[BOTH]** available on both tiers (may differ in depth).

---

### FR-01: User Account & Onboarding

| ID | Requirement | Tier | Priority |
|---|---|---|---|
| FR-01.1 | User can register with email and password. No broker credentials required at registration. | BOTH | Must |
| FR-01.2 | Onboarding wizard collects: current age, target retirement age, target annual retirement expenses (used to calculate FIRE number). | BOTH | Must |
| FR-01.3 | System calculates and displays user's FIRE number (annual expenses × 25) immediately after onboarding. | BOTH | Must |
| FR-01.4 | System displays which FIRE variant the user is targeting based on their stated annual expenses: Lean (<€40K), Standard (€40K–€100K), Fat (>€100K). | BOTH | Should |
| FR-01.5 | User can set their country of residence — used to select the correct CPI inflation data source. | BOTH | Must |
| FR-01.6 | User can update FIRE goal parameters (retirement age, target expenses, SWR) at any time. | BOTH | Must |

---

### FR-02: Data Ingestion — File Upload

| ID | Requirement | Tier | Priority |
|---|---|---|---|
| FR-02.1 | User can upload financial statement files in CSV, Excel (.xlsx, .xls), and PDF formats. | BOTH | Must |
| FR-02.2 | Free tier: on first upload of a new file format, user is presented with a column mapping interface to identify: date, ticker/asset name, transaction type (buy/sell/dividend/fee), quantity, price, currency, total amount. | FREE | Must |
| FR-02.3 | System stores the column mapping for a given file format (identified by column header fingerprint) so the user never needs to re-map the same broker's files. | FREE | Must |
| FR-02.4 | Premium tier: AI-powered auto-parsing attempts to extract all required fields from any file format without manual mapping. | PRE | Must |
| FR-02.5 | AI parser flags fields where confidence is below threshold (configurable, default 90%) and presents them to the user for manual review before importing. | PRE | Must |
| FR-02.6 | Every new free-tier user receives one AI auto-parse trial on their first upload — no premium required. | FREE | Must |
| FR-02.7 | After AI parse trial is used, free-tier user is shown what premium parsing would have saved them in time, with an upgrade prompt. | FREE | Should |
| FR-02.8 | User can manually override any AI-parsed field value before confirming import. | PRE | Must |
| FR-02.9 | System detects and rejects duplicate transactions on re-import (same date, ticker, quantity, price). User is informed of detected duplicates. | BOTH | Must |
| FR-02.10 | User can delete a previously imported file and all its associated transactions. | BOTH | Must |
| FR-02.11 | System supports PDF parsing via OCR-based text extraction before applying column mapping or AI parsing logic. | BOTH | Must |

---

### FR-03: Data Ingestion — Broker API Connections

| ID | Requirement | Tier | Priority |
|---|---|---|---|
| FR-03.1 | User can optionally connect supported brokers via OAuth/API for automatic transaction sync. API connections are never required; the product is fully functional without them. | PRE | Should |
| FR-03.2 | Initial supported broker API connections (V1): Revolut (Open Banking), Trading 212 (API), DEGIRO (OAuth). | PRE | Should |
| FR-03.3 | Connected brokers sync transactions automatically on a daily schedule. User can trigger manual sync at any time. | PRE | Should |
| FR-03.4 | User can disconnect a broker API connection at any time. Disconnecting does not delete historical transaction data. | PRE | Must |
| FR-03.5 | When API sync and file upload transactions overlap, system detects duplicates and presents reconciliation UI rather than silently dropping records. | PRE | Must |

---

### FR-04: Portfolio Aggregation

| ID | Requirement | Tier | Priority |
|---|---|---|---|
| FR-04.1 | System aggregates all assets across all connected/imported accounts into a single unified portfolio view. | BOTH | Must |
| FR-04.2 | All monetary values are displayed in user's chosen base currency. Exchange rates sourced from a reliable free API (e.g. ECB exchange rate API, Open Exchange Rates). | BOTH | Must |
| FR-04.3 | Exchange rates are updated daily. Historical exchange rates are stored to ensure past transaction values are calculated accurately. | BOTH | Must |
| FR-04.4 | Portfolio view shows: total current value, total invested (cost basis), total gain/loss (nominal and real), return metrics (XIRR, TWR, CAGR). | BOTH | Must |
| FR-04.5 | Portfolio is broken down by: asset class (equities, bonds, crypto, real estate, pension, cash), geography (country/region), currency. | BOTH | Must |
| FR-04.6 | Individual holding view shows: current value, cost basis, quantity, current price, gain/loss (nominal and real), weight in portfolio. | BOTH | Must |
| FR-04.7 | System supports all of the following asset classes: stocks, ETFs, bonds, cryptocurrency, real estate (manual), pension/retirement accounts (manual or file upload), cash/savings. | BOTH | Must |
| FR-04.8 | System flags home country bias when a single country represents more than 40% of equity allocation (configurable threshold). | BOTH | Should |

---

### FR-05: Performance Analytics

| ID | Requirement | Tier | Priority |
|---|---|---|---|
| FR-05.1 | System calculates and displays XIRR (Money-Weighted Return) for the total portfolio and for each individual account/asset. | BOTH | Must |
| FR-05.2 | System calculates and displays TWR (Time-Weighted Return) for the total portfolio. | BOTH | Must |
| FR-05.3 | System calculates and displays CAGR for the total portfolio and for any user-defined time period. | BOTH | Must |
| FR-05.4 | All return metrics are displayed in both nominal and real (inflation-adjusted) form. Real return is the primary displayed value; nominal is secondary. | BOTH | Must |
| FR-05.5 | Real return formula: `(1 + Nominal) / (1 + CPI) - 1`. Inflation data sourced from Eurostat HICP API for EU users; World Bank API for others. User's country of residence determines which CPI is applied. | BOTH | Must |
| FR-05.6 | System displays which inflation rate and data source was used in each real return calculation (transparency requirement). | BOTH | Must |
| FR-05.7 | Performance chart shows portfolio value over time, with switchable views: total value, invested amount, real return, nominal return. | BOTH | Must |
| FR-05.8 | User can view performance for any custom date range. | BOTH | Must |
| FR-05.9 | System calculates and displays dividend income (total and by holding), annualised yield, and yield-on-cost. | BOTH | Should |

---

### FR-06: FIRE Retirement Trajectory

| ID | Requirement | Tier | Priority |
|---|---|---|---|
| FR-06.1 | Dashboard prominently displays the user's projected retirement date based on: current portfolio value, average monthly contribution (auto-calculated from transaction history or user-defined), expected real return rate (user-configurable, default 5%), and FIRE number. | BOTH | Must |
| FR-06.2 | Retirement date projection uses future value formula: `FV = PV × (1+r)^n + PMT × [((1+r)^n - 1) / r]`. Solve for n. | BOTH | Must |
| FR-06.3 | System displays three retirement date scenarios simultaneously: Conservative (4% real return), Moderate (6% real return), Optimistic (8% real return). | BOTH | Must |
| FR-06.4 | Default SWR for retirement date calculation is 3.5% (not 4%) for users with target retirement age under 55, reflecting FIRE-appropriate long horizons. SWR is user-configurable. | BOTH | Must |
| FR-06.5 | System explains why 3.5% is the default for early retirees (educational tooltip referencing the Trinity Study limitations for 50+ year horizons). | BOTH | Should |
| FR-06.6 | System displays a "What if" contribution simulator: user can adjust monthly contribution and immediately see the impact on retirement date. | BOTH | Must |
| FR-06.7 | System identifies and labels the FIRE variant the user is on track for: Lean FIRE, Standard FIRE, Fat FIRE, Coast FIRE, Barista FIRE. | BOTH | Must |
| FR-06.8 | Coast FIRE milestone: system calculates and displays the Coast FIRE date — the point at which no further contributions are needed and compound growth alone will reach the FIRE number by age 65. | BOTH | Must |
| FR-06.9 | System displays progress as a percentage toward the FIRE number (e.g. "You are 34% of the way to your FIRE number of €900,000"). | BOTH | Must |
| FR-06.10 | Monte Carlo simulation: runs 1,000+ historical return sequence simulations and displays probability distribution of retirement date outcomes (e.g. "90% chance by age 52, 50% chance by age 49"). | PRE | Must |
| FR-06.11 | Monte Carlo output includes portfolio survivability: probability that portfolio lasts to age 90 given the user's planned SWR. | PRE | Should |
| FR-06.12 | System flags sequence of returns risk when user is within 5 years of target retirement date and portfolio is >80% equities. | PRE | Should |

---

### FR-07: Benchmarking

| ID | Requirement | Tier | Priority |
|---|---|---|---|
| FR-07.1 | User can benchmark their portfolio total real return against: local CPI (primary, default), MSCI World, S&P 500, Euro Stoxx 50. | BOTH | Must |
| FR-07.2 | Benchmark comparison is displayed as a chart showing portfolio real return vs benchmark over the same time period. | BOTH | Must |
| FR-07.3 | System clearly labels: "Your portfolio: +4.2% real return vs CPI benchmark: +0% (inflation). You are beating inflation by 4.2%." Benchmark comparisons use plain language, not just numbers. | BOTH | Must |
| FR-07.4 | Premium users can create a custom benchmark as a user-defined blend (e.g. 80% MSCI World / 20% Euro Government Bonds). | PRE | Should |
| FR-07.5 | Benchmark data sources are disclosed to the user (transparency). | BOTH | Must |

---

### FR-08: Real Estate

| ID | Requirement | Tier | Priority |
|---|---|---|---|
| FR-08.1 | User can add a real estate asset with: property name/label, purchase price, purchase date, current estimated value (user-entered), currency, country and city. | BOTH | Must |
| FR-08.2 | User can optionally add rental income: monthly gross rent, occupancy rate (%). System calculates gross rental yield: `(Annual Rent / Current Value) × 100`. | BOTH | Must |
| FR-08.3 | System fetches and displays average property price per m² for the property's city from Numbeo API. User can enter property size (m²) to see market comparison. | BOTH | Should |
| FR-08.4 | System fetches and displays average gross rental yield for the property's city from Numbeo. User can see if their rental yield is above or below city average. | BOTH | Should |
| FR-08.5 | Real estate is included in total portfolio value and FIRE number progress calculations. | BOTH | Must |
| FR-08.6 | User can update current estimated value at any time. System stores value history to chart real estate appreciation over time. | BOTH | Must |
| FR-08.7 | Real estate real return is calculated as: `[(Current Value - Purchase Price) / Purchase Price]` adjusted for inflation using CPI for the purchase country/period. | BOTH | Should |

---

### FR-09: Security & Privacy Architecture

| ID | Requirement | Tier | Priority |
|---|---|---|---|
| FR-09.1 | Free tier: all user data is stored locally in the user's browser (IndexedDB or equivalent). No financial data is transmitted to FIREtrack servers. | FREE | Must |
| FR-09.2 | Free tier: user can export their complete data as an encrypted local backup file at any time (mitigates data loss risk on device failure). | FREE | Must |
| FR-09.3 | Premium tier: data is synchronised to FIREtrack's encrypted cloud storage. Encryption uses zero-knowledge architecture — data is encrypted client-side using a key derived from the user's password before transmission. FIREtrack servers receive only ciphertext. | PRE | Must |
| FR-09.4 | FIREtrack cannot decrypt premium user data. If a user forgets their password, their cloud data cannot be recovered (this limitation is clearly communicated during account setup). | PRE | Must |
| FR-09.5 | Premium users are required to acknowledge the zero-knowledge data loss risk during onboarding and are prompted to store a key recovery backup. | PRE | Must |
| FR-09.6 | Encryption algorithm: AES-256-GCM for data encryption. Key derivation: PBKDF2 or Argon2id from user password + salt. | PRE | Must |
| FR-09.7 | Client-side encryption implementation is published as open source on GitHub. Link is accessible from the product footer and privacy page. | BOTH | Must |
| FR-09.8 | Product publishes a browser Network Inspector guide showing users how to verify that no plaintext financial data leaves their device. | BOTH | Must |

---

### FR-10: Data Management & GDPR

| ID | Requirement | Tier | Priority |
|---|---|---|---|
| FR-10.1 | User can export all their data (transactions, assets, settings) in a standard format (JSON or CSV) at any time. | BOTH | Must |
| FR-10.2 | Premium users: upon account cancellation or deletion, all cloud data is permanently deleted within 24 hours. Deletion is irreversible and confirmed to the user. | PRE | Must |
| FR-10.3 | Product complies with GDPR. Privacy policy specifies: data retention periods, right to erasure, right to portability, and data processing purposes. | BOTH | Must |
| FR-10.4 | User can submit a GDPR data access request and receive a machine-readable copy of all data FIREtrack holds about them within 30 days. | PRE | Must |
| FR-10.5 | Free tier users: no financial data is transmitted to servers; GDPR applies only to account metadata (email, settings). | FREE | Must |

---

### FR-11: User Interface & Experience

| ID | Requirement | Tier | Priority |
|---|---|---|---|
| FR-11.1 | Primary dashboard shows: total portfolio value, FIRE number progress (%), projected retirement date (3 scenarios), real return vs CPI, and allocation breakdown. All visible above the fold. | BOTH | Must |
| FR-11.2 | Retirement date is the most prominent element on the dashboard — the north star metric. | BOTH | Must |
| FR-11.3 | All financial figures are displayed in the user's chosen base currency with currency symbol. | BOTH | Must |
| FR-11.4 | Product is responsive and functional on mobile browsers. | BOTH | Must |
| FR-11.5 | Tooltips explain domain terminology (XIRR, TWR, SWR, real return, FIRE number) in plain language on first encounter. | BOTH | Must |
| FR-11.6 | SWR default of 3.5% (not 4%) is accompanied by an educational tooltip explaining why 4% is insufficient for early retirees. | BOTH | Should |
| FR-11.7 | Column mapping interface (free tier) is visual — user drags column headers to field labels, not a dropdown-per-column form. | FREE | Should |
| FR-11.8 | AI parse confidence indicators are shown inline with parsed fields — green (high confidence), amber (review recommended), red (uncertain, requires user confirmation). | PRE | Must |

---

## 7. Non-Functional Requirements

### NFR-01: Performance
| ID | Requirement | Target |
|---|---|---|
| NFR-01.1 | Dashboard load time (after login, data cached) | < 2 seconds |
| NFR-01.2 | Document parse and import (AI, up to 500 transactions) | < 30 seconds |
| NFR-01.3 | Retirement trajectory calculation | < 1 second |
| NFR-01.4 | Monte Carlo simulation (1,000 iterations) | < 10 seconds |
| NFR-01.5 | Exchange rate and CPI data refresh | Background, non-blocking; user sees "updating" indicator |

### NFR-02: Reliability
| ID | Requirement | Target |
|---|---|---|
| NFR-02.1 | System uptime (premium cloud features) | ≥ 99.5% monthly |
| NFR-02.2 | Data integrity — no silent data loss or corruption during import | 100% |
| NFR-02.3 | Duplicate transaction detection on re-import | 100% |

### NFR-03: Security
| ID | Requirement |
|---|---|
| NFR-03.1 | All data in transit encrypted via TLS 1.3 minimum |
| NFR-03.2 | Client-side encryption applied before any financial data leaves the browser (premium tier) |
| NFR-03.3 | Zero plaintext financial data stored on FIREtrack servers |
| NFR-03.4 | Encryption code open-sourced and subject to community review |
| NFR-03.5 | Authentication: secure password hashing (bcrypt or Argon2id), no plaintext password storage |
| NFR-03.6 | Session tokens expire after 30 days of inactivity; user can invalidate all sessions from account settings |

### NFR-04: Calculation Accuracy
| ID | Requirement |
|---|---|
| NFR-04.1 | XIRR calculation matches Excel XIRR function output to 4 decimal places on reference test cases |
| NFR-04.2 | TWR calculation matches industry-standard sub-period chaining method |
| NFR-04.3 | Real return formula: `(1 + nominal) / (1 + inflation) - 1` — not simple subtraction |
| NFR-04.4 | All calculations are deterministic — same inputs always produce the same outputs |
| NFR-04.5 | Currency conversion uses ECB reference rates with date-accurate historical rates for past transactions |

### NFR-05: Scalability
| ID | Requirement |
|---|---|
| NFR-05.1 | System supports portfolios with up to 10,000 transactions without performance degradation |
| NFR-05.2 | System supports up to 50 connected/imported accounts per user |

### NFR-06: Compliance
| ID | Requirement |
|---|---|
| NFR-06.1 | GDPR compliant — privacy policy, data access requests, right to erasure, 24-hour deletion on cancellation |
| NFR-06.2 | No financial advice is given — all projections include disclaimer: "FIREtrack provides informational projections only, not financial advice" |
| NFR-06.3 | FIREtrack is a tracking tool, not a financial services provider — no regulatory authorisation required in initial markets |

### NFR-07: Browser & Device Support
| ID | Requirement |
|---|---|
| NFR-07.1 | Full functionality on Chrome, Firefox, Safari, Edge (latest 2 major versions) |
| NFR-07.2 | Responsive design — functional on mobile browsers (iOS Safari, Chrome Android) |
| NFR-07.3 | Core dashboard usable on screens ≥ 375px wide |

---

## 8. Data & Integration Requirements

### External Data Sources

| Source | Purpose | API | Cost | Update frequency |
|---|---|---|---|---|
| **Eurostat HICP API** | CPI inflation data for EU countries | REST (SDMX 2.1) | Free | Monthly |
| **World Bank Inflation API** | CPI for non-EU countries | REST | Free | Annual |
| **ECB Exchange Rate API** | EUR-based exchange rates | REST | Free | Daily |
| **Yahoo Finance / Alpha Vantage** | Stock & ETF prices, historical data | REST | Free tier | Real-time / delayed |
| **CoinGecko API** | Cryptocurrency prices | REST | Free tier | Real-time |
| **Numbeo API** | Property prices per m², rental yields by city | REST | Free tier | Monthly |
| **Market index data** | MSCI World, S&P 500, Euro Stoxx 50 benchmarks | TBD (Yahoo Finance or equivalent) | Free tier | Daily |

### Data Storage Requirements
- All transaction records must store: date, asset identifier, transaction type, quantity, price, currency, total amount, source account, import source (file/API/manual), import timestamp
- Historical exchange rates must be stored locally — not re-fetched — to ensure past calculations remain stable and reproducible
- Inflation rate used in each real return calculation must be stored alongside the result

---

## 9. Pricing & Tier Model

### Tier Definitions

| Feature | Free | Premium |
|---|---|---|
| Accounts/imports | Unlimited | Unlimited |
| File upload (CSV, Excel, PDF) | ✅ | ✅ |
| Column mapping (manual, remembered) | ✅ | ✅ |
| AI auto-parse (unlimited) | ❌ | ✅ |
| AI parse trial (1 use) | ✅ | — |
| Broker API connections | ❌ | ✅ |
| Data storage | Local (browser) | Zero-knowledge cloud |
| Cloud backup / sync | ❌ | ✅ |
| Local encrypted export | ✅ | ✅ |
| FIRE retirement trajectory | ✅ | ✅ |
| Monte Carlo simulation | ❌ | ✅ |
| Real returns (XIRR, TWR) | ✅ | ✅ |
| Benchmarking (CPI, indexes) | ✅ | ✅ |
| Custom benchmark | ❌ | ✅ |
| Real estate (manual entry) | ✅ | ✅ |
| Real estate market benchmarks | ✅ | ✅ |
| GDPR data export | ✅ | ✅ |

### Pricing

| Plan | Price | Notes |
|---|---|---|
| **Free** | $0 | Permanent free tier; local storage only |
| **Annual (default)** | **$100/year** | Headline price; $8.33/month equivalent |
| **Monthly (flexible)** | $15/month | Available for users who prefer monthly |
| **Lifetime (launch offer)** | $299 one-time | Offered to first 500 users at launch |
| **Early Adopter (first 100)** | Free for 12 months | Converts to annual rate at renewal |

---

## 10. Out of Scope (V1)

The following are explicitly excluded from V1 to maintain focus:

| Item | Rationale | Future version? |
|---|---|---|
| Tax reporting / capital gains calculations | High complexity, jurisdiction-specific, regulatory risk | V2 |
| Stock screener or investment recommendations | Outside scope; financial advice regulation risk | No |
| Social / community features (portfolio sharing, leaderboards) | Privacy-first positioning conflicts with sharing | TBD |
| Native mobile app (iOS / Android) | Web app covers mobile via responsive design; native app is significant additional investment | V2 |
| Automated financial planning / robo-advisor | Regulatory complexity; outside product positioning | No |
| Multi-user / household portfolio | Increased complexity; single-user focus for V1 | V2 |
| Pension fund API integrations (employer pensions) | Extremely fragmented, jurisdiction-specific APIs; manual entry covers V1 | V2 |
| Live portfolio alerts / notifications | Nice-to-have; not core to FIRE tracking use case | V2 |
| Detailed bond analytics (duration, yield-to-maturity) | Edge case for primary persona; bonds held via ETFs in most FIRE portfolios | V2 |

---

## 11. Constraints & Assumptions

### Constraints
| ID | Constraint |
|---|---|
| C-01 | The product must not provide personalised financial advice — all projections include an explicit disclaimer |
| C-02 | Zero-knowledge encryption means FIREtrack cannot offer password recovery for cloud data — this must be clearly communicated to users |
| C-03 | AI document parsing accuracy cannot be guaranteed for all formats — uncertain fields must always be flagged for user review, never silently accepted |
| C-04 | Free-tier data lives in the browser — if user clears browser storage, data is lost (mitigated by local encrypted export feature) |
| C-05 | Exchange rate and market price data is sourced from free APIs — availability and accuracy is subject to third-party reliability |

### Assumptions
| ID | Assumption |
|---|---|
| A-01 | Primary target market is European FIRE investors; product is designed for EUR/PLN/CZK/GBP primary users with multi-currency portfolios |
| A-02 | Users have at least one broker that can export data in CSV, Excel, or PDF format |
| A-03 | Real estate value is self-reported by users — FIREtrack does not independently value properties |
| A-04 | FIRE number calculation uses the standard Annual Expenses × 25 formula by default; users can override SWR |
| A-05 | Monte Carlo simulations use historical return distributions of the user's asset class mix, not individual securities |
| A-06 | The product is not a regulated financial service in V1 markets |

---

## 12. Open Questions & Risks

### Open Questions

| ID | Question | Owner | Needed by |
|---|---|---|---|
| OQ-01 | Which market data API (Yahoo Finance, Alpha Vantage, or other) best balances cost, reliability, and historical data depth for V1? | Architect | Architecture phase |
| OQ-02 | What is the exact encryption library to be used for zero-knowledge implementation? (e.g. Web Crypto API, libsodium.js) | Architect | Architecture phase |
| OQ-03 | How should the AI parser handle PDFs with scanned images (non-digital text)? OCR required — which provider? | Architect | Architecture phase |
| OQ-04 | What happens when a user changes their password — does cloud-encrypted data need to be re-encrypted? | Architect | Architecture phase |
| OQ-05 | Should the free tier be truly offline-first (no server calls at all) or can it make server calls for non-financial data (prices, CPI)? | PM + Architect | Architecture phase |
| OQ-06 | For the Lifetime deal ($299) — what is the break-even user lifetime assumption, and is this financially sustainable? | Founder | Pre-launch |

### Risks

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | AI parser accuracy on unknown formats below 95% target, causing user trust issues | Medium | High | Always flag uncertain fields; never silently import; user can always override; accuracy improves with usage |
| R-02 | trefolio adds FIRE retirement trajectory feature before FIREtrack reaches market | Medium | High | Speed to market is critical; launch with core trajectory + real returns even if other features are incomplete |
| R-03 | Free-tier local storage causes data loss, leading to negative reviews | Medium | Medium | Mandatory local export prompt after first import; repeated reminders; one-click local backup |
| R-04 | Zero-knowledge password loss results in permanent cloud data loss, causing support issues | Low | High | Mandatory acknowledgement during setup; clear UX around key backup; no false hope of recovery |
| R-05 | Eurostat/CoinGecko/Numbeo free API rate limits cause calculation failures at scale | Low | Medium | Cache all external data; implement fallback data sources; fail gracefully with user notification |
| R-06 | GDPR enforcement action due to misclassification of data processing activities | Low | High | Legal review of data processing before launch; clear privacy policy; no server-side financial data on free tier eliminates main risk surface |

---

*Output saved to: `_bmad-output/planning-artifacts/prd-firetrack.md`*
*Next phase: Architecture — invoke `@bmad-agent-architect` with this PRD as input.*
