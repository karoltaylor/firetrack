# FIREtrack — Sprint Plan
**Product Manager:** John  
**Source:** epics-index.md, prd-firetrack.md, architecture-firetrack.md  
**Created:** April 2026

---

## ⚠️ Hard Rule Before Any Feature Code Is Written

> **Sprint 0 must be fully completed and all checks verified green before any developer writes a single line of feature code.**  
> Pull requests will be rejected by CI until Sprint 0 is done. This is enforced automatically, not on trust.

---

## Sprint 0: Repository & Developer Tooling
**Duration:** 3–4 days  
**Goal:** GitHub repository exists, branch protection is active, all git hooks run locally, CI pipeline is green on an empty commit, and every developer can run the monorepo locally.  
**Definition of Done:** A test PR (empty commit or trivial change) passes all checks end-to-end.

### Stories

#### S0.1 — GitHub Repository Setup
- [ ] Create GitHub organisation `firetrack-app` (or personal repo for solo founder phase)
- [ ] Create repository `firetrack` — **private**
- [ ] Add `README.md` with: project description, local setup instructions, tech stack summary
- [ ] Add `.gitignore` for Node.js, Next.js, Prisma, `.env`, Turborepo, pnpm
- [ ] Add `LICENSE` (MIT)
- [ ] Add root monorepo config: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`, `.npmrc`
- [ ] Add root quality config: ESLint and Prettier
- [ ] Scaffold `apps/web`, `services/api`, `packages/types`, `packages/calculations`, `packages/crypto`, `packages/parsers`
- [ ] Add `.env.example` and `docker-compose.yml` for local PostgreSQL 16 + Redis 7
- [ ] Verify `pnpm install`, `turbo build`, `turbo test`, and `turbo typecheck`
- [ ] Manual follow-up: invite collaborators with **Write** role (not Admin) if needed
- [ ] Create default branches: `main` (production), `develop` (integration)

#### S0.2 — Branch Protection Rules
Configure in GitHub Settings → Branches for both `main` and `develop`:

| Rule | `main` | `develop` |
|---|---|---|
| Require PR before merging | ✅ | ✅ |
| Require 1 approving review | ✅ | ✅ (can be 0 for solo) |
| Dismiss stale reviews on new push | ✅ | ✅ |
| Require status checks to pass | ✅ (all CI checks) | ✅ (all CI checks) |
| Require branches to be up to date before merging | ✅ | ✅ |
| Restrict force pushes | ✅ | ✅ |
| Restrict deletions | ✅ | ✅ |
| Require linear history (no merge commits) | ✅ | Optional |

- [ ] All rules applied to `main`
- [ ] All rules applied to `develop`
- [ ] Verified: direct push to `main` is rejected
- [ ] Verified: direct push to `develop` is rejected

#### S0.3 — Git Hooks (Local — Husky + lint-staged)
- [ ] `husky` installed as dev dependency
- [ ] `lint-staged` installed as dev dependency
- [ ] `commitlint` + `@commitlint/config-conventional` installed
- [ ] `.husky/pre-commit` hook runs: `lint-staged` (ESLint + Prettier on staged files only)
- [ ] `.husky/commit-msg` hook runs: `commitlint` — enforces Conventional Commits format
- [ ] `.husky/pre-push` hook runs: `turbo test` (all unit tests must pass before push)
- [ ] `lint-staged` config in `package.json`:
  ```json
  {
    "lint-staged": {
      "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
      "*.{json,md,yaml}": ["prettier --write"]
    }
  }
  ```
- [ ] Conventional Commits format enforced:
  - `feat:` — new feature
  - `fix:` — bug fix
  - `chore:` — tooling, config
  - `test:` — tests only
  - `docs:` — documentation
  - `refactor:` — code change with no feature/fix
  - `perf:` — performance improvement
  - `ci:` — CI/CD changes
  - Scope optional but encouraged: `feat(auth): add JWT refresh`
- [ ] Verified: commit with message `"did a thing"` is rejected by commitlint
- [ ] Verified: commit with message `"feat(auth): add login endpoint"` is accepted
- [ ] Verified: file with ESLint error is caught by pre-commit hook

#### S0.4 — CI Pipeline (GitHub Actions)
Create `.github/workflows/ci.yml`:

- [ ] Trigger: every push to any branch, every PR to `main` or `develop`
- [ ] Jobs (run in parallel where possible):

  **Job 1: `lint`**
  - Checkout code
  - Install deps (`pnpm install --frozen-lockfile`)
  - Run `turbo lint` — ESLint across all packages
  - Run `turbo format:check` — Prettier check (no auto-fix in CI)
  - Run `turbo typecheck` — TypeScript `tsc --noEmit`

  **Job 2: `test`**
  - Checkout code
  - Install deps
  - Run `turbo test` — Vitest unit tests across all packages
  - Upload coverage report to Codecov (optional but recommended)

  **Job 3: `build`**
  - Checkout code
  - Install deps
  - Run `turbo build` — verify everything compiles
  - Verify `prisma validate` passes (schema is valid)

- [ ] All 3 jobs required as status checks in branch protection (S0.2)
- [ ] CI completes in < 5 minutes for a clean monorepo (target)
- [ ] Verified: a PR with a TypeScript error fails `typecheck` job and blocks merge
- [ ] Verified: a PR with a failing test fails `test` job and blocks merge

#### S0.5 — PR Template
Create `.github/pull_request_template.md`:

```markdown
## What does this PR do?
<!-- One sentence description -->

