# Epic 0: Sprint Zero — Repository & Developer Tooling
**Priority:** P0 — Must complete before any feature code is written
**PRD refs:** N/A — Infrastructure prerequisite
**Arch refs:** Monorepo structure, CI/CD, Git workflow

## Goal
Stand up the GitHub repository, branch protection, git hooks, CI pipeline, PR template, and local dev environment so that every subsequent sprint has a fully enforced quality gate. No feature code is written until Sprint 0 is verified end-to-end.

## Stories

---

### Story 0.1 — GitHub Repository Setup
**As a** developer,
**I want** the GitHub repository scaffolded as a Turborepo monorepo with core workspace packages and local dev tooling,
**so that** the team has a central place to push code and a fully working local environment from the first clone.

**Acceptance Criteria:**
- [ ] Create repository `firetrack` — private
- [ ] Add README.md with project description, local setup instructions, tech stack summary
- [ ] Add `.gitignore` for Node.js, Next.js, Prisma, `.env`, Turborepo, pnpm
- [ ] Add LICENSE (MIT)
- [ ] Configure `pnpm-workspace.yaml` for `apps/*`, `packages/*`, `services/*`
- [ ] Configure `turbo.json` with `build`, `dev`, `lint`, `typecheck`, `test` tasks
- [ ] Add root `package.json`, `tsconfig.json`, `.npmrc`, ESLint, and Prettier configuration
- [ ] Scaffold `apps/web`, `services/api`, `packages/types`, `packages/calculations`, `packages/crypto`, `packages/parsers`
- [ ] Add `docker-compose.yml` for local PostgreSQL 16 + Redis 7
- [ ] Add `.env.example` with all required placeholder values
- [ ] Verify `pnpm install`, `turbo build`, `turbo test`, and `turbo typecheck` pass
- [ ] Create default branches: `main` (production), `develop` (integration)
- [ ] Manual follow-up: invite collaborators with Write role if needed for the team setup

---

### Story 0.2 — Branch Protection Rules
**As a** project owner,
**I want** branch protection configured on main and develop,
**so that** no code merges without a PR, approval, and passing CI.

**Acceptance Criteria:**
- [ ] Require PR before merging on both `main` and `develop`
- [ ] Require 1 approving review
- [ ] Dismiss stale reviews on new push
- [ ] Require all CI status checks to pass before merge
- [ ] Require branches to be up to date before merging
- [ ] Restrict force pushes and deletions on both branches
- [ ] Verified: direct push to `main` is rejected
- [ ] Verified: direct push to `develop` is rejected

---

### Story 0.3 — Git Hooks: Husky + lint-staged + commitlint
**As a** developer,
**I want** local git hooks enforcing code quality and commit message format,
**so that** only clean, conventionally-committed code reaches the remote.

**Acceptance Criteria:**
- [ ] `husky`, `lint-staged`, `commitlint` installed as dev dependencies
- [ ] `.husky/pre-commit` hook runs: `lint-staged` (ESLint + Prettier on staged files only)
- [ ] `.husky/commit-msg` hook runs: `commitlint` (Conventional Commits format)
- [ ] `.husky/pre-push` hook runs: `turbo test` (all unit tests must pass before push)
- [ ] Verified: commit with message "did a thing" is rejected
- [ ] Verified: commit with message "feat(auth): add login endpoint" is accepted
- [ ] Verified: file with ESLint error is caught by pre-commit hook

---

### Story 0.4 — CI Pipeline: GitHub Actions
**As a** developer,
**I want** a CI pipeline that runs lint, test, and build on every PR,
**so that** broken code cannot merge to main or develop.

**Acceptance Criteria:**
- [ ] `.github/workflows/ci.yml` created
- [ ] Trigger: every push to any branch, every PR to `main` or `develop`
- [ ] Job 1 `lint`: ESLint + Prettier check + TypeScript `tsc --noEmit`
- [ ] Job 2 `test`: Vitest unit tests across all packages
- [ ] Job 3 `build`: `turbo build` + `prisma validate`
- [ ] All 3 jobs required as status checks in branch protection
- [ ] CI completes in under 5 minutes on clean monorepo
- [ ] Verified: PR with TypeScript error fails and blocks merge
- [ ] Verified: PR with failing test fails and blocks merge

---

### Story 0.5 — PR Template
**As a** developer,
**I want** a pull request template that appears on every new PR,
**so that** PRs follow a consistent format with quality checklist.

**Acceptance Criteria:**
- [ ] `.github/pull_request_template.md` created
- [ ] Template includes: What does this PR do, Epic/Story reference, Type of change checkboxes
- [ ] Checklist: unit tests added, no new ESLint warnings, acceptance criteria met, no hardcoded secrets, no console.log
- [ ] Template appears automatically on every new PR

---

### Story 0.6 — Secrets & Environment Variables
**As a** developer,
**I want** environment variables documented and secrets configured in GitHub,
**so that** the team can run the app locally and CI can run securely.

**Acceptance Criteria:**
- [ ] GitHub Actions Secrets configured: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`
- [ ] `.env.example` committed with all required variables and placeholder values
- [ ] `.env` and `.env.local` in `.gitignore`
- [ ] Verified: no `.env` file in initial commit
- [ ] README documents: "Copy `.env.example` to `.env.local` and fill in values"

---

### Story 0.7 — Local Development Setup Verification
**As a** developer,
**I want** to verify the complete local setup works end-to-end,
**so that** I know the dev environment is ready before starting feature work.

**Acceptance Criteria:**
- [ ] `git clone` + `pnpm install` works
- [ ] `docker-compose up -d` starts PostgreSQL and Redis successfully
- [ ] `pnpm --filter api prisma migrate dev` runs without errors
- [ ] `turbo lint` passes
- [ ] `turbo typecheck` passes
- [ ] `turbo test` passes
- [ ] `turbo build` passes
- [ ] Bad commit message is rejected by commitlint
- [ ] All steps verified on Windows (PowerShell)
- [ ] `docker-compose.yml` committed to repo root
