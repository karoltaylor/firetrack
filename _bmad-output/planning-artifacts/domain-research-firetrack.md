# Domain Research — FIREtrack: FIRE Financial Calculations
**Analyst:** Mary, Business Analyst
**Date:** April 2026
**Purpose:** Establish domain vocabulary and calculation standards for PRD and Architecture phases
**Status:** Phase 1 Analysis Output

---

## Overview

FIREtrack's core value proposition depends on accurate financial calculations that go beyond what standard portfolio trackers provide. This document establishes the domain knowledge, terminology, formulas, and data sources the product team must understand before writing requirements.

---

## 1. Core Return Metrics

### 1.1 Time-Weighted Return (TWR / TTWROR)

**What it measures:** Investment strategy performance, independent of cash flow timing. Isolates how well the *investments themselves* performed regardless of when money was added or withdrawn.

**How it works:** Breaks the period into sub-periods at each cash flow event, calculates return for each sub-period, then compounds them together.

**Formula:**
```
TWR = [(1 + R1) × (1 + R2) × ... × (1 + Rn)] - 1
where R = return for each sub-period between cash flows
```

**When to use:** Benchmarking portfolio against market indexes (S&P 500, MSCI World). Evaluating whether investment *strategy* is working. Used by professional fund managers as the industry standard.

**FIREtrack use case:** Benchmarking user's portfolio return against inflation and market indexes. The correct metric for "is my strategy beating the market?"

---

### 1.2 Money-Weighted Return (MWR / XIRR / IRR)

**What it measures:** The investor's *personal* return — accounts for when and how much money was invested. Reflects the actual experience of the specific investor.

**How it works:** Finds the discount rate that makes the net present value of all cash flows (contributions, withdrawals, ending value) equal to zero. Identical to Excel's XIRR function.

**Formula:** Solved iteratively — the rate `r` such that:
```
Σ [Cash Flow(t) / (1 + r)^t] = 0
```

**When to use:** Tracking personal portfolio performance. Understanding what the investor *actually earned* on their capital. The correct metric for "how much did I personally make?"

**Key difference from TWR:** If a user deposits a large sum just before a market crash, their MWR will be much worse than TWR (which is unaffected by cash flow timing). TWR measures strategy quality; MWR measures personal outcome.

**FIREtrack use case:** Primary personal return metric shown to users. The answer to "how much has my money actually grown?"

**Implementation note:** FIREtrack must support XIRR calculation natively. This requires storing all cash flow events (contributions, withdrawals) with accurate dates — not just portfolio snapshots.

---

### 1.3 Compound Annual Growth Rate (CAGR)

**What it measures:** The constant annual rate at which an investment would need to grow to reach its ending value from its starting value over a given period.

**Formula:**
```
CAGR = (Ending Value / Beginning Value)^(1/years) - 1
```

**FIREtrack use case:** Simplified performance display and retirement trajectory projections. Used when cash flows are not complex.

---

## 2. Inflation-Adjusted (Real) Returns

### 2.1 Why Real Returns Are the Only Honest Metric for FIRE

Nominal returns are a vanity metric for FIRE investors. A 7% nominal return during a 5% inflation year produces only 1.9% real gain in purchasing power — the investor is barely moving forward. The S&P 500 averaged 10.5% nominal returns from 1970–2023, but only 6.2% real returns after 4.3% average inflation. The gap is $1.4M in lost purchasing power on a $10,000 initial investment.

**FIREtrack must always show real returns as the primary metric alongside nominal returns.**

### 2.2 Real Return Formula

```
Real Return = [(1 + Nominal Return) / (1 + Inflation Rate)] - 1
```

*Note: This is not simply Nominal - Inflation. The correct formula compounds properly.*

**Example:** 7.16% nominal return, 3% inflation:
```
(1.0716 / 1.03) - 1 = 4.04% real return
```

### 2.3 Inflation Data Sources

**For European users (primary target):**

