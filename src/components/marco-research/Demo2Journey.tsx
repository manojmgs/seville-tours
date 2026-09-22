"use client";

import { useState } from "react";
import type { MarcoTour } from "@/components/marco-chat/types";
import { BoundaryNote, ChipButton, LabelledList, Panel, ResearchQuestion } from "./ResearchUi";
import { attributionFor } from "@/lib/marco/showcase/tis-partner-catalogue";
import {
  buildDemo2Receipt,
  DEMO2_ACTION_BRIEF,
  DEMO2_BLOCKING_UNKNOWNS,
  DEMO2_CANDIDATE,
  DEMO2_COMMERCIAL_QUESTIONS,
  DEMO2_CONCEPT_ACTIONS,
  DEMO2_DAYS,
  DEMO2_NOT_SHARED,
  DEMO2_OPERATOR_ACTIONS,
  DEMO2_OPPORTUNITY_FIELDS,
  DEMO2_RECEIPT_EXAMPLE_TIMESTAMP,
  DEMO2_REQUEST,
  DEMO2_SHARED,
  DEMO2_STAGES,
  demo2DayTour,
  type Demo2Stage,
} from "@/lib/marco/research/demo2-journey";

/**
 * Demo 2 — the operator stays lead while another professional may be needed.
 *
 * One stage at a time, advanced by the presenter. Nothing auto-advances and
 * nothing is transmitted; the receipt says so explicitly.
 */
