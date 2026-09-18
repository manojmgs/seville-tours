"use client";

import { useState } from "react";
import { TIS_SCENARIO_FIXTURES } from "@/lib/marco/showcase/tis-scenarios";
import { TIS_TRUSTED_SOURCE_SNAPSHOTS } from "@/lib/marco/showcase/trusted-source-snapshots";
import type {
  ExpectedOutcome,
  ExpectedRecommendationType,
  JourneyStage,
  ProhibitedClaim,
  ReviewStatus,
  TisScenarioFixture,
  TravellerAction,
  TrustedSourceSnapshot,
} from "@/lib/marco/showcase/types";

const journeyStageLabels: Record<JourneyStage, string> = {
  planning: "Planning",
  comparing: "Comparing options",
  readyToBook: "Ready to book",
  booked: "Booked",
  preTripMonitoring: "Pre-trip monitoring",
};

const outcomeLabels: Record<ExpectedOutcome, string> = {
  bookableExperience: "A bookable experience",
  operatorConfirmation: "Operator confirmation",
  informationalUpdate: "An informational update",
  noSafeMatch: "No safe match",
};

const recommendationLabels: Record<ExpectedRecommendationType, string> = {
  fixedExperience: "Fixed experience",
  customPrivateDirection: "Custom private direction",
  publicOperatorPossibility: "Public operator possibility",
  officialEvent: "Official event information",
};

const actionLabels: Record<TravellerAction, string> = {
  checkDates: "Check dates",
  bookNow: "Book now",
  continueRefining: "Continue refining",
  saveForLater: "Save for later",
  reject: "Reject",
  selectOperator: "Select an operator",
  selectMultipleOperators: "Select multiple operators",
  reviewSharing: "Review sharing",
  explicitSend: "Send explicitly",
  openOfficialSource: "Open the official source",
  dismiss: "Dismiss",
  stop: "Stop",
};

const claimLabels: Record<ProhibitedClaim, string> = {
  automaticLead: "Displaying this does not create a lead",
  inferredPartnership: "Do not infer a partnership",
  inventedAvailability: "Do not invent availability",
  inventedPriceUnit: "Do not invent a price or price unit",
  combinedPrivatePackage: "Do not create a combined private package",
  walkingSuitability: "Do not conclude walking suitability",
  automaticItineraryModification: "Do not modify the itinerary automatically",
  automaticOperatorSend: "Do not send to an operator automatically",
};

const reviewStatusLabels: Record<ReviewStatus, string> = {
  sourceCaptured: "Source captured",
  paraUstedReviewed: "Reviewed by Para Usted",
  operatorConfirmed: "Operator-confirmed snapshot",
  requiresConfirmation: "Requires confirmation",
};

const eyebrowClassName = "text-xs font-semibold uppercase tracking-[0.16em]";
const metadataLabelClassName = "text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]";
const metadataValueClassName = "mt-1 font-semibold leading-6 text-[var(--brand-green-900)]";
const statusClassName = "inline-flex min-h-11 items-center rounded-full border border-[var(--brand-gold-500)]/40 bg-[#fff9ef] px-3 py-2 text-center text-xs font-semibold leading-5 text-[var(--brand-green-900)]";
const sectionTitleClassName = "font-display text-xl font-semibold text-[var(--brand-green-900)]";

function scenarioStatus(fixture: TisScenarioFixture): string {
  if (fixture.futureOnly) return "Future production capability";
  if (!fixture.stagedForTis && fixture.realToday) return "Existing working foundation";
  if (fixture.expectedRecommendationType === "publicOperatorPossibility") {
    return "Requires approved source snapshot";
  }
  return "Controlled TIS demonstration";
}

function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

function factValue(value: string | boolean | readonly string[]): string {
  return Array.isArray(value) ? value.join(", ") : String(value);
}

function snapshotFor(id: string): TrustedSourceSnapshot | undefined {
  return TIS_TRUSTED_SOURCE_SNAPSHOTS.find((snapshot) => snapshot.id === id);
}

function contextRows(fixture: TisScenarioFixture): Array<[string, string]> {
  const context = fixture.recognisedContext;
  const rows: Array<[string, string]> = [["Destinations", context.destinations.join(", ")]];

  if (context.interests?.length) rows.push(["Interests", context.interests.join(" and ")]);
  if (context.partySize) rows.push(["Party", `${context.partySize} travellers`]);
  if (context.dateText) rows.push(["Date wording", context.dateText]);
  if (context.formatPreference) rows.push(["Format preference", "Private experience"]);
  if (context.pacePreference) rows.push(["Pace preference", "Relaxed pace"]);
  if (context.walkingPreference) rows.push(["Walking preference", "Less walking requested"]);

  return rows;
}