| Source | Coverage | Update frequency | Access | Cost |
|---|---|---|---|---|
| **Eurostat HICP API** | All EU countries, harmonised | Monthly | REST API (SDMX 2.1 / JSON-stat) | Free |
| **Eurostat Statistics API** | EU-wide | Updated 2x daily | REST API | Free |
| **ECB Data Portal** | Eurozone HICP | Monthly | REST API | Free |

**Eurostat HICP API base URL:**
```
https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/
```

Dataset code for HICP: `prc_hicp_mmor` (monthly rates) or `prc_hicp_aind` (annual index)

**For global users:**
| Source | Coverage | Access |
|---|---|---|
| World Bank Inflation API | Global, country-level | Free REST API |
| OECD CPI data | OECD members | Free API |
| US BLS CPI (bls.gov) | United States | Free API |

**Implementation note:** FIREtrack should store the inflation rate used in each calculation so users can see which CPI data was applied. Users in Poland use Polish CPI (from Eurostat HICP), not EU average.

---

## 3. FIRE Number & Retirement Trajectory

### 3.1 The FIRE Number

The fundamental calculation for all FIRE planning:

```
FIRE Number = Annual Expenses × 25
```

Based on the 4% Safe Withdrawal Rate rule (see section 4). A user who spends €40,000/year needs €1,000,000 invested to retire.

**FIREtrack must allow users to input their target annual retirement expenses to calculate their personal FIRE number.**

### 3.2 FIRE Variants — All Must Be Supported

| Variant | Definition | FIRE Number formula | FIREtrack display |
|---|---|---|---|
| **Lean FIRE** | Minimal lifestyle, under €40K/yr expenses | Annual expenses × 25 | Standard trajectory to lean target |
| **Fat FIRE** | Comfortable lifestyle, €100K+/yr expenses | Annual expenses × 25 | Standard trajectory to fat target |
| **Coast FIRE** | Enough invested now to reach FIRE at traditional retirement age without further contributions | Calculated backward from target FIRE number at 65 using compound growth | "Coast point reached" milestone |
| **Barista FIRE** | Portfolio covers partial expenses; part-time work covers the gap | (Full expenses - PT income) × 25 | Trajectory to partial independence |

**FIREtrack should display which FIRE variant the user is on track for, not just a single binary "FIRE achieved/not achieved."**

### 3.3 Retirement Date Trajectory Calculation

FIREtrack's core output — the retirement date — requires projecting future portfolio value based on:

1. **Current portfolio value** (from imported/connected accounts)
2. **Monthly contribution** (user-defined or derived from transaction history)
3. **Expected annual return** (user-defined or defaulted to conservative real return, e.g. 5% real)
4. **Target FIRE number** (derived from annual expenses × 25)

**Future Value formula with regular contributions:**
```
FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]

where:
PV = current portfolio value
r = monthly return rate (annual rate / 12)
n = number of months
PMT = monthly contribution
```

Solve for `n` to find retirement date.

**Important:** FIREtrack should offer multiple scenarios:
- **Conservative:** 4% real annual return
- **Moderate:** 6% real annual return
- **Optimistic:** 8% real annual return (historical S&P 500 real average)

---

## 4. Safe Withdrawal Rate (SWR)

### 4.1 The 4% Rule

**Origin:** 1998 Trinity Study. Based on historical US market data 1926–1995 with a 30-year retirement horizon.

**Rule:** Withdraw 4% of initial portfolio value in year 1, then adjust for inflation each year. The portfolio has historically survived 30-year periods at this rate with ~95% success.

**2026 update:** Morningstar recommends 3.9% for 30-year retirement at 90% success probability. Minor change from the original 4%.

### 4.2 Why 4% Is Wrong for FIRE Investors

FIRE investors retire early, meaning **50–60 year retirement horizons** — not 30. The 4% rule breaks down significantly:

| Retirement horizon | 4% rule success rate |
|---|---|
| 30 years (traditional retirement) | ~95% |
| 40 years | ~85% |
| 50 years | ~75–80% |
| 60 years | ~70–75% |

