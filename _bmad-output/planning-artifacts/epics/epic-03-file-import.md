# Epic 3: File Import — CSV & Excel
**Priority:** P0 — Core free-tier import mechanism
**PRD refs:** FR-02.1–FR-02.10, FR-02.11 (PDF covered in Epic 7)
**Arch refs:** SheetJS, column mapping fingerprint, duplicate detection, import pipeline

## Goal
Users can import transaction history from any broker that exports CSV or Excel files. New formats are handled via a visual column mapping interface that is remembered for future imports. This is the primary data entry mechanism for free-tier users.

## Stories

---

### Story 3.1 — File Upload Component
**As a** user,
**I want** to upload a CSV or Excel file from my broker,
**so that** I can start the import process.

**Acceptance Criteria:**
- [ ] Upload area supports drag-and-drop and file picker
- [ ] Accepted file types: `.csv`, `.xlsx`, `.xls`
- [ ] File size limit: 10MB (covers any realistic broker statement)
- [ ] File type validation — rejected files show clear error: "Please upload a CSV or Excel file"
- [ ] Upload is **client-side only** — file bytes never transmitted to server for CSV/Excel
- [ ] On upload: file parsed client-side via SheetJS, preview of first 5 rows shown
- [ ] User selects which account this file belongs to (account selector from Epic 2)
- [ ] Loading state shown during parsing

**Technical notes:**
- SheetJS (`xlsx` npm package) — runs entirely in browser
- `FileReader` API to read file bytes

---

### Story 3.2 — Column Mapping Interface
**As a** free-tier user uploading a new broker format,
**I want** a visual interface to tell FIREtrack which column means what,
**so that** my transactions are imported correctly.

**Acceptance Criteria:**
- [ ] After upload: if format is unrecognised, column mapping screen appears
- [ ] Screen shows: detected column headers as draggable chips, target field slots (date, ticker, transaction type, quantity, price, currency, total amount)
- [ ] Required fields: date, transaction type, total amount, currency
- [ ] Optional fields: ticker/asset name, quantity, price per unit
- [ ] Date format selector: user specifies date format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, auto-detect)
- [ ] Transaction type mapping: user maps broker-specific values (e.g. "BUY", "Kauf", "Achat") to standard types (buy/sell/dividend/fee)
- [ ] Live preview: mapped columns shown as parsed sample rows (first 3 transactions)
- [ ] "Confirm mapping" saves mapping and proceeds to import review
- [ ] Validation: missing required field mapping → highlighted with error, cannot proceed

**Technical notes:**
- Visual drag-and-drop using `@dnd-kit/core`
- Column header fingerprint generated immediately on file parse (Story 3.3)

---

### Story 3.3 — Column Mapping Memory
**As a** returning user importing from a known broker,
**I want** FIREtrack to remember how to parse that broker's files,
**so that** I never have to re-map the same format twice.

**Acceptance Criteria:**
- [ ] On file upload: header fingerprint computed (SHA-256 of sorted, normalised column headers — first 16 chars)
- [ ] Fingerprint checked against IndexedDB `importMappings` table
- [ ] If match found: mapping applied automatically, user sees "DEGIRO format detected — applying saved mapping" toast
- [ ] User can review and edit the auto-applied mapping before confirming
- [ ] User can save a new mapping as a named profile (e.g. "DEGIRO CSV 2026")
- [ ] Saved mappings listed in settings — user can delete/rename them
- [ ] `POST /api/parse/templates` — if premium user, mapping also stored server-side for cross-device sync

**Technical notes:**
- `generateHeaderFingerprint(headers: string[]): string` from `@firetrack/parsers`
- Fingerprint stored in `importMappings` IndexedDB table with full mapping schema

---

### Story 3.4 — Import Review & Duplicate Detection
**As a** user,
**I want** to review parsed transactions before they are saved, with duplicates clearly flagged,
**so that** I don't accidentally import the same transactions twice.

**Acceptance Criteria:**
- [ ] After column mapping: all parsed transactions displayed in a review table
- [ ] Each row shows: date, asset, type, quantity, price, total amount, currency
- [ ] Duplicate detection: each parsed transaction hashed (date + ticker + type + quantity + total) and compared against existing IndexedDB transactions
- [ ] Duplicates shown with amber highlight and "Already imported" label — deselected by default
- [ ] User can select/deselect individual rows before confirming
- [ ] "Select all" / "Deselect all" / "Deselect duplicates" bulk actions
- [ ] Row count summary: "47 transactions found · 12 already imported · 35 new"
- [ ] "Confirm Import" saves selected transactions to IndexedDB
- [ ] Progress indicator during save (for large files)
- [ ] Success toast: "35 transactions imported successfully"

---

### Story 3.5 — AI Parse Trial (Free Tier)
**As a** free-tier user on my first upload,
**I want** to experience AI auto-parsing once,
**so that** I understand the premium parsing capability before deciding to upgrade.

**Acceptance Criteria:**
- [ ] On first file upload for a new free-tier user: "Try AI parsing — free, one time" banner shown
- [ ] If user accepts: file text extracted client-side, `POST /parse` called with extracted text
- [ ] AI parse result displayed with confidence indicators (green/amber/red per field)
- [ ] After review and confirmation: `parseTrialUsed` set to `true` in IndexedDB
- [ ] On second upload (trial used): banner shows "AI parsing is a Premium feature" with upgrade CTA
- [ ] Upgrade CTA: "See what AI parsing would have mapped for this file" — triggers a preview call that shows results but requires upgrade to import
- [ ] `parseTrialUsed` flag also tracked server-side in `users.parseTrialUsed` column

**Technical notes:**
- Trial uses the same `POST /parse` API as premium (Story 9.1)
- Server checks `user.parseTrialUsed` before charging; first call is free