function ScenarioSummary({ fixture }: { fixture: TisScenarioFixture }) {
  return (
    <dl className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
      <div>
        <dt className={metadataLabelClassName}>Journey stage</dt>
        <dd className={metadataValueClassName}>{journeyStageLabels[fixture.journeyStage]}</dd>
      </div>
      <div>
        <dt className={metadataLabelClassName}>Expected outcome</dt>
        <dd className={metadataValueClassName}>{outcomeLabels[fixture.expectedOutcome]}</dd>
      </div>
      <div>
        <dt className={metadataLabelClassName}>Recommendation type</dt>
        <dd className={metadataValueClassName}>{recommendationLabels[fixture.expectedRecommendationType]}</dd>
      </div>
      {fixture.oneMaterialQuestion ? (
        <div className="sm:col-span-2">
          <dt className={metadataLabelClassName}>Material question</dt>
          <dd className={metadataValueClassName}>{fixture.oneMaterialQuestion}</dd>
        </div>
      ) : null}
      <div>
        <dt className={metadataLabelClassName}>Real today</dt>
        <dd className={metadataValueClassName}>{yesNo(fixture.realToday)}</dd>
      </div>
      <div>
        <dt className={metadataLabelClassName}>Staged for TIS</dt>
        <dd className={metadataValueClassName}>{yesNo(fixture.stagedForTis)}</dd>
      </div>
      <div>
        <dt className={metadataLabelClassName}>Future production capability</dt>
        <dd className={metadataValueClassName}>{yesNo(fixture.futureOnly)}</dd>
      </div>
      <div>
        <dt className={metadataLabelClassName}>Stop condition</dt>
        <dd className={metadataValueClassName}>When the traveller stops</dd>
      </div>
    </dl>
  );
}

