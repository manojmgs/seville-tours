# Seville Tours — Deep Links & Partial Redemption: Gap Analysis & Plan (Brand-Site View)

**Project:** Seville Tours Co. (brand / acquisition site)
**Integration:** Seville Tours → ParaUsted hosted gift-card flow (`seville-tours-co`)
**Authors:** PM / PO / Architect (brand-side)
**Date:** 2026-06-18
**Status:** PROPOSED — pending sprint approval
**Companion docs:**
`seville-tours-parausted-integration-contract-2026-06.md` (consumer-side contract reference),
`seville-tours-deep-link-partial-redemption-sprint-plan.md` (brand-side sprint plan).
**Counterpart (ParaUsted) docs:**
`seville-tours-deep-link-partial-redemption-gap-and-plan.md`,
`seville-tours-deep-link-partial-redemption-sprint-plan.md`.

---

## 1. Executive Summary

Seville Tours drives gift-card buyers from its own brand site into ParaUsted's hosted flow. The
ParaUsted audit confirms two of our earlier assumptions were **too conservative**: a stable per-SKU
product URL already exists, and the voucher-code wording in our shipped copy is accurate. Two
capabilities remain to be built across both systems:

1. **Deep links / cross-link prefill** — link straight to a specific gift card (SKU), optionally
   preselect amount/recipient, and return the buyer to the brand site after purchase.
2. **Partial redemption / balance** — let a high-value (luxury) voucher be redeemed across multiple
   tours, preserving remaining balance.

**Brand-side scope = ParaUsted's Workstream 4.** The platform changes (param contract, `return_url`
allowlist, partial-redeem RPC) are owned by ParaUsted; we own the outbound deep-link builder, the CTA
updates, and the return landing page.

**Bottom line:**
- **ST-1 (deep link to a specific SKU)** is **unblocked now** — only requires the 3 `gift_cards`
  UUIDs from ParaUsted.
- **ST-2 (prefill)** and **ST-3 (return landing)** are **blocked** until ParaUsted ships its param
  contract (Phase B) and `return_url` allowlist (Phase C); building them earlier would no-op because
  inbound params are silently ignored today.
- **Partial redemption** is entirely ParaUsted-owned; our only dependency is copy accuracy (we must
  not promise partial use until their RPC ships).

---

## 2. System Map & Ownership

```text
┌─────────────────────────────┐        deep link (entry)        ┌──────────────────────────────┐
│  Seville Tours Co. (OURS)    │ ───────────────────────────────▶ │  ParaUsted (hosted SaaS)      │
│  - gift modes / CTAs         │                                  │  - merchant + product pages   │
│  - deep-link builder (NEW)   │                                  │  - purchase + payment + voucher│
│  - /gift/thanks landing (NEW)│ ◀─────────────────────────────── │  - redemption + audit (truth) │
└─────────────────────────────┘     return_url (after purchase)   └──────────────────────────────┘
```

| Concern | Owner | Notes |
|---------|-------|-------|
| Gift-card catalog / SKUs / UUIDs | ParaUsted | We consume the UUIDs as config |
| Purchase / payment / voucher / redemption | ParaUsted | Source of truth |
| Deep-link param contract + `return_url` allowlist | ParaUsted | Security boundary lives there |
| Outbound deep-link builder | **Seville Tours** | New utility |
| Gift CTAs (fixed/flex/luxury) | **Seville Tours** | Update targets |
| Post-purchase return landing | **Seville Tours** | New page, non-PII only |

---

## 3. Current State — Seville Tours (verified in our repo)

- Outbound link builder returns only the **merchant page**, no params:
  [src/lib/parausted/merchant-url.ts](../../../src/lib/parausted/merchant-url.ts) —
  `buildParaUstedMerchantUrl(locale)` → `https://parausted.es/{es|en}/m/seville-tours-co`.
- All three gift CTAs link to that merchant page:
  [src/components/home/GiftVoucherConfigurator.tsx](../../../src/components/home/GiftVoucherConfigurator.tsx).
- Redemption-handoff copy (3 steps) already shipped in all 4 locales and is **accurate** vs. the
  verified voucher-code flow: [src/lib/i18n/locales/en.ts](../../../src/lib/i18n/locales/en.ts).
- `?interest=gift-voucher` on the contact route redirects to ParaUsted (no WhatsApp gift path):
  [src/app/[locale]/contact-seville-tours-co/page.tsx](../../../src/app/%5Blocale%5D/contact-seville-tours-co/page.tsx).

## 4. Current State — ParaUsted (verified, the parts we depend on)

- Product (SKU) URL **exists**: `/{locale}/m/seville-tours-co/gift-cards/{giftCardId}` (UUID).
- Voucher code `PREFIX-XXXX-XXXX-XXXX` issued after payment; stable identifier.
- Redemption is **full-balance only**, merchant-dashboard only; **no** partial, **no** external API.
- **No** inbound param prefill, **no** `return_url`, **no** merchant notification, **no** invoicing
  today. (See contract reference doc for citations.)

---

## 5. Gap Analysis (brand-side focus)

