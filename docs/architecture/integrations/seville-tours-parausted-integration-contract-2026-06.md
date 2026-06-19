# Seville Tours × ParaUsted — Integration Contract Reference (Brand-Site View)

**Project:** Seville Tours Co. (brand / acquisition site)
**Counterparty:** ParaUsted (hosted gift-card SaaS), merchant slug `seville-tours-co`
**Type:** Reference — consumer-side view of the verified ParaUsted contract + our current brand-site state
**Date:** 2026-06-18
**Source of truth:** ParaUsted code audit `seville-tours-parausted-contract-audit-2026-06.md`
(read-only audit of the ParaUsted repo, Q1–Q7 + BLOCKERS). This document restates the parts that
affect the brand site and records what exists on **our** side today.
**Companion docs:**
`seville-tours-deep-link-partial-redemption-gap-and-plan.md`,
`seville-tours-deep-link-partial-redemption-sprint-plan.md`

> Boundary rule (unchanged): **ParaUsted owns purchase, payment, voucher issuance, and redemption
> (source of truth). Seville Tours is a marketing/referrer surface only.** We never store card
> details and never pass PII, amount, `gift_card_id`, voucher code, or payment/refund status in
> outbound URLs unless an explicitly approved, validated param contract exists on the ParaUsted side.

---

## 1. Verified ParaUsted Contract (the parts we consume)

### 1.1 URLs we may link to
| Surface | URL pattern | Status | Notes |
|---------|-------------|--------|-------|
| Merchant page | `https://parausted.es/{es\|en}/m/seville-tours-co` | EXISTS | What we link to today |
| Product (SKU) page | `https://parausted.es/{es\|en}/m/seville-tours-co/gift-cards/{giftCardId}` | **EXISTS** | `{giftCardId}` = `gift_cards` UUID (tenant-scoped). Deep-linkable **now**. |
| Public voucher page | `https://parausted.es/{es\|en}/v/{code}` | EXISTS | Buyer-facing; `{code}` is the voucher code, not the UUID |

- Locales: `es` (default) and `en` only. Unknown first path segment → ParaUsted proxy prefixes `es`
  and redirects; an unsupported `[locale]` segment at page level → `notFound()` (404).
- **Correction to earlier V1 assumption:** a stable per-SKU URL **does** exist (UUID-based). Only the
  *short human-friendly* product slug (`/p/{slug}`) does **not** exist.

### 1.2 Voucher code (what the buyer receives)
- Format: `PREFIX-XXXX-XXXX-XXXX`, uppercase hex (`0-9A-F`). Default prefix `PU`; Seville Tours luxury
  card uses a branded prefix (e.g. `ST-GC-LUX-XXXX-XXXX-XXXX`).
- Generated server-side in ParaUsted's issuance RPC **after payment confirmation only**; suffix = 6
  random bytes = 48 bits entropy. The code (not the DB UUID) is the stable identifier.
