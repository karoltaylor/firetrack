# Story 0.1: GitHub Repository Setup

Status: done

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

- [x] Task 1: Initialize Turborepo monorepo root (AC: 5, 6, 7, 8)
  - [x] 1.1 Create root `package.json` with `name: "firetrack"`, `private: true`, scripts for `build`, `dev`, `lint`, `typecheck`, `test`, `format`, `format:check`
  - [x] 1.2 Create `pnpm-workspace.yaml` with `apps/*`, `packages/*`, `services/*`
  - [x] 1.3 Create `turbo.json` with task definitions for `build`, `dev`, `lint`, `typecheck`, `test`, `format:check`
  - [x] 1.4 Create root `tsconfig.json` (base config) with strict mode, ES2022 target, module NodeNext
  - [x] 1.5 Create `.npmrc` with `auto-install-peers=true`

- [x] Task 2: Create shared packages with placeholder exports (AC: 5, 9)
  - [x] 2.1 `packages/types/` — `package.json` (`@firetrack/types`), `tsconfig.json`, `src/index.ts` exporting placeholder interfaces (Transaction, Asset, FIREGoal, Account)
  - [x] 2.2 `packages/calculations/` — `package.json` (`@firetrack/calculations`), `tsconfig.json`, `src/index.ts` with placeholder `calculateXIRR` stub, `src/index.test.ts` with passing Vitest test
  - [x] 2.3 `packages/crypto/` — `package.json` (`@firetrack/crypto`), `tsconfig.json`, `src/index.ts` with placeholder `encrypt`/`decrypt` stubs, `src/index.test.ts` with passing test
  - [x] 2.4 `packages/parsers/` — `package.json` (`@firetrack/parsers`), `tsconfig.json`, `src/index.ts` with placeholder `generateHeaderFingerprint` stub, `src/index.test.ts` with passing test

- [x] Task 3: Create apps and services scaffolds (AC: 5, 9)
  - [x] 3.1 `apps/web/` — `package.json` (`@firetrack/web`), `tsconfig.json`, minimal `src/index.ts` placeholder
  - [x] 3.2 `services/api/` — `package.json` (`@firetrack/api`), `tsconfig.json`, minimal `src/index.ts` placeholder, `src/index.test.ts` with passing test

- [x] Task 4: Create ESLint and Prettier config (AC: 8)
  - [x] 4.1 Root `.eslintrc.js` — TypeScript-aware, no-console rule, import sorting
  - [x] 4.2 Root `.prettierrc` — single quotes, semicolons, trailing commas, 100 char width
  - [x] 4.3 Root `.eslintignore` and `.prettierignore`

- [x] Task 5: Create Docker Compose and env files (AC: 10, 11)
  - [x] 5.1 `docker-compose.yml` with PostgreSQL 16 and Redis 7 services
  - [x] 5.2 `.env.example` with DATABASE_URL, REDIS_URL, JWT_SECRET, OPENAI_API_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY placeholders

- [x] Task 6: Create .gitignore, LICENSE, README (AC: 2, 3, 4)
  - [x] 6.1 `.gitignore` for Node.js, Next.js, Prisma, .env, Turborepo cache, pnpm, coverage, dist
  - [x] 6.2 `LICENSE` — MIT
  - [x] 6.3 `README.md` — project description, tech stack table, local setup instructions (clone, pnpm install, docker-compose up, env setup, turbo build)

- [x] Task 7: Verify everything works (AC: 12, 13)
  - [x] 7.1 Run `pnpm install` — must succeed
  - [x] 7.2 Run `turbo build` — must succeed across all packages (6/6 passed)
  - [x] 7.3 Run `turbo test` — all workspace placeholder tests must pass (6 suites, 7 tests passed)
  - [x] 7.4 Run `turbo lint` — must pass (6/6 passed)
  - [x] 7.5 Run `turbo typecheck` — must pass (6/6 passed)
  - [x] 7.6 Initial commit to `main`, create `develop` branch, push both

### Review Findings

- [x] [Review][Patch] Remove the incorrect Prisma migration lock ignore rule [`.gitignore`]
  `.gitignore` currently ignores `prisma/migrations/.migration_lock.toml`, which is both the wrong filename and the wrong workflow. When Prisma is added, the migration lock file should be tracked rather than ignored.
- [x] [Review][Patch] Make the Docker setup command portable in the README [`README.md`]
  `README.md` documents `docker-compose up -d`, but many current Docker Desktop installs expose `docker compose` instead. The setup instructions should use the modern command or mention both so first-run setup does not fail on fresh machines.
- [x] [Review][Patch] Add a minimal Vitest scaffold for `@firetrack/types` [`packages/types/package.json`, `packages/types/src/index.test.ts`]
  Story AC9 says each package should include a valid package scaffold with a passing Vitest test, but `@firetrack/types` originally had no `test` script, no `vitest` dependency, and no test file. It is now covered by `turbo test`.
- [x] [Review][Patch] Add a minimal Vitest scaffold for `@firetrack/web` [`apps/web/package.json`, `apps/web/src/index.test.ts`]
  Story AC9 applies to each package, but `@firetrack/web` originally had no `test` script, no `vitest` dependency, and no test file. It is now covered by `turbo test`.
- [x] [Review][Patch] Prevent co-located test files from being emitted into `dist/` [`packages/*/tsconfig.json`, `services/api/tsconfig.json`, `apps/web/tsconfig.json`]
  The workspace `tsconfig.json` files originally included all of `src`, so `tsc --build` emitted `*.test.js` into production build output. Adding `exclude: [\"src/**/*.test.ts\"]` keeps runtime artifacts limited to actual package code.
