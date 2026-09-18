"use client";

import { useEffect, useMemo, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/wordpress-rest/urls";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type PlanTripModalProps = {
  open: boolean;
  onClose: () => void;
  locale?: Locale;
};

type Experience = "private" | "luxury";

type PlanTripState = {
  experience?: Experience;
  duration?: string;
  places: string[];
  interests: string[];
  name: string;
  contact: string;
  message: string;
};

const durations = ["1 day", "2 days", "3-4 days", "5-7 days", "10+ days"];
const places = ["Seville", "Granada", "Cordoba", "Ronda", "Cadiz", "Jerez"];
const interests = [
  "History",
  "Architecture",
  "Food & tapas",
  "Flamenco",
  "Hidden gems",
  "Family",
  "Accessibility",
  "Luxury logistics",
];

const stepLabels = ["Experience", "Duration", "Places", "Interests", "Send"];

const luxuryExplanation =
  "Includes Mercedes airport transfer, before-hours access, curated dining and dedicated concierge. Carlos sends a bespoke proposal - every experience is custom-built.";

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

export function PlanTripModal({ open, onClose, locale = "en" }: PlanTripModalProps) {
  const copy = siteCopy(locale);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<PlanTripState>({
    places: [],
    interests: [],
    name: "",
    contact: "",
    message: "",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const progressWidth = useMemo(() => `${((step + 1) / stepLabels.length) * 100}%`, [step]);

  if (!open) {
    return null;
  }

  function updateState(updates: Partial<PlanTripState>) {
    setState((current) => ({ ...current, ...updates }));
  }

  function canContinue(): boolean {
    if (step === 0) {
      return Boolean(state.experience);
    }

    if (step === 1) {
      return Boolean(state.duration);
    }

    if (step === 2) {
      return state.places.length > 0;
    }

    if (step === 3) {
      return state.interests.length > 0;
    }

    return true;
  }

  function buildWhatsappSummary(includeCollections: boolean): string {
    const lines = [
      copy.planner.title,
      `${copy.planner.summaryLabels.group}: ${state.experience === "luxury" ? copy.planner.modeLabels.luxury : copy.planner.modeLabels.private}`,
    ];

    if (state.duration) {
      lines.push(`${copy.planner.summaryLabels.days}: ${state.duration}`);
    }

    if (includeCollections && state.places.length > 0) {
      lines.push(`${copy.planner.summaryLabels.destinations}: ${state.places.join(", ")}`);
    }

    if (includeCollections && state.interests.length > 0) {
      lines.push(`${copy.planner.summaryLabels.interests}: ${state.interests.join(", ")}`);
    }

    if (state.name.trim()) {
      lines.push(`Name: ${state.name.trim()}`);
    }

    if (state.contact.trim()) {
      lines.push(`Contact: ${state.contact.trim()}`);
    }

    if (state.message.trim()) {
      lines.push(`Message: ${state.message.trim()}`);
    }

    return lines.join("\n");
  }

  function sendPlan(includeCollections: boolean) {
    window.location.assign(buildWhatsAppUrl(buildWhatsappSummary(includeCollections)));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close plan trip modal"
        className="absolute inset-0 bg-[rgba(7,10,8,0.62)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex min-h-full items-end justify-center p-3 sm:items-center sm:p-6">
        <section
          aria-modal="true"
          role="dialog"
          aria-labelledby="plan-trip-title"
          className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.9rem] border border-[color:rgba(184,144,58,0.18)] bg-[var(--surface-card)] shadow-[0_28px_80px_rgba(0,0,0,0.24)] sm:rounded-[2rem]"
        >
          <div className="border-b border-[color:rgba(6,80,63,0.1)] px-5 py-4 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-[var(--brand-green-700)]">
                  {copy.shared.planTrip}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">
                  {copy.planner.title} · Step {step + 1} of {stepLabels.length} · {stepLabels[step]}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-white text-xl text-[var(--foreground)] transition hover:border-[color:var(--brand-green-700)] hover:text-[var(--brand-green-700)]"
                  aria-label={copy.shared.planTrip}
              >
                ×
              </button>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[rgba(6,80,63,0.08)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-gold-300),var(--brand-green-700))] transition-[width] duration-300"
                style={{ width: progressWidth }}
              />
            </div>
          </div>

          <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-7">
            {step === 0 ? (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-gold-500)]">
                  {copy.planner.modes.private}
                </p>
                <h2
                  id="plan-trip-title"
                  className="font-display mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl"
                >
                  {copy.planner.heading}
                </h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {(["private", "luxury"] as const).map((option) => {
                    const active = state.experience === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateState({ experience: option })}
                        className={
                          active
                            ? option === "luxury"
                              ? "rounded-[1.4rem] border border-[color:rgba(184,144,58,0.32)] bg-[linear-gradient(145deg,#11100d,#18140e)] p-5 text-left text-white shadow-[0_16px_36px_rgba(17,17,17,0.18)]"
                              : "rounded-[1.4rem] border border-[color:rgba(6,80,63,0.18)] bg-[linear-gradient(145deg,#094736,#0f7357)] p-5 text-left text-white shadow-[0_16px_36px_rgba(6,80,63,0.18)]"
                            : "rounded-[1.4rem] border border-[color:var(--border-soft)] bg-white p-5 text-left text-[var(--foreground)]"
                        }
                      >
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-inherit/80">
                          {option === "private" ? copy.planner.modes.private : copy.planner.modes.luxury}
                        </p>
                        <p className="font-display mt-3 text-3xl font-semibold tracking-[-0.03em]">
                          {option === "private" ? copy.planner.modes.private : copy.planner.modes.luxury}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-inherit/80">
                          {option === "private"
                            ? "Official guiding, calm pacing and private routes around Seville and Andalucia."
                            : "Airport transfer, before-hours access, refined dining and concierge-led planning."}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {state.experience === "luxury" ? (
                  <p className="mt-5 rounded-[1.3rem] border border-[color:rgba(184,144,58,0.18)] bg-[rgba(184,144,58,0.08)] px-4 py-4 text-sm leading-7 text-[var(--foreground)]">
                    {luxuryExplanation}
                  </p>
                ) : null}
              </div>
            ) : null}

            {step === 1 ? (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-gold-500)]">
                  {copy.planner.daysLabel}
                </p>
                <h2
                  id="plan-trip-title"
                  className="font-display mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl"
                >
                  {copy.planner.heading}
                </h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {durations.map((option) => {
                    const active = state.duration === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateState({ duration: option })}
                        className={
                          active
                            ? "rounded-[1.25rem] border border-[color:rgba(6,80,63,0.18)] bg-[var(--brand-green-100)] px-4 py-4 text-left text-[var(--brand-green-900)]"
                            : "rounded-[1.25rem] border border-[color:var(--border-soft)] bg-white px-4 py-4 text-left text-[var(--foreground)]"
                        }
                      >
                        <span className="text-base font-semibold">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-gold-500)]">
                  Places
                </p>
                <h2
                  id="plan-trip-title"
                  className="font-display mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl"
                >
                  Which places matter most right now?
                </h2>
                <div className="mt-6 flex flex-wrap gap-3">
                  {places.map((option) => {
                    const active = state.places.includes(option);

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateState({ places: toggleValue(state.places, option) })}
                        className={
                          active
                            ? "rounded-full border border-[color:rgba(6,80,63,0.18)] bg-[var(--brand-green-100)] px-4 py-3 text-sm font-semibold text-[var(--brand-green-900)]"
                            : "rounded-full border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)]"
                        }
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-gold-500)]">
                  Interests
                </p>
                <h2
                  id="plan-trip-title"
                  className="font-display mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl"
                >
                  What should shape the experience?
                </h2>
                <div className="mt-6 flex flex-wrap gap-3">
                  {interests.map((option) => {
                    const active = state.interests.includes(option);

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateState({ interests: toggleValue(state.interests, option) })}
                        className={
                          active
                            ? "rounded-full border border-[color:rgba(184,144,58,0.22)] bg-[rgba(184,144,58,0.12)] px-4 py-3 text-sm font-semibold text-[color:var(--brand-gold-500)]"
                            : "rounded-full border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)]"
                        }
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-gold-500)]">
                  Send
                </p>
                <h2
                  id="plan-trip-title"
                  className="font-display mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl"
                >
                  Send the brief when you are ready.
                </h2>
                <div className="mt-6 grid gap-4">
                  <label className="grid gap-2 text-sm font-semibold text-[var(--foreground)]">
                    Name
                    <input
                      value={state.name}
                      onChange={(event) => updateState({ name: event.target.value })}
                      className="input"
                      placeholder="Optional"
                      autoComplete="name"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-[var(--foreground)]">
                    Email or WhatsApp
                    <input
                      value={state.contact}
                      onChange={(event) => updateState({ contact: event.target.value })}
                      className="input"
                      placeholder="Optional"
                      autoComplete="email"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-[var(--foreground)]">
                    Message
                    <textarea
                      value={state.message}
                      onChange={(event) => updateState({ message: event.target.value })}
                      className="input min-h-28"
                      placeholder="Optional"
                    />
                  </label>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-[color:rgba(6,80,63,0.1)] px-5 py-4 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => current - 1)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[color:var(--brand-green-700)] hover:text-[var(--brand-green-700)]"
                  >
                    Back
                  </button>
                ) : null}
                {step >= 1 ? (
                  <button
                    type="button"
                    onClick={() => sendPlan(step >= 3)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:rgba(184,144,58,0.24)] bg-[rgba(184,144,58,0.1)] px-5 py-3 text-sm font-semibold text-[color:var(--brand-gold-500)] transition hover:bg-[rgba(184,144,58,0.16)]"
                  >
                    Send to Carlos now
                  </button>
                ) : null}
              </div>

              {step < stepLabels.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => current + 1)}
                  disabled={!canContinue()}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-green-700)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-green-900)] disabled:cursor-not-allowed disabled:bg-[color:rgba(13,122,92,0.38)]"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => sendPlan(true)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-green-700)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-green-900)]"
                >
                  Send plan to Carlos
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}