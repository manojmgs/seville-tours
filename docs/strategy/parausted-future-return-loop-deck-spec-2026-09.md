# Para Usted — Future Return-Loop Deck Specification

**Status:** Documentation only. **This is a specification for a deck that does not exist yet.** No slides, no PPTX, no assets. Produce the presentation later, through the slides workflow, after product-owner approval.
**Version:** 1.0 — 2026-09-21
**Audience:** operators, DMOs and partners, **after** the operator-handoff wedge has evidence.
**Explicitly NOT:** the TIS 2026 demo. That deck stays focused on the operator handoff. This one is separate, later, and must never be merged into the TIS playback.
**Grounded in:** [operator product vision §4](../strategy/operator-problem-map-2026-09.md) · [reward, loyalty and return](./reward-loyalty-and-return-2026-09.md) · [what we sell](./what-we-sell-2026-09.md) · [ParaUsted integration contract](../architecture/integrations/seville-tours-parausted-integration-contract-2026-06.md)

---

## 0. The rule this deck must obey

> **Every claim carries a status marker, and no slide may imply that a `DESIGNED`, `HYPOTHESIS` or `BLOCKED` capability is available today.**

The deck exists to explain a *direction*, and to be honest about how little of it is built. If a slide cannot be traced to a repository record or a named document, it does not go in the deck.

Three distinctions the deck must never blur:

1. **Reselling or transferring unused voucher value is not reselling a tour.** The operator was already paid in full at the point of sale; value changes hands between two travellers and never touches operator revenue. The constitutional refusal — *we take no inventory, we never resell a tour* — is untouched by this.
2. **Cross-operator merchandise is not a network gift card.** A keepsake is *goods*: no capacity, no double-booking, no Package Travel Directive exposure. Stored value spendable across merchants is a different object entirely.
3. **A network gift card is a financial and operational business model, not a feature.** Balances, expiry, partial redemption across merchants, settlement, fraud, consumer terms, tax treatment and insolvency protection all land on the issuer.

---

## 1. Slide structure

### Slide 1 — The journey should not end at fulfilment

The operator's post-trip work is manual today: asking for reviews, sending photos, remembering who referred whom, encouraging repeats, selling gift cards, filling quiet periods, reaching guests who later visit another city, rewarding loyal guests without running a points programme.

No claim of a solution on this slide. Problem only.

### Slide 2 — What is actually built: operator-specific gift cards

`BUILT`. Seville Tours Co. is a live ParaUsted merchant. Acquisition surfaces exist on the homepage, in the header, in Marco chat, on the booking page and on the souvenir shelf. **Every one is an outbound link.** No purchase happens in the Seville Tours codebase.

State the boundary on the slide, not in the notes:

| System | Owns |
|---|---|
| ParaUsted | Issuance, payment, balance, validity, delivery, redemption, settlement |
| FareHarbor | Tour booking and seat capacity |
| Seville Tours | Explanation, acquisition, presentation, read-only advisory verification |

Name the one approved product: the fixed **Alcázar gift card, €50, 365 days validity**. Everything else on the shelf is a labelled sample.

### Slide 3 — Gift-card truth: a purchase is not a booking

The lifecycle grammar, shown as the slide's spine:

```
Gift considered → purchased → delivered → viewed → redemption started
→ operator booking completed → redeemed → expired / refunded
```

A gift-card purchase is **not** a date, **not** an availability check, **not** a redemption and **not** a confirmed booking — the same discipline as `saved ≠ requested ≠ sent ≠ confirmed`.

Say plainly that V1 redemption is **manual**: the guest sends the code, the operator redeems in the ParaUsted dashboard and books the seat in FareHarbor themselves. `BUILT`.

### Slide 4 — Customer retrieval through gifting

A gift is the only mechanism in the product where **a new traveller arrives already holding value they did not buy**. Free acquisition for the operator, funded by someone else.

Status: acquisition `BUILT`; gift-it-forward mechanics `DESIGNED`.

### Slide 5 — Returning-guest rewards without points

Bounded, **operator-funded** benefit. Not a points programme, not a currency, not a balance we hold. The liability sits with the operator by design.

Status: `HYPOTHESIS`.

### Slide 6 — Journey memories and meaningful souvenirs

Print-on-demand shelf, per operator. Three branding modes the **operator** chooses — operator mark, city name only, unbranded. Three fulfilment choices — ship home, waiting on arrival, collect on the day. Bought *before* the trip as often as after, because nobody wants to carry a ceramic tile around Andalucía for ten days.

Design ownership sits with the operator; we supply templates. We never put an operator's name on a product they did not approve.

Status: shelf exists as a labelled demonstration; expansion is `DESIGNED`.

### Slide 7 — The unused-value waterfall

Five paths, in order of value preserved:

| # | Path | Note |
|---|---|---|
| 1 | **Use it** | Best outcome, nothing to design |
| 2 | **Give it** | New traveller arrives holding value |
| 3 | **Convert at full face value** | €100 becomes €100 of merchandise, never marked down |
| 4 | **List for resale at the holder's own price** | €100 listed at €80; if it doesn't sell, the voucher stays theirs |
| 5 | **Pre-expiry intervention** | The honest email, which earns its welcome because we tried |

