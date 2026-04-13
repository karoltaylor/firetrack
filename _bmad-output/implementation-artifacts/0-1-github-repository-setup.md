# Story 0.1: GitHub Repository Setup

Status: ready-for-dev

## Story

As a developer,
I want the GitHub repository scaffolded as a Turborepo monorepo with all shared packages, proper .gitignore, README, and docker-compose,
so that the team has a fully working local dev environment from the first clone.

## Acceptance Criteria

1. Repository `karoltaylor/firetrack` exists on GitHub (private) — **already done**
2. README.md with project description, local setup instructions, tech stack summary
3. `.gitignore` covers Node.js, Next.js, Prisma, `.env`, Turborepo, pnpm
4. LICENSE file present (MIT)
5. Turborepo monorepo with `apps/web`, `services/api`, `packages/types`, `packages/calculations`, `packages/crypto`, `packages/parsers`
6. `pnpm-workspace.yaml` configured for all workspace paths
7. `turbo.json` with `build`, `dev`, `lint`, `typecheck`, `test` tasks
8. Root `package.json` with Turborepo scripts and shared dev dependencies
9. Each package has valid `package.json`, `tsconfig.json`, and placeholder `src/index.ts` with passing Vitest test
10. `docker-compose.yml` for local PostgreSQL 16 + Redis 7
11. `.env.example` with all required variables and placeholder values
12. `pnpm install` succeeds, `turbo build` succeeds, `turbo test` succeeds
13. `develop` branch created from `main`

## Tasks / Subtasks

- [ ] Task 1: Initialize Turborepo monorepo root (AC: 5, 6, 7, 8)
  - [ ] 1.1 Create root `package.json` with `name: "firetrack"`, `private: true`, scripts for `build`, `dev`, `lint`, `typecheck`, `test`, `format`, `format:check`
  - [ ] 1.2 Create `pnpm-workspace.yaml` with `apps/*`, `packages/*`, `services/*`
  - [ ] 1.3 Create `turbo.json` with task definitions for `build`, `dev`, `lint`, `typecheck`, `test`, `format:check`
  - [ ] 1.4 Create root `tsconfig.json` (base config) with strict mode, ES2022 target, module NodeNext
  - [ ] 1.5 Create `.npmrc` with `auto-install-peers=true`

- [ ] Task 2: Create shared packages with placeholder exports (AC: 5, 9)
  - [ ] 2.1 `packages/types/` — `package.json` (`@firetrack/types`), `tsconfig.json`, `src/index.ts` exporting placeholder interfaces (Transaction, Asset, FIREGoal, Account)
  - [ ] 2.2 `packages/calculations/` — `package.json` (`@firetrack/calculations`), `tsconfig.json`, `src/index.ts` with placeholder `calculateXIRR` stub, `src/index.test.ts` with passing Vitest test
  - [ ] 2.3 `packages/crypto/` — `package.json` (`@firetrack/crypto`), `tsconfig.json`, `src/index.ts` with placeholder `encrypt`/`decrypt` stubs, `src/index.test.ts` with passing test
  - [ ] 2.4 `packages/parsers/` — `package.json` (`@firetrack/parsers`), `tsconfig.json`, `src/index.ts` with placeholder `generateHeaderFingerprint` stub, `src/index.test.ts` with passing test

- [ ] Task 3: Create apps and services scaffolds (AC: 5, 9)
  - [ ] 3.1 `apps/web/` — `package.json` (`@firetrack/web`), `tsconfig.json`, minimal `src/index.ts` placeholder
  - [ ] 3.2 `services/api/` — `package.json` (`@firetrack/api`), `tsconfig.json`, minimal `src/index.ts` placeholder, `src/index.test.ts` with passing test

- [ ] Task 4: Create ESLint and Prettier config (AC: 8)
  - [ ] 4.1 Root `.eslintrc.js` — TypeScript-aware, no-console rule, import sorting
  - [ ] 4.2 Root `.prettierrc` — single quotes, semicolons, trailing commas, 100 char width
  - [ ] 4.3 Root `.eslintignore` and `.prettierignore`

- [ ] Task 5: Create Docker Compose and env files (AC: 10, 11)
  - [ ] 5.1 `docker-compose.yml` with PostgreSQL 16 and Redis 7 services
  - [ ] 5.2 `.env.example` with DATABASE_URL, REDIS_URL, JWT_SECRET, OPENAI_API_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY placeholders

- [ ] Task 6: Create .gitignore, LICENSE, README (AC: 2, 3, 4)
  - [ ] 6.1 `.gitignore` for Node.js, Next.js, Prisma, .env, Turborepo cache, pnpm, coverage, dist
  - [ ] 6.2 `LICENSE` — MIT
  - [ ] 6.3 `README.md` — project description, tech stack table, local setup instructions (clone, pnpm install, docker-compose up, env setup, turbo build)

- [ ] Task 7: Verify everything works (AC: 12, 13)
  - [ ] 7.1 Run `pnpm install` — must succeed
  - [ ] 7.2 Run `turbo build` — must succeed across all packages
  - [ ] 7.3 Run `turbo test` — all placeholder tests must pass
  - [ ] 7.4 Run `turbo lint` — must pass
  - [ ] 7.5 Run `turbo typecheck` — must pass
  - [ ] 7.6 Initial commit to `main`, create `develop` branch, push both

## Dev Notes

### Architecture Compliance
- Monorepo structure from `architecture-firetrack.md` Section 4 (Frontend Architecture / Monorepo Package Structure)
- Package names: `@firetrack/calculations`, `@firetrack/crypto`, `@firetrack/types`, `@firetrack/parsers`
- Node.js 20 LTS, TypeScript strict mode, pnpm workspaces
- Turborepo ^2.x for task orchestration

### Library Versions (latest stable as of April 2026)
- Turborepo: ^2.1.0
- TypeScript: ^5.x
- Vitest: latest
- ESLint: ^8.x (flat config NOT required; classic config works fine)
- Prettier: ^3.x
- PostgreSQL: 16 (Docker image `postgres:16-alpine`)
- Redis: 7 (Docker image `redis:7-alpine`)

### File Structure Requirements
All paths must match `project-context.md` monorepo structure exactly. Every package must have:
- `package.json` with correct `@firetrack/` scoped name
- `tsconfig.json` extending root base config
- `src/index.ts` with at least one export
- Test files co-located as `*.test.ts`

### Testing Requirements
- Vitest for all unit tests
- Each shared package (`calculations`, `crypto`, `parsers`) must have at least 1 passing test in the placeholder
- Test scripts: `"test": "vitest run"` in each package

### Project Structure Notes
- `apps/web` will become the Next.js app in Sprint 1 — placeholder only for now
- `services/api` will become the Fastify server in Sprint 1 — placeholder only
- Prisma schema not created in this story (that's Story 1.2)
- No feature code — only scaffold and tooling

### References
- [Source: architecture-firetrack.md#4-frontend-architecture] Monorepo package structure
- [Source: architecture-firetrack.md#3-technology-stack] Full tech stack table
- [Source: project-context.md#monorepo-structure] Canonical folder structure
- [Source: project-context.md#coding-standards] Naming, linting, formatting rules

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
