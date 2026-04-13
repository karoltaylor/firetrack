# Epic 1: Foundation — Project Setup & Authentication
**Priority:** P0 — Must ship before anything else
**PRD refs:** FR-01, NFR-03, NFR-06
**Arch refs:** Monorepo structure, Auth flow, JWT, Argon2id, Fastify, PostgreSQL/Prisma

## Goal
Stand up the monorepo, shared packages, and authentication so every subsequent epic has a working foundation to build on. A user can register, log in, and maintain a session across devices.

## Stories

---

### Story 1.1 — Monorepo & Shared Package Scaffold
**As a** developer,
**I want** a Turborepo monorepo with shared packages pre-configured,
**so that** all subsequent epics share types, calculations, and crypto logic without duplication.

**Acceptance Criteria:**
- [ ] Turborepo workspace configured with `apps/web`, `services/api`, `packages/types`, `packages/calculations`, `packages/crypto`, `packages/parsers`
- [ ] `packages/types` exports shared TypeScript interfaces: `Transaction`, `Asset`, `RealEstateAsset`, `FIREGoal`, `Account`, `ColumnMapping`
- [ ] `packages/calculations` has placeholder exports with passing empty tests
- [ ] `packages/crypto` has placeholder exports with passing empty tests
- [ ] `turbo build` and `turbo test` run successfully across all packages
- [ ] ESLint + Prettier configured consistently across all packages
- [ ] README documents how to run the monorepo locally

**Technical notes:**
- Use `pnpm` workspaces (faster than npm/yarn for monorepos)
- Node 20 LTS
- TypeScript strict mode enabled on all packages

---

### Story 1.2 — Database Schema & Prisma Setup
**As a** developer,
**I want** the PostgreSQL schema migrated and Prisma client generated,
**so that** backend services can persist users, subscriptions, and encrypted data.

**Acceptance Criteria:**
- [ ] Prisma schema defines: `User`, `Subscription`, `EncryptedData`, `BrokerConnection`, `MarketPrice`, `ExchangeRate`, `CPIDataPoint`, `AIParseTemplate` models (as per architecture schema)
- [ ] `prisma migrate dev` runs without errors on a local PostgreSQL instance
- [ ] Prisma client is generated and importable from `services/api`
- [ ] `.env.example` documents all required environment variables
- [ ] Database connection health check endpoint: `GET /health` returns `{ db: "ok" }`

**Technical notes:**
- PostgreSQL 16 locally via Docker Compose for development
- `docker-compose.yml` included in repo root for local dev (postgres + redis)

---

### Story 1.3 — User Registration
**As a** new visitor,
**I want** to create an account with my email and password,
**so that** I can start using FIREtrack.

**Acceptance Criteria:**
- [ ] `POST /auth/register` accepts `{ email, password }`
- [ ] Password hashed with Argon2id (64MB memory, 3 iterations, 4 parallelism) before storage
- [ ] Email uniqueness enforced — returns `409 Conflict` if email already registered
- [ ] Password minimum 12 characters enforced — returns `400` with clear error message
- [ ] On success: returns JWT access token (15min expiry) + refresh token (30 days, HttpOnly cookie)
- [ ] Registration UI: email field, password field, confirm password field, submit button
- [ ] Client-side validation before API call: email format, password length, passwords match
- [ ] After registration: redirect to onboarding wizard (Story 2.1)

**Technical notes:**
- `argon2` npm package for hashing
- JWT signed with `JWT_SECRET` env var (HS256)
- Refresh token stored in `HttpOnly; SameSite=Strict; Secure` cookie

---

### Story 1.4 — User Login
**As a** returning user,
**I want** to log in with my email and password,
**so that** I can access my portfolio from any device.

**Acceptance Criteria:**
- [ ] `POST /auth/login` accepts `{ email, password }`
- [ ] Argon2id verify — returns `401` with generic "Invalid credentials" message on failure (no email enumeration)
- [ ] On success: returns new JWT access token + rotated refresh token
- [ ] Failed login attempts rate-limited: 5 attempts per 15 minutes per IP
- [ ] Login UI: email, password, submit, "Forgot password?" placeholder (V2)
- [ ] After login: redirect to dashboard

**Technical notes:**
- Generic error message regardless of whether email exists or password is wrong (prevents enumeration)
- Rate limiting via `@fastify/rate-limit`

---

### Story 1.5 — JWT Refresh & Session Management
**As a** logged-in user,
**I want** my session to stay active without re-logging in every 15 minutes,
**so that** I'm not interrupted while using the app.

**Acceptance Criteria:**
- [ ] `POST /auth/refresh` accepts refresh token cookie, returns new access token + rotated refresh token
- [ ] Expired access token → client automatically calls `/auth/refresh` before retrying failed request
- [ ] If refresh token is expired/invalid → user is redirected to login
- [ ] `POST /auth/logout` invalidates refresh token (stored in DB for revocation check)
- [ ] `GET /auth/sessions` lists active sessions; `DELETE /auth/sessions/:id` revokes a session
- [ ] Session list UI in account settings showing device/timestamp

**Technical notes:**
- Refresh token rotation: each use issues a new refresh token and invalidates the old one
- Refresh tokens stored in `user_sessions` table (add to Prisma schema)
- 30-day inactivity → session expires automatically

---

### Story 1.6 — FIRE Goal Onboarding Wizard
**As a** new user,
**I want** to set my retirement target in a simple wizard after registering,
**so that** FIREtrack can immediately show me my FIRE number and goals.

**Acceptance Criteria:**
- [ ] Wizard collects: current age, target retirement age, target annual retirement expenses, base currency, country of residence
- [ ] Wizard step 1: current age + target retirement age (validates: target > current + 1)
- [ ] Wizard step 2: target annual retirement expenses (currency selector, numeric input)
- [ ] Wizard step 3: country of residence (dropdown, used for CPI data source)
- [ ] On completion: FIRE number displayed prominently — `Annual Expenses × 25`
- [ ] FIRE variant label shown: Lean / Standard / Fat based on expenses
- [ ] Data persisted to IndexedDB `fireGoal` store (not sent to server)
- [ ] User can skip wizard and complete later from settings
- [ ] User can edit all FIRE goal parameters at any time from settings

**Technical notes:**
- FIRE goal stored in IndexedDB only (free tier) — no server call for financial data
- `classifyFIREVariant(annualExpenses)` from `@firetrack/calculations`
