"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import type { Dispatch } from "react";
import type { MarcoTour } from "@/components/marco-chat/types";
import { attributionFor } from "@/lib/marco/showcase/tis-partner-catalogue";
import {
  opportunityById,
  TIS_OPPORTUNITY_KIND_LABEL,
} from "@/lib/marco/showcase/tis-demo-ecosystem";
import {
  TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID,
  type TisConversationAction,
  type TisPhase,
  type TisTripPlanItem,
} from "@/lib/marco/showcase/tis-conversation-state";

type TisTripPlanProps = {
  tours: readonly MarcoTour[];
  items: readonly TisTripPlanItem[];
  phase: TisPhase;
  dispatch: Dispatch<TisConversationAction>;
};

const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeToDesktopQuery(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const mediaQuery = window.matchMedia(DESKTOP_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

// Server and first client render must agree, so the server snapshot is always false.
function useIsDesktopViewport(): boolean {
  return useSyncExternalStore(
    subscribeToDesktopQuery,
    () =>
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia(DESKTOP_QUERY).matches
        : false,
    () => false,
  );
}

function SavedPossibilityCard({
  tour,
  itemId,
  dispatch,
  focusAfterRemove,
}: {
  tour: MarcoTour;
  itemId: string;
  dispatch: Dispatch<TisConversationAction>;
  focusAfterRemove: () => void;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--brand-green-700)]/25 bg-white p-4 text-sm">
      <p className="text-xs font-semibold uppercase text-[var(--brand-green-700)]">Saved possibility</p>
      <p className="mt-1 font-display text-lg font-semibold text-[var(--brand-green-900)]">{tour.name}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{attributionFor(tour.id).operator}</p>
      <dl className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-muted)]">Operator-published price</dt>
          <dd className="font-semibold text-[var(--brand-green-900)]">
            {tour.price} <span className="font-normal text-[var(--text-muted)]">{attributionFor(tour.id).priceBasis}</span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-muted)]">Date</dt>
          <dd className="font-semibold text-[var(--brand-green-900)]">Not selected</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-muted)]">Status</dt>
          <dd className="font-semibold text-[var(--brand-green-900)]">Nothing booked</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={tour.url}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center justify-center rounded-[10px] border border-[var(--brand-green-700)]/35 px-3 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          Check dates
        </a>
        <button
          type="button"
          onClick={() => {
            focusAfterRemove();
            dispatch({ type: "removeTripPlanItem", id: itemId });
          }}
          className="min-h-11 rounded-[10px] border border-[var(--border-soft)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function SavedOpportunityCard({
  opportunityId,
  itemId,
  dispatch,
  focusAfterRemove,
}: {
  opportunityId: string;
  itemId: string;
  dispatch: Dispatch<TisConversationAction>;
  focusAfterRemove: () => void;
}) {
  const opportunity = opportunityById(opportunityId);
  if (!opportunity) return null;

  return (
    <div className="rounded-[10px] border border-[var(--brand-green-700)]/25 bg-white p-4 text-sm">
      <p className="text-xs font-semibold uppercase text-[var(--brand-green-700)]">
        Saved possibility · {TIS_OPPORTUNITY_KIND_LABEL[opportunity.kind]}
      </p>
      <p className="mt-1 font-display text-lg font-semibold text-[var(--brand-green-900)]">{opportunity.title}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{opportunity.provider}</p>
      <dl className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-muted)]">Indicative</dt>
          <dd className="font-semibold text-[var(--brand-green-900)]">{opportunity.priceHint}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-muted)]">Status</dt>
          <dd className="font-semibold text-[var(--brand-green-900)]">Nothing booked</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">Sample data for this demonstration.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            focusAfterRemove();
            dispatch({ type: "removeTripPlanItem", id: itemId });
          }}
          className="min-h-11 rounded-[10px] border border-[var(--border-soft)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function ArrangementRequestCard({
  label,
  itemId,
  dispatch,
  focusAfterRemove,
}: {
  label: string;
  itemId: string;
  dispatch: Dispatch<TisConversationAction>;
  focusAfterRemove: () => void;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--brand-gold-500)]/40 bg-white p-4 text-sm">
      <p className="text-xs font-semibold uppercase text-[#6b531d]">Question for the operator</p>
      <p className="mt-1 font-display text-lg font-semibold text-[var(--brand-green-900)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
        Not listed in any catalogue here. The operator says what is possible.
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="font-semibold text-[var(--text-muted)]">Status</p>
        <p className="font-semibold text-[var(--brand-green-900)]">Not sent yet</p>
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#6b531d]">
        Nothing has been arranged or priced.
      </p>
      <div className="mt-3">
        <button
          type="button"
          onClick={() => {
            focusAfterRemove();
            dispatch({ type: "removeTripPlanItem", id: itemId });
          }}
          className="min-h-11 rounded-[10px] border border-[var(--border-soft)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          Remove request
        </button>
      </div>
    </div>
  );
}

