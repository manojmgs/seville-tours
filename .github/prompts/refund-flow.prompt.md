---
mode: agent
description: Implement or modify refund-related logic following the SevilleTours PRD refund engine specification
---

# Refund Flow Implementation

## Context
You are implementing refund-related logic for SevilleTours.
Refund processing is a high-risk domain. Every change must be conservative, auditable, and testable.

Read these documents before proceeding:
- `docs/PRD.md` — refund engine specification, cancellation tiers, state machine
- `docs/EDGE-CASES.md` — known failure scenarios
- `docs/LEGAL.md` — Spanish refund law, EU consumer protection, invoice correction rules
- `docs/DATABASE.md` — refund_reviews, bookings, invoices schema

## Inputs
- What is being changed: ${input:changeDescription}
- Which refund scenario: ${input:scenario}

## Domain rules you must follow

### Cancellation tiers
- 48+ hours before tour: 100% refund (private and luxury)
- 24-48 hours: 50% private, 75% luxury
- Under 24 hours: 0% private, 50% luxury
- Carlos cancels: always 100% + 10% gift card credit
- Force majeure: 100% with proof

### Refund review flow
- Guest requests cancellation.
- System checks refund_settings to determine auto-approve or Carlos review.
- If Carlos review: create refund_review with 30-hour auto-approve deadline.
- Auto-approve deadline = min(requested_at + 30 hours, tour_datetime - 2 hours).
- Escalation reminders at 6h, 20h, 28h.
- If Carlos does not act: system auto-approves at policy tier amount.
- Carlos can: approve (policy), full refund (override), custom amount, offer reschedule, deny (with mandatory reason).

### Reschedule interaction
- Reschedule pauses refund clock.
- 48-hour reschedule window.
- If guest ignores or declines: falls back to refund review, 30h clock restarts.
- Max 2 reschedules per booking.
- Reschedule not offered if tour is less than 48 hours away.

### Processing rules
- Calculate refund amounts server-side only.
- Use integer cents for all money calculations.
- Call Stripe Refund API for actual card reversal.
- Never refund more than original Stripe payment amount through Stripe.
- Extra goodwill value goes as gift card, not Stripe over-refund.
- Webhook charge.refunded triggers: booking status update, availability restoration, corrective invoice generation, guest email, Carlos notification.
- All refund actions must be idempotent.

### Audit
- Every state transition must be logged in resolution_events.
- Corrective invoice must reference original invoice.
- Invoice numbering must remain sequential and race-safe.

## Requirements for implementation
- Follow the state machine from the PRD exactly.
- Add or update tests covering the changed scenario.
- Test both the happy path and at least one failure/edge path.
- Verify webhook idempotency if touching webhook handlers.
- Note any documentation that must be updated.

## Output
Produce the implementation files needed for the specified change, plus test files.

## Stop conditions
- Do not skip the refund review step for guest-initiated cancellations unless auto-approve is configured.
- Do not trust client-submitted refund amounts.
- Do not allow refund greater than original Stripe payment via Stripe.
- Do not bypass corrective invoice generation.
- Do not break the escalation notification sequence.
- Do not remove or weaken the auto-approve safety net.
