# WhatsApp-First Trip Planning & Booking — Feasibility Assessment

> Deliverable produced by running `whatsapp-booking-feasibility-research-prompt.md` against two HAR captures of the live site (captured 2026‑07‑01).
> Capture 1 reached Stripe payment-element setup. Capture 2 reached a Stripe **payment confirmation attempt** (which failed on a live-mode test card).
> Vendor-neutral framing is used for recommendations; HAR findings are specific because the evidence is specific. No raw sensitive payloads (session/persistence UUIDs, CSRF tokens, PII, card data) are reproduced here — see the Data Handling Note.

---

## Executive Summary

The website funnels bookings into an **embedded FareHarbor booking widget**, with **Stripe** as the payment processor (via a FareHarbor-owned Stripe **connected account**, `acct_1Q27VMICgWuygC42`, currency **EUR**). The entire availability → cart → pricing → payment journey runs on **FareHarbor's internal (undocumented) embed/API endpoints** under `fareharbor.com/api/...`, keyed by a **server-side persistent store UUID** rather than a logged-in customer account.

Critically: **a successful final booking creation is still NOT evidenced.** The second capture advanced further than the first — it reached customer/custom-field entry and a Stripe **payment confirmation attempt** — but that attempt **failed** (a known Stripe test card was used in live mode, declined as `live_mode_test_card`). So we now have evidence of the *payment-attempt mechanics*, but **no successful paid-booking confirmation or receipt** was captured. The last mile (turn an agreed quote into a paid, confirmed reservation) remains the part with the *least* evidence and the *highest* integration risk.

**Verdict: CONDITIONALLY RECOMMENDED.** WhatsApp-first is a strong fit for *lead qualification and concierge selling* of private/luxury tours, and it can materially lift trust and conversion for high-consideration trips. But it should **complement, not replace** the existing FareHarbor+Stripe checkout, and the actual paid booking should be created through **FareHarbor's official partner/reseller API (with an API key)** — not by reverse-engineering the embed endpoints seen in the HAR, which are session/cookie-bound, unauthenticated at the client, and can change without notice.

Recommended shape:
- **MVP:** "Plan a Trip" → short structured form → deep-link to WhatsApp with a pre-filled, itemised message → human/AI-assisted concierge → agent completes the sale by sending a **FareHarbor payment/booking link** (or books manually in the FareHarbor dashboard). Zero reverse-engineering, zero payment-handling risk.
- **V1:** Add an AI qualification layer + CRM + a thin server that generates FareHarbor booking/pay links via the **official API**, plus analytics and abandonment recovery.

---

## HAR Findings

### Providers identified (validated by payloads, not assumed)

| Concern | Provider | Evidence |
|---|---|---|
| Booking / reservation system | **FareHarbor** | All commerce calls under `fareharbor.com/api/...`; company `sevilletoursco` (pk `119528`, "Seville Tours Co."), `processor_currency: "eur"` |
| Payment processor | **Stripe** | `api.stripe.com/v1/elements/sessions`, `pk_live_5FCeUYuVtc0RN4Pa3C17g82R`, `on_behalf_of=acct_1Q27VMICgWuygC42`, `referrer_host=fareharbor.com` |
| Payment model | **Stripe Elements, deferred PaymentIntent, connected account** | `type=deferred_intent`, `deferred_intent[mode]=payment`, `deferred_intent[on_behalf_of]=acct_...` |
| Wallets | Apple Pay / Google Pay | `is_wallet_payments_enabled: true`; `merchant-ui-api.stripe.com/elements/wallet-config`; `pay.google.com/gp/p/ui/pay` |
| Fraud / bot | hCaptcha (Stripe-side) | `api.hcaptcha.com/getcaptcha/...` on `b.stripecdn.com` |
| Feature flags | Statsig | `featureassets.org/v1/initialize` |
| Telemetry | Sentry + OpenTelemetry | `o10963.ingest.sentry.io`, `otel-hfo.fareharbor.engineering/v1/traces` |

**Product under test:** item `577856` = *"Seville's Alcazar Guided Tour – small group"*, priced in EUR, with multiple `customer_type_rate`s (adult/child/etc.). Amounts are in minor units (e.g. `12594` = €125.94, `594` = €5.94, booking fee separate).

### Session / persistence model

FareHarbor does **not** use a per-user login for the end customer. State is held in a **server-side persistent store** identified by a UUID:

