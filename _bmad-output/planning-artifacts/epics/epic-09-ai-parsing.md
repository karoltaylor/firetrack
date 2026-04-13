# Epic 9: AI Document Parsing (Premium)
**Priority:** P1 — Primary premium conversion driver; the "aha moment" for upgrading
**PRD refs:** FR-02.4, FR-02.5, FR-02.6, FR-02.7, FR-02.8
**Arch refs:** OpenAI GPT-4o mini, structured output, confidence scoring, server-side parse endpoint, template learning

## Goal
Premium users upload any broker document — in any format they've never seen before — and FIREtrack's AI extracts transactions automatically with confidence scores. Uncertain fields are flagged for review; nothing is silently accepted. The system learns from repeated formats to improve and reduce AI costs.

## Stories

---

### Story 9.1 — AI Parse API Endpoint
**As a** developer,
**I want** a server-side endpoint that parses extracted document text using GPT-4o mini,
**so that** premium users can auto-import any broker format.

**Acceptance Criteria:**
- [ ] `POST /api/parse` accepts `{ extractedText: string, userId: string }`
- [ ] Premium users only — `403` for free-tier (except trial use tracked in Story 3.5)
- [ ] Calls OpenAI GPT-4o mini with `response_format: { type: "json_object" }` and `temperature: 0`
- [ ] Prompt instructs model to return array of transactions with per-field `confidence` (0–1)
- [ ] Returned fields per transaction: `date`, `assetName`, `transactionType`, `quantity`, `pricePerUnit`, `currency`, `totalAmount`, each with `confidence`
- [ ] If a field cannot be determined: value is `null`, confidence is `0`
- [ ] Rate limit: 10 AI parse calls per user per hour (prevents abuse)
- [ ] Total call cost logged for monitoring (OpenAI usage tracking)
- [ ] Endpoint returns parsed transactions within 30 seconds (NFR-01.2)
- [ ] On OpenAI API failure: graceful error returned, user can fall back to manual column mapping

---

### Story 9.2 — Confidence Scoring UI
**As a** premium user reviewing AI-parsed transactions,
**I want** to see which fields the AI is uncertain about,
**so that** I can verify and correct them before importing.

**Acceptance Criteria:**
- [ ] Each parsed transaction row shows field-level confidence indicators:
  - Green background: confidence ≥ 0.9 (high confidence)
  - Amber background: confidence 0.7–0.89 (review recommended)
  - Red background: confidence < 0.7 (uncertain, requires confirmation)
- [ ] Red-confidence fields are editable inline — user must either confirm the value or correct it
- [ ] "Confirm all" button: accepts all green/amber fields, forces user to address red fields first
- [ ] Red field count shown in summary: "3 fields need your review"
- [ ] User can edit any field regardless of confidence level
- [ ] Edited field gets a "Modified" tag (distinguishes from AI-parsed values)
- [ ] After review: "Confirm Import" proceeds to same duplicate detection flow as CSV (Story 3.4)

---

### Story 9.3 — AI Parse Template Learning
**As a** system,
**I want** to store successful parse schemas for recognised broker formats,
**so that** repeated imports from the same broker skip the AI call and save cost.

**Acceptance Criteria:**
- [ ] After a successful AI parse that the user confirms without major corrections: header fingerprint + mapping schema saved to `AIParseTemplate` table
- [ ] On subsequent upload with same header fingerprint: apply stored template directly, skip AI call
- [ ] User still sees the review screen (confidence indicators still shown for template-applied results)
- [ ] Template `usageCount` incremented on each successful reuse
- [ ] Templates shared across users — if User A trains DEGIRO format, User B's DEGIRO upload benefits
- [ ] "Major corrections" defined as: user changes > 20% of parsed field values → do NOT save template
- [ ] Admin dashboard (internal) shows template usage stats for monitoring accuracy

---

### Story 9.4 — Network Inspector Guide & Open Source Page
**As a** privacy-conscious user (Tomasz persona),
**I want** to be able to verify that my data never leaves my device unencrypted,
**so that** I can trust FIREtrack with my financial information.

**Acceptance Criteria:**
- [ ] Static page at `/privacy/verify` with step-by-step guide: "How to verify FIREtrack's privacy claims using your browser's Network tab"
- [ ] Guide covers Chrome DevTools Network tab, screenshots, what to look for
- [ ] Guide shows: for free-tier users, zero requests containing financial data; for premium, only base64 ciphertext visible
- [ ] Link to open-source crypto package GitHub repo (`packages/crypto`)
- [ ] GitHub repo has clear README: algorithm choices, how to run tests, how to audit
- [ ] Page linked from: footer, privacy policy, premium upgrade page
- [ ] Page content reviewed for accuracy before launch (developer-written, not marketing)