The line that carries the slide:

> **Conversion beats resale for everyone: €100 of something is worth more than €80 of cash.**

And the reversal that must be stated, not hidden: resale is **not** discount leakage. The operator was paid €100 at full price. The €80 moves between two travellers. It is **liquidity on a secondary product**, and it makes the primary voucher easier to sell because the buyer's biggest objection — *"what if it goes unused?"* — disappears.

Status: entire waterfall beyond step 1 is `DESIGNED`.

### Slide 8 — Operator-specific value versus network-wide value

Five financial objects, never conflated:

| Object | Liability | Status |
|---|---|---|
| Operator gift card | ParaUsted | `BUILT` |
| Experience gift card | ParaUsted | `BUILT` |
| Network gift card | **Would land on us** | `DESIGNED` — do not build |
| Discount voucher | Whoever funds it | Not started — do not build |
| Returning-guest reward | Operator | `HYPOTHESIS` |

The non-negotiable: **Seville Tours must not invent a second voucher ledger.**

### Slide 9 — Cross-operator merchandise versus cross-operator stored value

The cheap rail and the expensive rail, side by side.

**Merchandise across operators:** a traveller can order from any participating operator's shelf. Goods, not a travel service. No capacity, no availability, no package exposure, retail margin rather than commission.

**Stored value across operators:** balances, expiry, partial redemption across merchants, settlement, fraud, consumer terms, tax, insolvency protection.

Same word — "cross-operator". Completely different business.

### Slide 10 — Why a network gift card is a company-level decision

> **That is a company, not a feature.** Not before the handoff hypothesis is validated.

Sequenced deliberately last in the platform order: traveller relationship → operator network → booking and fulfilment → voucher rails → memory and referral → repeat journeys → native booking → cross-operator settlement.

### Slide 11 — The adviser questions, stated openly

Do not answer these on the slide. Showing that we know them is the credibility.

- **Expiry** — several EU regimes restrict short expiry periods. This determines whether operator buyback is even rational (it is not, while vouchers expire: the operator keeps 100% for free by doing nothing).
- **Payments** — resale needs a **licensed PSP with the seller as a connected account**. We facilitate; we do not become a money transmitter.
- **Fraud** — a **holding period longer than the card chargeback window** before listing, which removes the buy-with-stolen-card, resell-for-clean-money pattern.
- **Tax and settlement** — treatment of network value, unresolved.
- **Breakage** — a waterfall where value always finds a use deliberately destroys our own breakage revenue. **Take that trade knowingly**, not by discovering later where the margin went.

### Slide 12 — The long-term loop

```
discover → decide → book → experience → remember → gift / share → return → discover again
```

One sentence of honesty underneath: only `discover → decide` and the gift-card acquisition step exist today.

### Slide 13 — Evidence gates before any build

Nothing past the operator gift card gets built until the handoff evidence exists. The gate is the same instrument used at TIS: **handoff frequency, booking value, friction, and the strength of the current workaround** ([field card](./operator-handoff-field-card-2026-09.md)).

If a workflow has not occurred in 90 days for an operator, its commercial frequency is probably too low for that segment.

### Slide 14 — Status summary (the closing slide, and the most important one)

| Status | Items |
|---|---|
| **BUILT** | Operator-specific gift-card acquisition · fixed Alcázar gift card (€50, 365 days) · read-only verification (`POST /api/parausted/verify`, masked code and balance only, can never redeem) · manual V1 redemption workflow |
| **CONTRACTED** | Commit adapter exists with **no caller**, proven by a static test that walks `src/app/api/**` · partial-redemption contract (partial when `amountCents` present, full when absent; stable `Idempotency-Key`; `already_processed` / `amount_exceeds_balance` / `idempotency_conflict`) |
| **DESIGNED / HYPOTHESIS** | Souvenir shelf expansion · returning-guest rewards · gift-it-forward · voucher resale · cross-operator merchandise · network gift cards · cross-operator settlement · loyalty portability |
| **BLOCKED** | ParaUsted-side partial-redemption RPC pending · legal advice on expiry · PSD2 / payment-facilitation analysis · tax and settlement design · fraud and chargeback controls · network liability model |

---

## 2. Production constraints for whoever builds the deck

- **Do not modify the TIS playback** to support this deck. It is slides only.
- **Do not demonstrate** anything in the `DESIGNED`, `HYPOTHESIS` or `BLOCKED` rows as working software.
- **Do not promise partial redemption in copy** until the ParaUsted-side RPC ships.
- **Do not represent flexible-value or luxury/private gifts as having stable product identifiers.** Only the fixed Alcázar card has one; the others link to the generic merchant page.
- Prohibited unsupported claims anywhere in the deck: *Booking confirmed · Available now · Order completed · Voucher redeemed · Price confirmed.*
- Required and permitted bounded statements: *Nothing has been booked · Availability has not been confirmed · Nothing has been ordered · No price has been quoted · No redemption has occurred.*
