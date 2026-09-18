# The Operator Problem Map — What We Remove, and How

**Status:** Strategy / design reference. **Does not control the roadmap.** Nothing here is committed engineering.
**Version:** 1.0 — 2026-09-18
**Purpose:** list every operator problem we claim to address, state honestly what already solves it, and define exactly what Para Usted removes and by what mechanism.
**Related:** [vision](./next-gen-experience-platform-vision-2026-09.md) · [battle plan](./tis-2026-battle-plan.md) · [interview guide](./operator-interview-guide-2026-09.md) · [demo scenarios](./tis-2026-demo-scenarios.md) · [ParaUsted integration contract](../architecture/integrations/seville-tours-parausted-integration-contract-2026-06.md) · [deep links & partial redemption](../architecture/integrations/seville-tours-deep-link-partial-redemption-gap-and-plan.md)

**Evidence markers used throughout:**
`BUILT` — exists in this repo today · `CONTRACTED` — interface agreed, not callable · `DESIGNED` — on paper only · `HYPOTHESIS` — needs operator evidence · `BLOCKED` — waiting on a third party or on counsel

---

## 0. The rule that governs everything below

> **We do not rebuild what the operator already runs. We fill the hole that sits in front of it.**

Every booking system in this market — FareHarbor, Bókun, Rezdy, Peek, Ventrata — begins **after** the decision has been made. To create a FareHarbor booking you must already supply `availability.pk` and `customer_type_rate`. To pass work through the Bókun Marketplace you must already name a product and a commission.

Now try to express this in either system:

> *"Two of us, a few hours free, we like history and local food, maybe private, not sure which day."*

You cannot. **The deciding is unmodelled**, in every system, everywhere. It happens in WhatsApp, in email, and in the operator's head. That is the surface we work on.

Two constitutional refusals, unchanged: **we take no inventory, and we never resell.**

---

## 1. The four rails

| Rail | Who owns it | Our role |
|---|---|---|
| **Context** — what the traveller wants, what they chose, what is still open | **Para Usted** | Build it |
| **Commerce** — products, availability, price, booking, payment | FareHarbor · Bókun · operator checkout | Read, link out, never hold |
| **Operator** — capability, feasibility, acceptance, fulfilment, contract | The operator | Never substitute |
| **Memory & return** — story, review, reward, referral, gift, repeat | Para Usted + ParaUsted voucher platform | Build last, on top of the others |

The context rail is the only one with no incumbent. That is the whole company.

---

## 2. Problem inventory

Honest columns. If something is already solved, we say so and we do not compete with it.

| # | Operator problem | What they do today | Already solved by | **What we actually remove** | Status |
|---|---|---|---|---|---|
| 1 | Vague enquiry must be reconstructed before it can be answered | 10–20 WhatsApp messages | Nothing | Reconstruction. The Brief arrives organised, with unknowns named | `BUILT` (playback) |
| 2 | Traveller asks for something outside the catalogue | Ad-hoc chat; operator guesses what is meant | Nothing | Ambiguity. It becomes an explicit *question for the operator*, never an invented product | `BUILT` (playback) |
| 3 | Operator cannot tell what is blocking a quote | Reads the thread again | Nothing | The ordered **blocking-unknowns register** | `DESIGNED` |
| 4 | Passing work to another city loses all context | Forwarded WhatsApp | Commerce only (Bókun moves product + pax + commission) | Context loss across the handoff | `DESIGNED` — the wedge |
| 5 | No record of who referred whom | Memory, goodwill | Bókun referral tracking (commercial only) | Untracked *introductions* and the **balance of favour** | `DESIGNED` |
| 6 | Work passed to an operator who cannot actually serve it | Discovered after the fact | Nothing | Wasted routing — via **negative capability** records | `DESIGNED` |
| 7 | Availability / price quoted wrongly to a guest | Check the dashboard manually | FareHarbor dashboard | Guessing. `POST /bookings/validate/` confirms bookability + price **and creates nothing** | `DESIGNED` |
| 8 | Guest turns up without required ID | Operator eats the refund fight | Partly — FareHarbor per-pax custom fields | Preventable day-of failure, via an operator-approved checklist | `BLOCKED` — needs booking truth |
| 9 | Review capture is manual begging | Personal asks | Partly — OTA review flows | Manual chasing, once a completed booking exists | `BLOCKED` — needs booking truth |
| 10 | Referral and repeat business untracked | Nothing | Nothing | Lost continuity — permission-based only | `HYPOTHESIS` |
| 11 | Gift cards unsold / unmarketed / not integrated | Manual, or none | ParaUsted (for Seville Tours Co.) | Manual voucher admin and the acquisition surface | `BUILT` (V1, manual redemption) |
| 12 | Low season is dead | Discount, or close | Nothing | Off-season revenue via gift + return rewards | `HYPOTHESIS` |
| 13 | Multi-city composition | Excel + WhatsApp | Enterprise DMC platforms (teams of 10+ only) | Only the **intake**, never the itinerary or the pricing | `BLOCKED` — needs counsel |
| 14 | Being misrepresented by an AI agent | Nothing exists yet | Nothing | Fabricated answers given in the operator's name | `HYPOTHESIS` — the 2027+ thesis |