**Additionally:** Current CAPE (Cyclically Adjusted P/E) ratio around 31–32 (vs historical average 17) suggests higher valuations mean lower expected future returns. More conservative withdrawals (3–3.5%) may be appropriate.

**FIREtrack implication:** Do not default to 4% SWR for FIRE users. Default to 3.5% for early retirees (under 50) and show the impact of different rates. Educate users that 4% is a traditional retirement rule, not a FIRE rule.

### 4.3 Flexible SWR Strategies

Users willing to adjust spending based on market conditions can safely use higher rates:
- **Constant percentage method:** Withdraw fixed % of current portfolio (not original value). Spending fluctuates but portfolio rarely depleted.
- **Guardrails strategy:** Set upper and lower withdrawal guardrails (e.g. 5% and 3.5%). Adjust spending when portfolio crosses thresholds.
- **Endowment method:** 10-year rolling average withdrawal (~5.4% rate).

**FIREtrack should support at minimum:** Fixed rate (classic), and optionally flexible/guardrails as a premium feature.

---

## 5. Sequence of Returns Risk

### 5.1 What It Is

The danger that poor returns in the **early years of retirement** permanently damage portfolio longevity — even if average long-term returns are acceptable.

**Example:** Two portfolios both average 6% over 20 years. One has good early returns, then bad late returns. The other has bad early returns, then good late. After 20 years of withdrawals, the second portfolio can have $150,000+ less despite identical averages.

This is the single greatest risk for FIRE investors who retire decades early. A crash in year 1 of retirement forces selling equities at depressed prices, permanently reducing the capital base.

### 5.2 Why FIREtrack Must Model This

Standard retirement calculators use average expected returns. This produces dangerously optimistic projections. FIREtrack should:

1. **Show Monte Carlo simulations** — run thousands of possible return sequences and show the distribution of outcomes (e.g. "90% chance of reaching your FIRE number by age 50, 50% chance by age 47").
2. **Flag sequence of returns risk** — when a user's trajectory relies on sustained high returns early in retirement, surface a warning.
3. **Show portfolio survivability** — given the user's current trajectory, what is the probability their portfolio lasts until age 90?

**Implementation note:** Monte Carlo simulation is a premium feature. It requires storing historical return distributions for the user's asset classes. This is complex but is the most accurate retirement modelling approach available.

---

## 6. Asset Allocation Concepts

### 6.1 Standard FIRE Allocation Framework

Most FIRE investors follow evidence-based passive investing (index funds). FIREtrack should understand and display these standard allocations:

| Phase | Typical allocation | Rationale |
|---|---|---|
| **Accumulation (early FIRE, age 25–45)** | 80–100% equities, 0–20% bonds | Maximise growth; long time horizon |
| **Near retirement (5 years before target)** | 70% equities, 30% bonds | Begin reducing sequence of returns risk |
| **Early retirement (FIRE achieved)** | 60% equities, 40% bonds | Classic "Boglehead" allocation for longevity |

### 6.2 Geographic Diversification

European FIRE investors specifically care about:
- **Home country bias** — overweighting domestic stocks
- **Currency risk** — EUR-denominated vs USD-denominated holdings
- **Developed vs emerging markets** — MSCI World (developed) vs MSCI EM split

FIREtrack should display geographic allocation breakdown and flag excessive home country bias.

### 6.3 Asset Classes FIREtrack Must Support

| Asset class | Data source | Import method |
|---|---|---|
| Stocks & ETFs | Yahoo Finance, Alpha Vantage, or similar market data API | Broker CSV/API import |
| Bonds | Market data API | Broker CSV/API import |
| Cryptocurrency | CoinGecko API (free tier available) | Exchange CSV export |
| Real estate | Manual entry + Numbeo/Eurostat market data | Manual with market enrichment |
| Pension/retirement accounts | Manual entry or employer CSV export | File upload |
| Cash/savings | Manual entry | Manual |

---

## 7. Key Benchmarks to Support

