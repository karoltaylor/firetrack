# FIREtrack — Project Context

## Project Overview

FIREtrack is a SaaS investment portfolio tracker for the FIRE (Financial Independence, Retire Early) movement. Users track assets across brokers, see inflation-adjusted real returns, and get a projected retirement date. Zero-knowledge encryption ensures financial data privacy.

## Architecture Principles (in priority order)

1. **Zero-knowledge is non-negotiable** — Financial data never exists on the server in plaintext
2. **Calculations run in the browser** — XIRR, TWR, Monte Carlo all computed client-side
3. **Boring technology over clever technology** — PostgreSQL not MongoDB, REST not GraphQL
4. **Free tier stores nothing sensitive on the server** — Only email, password hash, subscription status
5. **Speed to market over feature completeness** — Ship V1 fast, defer non-core complexity
6. **EU-first for compliance** — Backend in EU region, Eurostat/ECB as primary data sources

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js (App Router) | 14.x |
| Language | TypeScript (strict mode) | 5.x |
| Styling | Tailwind CSS | 3.x |
| Charts | Recharts | 2.x |
| Local storage | Dexie.js (IndexedDB) | 4.x |
| Client state | Zustand | 4.x |
| Encryption | Web Crypto API (native) | — |
| PDF parsing | pdfjs-dist | 4.x |
| Excel parsing | SheetJS (xlsx) | 0.20.x |
| Backend | Fastify | 4.x |
| Runtime | Node.js | 20 LTS |
| Database | PostgreSQL | 16.x |
| ORM | Prisma | 5.x |
| Cache | Redis | 7.x |
| Job queue | BullMQ | 5.x |
| Auth | JWT + Argon2id | — |
| Monorepo | Turborepo | latest |
| Package manager | pnpm | latest |
| Unit testing | Vitest | latest |
| E2E testing | Playwright | latest |
| CI | GitHub Actions | — |
| Frontend hosting | Vercel | — |
| Backend hosting | Fly.io (Frankfurt, EU) | — |

## Monorepo Structure

```
firetrack/
├── apps/
│   └── web/                    # Next.js app
│       ├── app/
│       │   ├── (auth)/         # Login, register (server-rendered)
│       │   ├── (app)/          # Dashboard, portfolio (client-rendered)
│       │   └── api/            # Next.js API routes (thin proxy)
│       ├── components/
│       └── lib/
│           └── db.ts           # Dexie.js IndexedDB schema
├── packages/
│   ├── calculations/           # @firetrack/calculations — XIRR, TWR, CAGR, FIRE trajectory
│   ├── crypto/                 # @firetrack/crypto — AES-256-GCM, PBKDF2 key derivation
│   ├── types/                  # @firetrack/types — Shared TypeScript interfaces
│   └── parsers/                # @firetrack/parsers — Column mapping, fingerprinting
├── services/
│   └── api/                    # Fastify backend
│       ├── routes/
│       ├── services/
│       ├── jobs/
│       ├── middleware/
│       └── prisma/
│           └── schema.prisma
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   └── pull_request_template.md
├── docker-compose.yml          # Local dev: PostgreSQL + Redis
├── turbo.json
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

## Coding Standards

### TypeScript
- Strict mode enabled on all packages (`"strict": true` in tsconfig)
- No `any` types — use `unknown` with type narrowing when type is truly unknown
- Prefer `interface` over `type` for object shapes
- Exported functions must have explicit return types
- Use `const` by default; `let` only when reassignment is necessary

### Naming Conventions
- Files: `kebab-case.ts` (e.g. `fire-trajectory.ts`)
- Components: `PascalCase.tsx` (e.g. `DashboardLayout.tsx`)
- Functions/variables: `camelCase` (e.g. `calculateXIRR`)
- Constants: `UPPER_SNAKE_CASE` (e.g. `MAX_FILE_SIZE`)
- Types/interfaces: `PascalCase` (e.g. `Transaction`, `FIREProjection`)
- Package scoping: `@firetrack/` prefix for all internal packages

### Commit Convention (Conventional Commits)
- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — tooling, config
- `test:` — tests only
- `docs:` — documentation
- `refactor:` — code change with no feature/fix
- `perf:` — performance improvement
- `ci:` — CI/CD changes
- Scope encouraged: `feat(auth): add JWT refresh`

### Testing
- Unit tests: Vitest, co-located with source as `*.test.ts`
- TDD workflow: red-green-refactor
- Financial calculations: validate against Excel reference values to 4 decimal places
- Minimum: every exported function from shared packages must have tests
- E2E: Playwright for critical user flows

### Code Style
- ESLint for linting, Prettier for formatting
- Max line length: 100 characters (Prettier default)
- Semicolons: yes
- Quotes: single quotes for JS/TS, double quotes for JSX attributes
- Trailing commas: all (ES5+)
- No `console.log` in production code (ESLint rule)
- Imports: sorted by external, then internal, then relative

### Security Rules
- Never log or store encryption keys, passwords, or plaintext financial data
- Never transmit financial data to the server unencrypted (free tier: never at all)
- Argon2id for password hashing (64MB memory, 3 iterations, 4 parallelism)
- JWT access tokens: 15min expiry; refresh tokens: 30 days, HttpOnly cookies
- PBKDF2 with 600,000 iterations for encryption key derivation
- AES-256-GCM with random 12-byte IV for data encryption (never reuse IVs)

### API Conventions
- REST endpoints under `/api/`
- JSON request/response bodies
- HTTP status codes: 200 (success), 201 (created), 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict), 429 (rate limited), 500 (server error)
- Rate limiting via `@fastify/rate-limit`

## Git Workflow

- `main` branch: production, protected
- `develop` branch: integration, protected
- Feature branches: `feat/story-id-short-description` (e.g. `feat/1-1-monorepo-scaffold`)
- All changes via pull requests — no direct pushes to main or develop
- CI must pass before merge (lint + typecheck + test + build)
- Squash merge preferred for clean history

## Key Planning Documents

Located in `_bmad-output/planning-artifacts/`:
- `prd-firetrack.md` — Product Requirements Document
- `architecture-firetrack.md` — Full technical architecture
- `domain-research-firetrack.md` — Financial domain knowledge (XIRR, TWR, FIRE calculations)
- `market-research-firetrack.md` — Competitive landscape and market analysis
- `sprint-plan-firetrack.md` — Sprint breakdown (Sprint 0 through Sprint 9)
- `epics/` — 13 epic files with 63 stories + 7 Sprint 0 stories
