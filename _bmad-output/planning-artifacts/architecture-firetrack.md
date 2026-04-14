# Architecture Document — FIREtrack
**Architect:** Winston, System Architect
**Date:** April 2026
**Version:** 1.0
**Input:** prd-firetrack.md
**Status:** Ready for Epics & Stories

---

## Table of Contents
1. [Architecture Principles](#1-architecture-principles)
2. [System Overview](#2-system-overview)
3. [Technology Stack](#3-technology-stack)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Zero-Knowledge Encryption Layer](#5-zero-knowledge-encryption-layer)
6. [Calculation Engine](#6-calculation-engine)
7. [Document Ingestion Pipeline](#7-document-ingestion-pipeline)
8. [Backend Architecture](#8-backend-architecture)
9. [Data Schema](#9-data-schema)
10. [External Integrations](#10-external-integrations)
11. [Infrastructure & Deployment](#11-infrastructure--deployment)
12. [Security Architecture](#12-security-architecture)
13. [Architecture Decision Records (ADRs)](#13-architecture-decision-records-adrs)
14. [Open Question Resolutions](#14-open-question-resolutions)
15. [Component Interaction Diagrams](#15-component-interaction-diagrams)

---

## 1. Architecture Principles

These principles govern every decision in this document. When trade-offs arise during implementation, resolve them by returning to these principles in order.

| # | Principle | Implication |
|---|---|---|
| P1 | **Zero-knowledge is non-negotiable** | Financial data never exists on the server in plaintext. No exceptions. Architecture enforces this; policy does not. |
| P2 | **Calculations run in the browser** | XIRR, TWR, Monte Carlo — all computed client-side. The server cannot compute what it cannot read. |
| P3 | **Boring technology over clever technology** | PostgreSQL not MongoDB. REST not GraphQL. Proven libraries not new ones. Complexity only where the product demands it. |
| P4 | **Free tier stores nothing sensitive on the server** | The server's only knowledge of a free user is their email, password hash, and subscription status. |
| P5 | **Speed to market over feature completeness** | Architecture must support V1 shipping fast. Defer complexity that is not required for the core FIRE trajectory + real returns + any-format import. |
| P6 | **EU-first for compliance** | Backend deployed in EU region. Eurostat and ECB as primary data sources. GDPR-compliant by design. |

---

## 2. System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│  ┌──────────────┐   ┌───────────────┐   ┌──────────────────┐  │
│  │  Next.js UI  │   │  Calculation  │   │  Crypto Layer    │  │
│  │  (React)     │◄──│  Engine       │   │  (Web Crypto API)│  │
│  │              │   │  (TypeScript) │   │  AES-256-GCM     │  │
│  └──────┬───────┘   └───────────────┘   └────────┬─────────┘  │
│         │                                          │            │
│  ┌──────▼───────────────────────────────────────  │  ────────┐ │
│  │  Local Store (FREE TIER)                        │          │ │
│  │  IndexedDB via Dexie.js                         │          │ │
│  │  Transactions · Assets · Settings               │          │ │
│  └─────────────────────────────────────────────────┼──────────┘ │
│                                                     │            │
└─────────────────────────────────────────────────────┼────────────┘
                                                       │ Encrypted
                                                       │ Ciphertext
                                                       │ Only
                          ┌────────────────────────────▼───────────┐
                          │           FIRETRACK API SERVER          │
                          │         (Fastify · Node.js · TS)        │
                          │                                         │
                          │  ┌──────────┐  ┌─────────────────────┐ │
                          │  │   Auth   │  │  Document Parser     │ │
                          │  │  Service │  │  (AI + OCR Service)  │ │
                          │  └──────────┘  └─────────────────────┘ │
                          │                                         │
                          │  ┌──────────┐  ┌─────────────────────┐ │
                          │  │  Market  │  │  Broker Sync        │ │
                          │  │  Data    │  │  (OAuth connectors) │ │
                          │  │  Cache   │  └─────────────────────┘ │
                          │  └──────────┘                          │
                          └────────────────────┬────────────────────┘
                                               │
                          ┌────────────────────▼────────────────────┐
                          │              POSTGRESQL                  │
                          │                                         │
                          │  users · subscriptions · encrypted_data │
                          │  market_prices · exchange_rates · cpi   │
                          │  ai_parse_templates · broker_mappings   │
                          └──────────────────────────────────────────┘
```

### Data Flow: Two Distinct Paths

**Free Tier path:**
```
Browser → IndexedDB (local) → Calculation Engine (browser) → UI
        ↕ (public data only, no financial data)
     API Server → Market prices / CPI / Exchange rates → Browser
```

**Premium Tier path:**
```
Browser → Encrypt (Web Crypto) → API Server → PostgreSQL (ciphertext)
PostgreSQL (ciphertext) → API Server → Browser → Decrypt → Calculation Engine → UI
```

The server is a **dumb pipe** for premium financial data — it stores and retrieves ciphertext without any ability to read it.

---

## 3. Technology Stack

### Rationale Summary
Every choice prefers proven, maintained, TypeScript-native tools. The stack is monorepo-friendly so calculation logic and type definitions are shared between frontend and backend.

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Frontend framework** | Next.js (App Router) | 14.x | SSR for auth/marketing pages; client-side for encrypted financial views; Vercel-native deployment |
| **UI language** | TypeScript | 5.x | Type safety critical for financial calculations; shared types with backend |
| **Styling** | Tailwind CSS | 3.x | Rapid UI development; no CSS-in-JS overhead |
| **Charts** | Recharts | 2.x | React-native; good performance for time series; no canvas complexity |
| **Local storage** | Dexie.js (IndexedDB) | 4.x | Typed IndexedDB wrapper; supports 10,000+ transactions performantly |
| **Client state** | Zustand | 4.x | Lightweight; no boilerplate; good for calculation results cache |
| **Encryption** | Web Crypto API | Native | Browser-native; no library dependency; auditable; AES-256-GCM + PBKDF2 |
| **PDF parsing (client)** | pdfjs-dist | 4.x | Mozilla's PDF.js; handles digital PDFs client-side with no server round-trip |
| **Excel parsing** | SheetJS (xlsx) | 0.20.x | Industry standard; parses .xlsx/.xls/.csv client-side |
| **Backend framework** | Fastify | 4.x | Faster than Express; TypeScript-first; good plugin ecosystem |
| **Backend language** | Node.js + TypeScript | 20 LTS | Same language as frontend; shared calculation library; fast to ship |
| **Database** | PostgreSQL | 16.x | ACID; proven for financial data; excellent JSON support for encrypted blobs |
| **ORM** | Prisma | 5.x | TypeScript-native; auto-generated types; migration management |
| **Cache** | Redis | 7.x | Market prices, exchange rates, CPI — cached to avoid API rate limits |
| **AI parsing** | OpenAI GPT-4o mini | latest | Structured output mode; excellent at table/column extraction; cost-efficient for parsing |
| **OCR (scanned PDFs)** | AWS Textract | latest | Pay-per-use; accurate; handles complex financial document layouts |
| **Job queue** | BullMQ (Redis-backed) | 5.x | Async document parsing; broker sync jobs; non-blocking |
| **Auth** | JWT + Argon2id | — | Industry standard; Argon2id is OWASP-recommended for password hashing |
| **Monorepo** | Turborepo | latest | Shared packages: `@firetrack/calculations`, `@firetrack/types`, `@firetrack/crypto` |
| **Testing** | Vitest + Playwright | latest | Vitest for unit/calculation tests; Playwright for E2E |
| **Infrastructure** | Vercel + Fly.io | — | Vercel for Next.js; Fly.io for API + PostgreSQL + Redis (EU region) |

---

## 4. Frontend Architecture

### Monorepo Package Structure

```
firetrack/
├── apps/
│   └── web/                    # Next.js app
│       ├── app/
│       │   ├── (auth)/         # Login, register (server-rendered)
│       │   ├── (app)/          # Dashboard, portfolio (client-rendered)
│       │   │   ├── dashboard/
│       │   │   ├── portfolio/
│       │   │   ├── import/
│       │   │   ├── real-estate/
│       │   │   └── settings/
│       │   └── api/            # Next.js API routes (thin proxy to Fastify)
│       └── components/
├── packages/
│   ├── calculations/           # Shared: XIRR, TWR, CAGR, Monte Carlo, FIRE trajectory
│   ├── crypto/                 # Shared: Web Crypto API wrappers (encrypt/decrypt/derive)
│   ├── types/                  # Shared TypeScript types: Transaction, Asset, Portfolio, FIREGoal
│   └── parsers/                # Shared: CSV/Excel column detection, mapping logic
└── services/
    └── api/                    # Fastify backend
```

### Client-Side Data Architecture (Free Tier)

All financial data for free-tier users lives in **IndexedDB** via Dexie.js. No financial data ever leaves the browser.

```typescript
// packages/types/src/schema.ts — shared between frontend and backend

interface Transaction {
  id: string                    // UUID, generated client-side
  accountId: string
  date: Date
  assetId: string               // ticker symbol or custom identifier
  assetName: string
  assetClass: AssetClass        // 'equity' | 'bond' | 'crypto' | 'cash' | 'pension'
  transactionType: TransactionType // 'buy' | 'sell' | 'dividend' | 'fee' | 'transfer'
  quantity: number
  pricePerUnit: number
  currency: string              // ISO 4217
  totalAmount: number           // in transaction currency
  totalAmountBase: number       // converted to user's base currency at historical rate
  exchangeRateUsed: number
  importSource: 'file' | 'api' | 'manual'
  importedAt: Date
  sourceFileId?: string
}

interface Asset {
  id: string
  symbol: string                // e.g. 'VWCE', 'BTC', 'REAL_ESTATE_1'
  name: string
  assetClass: AssetClass
  currency: string
  country?: string              // for geographic allocation
  currentPrice?: number
  currentPriceUpdatedAt?: Date
}

interface RealEstateAsset {
  id: string
  label: string
  purchasePrice: number
  purchaseDate: Date
  currentValue: number          // user-entered
  currentValueUpdatedAt: Date
  currency: string
  country: string
  city: string
  sizeM2?: number
  monthlyRentGross?: number
  occupancyRate?: number        // 0–1
  valueHistory: { date: Date; value: number }[]
}

interface FIREGoal {
  currentAge: number
  targetRetirementAge: number
  targetAnnualExpenses: number  // in base currency
  baseCurrency: string
  countryOfResidence: string    // ISO 3166-1 alpha-2
  safeWithdrawalRate: number    // default 0.035
  monthlyContribution?: number  // user override; otherwise derived from transaction history
}
```

### Dexie.js Database Schema (Free Tier IndexedDB)

```typescript
// apps/web/lib/db.ts
class FIREtrackDatabase extends Dexie {
  transactions!: Table<Transaction>
  assets!: Table<Asset>
  realEstate!: Table<RealEstateAsset>
  accounts!: Table<Account>
  fireGoal!: Table<FIREGoal>
  exchangeRates!: Table<ExchangeRate>     // cached from server
  marketPrices!: Table<MarketPrice>       // cached from server
  cpiData!: Table<CPIDataPoint>           // cached from server
  importMappings!: Table<ColumnMapping>   // remembered broker formats
  parseTrialUsed!: Table<{ used: boolean }>

  constructor() {
    super('firetrack')
    this.version(1).stores({
      transactions: '++id, accountId, date, assetId, assetClass',
      assets: '++id, symbol, assetClass',
      realEstate: '++id',
      accounts: '++id',
      fireGoal: '++id',
      exchangeRates: '[baseCurrency+quoteCurrency+date]',
      marketPrices: '[symbol+date]',
      cpiData: '[country+yearMonth]',
      importMappings: 'sourceFingerprint',
      parseTrialUsed: '++id',
    })
  }
}
```

### Page Architecture: Client-Side Only for Financial Views

Financial data pages (`/dashboard`, `/portfolio`, `/import`) must be rendered **client-side only** — they read from IndexedDB (free) or decrypt from cloud (premium) in the browser. They must never be server-rendered as that would require sending financial data to the server.

```typescript
// apps/web/app/(app)/dashboard/page.tsx
'use client'   // REQUIRED — financial views are always client-side

export default function DashboardPage() {
  // reads from IndexedDB (free) or decrypts cloud data (premium)
  // never calls a server with financial data
}
```

---

## 5. Zero-Knowledge Encryption Layer

This is the most critical and most unusual part of the architecture. It must be understood before implementing any data sync feature.

### How Zero-Knowledge Works in FIREtrack

```
User Password
      │
      ▼
  PBKDF2 (600,000 iterations, SHA-256, 32-byte output)
  + salt (random 16 bytes, stored on server — NOT secret)
      │
      ▼
  Derived Encryption Key (256 bits)
      │
      ▼
  AES-256-GCM encryption of portfolio data (JSON blob)
      │
      ▼
  Ciphertext + IV (12 random bytes) + Auth Tag
      │
      ▼
  Sent to server → Stored in PostgreSQL (encrypted_data table)
```

The salt is stored on the server so the same key can be re-derived on different devices. The salt is **not secret** — it just prevents rainbow table attacks. The key is never transmitted.

### Encryption Package API

```typescript
// packages/crypto/src/index.ts

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 600_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encrypt(key: CryptoKey, data: object): Promise<EncryptedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(data))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv),
  }
}

export async function decrypt(key: CryptoKey, blob: EncryptedBlob): Promise<object> {
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBuffer(blob.iv) },
    key,
    base64ToBuffer(blob.ciphertext)
  )
  return JSON.parse(new TextDecoder().decode(plaintext))
}
```

### Password Change Flow

When a user changes their password, all cloud data must be re-encrypted with the new key. This is a **client-side-only operation**:

1. User provides old password + new password
2. Client derives old key (old password + stored salt)
3. Client downloads all ciphertext blobs from server
4. Client decrypts all blobs using old key
5. Client generates new salt
6. Client derives new key (new password + new salt)
7. Client re-encrypts all blobs with new key
8. Client uploads new ciphertext + new salt to server in a single transaction
9. Server atomically replaces old salt and ciphertext
10. Old key is discarded from memory

```typescript
// This entire flow happens in the browser. The server sees only:
// PUT /api/sync  { newSalt: "...", encryptedData: { ... new ciphertext ... } }
```

### Cloud Sync Strategy

Portfolio data is serialised as a single JSON snapshot and encrypted as one blob per sync. This keeps the server's data model simple (no financial schema) and makes the zero-knowledge architecture easier to reason about.

```
// What the server stores per premium user:
{
  userId: "uuid",
  salt: "base64-encoded-random-bytes",    // NOT secret
  encryptedData: "base64-encoded-ciphertext",
  iv: "base64-encoded-iv",
  lastSyncedAt: "2026-04-13T12:00:00Z",
  dataVersion: 42                          // for conflict detection
}
```

Trade-off: Single-blob sync is simple and secure but means downloading the entire portfolio on every device sync. At 10,000 transactions (~2MB uncompressed), this is acceptable for V1. V2 can introduce differential sync if performance becomes an issue.

---

## 6. Calculation Engine

All financial calculations run **client-side** in a shared TypeScript package. The same code runs in the browser (via Zustand store computations) and in Node.js (for any server-side validation or test harnesses).

### Package: `@firetrack/calculations`

```
packages/calculations/src/
├── xirr.ts          # Money-Weighted Return (Newton-Raphson solver)
├── twr.ts           # Time-Weighted Return (sub-period chaining)
├── cagr.ts          # Compound Annual Growth Rate
├── realReturn.ts    # Inflation-adjusted return formula
├── fireTrajectory.ts # Retirement date projection + FIRE number
├── monteCarlo.ts    # Monte Carlo simulation (runs in Web Worker)
├── allocation.ts    # Asset class and geographic breakdown
├── benchmarks.ts    # Portfolio vs benchmark comparison
└── index.ts
```

### XIRR Implementation

Newton-Raphson iterative solver. Matches Excel XIRR output to 4 decimal places.

```typescript
// packages/calculations/src/xirr.ts

interface CashFlow {
  date: Date
  amount: number    // negative = outflow (buy/contribution), positive = inflow (sell/ending value)
}

export function calculateXIRR(cashFlows: CashFlow[], guess = 0.1): number {
  const TOLERANCE = 1e-6
  const MAX_ITERATIONS = 100

  let rate = guess

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const { npv, dnpv } = cashFlows.reduce(
      (acc, cf) => {
        const t = daysBetween(cashFlows[0].date, cf.date) / 365
        const factor = Math.pow(1 + rate, t)
        acc.npv += cf.amount / factor
        acc.dnpv -= (t * cf.amount) / (factor * (1 + rate))
        return acc
      },
      { npv: 0, dnpv: 0 }
    )

    const newRate = rate - npv / dnpv

    if (Math.abs(newRate - rate) < TOLERANCE) return newRate
    rate = newRate
  }

  throw new Error('XIRR did not converge')
}
```

### TWR Implementation

```typescript
// packages/calculations/src/twr.ts

export function calculateTWR(subPeriods: { startValue: number; endValue: number; cashFlows: number }[]): number {
  return subPeriods.reduce((product, period) => {
    const adjustedStart = period.startValue + period.cashFlows
    const periodReturn = (period.endValue - adjustedStart) / adjustedStart
    return product * (1 + periodReturn)
  }, 1) - 1
}
```

### Real Return Formula

```typescript
// packages/calculations/src/realReturn.ts

export function toRealReturn(nominalReturn: number, inflationRate: number): number {
  // Fisher equation — NOT simple subtraction
  return (1 + nominalReturn) / (1 + inflationRate) - 1
}
```

### FIRE Trajectory Engine

```typescript
// packages/calculations/src/fireTrajectory.ts

export interface FIREProjection {
  retirementDate: Date
  yearsToFIRE: number
  fireVariant: 'lean' | 'standard' | 'fat' | 'coast' | 'barista'
  progressPercent: number
  coastFIREDate: Date | null
  scenarios: {
    conservative: Date   // 4% real return
    moderate: Date       // 6% real return
    optimistic: Date     // 8% real return
  }
}

export function projectFIRE(
  currentPortfolioValue: number,
  monthlyContribution: number,
  fireNumber: number,
  realReturnRate = 0.05,   // default 5% real
  currentAge: number,
  targetRetirementAge: number
): FIREProjection {
  const monthlyRate = realReturnRate / 12

  // Solve for n: FV = PV(1+r)^n + PMT * [((1+r)^n - 1) / r]
  // Binary search for n since closed form requires Lambert W function
  const monthsToFIRE = solveForMonths(currentPortfolioValue, monthlyContribution, fireNumber, monthlyRate)

  const retirementDate = addMonths(new Date(), monthsToFIRE)
  const coastFIREDate = calculateCoastFIREDate(currentPortfolioValue, fireNumber, currentAge, realReturnRate)

  return {
    retirementDate,
    yearsToFIRE: monthsToFIRE / 12,
    fireVariant: classifyFIREVariant(fireNumber / 25),
    progressPercent: Math.min(100, (currentPortfolioValue / fireNumber) * 100),
    coastFIREDate,
    scenarios: {
      conservative: projectFIREDate(currentPortfolioValue, monthlyContribution, fireNumber, 0.04),
      moderate: projectFIREDate(currentPortfolioValue, monthlyContribution, fireNumber, 0.06),
      optimistic: projectFIREDate(currentPortfolioValue, monthlyContribution, fireNumber, 0.08),
    },
  }
}
```

### Monte Carlo (Web Worker)

Monte Carlo simulation must run in a **Web Worker** to avoid blocking the UI thread. 1,000 iterations of 50-year projections is CPU-intensive.

```typescript
// apps/web/workers/monteCarlo.worker.ts
// Runs in a Web Worker — does not block UI

self.onmessage = (e: MessageEvent<MonteCarloInput>) => {
  const { portfolioValue, monthlyContribution, fireNumber, yearsToProject, assetAllocation } = e.data
  const results: number[] = []

  for (let sim = 0; sim < 1000; sim++) {
    const finalValue = simulatePath(portfolioValue, monthlyContribution, yearsToProject, assetAllocation)
    results.push(finalValue)
  }

  const sorted = results.sort((a, b) => a - b)
  self.postMessage({
    p10: sorted[100],   // 10th percentile
    p50: sorted[500],   // median
    p90: sorted[900],   // 90th percentile
    successRate: results.filter(v => v >= fireNumber).length / 1000,
  })
}
```

---

## 7. Document Ingestion Pipeline

### Overview

```
User uploads file
       │
       ▼
  File type detection
  ┌────┴────┐
CSV/XLSX   PDF
  │          │
  ▼          ▼
SheetJS   Is PDF digital?
(client)  ┌───┴───┐
          │       │
       Digital  Scanned
          │       │
       PDF.js  AWS Textract
       (client) (server)
          │       │
          └───┬───┘
              ▼
     Extracted text / rows
              │
    ┌─────────┴──────────┐
    │                    │
FREE tier             PREMIUM tier
(or 1st use)
    │                    │
Column mapping       AI Parser (GPT-4o mini)
interface            Structured output
    │                    │
    └──────────┬─────────┘
               ▼
    Transaction validation
    + duplicate detection
               │
               ▼
    User review (flagged fields)
               │
               ▼
    Committed to IndexedDB / cloud
```

### AI Parser (Premium)

The AI parsing service receives extracted text (not the original file — privacy preserved) and returns structured JSON.

```typescript
// services/api/src/services/aiParser.ts

const PARSE_PROMPT = `
You are a financial transaction parser. Extract all transactions from the following broker statement text.

Return a JSON array where each transaction has:
- date: ISO 8601 date string
- assetName: string (ticker or security name as shown)
- transactionType: "buy" | "sell" | "dividend" | "fee" | "transfer"
- quantity: number (null if not applicable)
- pricePerUnit: number (null if not applicable)
- currency: ISO 4217 currency code
- totalAmount: number
- confidence: number between 0 and 1 for each field

Mark confidence below 0.9 on any field you are uncertain about.
If a field is missing from the statement, set it to null and confidence to 0.

Text:
{{EXTRACTED_TEXT}}
`

export async function parseWithAI(extractedText: string): Promise<ParsedTransaction[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: PARSE_PROMPT.replace('{{EXTRACTED_TEXT}}', extractedText) }],
    response_format: { type: 'json_object' },
    temperature: 0,   // deterministic parsing
  })

  const parsed = JSON.parse(response.choices[0].message.content!)
  return parsed.transactions
}
```

### Column Mapping Fingerprint (Free Tier Memory)

When a free user maps columns, the mapping is stored against a fingerprint of the file's header row. Next import from the same broker is automatic.

```typescript
// packages/parsers/src/fingerprint.ts

export function generateHeaderFingerprint(headers: string[]): string {
  // Normalise: lowercase, trim, sort, hash
  const normalised = headers
    .map(h => h.toLowerCase().trim().replace(/\s+/g, '_'))
    .sort()
    .join('|')
  return crypto.createHash('sha256').update(normalised).digest('hex').slice(0, 16)
}
```

### Duplicate Detection

```typescript
// packages/calculations/src/deduplication.ts

export function generateTransactionHash(tx: Transaction): string {
  // Deterministic hash from the combination that defines uniqueness
  const key = `${tx.date.toISOString().slice(0, 10)}|${tx.assetId}|${tx.transactionType}|${tx.quantity}|${tx.totalAmount}|${tx.currency}`
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 16)
}
```

---

## 8. Backend Architecture

### API Server Structure

```
services/api/src/
├── routes/
│   ├── auth.ts          # POST /auth/register, /auth/login, /auth/refresh
│   ├── sync.ts          # GET/PUT /sync (encrypted blob only)
│   ├── parse.ts         # POST /parse (AI document parsing)
│   ├── market.ts        # GET /market/prices, /market/exchange-rates
│   ├── cpi.ts           # GET /cpi/:country
│   ├── numbeo.ts        # GET /numbeo/city/:city
│   ├── brokers.ts       # GET/POST /brokers/connect, /brokers/sync
│   └── account.ts       # DELETE /account (GDPR deletion)
├── services/
│   ├── auth.service.ts
│   ├── sync.service.ts
│   ├── aiParser.service.ts
│   ├── marketData.service.ts
│   ├── cpi.service.ts
│   └── brokerSync.service.ts
├── jobs/
│   ├── brokerSync.job.ts    # Daily broker sync via BullMQ
│   ├── marketRefresh.job.ts # Daily market price refresh
│   └── cpiRefresh.job.ts    # Monthly CPI refresh
└── middleware/
    ├── auth.middleware.ts
    └── rateLimit.middleware.ts
```

### What the Server Knows About Each User

```
Premium user server footprint:
├── users table: id, email, passwordHash (Argon2id), createdAt, countryOfResidence
├── subscriptions table: userId, tier, status, expiresAt, stripeCustomerId
└── encrypted_data table: userId, salt, encryptedData, iv, dataVersion, lastSyncedAt

Free user server footprint:
└── users table: id, email, passwordHash, createdAt (no financial data at all)
```

The server has **no knowledge** of a premium user's transactions, assets, portfolio value, FIRE goals, or real estate holdings. It only knows a blob of ciphertext.

### Auth Flow

```
Register:
  POST /auth/register { email, password }
  → Server: hash password with Argon2id + random salt
  → Store: { email, passwordHash } only
  → Return: JWT access token (15min) + refresh token (30 days)

Login:
  POST /auth/login { email, password }
  → Server: verify Argon2id hash
  → Return: JWT + refresh token
  → Client: derive encryption key from password (PBKDF2) — never sent to server

First premium sync:
  Client generates encryption salt
  PUT /sync { salt, encryptedData, iv, dataVersion: 0 }
  → Server stores ciphertext
```

### Rate Limiting

```typescript
// Protect the AI parsing endpoint from abuse (it costs money per call)
app.register(fastifyRateLimit, {
  global: true,
  max: 100,          // 100 requests per minute per IP
  timeWindow: '1 minute',
})

// AI parse endpoint — stricter
app.register(fastifyRateLimit, {
  routeOverride: { max: 10, timeWindow: '1 hour' },  // 10 AI parses per hour per user
})
```

---

## 9. Data Schema

### PostgreSQL Schema (Prisma)

```prisma
// services/api/prisma/schema.prisma

model User {
  id                String         @id @default(uuid())
  email             String         @unique
  passwordHash      String
  countryOfResidence String        @default("PL")  // ISO 3166-1 alpha-2
  createdAt         DateTime       @default(now())
  lastLoginAt       DateTime?
  subscription      Subscription?
  encryptedData     EncryptedData?
  parseTrialUsed    Boolean        @default(false)
  brokerConnections BrokerConnection[]
}

model Subscription {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  tier            Tier     @default(FREE)
  status          SubStatus @default(ACTIVE)
  expiresAt       DateTime?
  stripeCustomerId String?
  createdAt       DateTime @default(now())
}

enum Tier { FREE ANNUAL MONTHLY LIFETIME }
enum SubStatus { ACTIVE CANCELLED EXPIRED }

model EncryptedData {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  salt          String   // base64-encoded random bytes — NOT secret
  encryptedData String   // base64-encoded AES-256-GCM ciphertext
  iv            String   // base64-encoded initialization vector
  dataVersion   Int      @default(0)  // for optimistic concurrency
  lastSyncedAt  DateTime @default(now())
  // NOTE: This table stores ONLY ciphertext. The server cannot read any of it.
}

model BrokerConnection {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  broker        BrokerType
  accessToken   String   // encrypted with server-side key (not user key — for sync jobs)
  refreshToken  String?
  lastSyncedAt  DateTime?
  createdAt     DateTime @default(now())
}

enum BrokerType { REVOLUT TRADING_212 DEGIRO }

// Public market data — NOT user data, no encryption needed
model MarketPrice {
  symbol    String
  date      DateTime
  price     Decimal
  currency  String
  source    String
  @@id([symbol, date])
}

model ExchangeRate {
  baseCurrency  String
  quoteCurrency String
  date          DateTime
  rate          Decimal
  source        String   @default("ECB")
  @@id([baseCurrency, quoteCurrency, date])
}

model CPIDataPoint {
  country     String    // ISO 3166-1 alpha-2
  yearMonth   String    // "2026-03"
  hicp        Decimal   // Harmonised Index of Consumer Prices
  source      String    @default("Eurostat")
  @@id([country, yearMonth])
}

model AIParseTemplate {
  id              String   @id @default(uuid())
  sourceFingerprint String @unique
  brokerName      String?  // inferred by AI, optional
  mappingSchema   Json     // column index → field name mapping
  usageCount      Int      @default(1)
  createdAt       DateTime @default(now())
}
```

---

## 10. External Integrations

### Market Data Strategy

**Primary source:** Alpha Vantage (historical OHLCV, 25 requests/day free tier)
**Real-time prices:** Yahoo Finance via `yahoo-finance2` npm package (unofficial but widely used)
**Fallback:** Open Exchange Rates for FX, Financial Modeling Prep for additional coverage

All market data is **cached in PostgreSQL** with a daily refresh job. Users are never blocked on external API calls.

```typescript
// services/api/src/services/marketData.service.ts

export async function getPrice(symbol: string, date: Date): Promise<number> {
  // 1. Check PostgreSQL cache
  const cached = await prisma.marketPrice.findFirst({
    where: { symbol, date: { gte: startOfDay(date), lte: endOfDay(date) } }
  })
  if (cached) return Number(cached.price)

  // 2. Fetch from Alpha Vantage / Yahoo Finance
  const price = await fetchFromProvider(symbol, date)

  // 3. Cache and return
  await prisma.marketPrice.upsert({ ... })
  return price
}
```

### Eurostat HICP API Integration

```typescript
// services/api/src/services/cpi.service.ts

const EUROSTAT_BASE = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data'

export async function getHICP(country: string, yearMonth: string): Promise<number> {
  const cached = await prisma.cPIDataPoint.findUnique({
    where: { country_yearMonth: { country, yearMonth } }
  })
  if (cached) return Number(cached.hicp)

  // Dataset: prc_hicp_mmor (monthly rates of change)
  const url = `${EUROSTAT_BASE}/prc_hicp_mmor?geo=${country}&time=${yearMonth}&coicop=CP00`
  const data = await fetch(url).then(r => r.json())
  const hicp = extractHICPValue(data)

  await prisma.cPIDataPoint.create({ data: { country, yearMonth, hicp } })
  return hicp
}
```

### Numbeo Integration

```typescript
// services/api/src/services/numbeo.service.ts
// Cached in Redis (monthly refresh — Numbeo data changes slowly)

export async function getCityPropertyData(city: string, country: string): Promise<NumbeoPropertyData> {
  const cacheKey = `numbeo:property:${country}:${city}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const data = await fetchNumbeoPropertyData(city, country)

  // Cache for 30 days
  await redis.setex(cacheKey, 30 * 24 * 60 * 60, JSON.stringify(data))
  return data
}
```

### Broker API Connections (V1 — Premium)

| Broker | Method | Auth | Notes |
|---|---|---|---|
| **Revolut** | Open Banking (PSD2) | OAuth 2.0 | EU-regulated; requires consent renewal every 90 days |
| **Trading 212** | Unofficial API | API Key | User generates key in Trading 212 settings; read-only |
| **DEGIRO** | Session-based | Username/password | No official API; session-based scraping is fragile — deprioritise for V1 |

**Note on DEGIRO:** DEGIRO does not have an official public API. Implement DEGIRO as file-upload-only for V1. Add API sync in V2 if they open their API or a stable community library emerges.

**Broker token storage:** Broker access tokens are stored server-side encrypted with a **server-managed key** (not the user's key). This is necessary because broker sync jobs run on the server without user interaction. This is an intentional exception to zero-knowledge — broker tokens are not financial data, they are access credentials, and this exception is disclosed to users.

---

## 11. Infrastructure & Deployment

### Services Layout

```
Vercel (EU region)
└── Next.js app (frontend + API routes as thin proxies)

Fly.io (fra = Frankfurt, EU) — GDPR compliance
├── API Server (Fastify)         2 shared-CPU-1x instances
├── PostgreSQL (Fly Postgres)    1 instance, daily backups
├── Redis (Fly Redis)            1 instance (market data cache)
└── BullMQ Workers               1 instance (async jobs)
```

### Why Fly.io over AWS/GCP

- Frankfurt region = EU data residency for GDPR
- Simple PostgreSQL managed hosting with daily backups
- Significantly cheaper than AWS for this scale
- No DevOps complexity for a solo/small team at V1
- Easy migration path to AWS if scale demands it

### Environment Variables

```bash
# API Server
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...                    # 256-bit random
JWT_REFRESH_SECRET=...
OPENAI_API_KEY=...
AWS_TEXTRACT_KEY=...
ALPHA_VANTAGE_API_KEY=...
STRIPE_SECRET_KEY=...

# Never stored: user encryption keys, user passwords (only Argon2 hashes)
```

### CI/CD

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  test:
    # Run Vitest unit tests (especially calculation engine tests)
    # Run Playwright E2E tests

  deploy-api:
    # fly deploy --app firetrack-api

  deploy-web:
    # Vercel deploys automatically on push to main
```

---

## 12. Security Architecture

### Security Layers

| Layer | Mechanism |
|---|---|
| Transport | TLS 1.3 (enforced by Vercel + Fly.io) |
| Authentication | JWT (15min access) + refresh token (30 days, rotated on use) |
| Password storage | Argon2id, 64MB memory, 3 iterations, 4 parallelism |
| Financial data (premium) | AES-256-GCM, client-side, user-key derived via PBKDF2 600K iterations |
| Financial data (free) | Never leaves browser — IndexedDB, no server round-trip |
| Broker tokens | AES-256-GCM, server-managed key, Fly secrets |
| SQL injection | Prisma ORM (parameterised queries) |
| Rate limiting | Fastify rate-limit plugin; AI parse endpoint strictly limited |
| CSRF | SameSite=Strict cookies for auth tokens |

### GDPR Technical Controls

| Requirement | Implementation |
|---|---|
| Right to erasure | `DELETE /account` deletes user row + cascades to all tables; cloud data gone within 24h |
| Right to portability | `GET /account/export` returns decrypted JSON (client-side decryption, then download) |
| Data minimisation | Free tier: server stores only email + password hash; no financial data |
| Processing transparency | Privacy policy + Network Inspector guide + open-source encryption code |
| Data residency | All infrastructure in EU (Fly.io Frankfurt, Vercel EU edge) |

### Open Source Commitment

The `packages/crypto` package is published to GitHub under MIT licence. It contains only the encryption/decryption/key derivation logic — no application business logic. This enables community security review without exposing product code.

---

## 13. Architecture Decision Records (ADRs)

### ADR-001: Next.js as Frontend Framework
**Decision:** Use Next.js 14 with App Router.
**Context:** Need SSR for auth/marketing pages (SEO, fast first load) but client-side rendering for financial views (zero-knowledge enforcement).
**Consequences:** App Router enables mixing server and client components per-page. Financial data pages are explicitly `'use client'`. Auth and marketing pages are server-rendered. Vercel deployment is trivial.
**Alternatives rejected:** Vite + React SPA (no SSR); Remix (less mature for this pattern); SvelteKit (excellent but smaller ecosystem for financial UI components).

---

### ADR-002: Web Crypto API for Encryption (not libsodium.js)
**Decision:** Use the native browser Web Crypto API for all encryption operations.
**Context:** Zero-knowledge encryption requires a trustworthy, auditable cryptographic implementation.
**Consequences:** No third-party library dependency in the critical encryption path. Web Crypto is available in all supported browsers. PBKDF2 (600K iterations) and AES-256-GCM are both supported natively. The open-sourced `packages/crypto` module is small and easily auditable.
**Alternatives rejected:** libsodium.js (excellent but adds ~300KB WASM dependency; harder to audit for non-experts); tweetnacl (smaller but uses XSalsa20-Poly1305, less universally understood than AES-GCM).

---

### ADR-003: Single-Blob Cloud Sync (not row-level sync)
**Decision:** Encrypt and sync the user's entire portfolio as a single JSON blob.
**Context:** Zero-knowledge means the server cannot understand the data structure. Row-level sync would require the server to know the schema.
**Consequences:** Simple server data model (one row per user). Download entire portfolio on sync (~2MB at 10K transactions). Optimistic concurrency via `dataVersion` counter. Password change requires re-encrypting one blob (not thousands of rows).
**Alternatives rejected:** Encrypted row-per-transaction (server would know transaction count, timing — metadata leakage); client-side encryption of each row separately (complex, no benefit over blob).

---

### ADR-004: Client-Side Calculations
**Decision:** All financial calculations (XIRR, TWR, retirement trajectory, Monte Carlo) run in the browser.
**Context:** The server cannot calculate on data it cannot read. Calculations must be client-side to be consistent with the zero-knowledge architecture.
**Consequences:** Shared TypeScript calculation package used by both browser and Node.js test harnesses. Monte Carlo simulation runs in a Web Worker to avoid blocking the UI. Calculations are deterministic — same inputs always produce the same result regardless of device.
**Alternatives rejected:** Server-side calculation with selective decryption (breaks zero-knowledge guarantee); server-side calculation on metadata only (insufficient for accurate XIRR/TWR).

---

### ADR-005: OpenAI GPT-4o Mini for Document Parsing
**Decision:** Use GPT-4o mini with `response_format: json_object` for AI document parsing.
**Context:** Need to extract structured transaction data from arbitrary broker documents. Accuracy and cost are the key trade-offs.
**Consequences:** Very high accuracy on tabular data extraction (~95%+ on well-formatted CSVs/PDFs). Temperature=0 for deterministic output. Cheap: GPT-4o mini at ~$0.15/1M input tokens = well under $0.01 per typical broker statement. Confidence scoring implemented in prompt — uncertain fields are flagged, never silently accepted.
**Alternatives rejected:** GPT-4o full (3x more expensive, negligible accuracy gain on structured data); Claude 3.5 Haiku (similar cost/quality but OpenAI's structured output mode is more reliable for JSON); fine-tuned model (requires training data we don't have at launch).

---

### ADR-006: AWS Textract for Scanned PDF OCR
**Decision:** Use AWS Textract for server-side OCR of scanned (non-digital) PDFs.
**Context:** Some broker statements are scanned images, not digital PDFs. Client-side OCR (Tesseract.js) is too slow and inaccurate for financial documents.
**Consequences:** Scanned PDFs are the only case where file content reaches a third-party service. Privacy disclosure: users are informed that scanned PDF content is processed by AWS Textract. Tesseract.js used for low-confidence pre-check client-side to determine if a PDF needs server-side OCR.
**Alternatives rejected:** Tesseract.js only (too slow, ~70% accuracy on financial tables); Google Cloud Vision (similar quality, more expensive); server-side Tesseract (better than browser but still inferior to Textract for tables).

---

### ADR-007: PostgreSQL over MongoDB
**Decision:** Use PostgreSQL as the primary database.
**Context:** Financial applications require ACID transactions. The encrypted blob model means we don't need a flexible document schema.
**Consequences:** Reliable, proven, ACID-compliant. Prisma ORM provides excellent TypeScript integration. Market data tables benefit from indexed range queries (date ranges for historical prices).
**Alternatives rejected:** MongoDB (no ACID transactions in V1; document flexibility is not needed when financial data is encrypted blobs); SQLite (not suitable for multi-instance deployment).

---

### ADR-008: Fly.io Frankfurt for EU Data Residency
**Decision:** Deploy all backend infrastructure on Fly.io in the Frankfurt (fra) region.
**Context:** GDPR compliance requires EU data residency. Primary target market is European.
**Consequences:** All user data stored in EU. Latency is excellent for EU users. Migration path to AWS exists if needed.
**Alternatives rejected:** AWS Frankfurt (significantly more expensive for this scale); Hetzner (excellent price but limited managed services); Supabase (good PostgreSQL but would add a third infrastructure dependency).

---

## 14. Open Question Resolutions

From PRD Section 12:

| ID | Question | Resolution |
|---|---|---|
| OQ-01 | Which market data API? | **Alpha Vantage** for historical data (25 req/day free) + **yahoo-finance2** npm package for real-time prices. Cache everything in PostgreSQL. Upgrade to paid Alpha Vantage tier (~$50/month) once user base exceeds 500 paid users. |
| OQ-02 | Encryption library? | **Web Crypto API** (native browser). No external library. AES-256-GCM + PBKDF2 (600K iterations). See ADR-002. |
| OQ-03 | Scanned PDF OCR? | **pdfjs-dist** client-side for digital PDFs. **AWS Textract** server-side for scanned images. Tesseract.js client-side pre-check determines which path is needed. See ADR-006. |
| OQ-04 | Password change re-encryption? | Full client-side re-encryption: derive old key → decrypt all blobs → generate new salt → derive new key → re-encrypt → upload atomically. Server performs a single transaction swap. No data is ever decrypted server-side. |
| OQ-05 | Free tier server calls? | Free tier calls the server **only for public market data** (prices, exchange rates, CPI, Numbeo) — none of this is personal financial data. All personal financial data (transactions, assets, FIRE goals) lives only in IndexedDB. |

---

## 15. Component Interaction Diagrams

### File Import Flow (Free Tier)

```
User                  Browser                 API Server
 │                       │                        │
 │──Upload CSV──────────►│                        │
 │                       │ Parse headers           │
 │                       │ Check fingerprint       │
 │                       │ (in IndexedDB)          │
 │                       │                        │
 │◄──Column mapping UI───│ (if new format)         │
 │──Map columns─────────►│                        │
 │                       │ Store mapping           │
 │                       │ (IndexedDB)             │
 │                       │                        │
 │                       │──POST /market/prices──►│
 │                       │◄──Current prices───────│
 │                       │                        │
 │                       │ Calculate XIRR/TWR      │
 │                       │ Project FIRE date       │
 │                       │ (all in browser)        │
 │                       │                        │
 │◄──Dashboard updated───│                        │
```

### File Import Flow (Premium — AI Parse)

```
User                  Browser                 API Server          OpenAI
 │                       │                        │                  │
 │──Upload PDF──────────►│                        │                  │
 │                       │ PDF.js text extract     │                  │
 │                       │──POST /parse──────────►│                  │
 │                       │  {extractedText}        │──GPT-4o mini──►│
 │                       │                        │◄──JSON + conf.───│
 │                       │◄──ParsedTransactions───│                  │
 │                       │                        │                  │
 │◄──Review UI (amber/───│ (flagged low-conf)      │                  │
 │    red fields)        │                        │                  │
 │──Confirm/override────►│                        │                  │
 │                       │ Encrypt data            │                  │
 │                       │──PUT /sync────────────►│                  │
 │                       │  {ciphertext}           │                  │
 │                       │◄──200 OK───────────────│                  │
```

### Premium Cloud Sync Flow

```
Browser (Device A)              API Server              Browser (Device B)
        │                            │                            │
        │ Derive key (from password) │                            │
        │ Encrypt portfolio JSON     │                            │
        │──PUT /sync──────────────►  │                            │
        │  {salt, ciphertext, iv,    │                            │
        │   dataVersion: N}          │                            │
        │◄──200 {dataVersion: N+1}── │                            │
        │                            │                            │
        │                            │◄──GET /sync──────────────  │
        │                            │──{salt, ciphertext, iv}──► │
        │                            │   dataVersion: N+1         │
        │                            │                     Derive key │
        │                            │                     Decrypt    │
        │                            │                     Update UI  │
```

---

## Summary: What Gets Built

### V1 Build Targets (in priority order)

| Priority | Component | Complexity | Notes |
|---|---|---|---|
| P0 | Authentication (register/login/JWT) | Low | Standard auth; no surprises |
| P0 | IndexedDB local storage (Dexie) | Low | Free tier data layer |
| P0 | CSV/Excel file parsing (SheetJS + column mapping) | Medium | Core import for free tier |
| P0 | FIRE trajectory calculation engine | Medium | The product's north star output |
| P0 | Real return calculation (HICP integration) | Medium | Primary differentiator vs trefolio |
| P0 | Dashboard UI (retirement date prominent) | Medium | Users must see their FIRE date on first login |
| P1 | Zero-knowledge encryption + cloud sync | High | Required for premium tier |
| P1 | AI document parsing (GPT-4o mini) | Medium | Premium conversion driver |
| P1 | Digital PDF parsing (pdfjs-dist) | Low | Covers most modern broker PDFs |
| P1 | XIRR + TWR calculations | Medium | Expected by FIRE community |
| P1 | Market price integration (Alpha Vantage) | Medium | Required for holding valuations |
| P2 | Monte Carlo simulation (Web Worker) | High | Premium feature; complex |
| P2 | Broker API connections (Revolut, T212) | High | Premium feature; OAuth complexity |
| P2 | Real estate (manual + Numbeo enrichment) | Low | Manual entry is simple |
| P2 | Scanned PDF OCR (AWS Textract) | Medium | Edge case; most PDFs are digital |
| P3 | Custom benchmarks | Low | Premium nice-to-have |
| P3 | Stripe subscription integration | Medium | Required before charging |

---

*Output saved to: `_bmad-output/planning-artifacts/architecture-firetrack.md`*
*Next phase: Epics & Stories — invoke `@bmad-agent-pm` Create Epics and Stories using the PRD and Architecture.*
