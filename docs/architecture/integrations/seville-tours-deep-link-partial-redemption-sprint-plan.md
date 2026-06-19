# Sprint Plan — Seville Tours Deep Links & Partial Redemption (Brand Site / Workstream 4)

**Project:** Seville Tours Co. (brand / acquisition site)
**Companion docs:**
`seville-tours-deep-link-partial-redemption-gap-and-plan.md`,
`seville-tours-parausted-integration-contract-2026-06.md`.
**Counterpart (ParaUsted) sprint:** `seville-tours-deep-link-partial-redemption-sprint-plan.md`
(this brand-side plan = their **Workstream 4**).
**Authors:** PM / PO / Architect
**Date:** 2026-06-18
**Sprint length:** aligns to ParaUsted's 2-week sprint (brand-side load ≈ 10 pts)
**Status:** PROPOSED

---

## 1. Sprint Goal

> Enable Seville Tours to deep-link gift buyers to a specific ParaUsted gift card, with safe prefill
> and a return-to-brand landing once the ParaUsted platform supports it — shipped backward-compatibly,
> with no PII in outbound URLs and copy that matches the actually-shipped redemption capability.

**Demo at sprint end:** A buyer clicks a Seville Tours fixed-card CTA → lands directly on the correct
ParaUsted **product (SKU) page** → (after ParaUsted M2) amount is prefilled → buys → is offered a
"Return to Seville Tours" link that lands on `/gift/thanks` with no PII.

---

## 2. Scope

### In Scope (brand site)
- SKU UUID config + outbound deep-link builder (`buildParaUstedGiftCardUrl`)
- Update fixed/flex/luxury gift CTAs to deep links (SKU path now; `amount` prefill after ParaUsted M2)
- `/gift/thanks` return landing page (non-PII params only)
- Unit tests for the builder + staging round-trip QA

### Out of Scope (owned by ParaUsted or backlog)
- Partial-redemption RPC / dashboard UI (ParaUsted Phase A)
- Deep-link param contract + `return_url` allowlist (ParaUsted Phase B/C)
- Merchant notifications, invoicing/factura, partner redeem API, multi-currency

---

## 3. Dependencies (hard gates from ParaUsted)

| Dep | Needed for | Provided by | Gate |
|-----|-----------|-------------|------|
| 3 `gift_cards` UUIDs (+ title + prefix) | ST-1 | ParaUsted | Day 1 |
| Final deep-link param names + Zod contract | ST-2 prefill | ParaUsted Phase B | ParaUsted M2 (~Day 9) |
| `return_url` allowlist + our domain added | ST-3 | ParaUsted Phase C | ParaUsted M2 |
| Staging base URL | ST-4 | ParaUsted | ParaUsted M2 |
| Decision: voucher code in return URL (default no) | ST-3 | PO | Day 1 |

---

## 4. Stories

`feat/parausted-deep-links` (this repo)

| ID | Story | Est (pts) | Unblocked now? | Acceptance Criteria |
|----|-------|-----------|----------------|---------------------|
| ST-1 | SKU UUID config + `buildParaUstedGiftCardUrl` utility | 3 | ✅ (SKU path) | 3 SKUs as typed constants (env-backed); builder composes `/{locale}/m/seville-tours-co/gift-cards/{uuid}`; locale mapped es/en; **never** appends PII; unit-tested. Prefill params added only when ParaUsted confirms contract. |
| ST-2 | Update fixed/flex/luxury CTAs to deep links | 2 | Partial | Fixed Cathedral + fixed Alcázar CTAs point to their SKU URLs immediately; flexible/luxury CTA gains `amount` prefill **only after** ParaUsted Phase B; merchant page retained as generic "browse all" entry; 44×44px targets + `rel="noopener noreferrer"` preserved. |
| ST-3 | `/gift/thanks` return landing page (locale-aware) | 3 | ❌ | Reads only non-PII params (e.g. `status=success`); friendly confirmation + link back to tours; optional voucher link only if a code is present (default none); no server-side PII; passes a11y. |
| ST-4 | Staging round-trip QA | 2 | ❌ | Full click→SKU page→(prefill)→buy→return verified in ParaUsted staging; allowlist accept/reject confirmed; no PII in any URL. |