function PrivateRequestCard({
  dispatch,
  focusAfterRemove,
}: {
  dispatch: Dispatch<TisConversationAction>;
  focusAfterRemove: () => void;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--brand-gold-500)]/40 bg-white p-4 text-sm">
      <p className="text-xs font-semibold uppercase text-[#6b531d]">Request in preparation</p>
      <p className="mt-1 font-display text-lg font-semibold text-[var(--brand-green-900)]">Private Seville experience</p>

      <div className="mt-3">
        <p className="font-semibold text-[var(--text-muted)]">Interests</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-[var(--brand-green-900)]">
          <li>Historical Seville</li>
          <li>Local food</li>
        </ul>
      </div>
      <div className="mt-3">
        <p className="font-semibold text-[var(--text-muted)]">Preferences</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-[var(--brand-green-900)]">
          <li>Private, if available</li>
          <li>Relaxed pace</li>
        </ul>
      </div>
      <div className="mt-3">
        <p className="font-semibold text-[var(--text-muted)]">Still open</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-[var(--brand-green-900)]">
          <li>Exact date or date range</li>
          <li>What the operator can offer</li>
          <li>Availability</li>
          <li>Final price and inclusions</li>
        </ul>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="font-semibold text-[var(--text-muted)]">Status</p>
        <p className="font-semibold text-[var(--brand-green-900)]">Not sent yet</p>
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#6b531d]">Nothing has been sent to an operator.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            focusAfterRemove();
            dispatch({ type: "removeTripPlanItem", id: TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID });
          }}
          className="min-h-11 rounded-[10px] border border-[var(--border-soft)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          Remove request
        </button>
      </div>
    </div>
  );
}