**Problems we explicitly do not address:** inventory management, channel management, capacity, payments, payroll, invoicing, accounting, guide rostering. Those have incumbents and we lose those fights.

---

## 3. Three operating models

### A — One operator (Carlos)

**Unit of work removed:** reconstructing the request before deciding what to do next.

```
Conversation → traveller-reviewed Journey Brief → matched published possibilities
             → explicit open questions → Operator Action Brief
```

The Action Brief answers six things and nothing else: what they said · what they saved · what they are asking · what is unknown · what has **not** been sent/priced/confirmed · what action is needed.

Five operator verbs, permanently: **I can do this · One question · Another direction · Not for us · Pass to someone.**
Never: *accept booking · confirm availability · auto-quote · arrange the journey.*

**Integration phases**

| Phase | What | Status |
|---|---|---|
| A1 | Link out to the operator's live booking flow; manifest-backed display data | `BUILT` |
| A2 | External API **read** — items, availability, price; plus `validate/` bookability probe | `DESIGNED` |
| A3 | Authorised booking write | **Not planned.** Revisit only with a commercial agreement |

Enablement is per-operator and operator-initiated: FareHarbor's `/companies/` returns only suppliers who *"requested the enablement of the API access for the given API Partner on their dashboard."* **Carlos flips the switch himself.** No central gatekeeper can block a single-operator pilot.

**Honest risk:** at low enquiry volume this may not justify changing a working WhatsApp habit. The TIS question is *at what monthly volume does structured context become worth it.*

---

### B — Multiple operators collaborating — **the wedge**

**Unit of work removed:** reconstructing and retransmitting context when work crosses an operator boundary.

Bókun already moves `contract + product + inventory + commission`, with per-product commission, unlimited partner contracts and referral tracking, at 1–1.5% booking fee. **Do not compete with that.** It cannot move *why*.

**Three stages**

1. **Anonymous match.** Operator B sees destination, date window, party size, request type, preferences, what is still open, and the source. **No traveller identity.** B answers: potentially relevant / need one detail / outside capability / not available / refer someone else.
2. **Traveller-controlled share.** Only the traveller can promote it to identified. They see exactly which fields travel and which do not. Options: share · edit first · choose a different operator · do not share.
3. **Immutable receipt.** Introduced by / introduced to / reason / Brief version / timestamp / *no commercial arrangement recorded* / *no booking created*.

**Design decisions that make this work**

