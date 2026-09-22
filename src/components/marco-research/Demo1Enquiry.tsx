"use client";

import { useId, useReducer, useState } from "react";
import type { FormEvent } from "react";
import type { MarcoTour } from "@/components/marco-chat/types";
import { BoundaryNote, ChipButton, LabelledList, Panel, ResearchQuestion } from "./ResearchUi";
import { ResearchBubble, ResearchWindow } from "./ResearchWindow";
import {
  buildDemo1Brief,
  createDemo1State,
  DEMO1_EXTRAS,
  DEMO1_OFF_CATALOGUE_ASKS,
  demo1StatusLine,
  nextDemo1Question,
  transitionDemo1,
  type Demo1Contact,
} from "@/lib/marco/research/demo1-state";
import {
  operatorsFor,
  priceWithBasis,
  researchPossibilities,
  sourceHost,
} from "@/lib/marco/research/catalogue";

/**
 * Demo 1 — from scattered traveller questions to operator-published options.
 *
 * Five questions, language first, then everything else is offered rather than
 * demanded. Deterministic and local: no typing to reach the brief, no fetch, no
 * storage. Manifest hero images are deliberately not rendered.
 */
export function Demo1Enquiry({ tours }: { tours: readonly MarcoTour[] }) {
  const [state, dispatch] = useReducer(transitionDemo1, undefined, createDemo1State);
  const [multiDraft, setMultiDraft] = useState<readonly string[]>([]);
  const [contact, setContact] = useState<Demo1Contact>({ name: "", email: "", phone: "" });
  const fieldId = useId();

  const question = nextDemo1Question(state);
  const brief = buildDemo1Brief(state);
  const interests = state.answers.interests ?? [];
  const possibilities = researchPossibilities(tours, interests).filter(
    (entry) => !state.dismissedTourIds.includes(entry.tour.id),
  );
  const operators = operatorsFor(possibilities);
  const deciding = state.phase === "deciding";
  const canPrepare = contact.name.trim().length > 0 && contact.email.trim().length > 0;

  const answerMulti = () => {
    if (!question || multiDraft.length === 0) return;
    dispatch({ kind: "answer", slot: question.slot, values: multiDraft });
    setMultiDraft([]);
  };

  const prepareEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canPrepare || !state.chosenOperator) return;
    dispatch({
      kind: "prepareEnquiry",
      contact,
      operator: state.chosenOperator,
      at: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-display text-2xl font-semibold text-[var(--brand-green-900)]">
          Demo 1 · From a WhatsApp question to a useful request
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Five questions, language first. Everything after that is offered, not demanded.
        </p>
      </header>

      <ResearchWindow
        avatar="M"
        title="Marco"
        subtitle="Local operator knowledge. Not the open web."
        statusLine={demo1StatusLine(state)}
        latestKey={`${state.phase}-${state.turns.length}`}
        conversation={
          <>
            {state.turns.map((turn) => (
              <ResearchBubble key={turn.id} speaker={turn.speaker} text={turn.text} />
            ))}

            {question ? (
              <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
                <p className="text-sm font-semibold text-[var(--brand-green-900)]">{question.prompt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {question.choices.map((choice) => (
                    <ChipButton
                      key={choice.value}
                      pressed={question.multi ? multiDraft.includes(choice.value) : undefined}
                      onClick={() => {
                        if (question.multi) {
                          setMultiDraft((current) =>
                            current.includes(choice.value)
                              ? current.filter((value) => value !== choice.value)
                              : [...current, choice.value],
                          );
                          return;
                        }
                        dispatch({ kind: "answer", slot: question.slot, values: [choice.value] });
                      }}
                    >
                      {choice.label}
                    </ChipButton>
                  ))}
                </div>
                {question.multi ? (
                  <div className="mt-3">
                    <ChipButton onClick={answerMulti}>That&apos;s everything</ChipButton>
                  </div>
                ) : null}
              </div>
            ) : null}

            {deciding ? (
              <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
                <p className="text-sm font-semibold text-[var(--brand-green-900)]">
                  Anything else worth knowing? Only if you want to.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DEMO1_EXTRAS.map((extra) => (
                    <ChipButton
                      key={extra.value}
                      pressed={state.extras.includes(extra.label)}
                      onClick={() => dispatch({ kind: "addExtra", label: extra.label })}
                    >
                      {extra.label}
                    </ChipButton>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
                  You can stop here. Nothing above is required.
                </p>
              </div>
            ) : null}
          </>
        }
        context={
          !deciding ? (
            <Panel title="Journey Brief">
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                This fills in as you answer. Nothing is booked, sent or checked.
              </p>
            </Panel>
          ) : (
            <>
              <Panel title="Journey Brief · reviewed by the traveller" tone="known">
                <LabelledList label="Known" items={brief.known} />
                <LabelledList label="Preferences" items={brief.preferences} />
                <LabelledList label="What the traveller said" items={brief.travellerWords} />
                <LabelledList label="Still open" items={brief.stillOpen} />
                <LabelledList label="To ask the operator" items={brief.askOfOperator} />
                <BoundaryNote
                  lines={[
                    "A preference is not a confirmation.",
                    "An interest is not a booking.",
                    "An open question is not an arranged service.",
                  ]}
                />
              </Panel>

              <Panel title="What operators publish">
                {operators.length > 1 ? (
                  <p className="mb-3 rounded-[10px] border border-[var(--brand-green-700)]/25 bg-white px-3 py-2 text-xs leading-5 text-[var(--brand-green-900)]">
                    These come from {operators.length} different operators. Each one confirms their own.
                  </p>
                ) : null}
                <ul className="space-y-4">
                  {possibilities.map((entry) => (
                    <li key={entry.tour.id} className="rounded-[1rem] border border-[var(--border-soft)] bg-white p-4">
                      <p className="font-display text-base font-semibold text-[var(--brand-green-900)]">
                        {entry.tour.name}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {entry.attribution.operator} · {priceWithBasis(entry)} · {entry.tour.duration}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                        Why this appeared: {entry.reason}
                      </p>
                      <div className="mt-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#6b531d]">Not checked</p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs leading-5 text-[var(--text-muted)]">
                          {entry.notChecked.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                        Source: {sourceHost(entry.attribution)} · read on {entry.attribution.capturedOn}
                        {entry.attribution.permission === "written-permission"
                          ? " · shown with the operator's permission"
                          : null}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={entry.tour.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-h-11 items-center rounded-full border border-[var(--brand-green-900)]/40 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
                        >
                          Explore
                        </a>
                        <ChipButton
                          pressed={state.savedTourIds.includes(entry.tour.id)}
                          onClick={() => dispatch({ kind: "saveTour", tourId: entry.tour.id })}
                        >
                          Save as a possibility
                        </ChipButton>
                        <ChipButton onClick={() => dispatch({ kind: "dismissTour", tourId: entry.tour.id })}>
                          Not relevant
                        </ChipButton>
                        <ChipButton
                          pressed={state.privateVersionAsks.includes(entry.tour.name)}
                          onClick={() => dispatch({ kind: "askPrivateVersion", tourName: entry.tour.name })}
                        >
                          Ask about a private version
                        </ChipButton>
                      </div>
                    </li>
                  ))}
                </ul>
                <BoundaryNote
                  lines={[
                    "No booking created. Availability not confirmed. No price quoted beyond what the operator publishes.",
                    "Nothing here says this is the best operator, the lowest price, or right for you.",
                  ]}
                />
              </Panel>

              <Panel title="Things no operator has published" tone="ask">
                <p className="text-sm leading-6 text-[var(--brand-green-900)]">
                  These stay questions. They never become a product, a price or an arrangement.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DEMO1_OFF_CATALOGUE_ASKS.map((ask) => (
                    <ChipButton
                      key={ask.value}
                      pressed={state.operatorQuestions.includes(ask.label)}
                      onClick={() => dispatch({ kind: "askOperator", label: ask.label })}
                    >
                      {ask.label}
                    </ChipButton>
                  ))}
                </div>
                <BoundaryNote
                  lines={["I do not have these in any catalogue here, so I will not invent one."]}
                />
              </Panel>

              <Panel title="Choose who to ask" tone="open">
                <div className="flex flex-wrap gap-2">
                  {operators.map((operator) => (
                    <ChipButton
                      key={operator}
                      pressed={state.chosenOperator === operator}
                      onClick={() => dispatch({ kind: "chooseOperator", operator })}
                    >
                      {operator}
                    </ChipButton>
                  ))}
                </div>

                {state.enquiry ? (
                  <div className="mt-4 rounded-[10px] border border-[var(--brand-green-700)]/25 bg-[#f6faf7] p-4">
                    <p className="text-sm font-semibold text-[var(--brand-green-900)]">
                      Enquiry prepared for {state.enquiry.operator}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                      {state.enquiry.operator} would receive the Journey Brief, the saved possibilities and the open
                      questions — addressed to {state.enquiry.contact.name}.
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#6b531d]">
                      Demonstration only — no message left this browser and no operator has been contacted.
                    </p>
                  </div>
                ) : state.chosenOperator ? (
                  <form onSubmit={prepareEnquiry} className="mt-4 space-y-3">
                    <p className="text-sm leading-6 text-[var(--text-muted)]">
                      {state.chosenOperator} needs a way to reply.
                    </p>
                    <Field
                      id={`${fieldId}-name`}
                      label="Your name"
                      value={contact.name}
                      onChange={(name) => setContact((current) => ({ ...current, name }))}
                    />
                    <Field
                      id={`${fieldId}-email`}
                      label="Email"
                      type="email"
                      value={contact.email}
                      onChange={(email) => setContact((current) => ({ ...current, email }))}
                    />
                    <Field
                      id={`${fieldId}-phone`}
                      label="Phone or WhatsApp (optional)"
                      type="tel"
                      value={contact.phone}
                      onChange={(phone) => setContact((current) => ({ ...current, phone }))}
                    />
                    <button
                      type="submit"
                      disabled={!canPrepare}
                      className="min-h-11 rounded-[10px] bg-[var(--brand-green-900)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold-500)]"
                    >
                      Prepare the enquiry
                    </button>
                  </form>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                    Pick an operator first. Nothing is sent either way.
                  </p>
                )}
              </Panel>
            </>
          )
        }
      />

      <ResearchQuestion question="Would receiving this reviewed request remove meaningful WhatsApp work, or would it become another summary to read?" />
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel";
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-[var(--brand-green-900)]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-[10px] border border-[var(--border-soft)] bg-white px-3 text-sm text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
      />
    </div>
  );
}
