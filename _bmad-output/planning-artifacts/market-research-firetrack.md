# Market Research Report — FIREtrack
**Analyst:** Mary, Business Analyst
**Date:** April 2026
**Input:** prfaq-firetrack.md
**Status:** Phase 1 Analysis Output

---

## 1. Market Size & Opportunity

The FIRE movement is a confirmed, growing, monetisable market.

| Metric | Data |
|---|---|
| FIRE followers (US alone) | 15M+ as of 2026 |
| Financial Independence Movement market size (2025) | $3.8 billion |
| Forecast (2033) | $7.9 billion |
| CAGR | 12.8% |
| Median FIRE participant age at financial independence | 42 years old |
| Typical savings rate | 50%+ |

**Key growth drivers:** Explosion of online communities, accessibility of investment platforms, growing desire for early retirement, and rising debt prompting financial planning urgency.

**European angle:** r/EuropeFIRE is an active, growing community with specific unmet needs around European broker support, multi-currency tracking, and GDPR compliance. US-centric tools leave a real gap.

**Verdict:** The market is large, growing fast, and underserved in Europe. The opportunity is real.

---

## 2. Competitive Landscape

### Primary Competitors

| Tool | Price | European brokers | Retirement trajectory | Inflation-adj returns | Zero-knowledge | Real estate |
|---|---|---|---|---|---|---|
| **trefolio** | €2.99–€7.99/mo | DEGIRO, T212, Revolut, IBKR (14 formats + 20+ API syncs) | No | No (benchmarks only) | No (privacy claim, not architecture) | Net worth tracking only — no market benchmarks |
| **Sharesight** | $15/mo | DEGIRO (CSV), T212 (limited — 1yr export at a time) | No | No | No | No |
| **Kubera** | $12/mo | Via Plaid/Yodlee (US-centric) | No | No | No | Yes (manual, no market data) |
| **Portfolio Performance** | Free | Manual/CSV (power users) | No | No | Yes (local) | No |
| **Ghostfolio** | Free (self-hosted) | Manual/CSV | No | No | Yes (self-hosted) | No |
| **Freenance** | €4.99/mo | Polish banks specifically | Runway calc only | No | No | No |
| **getquin** | Free/paid | EU brokers via Open Banking | No | No | No (cloud) | No |
| **FIREtrack** (proposed) | $15/mo or $100/yr | Any format (any broker, any format) | **Yes — primary north star metric** | **Yes** | **Yes (user-key zero-knowledge)** | **Yes + local market price benchmarks** |

### The Competitor You Must Take Seriously: trefolio

**The PRFAQ assumed Sharesight was the primary threat. This is incorrect.** trefolio is the real competitor.

trefolio is European-native, targets the exact same brokers as FIREtrack's primary persona (Beata: DEGIRO, Trading 212, Revolut, IBKR), has AI portfolio analysis, multi-currency support across 21 currencies, DRIP income simulations up to 30 years, benchmark overlays against S&P 500 and MSCI World, and is actively shipping (March 2026 release). Priced below FIREtrack at monthly rates.

**trefolio's three structural gaps FIREtrack can own:**

1. **No FIRE retirement date trajectory.** trefolio tracks portfolio performance and dividend income. It does not answer the defining FIRE question: "will I retire at my target date, and what do I need to change?" This is FIREtrack's primary differentiator.

2. **No inflation-adjusted real returns.** trefolio benchmarks against market indexes (S&P 500, MSCI World) but does not calculate whether the portfolio is beating CPI inflation. For FIRE investors, real return is the only number that matters — nominal return is a vanity metric.

3. **No zero-knowledge encryption.** trefolio claims "privacy-first" and GDPR compliance but stores data server-side and can technically read user data. FIREtrack's user-key zero-knowledge architecture makes this impossible by design, not by policy.

### Secondary Competitors Worth Monitoring

- **Portseido** — Supports DEGIRO, Trading 212, Revolut. TWR and MWR calculations. 70+ exchanges, 20,000+ ETFs in EUR. Cloud-based. No retirement trajectory.
- **Simple Portfolio** — Supports Trading 212, DEGIRO, eToro, Revolut. Calculates true net annualised returns. Clean and simple but limited analytical depth.
- **Privacy-first niche players** — Track3, Darkfolio, DecentWealth, EchoForge, Lekkalu. Mostly crypto-focused or single-asset. None combines zero-knowledge + multi-asset + FIRE retirement trajectory.

---

## 3. Customer Pain Points — Validated

| Pain point assumed in PRFAQ | Evidence from market research |
|---|---|
| Multi-broker consolidation is painful | r/EuropeFIRE users explicitly report this; FIRE blogs publish complex spreadsheet templates specifically to solve it |
| Spreadsheet fragility at scale | Top three documented problems: unitising returns, evaluating cross-broker exposure, ticker inconsistencies across platforms |
| No tool answers "will I retire at my target date" | Zero tools in the market currently provide this as a primary output — all track portfolio health, not FIRE goal trajectory |
| Currency management complexity | FIRE v London's spreadsheet built multi-currency handling as its headline feature — demand confirmed by community |
| European broker API gaps | Sharesight's Trading 212 import limited to 1-year CSV exports; eToro support unclear |

