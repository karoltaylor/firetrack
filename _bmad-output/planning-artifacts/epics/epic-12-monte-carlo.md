# Epic 12: Monte Carlo Simulation (Premium)
**Priority:** P2 — Valuable for serious FIRE planners; differentiated vs competitors
**PRD refs:** FR-06.4, FR-06.5
**Arch refs:** Web Worker, probability distribution visualisation, sequence of returns risk

## Goal
Run statistically-rigorous Monte Carlo simulations entirely in the browser (Web Worker) to give premium users probabilistic retirement outcomes. Shows the range of possible futures, not just linear projections. Sequence of returns risk is explicitly surfaced.

## Stories

---

### Story 12.1 — Monte Carlo Engine (Web Worker)
**As a** developer,
**I want** a Monte Carlo simulation that runs in a Web Worker without blocking the UI,
**so that** users get statistically meaningful projections without freezing their browser.

**Acceptance Criteria:**
- [ ] `packages/calculations/src/monteCarlo.worker.ts` implements simulation
- [ ] Simulation runs 1,000 scenarios by default (configurable 100–10,000)
- [ ] Each scenario: 30-year monthly simulation drawing real return from N(μ, σ) where μ and σ derived from user's historical returns or asset class defaults
- [ ] Monthly sequence: apply random return, apply contribution, calculate new portfolio value
- [ ] SWR phase (post-retirement): switch from accumulation to withdrawal, apply SWR drawdown
- [ ] Output: for each percentile (10th, 25th, 50th, 75th, 90th): retirement date + probability of not running out of money by age 90
- [ ] Worker communicates progress (0–100%) back to main thread for progress bar
- [ ] 1,000 scenarios completes in < 3 seconds on average device (P50 target)
- [ ] Test: with identical seed, deterministic output

**Technical notes:**
- Web Worker via `Comlink` library for clean async interface
- Park-Miller LCG PRNG seeded with `crypto.getRandomValues` for randomness

---

### Story 12.2 — Monte Carlo Results Visualisation
**As a** premium user,
**I want** to see my Monte Carlo results as a probability fan chart,
**so that** I can understand the range of possible retirement outcomes.

**Acceptance Criteria:**
- [ ] Fan chart: each percentile band shown as a shaded area (Recharts `AreaChart`)
- [ ] Bands: 10th–90th (full range), 25th–75th (likely range), median (50th) as solid line
- [ ] Bands colour-coded: green (75th–90th), amber (25th–75th), red (10th–25th)
- [ ] X-axis: timeline to target retirement age; Y-axis: portfolio value
- [ ] Horizontal FIRE number line
- [ ] Key callouts: "In 80% of simulations, you retire by {date}" and "In the worst 10% of scenarios, your portfolio depletes by age {age}"
- [ ] Controls: adjust expected return (slider), contribution (reuses Story 4.8 slider), retirement age
- [ ] "Run again" button re-runs with fresh random seed (shows variability)
- [ ] Progress indicator during simulation run

---

### Story 12.3 — Sequence of Returns Risk Warning
**As a** user close to or at retirement,
**I want** to understand sequence of returns risk and how it could affect me,
**so that** I can make informed decisions about early retirement timing.

**Acceptance Criteria:**
- [ ] Sequence of returns risk check: if user within 5 years of FIRE date, show alert panel
- [ ] Alert explains: "The first 5 years of your retirement are critical. A market downturn early in retirement can permanently damage your portfolio."
- [ ] Glide path recommendation: if equity allocation > 80% and within 5 years of FIRE: amber warning shown
- [ ] "Stress test" button: reruns Monte Carlo with first 3 years returning -30% each (worst case scenario)
- [ ] Stress test result shows probability of portfolio recovery vs depletion
- [ ] Safe withdrawal rate sensitivity: show how portfolio survival probability changes at 3%, 3.5%, 4%, 4.5% SWR
