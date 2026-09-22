# TIS Handoff Concept — Read-Only Scope and File-Impact Report

**Status:** Assessment only. This report exists to decide whether the three cross-operator concept screens may be built before the 30 September optional freeze.
**Version:** 1.1 — 2026-09-21
**Verdict:** **Isolated, additive, testable and disposable — implementation may be *sequenced*, not yet authorised in full.** See §7 and §9.
**Related:** [operator problem map](../strategy/operator-problem-map-2026-09.md) · [field card](../strategy/operator-handoff-field-card-2026-09.md) · [battle plan](../strategy/tis-2026-battle-plan.md)

### Change record for this assessment

> **No application code was modified. Two documentation files were created:** this file and [operator-handoff-field-card-2026-09.md](../strategy/operator-handoff-field-card-2026-09.md).

"Read-only" in the title describes the *repository inspection* — files were read, never edited. It does not mean no documentation was produced.

---

## 1. What was assessed

Three concept screens reached from the existing **"Pass to {operator}"** action:

1. **Anonymous opportunity** — a receiving operator sees a request with no traveller identity.
2. **Traveller-approved sharing** — explicit shared / not-shared split, traveller confirms.
3. **Introduction receipt** — a versioned record of what was prepared, for what stated purpose, when.

The question is not whether they are desirable. It is whether they can be added **without touching the traveller playback that freezes on 25 September**.

---

## 2. The seam that makes this safe

The operator side is already a separate, self-contained leaf.