- **The Brief is a recipient-scoped capability URL, not a document.** One resolvable URL per `(brief, recipient)` pair, versioned and content-hashed. A forwarded PDF is unrevocable, undated and forkable — it destroys attribution and consent in one move. If B forwards to C, C resolves *B's* token, so the onward pass is visible.
- **Revocation degrades to the anonymous summary.** It does not 404. A 404 reads as a bug; a downgrade reads as a policy.
- **The privacy boundary is the price boundary.** Anonymous matching free and unlimited; the **identified share is the only billable event**. GDPR data minimisation and the revenue model become the same line of code.
- **Capability records must be negative.** Every directory lists what operators *do*. The costly failure is routing to someone who *cannot* — no wheelchair access, no Arabic guide, no under-8s, no Alhambra licence, no 16-seat vehicle. Operators never publish exclusions but will state them to peers. `excludes` is first-class, sourced and dated, using the same provenance discipline as [tis-partner-catalogue.ts](../../src/lib/marco/showcase/tis-partner-catalogue.ts).
- **Reciprocity, not commission.** What kills informal networks is *"I send them work and get nothing back."* Bókun tracks money; nobody tracks balance of favour. A two-sided non-monetary count — *you introduced 4, received 1* — is cheap, self-policing, and structurally uninteresting to a commerce platform. Derived from the attribution records; never stored as truth; never converted to money by us.
- **Stamp, don't mirror.** On conversion, write our handoff ID into FareHarbor's `external_id` / `voucher_number`. Attribution lives inside **their** record, visible in **their** reporting. Write one field, own nothing.

**Never:** calculate commission, split revenue, issue supplier invoices, hold payouts, allocate refunds. That belongs to Bókun, the operators' contracts, and their accountants.

---

### C — One operator running a multi-city tour

**Unit of work removed:** turning a shifting conversation into a structured composition input — **and nothing else.**

The artefact is **not an itinerary draft.** They will rebuild the itinerary in their own tool regardless. What they cannot do cheaply is work out which five unknowns are stopping them from quoting.

```
Seville  · Alcázar possibility saved · private format preferred
Córdoba  · historical experience requested · date still flexible     ← BLOCKING
Granada  · Alhambra interest · ticket availability unknown           ← BLOCKING
Across   · 2 adults · transport undecided · no accommodation request
           NO INCLUSIVE PRICE · NO COMBINED SELECTION · NO PAYMENT
```

Export to their CRM / itinerary builder / proposal tool. Do not become their tool.

**Legal boundary — updated and material.** Directive **(EU) 2026/1024** was adopted 30 March 2026 and entered into force **28 May 2026**. It simplifies the package definition and **deletes the "linked travel arrangements" category entirely**. Member States have 28 months to transpose, binding on operators six months later — full application around **2029**.

Consequence: the intermediate cushion disappears. Post-transposition it is **binary** — either it is a package (full organiser liability, performance responsibility, insolvency protection, the new 7-day acknowledgement / 60-day response clock) or it is stand-alone services. For a product designed to stop before combining, a binary is *good news* — there is no longer a middle trap you fall into merely by facilitating a second booking. But the package threshold now carries all the weight, so **"who presents the inclusive price"** becomes the only question that matters.

Until transposition, the 2015/2302 rules as transposed in Spain still apply. Quote it as **"2015/2302, as amended by (EU) 2026/1024"**. Qualified counsel required before any C-shaped build.

---

## 4. The return loop — post-trip is not an appendix

The journey should not end at fulfilment. It should create a **permission-based reason to return.**

```
DISCOVER → DECIDE → BOOK → EXPERIENCE → REMEMBER → RETURN → DISCOVER AGAIN
```

**Post-trip operator work that is currently manual:** asking for reviews · sending photos · remembering who referred whom · encouraging repeats · selling gift cards · filling quiet periods · reaching guests who later visit another city · rewarding loyal guests without running a points programme.

### 4.1 Five financial objects — do not conflate them

| Object | Meaning | Liability sits with | Status |
|---|---|---|---|
| **Operator gift card** | Stored value, one operator | ParaUsted (issuance, balance, redemption, settlement) | `BUILT` — Seville Tours Co. merchant, fixed / flexible / luxury modes |
| **Experience gift card** | Named experience, date chosen later | ParaUsted | `BUILT` — fixed Alcázar voucher |
| **Network gift card** | Redeemable across participating operators | **Would land on us** | `DESIGNED` — do not build |
| **Discount voucher** | Conditional price reduction | Whoever funds it | Not started — do not build |
| **Returning-guest reward** | Bounded, operator-funded benefit | Operator | `HYPOTHESIS` |

