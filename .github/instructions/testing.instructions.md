---
applyTo: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,app/api/**/route.ts,components/**/*.tsx,lib/**/*.ts,services/**/*.ts"
description: "Testing strategy, regression tests, idempotency checks, and QA-safe conventions for SevilleTours"
---

# Testing Instructions for SevilleTours

## Scope
These rules apply to testing-related work in this repository:
- unit tests
- integration tests
- component tests
- route-handler tests
- payment and refund regression tests
- booking and availability flow tests
- admin-flow validation
- test data and mocking strategy

## Core testing principles
- Tests must protect **business-critical behavior**, not just increase coverage numbers.
- Prefer **meaningful, stable tests** over shallow snapshot-heavy tests.
- Favor tests that validate user-visible outcomes and critical domain state transitions.
- Every bug fix should add a regression test when practical.
- High-risk flows must remain testable, deterministic, and explicit.

## Priority testing pyramid for this project
### 1. Unit tests
Use for:
- pure utility functions
- refund amount calculation
- availability calculations
- invoice number formatting helpers
- date/time window logic
- validation helpers

### 2. Integration tests
Use for:
- route handlers
- server orchestration logic
- Supabase persistence logic (with mocks/fakes where appropriate)
- booking confirmation state transitions
- refund review approval / denial / auto-approval transitions
- Stripe webhook processing behavior

### 3. Component tests
Use for:
- interactive booking UI
- admin command center cards and actions
- refund review queue behavior
- forms and validation messages
- mobile-first UI states that carry business meaning

### 4. End-to-end tests
Use sparingly for the highest-value flows only:
- guest direct booking happy path
- guest cancellation request flow
- admin refund review flow
- key auth and ownership checks

Do not rely on E2E to cover logic that should be protected at unit or integration level.

## What must be tested first
Prioritize tests for these areas before low-risk UI details:
- booking creation and confirmation
- slot hold / release / anti-oversell logic
- Stripe webhook idempotency
- refund calculation by policy tier
- refund review state machine
- reschedule offer / accept / expire / fallback behavior
- invoice generation triggers and corrective invoice linkage
- RLS/ownership assumptions in server-side code paths
- admin actions that affect money, bookings, or guest-visible commitments

## Route-handler testing rules
- Test request validation explicitly.
- Test auth and authorization outcomes.
- Test success, invalid input, and expected failure cases.
- Prefer checking status codes and response shape rather than incidental implementation details.
- Keep handlers thin enough that domain logic can be tested separately.

## Payment and webhook testing rules
- Webhook logic must have idempotency-focused tests.
- Test duplicate event delivery handling.
- Test missing or invalid signatures where applicable.
- Test payment success does not rely on client success redirects.
- Test refund processing state transitions and reconciliation behavior.
- Never leave money-related edge cases untested if logic changes.

## Booking and availability testing rules
- Test no double-booking scenarios.
- Test same-slot contention logic where relevant.
- Test cancellation releases capacity correctly.
- Test guest-count modifications and resulting availability changes.
- Test reschedule moves capacity from old slot to new slot safely.
- Test booking state transitions explicitly rather than assuming happy-path only.

## Invoice and legal testing rules
- Test invoice-triggering behavior for confirmed bookings.
- Test corrective invoice behavior on refunds.
- Test that money values use server-side calculations.
- Test formatting and identifier generation helpers where deterministic.
- Do not treat finance-related logic as unimportant just because it is not UI-visible.

## Component testing rules
- Prefer behavior-based assertions.
- Test what the user can see, do, and submit.
- For forms, test validation messages and disabled/loading states where meaningful.
- For admin UI, test status badges, countdown rendering, action availability, and edge-state visibility.
- Avoid brittle assertions tied to incidental DOM structure.

## Accessibility testing expectations
Where relevant, verify:
- labels exist for form inputs
- buttons and links are accessible by role/name
- error messages are surfaced in a usable way
- keyboard interactions still work for dialogs, sheets, and controls

## Mocking strategy
- Mock external systems at boundaries:
  - Stripe network calls
  - Resend/email senders
  - push notification senders
  - external OTA sync if introduced
- Do not over-mock internal domain logic that should be tested for real behavior.
- Keep mocks realistic enough to catch integration mistakes.
- Prefer deterministic fake data over random values unless randomness is the subject of the test.

## Test data rules
- Use clear, domain-meaningful fixtures:
  - `confirmedBooking`
  - `pendingRefundReview`
  - `luxuryTourSlot`
  - `guestUser`
  - `adminUser`
- Avoid vague names like `mock1`, `data`, or `sampleObject`.
- Make dates and amounts explicit so failures are easy to diagnose.

## Regression testing expectations
When fixing a bug:
1. reproduce the bug with a failing test if practical,
2. fix the implementation,
3. confirm the test passes,
4. avoid changing unrelated assertions unless necessary.

## Coverage guidance
- Coverage is a signal, not the goal.
- Prefer meaningful coverage of critical flows over chasing trivial lines.
- If coverage tooling exists, protect critical server logic and state transitions first.
- Do not write low-value tests just to satisfy a percentage threshold.

## Documentation behavior
If a change adds or alters important test scenarios, identify docs that may need updates:
- `docs/TESTING-STRATEGY.md`
- `docs/EDGE-CASES.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`

## Avoid these mistakes
- Do not rely only on manual testing for money-related flows.
- Do not write only happy-path tests for booking, refunds, and payments.
- Do not overuse snapshots for complex UI behavior.
- Do not mock away the very logic the test is supposed to verify.
- Do not leave a bug fix without regression protection when practical.
- Do not claim a scenario is covered if the test does not actually assert the business outcome.

## Preferred implementation flow for testing tasks
1. Identify the business-critical behavior or bug being protected.
2. Choose the smallest appropriate test level (unit, integration, component, E2E).
3. Write clear fixtures and setup.
4. Assert meaningful outcomes, not incidental internals.
5. Keep tests deterministic and readable.
6. Note any related edge-case or testing docs that should be updated.
