# FIREtrack — Epics & Stories Index
**Product Manager:** John  
**Source documents:** `prd-firetrack.md`, `architecture-firetrack.md`  
**Created:** April 2026

---

## Priority Overview

| Priority | Meaning | Epics |
|---|---|---|
| **P0** | Must ship for V1 launch | Epics 1–5 |
| **P1** | Core premium features — complete V1 value proposition | Epics 6–10 |
| **P2** | Differentiating premium features — V1.5 / V2 | Epics 11–13 |

---

## Epic Summary

| # | Epic | Priority | Stories | Key Personas |
|---|---|---|---|---|
| 1 | [Foundation — Project Setup & Auth](epic-01-foundation.md) | P0 | 6 | All |
| 2 | [Free Tier Local Data Layer](epic-02-local-data.md) | P0 | 5 | Beata, Tomasz |
| 3 | [File Import — CSV & Excel](epic-03-file-import.md) | P0 | 5 | Beata, Tomasz |
| 4 | [Calculation Engine](epic-04-calculation-engine.md) | P0 | 9 | All |
| 5 | [Dashboard & Portfolio UI](epic-05-dashboard.md) | P0 | 7 | All |
| 6 | [External Data Integrations](epic-06-external-data.md) | P1 | 5 | All |
| 7 | [Digital PDF Import](epic-07-pdf-import.md) | P1 | 2 | Beata, Miriam |
| 8 | [Zero-Knowledge Cloud Sync](epic-08-zero-knowledge-sync.md) | P1 | 5 | Tomasz, Miriam |
| 9 | [AI Document Parsing](epic-09-ai-parsing.md) | P1 | 4 | Beata, Miriam |
| 10 | [Subscriptions & Payments](epic-10-subscriptions.md) | P1 | 5 | All |
| 11 | [Real Estate Tracking](epic-11-real-estate.md) | P2 | 3 | Beata |
| 12 | [Monte Carlo Simulation](epic-12-monte-carlo.md) | P2 | 3 | Tomasz, Miriam |
| 13 | [Broker API Connections](epic-13-broker-apis.md) | P2 | 4 | Beata, Miriam |

**Total stories: 63**

---

## Story Count by Priority

| Priority | Stories | Estimated dev effort (1 dev) |
|---|---|---|
| P0 (V1 MVP) | 32 stories | ~6–8 weeks |
| P1 (V1 launch-complete) | 21 stories | ~5–7 weeks |
| P2 (V1.5) | 10 stories | ~3–4 weeks |

---

## North Star Metric Traceability

The product's north star is **"Time to see your retirement date"**. This traces to:

1. **Auth (Epic 1) →** user can log in
2. **Local Data + File Import (Epics 2, 3) →** user can get transactions in
3. **Calculation Engine (Epic 4) →** FIRE trajectory calculated
4. **Dashboard (Epic 5) →** retirement date displayed prominently

A new user completing Stories 1.3 (Register), 1.6 (FIRE Goal), 3.1–3.4 (Import CSV) should see their retirement date **within 5 minutes of signing up.**

---

## Deferred to V2

The following PRD items are explicitly out of scope for V1 and V1.5:

- Pension fund integration (DB/DC scheme-specific calculations)
- Tax reporting / capital gains statements
- Social sharing or advisor sharing
- Mobile native apps (iOS/Android)
- Revolut Open Banking OAuth (Story 13.4 covers file export for V1)
- Custom benchmark creation
- Multi-currency FIRE goal (e.g. FIRE in Thailand on Polish income)