- `GET/PUT /api/v1/persistence/{uuid}/sevilletoursco/cart/` — the cart (availability, `customer_breakdown`, `totals`, payment model).
- `GET /api/v1/persistence/{uuid}/sevilletoursco/analytics/`
- `GET /api/v1/persistence/{uuid}/` — the persistent-store object itself.
- A second `client_uuid` (e.g. `510bb3e0-...`) scopes the in-page booking session, plus a `total_sheet` id (`604405`) that ties pricing/tax together.

Implication: the "cart" is portable via the persistence UUID, but it is **anonymous, embed-scoped, and undocumented** — not a stable public contract you can safely build a WhatsApp bridge on.

### Flow diagram (as evidenced)

```
User (embed on sevilletoursco.com, lightframe → fareharbor.com)
  │
  ├─▶ Item + calendar          GET  /companies/sevilletoursco/items/577856/                 [internal]
  │                            GET  /companies/.../items/577856/calendar/2026/07/           [internal]
  │
  ├─▶ Availability + capacity  GET  /companies/.../items/577856/availabilities/{pk}/        [internal]
  │                            GET  /companies/.../availabilities/{pk}/live/?...             [internal, real-time capacity/hold]
  │                            POST /companies/.../queuing/items/577856/refresh/            [internal, queue/anti-oversell]
  │
  ├─▶ Quote / pricing          GET  /price-preview/per-item/v2/?item_pks=577856             [internal]
  │                            GET  /total-sheets/604405/pricing/availabilities/{pk}/       [internal, tax/booking-fee]
  │
  ├─▶ Cart (persist)           PUT  /persistence/{uuid}/sevilletoursco/cart/                [internal, anonymous]
  │                            GET  /persistence/{uuid}/sevilletoursco/cart/                [internal]
  │
  ├─▶ Customer/pax fields      Book-form: pax name + passport/ID custom fields             [internal, capture 2]
  │
  ├─▶ Payment setup            GET  api.stripe.com/v1/elements/sessions?deferred_intent...  [Stripe, public pk_live]
  │                            POST merchant-ui-api.stripe.com/elements/wallet-config       [Stripe]
  │
  ├─▶ Payment CONFIRM attempt  Stripe confirmation-token / confirm-payment                  [Stripe, capture 2]
  │                            └─ FAILED: live_mode_test_card (test card in live mode)
  │
  ├─▶ [Create booking]         ❌ NOT REACHED (payment failed → no success response)
  └─▶ [Confirmation / receipt] ❌ NOT REACHED
```

### API classification

- **Public / documented:** none of the commerce endpoints. Only Stripe's client SDK calls (public `pk_live`) are "public" in the ordinary sense. FareHarbor *does* publish an official partner **FareHarbor API** (API-key authenticated), but **it is not the API used here** — the page uses the embed's internal endpoints.
- **Internal (undocumented):** all `fareharbor.com/api/v1/...` and `/api/embed/...` calls. Session/cookie + persistence-UUID scoped, no client API key.
- **Authenticated (API-key):** none observed client-side.
- **Reverse-engineering required:** customer creation, booking creation, reservation hold semantics, confirmation — none are validated by a successful response in either HAR and none should be reverse-engineered for production.

### Second HAR: Payment Attempt Evidence

The second capture progressed further into the funnel than the first. It confirms the following stages exist, in order, but it **does not** prove a successful booking was created.

- **Cart persistence/update** — the embed persisted/updated the FareHarbor cart for `item_pk 577856`, `availability_pk 1979337053`, date **2026‑07‑09**, with customer-type/rate quantities and payment metadata (gross / booking fee / tax) attached to the cart model.
- **Customer & required-participant fields** — the book form collected customer data and **per-participant custom fields**, including **name** and **ID/passport number** (required for monument/Alcázar-style ticketing). *(These fields are captured here only as field names — no real personal data is reproduced in this report.)*
- **Stripe Elements payment setup** — deferred PaymentIntent / Elements session initialised for the connected account (as in capture 1).
- **Stripe payment confirmation attempt** — a Stripe confirmation-token / payment-confirmation call was made (the actual "confirm payment" step, beyond mere setup).
- **Outcome: FAILED.** The attempt used a **known Stripe test card in live mode** and was rejected (`card_declined` / `live_mode_test_card`). No charge succeeded.
- **Consequence:** because payment failed, FareHarbor never returned a successful booking-creation / confirmation / receipt response. **Final booking creation remains unvalidated from HAR evidence.**