### 4.2 The non-negotiable boundary

> **Seville Tours must not invent a second voucher ledger.** ParaUsted holds issuance, balance, redemption and settlement. We hold acquisition, presentation and lifecycle experience.

Current state, precisely:

- Read-only verification is live — `POST /api/parausted/verify` returns a masked code and balance only, and can never redeem. `BUILT`
- The commit adapter exists but has **no caller**, proven by a static test that walks `src/app/api/**`. `CONTRACTED`
- Partial redemption is contracted (partial when `amountCents` present, full when absent; stable `Idempotency-Key`; `already_processed` / `amount_exceeds_balance` / `idempotency_conflict`), and the ParaUsted-side RPC is **pending**. Do not promise partial use in copy until it ships. `BLOCKED`
- Redemption in V1 is **manual**: Carlos books the seat in FareHarbor and adjusts capacity himself. `BUILT`

A network gift card is not "just another voucher." It would make us responsible for outstanding balances, expiry, partial redemption across merchants, settlement, fraud, consumer terms, tax treatment and insolvency protection. **That is a company, not a feature.** Not before B is validated.

### 4.3 Trip Plan grammar applies to gifts too

`Gift considered → purchased → delivered → viewed → redemption started → operator booking completed → redeemed → expired / refunded`

Never say *"You have gifted the Alcázar on 12 October"* unless a date and a booking genuinely exist. A gift card purchase is **not** a date, **not** an availability check, and **not** a confirmed booking — the same discipline as `saved ≠ requested ≠ sent ≠ confirmed`.

### 4.4 Referral without turning memory into an advert

Not *"send this coupon to five friends."* Instead: *"share this journey, or send an experience as a gift."*

Rules: sharing is optional · public publication is separate from referral tracking · no contact import · no spam · reward terms visible · paid or rewarded recommendations disclosed · attribution expires · existing traveller content is never used for marketing without separate permission.

### 4.5 Souvenirs

> **A souvenir should help preserve the journey, not monetise the checkout.**

Digital (guide note, story, photo, exportable Brief history) and physical (print, travel book, operator-approved local item) are different commercial and fulfilment models. Neither before B.

---

## 5. Why the operator moves

We cannot *sell* to this market. **Over 70% of experience operators are micro-businesses**, and only **33% of experiences were booked online in 2025** versus 64% of travel overall. The best predictor of adoption is already in the interview guide: *"Has anyone sold you software in the last two years? What happened to it?"* — it usually died.

So both entry vectors must be **pull, not push**:

1. **Traveller → operator.** The Brief arrives in the WhatsApp he already reads.
2. **Operator → operator.** The handoff arrives from a peer he already trusts.

Neither requires a sale, a login, an install, or a migration.

**What actually moves him, in order:**

| Motivator | Delivered by | When |
|---|---|---|
| Work that disappears — not work that changes shape | He stops reconstructing enquiries | Day one, free |
| A booking he would not have had | Pre-qualified travellers; peer handoffs | Month 2+ |
| Risk that disappears | Unknowns named before he commits | Day one |
| Standing among peers | Reciprocity is on the record | Month 3+ |
| Not being spoken for by a machine | Signed human answers | 2027+ |

Not on that list, and each a reason he will *not* move: dashboards, analytics, CRM, "insights", points, another login.

### The 2027 thesis

Agentic booking is arriving — Meta shipped a travel agent with Duffel; Trip.com's TripGenie is gaining booking via Mastercard. When agents book, the operator becomes a row in a database, and an agent will confidently state his price, availability, cancellation terms and accessibility — wrongly — and he eats the complaint.