function SourceSnapshotStatus({ fixture }: { fixture: TisScenarioFixture }) {
  return (
    <section aria-labelledby={`source-status-${fixture.id}`}>
      <h3 id={`source-status-${fixture.id}`} className={sectionTitleClassName}>
        Source snapshot status
      </h3>
      <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--text-muted)]">
        {fixture.sourceSnapshotIds.map((snapshotId) => {
          const snapshot = snapshotFor(snapshotId);
          if (!snapshot) return null;

          return (
            <li key={snapshot.id} className="border-l-2 border-[var(--brand-gold-500)] pl-3">
              <p className="font-semibold text-[var(--brand-green-900)]">
                {snapshot.publisherDisplayName} · {reviewStatusLabels[snapshot.reviewStatus]}
              </p>
              <p>{snapshot.validityNote}</p>
              {snapshot.facts
                .filter((fact) => fact.requiresConfirmation)
                .map((fact) => (
                  <p key={fact.key} className="font-medium text-[var(--brand-green-900)]">
                    {factValue(fact.value)}
                  </p>
                ))}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SelectedScenario({ fixture }: { fixture: TisScenarioFixture }) {
  return (
    <article
      className="mt-8 rounded-[1.5rem] border border-[var(--brand-green-700)]/25 bg-[var(--surface-card)] p-5 shadow-[0_18px_50px_rgba(17,17,17,0.08)] sm:p-7"
      aria-labelledby={`selected-${fixture.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`${eyebrowClassName} text-[var(--brand-green-700)]`}>Selected rehearsal scenario</p>
          <h2 id={`selected-${fixture.id}`} className="font-display mt-2 text-3xl font-semibold text-[var(--brand-green-900)]">
            {fixture.displayName}
          </h2>
        </div>
        <span className={statusClassName} role="status">
          {scenarioStatus(fixture)}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className={sectionTitleClassName}>Demonstration message</h3>
          <blockquote className="mt-3 border-l-4 border-[var(--brand-gold-500)] bg-[#fbf2e8] px-4 py-3 text-base leading-7 text-[var(--brand-green-900)]">
            {fixture.travellerMessage}
          </blockquote>

          <h3 className={`${sectionTitleClassName} mt-7`}>Recognised context</h3>
          <dl className="mt-3 space-y-2 text-sm">
            {contextRows(fixture).map(([label, value]) => (
              <div key={label} className="flex gap-4 border-b border-[var(--border-soft)] pb-2">
                <dt className="w-32 shrink-0 text-[var(--text-muted)]">{label}</dt>
                <dd className="font-medium text-[var(--brand-green-900)]">{value}</dd>
              </div>
            ))}
          </dl>

          {fixture.oneMaterialQuestion ? (
            <div className="mt-6 rounded-xl border border-[var(--brand-gold-500)]/40 bg-[#fff9ef] p-4">
              <p className={metadataLabelClassName}>One material question</p>
              <p className="mt-1 font-semibold leading-6 text-[var(--brand-green-900)]">
                {fixture.oneMaterialQuestion}
              </p>
            </div>
          ) : null}
        </section>

        <section>
          <h3 className={sectionTitleClassName}>Expected direction</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className={metadataLabelClassName}>Outcome</dt>
              <dd className={metadataValueClassName}>{outcomeLabels[fixture.expectedOutcome]}</dd>
            </div>
            <div>
              <dt className={metadataLabelClassName}>Recommendation</dt>
              <dd className={metadataValueClassName}>{recommendationLabels[fixture.expectedRecommendationType]}</dd>
            </div>
          </dl>

          <h3 className={`${sectionTitleClassName} mt-7`}>Allowed traveller actions</h3>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--brand-green-900)] sm:grid-cols-2">
            {fixture.allowedTravellerActions.map((action) => (
              <li key={action} className="rounded-lg bg-[var(--brand-green-100)] px-3 py-2">
                {actionLabels[action]}
              </li>
            ))}
          </ul>

          <h3 className={`${sectionTitleClassName} mt-7`}>Claims this rehearsal must avoid</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-muted)]">
            {fixture.prohibitedClaims.map((claim) => (
              <li key={claim} className="flex gap-2">
                <span aria-hidden="true" className="font-bold text-[var(--brand-green-700)]">
                  ×
                </span>
                <span>{claimLabels[claim]}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <SourceSnapshotStatus fixture={fixture} />

      <p className="mt-7 border-t border-[var(--border-soft)] pt-4 text-xs leading-5 text-[var(--text-muted)]">
        Read-only rehearsal preview. This launcher does not send messages, check availability, show prices, open booking, contact operators, create leads, or change the journey.
      </p>
    </article>
  );
}

export function TisShowcaseLauncher() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<TisScenarioFixture["id"]>(
    TIS_SCENARIO_FIXTURES[0].id,
  );
  const selectedScenario = TIS_SCENARIO_FIXTURES.find(
    (fixture) => fixture.id === selectedScenarioId,
  ) ?? TIS_SCENARIO_FIXTURES[0];

  return (
    <main className="page-shell min-h-screen px-4 py-8 text-[var(--foreground)] sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[1.75rem] bg-[var(--brand-green-900)] px-5 py-8 text-white shadow-[0_24px_70px_rgba(6,80,63,0.2)] sm:px-8">
          <p className={`${eyebrowClassName} text-[var(--brand-gold-100)]`}>Para Usted · internal rehearsal</p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
            TIS Showcase Launcher
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
            Inspect the five controlled scenarios before any playback or production wiring exists. Selecting a scenario changes this launcher only.
          </p>
          <p className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[var(--brand-gold-300)]/40 bg-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-gold-100)]">
            Development only · read-only
          </p>
        </header>

        <section className="mt-8" aria-labelledby="scenario-list-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={`${eyebrowClassName} text-[var(--brand-green-700)]`}>Controlled scenario set</p>
              <h2 id="scenario-list-heading" className="font-display mt-2 text-3xl font-semibold text-[var(--brand-green-900)]">
                Choose a rehearsal scenario
              </h2>
            </div>
            <p className="text-sm text-[var(--text-muted)]">{TIS_SCENARIO_FIXTURES.length} scenarios · no playback</p>
          </div>

          <fieldset className="mt-5 grid gap-4 lg:grid-cols-2">
            <legend className="sr-only">TIS showcase scenarios</legend>
            {TIS_SCENARIO_FIXTURES.map((fixture) => {
              const selected = fixture.id === selectedScenarioId;

              return (
                <div
                  key={fixture.id}
                  role="radio"
                  tabIndex={0}
                  aria-checked={selected}
                  aria-label={fixture.displayName}
                  onClick={() => setSelectedScenarioId(fixture.id)}
                  onKeyDown={(event) => {
                    if (event.key === " " || event.key === "Enter") {
                      event.preventDefault();
                      setSelectedScenarioId(fixture.id);
                    }
                  }}
                  className={`block cursor-pointer rounded-[1.35rem] border bg-[var(--surface-card)] p-5 shadow-[0_12px_36px_rgba(17,17,17,0.06)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--brand-gold-500)] ${selected ? "border-[var(--brand-green-700)] ring-2 ring-[var(--brand-green-700)]/20" : "border-[var(--border-soft)] hover:border-[var(--brand-green-700)]/45"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-display text-2xl font-semibold text-[var(--brand-green-900)]">
                      {fixture.displayName}
                    </span>
                    <span className={`${statusClassName} shrink-0`}>{scenarioStatus(fixture)}</span>
                  </div>
                  <p className="mt-4 border-l-2 border-[var(--brand-gold-500)] pl-3 text-sm leading-6 text-[var(--text-muted)]">
                    {fixture.travellerMessage}
                  </p>
                  <ScenarioSummary fixture={fixture} />
                  <span className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-[var(--brand-green-700)]/30 px-3 text-sm font-semibold text-[var(--brand-green-900)]">
                    {selected ? "Selected scenario" : "Select scenario"}
                  </span>
                </div>
              );
            })}
          </fieldset>
        </section>

        <SelectedScenario fixture={selectedScenario} />
      </div>
    </main>
  );
}