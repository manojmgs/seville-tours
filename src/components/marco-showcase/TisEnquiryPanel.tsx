"use client";

import { useId, useState } from "react";
import type { Dispatch, FormEvent } from "react";
import type {
  TisConversationAction,
  TisContactDetails,
  TisEnquiry,
  TisSavedJourney,
} from "@/lib/marco/showcase/tis-conversation-state";

type TisEnquiryPanelProps = {
  savedJourney: TisSavedJourney | null;
  enquiry: TisEnquiry | null;
  itineraryTitle: string;
  dispatch: Dispatch<TisConversationAction>;
};

function newJourneyReference(): string {
  return `PU-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function TisEnquiryPanel({
  savedJourney,
  enquiry,
  itineraryTitle,
  dispatch,
}: TisEnquiryPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [contact, setContact] = useState<TisContactDetails>({ name: "", email: "", phone: "" });
  const [shareNote, setShareNote] = useState<string | null>(null);
  const fieldId = useId();

  const canSend = contact.name.trim().length > 0 && contact.email.trim().length > 0;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;
    dispatch({ type: "sendEnquiry", contact, at: new Date().toISOString() });
    setFormOpen(false);
  };

  const share = async () => {
    const shareData = {
      title: itineraryTitle,
      text: "Here is the trip I am putting together. Tell me what you think before I send it.",
      url: typeof window === "undefined" ? "" : window.location.href,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        setShareNote("Shared.");
        return;
      } catch {
        setShareNote("Sharing was cancelled.");
        return;
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setShareNote("Link copied. Paste it to a friend.");
      return;
    }
    setShareNote("Sharing is not available in this browser.");
  };

  return (
    <section
      className="mt-5 rounded-[1.25rem] border border-[var(--brand-green-700)]/30 bg-white p-5 print:hidden"
      aria-labelledby="tis-enquiry-heading"
    >
      <h3 id="tis-enquiry-heading" className="font-display text-xl font-semibold text-[var(--brand-green-900)]">
        Take it further
      </h3>

      {enquiry ? (
        <div className="mt-3 rounded-[10px] border border-[var(--brand-green-700)]/25 bg-[#f6faf7] p-4">
          <p className="text-sm font-semibold text-[var(--brand-green-900)]">
            Enquiry prepared for {contactLabel(enquiry.contact)}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            The operator would receive your Journey Brief, your saved possibilities and your own words.
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#6b531d]">
            Demonstration only — no message left this browser and no operator has been contacted.
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Send this to the operator, keep it for later, or ask someone else what they think first.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {!enquiry ? (
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            aria-expanded={formOpen}
            className="min-h-11 rounded-[10px] bg-[var(--brand-green-900)] px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold-500)]"
          >
            Send enquiry to the operator
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 rounded-[10px] border border-[var(--brand-green-700)]/40 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          Download as PDF
        </button>
        <button
          type="button"
          onClick={share}
          className="min-h-11 rounded-[10px] border border-[var(--brand-green-700)]/40 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          Share with a friend
        </button>
        <button
          type="button"
          disabled={Boolean(savedJourney)}
          onClick={() =>
            dispatch({ type: "saveJourney", reference: newJourneyReference(), at: new Date().toISOString() })
          }
          className="min-h-11 rounded-[10px] border border-[var(--brand-green-700)]/40 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
        >
          {savedJourney ? `Journey saved · ${savedJourney.reference}` : "Save my journey"}
        </button>
      </div>

      {shareNote ? (
        <p aria-live="polite" className="mt-2 text-sm text-[var(--text-muted)]">
          {shareNote}
        </p>
      ) : null}

      {savedJourney ? (
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Saved as <span className="font-semibold text-[var(--brand-green-900)]">{savedJourney.reference}</span>. In the
          product this is where a journey starts building over years. In this demonstration it lives in this browser only.
        </p>
      ) : null}

      {formOpen && !enquiry ? (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-[10px] border border-[var(--border-soft)] bg-[#faf8f5] p-4">
          <p className="text-sm leading-6 text-[var(--brand-green-900)]">
            The operator needs a way to reply. We ask for this only now, at the point it is actually needed.
          </p>
          <Field
            id={`${fieldId}-name`}
            label="Your name"
            value={contact.name}
            autoComplete="name"
            onChange={(name) => setContact((current) => ({ ...current, name }))}
          />
          <Field
            id={`${fieldId}-email`}
            label="Email"
            type="email"
            inputMode="email"
            value={contact.email}
            autoComplete="email"
            onChange={(email) => setContact((current) => ({ ...current, email }))}
          />
          <Field
            id={`${fieldId}-phone`}
            label="Phone or WhatsApp (optional)"
            type="tel"
            inputMode="tel"
            value={contact.phone}
            autoComplete="tel"
            onChange={(phone) => setContact((current) => ({ ...current, phone }))}
          />
          <button
            type="submit"
            disabled={!canSend}
            className="min-h-11 w-full rounded-[10px] bg-[var(--brand-green-900)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold-500)] sm:w-auto"
          >
            Send to the operator
          </button>
          <p className="text-xs leading-5 text-[var(--text-muted)]">
            Demonstration only. Nothing is transmitted and nothing is stored on a server.
          </p>
        </form>
      ) : null}
    </section>
  );
}

function contactLabel(contact: TisContactDetails): string {
  return contact.phone.trim().length > 0
    ? `${contact.name} · ${contact.email} · ${contact.phone}`
    : `${contact.name} · ${contact.email}`;
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "email" | "tel";
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[var(--brand-green-900)]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-[10px] border border-[var(--border-soft)] bg-white px-3 py-2 text-base text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
      />
    </div>
  );
}