**Brand-side total: 10 pts**

---

## 5. Sequencing

```text
Day 1        → Receive 3 SKU UUIDs + PO decisions (code-in-return-url = no; send our domain to ParaUsted)
Day 2–3      → ST-1 builder + config + tests        ◀ ships independently (SKU path live)
Day 3–4      → ST-2 fixed-card CTAs → SKU URLs       ◀ ships independently
--- gate on ParaUsted M2 (~Day 9) ---
Day 9        → ST-2 amount prefill (flex/luxury) once Phase B param names final
Day 9–10     → ST-3 /gift/thanks landing once Phase C allowlist + our domain live
Day 10       → ST-4 staging round-trip QA + sign-off
```

**Independent slice (no ParaUsted dependency):** ST-1 + fixed-card portion of ST-2 can ship in the
first half of the sprint. Everything else gates on ParaUsted M2.

---

## 6. Milestones

| Milestone | Target | Exit Criteria |
|-----------|--------|---------------|
| BM1 — SKU deep links live | ~Day 4 | Fixed-card CTAs land on correct ParaUsted product pages; builder tested; build/lint green |
| BM2 — Prefill + return round trip | ~Day 10 | Amount prefill + `/gift/thanks` working against ParaUsted staging; no PII leakage |
| BM3 — Sprint done | Day 10 | All AC met; QA checklist complete; copy matches shipped redemption capability |

---

## 7. Validation Commands

```powershell
# Note: local build/WordPress fetches use a self-signed cert workaround in this env
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npm run build
npm run lint   # 2 pre-existing LanguageDropdown.tsx errors are unrelated/expected
```

Manual checks:

```text
Fixed Cathedral CTA  → ParaUsted product page for the Cathedral SKU UUID
Fixed Alcázar CTA    → ParaUsted product page for the Alcázar SKU UUID
Deep link + amount   → (after ParaUsted Phase B) product page shows clamped amount
Deep link + PII param→ ignored by ParaUsted (we never send PII anyway)
return_url=our domain→ "Return to Seville Tours" CTA → /gift/thanks renders (no PII)
return_url=evil host → rejected by ParaUsted, no CTA
Luxury copy          → no partial-redemption promise until ParaUsted partial RPC ships
```

---

## 8. Security & Privacy Checklist (gate for BM3)
- [ ] No PII (recipient/sender email or phone) in any outbound deep-link URL.
- [ ] Only ParaUsted-confirmed params are appended; unknown params not invented.
- [ ] `/gift/thanks` reads non-PII params only; no secrets/codes required in URL.
- [ ] Voucher code not placed in return URL by default (R3).
- [ ] SKU UUIDs stored in config/env, not hardcoded inline in components.
- [ ] Existing no-PII guarantee in `merchant-url.ts` preserved and extended to the new builder.

---

## 9. Risks

| Item | Type | Mitigation / Owner |
|------|------|--------------------|
| ParaUsted M2 slips | Dependency | ST-1 + fixed-card CTAs ship independently; prefill/return follow |
| SKU UUIDs change after re-seed | Risk | Env-backed config; documented update path; staging QA |
| Over-promising partial use | Copy risk | Keep luxury copy coordination-only until partial RPC ships |
| Our domain missing from allowlist | Dependency | PO sends production domain(s) to ParaUsted by Day 1 |

---

## 10. Post-Sprint / Backlog (brand side)
- Add precise partial-redemption copy (4 locales) once ParaUsted's partial RPC is live.
- Optional short, human-friendly product URLs if ParaUsted adds product slugs.
- Optional Carlos POS partial-redeem flow if ParaUsted ships a partner validate/redeem API.