Plans become free and infinite. **The scarce thing becomes a verified human yes.** Intent goes in machine-readable; a named human decides; the answer comes out signed and attributable; and what the operator *will not* do is published too, so an agent can read it instead of guessing.

That is the same product as month one. The Brief is intent-in. The five verbs are judgement-out.

---

## 6. Sequencing

**Validation order** (what we test, and when)

1. Single-operator Journey Brief — the comprehension vehicle
2. **Multi-operator context handoff — the business**
3. Unsupported / arrangement requests
4. Post-trip operator and guide participation
5. Gift-card and reward demand
6. Multi-city composition intake
7. Native booking

**The order is forced, not chosen.** Post-booking preparation (#8, #9 in §2) needs booking truth → needs API enablement → needs a pilot → needs 1 or 2. Debating native booking now is wasted time.

**Long-term platform order:** traveller relationship → operator network → booking & fulfilment → voucher rails → memory & referral → repeat journeys → native booking → cross-operator settlement.

---

## 7. What we will not build before TIS

Reward points · generic coupons · network gift-card settlement · souvenir commerce · Living Story · referral engine · printed book · post-trip automation · native booking · persistence · an operator dashboard.

Feature freeze holds: **25 September**. Separately reviewed P0 fixes only, each followed by full regression and a fresh rehearsal.

**One mandatory test before freeze:** arrangement requests must never become saved possibilities, products, priced services, or sent requests. No claim about scenario B or C is permitted until that state test passes.

---

## 8. What TIS must validate

**Classify every operator into A, B or C in ninety seconds:**

1. Do you only fulfil your own published experiences?
2. How often do travellers ask for something outside your catalogue?
3. How often do you refer work to another operator? How often do you receive it?
4. What information arrives with referred work? What do you have to ask again?
5. Who talks to the traveller after a referral? Who creates the price? Who collects payment? Who is responsible if a supplier fails?
6. Do you combine services into one proposal?
7. Which software holds the booking? Which holds the original traveller context?

**The single best scenario-B question — past tense, phone-answerable:**

> *"The last time you passed work to another operator — what did you send them, what did they still have to ask you, and who stayed responsible to the traveller?"*

**Post-trip block, bounded:**

8. What happens after an experience ends? How do you ask for reviews, and how many respond?
9. How do you recognise a returning traveller? Can you attribute a referral?
10. Do you sell gift cards? Which type sells? How are balances tracked?
11. What happens when the gift value is lower than the experience? Higher? Who handles partial redemption?
12. Would you accept a platform gift card? Who should hold the voucher liability?
13. Would you honour a reward funded by another operator?
14. **Which post-trip task would you pay to stop doing manually?**

> *"Think about the last guest who referred someone or came back. How did you recognise the relationship, and what happened next?"*

**Evidence target:** for each operator, one real example from the last 90 days of single-operator clarification, cross-operator referral, and multi-city composition. If a workflow has not occurred in 90 days, its commercial frequency is probably too low for that segment.

---

## 9. What would kill this — state it out loud

- Cross-operator handoffs turn out to be **rare** → scenario B dies and only the weaker wedge remains
- Travellers **will not complete or review** a Brief → there is no input at all
- The Brief saves ten minutes on four enquiries a month → real, but not a business
- Operators **will not accept** a structured handoff from a third party
- An existing form or template already solves it well enough
- We build a dashboard and become the twelfth login he ignores — **entirely within our control; do not do it**

If any two hold across the interviews, say so in the corrections register, in public, the same way vision v1.1 was amended.

---

## 10. The thesis, current form

> **We organise. The traveller decides. The operator confirms. The journey continues.**

Operator version:

> **Para Usted helps operators receive better requests, collaborate without losing context, keep booking authority, and turn completed experiences into reviews, referrals, gifts and repeat journeys.**

Floor version, provable today, attacks nobody:

> *"Your booking system knows what someone bought. It has never known what they wanted — and soon an AI will be guessing that on your behalf, in your name. We organise what the traveller actually said, and we stop where your judgement starts."*
