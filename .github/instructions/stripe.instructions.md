---
applyTo: "app/api/**/route.ts,lib/stripe/**/*.ts,lib/payments/**/*.ts,services/payments/**/*.ts,services/refunds/**/*.ts,supabase/functions/**/*.ts,webhooks/**/*.ts"
description: "Stripe Checkout, webhook idempotency, refunds, reconciliation, and payment-safety rules for SevilleTours"
---

# Stripe Instructions for SevilleTours

## Scope
These rules apply to Stripe-related work in this repository:
- Stripe Checkout session creation
- Webhook handlers
- Refund processing
- Payment reconciliation
- Booking confirmation after payment
- Gift-card or credit interactions tied to payments
- Any server code that reads or writes payment-related state

## Core payment principles
- Treat Stripe as the **source of truth for payment execution**.
- Treat our database as the **source of truth for internal business state and audit state**.
- Never trust client-side navigation, query params, or success pages as proof of payment.
- Payment logic must be conservative, explicit, and auditable.
- Prefer safe, incremental changes over clever shortcuts.

## Checkout rules
- Use **Stripe Checkout** for direct bookings unless a task explicitly requires a different integration.
- Do not build or introduce custom card capture forms unless explicitly requested.
- Session creation must happen server-side.
- Price, quantity, currency, discounts, and metadata must be determined server-side.
- Never trust client-submitted totals or refund amounts.
- Always include enough metadata to reconcile the Stripe session with internal records.

## Server-side session creation
- Validate booking input before creating a checkout session.
- Confirm availability or create a safe hold before payment initiation.
- Attach internal identifiers such as booking ID, account ID, tour ID, and user ID where helpful.
- Keep metadata small, explicit, and stable.
- Do not place sensitive personal data in metadata unnecessarily.

## Success and cancel flows
- The checkout success page is **not** proof of payment.
- The system should only finalize paid booking state after verified Stripe webhook events.
- Cancel pages should not mutate payment state unless explicitly designed for a safe hold-release flow.
- If holds are used, hold expiry and release must be deterministic.

## Webhook rules
- Webhooks must be **idempotent**.
- Never assume the same event arrives only once.
- Verify webhook signatures.
- Persist external event IDs or equivalent idempotency markers before applying business changes where appropriate.
- Handle out-of-order delivery safely where possible.
- Keep webhook handlers thin: verify, parse, route to payment service logic, persist audit info.
- Do not bury business-critical payment transitions in giant webhook files.

## Payment state handling
- Keep internal payment states explicit, for example:
  - checkout_created
  - checkout_expired
  - payment_succeeded
  - payment_failed
  - refund_requested
  - refund_processing
  - refunded
  - dispute_opened
- Avoid ambiguous boolean-only designs when a real lifecycle exists.
- Booking state and payment state should be related but not collapsed into a single vague field.

## Refund rules
- Refund logic must remain deterministic and auditable.
- Refund approval, denial, auto-approval, or override logic should align with the PRD and legal rules.
- Calculate refund amounts server-side.
- Never refund more than the captured Stripe amount through Stripe.
- If extra goodwill value is granted, represent it as internal credit or a gift card unless explicitly specified otherwise.
- Preserve links between original payment, refund action, refund review, and corrective invoice generation.

## Refund processing safety
- Use Stripe refunds for actual card payment reversal.
- If a booking involved both Stripe payment and internal credit/gift card usage, reconcile each source explicitly.
- Keep refund amount, reason, initiator, and timestamps traceable.
- Do not silently mutate booking/payment/invoice state without audit context.

## Money calculation rules
- All monetary calculations must happen server-side.
- Use integer minor units (for example cents) internally wherever practical.
- Be explicit about currency.
- Avoid floating-point money handling.
- Recalculate totals on the server even if the UI already displayed them.

## Invoice and accounting boundary
- Stripe payment success does not replace invoicing logic.
- Invoice creation, invoice numbering, and corrective invoice generation must follow internal accounting rules.
- Keep Stripe identifiers available for reconciliation, but do not use Stripe alone as the accounting ledger.
- Refund events that affect invoices must remain traceable to corrective invoice logic.

## Security rules
- Never expose secret Stripe keys in the browser.
- Public pages may only use publishable client-safe Stripe values when truly necessary.
- Secret keys belong only in trusted server contexts.
- Do not log sensitive payment payloads carelessly.
- Preserve enough logs for debugging without exposing unnecessary personal or financial detail.

## Disputes and exceptional cases
- If a dispute or chargeback flow is introduced, keep it explicit and auditable.
- Preserve payment/provider identifiers needed for evidence and reconciliation.
- Do not assume all payment failures are final; some may require retry or remediation paths.
- Checkout expiration, payment failure, duplicate webhook delivery, and partial refund flows are all high-risk cases.

## Testing expectations for Stripe work
- Add or update tests when changing:
  - checkout session creation
  - webhook verification and routing
  - idempotency handling
  - refund amount calculation
  - payment-to-booking reconciliation
  - refund-related booking state transitions
- For bug fixes, prefer adding a regression test or at least a reproducible validation path.

## Documentation behavior
- If payment or refund behavior changes, identify docs that must be updated:
  - `docs/API.md`
  - `docs/ARCHITECTURE.md`
  - `docs/LEGAL.md`
  - `docs/EDGE-CASES.md`
  - `docs/TESTING-STRATEGY.md`
- If the payment lifecycle changes, do not leave it undocumented.

## Avoid these mistakes
- Do not trust client success redirects as payment confirmation.
- Do not process business-critical payment changes only in the client.
- Do not skip webhook signature verification.
- Do not assume webhook single delivery.
- Do not use floating point for money.
- Do not mix payment orchestration, UI rendering, and database access in the same large file.
- Do not create hidden side effects that make payment reconciliation difficult.

## Preferred implementation flow for Stripe tasks
1. Identify the exact payment lifecycle step being changed.
2. Confirm what Stripe remains responsible for versus what our backend/database owns.
3. Validate input and compute money server-side.
4. Keep webhook and refund paths idempotent.
5. Add/update tests.
6. Note any impacted architecture, legal, API, or edge-case docs.