## Epic / Story
<!-- e.g. Epic 1 / Story 1.3 — User Registration -->

## Type of change
- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] refactor — no feature/fix
- [ ] test — tests only
- [ ] chore — tooling/config
- [ ] docs — documentation only

## Checklist
- [ ] Unit tests added / updated
- [ ] No new ESLint warnings
- [ ] Acceptance criteria from the story are met
- [ ] Self-reviewed the diff before requesting review
- [ ] No hardcoded secrets, API keys, or passwords
- [ ] No `console.log` left in production code
```

- [ ] Template appears automatically on every new PR
- [ ] Verified: new PR draft shows the template

#### S0.6 — Secrets & Environment Variables
- [ ] GitHub Actions Secrets configured (Settings → Secrets and variables → Actions):
  - `DATABASE_URL` — PostgreSQL connection string for CI test DB
  - `JWT_SECRET` — for test environment
  - `OPENAI_API_KEY` — for integration tests (optional in CI, can mock)
- [ ] `.env.example` committed to repo with all required variables and placeholder values
- [ ] `.env` and `.env.local` added to `.gitignore`
- [ ] Verified: no `.env` file present in initial commit
- [ ] Developer setup doc in README: "Copy `.env.example` to `.env.local` and fill in values"

#### S0.7 — Local Development Setup Verification
Every developer must run these and confirm they pass before starting feature work:

```bash
# 1. Clone and install
git clone git@github.com:firetrack-app/firetrack.git
cd firetrack
pnpm install

# 2. Start local services
docker-compose up -d   # starts postgres + redis

# 3. Run migrations
pnpm --filter api prisma migrate dev

# 4. Verify CI jobs locally
turbo lint
turbo typecheck
turbo test
turbo build

