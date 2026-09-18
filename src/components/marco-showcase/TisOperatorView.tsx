"use client";

import { useState } from "react";
import type { MarcoTour } from "@/components/marco-chat/types";
import { attributionFor } from "@/lib/marco/showcase/tis-partner-catalogue";
import { TIS_OPPORTUNITY_KIND_LABEL, type TisOpportunity } from "@/lib/marco/showcase/tis-demo-ecosystem";
import {
  TIS_OPERATOR_DECIDES,
  type TisEnquiry,
  type TisJourneyBriefDisplay,
} from "@/lib/marco/showcase/tis-conversation-state";

type TisOperatorViewProps = {
  operatorName: string;
  otherOperators: readonly string[];
  brief: TisJourneyBriefDisplay;
  savedTours: readonly MarcoTour[];
  savedOpportunities: readonly TisOpportunity[];
  arrangementRequests: readonly string[];
  hasPrivateRequest: boolean;
  enquiry: TisEnquiry | null;
};

export function TisOperatorView({
  operatorName,
  otherOperators,
  brief,
  savedTours,
  savedOpportunities,
  arrangementRequests,
  hasPrivateRequest,
  enquiry,
}: TisOperatorViewProps) {
  const [passedTo, setPassedTo] = useState<string | null>(null);

  return (
    <div className="space-y-5 bg-[#faf8f5] p-4 sm:p-5">
      <section className="rounded-[1.25rem] border border-[var(--brand-green-700)]/30 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-green-700)]">
          {operatorName} · new enquiry
        </p>
        <h2 className="font-display mt-2 text-2xl font-semibold text-[var(--brand-green-900)]">
          {enquiry ? enquiry.contact.name : "A traveller"} is planning a trip
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          {enquiry
            ? `Reply to ${enquiry.contact.email}${enquiry.contact.phone ? ` or ${enquiry.contact.phone}` : ""}.`
            : "No contact details yet — the traveller has not sent this."}
        </p>
      </section>

      <Block title="What you already know" tone="known">
        <Row label="Travellers" value={brief.travellers} />
        <Row label="Dates" value={brief.dateStatus} />
        {brief.preferences.length > 0 ? <Row label="Preferences" value={brief.preferences.join(" · ")} /> : null}
        {brief.interests.length > 0 ? <Row label="Interests" value={brief.interests.join(", ")} /> : null}
        {brief.ownWords.length > 0 ? (
          <div className="mt-3">
            <p className="text-sm font-semibold text-[var(--text-muted)]">In their own words</p>
            {brief.ownWords.map((words) => (
              <p
                key={words}
                className="mt-1 border-l-2 border-[var(--brand-gold-500)] pl-3 text-sm italic leading-6 text-[var(--brand-green-900)]"
              >
                &quot;{words}&quot;
              </p>
            ))}
          </div>
        ) : null}
        <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
          You did not have to ask for any of this.
        </p>
      </Block>

      {savedTours.length > 0 || savedOpportunities.length > 0 ? (
        <Block title="What they already engaged with" tone="known">
          <ul className="space-y-1 text-sm text-[var(--brand-green-900)]">
            {savedTours.map((tour) => (
              <li key={tour.id}>
                {tour.name} · {attributionFor(tour.id).operator} · {tour.price} {attributionFor(tour.id).priceBasis}
              </li>
            ))}
            {savedOpportunities.map((entry) => (
              <li key={entry.id}>
                {TIS_OPPORTUNITY_KIND_LABEL[entry.kind]} · {entry.title}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
            Saved by the traveller. Nothing is booked and no seat is held.
          </p>
        </Block>
      ) : null}

      {brief.operatorAsks.length > 0 ? (
        <Block title="Wants your advice on" tone="ask">
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--brand-green-900)]">
            {brief.operatorAsks.map((ask) => (
              <li key={ask}>{ask}</li>
            ))}
          </ul>
        </Block>
      ) : null}

      {hasPrivateRequest || arrangementRequests.length > 0 ? (
        <Block title="Asked you to arrange" tone="ask">
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--brand-green-900)]">
            {hasPrivateRequest ? <li>A private Seville experience</li> : null}
            {arrangementRequests.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
            We did not source, price or arrange any of these. They are yours to answer, or to decline.
          </p>
        </Block>
      ) : null}

      <Block title="Still yours to decide" tone="decide">
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--brand-green-900)]">
          {TIS_OPERATOR_DECIDES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#6b531d]">
          Nothing above was decided for you.
        </p>
      </Block>

      <section className="rounded-[1.25rem] border border-[var(--border-soft)] bg-white p-5">
        <h3 className="font-display text-xl font-semibold text-[var(--brand-green-900)]">Not for you?</h3>
        {passedTo ? (
          <div className="mt-3 rounded-[10px] border border-[var(--brand-green-700)]/25 bg-[#f6faf7] p-4">
            <p className="text-sm font-semibold text-[var(--brand-green-900)]">Passed to {passedTo}.</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
              The traveller&apos;s context went with it. Nobody re-typed anything, and the traveller was told who is
              answering.
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6b531d]">
              Demonstration only — no operator was contacted.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Wrong region, no availability, or fully booked? Pass it on instead of losing the traveller.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {otherOperators.map((operator) => (
                <button
                  key={operator}
                  type="button"
                  onClick={() => setPassedTo(operator)}
                  className="min-h-11 rounded-[10px] border border-[var(--brand-green-700)]/40 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
                >
                  Pass to {operator}
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Block({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "known" | "ask" | "decide";
  children: React.ReactNode;
}) {
  const border =
    tone === "decide"
      ? "border-[var(--brand-gold-500)]/50 bg-[#fff9ef]"
      : tone === "ask"
        ? "border-[var(--brand-green-700)]/25 bg-white"
        : "border-[var(--border-soft)] bg-white";

  return (
    <section className={`rounded-[1.25rem] border p-5 ${border}`}>
      <h3 className="font-display text-xl font-semibold text-[var(--brand-green-900)]">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/5 py-2 last:border-b-0">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--brand-green-900)]">{value}</span>
    </div>
  );
}