export function Demo2Journey({ tours }: { tours: readonly MarcoTour[] }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [operatorChoice, setOperatorChoice] = useState<string | null>(null);
  const [conceptChoice, setConceptChoice] = useState<string | null>(null);
  const [preparedForReview, setPreparedForReview] = useState(false);

  const stage: Demo2Stage = DEMO2_STAGES[stageIndex].id;
  const isLast = stageIndex === DEMO2_STAGES.length - 1;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-display text-2xl font-semibold text-[var(--brand-green-900)]">
          Demo 2 · Four-day private journey and professional collaboration
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Step {stageIndex + 1} of {DEMO2_STAGES.length} · {DEMO2_STAGES[stageIndex].label}
        </p>
      </header>

      {stage === "request" ? (
        <Panel title="What the traveller asked for">
          <LabelledList label="Request" items={DEMO2_REQUEST} />
          <ul className="mt-4 space-y-3">
            {DEMO2_DAYS.map((day) => {
              const tour = demo2DayTour(tours, day);
              return (
                <li key={day.label} className="rounded-[1rem] border border-[var(--border-soft)] p-4">
                  <p className="text-sm font-semibold text-[var(--brand-green-900)]">
                    {day.label} · {day.city}
                  </p>
                  {tour ? (
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {tour.name} · {attributionFor(tour.id).operator} · {tour.price}{" "}
                      {attributionFor(tour.id).priceBasis}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{day.note}</p>
                </li>
              );
            })}
          </ul>
          <BoundaryNote lines={["Days 3 and 4 stay empty. We do not invent an itinerary."]} />
        </Panel>
      ) : null}

      {stage === "unknowns" ? (
        <Panel title="What blocks a quote" tone="open">
          <LabelledList label="Blocking unknowns" items={DEMO2_BLOCKING_UNKNOWNS} />
          <BoundaryNote lines={["There is no inclusive price here, and there will not be one."]} />
        </Panel>
      ) : null}

      {stage === "actionBrief" ? (
        <Panel title="Carlos's action brief" tone="known">
          <LabelledList label="What the traveller said" items={DEMO2_ACTION_BRIEF.travellerSaid} />
          <LabelledList label="What Carlos may handle" items={DEMO2_ACTION_BRIEF.carlosMayHandle} />
          <LabelledList label="What may require another professional" items={DEMO2_ACTION_BRIEF.mayNeedAnother} />
          <LabelledList label="What is still unknown" items={DEMO2_ACTION_BRIEF.stillUnknown} />
          <LabelledList label="What has not happened" items={DEMO2_ACTION_BRIEF.hasNotHappened} />
          <div className="mt-4 flex flex-wrap gap-2">
            {DEMO2_OPERATOR_ACTIONS.map((action) => (
              <ChipButton
                key={action}
                pressed={operatorChoice === action}
                onClick={() => setOperatorChoice(action)}
              >
                {action}
              </ChipButton>
            ))}
          </div>
        </Panel>
      ) : null}

      {stage === "discovery" ? (
        <Panel title="One candidate for the Granada day" tone="ask">
          <p className="font-display text-base font-semibold text-[var(--brand-green-900)]">
            {DEMO2_CANDIDATE.label}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {DEMO2_CANDIDATE.destination} · {DEMO2_CANDIDATE.capability} · {DEMO2_CANDIDATE.languages}
          </p>
          <LabelledList label="Requires confirmation" items={DEMO2_CANDIDATE.requiresConfirmation} />
          <BoundaryNote
            lines={[
              "No permissioned record exists for a Granada operator, so nobody is named.",
              "This is not a partnership, a recommendation, a ranking, a price or a contract.",
            ]}
          />
        </Panel>
      ) : null}

      {stage === "opportunity" ? (
        <Panel title="What the other professional would see">
          <dl className="space-y-2">
            {DEMO2_OPPORTUNITY_FIELDS.map((field) => (
              <div key={field.label} className="flex flex-wrap justify-between gap-2 border-b border-black/5 py-2">
                <dt className="text-sm text-[var(--text-muted)]">{field.label}</dt>
                <dd className="text-sm font-semibold text-[var(--brand-green-900)]">{field.value}</dd>
              </div>
            ))}
          </dl>
          <BoundaryNote
            lines={[
              "Traveller identity has not been shared.",
              "No booking created. Availability not confirmed. No price quoted.",
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {DEMO2_CONCEPT_ACTIONS.map((action) => (
              <ChipButton key={action} pressed={conceptChoice === action} onClick={() => setConceptChoice(action)}>
                {action}
              </ChipButton>
            ))}
          </div>
        </Panel>
      ) : null}

      {stage === "sharing" ? (
        <Panel title="The traveller decides what is shared" tone="known">
          <LabelledList label="Shared" items={DEMO2_SHARED} />
          <LabelledList label="Not shared" items={DEMO2_NOT_SHARED} />
          <div className="mt-4">
            <ChipButton pressed={preparedForReview} onClick={() => setPreparedForReview(true)}>
              Prepare for review
            </ChipButton>
          </div>
          <BoundaryNote
            lines={[
              "Preparing context lets a professional review the request. It does not create a booking, confirm availability or set a price.",
            ]}
          />
        </Panel>
      ) : null}

      {stage === "receipt" ? (
        <Panel title="Introduction context prepared" tone="open">
          <dl className="space-y-2">
            {buildDemo2Receipt(DEMO2_RECEIPT_EXAMPLE_TIMESTAMP).map((row) => (
              <div key={row.label} className="flex flex-wrap justify-between gap-2 border-b border-black/5 py-2">
                <dt className="text-sm text-[var(--text-muted)]">{row.label}</dt>
                <dd className="text-sm font-semibold text-[var(--brand-green-900)]">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#6b531d]">
            A versioned receipt. It can be corrected or withdrawn.
          </p>
          <BoundaryNote lines={["No real operator was contacted and no traveller information was transmitted."]} />
        </Panel>
      ) : null}

      {stage === "commercial" ? (
        <Panel title="Professionals decide outside this concept" tone="ask">
          <LabelledList label="Left open on purpose" items={DEMO2_COMMERCIAL_QUESTIONS} />
          <BoundaryNote
            lines={[
              "This concept answers none of these. No commission is calculated and no settlement exists.",
            ]}
          />
        </Panel>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <ChipButton onClick={() => setStageIndex((index) => Math.max(0, index - 1))}>Back</ChipButton>
        {!isLast ? (
          <ChipButton onClick={() => setStageIndex((index) => index + 1)}>Next step</ChipButton>
        ) : null}
      </div>

      <ResearchQuestion question="Would this have reduced the work in your last multi-day or referred request, or would it create another link to manage?" />
    </div>
  );
}