| Fact | Evidence |
|---|---|
| The operator view is injected as an opaque node, not wired into the window | [TisTravellerExperience.tsx](src/components/marco-showcase/TisTravellerExperience.tsx#L473) — `operatorView: React.ReactNode` |
| It renders in its own exclusive branch, never alongside the traveller panes | [TisTravellerExperience.tsx](src/components/marco-showcase/TisTravellerExperience.tsx#L553) |
| `TisOperatorView` receives **read-only derived props** and no `dispatch` | [TisOperatorView.tsx](src/components/marco-showcase/TisOperatorView.tsx#L13-L22) |
| The existing pass action already uses **local component state**, not the reducer | [TisOperatorView.tsx](src/components/marco-showcase/TisOperatorView.tsx#L34) — `useState<string \| null>(null)` |
| Every prop is a pure derivation recomputed each render | [TisTravellerExperience.tsx](src/components/marco-showcase/TisTravellerExperience.tsx#L584-L606) |

**Consequence:** the concept flow can hold its own local state machine and be deleted by removing one component and one JSX block. It cannot corrupt `TisConversationState`, because it can never dispatch.

---

## 3. File-impact estimate

### Would change

| File | Change | Risk |
|---|---|---|
| [TisOperatorView.tsx](src/components/marco-showcase/TisOperatorView.tsx) | **Add** an optional presenter action inside the existing `passedTo` terminal panel. The panel itself is not replaced. | Low, once §5 is followed. |

### Would be added

| File | Purpose |
|---|---|
| `src/components/marco-showcase/TisHandoffConcept.tsx` | Client component owning the 3-step local state machine and all three screens |
| `src/lib/marco/showcase/tis-handoff-concept.ts` | Pure step model, shared/not-shared field lists, receipt builder — testable without rendering |
| `test/components/marco-showcase/TisHandoffConcept.test.tsx` | Step transitions, boundary copy present, no forbidden verbs |
| `test/lib/marco/showcase/tis-handoff-concept.test.ts` | Pure model + receipt shape |

### Must **not** change

- [tis-conversation-state.ts](src/lib/marco/showcase/tis-conversation-state.ts) — no new `TisConversationAction`, no new slot, no new `TisTripPlanItemKind`
- [TisTripPlan.tsx](src/components/marco-showcase/TisTripPlan.tsx), [TisOpportunityBrowser.tsx](src/components/marco-showcase/TisOpportunityBrowser.tsx), [TisEnquiryPanel.tsx](src/components/marco-showcase/TisEnquiryPanel.tsx), [TisArrangementRequests.tsx](src/components/marco-showcase/TisArrangementRequests.tsx)
- [playback/page.tsx](src/app/[locale]/tis-showcase/playback/page.tsx)
- Any i18n file — the showcase is English-only and ~40 tests assert English strings

**Net:** 4 new files, 1 edited file, 0 reducer lines. That is as close to additive as this codebase allows.

---

## 4. Constraints the concept path already inherits for free

| Constraint | How it is already guaranteed |
|---|---|
| Dev-only | [playback/page.tsx](src/app/[locale]/tis-showcase/playback/page.tsx#L21) calls `notFound()` when `NODE_ENV !== "development"` |
| Non-persistent | State is `useReducer` in memory; the page states *"Local playback only. Nothing leaves this browser."* |
| Non-transmitting | No fetch exists anywhere in the showcase; the operator list is derived from the local catalogue |
| Deterministic / offline | No remote images, no runtime fetch, no LLM — free text is stored verbatim and never interpreted |
| Already labelled | The existing pass panel already prints *"Demonstration only — no operator was contacted."* |

The concept flow inherits all five by construction. No new infrastructure is required — and none may be added.

---

## 5. The one genuine risk, and the required structure

`passedTo` currently renders a **terminal confirmation panel** that the presenter may already be rehearsing. **It must not be replaced.**

Required structure — additive, not substitutive:

```
Existing terminal operator panel   (unchanged, still the default outcome)
        +
Optional presenter action: "Show handoff concept"   (only when the flag is on)
```

This preserves the rehearsed path and makes the conceptual transition a deliberate presenter choice rather than a silent behavioural change.

**Flag (required):** a single module-level constant in `TisOperatorView.tsx`:

```
TIS_HANDOFF_CONCEPT_ENABLED = false
```

The `TIS_` prefix prevents the flag from reading as a dormant production feature. It stays `false` until implementation and focused tests are **separately authorised**. If replacement of the terminal panel ever becomes unavoidable, the flag must restore the prior behaviour behaviour-for-behaviour, proven by test — not by inspection.

**Secondary risk:** there is **no existing test for `TisOperatorView`** — the showcase suite covers the reducer, scenarios, `TisTripPlan`, `TisShowcaseLauncher` and the page. The pass action is therefore currently unprotected. Coverage must be added **before** any concept code, not alongside it.

---

## 6. Copy rules the implementation must enforce (testable)

**Do not write a blanket vocabulary ban.** Words such as *book*, *available* and *sent* are legitimate inside bounded negative statements — *"Nothing has been booked"*, *"Availability has not been checked"*, *"No request was sent"*. A naive substring test would fail on exactly the copy we most want to keep.

The test must reject **unsupported positive state claims**, and require the corresponding boundary copy.

### Required boundary claims (must be present on the receipt)

```
No booking created
Availability not confirmed
No price quoted
No real operator contacted
Concept demonstration
```

### Prohibited positive claims (must never render, anywhere in the concept path)

```
Booking confirmed
Available now
Request sent
Operator accepted
Price confirmed
```

Assert on **exact prohibited claim strings**, not on tokens in isolation.

### Remaining copy rules

- **Screen 1 action labels** are constrained to: *potentially relevant*, *need one detail*, *not for us*, *suggest another professional*. Assert the permitted set is what renders — do not assert the absence of the word *accept*.
- **Screen 2** must render an explicit **NOT SHARED** list — payment details, passport/ID, unrelated Trip Plan items, private operator notes, other operator conversations.
- **Screen 3** heading is *"Introduction prepared"*, never *"Introduction sent"* — nothing is transmitted. This is an exact-heading assertion.
- The word **immutable** must appear nowhere in the concept path. Use **versioned introduction receipt**. This one *is* safe as a vocabulary ban, because the word has no legitimate bounded-negative use here.
- **Every** concept screen displays **Concept demonstration**. The receipt additionally displays: *"No real operator was contacted. No traveller information was transmitted. No booking was created."*

---

## 7. Five conditions before concept-screen implementation

Implementation is approved **only if all five are satisfied**.

### Condition 1 — Existing playback remains frozen

No changes to: traveller questions · Journey Brief semantics · Trip Plan semantics · saved possibilities · arrangement requests · product matching · catalogue behaviour · booking links · existing operator-response meaning.

### Condition 2 — Concept state remains local and disposable

Local presentational state only — `anonymousOpportunity`, `shareReview`, `receipt`. It must not alter the canonical conversation state and must not create persistence. Zero lines change in [tis-conversation-state.ts](src/lib/marco/showcase/tis-conversation-state.ts); the concept flow never receives `dispatch`.

### Condition 3 — The entire concept is visibly labelled

Every concept screen displays **Concept demonstration**. The final receipt displays: *"No real operator was contacted. No traveller information was transmitted. No booking was created."*

### Condition 4 — Focused tests exist first

Before any screen copy is added, protect: the existing terminal state · feature-off behaviour · no mutation of traveller state · no network calls · no persistence · no positive booking or transmission claim.

### Condition 5 — Killability is demonstrated

Turning the flag off restores the trusted playback with no dead controls, no changed copy, no changed state, no snapshot drift, no test exclusions and no accessibility regressions.

**Kill rule:** if any condition fails by 30 September, the concept is disabled and the three stages are narrated from a static card.

> **The defensible claim is:** the concept can be disabled through one isolated feature flag, **with focused tests proving that the trusted playback remains unchanged** — not that removal "costs one character". Safe removal depends on branch coverage, component isolation, absence of hidden state dependency, tests, presenter controls, accessibility and build behaviour.

---

## 8. Sequencing reminder

The [field card](../strategy/operator-handoff-field-card-2026-09.md) is the deliverable that must not slip. It produces evidence whether or not these screens exist. The screens are optional; the evidence instrument is not.

---

## 9. Authorised next slice — and its stopping point

Not yet "build the screens". The next authorised slice is narrow and ends in a review:

```
1. Add the disabled TIS_HANDOFF_CONCEPT_ENABLED flag
2. Add focused tests around the existing operator terminal state
3. Confirm no existing behaviour changes
4. STOP. Review the diff.
```

Only afterwards, and only one at a time with a review between each:

1. Anonymous opportunity
2. Traveller sharing review
3. Versioned introduction receipt

**Precondition for starting even slice 1:** the bilingual field card has been previewed at A6, rehearsed in English and Spanish, and timed in a mock interview.