FIREtrack must allow users to benchmark their portfolio against:

| Benchmark | Description | Data source |
|---|---|---|
| **CPI (local)** | User's local inflation rate — the primary "are you beating inflation?" benchmark | Eurostat HICP API |
| **MSCI World (ACWI)** | Global developed market equity benchmark | Market data API |
| **S&P 500** | US large-cap equity benchmark | Market data API |
| **Euro Stoxx 50** | European blue-chip benchmark | Market data API |
| **Custom benchmark** | User-defined blend (e.g. 80% MSCI World / 20% bonds) | User-configured |

**FIREtrack's key insight:** Most tools benchmark against market indexes. FIREtrack's primary benchmark must be **CPI/inflation** — because beating the market is irrelevant if you're not beating inflation.

---

## 8. Glossary of Key Terms

| Term | Definition |
|---|---|
| **FIRE Number** | Annual retirement expenses × 25. The portfolio value needed to retire. |
| **SWR (Safe Withdrawal Rate)** | The percentage of portfolio value that can be withdrawn annually without depleting it. Default: 4% (30yr), 3.5% (50yr+). |
| **XIRR** | Extended Internal Rate of Return. The personal return metric accounting for cash flow timing. Excel-compatible. |
| **TWR (TTWROR)** | Time-Weighted Return. The strategy return metric used for benchmarking. Standard in professional fund reporting. |
| **Real return** | Inflation-adjusted return. Formula: (1 + nominal) / (1 + inflation) - 1. |
| **HICP** | Harmonised Index of Consumer Prices. Eurostat's standardised European inflation measure. |
| **CAPE** | Cyclically Adjusted Price/Earnings ratio. Predicts future expected returns. High CAPE = lower expected future returns. |
| **Sequence of returns risk** | The risk that poor early-retirement returns permanently damage portfolio longevity despite acceptable averages. |
| **Coast FIRE** | The point at which no further contributions are needed — compound growth alone will reach the FIRE number by traditional retirement age. |
| **Lean FIRE** | FIRE achieved on minimal expenses (<€40K/yr). High savings rate, simple lifestyle. |
| **Fat FIRE** | FIRE achieved on high expenses (€100K+/yr). Requires larger portfolio. |
| **Barista FIRE** | Semi-retirement where portfolio covers partial expenses and part-time work covers the rest. |
| **Monte Carlo simulation** | Statistical method running thousands of market scenarios to show probability distribution of retirement outcomes. More accurate than average-return calculators. |
| **Asset allocation** | The percentage split of a portfolio across asset classes (equities, bonds, real estate, cash, crypto). |
| **Home country bias** | The tendency to overweight domestic stocks relative to a globally diversified portfolio. Carries additional concentration risk. |
| **DRIP** | Dividend Reinvestment Plan. Automatically reinvesting dividends to compound returns. |

---

## 9. Implications for PRD

This domain research has direct implications for the Product Requirements Document:

1. **TWR and XIRR are both required** — not optional. TWR for benchmarking; XIRR for personal return. Both are standard expectations in the FIRE community.
2. **Real return must be the primary displayed metric** — not nominal. Always show both, with real as the headline number.
3. **Retirement date calculation must use conservative real return assumptions** — not nominal. Default to 5% real annual return with user-adjustable scenarios.
4. **SWR must default to 3.5% for early retirees** — not 4%. The product targets FIRE investors with 50+ year horizons where 4% is unsafe.
5. **Monte Carlo simulation is a premium feature** — complex to build but critical for credibility with sophisticated FIRE investors. Include in requirements as Phase 2.
6. **Eurostat HICP API is the inflation data source for European users** — free, official, REST-accessible. No licensing required.
7. **CoinGecko API covers crypto pricing** — free tier available.
8. **FIRE variants (Lean, Fat, Coast, Barista) must all be represented** — the product should show users which variant they are on track for, not just a binary FIRE achieved/not achieved.

---

*Output saved to: `_bmad-output/planning-artifacts/domain-research-firetrack.md`*