Interpretation: capture 2 proves that structured **cart + customer-field + payment-token preparation** happens client-side and that a real confirmation call is attempted. It does **not** prove that an automated third party could create a *paid, confirmed* booking — the success branch was never reached. Treat "payment attempted" as strictly weaker evidence than "booking confirmed", and do not conflate the two.

---

## Product Manager View

**Problem being solved:** private/luxury and small-group tours are *high-consideration* purchases (date flexibility, group size, kids, accessibility, language, special requests). A rigid checkout leaks these buyers. WhatsApp restores a human, trusted, mobile-native conversation — the way this segment already prefers to buy.

**Where WhatsApp wins:** custom/private itineraries, multi-tour trips, large groups, VIP, non-English buyers, last-minute date juggling.
**Where it loses:** simple, single, cheap, "just book it now" tickets — where a one-tap FareHarbor checkout converts *better* than a chat.

**Product principle:** keep **both paths**. Standard SKUs keep instant checkout; "Plan a Trip / private & custom" routes to WhatsApp. Never remove the direct-book button.

**Success metrics:** WhatsApp open rate from CTA, reply rate, qualified-lead rate, conversation→paid conversion, median time-to-quote, revenue per conversation, abandonment recovered.

---

## Architect View

Treat FareHarbor and Stripe as **external boundaries** and never let the client (or a WhatsApp bridge) pretend to be the booking engine.

**Recommended V1 architecture:**

```
Next.js site
  └─ "Plan a Trip" (Server Component page + small Client form)
        └─ POST /api/trip-inquiry            (validate, rate-limit, GDPR consent)
              ├─ persist lead → CRM / DB
              ├─ build structured WhatsApp deep link (wa.me / API)
              └─ (V1) call FareHarbor OFFICIAL API to mint a booking/pay link
Concierge (human + optional AI draft)
  └─ agrees dates/quote in WhatsApp
        └─ sends FareHarbor pay link  ──▶  customer pays via Stripe (unchanged)
              └─ FareHarbor webhook ──▶ /api/webhooks/fareharbor (idempotent) ──▶ CRM + notify
```

**Boundaries:**
- **Do not** call `/api/v1/persistence/...` or `/live/` from your own server to fake a booking. They are undocumented and hold-sensitive (oversell risk).
- Use the **official FareHarbor API + API key** server-side only for any programmatic availability/booking-link creation.
- Any webhook (FareHarbor or Stripe) handler must be **idempotent** and must never assume single delivery (repo rule).
- Europe/Madrid timezone for all availability/booking logic (repo rule).

---

## Sales View

WhatsApp is a concierge *sales channel*, not just support. It shortens the distance between interest and a paid booking and lets an agent upsell (private upgrade, add-on tours, larger group, tastings). For luxury buyers, a fast, personal, multilingual reply is itself the differentiator.

**Watch-outs:** response-time SLAs make or break it; slow replies burn hot leads. Needs templated answers, quote snippets, and a clear handoff-to-pay step so agents don't hand-key card data (they must not — payment stays in Stripe via FareHarbor links).

---

## Marketing View

- Add a **"Plan a Trip / Private & Custom"** CTA next to (not instead of) "Book now".
- Use WhatsApp **click-to-chat** as a first-class conversion event; track it as a micro-conversion.
- Pre-filled structured messages reduce buyer effort and raise reply quality (name, tour, date window, group size, language).
- Retargeting: abandoned WhatsApp conversations are a recoverable audience if consent is captured.

---

## SEO View

**WhatsApp must complement, not replace, the booking pages.** Reasons:
- Organic traffic, local SEO, destination/landing pages and `Product`/`Offer`/`Event` structured data all depend on **crawlable tour pages with prices and availability**. A pure `wa.me` funnel is invisible to search and kills rich results.
- Keep every tour URL indexable with schema.org markup and a visible price + direct-book path; add WhatsApp as an *additional* CTA.
- Do not put booking behind a chat-only wall — it would remove indexable conversion surfaces and depress rankings.

**Verdict: complement.**

---

## API Discovery Report

