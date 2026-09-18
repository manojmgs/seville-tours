# SevilleTours Project Guidelines for GitHub Copilot

## Product context
- This repository powers **SevilleTours**, a mobile-first booking platform for private and luxury tours in Seville.
- Primary flows: public tour discovery, direct booking, Stripe payment, refund review, rescheduling, invoices, admin command center, guest dashboard, PWA notifications.
- Optimize for **clarity, maintainability, legal safety, and low operational overhead**.

## Tech stack
- **Frontend:** Next.js 14+ App Router, React, TypeScript (strict), Tailwind CSS.
- **Backend:** Next.js Route Handlers, Supabase (Postgres, Auth, Storage, Edge Functions).
- **Payments:** Stripe Checkout + webhooks.
- **Email:** Resend.
- **Testing:** Vitest (preferred); use Jest only if the package already includes Jest configuration. React Testing Library, Playwright for E2E if present.

## Architecture rules
- Follow **SOLID, DRY, KISS, YAGNI** at all times.
- Prefer **small, composable modules** over large files.
- Separate concerns clearly:
  - UI components: presentation only.
  - Hooks/services: client orchestration.
  - Route handlers / server modules: validation, auth, orchestration.
  - Data access: isolated Supabase queries or repository-like helpers.
- Never mix unrelated responsibilities in one file.
- Prefer additive, backward-compatible changes over broad rewrites.
- Preserve existing public contracts unless the task explicitly includes a migration plan.

## Code quality standards
- Use **TypeScript strict mode** patterns. Avoid `any` unless explicitly justified.
- Prefer explicit types for public APIs, function inputs/outputs, and complex objects.
- Use clear, domain-driven names: `booking`, `refundReview`, `availabilitySlot`, `invoice`, `giftCard`.
- Keep functions focused. If a function becomes hard to scan, extract helpers.
- Reduce cognitive and cyclomatic complexity proactively.
- Prefer early returns over nested conditionals.
- Do not introduce dead code, speculative abstractions, or placeholder implementations.

## Next.js conventions
- Prefer **Server Components** by default. Use Client Components only when browser interactivity is required.
- Keep route handlers under `app/api/**/route.ts`.
- Keep page/layout/loading/error boundaries idiomatic to App Router.
- Do not fetch sensitive data in the client if it can be done safely on the server.
- Use progressive enhancement and mobile-first design.

## Styling and UX
- Use Tailwind utilities consistently.
- Mobile-first always. The admin is primarily used on a phone.
- Minimum tap target: **44x44px**.
- Preserve accessibility: semantic HTML, labels, keyboard support, focus states, and contrast.
- Prefer calm, professional UI; avoid noisy styling.
- Respect the platform design language already established in the wireframes and PRD.

## Supabase and data rules
- Respect **Row Level Security** assumptions. Never bypass auth or authorization casually.
- Keep schema changes additive and migration-safe.
- When changing database shape, also update related docs and validation logic.
- Sensitive fields (special requests, guest personal data) must be handled with GDPR awareness.
- Never store card details; Stripe owns payment data.

## Booking and payment domain rules
- Direct bookings use **Stripe Checkout**, not custom card forms unless explicitly requested.
- Booking lifecycle and refund/reschedule behavior must align with the PRD and legal rules.
- Use Europe/Madrid timezone for operational booking logic.
- Refund logic must remain auditable, deterministic, and safe for webhook retries.
- Stripe webhook handlers must be idempotent.
- Never assume a payment/refund event runs only once.

## Invoicing and legal rules
- Preserve Spanish invoicing concepts: `factura simplificada`, `factura completa`, `factura rectificativa`.
- Invoice numbering must be sequential and safe against race conditions.
- Treat IVA, refund corrections, and audit trail as first-class concerns.
- Changes touching refunds, invoices, GDPR, or retention must be conservative and well-tested.

## Testing expectations
- New logic should include tests when feasible.
- For bug fixes, prefer adding a regression test.
- Test critical flows first: booking, refund review, reschedule, availability sync, invoice generation, webhook idempotency.
- Do not claim code is tested if tests were not actually added or updated.

## Documentation behavior
- Keep documentation aligned with code:
  - `docs/ARCHITECTURE.md`
  - `docs/API.md`
  - `docs/DATABASE.md`
  - `docs/EDGE-CASES.md`
  - `docs/TESTING-STRATEGY.md`
- If a change affects architecture, schema, API, or edge-case behavior, note what documentation should be updated.
- Prefer referencing existing docs over duplicating long explanations in code comments.

## GitHub Copilot response style
- Generate code that is production-oriented, not tutorial-style.
- Prefer concise explanations with clear assumptions.
- When requirements are ambiguous, choose the safest maintainable option and state assumptions in comments only if necessary.
- Do not add unnecessary dependencies if the existing stack already supports the solution.
- Reuse established project patterns before inventing new ones.

## Avoid these mistakes
- Do not introduce broad rewrites outside the task scope.
- Do not hardcode secrets, credentials, or environment-specific URLs.
- Do not bypass validation, auth checks, or legal constraints for convenience.
- Do not generate oversized components, giant route handlers, or mixed UI/data/payment logic files.
- Do not silently break SEO-relevant routes or public booking URLs.

## Preferred workflow when implementing
1. Understand the requested scope and nearby existing patterns.
2. Identify the minimal safe change.
3. Update types and validation first.
4. Implement domain logic.
5. Add/update tests.
6. Note any docs that must be updated.
7. Keep diffs focused and reviewable.