"use client";

import { useState } from "react";
import type { Dispatch, FormEvent } from "react";
import {
  arrangementItemId,
  TIS_ARRANGEMENT_REQUESTS,
  type TisConversationAction,
  type TisTripPlanItem,
} from "@/lib/marco/showcase/tis-conversation-state";

const MAX_REQUEST_LENGTH = 120;

type TisArrangementRequestsProps = {
  tripPlanItems: readonly TisTripPlanItem[];
  dispatch: Dispatch<TisConversationAction>;
};

export function TisArrangementRequests({ tripPlanItems, dispatch }: TisArrangementRequestsProps) {
  const [draft, setDraft] = useState("");

  const isRequested = (requestId: string) =>
    tripPlanItems.some((item) => item.id === arrangementItemId(requestId));

  const submitOwnRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = draft.trim();
    if (label.length === 0) return;
    dispatch({ type: "requestArrangement", requestId: label.toLowerCase(), label });
    setDraft("");
  };

  return (
    <div className="rounded-xl border border-[var(--brand-gold-500)]/40 bg-[#fff9ef] p-4">
      <p className="text-sm font-semibold text-[var(--brand-green-900)]">
        Want something that is not listed here?
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
        We do not source, price or arrange any of these. The operator answers with what is actually possible.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {TIS_ARRANGEMENT_REQUESTS.map((request) => {
          const requested = isRequested(request.value);
          return (
            <button
              key={request.value}
              type="button"
              aria-pressed={requested}
              disabled={requested}
              onClick={() =>
                dispatch({ type: "requestArrangement", requestId: request.value, label: request.label })
              }
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)] ${
                requested
                  ? "border-[var(--brand-green-900)] bg-[var(--brand-green-900)] text-white"
                  : "border-[var(--brand-green-700)]/35 bg-white text-[var(--brand-green-900)]"
              }`}
            >
              {requested ? `${request.label} · asked` : request.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={submitOwnRequest} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="tis-own-request" className="sr-only">
          Something else you would like the operator to arrange
        </label>
        <input
          id="tis-own-request"
          value={draft}
          maxLength={MAX_REQUEST_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Something else, in your own words…"
          className="min-h-11 min-w-0 flex-1 rounded-[10px] border border-[var(--border-soft)] bg-white px-3 py-2 text-base text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        />
        <button
          type="submit"
          disabled={draft.trim().length === 0}
          className="min-h-11 shrink-0 rounded-[10px] bg-[var(--brand-green-900)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold-500)]"
        >
          Ask the operator
        </button>
      </form>
    </div>
  );
}