- **Implication for us:** our gift redemption-handoff copy ("buy → receive a voucher code → send us the
  code + dates → we confirm") is **accurate** and matches the real artifact.

### 1.3 Redemption (today)
- **Full-balance only.** ParaUsted exposes `redeem_voucher_full` (zeroes balance, sets `redeemed`),
  callable **only by the authenticated merchant** via their dashboard. No buyer/webhook/admin path.
- Partial redemption is **NOT implemented** today, though the data model already supports it
  (`balance_cents`, `redemptions` ledger, `partially_redeemed` status, CHECK constraints).
- There is **no external/partner API** to look up, validate, or redeem a voucher machine-to-machine.

### 1.4 What ParaUsted does NOT do today (affects our promises)
- **No** query-param prefill on merchant/product pages — any inbound `amount`/`recipient`/`return_url`
  is **silently ignored** right now (product page reads only Stripe `checkout`/`session_id`).
- **No** `return_url` / return-to-brand redirect.
- **No** merchant new-purchase notification (email/webhook) — Carlos discovers purchases via the
  ParaUsted dashboard only.
- **No** invoice/factura generation (purchase or refund), no numbering sequence.
- **No** currency field — EUR implicit.

---

## 2. Current State — Seville Tours Brand Site (verified in our repo)

| Capability | Status | File |
|------------|--------|------|
| Outbound merchant link builder (locale-aware, no PII) | EXISTS | [src/lib/parausted/merchant-url.ts](../../../src/lib/parausted/merchant-url.ts) |
| Gift CTAs (fixed / flexible / luxury) → merchant page | EXISTS | [src/components/home/GiftVoucherConfigurator.tsx](../../../src/components/home/GiftVoucherConfigurator.tsx) |
| Gift redemption-handoff copy ("how redemption works", 3 steps) | EXISTS (4 locales) | [src/lib/i18n/locales/en.ts](../../../src/lib/i18n/locales/en.ts) |
| `?interest=gift-voucher` → ParaUsted redirect (no WhatsApp gift path) | EXISTS | [src/app/[locale]/contact-seville-tours-co/page.tsx](../../../src/app/%5Blocale%5D/contact-seville-tours-co/page.tsx) |
| Read-only FareHarbor availability hint on tour pages | EXISTS | [src/components/booking/TourAvailabilityHint.tsx](../../../src/components/booking/TourAvailabilityHint.tsx) |
| Knowledge of specific `gift_cards` UUIDs (SKUs) | **MISSING** | needed for deep links (ST-1) |
| Outbound deep-link builder (SKU + prefill + return_url) | **MISSING** | needed (ST-1/ST-2) |
| Post-purchase return landing page (`/gift/thanks`) | **MISSING** | needed (ST-3) |

Today `buildParaUstedMerchantUrl(locale)` returns only the **merchant page** and deliberately passes
no parameters:

```ts
// src/lib/parausted/merchant-url.ts
export function buildParaUstedMerchantUrl(locale: Locale): string {
  const base = (process.env.NEXT_PUBLIC_PARAUSTED_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  return `${base}/${toParaUstedLocale(locale)}/m/${MERCHANT_SLUG}`;
}
```

---

## 3. What we can do now vs. what is blocked

| Capability | Unblocked now? | Depends on |
|------------|----------------|-----------|
| Deep-link to a **specific SKU** (`/gift-cards/{uuid}`) | ✅ Yes | We need the 3 `gift_cards` UUIDs from ParaUsted |
| Prefill `amount` / `recipient_name` via URL | ❌ No | ParaUsted deep-link param contract (their Phase B) |
| Return buyer to brand site after purchase (`return_url`) | ❌ No | ParaUsted `return_url` allowlist (their Phase C) + our domain on their allowlist |
| Partial redemption of a luxury card | ❌ No | ParaUsted `redeem_voucher_partial` RPC + dashboard UI (their Phase A) |

---

## 4. Decisions we owe ParaUsted (by their sprint Day 1)

1. **Allowlist host(s):** provide our exact production domain(s) (e.g. `sevilletoursco.com`) so their
   `return_url` allowlist can accept our return landing page.
2. **Voucher code in return URL:** recommend **no** (default). Our `/gift/thanks` page must not rely
   on a code being present in the URL.
3. **Which SKUs deep-link:** confirm the 3 gift_card UUIDs and whether luxury uses prefill `amount`.

---

## 5. Inputs we need from ParaUsted before brand-side build

- The **3 `gift_cards` UUIDs** (fixed Cathedral, fixed Alcázar, flexible/luxury) + their exact
  `title` and `voucher_code_prefix`, so we can store them as typed config (ST-1).
- Confirmation of the **final deep-link param names** once their Phase B Zod schema is set
  (`amount`, `recipient_name`, `sender_name`, `message`, `return_url`, `utm_*`).
- Their **staging base URL** for round-trip QA (ST-4).

---

## 6. Evidence Map

| Claim | Source |
|-------|--------|
| ParaUsted URL/SKU/voucher/redemption contract | `seville-tours-parausted-contract-audit-2026-06.md` (ParaUsted repo) |
| Our merchant-link builder (no PII) | [src/lib/parausted/merchant-url.ts](../../../src/lib/parausted/merchant-url.ts) |
| Our gift CTAs + redemption copy | [src/components/home/GiftVoucherConfigurator.tsx](../../../src/components/home/GiftVoucherConfigurator.tsx) |
| Gift-voucher contact redirect | [src/app/[locale]/contact-seville-tours-co/page.tsx](../../../src/app/%5Blocale%5D/contact-seville-tours-co/page.tsx) |
| Availability hint | [src/components/booking/TourAvailabilityHint.tsx](../../../src/components/booking/TourAvailabilityHint.tsx) |