function TripPlanSections({ tours, items, phase, dispatch }: TisTripPlanProps) {
  const savedHeadingRef = useRef<HTMLHeadingElement>(null);
  const requestsHeadingRef = useRef<HTMLHeadingElement>(null);
  const savedItems = items.filter((item) => item.status === "savedPossibility");
  const requestItem = items.find((item) => item.kind === "privateRequest");
  const arrangementItems = items.filter((item) => item.kind === "arrangementRequest");
  const requestStageReached = phase !== "gathering";

  const savedCount = savedItems.length;
  const requestCount = (requestItem ? 1 : 0) + arrangementItems.length;

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-[var(--brand-green-700)]">Development-only Trip Plan preview</p>
      <h2 className="font-display mt-1 text-xl font-semibold text-[var(--brand-green-900)]">Your Trip Plan</h2>
      <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
        {savedCount} saved {savedCount === 1 ? "possibility" : "possibilities"} · {requestCount}{" "}
        {requestCount === 1 ? "request" : "requests"} in preparation · 0 confirmed items
      </p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
          Your selected possibilities and requests will appear here.
        </p>
      ) : null}

      <section className="mt-4" aria-labelledby="tis-trip-plan-saved-heading">
        <h3
          id="tis-trip-plan-saved-heading"
          ref={savedHeadingRef}
          tabIndex={-1}
          className="text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          Saved possibilities
        </h3>
        <div className="mt-2 space-y-3">
          {savedItems.length > 0 ? (
            savedItems.map((item) => {
              if (item.kind === "opportunity" && item.opportunityId) {
                return (
                  <SavedOpportunityCard
                    key={item.id}
                    opportunityId={item.opportunityId}
                    itemId={item.id}
                    dispatch={dispatch}
                    focusAfterRemove={() => savedHeadingRef.current?.focus()}
                  />
                );
              }
              const tour = tours.find((entry) => entry.id === item.tourId);
              if (!tour) return null;
              return (
                <SavedPossibilityCard
                  key={item.id}
                  tour={tour}
                  itemId={item.id}
                  dispatch={dispatch}
                  focusAfterRemove={() => savedHeadingRef.current?.focus()}
                />
              );
            })
          ) : (
            <p className="text-xs leading-5 text-[var(--text-muted)]">No saved possibilities yet.</p>
          )}
        </div>
      </section>

      <section className="mt-4" aria-labelledby="tis-trip-plan-requests-heading">
        <h3
          id="tis-trip-plan-requests-heading"
          ref={requestsHeadingRef}
          tabIndex={-1}
          className="text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          Requests
        </h3>
        <div className="mt-2 space-y-3">
          {requestItem ? (
            <PrivateRequestCard
              dispatch={dispatch}
              focusAfterRemove={() => requestsHeadingRef.current?.focus()}
            />
          ) : null}
          {arrangementItems.map((item) => (
            <ArrangementRequestCard
              key={item.id}
              label={item.label ?? ""}
              itemId={item.id}
              dispatch={dispatch}
              focusAfterRemove={() => requestsHeadingRef.current?.focus()}
            />
          ))}
          {!requestItem && arrangementItems.length === 0 ? (
            requestStageReached ? (
              <p className="text-xs leading-5 text-[var(--text-muted)]">No private request is currently being prepared.</p>
            ) : (
              <p className="text-xs leading-5 text-[var(--text-muted)]">No requests in preparation yet.</p>
            )
          ) : null}
        </div>
      </section>

      <section className="mt-4" aria-labelledby="tis-trip-plan-confirmed-heading">
        <h3 id="tis-trip-plan-confirmed-heading" className="text-sm font-semibold text-[var(--brand-green-900)]">Confirmed</h3>
        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">No confirmed items yet.</p>
      </section>
    </div>
  );
}

export function TisTripPlan(props: TisTripPlanProps) {
  const isDesktop = useIsDesktopViewport();
  const [mobileOpen, setMobileOpen] = useState(false);
  const summaryButtonRef = useRef<HTMLButtonElement>(null);

  const savedCount = props.items.filter((item) => item.status === "savedPossibility").length;
  const requestCount = props.items.filter((item) => item.status === "requestInPreparation").length;  const summaryLabel =
    savedCount === 0 && requestCount === 0
      ? "Trip Plan · empty"
      : `Trip Plan · ${savedCount} ${savedCount === 1 ? "possibility" : "possibilities"} · ${requestCount} ${
          requestCount === 1 ? "request" : "requests"
        }`;

  if (isDesktop) {
    return (
      <aside
        className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-card)] p-5"
        aria-label="Your Trip Plan"
      >
        <TripPlanSections {...props} />
      </aside>
    );
  }

  return (
    <div className="rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-card)] p-3">
      <button
        ref={summaryButtonRef}
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="tis-trip-plan-mobile-region"
        onClick={() => setMobileOpen((open) => !open)}
        className="flex min-h-11 w-full items-center justify-between rounded-[10px] px-2 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
      >
        <span>{summaryLabel}</span>
        <span aria-hidden="true">{mobileOpen ? "−" : "+"}</span>
      </button>

      {mobileOpen ? (
        <div id="tis-trip-plan-mobile-region" role="region" aria-label="Your Trip Plan" className="mt-3">
          <TripPlanSections {...props} />
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              summaryButtonRef.current?.focus();
            }}
            className="mt-4 min-h-11 rounded-[10px] border border-[var(--border-soft)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
          >
            Close Trip Plan
          </button>
        </div>
      ) : null}
    </div>
  );
}
