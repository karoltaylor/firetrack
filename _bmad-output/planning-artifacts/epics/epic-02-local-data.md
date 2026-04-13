# Epic 2: Free Tier Local Data Layer
**Priority:** P0 — Required for all calculation and UI epics
**PRD refs:** FR-09.1, FR-09.2, FR-10.1, NFR-05
**Arch refs:** Dexie.js, IndexedDB schema, local encrypted export

## Goal
Establish the client-side data layer that all free-tier users rely on. Financial data never leaves the browser. Provides the data substrate for the calculation engine and dashboard.

## Stories

---

### Story 2.1 — Dexie.js Database Schema
**As a** developer,
**I want** the IndexedDB schema initialised via Dexie.js,
**so that** all client-side data operations have a consistent, typed storage layer.

**Acceptance Criteria:**
- [ ] `FIREtrackDatabase` class defined in `apps/web/lib/db.ts` using Dexie.js
- [ ] Tables defined: `transactions`, `assets`, `realEstate`, `accounts`, `fireGoal`, `exchangeRates`, `marketPrices`, `cpiData`, `importMappings`, `parseTrialUsed`
- [ ] All tables have correct indexes as per architecture schema
- [ ] Schema versioning in place — `db.version(1).stores(...)` pattern
- [ ] All table types aligned with `@firetrack/types` interfaces
- [ ] Unit tests verify: add, get, update, delete, query operations on each table
- [ ] Database initialises without errors on Chrome, Firefox, Safari, Edge

**Technical notes:**
- Dexie.js v4 — TypeScript-native, handles IndexedDB versioning/migrations
- All `id` fields are client-generated UUIDs (`crypto.randomUUID()`)

---

### Story 2.2 — Account Management
**As a** user,
**I want** to add and manage accounts (brokers, pension funds, crypto exchanges),
**so that** I can organise my imports by source.

**Acceptance Criteria:**
- [ ] User can add an account: name, type (brokerage / pension / crypto / savings), currency, optional notes
- [ ] Account types: `brokerage`, `pension`, `crypto`, `savings`, `other`
- [ ] User can edit account name and type
- [ ] User can delete an account — warns if account has transactions
- [ ] Deleting account with transactions: user must confirm; all associated transactions are deleted
- [ ] Accounts list displayed in sidebar / import flow account selector
- [ ] Account stored in IndexedDB `accounts` table

---

### Story 2.3 — Manual Transaction Entry
**As a** user,
**I want** to manually add a transaction,
**so that** I can record investments from brokers that have no export functionality.

**Acceptance Criteria:**
- [ ] Manual entry form: account, date, asset name/ticker, transaction type (buy/sell/dividend/fee), quantity, price per unit, currency, total amount
- [ ] Total amount auto-calculated from quantity × price if both provided; user can override
- [ ] Transaction type `dividend`: quantity optional, total amount required
- [ ] Transaction type `fee`: asset optional, total amount required (negative value)
- [ ] Duplicate detection: warn if a transaction with same date, ticker, type, quantity already exists
- [ ] Transaction saved to IndexedDB `transactions` table
- [ ] Transaction list shows all entries with edit/delete per row

---

### Story 2.4 — Local Encrypted Backup Export
**As a** free-tier user,
**I want** to export all my data as an encrypted backup file,
**so that** I don't lose everything if my browser storage is cleared.

**Acceptance Criteria:**
- [ ] "Export Backup" button in settings
- [ ] Export collects all IndexedDB data: transactions, assets, accounts, real estate, FIRE goal, import mappings
- [ ] Data serialised as JSON, encrypted with AES-256-GCM using a user-provided passphrase (separate from login password)
- [ ] Encrypted file downloaded as `firetrack-backup-YYYY-MM-DD.fbt`
- [ ] "Import Backup" button accepts `.fbt` file, prompts for passphrase, decrypts and restores all data
- [ ] Import warns before overwriting existing data
- [ ] After first successful import, user shown reminder: "Back up regularly — your data lives only in this browser"
- [ ] Backup reminder shown once per month (stored in IndexedDB)

**Technical notes:**
- Use `@firetrack/crypto` `encrypt()`/`decrypt()` with passphrase-derived key
- File format: `{ version: 1, iv: "...", ciphertext: "..." }` as JSON

---

### Story 2.5 — Data Export (GDPR Portability)
**As a** user,
**I want** to export all my data as plain JSON or CSV,
**so that** I can take my data to another tool or comply with GDPR portability rights.

**Acceptance Criteria:**
- [ ] "Export Data" in settings — exports unencrypted JSON of all transactions, assets, accounts, FIRE goal
- [ ] Optional: export transactions as flat CSV with all fields as columns
- [ ] Export is client-side only — no server round-trip for free-tier users
- [ ] Exported filename: `firetrack-export-YYYY-MM-DD.json` / `.csv`
- [ ] Premium users: export triggers client-side decrypt → then export (same flow, data decrypted in browser)
