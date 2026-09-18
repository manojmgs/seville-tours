# AGENTS.md

## Project: SevilleTours

SevilleTours is a mobile-first booking platform for private and luxury tours in Seville.
This repository supports:
- Public tour discovery and SEO-safe pages
- Direct booking flows
- Stripe Checkout payments and webhook processing
- Refund review and rescheduling flows
- Invoicing and revenue reporting
- Admin command center for Carlos
- Guest dashboard and PWA behavior

This file provides **cross-tool instructions** for AI coding agents.
It is written to work well with GitHub Copilot and other coding agents that support `AGENTS.md`.

---

## 1. Core engineering principles

Always follow these principles:
- **SOLID**
- **DRY**
- **KISS**
- **YAGNI**
- Low cognitive complexity
- Low cyclomatic complexity
- High readability and maintainability
- Safe, incremental changes over risky rewrites

When trade-offs exist, choose the option that is:
1. easiest to understand,
2. safest to ship,
3. easiest to test,
4. easiest to extend later.

---

## 2. Stack and default assumptions

### Frontend
- Next.js 14+ App Router
- React
- TypeScript strict mode
- Tailwind CSS

### Backend
- Next.js Route Handlers
- Supabase (Postgres, Auth, Storage, Edge Functions)

### Payments
- Stripe Checkout
- Stripe webhooks

### Messaging
- Resend for email
- Web Push for PWA notifications when implemented

### Testing
- Unit and integration tests using the project test setup
- UI tests with React Testing Library where applicable
- E2E only where justified by business-critical flows

---

## 3. Architectural boundaries

Keep responsibilities separated.

### Presentation layer
Use components for UI rendering only.
- Keep components small and focused.
- Avoid embedding business rules directly in JSX unless trivial.
- Prefer Server Components by default.
- Use Client Components only for true client interactivity.

### Application / orchestration layer
Use hooks, services, or server-side orchestrators for:
- booking orchestration,
- refund review logic,
- reschedule flow management,
- invoice generation orchestration,
- notification dispatch.

### Data access layer
Keep database access isolated.
- Prefer repository-like helpers or clearly separated Supabase access modules.
- Avoid scattering raw Supabase queries across unrelated files.
- Validation and authorization must happen before write operations.

### Payment boundary
Treat Stripe as an external system boundary.
- Webhooks must be idempotent.
- Never assume an event is delivered once.
- Never trust client-side payment state as the source of truth.

---

## 4. Domain rules that must not be violated

### Booking domain
- Direct bookings use **Stripe Checkout**, not custom card capture.
- Booking flows must preserve availability integrity.
- Prevent double-booking via explicit hold/confirm/release logic.
- Use **Europe/Madrid** timezone for booking operations.

### Refund domain
- Refund logic must remain deterministic, auditable, and legally safe.
- Respect the configured cancellation tiers and refund review rules.
- If auto-approval windows or compliance safeguards exist, do not bypass them.
- Keep refund review state transitions explicit and testable.

### Reschedule domain
- Reschedule offers must not create hidden state transitions.
- Keep original booking and rescheduled booking relationships traceable.
- Reschedule expiry, fallback to refund review, and max-reschedule rules must remain explicit.

### Invoicing domain
- Preserve Spanish invoice concepts:
  - `factura simplificada`
  - `factura completa`
  - `factura rectificativa`
- Invoice numbers must be sequential and race-safe.
- Refunds must generate corrective invoice logic where required.

### GDPR and privacy
- Handle guest personal data conservatively.
- Never store card details.
- Do not weaken data retention or access controls.
- Treat special requests and other sensitive data as protected information.

---

## 5. Coding standards

### TypeScript
- Use strict typing.
- Avoid `any` unless absolutely necessary and explicitly justified.
- Prefer explicit types for public functions, data contracts, and complex return values.
- Keep domain objects well named and stable.

### Naming
Use business/domain language.
Prefer names like:
- `booking`
- `refundReview`
- `availabilitySlot`
- `invoice`
- `giftCard`
- `rescheduleOffer`

Avoid vague names like:
- `data`
- `item`
- `handler2`
- `temp`
- `stuff`

### Functions
- Keep functions small and purpose-specific.
- Prefer early returns over deep nesting.
- Extract helpers when branching gets hard to scan.
- Do not create giant route handlers or giant components.

### Comments
- Do not add noisy comments.
- Comment only when the reasoning is non-obvious.
- Prefer expressive names over explanatory comments.

---

## 6. UI and UX rules

This product is **mobile-first**.
The admin experience is primarily used on a phone.

Always preserve:
- minimum touch targets around **44x44px**,
- semantic HTML,
- clear focus states,
- keyboard accessibility,
- readable contrast,
- calm and professional styling.

Do not introduce:
- cluttered layouts,
- tiny tap targets,
- unnecessary modal chains,
- desktop-only assumptions.

Use the PRD and wireframes as the source of truth for structure and flow.

---

## 7. Testing expectations

When changing business-critical logic, add or update tests.
Prioritize coverage for:
- booking confirmation flow,
- availability decrement/release,
- Stripe webhook idempotency,
- refund approval / denial / auto-approval,
- reschedule acceptance / expiry / fallback,
- invoice generation,
- admin actions that affect money or customer state.

For bug fixes:
- prefer adding a regression test.

Do not state that code is tested unless tests were actually updated or added.

---

## 8. Documentation responsibilities

Keep documentation aligned with code.
If your change affects architecture, schema, API, legal behavior, or edge-case handling, note the docs that must be updated.

Important docs:
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATABASE.md`
- `docs/LEGAL.md`
- `docs/EDGE-CASES.md`
- `docs/TESTING-STRATEGY.md`

Prefer referencing these docs rather than duplicating them in code.

---

## 9. Rules for making changes

Before implementing:
1. identify the exact scope,
2. inspect nearby patterns,
3. choose the smallest safe change,
4. avoid broad rewrites unless explicitly requested.

When implementing:
1. update types and validation first,
2. implement domain logic second,
3. wire UI last,
4. add tests,
5. identify documentation updates.

After implementing:
- keep diffs focused,
- avoid unrelated cleanup unless it directly improves the task,
- preserve backward compatibility unless migration work is included.

---

## 10. Things agents must avoid

Do **not**:
- hardcode secrets, tokens, or environment-specific URLs,
- bypass auth, RLS assumptions, or legal safeguards,
- introduce silent breaking changes to SEO-relevant routes,
- rewrite large files unnecessarily,
- mix payment logic, data access, and presentation in the same file,
- generate placeholder logic and pretend it is complete,
- invent undocumented business rules.

If a task is ambiguous, choose the safest maintainable interpretation and keep the implementation narrow.

---

## 11. Preferred agent behavior

When acting as an AI coding agent in this repository:
- behave like a careful senior engineer,
- preserve architecture first,
- protect business-critical flows,
- optimize for maintainability over cleverness,
- surface assumptions clearly when necessary,
- avoid overengineering.

If a change looks risky, prefer proposing a minimal plan before making broad edits.

---

## 12. Priority areas for extra care

Treat these areas as high risk:
- Stripe webhooks
- refund processing
- invoice numbering and corrections
- availability synchronization
- auth and access control
- guest data handling
- SEO-impacting route changes
- admin actions that affect money or guest-facing commitments

High-risk changes should remain explicit, traceable, and testable.
