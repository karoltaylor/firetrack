# Epic 8: Zero-Knowledge Cloud Sync (Premium)
**Priority:** P1 — Core premium feature; enables multi-device access and cloud backup
**PRD refs:** FR-09.3–FR-09.8, FR-10.2, NFR-03
**Arch refs:** Web Crypto API, AES-256-GCM, PBKDF2, single-blob sync, optimistic concurrency, password change re-encryption

## Goal
Premium users' financial data is encrypted client-side with a key only they hold, then synced to the cloud. FIREtrack cannot read the data. Multi-device access works. Password change triggers full client-side re-encryption. The encryption code is open-sourced.

## Stories

---

### Story 8.1 — Crypto Package: Key Derivation & Encrypt/Decrypt
**As a** developer,
**I want** the `@firetrack/crypto` package implemented with Web Crypto API,
**so that** all encryption operations are correct, tested, and open-sourceable.

**Acceptance Criteria:**
- [ ] `deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>` — PBKDF2, SHA-256, 600,000 iterations, 256-bit key
- [ ] `encrypt(key: CryptoKey, data: object): Promise<EncryptedBlob>` — AES-256-GCM with random 12-byte IV
- [ ] `decrypt(key: CryptoKey, blob: EncryptedBlob): Promise<object>` — AES-256-GCM decryption
- [ ] `generateSalt(): Uint8Array` — 16 cryptographically random bytes
- [ ] `bufferToBase64(buf: ArrayBuffer): string` and `base64ToBuffer(str: string): ArrayBuffer` utilities
- [ ] All functions use only `crypto.subtle` (Web Crypto API) — zero external dependencies
- [ ] Test suite (Vitest): round-trip encrypt→decrypt preserves data exactly; same password+salt always derives same key; different salts produce different keys; tampered ciphertext throws on decrypt
- [ ] Package published to GitHub as open-source (MIT licence)
- [ ] README includes: algorithm choices, parameter rationale, how to verify

**Technical notes:**
- 600,000 PBKDF2 iterations = OWASP 2024 recommendation for SHA-256
- IV must be unique per encryption call — `crypto.getRandomValues(new Uint8Array(12))`
- Do NOT reuse IVs — each encrypt call generates fresh IV

---

### Story 8.2 — Cloud Sync API Endpoints
**As a** developer,
**I want** API endpoints for uploading and downloading the encrypted portfolio blob,
**so that** premium users can sync data across devices.

**Acceptance Criteria:**
- [ ] `PUT /api/sync` — accepts `{ salt, encryptedData, iv, dataVersion }`, stores in `EncryptedData` table
- [ ] `GET /api/sync` — returns `{ salt, encryptedData, iv, dataVersion, lastSyncedAt }` for authenticated user
- [ ] Optimistic concurrency: `PUT /api/sync` accepts only if `dataVersion === currentVersion` — returns `409 Conflict` with current version if stale
- [ ] Client resolves `409` by fetching latest blob, merging locally, then retrying upload with updated `dataVersion`
- [ ] `PUT /api/sync` only accessible to premium users — returns `403` for free-tier users
- [ ] Request/response payloads are pure base64 strings — server performs zero inspection of ciphertext
- [ ] `lastSyncedAt` updated on every successful `PUT`
- [ ] Max blob size: 10MB (covers 10,000 transactions with room to spare)

---

### Story 8.3 — Premium Onboarding: First Sync Flow
**As a** new premium user,
**I want** a clear setup flow that explains zero-knowledge encryption and gets my data synced,
**so that** I understand what I'm signing up for and my data is safely backed up.

**Acceptance Criteria:**
- [ ] After upgrading to premium (or on first premium login): encryption setup screen appears
- [ ] Screen explains in plain language: "Your data is encrypted with your password before it leaves your device. FIREtrack cannot read it. If you forget your password, your cloud data cannot be recovered."
- [ ] User prompted to save a key recovery backup: download a `.fbt` backup file (same as local backup in Story 2.4)
- [ ] "I have saved my backup" checkbox required before proceeding
- [ ] On proceed: salt generated client-side, key derived from password + salt, all IndexedDB data serialised to JSON, encrypted, uploaded via `PUT /api/sync`
- [ ] Progress indicator during upload
- [ ] On success: "Your portfolio is now securely synced to the cloud"

---

### Story 8.4 — Multi-Device Sync
**As a** premium user,
**I want** my portfolio to be available on any device I log into,
**so that** I'm not tied to one browser.

**Acceptance Criteria:**
- [ ] On login (premium): after auth, `GET /api/sync` fetches encrypted blob
- [ ] Client derives key from password + fetched salt, decrypts blob, loads data into IndexedDB
- [ ] If local IndexedDB has newer `dataVersion` than server: local data uploaded (replaces server)
- [ ] If server has newer `dataVersion` than local: server data downloaded and replaces local
- [ ] If `dataVersion` conflict (same version, different content): user prompted to choose: "Use this device's data" or "Use cloud data"
- [ ] Sync status indicator in app header: "Synced 2 min ago" / "Syncing..." / "Sync failed — tap to retry"
- [ ] Auto-sync triggered: on login, after every import, after every manual transaction entry, on app focus after 5+ minutes in background

---

### Story 8.5 — Password Change Re-encryption
**As a** premium user,
**I want** to change my password without losing my cloud data,
**so that** my data remains secure and accessible after a password change.

**Acceptance Criteria:**
- [ ] Password change form: current password, new password, confirm new password
- [ ] Flow: verify current password via `POST /auth/verify-password`; derive old key; fetch ciphertext from `/api/sync`; decrypt with old key; generate new salt; derive new key; re-encrypt; upload new ciphertext + new salt in single atomic `PUT /api/sync`
- [ ] If any step fails: operation aborted, old password/data preserved, user informed of failure
- [ ] Re-encryption happens entirely in the browser — old key and new key never sent to server
- [ ] Progress indicator: "Re-encrypting your data (this may take a moment)..."
- [ ] On success: new Argon2id password hash stored server-side; new salt + ciphertext stored; user notified
- [ ] After password change: user prompted to download a new backup file
