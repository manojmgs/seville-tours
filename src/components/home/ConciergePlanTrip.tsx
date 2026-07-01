"use client";

import { useEffect, useMemo, useState } from "react";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type ConciergePlanTripProps = {
  open: boolean;
  onClose: () => void;
  locale?: Locale;
};

type Experience = "private" | "luxury";

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

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

const chipBase =
  "inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95";
const chipIdle =
  "border-[color:var(--border-soft)] bg-white text-[var(--foreground)] hover:border-[color:var(--brand-green-700)]";
const chipActive =
  "border-[color:var(--brand-green-700)] bg-[var(--brand-green-700)] text-white shadow-[0_10px_24px_rgba(6,80,63,0.18)]";

/**
 * Concierge Plan-a-Trip form (feature-flagged replacement for the legacy modal).
 *
 * Captures a structured, consented lead, persists it server-side via
 * `POST /api/trip-inquiry` BEFORE handing off, then redirects to the returned
 * WhatsApp deep link. It holds no inventory and never touches payment.
 */
export function ConciergePlanTrip({ open, onClose, locale = "en" }: ConciergePlanTripProps) {
  const copy = siteCopy(locale);
  const [experience, setExperience] = useState<Experience | undefined>();
  const [duration, setDuration] = useState<string | undefined>();
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const canSubmit = useMemo(
    () => Boolean(experience) && name.trim().length > 0 && consent && !submitting,
    [experience, name, consent, submitting],
  );

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!experience || !consent || name.trim().length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/trip-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience,
          duration,
          places: selectedPlaces,
          interests: selectedInterests,
          name: name.trim(),
          contact: contact.trim(),
          message: message.trim(),
          locale,
          consent,
        }),
      });

      if (!response.ok) {
        setError("We couldn't send your request. Please try again.");
        setSubmitting(false);
        return;
      }

      const result = (await response.json()) as { whatsappUrl?: string };
      if (result.whatsappUrl) {
        window.location.assign(result.whatsappUrl);
        return;
      }
      setError("We couldn't open WhatsApp. Please try again.");
      setSubmitting(false);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close plan trip form"
        className="absolute inset-0 bg-[rgba(7,10,8,0.62)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex min-h-full items-end justify-center p-3 sm:items-center sm:p-6">
        <section
          aria-modal="true"
          role="dialog"
          aria-labelledby="concierge-plan-trip-title"
          className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.9rem] border border-[color:rgba(184,144,58,0.18)] bg-[var(--surface-card)] shadow-[0_28px_80px_rgba(0,0,0,0.24)] sm:rounded-[2rem]"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[color:rgba(6,80,63,0.1)] px-5 py-4 sm:px-7">
            <div className="min-w-0 flex-1">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-[var(--brand-green-700)]">
                {copy.shared.planTrip}
              </p>
              <h2
                id="concierge-plan-trip-title"
                className="font-display mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-3xl"
              >
                {copy.planner.heading}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={copy.shared.planTrip}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-white text-xl text-[var(--foreground)] transition hover:border-[color:var(--brand-green-700)] hover:text-[var(--brand-green-700)]"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <fieldset>
                <legend className="text-sm font-semibold text-[var(--foreground)]">
                  {copy.planner.summaryLabels.group}
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(["private", "luxury"] as const).map((option) => {
                    const active = experience === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setExperience(option)}
                        aria-pressed={active}
                        className={`${chipBase} justify-center ${active ? chipActive : chipIdle}`}
                      >
                        {option === "luxury"
                          ? copy.planner.modeLabels.luxury
                          : copy.planner.modeLabels.private}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold text-[var(--foreground)]">
                  {copy.planner.summaryLabels.days}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {durations.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDuration(option)}
                      aria-pressed={duration === option}
                      className={`${chipBase} ${duration === option ? chipActive : chipIdle}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold text-[var(--foreground)]">
                  {copy.planner.summaryLabels.destinations}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {places.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedPlaces((current) => toggleValue(current, option))}
                      aria-pressed={selectedPlaces.includes(option)}
                      className={`${chipBase} ${selectedPlaces.includes(option) ? chipActive : chipIdle}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold text-[var(--foreground)]">
                  {copy.planner.summaryLabels.interests}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {interests.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedInterests((current) => toggleValue(current, option))}
                      aria-pressed={selectedInterests.includes(option)}
                      className={`${chipBase} ${selectedInterests.includes(option) ? chipActive : chipIdle}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--foreground)]">Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={120}
                    autoComplete="name"
                    className="mt-2 min-h-[44px] w-full rounded-xl border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[var(--foreground)] outline-none focus:border-[color:var(--brand-green-700)]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    Email or phone <span className="font-normal text-[var(--text-muted)]">(optional)</span>
                  </span>
                  <input
                    type="text"
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    maxLength={160}
                    className="mt-2 min-h-[44px] w-full rounded-xl border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[var(--foreground)] outline-none focus:border-[color:var(--brand-green-700)]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  Anything else? <span className="font-normal text-[var(--text-muted)]">(optional)</span>
                </span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-[color:var(--border-soft)] bg-white px-3 py-2 text-[var(--foreground)] outline-none focus:border-[color:var(--brand-green-700)]"
                />
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  required
                  className="mt-1 h-5 w-5 shrink-0 rounded border-[color:var(--border-soft)]"
                />
                <span className="text-sm text-[var(--text-muted)]">
                  I agree to be contacted about my trip enquiry. My details are used only to plan
                  and confirm my trip.
                </span>
              </label>

              {error ? (
                <p role="alert" className="text-sm font-semibold text-[color:#b42318]">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="border-t border-[color:rgba(6,80,63,0.1)] px-5 py-4 sm:px-7">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[var(--brand-green-700)] px-6 py-2 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(6,80,63,0.22)] transition hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Opening WhatsApp…" : "Continue on WhatsApp"}
              </button>
              <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
                Your booking isn&apos;t confirmed until you complete secure payment via the link we send.
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
