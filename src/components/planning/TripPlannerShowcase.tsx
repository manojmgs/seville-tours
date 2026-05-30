"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/wordpress-rest/urls";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type TravelMode = "private" | "luxury";

type TripPlannerShowcaseProps = {
  locale?: Locale;
};

const destinationOptions = [
  { id: "seville", label: "Seville", note: "Start with context and a calm rhythm." },
  { id: "cordoba", label: "Córdoba", note: "Mezquita, patios, and an elegant day pace." },
  { id: "granada", label: "Granada", note: "Alhambra, Albaicín, and a slower luxury finish." },
  { id: "ronda", label: "Ronda", note: "Cliffside views and refined countryside movement." },
];

const interestOptions = [
  "Architecture",
  "Food & wine",
  "Luxury logistics",
  "Photography",
  "Family travel",
  "Private transfers",
];

const groupOptions = ["Couple", "Family", "Friends", "Private group", "Solo traveler"];

function toggleItem(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function TripPlannerShowcase({ locale = "en" }: TripPlannerShowcaseProps) {
  const copy = siteCopy(locale);
  const [mode, setMode] = useState<TravelMode>("luxury");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [days, setDays] = useState(4);
  const [destinations, setDestinations] = useState<string[]>(["seville", "granada"]);
  const [interests, setInterests] = useState<string[]>(["Architecture", "Luxury logistics"]);
  const [group, setGroup] = useState("Couple");
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  function switchMode(nextMode: TravelMode) {
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
    }

    setIsTransitioning(true);
    setMode(nextMode);

    transitionTimer.current = window.setTimeout(() => {
      setIsTransitioning(false);
      transitionTimer.current = null;
    }, 520);
  }

  const summary = useMemo(() => {
    const destinationLabels = destinationOptions
      .filter((option) => destinations.includes(option.id))
      .map((option) => option.label)
      .join(", ");

    const interestLabels = interests.length > 0 ? interests.join(", ") : copy.planner.notes.private;
    const modeLabel = mode === "luxury" ? copy.planner.modeLabels.luxury : copy.planner.modeLabels.private;
    const summaryLines = [
      `${modeLabel}`,
      `${copy.planner.summaryLabels.days}: ${days}`,
      `${copy.planner.summaryLabels.destinations}: ${destinationLabels || destinationOptions[0].label}`,
      `${copy.planner.summaryLabels.interests}: ${interestLabels}`,
      `${copy.planner.summaryLabels.group}: ${group}`,
      `${copy.planner.summaryLabels.note}: ${mode === "luxury" ? copy.planner.notes.luxury : copy.planner.notes.private}`,
    ];

    return {
      destinationLabels: destinationLabels || destinationOptions[0].label,
      interestLabels,
      primaryCta: mode === "luxury" ? copy.planner.ctas.luxury : copy.planner.ctas.private,
      ctaHref: buildWhatsAppUrl(summaryLines.join("\n")),
    };
  }, [
    copy.planner.ctas.luxury,
    copy.planner.ctas.private,
    copy.planner.modeLabels.luxury,
    copy.planner.modeLabels.private,
    copy.planner.notes.luxury,
    copy.planner.notes.private,
    copy.planner.summaryLabels.days,
    copy.planner.summaryLabels.destinations,
    copy.planner.summaryLabels.group,
    copy.planner.summaryLabels.interests,
    copy.planner.summaryLabels.note,
    days,
    destinations,
    group,
    interests,
    mode,
  ]);

  const modeLabel = mode === "luxury" ? copy.planner.modeLabels.luxury : copy.planner.modeLabels.private;
  const highlights = mode === "luxury" ? copy.planner.highlightsLuxury : copy.planner.highlightsPrivate;

  return (
    <section className="mt-8 overflow-hidden rounded-[calc(var(--radius-card)+0.5rem)] border border-[color:rgba(184,144,58,0.18)] bg-[linear-gradient(160deg,rgba(8,7,5,0.98),rgba(20,17,13,0.98))] text-white shadow-[0_30px_80px_rgba(0,0,0,0.18)] transition-[background-color,border-color,box-shadow] duration-700 ease-out">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="p-6 sm:p-8 transition-[transform,opacity] duration-700 ease-out motion-safe:transform-gpu" style={{ opacity: isTransitioning ? 0.96 : 1, transform: isTransitioning ? "translateY(4px)" : "translateY(0)" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-gold-300)]">{copy.planner.title}</p>
          <h2 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{copy.planner.heading}</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-muted-dark)]">{copy.planner.intro}</p>

          <div className="mt-6 inline-flex rounded-full border border-[color:rgba(184,144,58,0.18)] bg-white/5 p-1 transition-all duration-700 ease-out">
            <button
              type="button"
              onClick={() => switchMode("private")}
              aria-pressed={mode === "private"}
              className={mode === "private"
                ? "rounded-full bg-[var(--brand-green-700)] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(13,122,92,0.22)] transition-all duration-500 ease-out"
                : "rounded-full px-4 py-2 text-xs font-semibold text-[var(--text-muted-dark)] transition-all duration-500 ease-out hover:bg-white/10"}
            >
              {copy.planner.modes.private}
            </button>
            <button
              type="button"
              onClick={() => switchMode("luxury")}
              aria-pressed={mode === "luxury"}
              className={mode === "luxury"
                ? "rounded-full border border-[color:rgba(184,144,58,0.35)] bg-[rgba(184,144,58,0.14)] px-4 py-2 text-xs font-semibold text-[var(--brand-gold-100)] shadow-[0_10px_28px_rgba(184,144,58,0.16)] transition-all duration-500 ease-out"
                : "rounded-full px-4 py-2 text-xs font-semibold text-[var(--text-muted-dark)] transition-all duration-500 ease-out hover:bg-white/10"}
            >
              {copy.planner.modes.luxury}
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-[color:rgba(255,255,255,0.1)] bg-white/6 p-4 transition-all duration-700 ease-out" style={{ transform: isTransitioning ? "translateY(2px)" : "translateY(0)" }}>
                <p className="text-sm font-semibold text-white">{item}</p>
              </div>
            ))}
          </div>

          <div className={mode === "luxury"
            ? "mt-8 grid gap-5 rounded-[1.5rem] border border-[color:rgba(184,144,58,0.18)] bg-[rgba(184,144,58,0.08)] p-5 transition-[background-color,border-color,box-shadow] duration-700 ease-out"
            : "mt-8 grid gap-5 rounded-[1.5rem] border border-[color:rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5 transition-[background-color,border-color,box-shadow] duration-700 ease-out"}>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-300)]">{copy.planner.daysLabel}</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDays((value) => Math.max(1, value - 1))}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.16)] bg-white/5 text-lg font-semibold text-white transition hover:bg-white/12"
                >
                  −
                </button>
                <div className="min-w-0 rounded-full border border-[color:rgba(255,255,255,0.16)] bg-black/20 px-5 py-3 text-sm font-semibold text-white transition-all duration-700 ease-out">
                  {days} {copy.planner.summaryLabels.days.toLowerCase()}
                </div>
                <button
                  type="button"
                  onClick={() => setDays((value) => Math.min(14, value + 1))}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.16)] bg-white/5 text-lg font-semibold text-white transition hover:bg-white/12"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-300)]">{copy.planner.destinationsLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {destinationOptions.map((option) => {
                  const active = destinations.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDestinations((value) => toggleItem(value, option.id))}
                      aria-pressed={active}
                      className={active
                        ? "rounded-full border border-[color:rgba(184,144,58,0.35)] bg-[rgba(184,144,58,0.14)] px-4 py-2 text-sm font-semibold text-[var(--brand-gold-100)]"
                        : "rounded-full border border-[color:rgba(255,255,255,0.14)] bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-muted-dark)] transition hover:bg-white/10"}
                      title={option.note}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-300)]">{copy.planner.interestsLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {interestOptions.map((item) => {
                  const active = interests.includes(item);

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setInterests((value) => toggleItem(value, item))}
                      aria-pressed={active}
                      className={active
                        ? "rounded-full border border-[color:rgba(184,144,58,0.35)] bg-[rgba(184,144,58,0.14)] px-4 py-2 text-sm font-semibold text-[var(--brand-gold-100)]"
                        : "rounded-full border border-[color:rgba(255,255,255,0.14)] bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-muted-dark)] transition hover:bg-white/10"}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-300)]">{copy.planner.groupLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {groupOptions.map((item) => {
                  const active = group === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setGroup(item)}
                      aria-pressed={active}
                      className={active
                        ? "rounded-full bg-[var(--brand-green-700)] px-4 py-2 text-sm font-semibold text-white"
                        : "rounded-full border border-[color:rgba(255,255,255,0.14)] bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-muted-dark)] transition hover:bg-white/10"}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="border-t border-[color:rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.22)] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-300)]">{modeLabel}</p>
          <h3 className="font-display mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            {mode === "luxury" ? copy.planner.summaryTitles.luxury : copy.planner.summaryTitles.private}
          </h3>

          <div className="mt-6 space-y-3 rounded-[1.5rem] border border-[color:rgba(255,255,255,0.08)] bg-white/5 p-5">
            <div>
              <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-300)]">{copy.planner.summaryLabels.days}</p>
              <p className="mt-1 text-base font-semibold text-white">{days}</p>
            </div>
            <div>
              <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-300)]">{copy.planner.summaryLabels.destinations}</p>
              <p className="mt-1 text-base font-semibold text-white">{summary.destinationLabels}</p>
            </div>
            <div>
              <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-300)]">{copy.planner.summaryLabels.interests}</p>
              <p className="mt-1 text-base font-semibold text-white">{summary.interestLabels}</p>
            </div>
            <div>
              <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-300)]">{copy.planner.summaryLabels.group}</p>
              <p className="mt-1 text-base font-semibold text-white">{group}</p>
            </div>
            <div>
              <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-300)]">{copy.planner.summaryLabels.note}</p>
              <p className="mt-1 text-sm leading-7 text-[var(--text-muted-dark)]">
                {mode === "luxury" ? copy.planner.notes.luxury : copy.planner.notes.private}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:flex lg:block transition-[transform,opacity] duration-700 ease-out" style={{ opacity: isTransitioning ? 0.96 : 1, transform: isTransitioning ? "translateY(4px)" : "translateY(0)" }}>
            <Link
              href={summary.ctaHref}
              className="inline-flex min-h-11 items-center justify-center rounded-[1.1rem] bg-[var(--brand-gold-100)] px-6 py-3 text-sm font-semibold text-[var(--surface-dark)] transition hover:bg-[var(--brand-gold-300)]"
            >
              {summary.primaryCta}
            </Link>
            <Link
              href={summary.ctaHref}
              className="inline-flex min-h-11 items-center justify-center rounded-[1.1rem] border border-[color:rgba(184,144,58,0.3)] px-6 py-3 text-sm font-semibold text-[var(--brand-gold-100)] transition hover:bg-white/8"
            >
              {copy.planner.ctas.talkToCarlos}
            </Link>
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-[color:rgba(184,144,58,0.18)] bg-[rgba(184,144,58,0.08)] p-4 text-sm leading-7 text-[var(--text-muted-dark)]">
            {mode === "luxury" ? copy.planner.footer.luxury : copy.planner.footer.private}
          </div>
        </aside>
      </div>
    </section>
  );
}