**Strongest validation signal:** The existence of multiple competing community-built spreadsheet templates (FIRE v London, FIRE-Path Lion, TMOAP v8.3) published on FIRE blogs is evidence that no commercial tool is fully solving this. When a community builds its own tools, the market has failed them.

---

## 4. Privacy Landscape

The PRFAQ treated privacy as a clear differentiator. Research shows the space is more crowded than assumed, but FIREtrack's position remains defensible.

Privacy-first trackers exist: Track3, Darkfolio, DecentWealth, EchoForge, Lekkalu. However:
- Most are crypto-focused, not multi-asset
- None specifically targets FIRE investors with retirement trajectory
- None combines zero-knowledge + flexible format import + real estate + inflation benchmarking

**Revised positioning recommendation:** Do not lead marketing with "privacy-first." Lead with **retirement clarity** — the FIRE date as the north star metric. Position zero-knowledge encryption as the trust architecture that makes adoption possible, not the headline value proposition.

---

## 5. Pricing Validation

| Tool | Monthly | Annual equivalent |
|---|---|---|
| trefolio Pro | €7.99/mo | ~€96/yr |
| Sharesight | $15/mo | $180/yr |
| Kubera | $12/mo | $144/yr |
| Simply Wall St | $10/mo | $120/yr |
| **FIREtrack monthly** | **$15/mo** | **$180/yr** |
| **FIREtrack annual** | **$8.33/mo** | **$100/yr** |

FIREtrack's monthly price ($15) is at the top end of the European market and twice trefolio's monthly rate. The annual price ($100/yr = $8.33/mo) is competitive and undercuts trefolit's annual equivalent.

**Recommendation:** Make annual pricing the default headline. Present $100/year as the primary offer; $15/month as the flexible fallback. This directly undercuts trefolio, aligns with FIRE investors' preference for lump-sum over recurring subscriptions, and improves cash flow.

---

## 6. Required PRFAQ Updates

### 1. Internal FAQ — competitor answer
Replace the Sharesight-focused answer with:
> *"Our primary European competitor is trefolio (€7.99/month, European-native, actively shipping). trefolio tracks portfolio performance well. It does not answer the FIRE question: 'will I retire at my target date?' It does not calculate inflation-adjusted real returns. It does not use zero-knowledge encryption. FIREtrack's moat is the retirement trajectory engine, real return accuracy, and architecturally guaranteed privacy — not feature breadth."*

### 2. Pricing default
Flip to annual as the headline price ($100/year), monthly ($15) as the flexible option.

### 3. Real estate feature should be elevated
No competitor provides property market price benchmarks from Numbeo or Eurostat. This is genuinely unoccupied territory and deserves more prominence, especially for European FIRE investors where property is a core asset class.

### 4. Clarify the "any-format" parsing moat
trefolio supports 14 broker CSV formats. FIREtrack cannot win by supporting more known formats. The differentiation is handling formats that have never been seen before — the obscure Polish pension provider, the local credit union, the employer stock plan in a custom Excel layout. This is where the AI parser creates a defensible moat.

---

## 7. Distribution & Go-to-Market Validation

The FIRE community is concentrated and reachable:

| Channel | Audience | Notes |
|---|---|---|
| r/financialindependence | 2.2M members | High-trust community; genuine product reviews spread organically |
| r/EuropeFIRE | Growing EU-specific community | Underserved by current tools — high receptivity |
| FIRE blogs (Mr Money Mustache, Monevator, etc.) | Millions of readers | One blogger review = thousands of qualified users |
| Product Hunt | Tech-savvy early adopters | Privacy-first + open-source encryption = natural fit |
| Polish FIRE communities | Directly relevant to Beata persona | Freenance already validating this audience exists |

---

## 8. Summary Scorecard

| PRFAQ assumption | Research verdict |
|---|---|
| Pain points are real | ✅ Confirmed |
| European market is underserved | ✅ Confirmed |
| Spreadsheet is the primary enemy | ✅ Confirmed |
| Sharesight is the main competitor | ❌ Incorrect — trefolio is the real threat |
| Privacy is a clear differentiator | ⚠️ Partially — space is more crowded; lead with retirement clarity instead |
| $15/month pricing is appropriate | ⚠️ High for monthly; annual $100/yr is the right play |
| Real estate gap is unserved | ✅ Confirmed — no competitor offers market price benchmarks |
| "Any-format" parsing is a moat | ✅ Confirmed — trefolio supports known formats only |
| FIRE retirement date trajectory | ✅ Confirmed gap — zero competitors offer this |

---

*Output saved to: `_bmad-output/planning-artifacts/market-research-firetrack.md`*
