"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { Dispatch, FormEvent } from "react";
import { RecommendationReceipt } from "@/components/marco-chat/RecommendationReceipt";
import type { MarcoTour, RecommendationInput, RecommendationReasonCode, RecommendationResult } from "@/components/marco-chat/types";
import { TisTripPlan } from "@/components/marco-showcase/TisTripPlan";
import { TisOpportunityBrowser } from "@/components/marco-showcase/TisOpportunityBrowser";
import { TisEnquiryPanel } from "@/components/marco-showcase/TisEnquiryPanel";
import { TisArrangementRequests } from "@/components/marco-showcase/TisArrangementRequests";
import { TisOperatorView } from "@/components/marco-showcase/TisOperatorView";
import { attributionFor } from "@/lib/marco/showcase/tis-partner-catalogue";
import {
  opportunityById,
  TIS_OPPORTUNITY_KIND_LABEL,
  type TisOpportunity,
} from "@/lib/marco/showcase/tis-demo-ecosystem";
import {
  buildJourneyBrief,
  choiceLabel,
  createInitialTisConversationState,
  experienceItemId,
  nextQuestion,
  operatorAskLabel,
  selectRecommendations,
  sharesDestinationTerm,
  transitionTisConversation,
  wantsOperatorAttention,
  TIS_OPERATOR_ASK_OPTIONS,
  TIS_OPERATOR_DECIDES,
  TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID,
  type TisConversationAction,
  type TisJourneyBriefDisplay,
  type TisPhase,
  type TisTurn,
} from "@/lib/marco/showcase/tis-conversation-state";

type TisTravellerExperienceProps = {
  tours: readonly MarcoTour[];
  locale: string;
  /** Hosted ParaUsted merchant page. Gift cards are issued there, never here. */
  giftUrl: string;
};

const MAX_OWN_WORDS = 280;

/** The receipt must reflect what we actually used, so both fields are derived. */
function buildReceipt(
  tour: MarcoTour,
  interests: readonly string[],
  party: string | null,
): RecommendationResult {
  const reasonCode: RecommendationReasonCode = tour.tags.includes("day trip")
    ? "daytrip-interest"
    : interests.includes("food") && tour.tags.includes("food")
      ? "food-interest"
      : interests.includes("history") && tour.tags.includes("history")
        ? "history-interest"
        : party === "family"
          ? "family-context"
          : "general-introduction";

  const usedInputs: RecommendationInput[] = [];
  if (interests.length > 0) usedInputs.push("interest");
  if (party) usedInputs.push("group");

  return { tourIds: [tour.id], reasonCode, usedInputs };
}

