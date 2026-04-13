# Epic 10: Subscriptions & Payments
**Priority:** P1 — Required before charging any user; gates all premium features
**PRD refs:** Section 9 (Pricing & Tier Model), FR-10.2, FR-10.3
**Arch refs:** Stripe, subscription table, feature gating, GDPR deletion

## Goal
Implement Stripe-based subscription management so users can upgrade to premium, manage their plan, and cancel. Feature gating enforces tier boundaries. GDPR deletion is available to all users.

## Stories

---

### Story 10.1 — Stripe Subscription Integration
**As a** user,
**I want** to upgrade to premium by paying with my card,
**so that** I can access AI parsing, cloud sync, and Monte Carlo features.

**Acceptance Criteria:**
- [ ] Stripe Checkout used for payment (hosted page — no card data touches FIREtrack servers)
- [ ] Plans configured in Stripe: Annual ($100/year), Monthly ($15/month)
- [ ] `POST /api/subscriptions/checkout` creates a Stripe Checkout session for authenticated user, returns `checkoutUrl`
- [ ] On Stripe payment success: webhook `checkout.session.completed` updates `Subscription` table to `ACTIVE`
- [ ] On Stripe payment failure: user returned to upgrade page with error
- [ ] Subscription status displayed in account settings: plan type, next billing date, cancel option
- [ ] `POST /api/subscriptions/portal` creates a Stripe Customer Portal session for self-service management

---

### Story 10.2 — Early Adopter Free Year
**As a** user in the first 100 to sign up,
**I want** my first year of Premium to be free,
**so that** I can fully evaluate the product before paying.

**Acceptance Criteria:**
- [ ] `earlyAdopterSlots` counter in database (max 100), decremented on each early adopter activation
- [ ] During registration: if `earlyAdopterSlots > 0`, user sees "You qualify for a free first year of Premium"
- [ ] Early adopter subscription: created in Stripe with a 12-month trial, no card required until trial ends
- [ ] On trial end: Stripe sends email, user prompted to add payment method; plan downgrades to Free if no card added
- [ ] Early adopter status shown in account settings: "Early Adopter — Premium free until {date}"
- [ ] If `earlyAdopterSlots === 0`: early adopter offer no longer shown

---

### Story 10.3 — Feature Gating
**As a** developer,
**I want** a reliable mechanism to gate premium features,
**so that** free-tier users cannot access premium functionality.

**Acceptance Criteria:**
- [ ] `useSubscription()` React hook returns `{ tier, isPremium, isEarlyAdopter }` — reads from server-side JWT claim or subscription API
- [ ] Server middleware `requirePremium` applied to: `POST /api/parse`, `PUT /api/sync`, `GET /api/sync`, broker connection endpoints
- [ ] Client-side: premium features show with lock icon and "Premium" badge for free users
- [ ] Clicking a locked feature → upgrade modal (not a redirect)
- [ ] Upgrade modal shows: feature description, pricing, CTA to checkout
- [ ] Free tier AI parse trial tracked server-side (`users.parseTrialUsed`) — separate from subscription check
- [ ] Subscription status cached in JWT for 24h (avoids database lookup on every request)

---

### Story 10.4 — Account Deletion (GDPR)
**As a** user,
**I want** to permanently delete my account and all associated data,
**so that** FIREtrack holds no information about me after I leave.

**Acceptance Criteria:**
- [ ] "Delete Account" button in settings, under a "Danger Zone" section
- [ ] Deletion requires typing "DELETE" to confirm (prevents accidental deletion)
- [ ] `DELETE /api/account` endpoint:
  - Cancels active Stripe subscription (via Stripe API)
  - Deletes all rows: `User`, `Subscription`, `EncryptedData`, `BrokerConnection`, `UserSession`
  - Does NOT delete market data (shared, not personal)
  - Returns `204 No Content`
- [ ] Premium cloud data deleted within 24 hours (logged for GDPR audit)
- [ ] Free-tier users: server deletes only `User`, `Subscription`, `UserSession` — no financial data was ever stored
- [ ] User receives confirmation email: "Your account has been permanently deleted"
- [ ] After deletion: all JWT tokens invalidated immediately

---

### Story 10.5 — Lifetime Deal
**As a** user who wants to pay once and never see a subscription,
**I want** a one-time lifetime payment option,
**so that** I get permanent premium access aligned with my FIRE philosophy.

**Acceptance Criteria:**
- [ ] Lifetime plan configured in Stripe as a one-time payment product ($299)
- [ ] Offered on upgrade page alongside annual/monthly: "Lifetime — $299 once, forever"
- [ ] Available to first 500 users (slot counter in database)
- [ ] Lifetime subscription: `expiresAt = null` in `Subscription` table (never expires)
- [ ] Feature gating treats `LIFETIME` tier identically to `ANNUAL`
- [ ] Lifetime status shown in account settings: "Lifetime Member"