| Category | Endpoint (evidence) | Purpose (validated) | Confidence | Risk to reuse |
|---|---|---|---|---|
| Item/metadata | `GET /companies/sevilletoursco/items/577856/` | Tour definition (name, currency, rates) | High | Low (read) |
| Availability (calendar) | `GET /items/577856/calendar/2026/07/` | Monthly bookable days | High | Low (read) |
| Availability (slot) | `GET /items/577856/availabilities/{pk}/` | Specific slot detail | High | Low (read) |
| Live capacity | `GET /availabilities/{pk}/live/?customer_type_rate_counts=...` | Real-time capacity for a party mix | High | **Med** (hold/oversell semantics) |
| Anti-oversell queue | `POST /queuing/items/577856/refresh/` | Booking queue refresh | Med | **Med** |
| Quote / price | `GET /price-preview/per-item/v2/?item_pks=577856` | Per-item price preview | High | Low (read) |
| Tax/fees | `GET /total-sheets/604405/pricing/availabilities/{pk}/` | Totals incl. tax + booking fee | High | Low (read) |
| Cart (persist) | `GET/PUT /persistence/{uuid}/sevilletoursco/cart/` | Anonymous server-side cart | High | **High** (undocumented, embed-scoped) |
| Persistent store | `GET /persistence/{uuid}/` | Store/company/cart bundle | High | High |
| Customer / custom-field capture | Book-form fields (pax name, ID/passport) tied to the cart model | Collect required participant data before payment | **Med–High** (observed in capture 2) | **High** (PII; undocumented if reused directly) |
| Payment session (setup) | `GET api.stripe.com/v1/elements/sessions?deferred_intent...` | Stripe deferred PaymentIntent setup | High | High (owned by FareHarbor's Stripe acct) |
| Payment confirmation attempt | Stripe confirmation-token / confirm-payment call | Attempt to confirm/charge the PaymentIntent | **High** (attempt observed in capture 2) | **High** (payment path; reuse = handling funds/PII) |
| Wallet config | `POST merchant-ui-api.stripe.com/elements/wallet-config` | Apple/Google Pay | High | High |
| **Successful booking create** | — (would follow a *successful* payment; not reached) | — | **None / Unknown** (payment failed on `live_mode_test_card`) | **Unknown/High** |
| **Final confirmation / receipt** | — (never returned; no successful charge) | — | **None / Unknown** | **Unknown** |

### Technical feasibility (per requested classification)

| Capability | Classification | Basis |
|---|---|---|
| Availability lookup | **Direct API support** | Official FareHarbor API exists; also evidenced in embed |
| Quote creation | **Likely API support** | Price-preview/total-sheet evidenced; official API has pricing |
| Booking creation | **Likely (official API) / reverse-engineering required (embed)** | Not in HAR; official partner API supports it |
| Reservation holding | **Reverse-engineering required / unlikely (safely)** | `live/`+queue imply holds but semantics undocumented |
| Customer creation | **Likely (official API)** | Not in HAR; part of booking payload normally |
| Payment request generation | **Direct (via FareHarbor pay links) / likely (API)** | Stripe is FareHarbor-owned; safest via FareHarbor-generated links |
| Booking modification | **Likely API support** | Standard in FareHarbor partner API |
| Cancellation | **Likely API support** | `is_online_cancellation_enabled:false` here, but API supports it |

---

## User Journey Models — comparison

| | Model A: Plan→WhatsApp→Human→Manual book | Model B: Plan→Form→WhatsApp→Assisted | Model C: Plan→AI qualify→WhatsApp→Booking |
|---|---|---|---|
| Trust | High | High | Med–High |
| Conversion | Med | **High** | High (if AI is good) |
| Effort (buyer) | Low | Low–Med | Low |
| Effort (ops) | **High** | Med | Low |
| Scalability | Low | Med | **High** |
| Operational cost | High per lead | Med | Low per lead (higher build) |
| Implementation risk | **Lowest** | Low | Med–High |

**Best starting point: Model B** (structured form → WhatsApp → assisted, agent completes via FareHarbor pay link). Evolve toward **Model C** as volume justifies AI qualification.

---

## WhatsApp Integration Strategy — options

| | Option 1: Site→WhatsApp | Option 2: Site→Trip Planner→WhatsApp | Option 3: Site→AI Planner→WhatsApp→Booking API |
|---|---|---|---|
| Complexity | Very low | Low | High |
| Maintenance | Very low | Low | High |
| Conversion impact | Low–Med (unqualified) | **High** | High |
| Scalability | Low | Med | **High** |
| Business suitability | Tiny teams | **Best fit now** | Growth stage |

Recommended: **start Option 2, grow into Option 3.** Booking creation in Option 3 must use the **official FareHarbor API**, never the embed's internal endpoints.

---

## Commercial Assessment

| | Small (1–5) | Medium (5–25) | Large (25+) |
|---|---|---|---|
| Response burden | High (few agents) | Manageable with rota | Needs routing/queues |
| Staffing | Owner-led, best-effort SLA | Dedicated concierge | Team + shift coverage |
| Conversion impact | High per lead, capped by capacity | High | High, sustained |
| Revenue impact | Meaningful on high-value trips | Strong | Strong, compounding |
| Multilingual | Hard (person-dependent) | Templates + AI assist | AI + native speakers |

For a 1–5 person operator (typical for this business), Model B/Option 2 with WhatsApp templates + a response-time SLA is the sweet spot; AI drafting relieves multilingual and after-hours pressure without ceding control of the sale.

---

## Risk Assessment (20+ risks & mitigations)

1. **Embed endpoints undocumented/unstable** → use official FareHarbor API; never depend on `/persistence`, `/live`.
2. **Booking-create flow unknown (absent in HAR)** → validate official API in a sandbox before committing.
3. **Oversell / inventory conflict** if holds are faked → only FareHarbor holds inventory; sell via FareHarbor links.
4. **Payment handled off-platform by agents** → forbid manual card entry; pay only via Stripe/FareHarbor links.
5. **Stripe connected account is FareHarbor's** → don't attempt direct Stripe charges; keep payments inside FareHarbor.
6. **WhatsApp reply latency loses hot leads** → SLA, auto-ack, AI drafts, business-hours messaging.
7. **Lead loss (chat abandoned)** → capture lead + consent server-side before opening WhatsApp; enable follow-up.
8. **GDPR: personal data + special requests** → explicit consent, minimal retention, lawful basis, EU processing (repo GDPR rules).
9. **WhatsApp policy limits (24h window, templates)** → use approved templates; respect opt-in.
10. **Spam/abuse of WhatsApp CTA** → rate-limit inquiry API, captcha on form, block obvious bots.
11. **Multilingual quality** → AI translation review; canned multilingual snippets.
12. **Operational overload at peak** → routing, queueing, autoresponders, cap concurrent chats.
13. **SEO regression if checkout hidden** → keep indexable tour pages + schema; WhatsApp is additive.
14. **Structured-data mismatch** (price in schema vs quoted) → keep schema tied to FareHarbor list price.
15. **Webhook double-delivery** → idempotent handlers keyed by event id.
16. **Timezone bugs** → Europe/Madrid everywhere for slots.
17. **Quote drift** (price changes between chat and pay) → generate fresh FareHarbor link at pay time.
18. **PII in analytics/telemetry** → scrub Sentry/OTel payloads; no special-request data in logs.
19. **Agent device security** (WhatsApp on personal phones) → WhatsApp Business + access controls.
20. **Vendor lock-in to FareHarbor** → keep an abstraction layer over booking-link generation.
21. **AI hallucinated availability/price** → AI never quotes bindingly; only FareHarbor data is authoritative.
22. **Conversion attribution loss** → tag WhatsApp deep links with campaign/lead ids.
23. **Refund/cancellation confusion** (`is_online_cancellation_enabled:false`) → document manual policy; keep audit trail.
24. **Single-agent bus factor** → shared inbox, not a personal number.
25. **Mistaking a payment *attempt* for a confirmed booking** → capture 2 reached payment confirmation but **failed**; never treat "payment attempted"/PaymentIntent created as a booking. Only a FareHarbor-confirmed booking (or Stripe `payment_intent.succeeded` reconciled to a FareHarbor booking) counts as sold.
26. **Live-mode payment testing risk** → the failed attempt used a test card in **live** mode; never test against live keys/accounts. Use Stripe/FareHarbor **sandbox/test mode** only; guard live keys.
27. **Sensitive-data leakage via HAR/exports** → HAR captures contain session/persistence UUIDs, CSRF tokens, PII (pax name, passport/ID), and payment telemetry. Never commit HARs; store/share sanitised only (see Data Handling Note + `.gitignore`).
28. **Reverse-engineering payment/cart endpoints** → replaying Stripe confirm-token or FareHarbor cart/persistence calls risks broken payments, ToS breach, and fund-handling liability → use FareHarbor pay links / official API only.
29. **Final booking-success path still unvalidated** → no successful confirmation/receipt captured; do not build automation assuming the success branch works — prove it in sandbox first.

---

## Recommended MVP (safest)

**Goal:** low risk, high conversion, minimal ops. **No reverse-engineering. No payment handling by us.**

1. "Plan a Trip / Private & Custom" CTA on home + tour pages (keeps direct-book intact).
2. Short structured form (Server Component page + small Client form): name, tour(s) of interest, date window, group size (adults/children), language, special requests, consent checkbox.
3. `POST /api/trip-inquiry`: Zod validation, rate-limit, store lead (Supabase, RLS), record GDPR consent.
4. Build a **pre-filled WhatsApp deep link** (structured, itemised) and open WhatsApp.
5. Agent converses, then **completes the sale by sending a FareHarbor booking/pay link** (or books in the FareHarbor dashboard). Stripe checkout unchanged.
6. Analytics events: CTA click, form submit, WhatsApp open.

This delivers the desired experience end-to-end while touching **zero** undocumented endpoints and **zero** card data.

> Reaffirmed after capture 2: the MVP is unchanged. Because the observed payment attempt failed and no automated booking success was proven, the payment step **must** stay inside FareHarbor/Stripe via a FareHarbor-generated pay/booking link — the concierge never handles cards and we never replay cart/payment endpoints.

---

## Recommended V1 (production)

- **Frontend:** Plan-a-Trip flow + optional lightweight AI qualifier (client → server) that structures the request; both direct-book and WhatsApp paths preserved for SEO.
- **Backend services:** `trip-inquiry` (validate/persist/consent), `whatsapp-bridge` (deep link or WhatsApp Business API templates), `booking-link` (calls **official FareHarbor API** to mint availability-checked pay/booking links), `webhooks/fareharbor` (idempotent) → CRM + notifications.
- **CRM:** lead + conversation state + outcome; abandonment follow-up.
- **Booking integration:** official FareHarbor API only; Europe/Madrid tz; no embed-endpoint reuse.
- **Analytics/reporting:** funnel (CTA→form→WhatsApp open→reply→quote→paid), revenue per conversation, SLA dashboards, recovered abandonment.

---

## 12-Month Roadmap

- **M0–1:** MVP (Model B / Option 2) live; analytics + consent + SLA.
- **M2–3:** WhatsApp Business API + approved templates; shared inbox; abandonment follow-up.
- **M3–5:** Validate & integrate **official FareHarbor API** in sandbox; server-generated pay links.
- **M5–7:** CRM + conversation outcomes + reporting; multilingual snippet library.
- **M7–9:** AI qualification/draft-reply (Model C), human-in-the-loop; AI never quotes bindingly.
- **M9–12:** Optimisation — routing, retargeting, upsell playbooks; measure revenue-per-conversation vs direct-book.

---

## Final Verdict

**CONDITIONALLY RECOMMENDED.**

**Justification.** The two HARs prove a mature, working FareHarbor+Stripe checkout that already converts standard bookings well — so WhatsApp should **augment** it for high-consideration private/luxury trips, not replace it (which would harm SEO and remove a proven conversion path). The second capture **increases** confidence that the funnel assembles a structured cart, collects required participant data (name, passport/ID), and attempts a real Stripe payment confirmation — i.e. the *preparation* mechanics are real and observable. But it **does not** prove successful automated booking creation: the payment attempt **failed** on a live-mode test card, so no confirmation/receipt was ever returned and the success path is unvalidated. The condition therefore stands and is strict: the **paid booking must be created through FareHarbor's official, API-key-authenticated partner API (or via FareHarbor-generated pay links)** — never by reverse-engineering the undocumented, session-scoped embed/persistence/payment endpoints observed here, and never by handling card data outside Stripe. Prove the last mile in a **sandbox/test-mode** environment before automating it. Start with the low-risk human/assisted MVP (Model B / Option 2), then graduate to AI qualification and API-generated booking links as volume warrants.

---

## Data Handling Note

HAR/TXT captures used for this assessment **must not be committed to Git** and must be kept out of the repository. A raw HAR can contain:

- session cookies, **persistence/session UUIDs**, and **CSRF tokens**;
- **PII** entered on the book form (participant names, **passport/ID numbers**, email, phone);
- **payment telemetry** and Stripe tokens/PaymentIntent identifiers;
- full request/response bodies including customer-entered data.

Rules: share only **sanitised** excerpts (field *names*, endpoint *shapes*, sanitised examples — never real values); redact UUIDs/tokens/PII/card data; store captures outside the repo or in a secured, access-controlled location; and ensure `.gitignore` excludes `*.har` and the `*.txt` evidence exports (see patch below). This report itself contains no raw sensitive payloads by design.
