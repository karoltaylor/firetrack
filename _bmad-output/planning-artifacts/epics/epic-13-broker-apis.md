# Epic 13: Broker API Connections (Premium)
**Priority:** P2 — Eliminates manual imports; strong premium retention driver; V1 targets Revolut + T212
**PRD refs:** FR-03
**Arch refs:** BullMQ daily sync jobs, broker token storage (encrypted), T212 API, Open Banking OAuth

## Goal
Premium users connect their brokers via API and get their portfolio synced daily without any manual uploads. V1 targets Trading 212 (API key) and Revolut (file export for now; Open Banking in V2). Broker tokens stored encrypted server-side.

## Stories

---

### Story 13.1 — Broker Connection Framework
**As a** developer,
**I want** a generic broker connection framework,
**so that** adding new brokers in the future requires only a new adapter, not a full pipeline.

**Acceptance Criteria:**
- [ ] `BrokerAdapter` interface defined in `packages/types`: `{ name, connect(credentials), fetchTransactions(since), fetchHoldings(), disconnect }`
- [ ] Broker credentials stored in `BrokerConnection` table, encrypted with server-side key (separate from user ZK key)
- [ ] `POST /api/brokers/:broker/connect` accepts credentials, validates connection, stores encrypted
- [ ] `DELETE /api/brokers/:broker/disconnect` removes stored credentials, cancels sync job
- [ ] `GET /api/brokers` returns list of connected brokers with status and last sync time
- [ ] BullMQ daily sync job (`sync:broker`) runs at 03:00 UTC for each connected broker
- [ ] On sync failure: retry 3 times with exponential backoff; after 3 failures, email user "Your {broker} connection needs attention"
- [ ] Sync results: new transactions fetched since `lastSyncedAt`, deduplicated against existing, appended to user's transaction store (encrypted cloud for premium)

---

### Story 13.2 — Trading 212 Connection
**As a** user with a Trading 212 account,
**I want** to connect it via API key,
**so that** my T212 portfolio syncs automatically every day.

**Acceptance Criteria:**
- [ ] "Connect Trading 212" form: single API key input field
- [ ] Instructions shown: link to T212's API key creation page, step-by-step guidance
- [ ] On connect: `GET https://live.trading212.com/api/v0/equity/account/info` called to validate key
- [ ] On success: connection saved, initial full history sync triggered immediately
- [ ] Initial sync fetches all historical orders via `GET /api/v0/equity/history/orders`
- [ ] Daily sync fetches orders since `lastSyncedAt`
- [ ] T212 transaction type mapping: `MARKET_BUY` → `buy`, `MARKET_SELL` → `sell`, `DIVIDEND` → `dividend`
- [ ] API key stored encrypted in `BrokerConnection.credentials`
- [ ] API key revocation: disconnect button fetches current key status; if key expired, prompts re-entry

---

### Story 13.3 — DEGIRO Connection (File-Based Sync for V1)
**As a** user with a DEGIRO account,
**I want** a streamlined DEGIRO CSV import experience,
**so that** even without an API, importing from DEGIRO is nearly automatic.

**Acceptance Criteria:**
- [ ] DEGIRO format pre-configured — no manual column mapping required (template seeded from Story 3.3)
- [ ] DEGIRO import wizard: step-by-step instructions for exporting from DEGIRO (with screenshots)
- [ ] File upload auto-detects DEGIRO format from header fingerprint, confirms "DEGIRO format detected"
- [ ] One-click import after detection — no mapping review step needed
- [ ] User can set reminder: "Remind me to import DEGIRO monthly" → monthly in-app notification
- [ ] Note: "DEGIRO does not have a public API. We're monitoring for API access."

**Technical notes:**
- This story is intentionally file-based; it sets up the UX for a future API connection when/if DEGIRO opens an API
- DEGIRO CSV header fingerprint pre-seeded in `AIParseTemplate` table at deployment

---

### Story 13.4 — Revolut File Export Guide (V1)
**As a** user with a Revolut account,
**I want** easy guidance on how to export my Revolut data,
**so that** I can import my holdings quickly without an API connection.

**Acceptance Criteria:**
- [ ] Revolut import wizard: step-by-step guide for exporting transaction history from Revolut app
- [ ] Both CSV and PDF export paths covered (Revolut offers both)
- [ ] Revolut CSV format pre-configured (template pre-seeded)
- [ ] Auto-detection of Revolut format via header fingerprint
- [ ] Note: "Revolut Open Banking integration is on our roadmap"
