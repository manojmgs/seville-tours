---
applyTo: "supabase/**/*.ts,lib/supabase/**/*.ts,app/api/**/*.ts,app/api/**/route.ts,db/**/*.sql,supabase/functions/**/*.ts,supabase/migrations/**/*.sql"
description: "Supabase, Postgres, RLS, migrations, Edge Functions, auth, and GDPR-safe data handling rules for SevilleTours"
---

# Supabase Instructions for SevilleTours

## Scope
These rules apply to all Supabase-related work in this repository:
- Postgres schema and migrations
- Row Level Security (RLS)
- Auth and profile logic
- Storage access
- Edge Functions
- Route handlers that read/write Supabase data
- Booking, availability, refund, invoice, and guest-data persistence

## Core data principles
- Treat Supabase as a **business-critical system of record**.
- Prefer **additive, backward-compatible** schema changes.
- Never make casual breaking changes to core tables like bookings, availability, invoices, refund reviews, profiles, or gift cards.
- Preserve auditability for money-related and guest-affecting flows.
- Keep data rules explicit, deterministic, and testable.

## Schema and migration rules
- Every schema change must be migration-safe.
- Prefer adding columns/tables/indexes over destructive redesigns unless the task explicitly includes a migration plan.
- Avoid dropping or renaming columns used by live flows without a clear compatibility path.
- If a change touches a core entity, consider existing data, backfill needs, nullability, defaults, and rollback risk.
- Add indexes deliberately for high-read lookup paths (bookings by date/status/user, availability by tour/date/time, invoices by number, refund_reviews by status/deadline).
- Keep SQL migrations readable and narrowly scoped.

## Row Level Security (RLS)
- Respect RLS assumptions at all times.
- Do not weaken RLS for convenience.
- Customer-facing reads/writes must be scoped to the authenticated user where appropriate.
- Admin access must be explicit and role-based.
- Service-role usage must remain isolated to server-side trusted contexts only.
- If a table is exposed through the client, assume RLS must protect it.
- Prefer explicit policies over vague broad-access patterns.

## Auth and user model
- Use Supabase Auth as the primary identity system.
- Keep the `profiles` table aligned with auth users and project roles.
- Never trust client-submitted role claims.
- Role checks must happen server-side or through trusted policy logic.
- Guest-facing actions must verify ownership before reading or mutating data.
- Admin-only actions must verify admin capability explicitly.

## Booking domain data rules
- `bookings`, `availability`, `refund_reviews`, `invoices`, `gift_cards`, and related tables are high-risk.
- Avoid hidden side effects in booking writes.
- Preserve clear lifecycle transitions:
  - hold
  - confirmed
  - cancellation requested
  - refund pending review
  - refunded
  - rescheduled
  - completed
  - no-show
- Keep relationships traceable between original and rescheduled bookings.
- Availability updates must remain race-safe and consistent.
- Prevent accidental overselling or negative inventory.

## Money and invoice safety
- Any refund, invoice, or revenue-related write must be conservative.
- Treat invoice numbering as race-sensitive.
- Do not generate invoice numbers in a way that risks duplicates or gaps due to poor concurrency handling.
- Keep refund-related state auditable.
- Preserve corrective invoice linkage when refunds occur.
- Never rely on client-side calculations for money fields.

## Stripe + Supabase boundary
- Stripe remains the source of truth for payment execution.
- Supabase stores internal business state and audit state.
- Webhook handlers must be idempotent.
- Never assume a webhook arrives once.
- Store enough external IDs to reconcile payment, refund, and dispute events safely.
- Do not mark bookings as paid/refunded based only on client navigation state.

## Edge Function rules
- Keep Edge Functions focused and explicit.
- Validate all input.
- Verify auth where required.
- Handle retries and duplicate events safely.
- Prefer clear orchestration over hidden implicit behavior.
- Keep external API calls isolated and error-handled.
- For cron-like flows (auto-approve, reminders, retention), make functions idempotent and safe to re-run.

## Storage and file handling
- Use Storage only for appropriate artifacts such as invoice PDFs, exports, or generated reports.
- Do not store sensitive payment data in Storage.
- Guest documents or generated files must follow access-control expectations.
- Public vs private bucket usage must be explicit.

## GDPR and privacy
- Guest personal data must be handled conservatively.
- Special requests and similar sensitive fields should be treated as protected data.
- Do not expand retention casually.
- Any deletion or anonymization flow must preserve legally required accounting records where needed.
- If changing tables that store personal data, consider retention, access scope, and documentation updates.

## Query and access patterns
- Keep queries close to the domain they belong to.
- Avoid copying large query logic across files.
- Prefer reusable access helpers for repeated business queries.
- Select only the fields needed for the task.
- Avoid overfetching large row shapes into the client.
- When updating booking or refund-related records, prefer transactional thinking and explicit sequencing.

## Error handling
- Fail safely.
- Return clear server-side errors for invalid states.
- Do not swallow database errors silently.
- Preserve enough context in logs for debugging without leaking sensitive guest data.
- For admin and finance flows, prefer explicit failure over silent partial writes.

## Testing expectations for Supabase work
- Add or update tests when changing:
  - booking persistence
  - availability synchronization
  - refund review state changes
  - invoice generation metadata
  - auth and ownership checks
  - cron/Edge Function logic
- For bug fixes, prefer adding a regression test or at least a reproducible validation path.

## Documentation behavior
- If schema, API behavior, or domain state transitions change, identify docs that must be updated:
  - `docs/DATABASE.md`
  - `docs/API.md`
  - `docs/ARCHITECTURE.md`
  - `docs/LEGAL.md`
  - `docs/EDGE-CASES.md`
- Do not leave schema changes undocumented.

## Avoid these mistakes
- Do not disable or weaken RLS casually.
- Do not use the service role in code paths that can leak to the client.
- Do not trust client-submitted money, role, or booking state.
- Do not create schema changes that break live flows without a migration path.
- Do not scatter raw Supabase access everywhere.
- Do not write destructive migrations without explicit request and rollback awareness.
- Do not store sensitive data in the wrong place.

## Preferred implementation flow for Supabase tasks
1. Understand the affected domain entity and live flow.
2. Check RLS, auth, and ownership implications first.
3. Design the smallest safe schema/query change.
4. Implement server-side validation and explicit write logic.
5. Add/update tests or validation coverage.
6. Note which docs must be updated.