- [x] [Review][Decision] Reconcile Story 0.1 against the Epic 0 source definition [`_bmad-output/planning-artifacts/epics/epic-00-sprint-zero.md`, `0-1-github-repository-setup.md`]
  Decision resolved: keep the expanded Story 0.1 as the source of truth. Epic/planning artifacts should be updated to match the implemented monorepo scaffold, and collaborator invites should be tracked as a separate manual checklist item rather than part of this automated implementation story.
- [x] [Review][Patch] Align Epic 0 Story 0.1 with the expanded implementation story [`_bmad-output/planning-artifacts/epics/epic-00-sprint-zero.md`, related planning artifacts]
  The planning artifacts now reflect the implemented repository scaffold (monorepo root, workspace packages, docker-compose, env example, verification steps), and collaborator invites are tracked as a separate manual follow-up item.
- [x] [Review][Patch] Refresh Story 0.1 review evidence to match the current validation results [`0-1-github-repository-setup.md`]
  Review evidence now reflects the final verified state: `pnpm install` succeeded, `turbo build` passed for 6/6 workspaces, `turbo test` passed for 6/6 workspaces with 7 tests total, and `turbo typecheck` passed for 6/6 workspaces.
- [x] [Review][Patch] Relax the “match project-context exactly” wording for placeholder apps/services [`0-1-github-repository-setup.md`]
  The story now states that implemented root and workspace paths should align with the target monorepo structure, while full Next.js/Fastify directory trees are intentionally deferred to Sprint 1.

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
Implemented root and workspace package paths should align with the target monorepo shape in `project-context.md`. In Story 0.1, `apps/web` and `services/api` are intentionally minimal placeholders; the full Next.js App Router and Fastify service directory trees are deferred to Sprint 1. Every package in this story must have:
- `package.json` with correct `@firetrack/` scoped name
- `tsconfig.json` extending root base config
- `src/index.ts` with at least one export
- Test files co-located as `*.test.ts`

### Testing Requirements
- Vitest for all unit tests
- Each scaffolded workspace package (`types`, `calculations`, `crypto`, `parsers`, `web`, `api`) must have at least 1 passing placeholder test in this story
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
Claude Opus 4 (Cursor)

### Debug Log References
- pnpm install: 294 packages added in 17.3s
- turbo build: 6/6 successful in 6.3s
- turbo test: 6/6 workspaces, 7 tests passed after review fixes (Vitest 3.2.4)
- turbo typecheck: 6/6 successful in 4.4s
- turbo lint: 6/6 successful in 1.2s (placeholder echo scripts)

### Completion Notes List
- Turborepo 2.9.6, TypeScript 5.9.3, Vitest 3.2.4, ESLint 8.57.1, Prettier 3.8.2 installed
- All 6 workspace packages scaffold: types, calculations, crypto, parsers, web, api
- 6 workspace test suites with 7 tests — all passing (types: 1, calculations: 1, crypto: 2, parsers: 1, web: 1, api: 1)
- docker-compose.yml with postgres:16-alpine + redis:7-alpine
- ESLint config with @typescript-eslint, import ordering, no-console, no-any rules
- Prettier config: single quotes, semicolons, trailing commas, 100 char width
- Initial commit pushed to main (290a0f8), develop branch created and pushed
- Per-package lint scripts are placeholder echoes — full ESLint wiring in Story 0.3 (Husky/lint-staged)
- Resolved code review finding: removed incorrect Prisma migration lock ignore rule from `.gitignore`
- Resolved code review finding: updated README to use `docker compose up -d` for better Docker portability
- Resolved code review finding: added minimal Vitest scaffolds for `@firetrack/types` and `@firetrack/web`
- Resolved code review finding: excluded `*.test.ts` from TypeScript build output across scaffolded workspaces
- Validation rerun after review fixes: build 6/6 passed, test 6/6 passed, typecheck 6/6 passed
- Resolved code review finding: aligned Epic 0 Story 0.1 and sprint-planning artifacts with the implemented repository scaffold

### File List
- package.json (new)
- pnpm-workspace.yaml (new)
- turbo.json (new)
- tsconfig.json (new)
- .npmrc (new)
- .eslintrc.js (new)
- .prettierrc (new)
- .eslintignore (new)
- .prettierignore (new)
- .gitignore (new)
- .env.example (new)
- docker-compose.yml (new)
- LICENSE (new)
- README.md (new)
- _bmad-output/planning-artifacts/epics/epic-00-sprint-zero.md (updated during review alignment)
- _bmad-output/planning-artifacts/sprint-plan-firetrack.md (updated during review alignment)
- packages/types/package.json (new)
- packages/types/tsconfig.json (new)
- packages/types/src/index.ts (new)
- packages/types/src/index.test.ts (new)
- packages/calculations/package.json (new)
- packages/calculations/tsconfig.json (new)
- packages/calculations/src/index.ts (new)
- packages/calculations/src/index.test.ts (new)
- packages/crypto/package.json (new)
- packages/crypto/tsconfig.json (new)
- packages/crypto/src/index.ts (new)
- packages/crypto/src/index.test.ts (new)
- packages/parsers/package.json (new)
- packages/parsers/tsconfig.json (new)
- packages/parsers/src/index.ts (new)
- packages/parsers/src/index.test.ts (new)
- apps/web/package.json (new)
- apps/web/tsconfig.json (new)
- apps/web/src/index.ts (new)
- apps/web/src/index.test.ts (new)
- services/api/package.json (new)
- services/api/tsconfig.json (new)
- services/api/src/index.ts (new)
- services/api/src/index.test.ts (new)
