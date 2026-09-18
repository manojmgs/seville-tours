"use client";

import { useState } from "react";
import type { Dispatch } from "react";
import {
  allOpportunities,
  availableCategories,
  formatCheckedDate,
  matchesTraveller,
  opportunitiesFor,
  provenanceFor,
  TIS_OPPORTUNITY_KIND_LABEL,
  type TisOpportunity,
  type TisOpportunityKind,
} from "@/lib/marco/showcase/tis-demo-ecosystem";
import type { TisConversationAction } from "@/lib/marco/showcase/tis-conversation-state";

type TisOpportunityBrowserProps = {
  interests: readonly string[];
  party: string | null;
  savedOpportunityIds: readonly string[];
  dispatch: Dispatch<TisConversationAction>;
};

export function TisOpportunityBrowser({
  interests,
  party,
  savedOpportunityIds,
  dispatch,
}: TisOpportunityBrowserProps) {
  const [category, setCategory] = useState<TisOpportunityKind | null>(null);
  const [cursor, setCursor] = useState(0);
  const [showEverything, setShowEverything] = useState(false);

  const categories = availableCategories(interests, party, showEverything);
  const matches = showEverything
    ? allOpportunities(category)
    : opportunitiesFor(interests, party, category);
  if (matches.length === 0) return null;

  const opportunity = matches[cursor % matches.length];
  const isSaved = savedOpportunityIds.includes(opportunity.id);
  const matchedToTraveller = matchesTraveller(opportunity, interests, party);

  const chooseCategory = (next: TisOpportunityKind | null) => {
    setCategory(next);
    setCursor(0);
  };

  const toggleEverything = () => {
    setShowEverything((current) => !current);
    setCategory(null);
    setCursor(0);
  };

  return (
    <div className="rounded-xl border border-[var(--brand-green-700)]/30 bg-[#f6faf7] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-green-700)]">
          {showEverything ? "Everything on file" : "Matched to what you told me"}
        </p>
        <button
          type="button"
          onClick={toggleEverything}
          className="min-h-11 rounded-full px-2 text-sm font-semibold text-[var(--brand-green-900)] underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          {showEverything ? "Show only what matches me" : "See everything"}
        </button>
      </div>

      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        <CategoryChip label="Everything" selected={category === null} onSelect={() => chooseCategory(null)} />
        {categories.map((kind) => (
          <CategoryChip
            key={kind}
            label={TIS_OPPORTUNITY_KIND_LABEL[kind]}
            selected={category === kind}
            onSelect={() => chooseCategory(kind)}
          />
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-semibold uppercase text-[var(--brand-green-700)]">
            {TIS_OPPORTUNITY_KIND_LABEL[opportunity.kind]}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {(cursor % matches.length) + 1} of {matches.length}
          </p>
        </div>
        <p className="mt-1 font-display text-lg font-semibold text-[var(--brand-green-900)]">
          {opportunity.title}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{opportunity.provider}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--brand-green-900)]">{opportunity.detail}</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {opportunity.when} · {opportunity.priceHint}
        </p>
        {matchedToTraveller ? (
          <p className="mt-3 rounded-[10px] bg-white px-3 py-2 text-sm leading-6 text-[var(--brand-green-900)]">
            <span className="font-semibold">Why this appeared:</span> {opportunity.reason}
          </p>
        ) : (
          <p className="mt-3 rounded-[10px] bg-white px-3 py-2 text-sm leading-6 text-[var(--text-muted)]">
            This does not match anything you told me. You asked to see everything, so here it is.
          </p>
        )}
        <ProvenanceBlock opportunity={opportunity} />
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          aria-pressed={isSaved}
          onClick={() =>
            dispatch({ type: "saveOpportunity", opportunityId: opportunity.id, title: opportunity.title })
          }
          className="min-h-11 rounded-[10px] bg-[var(--brand-green-900)] px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold-500)]"
        >
          {isSaved ? "Added to Trip Plan" : "Add to Trip Plan"}
        </button>
        {matches.length > 1 ? (
          <button
            type="button"
            onClick={() => setCursor((current) => current + 1)}
            className="min-h-11 rounded-[10px] border border-[var(--brand-green-700)]/40 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
          >
            Next recommendation
          </button>
        ) : null}
      </div>

      <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
        {provenanceFor(opportunity).basis === "verified"
          ? "Read from the venue's own programme. We hold no ticket and check no availability."
          : "Sample data for this demonstration. Nothing here is arranged, priced or combined by us."}
      </p>
    </div>
  );
}

function ProvenanceBlock({ opportunity }: { opportunity: TisOpportunity }) {
  const provenance = provenanceFor(opportunity);
  const isVerified = provenance.basis === "verified";

  return (
    <div
      className={`mt-3 rounded-[10px] border px-3 py-2 text-xs leading-5 ${
        isVerified
          ? "border-[var(--brand-green-700)]/30 bg-white text-[var(--brand-green-900)]"
          : "border-[var(--border-soft)] bg-[#faf8f5] text-[var(--text-muted)]"
      }`}
    >
      {provenance.venue ? (
        <p>
          <span className="font-semibold">Venue:</span> {provenance.venue}
        </p>
      ) : null}
      <p className={provenance.venue ? "mt-1" : undefined}>
        <span className="font-semibold">Verified against:</span> {provenance.verificationSource}
      </p>
      <p className="mt-1">
        <span className="font-semibold">Last checked:</span> {formatCheckedDate(provenance.lastVerified)}
      </p>
      <p className="mt-1">
        <span className="font-semibold">Still to confirm:</span> {provenance.stillToConfirm.join(" · ")}
      </p>
      {isVerified ? (
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {provenance.verificationUrl ? (
            <a href={provenance.verificationUrl} target="_blank" rel="noreferrer" className="font-semibold underline">
              View official details
            </a>
          ) : null}
          {provenance.ticketUrl ? (
            <a href={provenance.ticketUrl} target="_blank" rel="noreferrer" className="font-semibold underline">
              Official tickets ({provenance.ticketSeller})
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

function CategoryChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)] ${
        selected
          ? "border-[var(--brand-green-900)] bg-[var(--brand-green-900)] text-white"
          : "border-[var(--brand-green-700)]/35 bg-white text-[var(--brand-green-900)]"
      }`}
    >
      {label}
    </button>
  );
}