### 5.1 Deep Links / Prefill
| # | Gap | System | Severity | Type | Blocked by |
|---|-----|--------|----------|------|-----------|
| ST-D1 | No knowledge of `gift_cards` UUIDs (SKUs) on brand site | Seville Tours | High | Additive | ParaUsted to supply 3 UUIDs |
| ST-D2 | No outbound deep-link builder (SKU + prefill + return_url) | Seville Tours | High | Additive | ST-D1 (SKU link works now; prefill needs ParaUsted Phase B) |
| ST-D3 | No post-purchase return landing page | Seville Tours | High | Additive | ParaUsted `return_url` allowlist (Phase C) + our domain on allowlist |
| ST-D4 | Gift CTAs still point to merchant page, not specific SKUs | Seville Tours | Medium | Additive | ST-D1 |

### 5.2 Partial Redemption (we mostly consume)
| # | Gap | System | Severity | Type | Notes |
|---|-----|--------|----------|------|-------|
| ST-P1 | Cannot promise partial/multi-tour use of a luxury card | Seville Tours (copy) | Medium | Copy only | Blocked until ParaUsted `redeem_voucher_partial` ships; keep copy coordination-only until then |
| ST-P2 | (Optional, Phase 2) Carlos POS-side partial redeem without dashboard | Both | Low | Additive | Needs ParaUsted partner API (their backlog) |

### 5.3 Out of scope (noted, tracked elsewhere)
| # | Item | Decision |
|---|------|----------|
| ST-O1 | Merchant new-purchase notification | ParaUsted backlog; Carlos uses dashboard meanwhile |
| ST-O2 | Invoice/factura for gift purchases | ParaUsted legal backlog |
| ST-O3 | Short human-friendly product slugs | Defer; UUID links work |
| ST-O4 | Multi-currency deep links | Out of scope (EUR only) |

---

## 6. Target Design (brand-side)

### 6.1 SKU config + deep-link builder
- New typed config of the 3 `gift_cards` UUIDs (Cathedral fixed, Alcázar fixed, flexible/luxury),
  keyed by a stable internal name, sourced from `NEXT_PUBLIC_*` env or a constants module.
- New `buildParaUstedGiftCardUrl({ locale, sku, amountCents?, returnUrl? })` alongside the existing
  `buildParaUstedMerchantUrl`. It:
  - composes `/{locale}/m/seville-tours-co/gift-cards/{uuid}`,
  - appends **only** params ParaUsted has confirmed it accepts (initially none beyond the path; add
    `amount`/`return_url` once Phase B/C land),
  - **never** appends PII (recipient email/phone), matching the existing no-PII guarantee.
- Keep `buildParaUstedMerchantUrl` for the generic "browse all gift cards" entry.

### 6.2 CTA updates
- Fixed Cathedral card CTA → its SKU URL; Fixed Alcázar card CTA → its SKU URL; flexible/luxury CTA →
  flexible SKU URL (with `amount` prefill **only after** Phase B).
- Preserve current accessibility (min 44×44px tap targets), `target="_blank" rel="noopener noreferrer"`,
  and the calm visual language already in the configurator.

### 6.3 Return landing page `/gift/thanks`
- New route (locale-aware) that reads **only non-PII** confirmation params (e.g. `status=success`).
- Friendly confirmation + link back to tours; optional link to the public voucher page **only if** a
  code is present (default: not present, per R3).
- No server-side PII handling; purely presentational.

### 6.4 Copy guardrails
- Until ParaUsted's partial-redeem ships, luxury copy stays **coordination-only** (no partial/
  multi-tour-balance promise). After it ships, add a precise "use across multiple tours, balance
  preserved" line in all 4 locales.

---

## 7. Implementation Plan — Brand Side (Workstream 4)

| Phase | Story | Unblocked now? | Depends on |
|-------|-------|----------------|-----------|
| ST-1 | SKU UUID config + deep-link builder utility | ✅ (SKU path) | ParaUsted supplies 3 UUIDs |
| ST-2 | Update gift CTAs to deep links (+ `amount` prefill) | Partial | Prefill needs ParaUsted Phase B |
| ST-3 | `/gift/thanks` return landing page | ❌ | ParaUsted Phase C + allowlist our domain |
| ST-4 | Staging round-trip QA | ❌ | ParaUsted M2 (staging) ready |

Sequencing: ship **ST-1** + the SKU-only part of **ST-2** immediately; gate prefill and ST-3/ST-4 on
ParaUsted's M2.

---

## 8. Risks & Decisions

| # | Risk / Decision | Recommendation |
|---|-----------------|----------------|
| R1 | Building prefill/return before ParaUsted Phase B/C → silent no-op | Gate ST-2 prefill + ST-3 on ParaUsted M2 |
| R2 | PII in outbound URLs | Never append recipient email/phone; keep no-PII guarantee |
| R3 | Voucher code in return URL | Default **no**; `/gift/thanks` must not require a code |
| R4 | SKU UUIDs drift if ParaUsted re-seeds cards | Store in env/config; document update path; QA in staging |
| R5 | Over-promising partial redemption in copy | Keep luxury copy coordination-only until partial RPC ships |
| R6 | Our domain not on ParaUsted allowlist | PO sends production domain(s) to ParaUsted by their Day 1 |

---

## 9. Definition of Done (brand-side)
- ST-1 shipped: SKU UUIDs in typed config; deep-link builder covered by unit tests; fixed-card CTAs
  point to specific SKUs.
- ST-2/ST-3/ST-4 shipped after ParaUsted M2: prefill works, return landing renders from non-PII
  params, full click→buy→return verified in staging.
- No PII in any outbound URL; luxury copy matches the actually-shipped redemption capability.
- `npm run build` and `npm run lint` pass (excluding the 2 pre-existing unrelated LanguageDropdown
  lint errors); new utility has tests.