# 5. Test a bad commit (should be rejected)
git commit -m "bad commit message"   # should fail commitlint
```

- [ ] All 5 steps pass on macOS / Linux
- [ ] All 5 steps pass on Windows (PowerShell)
- [ ] `docker-compose.yml` committed to repo root
- [ ] README documents the full setup process

---

## Sprint 1: Foundation (Epic 1)
**Duration:** 1 week  
**Prerequisite:** Sprint 0 complete and verified ✅  
**Goal:** Working monorepo, database schema, auth endpoints, FIRE goal wizard. A developer can register, log in, and set a FIRE goal.

| Story | Description | Points |
|---|---|---|
| 1.1 | Monorepo & shared package scaffold | 3 |
| 1.2 | Database schema & Prisma setup | 3 |
| 1.3 | User registration | 2 |
| 1.4 | User login | 2 |
| 1.5 | JWT refresh & session management | 3 |
| 1.6 | FIRE goal onboarding wizard | 3 |
| **Total** | | **16** |

**Sprint 1 Definition of Done:** User can register, log in, refresh session, and complete the FIRE goal wizard. All acceptance criteria pass. No outstanding ESLint errors. CI is green.

---

## Sprint 2: Local Data + File Import (Epics 2 & 3)
**Duration:** 1.5 weeks  
**Prerequisite:** Sprint 1 complete ✅  
**Goal:** Users can store transactions locally and import from CSV/Excel files.

| Story | Description | Points |
|---|---|---|
| 2.1 | Dexie.js database schema | 2 |
| 2.2 | Account management | 2 |
| 2.3 | Manual transaction entry | 3 |
| 2.4 | Local encrypted backup export | 3 |
| 2.5 | Data export (GDPR portability) | 2 |
| 3.1 | File upload component | 2 |
| 3.2 | Column mapping interface | 5 |
| 3.3 | Column mapping memory | 3 |
| 3.4 | Import review & duplicate detection | 4 |
| 3.5 | AI parse trial (free tier) | 3 |
| **Total** | | **29** |

---

## Sprint 3: Calculation Engine (Epic 4)
**Duration:** 1.5 weeks  
**Prerequisite:** Sprint 2 complete (needs transaction data structures) ✅  
**Goal:** All financial calculations implemented and tested with 100% pass rate on reference cases.

| Story | Description | Points |
|---|---|---|
| 4.1 | XIRR | 5 |
| 4.2 | TWR | 4 |
| 4.3 | CAGR | 2 |
| 4.4 | Real return (inflation adjustment) | 3 |
| 4.5 | FIRE number & variant classification | 2 |
| 4.6 | Retirement date trajectory | 5 |
| 4.7 | Coast FIRE milestone | 3 |
| 4.8 | What-if contribution simulator | 2 |
| 4.9 | Portfolio aggregation calculations | 4 |
| **Total** | | **30** |

---

## Sprint 4: Dashboard UI (Epic 5)
**Duration:** 1.5 weeks  
**Prerequisite:** Sprint 3 complete ✅  
**Goal:** Working dashboard. User can see their retirement date, FIRE progress, holdings, and run the what-if simulator.

| Story | Description | Points |
|---|---|---|
| 5.1 | Main dashboard layout | 4 |
| 5.2 | FIRE trajectory chart | 5 |
| 5.3 | Portfolio total value & holdings list | 4 |
| 5.4 | Allocation breakdown charts | 4 |
| 5.5 | Real return vs CPI benchmark display | 3 |
| 5.6 | Performance chart (historical) | 3 |
| 5.7 | What-if contribution simulator UI | 2 |
| **Total** | | **25** |

**🎯 End of P0 — V1 functional prototype complete. Beata can see her retirement date.**

---

## Sprint 5: External Data + PDF Import (Epics 6 & 7)
**Duration:** 1.5 weeks  
**Goal:** Real prices, real inflation data, PDF support. Dashboard shows accurate current values.

| Story | Description | Points |
|---|---|---|
| 6.1 | ECB exchange rate integration | 3 |
| 6.2 | Stock & ETF price integration | 4 |
| 6.3 | Cryptocurrency price integration | 3 |
| 6.4 | Eurostat HICP inflation data | 3 |
| 6.5 | Market index benchmark data | 3 |
| 7.1 | Digital PDF text extraction | 3 |
| 7.2 | Scanned PDF fallback (Textract) | 2 |
| **Total** | | **21** |

---

## Sprint 6: Zero-Knowledge Sync + AI Parsing (Epics 8 & 9)
**Duration:** 2 weeks  
**Goal:** Premium is launchable. Users can pay, encrypt their data, sync across devices, and use AI parsing.

| Story | Description | Points |
|---|---|---|
| 8.1 | Crypto package: key derivation & encrypt/decrypt | 5 |
| 8.2 | Cloud sync API endpoints | 4 |
| 8.3 | Premium onboarding: first sync flow | 3 |
| 8.4 | Multi-device sync | 4 |
| 8.5 | Password change re-encryption | 3 |
| 9.1 | AI parse API endpoint | 4 |
| 9.2 | Confidence scoring UI | 3 |
| 9.3 | AI parse template learning | 3 |
| 9.4 | Privacy verification guide | 2 |
| **Total** | | **31** |

---

## Sprint 7: Subscriptions & Payments (Epic 10)
**Duration:** 1 week  
**Goal:** Stripe integrated, premium gated, early adopter deal live. Product can charge its first customer.

| Story | Description | Points |
|---|---|---|
| 10.1 | Stripe subscription integration | 5 |
| 10.2 | Early adopter free year | 3 |
| 10.3 | Feature gating | 3 |
| 10.4 | Account deletion (GDPR) | 3 |
| 10.5 | Lifetime deal | 2 |
| **Total** | | **16** |

**🚀 End of P1 — V1 Launch-Ready. All free and premium features complete.**

---

## Sprint 8: Real Estate + Monte Carlo (Epics 11 & 12)
**Duration:** 1.5 weeks  
**Goal:** Real estate fully integrated. Monte Carlo gives premium users probabilistic projections.

| Story | Description | Points |
|---|---|---|
| 11.1 | Real estate asset entry | 3 |
| 11.2 | Property value history | 2 |
| 11.3 | Numbeo market data integration | 3 |
| 12.1 | Monte Carlo engine (Web Worker) | 8 |
| 12.2 | Monte Carlo results visualisation | 5 |
| 12.3 | Sequence of returns risk warning | 3 |
| **Total** | | **24** |

---

## Sprint 9: Broker APIs (Epic 13)
**Duration:** 1 week  
**Goal:** T212 auto-sync live. DEGIRO and Revolut have guided import wizards.

| Story | Description | Points |
|---|---|---|
| 13.1 | Broker connection framework | 4 |
| 13.2 | Trading 212 connection | 4 |
| 13.3 | DEGIRO guided import | 2 |
| 13.4 | Revolut file export guide | 2 |
| **Total** | | **12** |

**✅ End of P2 — V1.5 complete.**

---

## Summary Timeline

| Sprint | Focus | Duration | Cumulative |
|---|---|---|---|
| 0 | Repo & tooling setup | 3–4 days | Week 1 |
| 1 | Foundation & auth | 1 week | Week 2 |
| 2 | Local data + file import | 1.5 weeks | Week 3–4 |
| 3 | Calculation engine | 1.5 weeks | Week 5–6 |
| 4 | Dashboard UI | 1.5 weeks | Week 7–8 |
| 5 | External data + PDF | 1.5 weeks | Week 9–10 |
| 6 | ZK sync + AI parsing | 2 weeks | Week 11–12 |
| 7 | Subscriptions | 1 week | Week 13 |
| 8 | Real estate + Monte Carlo | 1.5 weeks | Week 14–15 |
| 9 | Broker APIs | 1 week | Week 16 |

**Estimated V1 launch (P0+P1): ~13 weeks from Sprint 0 start**  
**Estimated V1.5 (P0+P1+P2): ~16 weeks from Sprint 0 start**

*Timeline assumes 1 full-stack developer. With 2 developers, P0+P1 can be achieved in 7–9 weeks with parallel tracks (e.g. backend + frontend running concurrently).*