function Bubble({ turn }: { turn: TisTurn }) {
  const isTraveller = turn.speaker === "traveller";
  return (
    <div className={`flex ${isTraveller ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isTraveller
            ? "max-w-[88%] rounded-[18px] rounded-tr-[4px] bg-[var(--brand-green-900)] px-4 py-3 text-sm leading-6 text-white"
            : "max-w-[88%] rounded-[18px] rounded-tl-[4px] bg-white px-4 py-3 text-sm leading-6 text-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
        }
      >
        {turn.verbatim ? <span className="mb-1 block text-xs font-semibold text-white/70">In your own words</span> : null}
        {turn.text}
      </div>
    </div>
  );
}

function JourneyBriefPanel({ brief }: { brief: TisJourneyBriefDisplay }) {
  return (
    <section
      className="rounded-[1.25rem] border border-[var(--brand-green-700)]/25 bg-[#f8f5f0] p-5"
      aria-labelledby="tis-journey-brief-heading"
    >
      <p className="text-xs font-semibold uppercase text-[var(--brand-green-700)]">Organised context</p>
      <h2 id="tis-journey-brief-heading" className="font-display mt-2 text-2xl font-semibold text-[var(--brand-green-900)]">
        Journey Brief
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Built only from what you told me.</p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-start justify-between gap-4 border-t border-black/10 pt-3">
          <dt className="text-[var(--text-muted)]">Destination</dt>
          <dd className="text-right font-semibold text-[var(--brand-green-900)]">{brief.destination}</dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-black/10 pt-3">
          <dt className="text-[var(--text-muted)]">Travellers</dt>
          <dd className="text-right font-semibold text-[var(--brand-green-900)]">{brief.travellers}</dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-black/10 pt-3">
          <dt className="text-[var(--text-muted)]">Dates</dt>
          <dd className="text-right font-semibold text-[var(--brand-green-900)]">{brief.dateStatus}</dd>
        </div>
        {brief.interests.length > 0 ? (
          <div className="border-t border-black/10 pt-3">
            <dt className="text-[var(--text-muted)]">Interests</dt>
            <dd className="mt-1 font-semibold text-[var(--brand-green-900)]">
              <ul className="space-y-1 text-right">
                {brief.interests.map((interest) => (
                  <li key={interest}>{interest}</li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        {brief.preferences.length > 0 ? (
          <div className="border-t border-black/10 pt-3">
            <dt className="text-[var(--text-muted)]">Preferences</dt>
            <dd className="mt-1 font-semibold text-[var(--brand-green-900)]">
              <ul className="space-y-1 text-right">
                {brief.preferences.map((preference) => (
                  <li key={preference}>{preference}</li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        {brief.ownWords.length > 0 ? (
          <div className="border-t border-black/10 pt-3">
            <dt className="text-[var(--text-muted)]">In your own words</dt>
            <dd className="mt-1 space-y-2">
              {brief.ownWords.map((words) => (
                <p key={words} className="border-l-2 border-[var(--brand-gold-500)] pl-3 italic leading-6 text-[var(--brand-green-900)]">
                  &quot;{words}&quot;
                </p>
              ))}
            </dd>
          </div>
        ) : null}
        {brief.operatorAsks.length > 0 ? (
          <div className="border-t border-black/10 pt-3">
            <dt className="text-[var(--text-muted)]">Advice you asked for</dt>
            <dd className="mt-1">
              <ul className="space-y-1 text-right font-semibold text-[var(--brand-green-900)]">
                {brief.operatorAsks.map((ask) => (
                  <li key={ask}>{ask}</li>
                ))}
              </ul>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                Passed on as questions. We arrange none of them.
              </p>
            </dd>
          </div>
        ) : null}
        {brief.openQuestions.length > 0 ? (
          <div className="border-t border-black/10 pt-3">
            <dt className="text-[var(--text-muted)]">Questions we did not answer</dt>
            <dd className="mt-1 space-y-2">
              {brief.openQuestions.map((question) => (
                <p key={question} className="border-l-2 border-[var(--brand-green-700)] pl-3 italic leading-6 text-[var(--brand-green-900)]">
                  &quot;{question}&quot;
                </p>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

/** The same destination from two operators, so the traveller can compare like for like. */
function findSharedOffer(shown: readonly MarcoTour[]): readonly [MarcoTour, MarcoTour] | null {
  for (let i = 0; i < shown.length; i += 1) {
    for (let j = i + 1; j < shown.length; j += 1) {
      const [a, b] = [shown[i], shown[j]];
      const differentOperators = attributionFor(a.id).operator !== attributionFor(b.id).operator;
      if (differentOperators && sharesDestinationTerm(a.matchTerms, b.matchTerms)) return [a, b];
    }
  }
  return null;
}

function RecommendationCard({  tour,
  receipt,
  locale,
  dispatch,
  isSaved,
}: {
  tour: MarcoTour;
  receipt: RecommendationResult;
  locale: string;
  dispatch: Dispatch<TisConversationAction>;
  isSaved: boolean;
}) {
  const attribution = attributionFor(tour.id);
  const [datesOpen, setDatesOpen] = useState(false);
  // Bookable tours carry the operator's own booking flow on `url`; others fall back to their page.
  const calendarUrl = tour.bookable ? tour.url : (tour.bookDirectUrl ?? tour.url);

  return (
    <section
      className="rounded-[1.25rem] border border-[var(--brand-gold-500)]/40 bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.08)]"
      aria-labelledby={`tis-recommendation-${tour.id}`}
    >
      <p className="text-xs font-semibold uppercase text-[var(--brand-green-700)]">
        {attribution.operator} · operator-published
      </p>
      <h2 id={`tis-recommendation-${tour.id}`} className="font-display mt-2 text-2xl font-semibold text-[var(--brand-green-900)]">
        {tour.name}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{tour.desc}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--text-muted)]">
        <span>{tour.duration}</span>
        <span className="font-semibold text-[var(--brand-green-900)]">
          {tour.price} <span className="font-normal text-[var(--text-muted)]">{attribution.priceBasis}</span>
        </span>
      </div>
      <RecommendationReceipt
        tour={tour}
        recommendation={receipt}
        operatorName={attribution.operator}
        primaryColor="#06503f"
        accentColor="#b8903a"
        locale={locale}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={isSaved}
          onClick={() => dispatch({ type: "addSavedPossibility", tourId: tour.id })}
          className="flex min-h-11 items-center justify-center rounded-[10px] bg-[var(--brand-green-900)] px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold-500)]"
        >
          {isSaved ? "Added to Trip Plan" : "Add to Trip Plan"}
        </button>
        <button
          type="button"
          aria-expanded={datesOpen}
          aria-controls={`tis-dates-${tour.id}`}
          onClick={() => setDatesOpen((open) => !open)}
          className="flex min-h-11 items-center justify-center rounded-[10px] border border-[var(--brand-green-700)]/40 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          {datesOpen ? "Hide dates" : "Check dates"}
        </button>
      </div>
      {datesOpen ? (
        <div id={`tis-dates-${tour.id}`} className="mt-4 rounded-[10px] border border-[var(--border-soft)] bg-[#faf8f5] p-3">
          <p className="text-xs font-semibold uppercase text-[var(--brand-green-700)]">
            {attribution.operator}&apos;s own booking system
          </p>
          <iframe
            src={calendarUrl}
            title={`Availability for ${tour.name}, published by ${attribution.operator}`}
            className="mt-2 h-80 w-full rounded-[8px] border border-[var(--border-soft)] bg-white"
            loading="lazy"
          />
          <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
            This is {attribution.operator}&apos;s system, shown inside the conversation. We do not hold a seat or
            confirm anything here.{" "}
            <a href={calendarUrl} target="_blank" rel="noreferrer" className="underline">
              Open in a new tab
            </a>
          </p>
        </div>
      ) : null}
      {isSaved ? (
        <p className="mt-2 text-xs font-semibold text-[var(--brand-green-900)]">Added as a possibility. Nothing has been booked.</p>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
        Availability and the final price are confirmed by {attribution.operator}, not here.
      </p>
      <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
        Source:{" "}
        <a href={attribution.sourceUrl} target="_blank" rel="noreferrer" className="underline">
          {new URL(attribution.sourceUrl).hostname}
        </a>{" "}
        · read on {attribution.capturedOn}
        {attribution.permission === "written-permission" ? " · shown with the operator's permission" : null}
      </p>
    </section>
  );
}

function GiftCard({ giftUrl }: { giftUrl: string }) {
  return (
    <section
      className="rounded-[1.25rem] border border-[var(--brand-gold-500)]/40 bg-white p-5"
      aria-labelledby="tis-gift-heading"
    >
      <p className="text-xs font-semibold uppercase text-[#6b531d]">Taking something home</p>
      <h2 id="tis-gift-heading" className="font-display mt-2 text-xl font-semibold text-[var(--brand-green-900)]">
        Gift cards and keepsakes
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
        Seville Tours Co. issues gift cards on ParaUsted. Buying, payment and delivery all happen there — nothing is
        purchased on this page.
      </p>
      <a
        href={giftUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex min-h-11 w-fit items-center justify-center rounded-[10px] border border-[var(--brand-green-700)]/40 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
      >
        See gift cards on ParaUsted
      </a>
    </section>
  );
}

function HandoverPanel({
  savedTours,
  savedOpportunities,
  brief,
  hasRequest,
  arrangementRequests,
  operatorAsks,
  enquiryPrepared,
  dispatch,
}: {
  savedTours: readonly MarcoTour[];
  savedOpportunities: readonly TisOpportunity[];
  brief: TisJourneyBriefDisplay;
  hasRequest: boolean;
  arrangementRequests: readonly string[];
  operatorAsks: readonly string[];
  enquiryPrepared: boolean;
  dispatch: Dispatch<TisConversationAction>;
}) {
  return (
    <section
      id="tis-handover"
      className="rounded-[1.25rem] border-2 border-dashed border-[var(--brand-gold-500)]/65 bg-[#fff9ef] p-5 sm:p-6"
      aria-labelledby="tis-handover-heading"
    >
      <p className="text-xs font-bold uppercase text-[#6b531d]">Ready for the operator</p>
      <h2 id="tis-handover-heading" className="font-display mt-2 text-2xl font-semibold text-[var(--brand-green-900)]">
        What an operator would receive
      </h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#6b531d]">
        {enquiryPrepared
          ? "Prepared and addressed. In this demonstration nothing was transmitted."
          : "Nothing has been sent. No operator has seen this yet."}
      </p>

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-[var(--text-muted)]">Travellers</dt>
          <dd className="mt-1 font-semibold text-[var(--brand-green-900)]">{brief.travellers}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--text-muted)]">Dates</dt>
          <dd className="mt-1 font-semibold text-[var(--brand-green-900)]">{brief.dateStatus}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--text-muted)]">Experiences you saved</dt>
          <dd className="mt-1 text-[var(--brand-green-900)]">
            {savedTours.length > 0 ? (
              <ul className="space-y-1">
                {savedTours.map((tour) => (
                  <li key={tour.id}>
                    {tour.name} · {attributionFor(tour.id).operator} · {tour.price}{" "}
                    {attributionFor(tour.id).priceBasis} · nothing booked
                  </li>
                ))}
              </ul>
            ) : (
              "None saved"
            )}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--text-muted)]">Asked you to arrange</dt>
          <dd className="mt-1 text-[var(--brand-green-900)]">
            {hasRequest || arrangementRequests.length > 0 ? (
              <ul className="space-y-1">
                {hasRequest ? <li>A private Seville experience · not sent</li> : null}
                {arrangementRequests.map((label) => (
                  <li key={label}>{label} · not listed by us · operator to advise</li>
                ))}
              </ul>
            ) : (
              "Nothing requested"
            )}
          </dd>
        </div>
        {savedOpportunities.length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="font-semibold text-[var(--text-muted)]">Also saved around the journey</dt>
            <dd className="mt-1 text-[var(--brand-green-900)]">
              <ul className="space-y-1">
                {savedOpportunities.map((opportunity) => (
                  <li key={opportunity.id}>
                    {TIS_OPPORTUNITY_KIND_LABEL[opportunity.kind]} · {opportunity.title} · {opportunity.provider} ·
                    nothing booked
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                Sample data for this demonstration. We do not arrange, price or combine these.
              </p>
            </dd>
          </div>
        ) : null}
        {brief.interests.length > 0 ? (
          <div>
            <dt className="font-semibold text-[var(--text-muted)]">Interests</dt>
            <dd className="mt-1 text-[var(--brand-green-900)]">{brief.interests.join(", ")}</dd>
          </div>
        ) : null}
        {brief.ownWords.length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="font-semibold text-[var(--text-muted)]">In your own words</dt>
            <dd className="mt-1 space-y-2">
              {brief.ownWords.map((words) => (
                <p key={words} className="border-l-2 border-[var(--brand-gold-500)] pl-3 italic leading-6 text-[var(--brand-green-900)]">
                  &quot;{words}&quot;
                </p>
              ))}
            </dd>
          </div>
        ) : null}
        {brief.openQuestions.length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="font-semibold text-[var(--text-muted)]">Questions we did not answer</dt>
            <dd className="mt-1 space-y-2">
              {brief.openQuestions.map((question) => (
                <p key={question} className="border-l-2 border-[var(--brand-green-700)] pl-3 italic leading-6 text-[var(--brand-green-900)]">
                  &quot;{question}&quot;
                </p>
              ))}
              <p className="text-xs leading-5 text-[var(--text-muted)]">
                We did not have verified information, so we did not guess. These go to the operator as asked.
              </p>
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[10px] border border-[var(--border-soft)] bg-white p-4">
          <p className="text-sm font-semibold text-[var(--brand-green-900)]">Still for the operator to decide</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
            {TIS_OPERATOR_DECIDES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[10px] border border-[var(--border-soft)] bg-white p-4">
          <p className="text-sm font-semibold text-[var(--brand-green-900)]">Wants your advice on</p>
          {operatorAsks.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--brand-green-900)]">
              {operatorAsks.map((ask) => (
                <li key={ask}>{operatorAskLabel(ask)}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--text-muted)]">None raised.</p>
          )}
          <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
            We pass the question on. We do not arrange, price or combine these into a package — the operator answers
            with what they can offer.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: "backToPlanning" })}
        className="mt-5 min-h-11 rounded-[10px] border border-[var(--brand-green-700)]/35 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
      >
        Keep planning
      </button>
    </section>
  );
}

function PlaybackWindow({
  latestKey,
  statusLine,
  conversation,
  context,
  operatorView,
  showingOperator,
  onToggleOperator,
}: {
  latestKey: string;
  statusLine: string;
  conversation: React.ReactNode;
  context: React.ReactNode;
  operatorView: React.ReactNode;
  showingOperator: boolean;
  onToggleOperator: () => void;
}) {
  const windowRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === windowRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  // Keeps the newest decision in view rather than leaving the presenter to hunt for it.
  useEffect(() => {
    const pane = contextRef.current;
    if (!pane) return;
    const focus = pane.querySelector("[data-latest]");
    if (focus instanceof HTMLElement) {
      pane.scrollTop += focus.getBoundingClientRect().top - pane.getBoundingClientRect().top;
      return;
    }
    pane.scrollTop = 0;
  }, [latestKey]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void windowRef.current?.requestFullscreen?.();
  };

  return (
    <div
      ref={windowRef}
      data-tis-window
      className={`flex flex-col overflow-hidden rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-card)] shadow-[0_12px_34px_rgba(17,17,17,0.08)] ${
        isFullscreen ? "h-screen rounded-none" : "lg:h-[min(40rem,calc(100vh-17rem))] lg:min-h-[26rem]"
      }`}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 bg-[var(--brand-green-900)] px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold-100)] font-display text-base font-semibold text-[var(--brand-green-900)]"
          >
            {showingOperator ? "S" : "M"}
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-semibold leading-tight">
              {showingOperator ? "Seville Tours Co." : "Marco"}
            </p>
            <p className="truncate text-xs text-white/75">
              {showingOperator ? "The operator's side of the same enquiry." : "Local operator knowledge. Not the open web."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleOperator}
            aria-pressed={showingOperator}
            className="min-h-11 rounded-[10px] border border-white/35 px-3 py-2 text-xs font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {showingOperator ? "Back to traveller" : "View as operator"}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            className="hidden min-h-11 rounded-[10px] border border-white/35 px-3 py-2 text-xs font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:block"
          >
            {isFullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>
      </header>

      {showingOperator ? (
        <div className="min-h-0 flex-1 overflow-y-auto">{operatorView}</div>
      ) : (
        <div className="grid min-h-0 min-w-0 flex-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-col border-b border-[var(--border-soft)] lg:border-b-0 lg:border-r">
            {conversation}
          </div>
          <div ref={contextRef} className="min-h-0 min-w-0 space-y-5 bg-[#faf8f5] p-4 sm:p-5 lg:overflow-y-auto">
            {context}
          </div>
        </div>
      )}

      <p className="shrink-0 border-t border-[var(--border-soft)] bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-green-900)]">
        {statusLine}
      </p>
    </div>
  );
}

export function TisTravellerExperience({ tours, locale, giftUrl }: TisTravellerExperienceProps) {
  const [state, dispatch] = useReducer(
    transitionTisConversation,
    undefined,
    createInitialTisConversationState,
  );
  const messagesRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [showingOperator, setShowingOperator] = useState(false);

  const question = nextQuestion(state);
  const brief = buildJourneyBrief(state);
  const selection = selectRecommendations(state.answers.interests, tours, 3, (id) => attributionFor(id).operator);
  const recommended = selection.tourIds
    .map((id) => tours.find((tour) => tour.id === id))
    .filter((tour): tour is MarcoTour => Boolean(tour));
  const savedTours = state.tripPlanItems
    .filter((item) => item.status === "savedPossibility")
    .map((item) => tours.find((tour) => tour.id === item.tourId))
    .filter((tour): tour is MarcoTour => Boolean(tour));
  const savedOpportunities = state.tripPlanItems
    .filter((item) => item.kind === "opportunity" && item.status === "savedPossibility")
    .map((item) => (item.opportunityId ? opportunityById(item.opportunityId) : undefined))
    .filter((entry): entry is TisOpportunity => Boolean(entry));
  const hasRequest = state.tripPlanItems.some((item) => item.id === TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID);
  const arrangementRequests = state.tripPlanItems
    .filter((item) => item.kind === "arrangementRequest")
    .map((item) => item.label ?? "")
    .filter((label) => label.length > 0);
  const operatorsShown = Array.from(new Set(recommended.map((tour) => attributionFor(tour.id).operator)));
  const operatorsInCatalogue = new Set(tours.map((tour) => attributionFor(tour.id).operator)).size;
  const otherOperators = Array.from(
    new Set(tours.map((tour) => attributionFor(tour.id).operator)),
  ).filter((operator) => operator !== "Seville Tours Co.");
  const sharedOffer = findSharedOffer(recommended);
  const savedCount = state.tripPlanItems.filter((item) => item.status === "savedPossibility").length;
  const requestCount = hasRequest ? 1 : 0;
  const enquiryStatus = `${state.savedJourney ? ` · journey saved ${state.savedJourney.reference}` : ""}${
    state.enquiry ? " · enquiry prepared" : " · nothing sent"
  }`;

  const statusLine =
    savedCount === 0 && requestCount === 0
      ? `Trip Plan · nothing saved yet · nothing booked${enquiryStatus}`
      : `Trip Plan · ${savedCount} saved ${savedCount === 1 ? "possibility" : "possibilities"} · ${requestCount} ${
          requestCount === 1 ? "request" : "requests"
        } in preparation · nothing booked${enquiryStatus}`;

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.turns.length]);

  const submitOwnWords = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (draft.trim().length === 0) return;
    dispatch({ type: "addOwnWords", text: draft });
    setDraft("");
  };

  return (
    <main data-tis-playback className="page-shell min-h-screen px-4 pb-24 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase text-[var(--brand-green-700)]">Para Usted · traveller experience</p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-[var(--brand-green-900)] sm:text-5xl">
            A Journey Brief, built by the traveller
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--text-muted)]">
            Answer in your own words or choose an option. Nothing is booked, sent, or checked automatically.
          </p>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch("reset")}
            className="min-h-11 rounded-[10px] border border-[var(--brand-green-700)]/35 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
          >
            Start over
          </button>
          <p className="text-xs text-[var(--text-muted)]">Local playback only. Nothing leaves this browser.</p>
        </div>

        <p id="tis-trip-plan-announcement" aria-live="polite" className="sr-only">
          {state.tripPlanAnnouncement}
        </p>

        <div className="mt-6">
          <PlaybackWindow
            latestKey={`${state.phase}-${state.turns.length}-${state.tripPlanItems.length}`}
            statusLine={statusLine}
            showingOperator={showingOperator}
            onToggleOperator={() => setShowingOperator((current) => !current)}
            operatorView={
              <TisOperatorView
                operatorName="Seville Tours Co."
                otherOperators={otherOperators}
                brief={brief}
                savedTours={savedTours}
                savedOpportunities={savedOpportunities}
                arrangementRequests={arrangementRequests}
                hasPrivateRequest={hasRequest}
                enquiry={state.enquiry}
              />
            }
            conversation={
              <section className="flex min-h-0 flex-1 flex-col" aria-labelledby="tis-conversation-heading">
                <h2 id="tis-conversation-heading" className="sr-only">Your conversation with Marco</h2>

                <div ref={messagesRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#ede8e1] p-4 sm:p-5">
                  {state.turns.map((turn) => (
                    <Bubble key={turn.id} turn={turn} />
                  ))}

                  {question ? (
                    <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
                      <p className="text-sm font-semibold text-[var(--brand-green-900)]">{question.prompt}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {question.choices.map((choice) => {
                          const selected =
                            question.id === "interests" && state.answers.interests.includes(choice.value);
                          return (
                            <button
                              key={choice.value}
                              type="button"
                              aria-pressed={question.multiSelect ? selected : undefined}
                              onClick={() => dispatch({ type: "answer", slot: question.id, value: choice.value })}
                              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)] ${
                                selected
                                  ? "border-[var(--brand-green-900)] bg-[var(--brand-green-900)] text-white"
                                  : "border-[var(--brand-green-700)]/35 bg-white text-[var(--brand-green-900)]"
                              }`}
                            >
                              {choice.label}
                            </button>
                          );
                        })}
                      </div>
                      {question.multiSelect ? (
                        <button
                          type="button"
                          onClick={() => dispatch({ type: "confirmInterests" })}
                          disabled={state.answers.interests.length === 0}
                          className="mt-3 min-h-11 rounded-[10px] bg-[var(--brand-green-900)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold-500)]"
                        >
                          That&apos;s everything
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {state.phase === "deciding" && wantsOperatorAttention(state) && !hasRequest ? (
                    <div className="rounded-xl border border-[var(--brand-gold-500)]/40 bg-[#fff9ef] p-4">
                      <p className="text-sm leading-6 text-[var(--brand-green-900)]">
                        You asked for {choiceLabel("format", state.answers.format ?? "")}. I cannot create that — an
                        operator has to. Shall I prepare a request for one to review?
                      </p>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "preparePrivateRequest" })}
                        className="mt-3 min-h-11 rounded-[10px] bg-[var(--brand-green-900)] px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold-500)]"
                      >
                        Prepare a private request
                      </button>
                    </div>
                  ) : null}

                  {state.phase === "deciding" ? (
                    <TisOpportunityBrowser
                      interests={state.answers.interests}
                      party={state.answers.party}
                      savedOpportunityIds={savedOpportunities.map((entry) => entry.id)}
                      dispatch={dispatch}
                    />
                  ) : null}

                  {state.phase === "deciding" ? (
                    <TisArrangementRequests tripPlanItems={state.tripPlanItems} dispatch={dispatch} />
                  ) : null}

                  {state.phase === "deciding" ? (
                    <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4">
                      <p className="text-sm font-semibold text-[var(--brand-green-900)]">
                        Anything you would like the operator to advise on? Optional.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {TIS_OPERATOR_ASK_OPTIONS.map((option) => {
                          const selected = state.operatorAsks.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => dispatch({ type: "toggleOperatorAsk", value: option.value })}
                              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)] ${
                                selected
                                  ? "border-[var(--brand-green-900)] bg-[var(--brand-green-900)] text-white"
                                  : "border-[var(--brand-green-700)]/35 bg-white text-[var(--brand-green-900)]"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
                        We pass the question on. We do not arrange or price any of these.
                      </p>
                    </div>
                  ) : null}

                  {state.phase === "deciding" ? (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "reviewHandover" })}
                      className="min-h-11 w-full rounded-[10px] border border-[var(--brand-green-700)]/35 bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
                    >
                      See what an operator would receive
                    </button>
                  ) : null}
                </div>

                <form onSubmit={submitOwnWords} className="flex shrink-0 items-center gap-2 border-t border-black/10 bg-white/60 px-4 py-3">
                  <label htmlFor="tis-own-words" className="sr-only">Tell Marco anything else, in your own words</label>
                  <input
                    id="tis-own-words"
                    value={draft}
                    maxLength={MAX_OWN_WORDS}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Or type it in your own words…"
                    className="min-h-11 min-w-0 flex-1 rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
                  />
                  <button
                    type="submit"
                    disabled={draft.trim().length === 0}
                    className="min-h-11 shrink-0 rounded-full bg-[var(--brand-green-900)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold-500)]"
                  >
                    Send
                  </button>
                </form>
              </section>
            }
            context={
              state.phase === "handover" ? (
                <div data-latest>
                  <HandoverPanel
                    savedTours={savedTours}
                    savedOpportunities={savedOpportunities}
                    brief={brief}
                    hasRequest={hasRequest}
                    arrangementRequests={arrangementRequests}
                    operatorAsks={state.operatorAsks}
                    enquiryPrepared={Boolean(state.enquiry)}
                    dispatch={dispatch}
                  />
                  <TisEnquiryPanel
                    savedJourney={state.savedJourney}
                    enquiry={state.enquiry}
                    itineraryTitle="My Seville trip plan"
                    dispatch={dispatch}
                  />
                </div>
              ) : (
                <>
                  <JourneyBriefPanel brief={brief} />
                  {state.phase === "deciding" ? (
                    <div data-latest className="space-y-5">
                      {!selection.matchedOnInterest ? (
                        <p className="text-sm leading-6 text-[var(--text-muted)]">
                          Nothing in these catalogues matches those interests directly. Here is what the operators
                          publish — a private request may suit you better.
                        </p>
                      ) : null}
                      {sharedOffer ? (
                        <p className="rounded-[10px] border border-[var(--brand-gold-500)]/45 bg-[#fff9ef] px-4 py-3 text-sm leading-6 text-[var(--brand-green-900)]">
                          <span className="font-semibold">Both operators publish this trip.</span>{" "}
                          {sharedOffer
                            .map(
                              (tour) =>
                                `${attributionFor(tour.id).operator} — ${tour.price} ${
                                  attributionFor(tour.id).priceBasis
                                }, ${tour.duration}`,
                            )
                            .join(" · ")}
                          . Different formats, different prices. Each confirms and books their own.
                        </p>
                      ) : null}
                      {operatorsShown.length > 1 ? (
                        <p className="rounded-[10px] border border-[var(--brand-green-700)]/25 bg-white px-4 py-3 text-sm leading-6 text-[var(--brand-green-900)]">
                          <span className="font-semibold">{operatorsShown.length} operators</span> publish something
                          that fits: {operatorsShown.join(" and ")}. Each confirms and books their own.
                        </p>
                      ) : null}
                      {operatorsShown.length === 1 && selection.matchedOnInterest && operatorsInCatalogue > 1 ? (
                        <p className="rounded-[10px] border border-[var(--brand-green-700)]/25 bg-white px-4 py-3 text-sm leading-6 text-[var(--brand-green-900)]">
                          Only <span className="font-semibold">{operatorsShown[0]}</span> publishes something that
                          matches that. I am not padding the list with experiences that do not.
                        </p>
                      ) : null}
                      {recommended.map((tour) => (
                        <RecommendationCard
                          key={tour.id}
                          tour={tour}
                          receipt={buildReceipt(tour, state.answers.interests, state.answers.party)}
                          locale={locale}
                          dispatch={dispatch}
                          isSaved={state.tripPlanItems.some((item) => item.id === experienceItemId(tour.id))}
                        />
                      ))}
                    </div>
                  ) : null}
                  <TisTripPlan
                    tours={tours}
                    items={state.tripPlanItems}
                    phase={state.phase as TisPhase}
                    dispatch={dispatch}
                  />
                  {state.phase === "deciding" ? <GiftCard giftUrl={giftUrl} /> : null}
                </>
              )
            }
          />
        </div>
      </div>
    </main>
  );
}
