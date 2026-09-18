"use client";

import { useId, useState } from "react";
import type { ChatCopy } from "./chat-copy";
import type { JourneyBrief as JourneyBriefData } from "./types";

type JourneyBriefProps = {
  brief: JourneyBriefData;
  copy: ChatCopy;
  providerName: string;
  accentColor: string;
};

type BriefRow = {
  key: string;
  label: string;
  value?: string;
  values?: string[];
  badge?: string;
};

function BriefSection({
  title,
  rows,
  accentColor,
}: {
  title: string;
  rows: BriefRow[];
  accentColor: string;
}) {
  if (rows.length === 0) return null;

  return (
    <section className="border-t border-black/10 pt-3" aria-label={title}>
      <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6F675D]">
        {title}
      </h3>
      <dl className="mt-2 space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="flex items-start justify-between gap-3 text-xs">
            <dt className="shrink-0 text-[#756D64]">{row.label}</dt>
            <dd className="min-w-0 text-right font-medium text-[#263A2D]">
              {row.values ? (
                <ul className="space-y-1">
                  {row.values.map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
              ) : (
                row.value
              )}
              {row.badge ? (
                <span
                  className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: accentColor }}
                >
                  {row.badge}
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Read-only, session-level summary of the controlled answers Marco has gathered. */
export function JourneyBrief({ brief, copy, providerName, accentColor }: JourneyBriefProps) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const briefCopy = copy.journeyBrief;
  const sharedRows: BriefRow[] = [
    { key: "destination", label: briefCopy.fields.destination, value: brief.destination.value },
  ];
  const preferenceRows: BriefRow[] = [];
  const openRows: BriefRow[] = [];

  if (brief.date && brief.date.origin !== "requiresConfirmation") {
    sharedRows.push({ key: "date", label: briefCopy.fields.date, value: brief.date.value });
  }
  if (brief.partyType.value !== "unspecified") {
    sharedRows.push({
      key: "party-type",
      label: briefCopy.fields.partyType,
      value: briefCopy.partyLabels[brief.partyType.value],
    });
  }
  if (brief.partySize) {
    sharedRows.push({
      key: "party-size",
      label: briefCopy.fields.partySize,
      value: String(brief.partySize.value),
    });
  }
  if (brief.tourIds.length > 0) {
    sharedRows.push({
      key: "suggested-tours",
      label: briefCopy.fields.suggestedTours,
      values: brief.tourIds,
    });
  }

  if (brief.format.value !== "undecided") {
    preferenceRows.push({
      key: "format",
      label: briefCopy.fields.format,
      value: briefCopy.formatLabels[brief.format.value],
      badge: briefCopy.preference,
    });
  }
  if (brief.interests.length > 0) {
    preferenceRows.push({
      key: "interests",
      label: briefCopy.fields.interests,
      values: brief.interests.map((interest) => copy.interestLabels[interest.value]),
      badge: briefCopy.preference,
    });
  }
  if (brief.walkingPreference.value !== "unspecified") {
    preferenceRows.push({
      key: "walking",
      label: briefCopy.fields.walking,
      value: briefCopy.walkingLabels[brief.walkingPreference.value],
      badge: briefCopy.preference,
    });
  }
  if (brief.timingPreference.value !== "unspecified") {
    preferenceRows.push({
      key: "timing",
      label: briefCopy.fields.timing,
      value: briefCopy.timingLabels[brief.timingPreference.value],
      badge: briefCopy.preference,
    });
  }

  if (brief.date?.origin === "requiresConfirmation") {
    openRows.push({
      key: "date-confirmation",
      label: briefCopy.fields.date,
      value: brief.date.value,
      badge: briefCopy.needsConfirmation,
    });
  }
  if (brief.format.value === "undecided" && brief.openQuestions.length > 0) {
    openRows.push({
      key: "format-question",
      label: briefCopy.fields.format,
      value: briefCopy.openFormatQuestion,
    });
  }
  if (brief.date?.origin === "requiresConfirmation" && brief.openQuestions.length > 0) {
    openRows.push({
      key: "date-question",
      label: briefCopy.fields.date,
      value: briefCopy.openDateQuestion(brief.date.value),
    });
  }

  const operatorRows = brief.operatorConfirmations.map((confirmation, index) => ({
    key: `operator-${index}`,
    label: briefCopy.sections.operator,
    value: confirmation,
  }));

  return (
    <section
      className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border bg-[#F8F5F0] shadow-[0_4px_18px_rgba(26,58,42,0.08)]"
      style={{ borderColor: `${accentColor}66` }}
      aria-label={`${providerName} ${briefCopy.title}`}
    >
      <button
        type="button"
        className="flex min-h-[52px] w-full items-center gap-3 px-3.5 py-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1A3A2A]"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((isExpanded) => !isExpanded)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          setExpanded((isExpanded) => !isExpanded);
        }}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{ backgroundColor: `${accentColor}26`, color: "#1A3A2A" }}
          aria-hidden="true"
        >
          ✦
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A7F72]">
            {providerName} · {briefCopy.eyebrow}
          </span>
          <span className="font-display block text-sm font-semibold text-[#1A3A2A]">
            {briefCopy.title}
          </span>
        </span>
        <span className="shrink-0 text-lg leading-none text-[#6F675D]" aria-hidden="true">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded ? (
        <div id={contentId} className="space-y-3 px-3.5 pb-4">
          <p className="text-[11px] leading-relaxed text-[#756D64]">{briefCopy.note}</p>
          <BriefSection
            title={briefCopy.sections.shared}
            rows={sharedRows}
            accentColor={accentColor}
          />
          <BriefSection
            title={briefCopy.sections.preferences}
            rows={preferenceRows}
            accentColor={accentColor}
          />
          <BriefSection
            title={briefCopy.sections.stillOpen}
            rows={openRows}
            accentColor={accentColor}
          />
          <BriefSection
            title={briefCopy.sections.operator}
            rows={operatorRows}
            accentColor={accentColor}
          />
        </div>
      ) : null}
    </section>
  );
}