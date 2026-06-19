"use client";

import { useMemo, useState } from "react";
import type { SiteCopy } from "@/lib/i18n/types";
import { directPaymentDetails } from "@/lib/payments/direct-payment-details";

type DirectCopy = SiteCopy["book"]["experience"]["direct"];

export type DirectGuest = {
  /** Stable row id within the request. */
  id: string;
  /** Customer-type label, e.g. "Adult". */
  label: string;
};

type PaymentMethod = "bizum" | "cash" | "bank" | "gift";

/** UI state for the ParaUsted gift-card verification scaffold. */
type GiftStatus = "idle" | "checking" | "invalid" | "pending" | "verified" | "unavailable";

type DirectBookingPanelProps = {
  copy: DirectCopy;
  tourName: string;
  dateLabel: string;
  timeLabel: string;
  guests: DirectGuest[];
  totalLabel: string;
  whatsappNumber: string;
  requiresId: boolean;
  onBack: () => void;
};

const fieldClass =
  "min-h-11 w-full rounded-[0.9rem] border border-[color:var(--border-soft)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand-green-500)] focus:ring-2 focus:ring-[color:var(--brand-green-100)]";

const labelClass =
  "mb-1.5 block text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-green-700)]";

export function DirectBookingPanel({
  copy,
  tourName,
  dateLabel,
  timeLabel,
  guests,
  totalLabel,
  whatsappNumber,
  requiresId,
  onBack,
}: DirectBookingPanelProps) {
  const [payment, setPayment] = useState<PaymentMethod>("bizum");
  const [names, setNames] = useState<Record<string, string>>({});
  const [ids, setIds] = useState<Record<string, string>>({});
  const [leadName, setLeadName] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [notes, setNotes] = useState("");
  const [proof, setProof] = useState("");
  const [giftCode, setGiftCode] = useState("");
  const [giftStatus, setGiftStatus] = useState<GiftStatus>("idle");

  const paymentOptions = useMemo(
    () =>
      [
        { value: "bizum" as const, label: copy.paymentBizum },
        { value: "cash" as const, label: copy.paymentCash },
        { value: "bank" as const, label: copy.paymentBank },
        { value: "gift" as const, label: copy.paymentGift },
      ],
    [copy],
  );

  // ParaUsted verification skeleton: validates the code shape server-side.
  // In V1 it never auto-redeems; Carlos confirms manually (status "pending").
  async function verifyGift() {
    const code = giftCode.trim();
    if (code.length === 0) return;
    setGiftStatus("checking");
    try {
      const response = await fetch("/api/parausted/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        setGiftStatus("unavailable");
        return;
      }
      const result = (await response.json()) as { status: string };
      if (result.status === "invalid_format") setGiftStatus("invalid");
      else if (result.status === "verified") setGiftStatus("verified");
      else if (result.status === "pending") setGiftStatus("pending");
      else setGiftStatus("unavailable");
    } catch {
      setGiftStatus("unavailable");
    }
  }

  const giftStatusMessage = useMemo(() => {
    switch (giftStatus) {
      case "checking":
        return copy.giftChecking;
      case "pending":
        return copy.giftPending;
      case "invalid":
        return copy.giftInvalid;
      case "unavailable":
        return copy.giftUnavailable;
      case "verified":
        return copy.giftVerified;
      default:
        return "";
    }
  }, [giftStatus, copy]);

  const isValid = useMemo(() => {
    if (!leadContact.trim()) return false;
    return guests.every((guest) => {
      const hasName = (names[guest.id] ?? "").trim().length > 0;
      const hasId = !requiresId || (ids[guest.id] ?? "").trim().length > 0;
      return hasName && hasId;
    });
  }, [guests, names, ids, leadContact, requiresId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    const paymentLabel = paymentOptions.find((option) => option.value === payment)?.label ?? "";

    const guestLines = guests.map((guest, index) => {
      const name = (names[guest.id] ?? "").trim();
      const idValue = (ids[guest.id] ?? "").trim();
      const idPart = requiresId && idValue ? ` — ${copy.paxId}: ${idValue}` : "";
      return `${index + 1}. ${guest.label}: ${name}${idPart}`;
    });

    const lines = [
      `${copy.title} — ${tourName}`,
      `${dateLabel} · ${timeLabel}`,
      `${copy.paymentLabel}: ${paymentLabel}`,
      "",
      `${copy.paxHeading}:`,
      ...guestLines,
      "",
      `${totalLabel}`,
    ];

    if (leadName.trim()) lines.push(`${copy.leadName}: ${leadName.trim()}`);
    lines.push(`${copy.leadContact}: ${leadContact.trim()}`);
    if (payment === "gift" && giftCode.trim()) {
      lines.push(`${copy.giftCodeLabel}: ${giftCode.trim()}`);
    }
    if (proof.trim()) lines.push(`${copy.proofLabel}: ${proof.trim()}`);
    if (notes.trim()) lines.push(`${copy.notes}: ${notes.trim()}`);

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-[calc(var(--radius-card))] border border-[color:var(--border-soft)] bg-[var(--surface-cream)] p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">{copy.title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{copy.intro}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-[color:var(--border-soft)] px-4 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-white"
        >
          {copy.back}
        </button>
      </div>

      <fieldset className="mt-4">
        <legend className={labelClass}>{copy.paymentLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {paymentOptions.map((option) => {
            const active = payment === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setPayment(option.value)}
                className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition ${
                  active
                    ? "border-transparent bg-[var(--brand-green-700)] text-white"
                    : "border-[color:var(--border-soft)] bg-[var(--surface-card)] text-[var(--foreground)] hover:border-[var(--brand-green-500)]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {payment !== "gift" ? (
        <div className="mt-4 rounded-[0.9rem] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-3 text-sm leading-6 text-[var(--foreground)]">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-green-700)]">
            {copy.payHeading}
          </p>
          {payment === "bizum" ? (
            <p>
              {copy.bizumLabel}:{" "}
              <span className="font-semibold">{directPaymentDetails.bizumNumber}</span>
            </p>
          ) : null}
          {payment === "bank" ? (
            <div className="space-y-0.5">
              <p>
                {copy.bankHolderLabel}:{" "}
                <span className="font-semibold">{directPaymentDetails.bankHolder}</span>
              </p>
              <p>
                {copy.bankIbanLabel}:{" "}
                <span className="font-semibold tabular-nums">{directPaymentDetails.bankIban}</span>
              </p>
              <p>
                {copy.bankBicLabel}:{" "}
                <span className="font-semibold">{directPaymentDetails.bankBic}</span>
              </p>
            </div>
          ) : null}
          {payment === "cash" ? (
            <p className="text-[var(--text-muted)]">{copy.cashNote}</p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-[0.9rem] border border-[color:var(--brand-gold-500)] bg-[var(--surface-card)] p-3">
          <p className={labelClass}>{copy.giftHeading}</p>
          <label className="block">
            <span className="sr-only">{copy.giftCodeLabel}</span>
            <input
              className={fieldClass}
              value={giftCode}
              onChange={(event) => {
                setGiftCode(event.target.value);
                setGiftStatus("idle");
              }}
              placeholder={copy.giftCodePlaceholder}
              autoComplete="off"
              inputMode="text"
            />
          </label>
          <button
            type="button"
            onClick={verifyGift}
            disabled={giftCode.trim().length === 0 || giftStatus === "checking"}
            className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--brand-green-700)] px-4 text-sm font-semibold text-[var(--brand-green-700)] transition hover:bg-[var(--brand-green-100)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {giftStatus === "checking" ? copy.giftChecking : copy.giftRedeem}
          </button>
          {giftStatusMessage ? (
            <p
              className={`mt-2 text-xs font-semibold ${
                giftStatus === "invalid" || giftStatus === "unavailable"
                  ? "text-[var(--brand-gold-500)]"
                  : "text-[var(--brand-green-700)]"
              }`}
            >
              {giftStatusMessage}
            </p>
          ) : null}
          <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{copy.giftNote}</p>
        </div>
      )}

      <div className="mt-5">
        <p className={labelClass}>{copy.paxHeading}</p>
        <div className="space-y-3">
          {guests.map((guest, index) => (
            <div
              key={guest.id}
              className="rounded-[0.9rem] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-3"
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {guest.label} {index + 1}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="sr-only">{copy.paxName}</span>
                  <input
                    className={fieldClass}
                    value={names[guest.id] ?? ""}
                    onChange={(event) =>
                      setNames((prev) => ({ ...prev, [guest.id]: event.target.value }))
                    }
                    placeholder={copy.paxName}
                    autoComplete="off"
                    required
                  />
                </label>
                {requiresId ? (
                  <label className="block">
                    <span className="sr-only">{copy.paxId}</span>
                    <input
                      className={fieldClass}
                      value={ids[guest.id] ?? ""}
                      onChange={(event) =>
                        setIds((prev) => ({ ...prev, [guest.id]: event.target.value }))
                      }
                      placeholder={copy.paxId}
                      autoComplete="off"
                      required
                    />
                  </label>
                ) : null}
              </div>
              {requiresId ? (
                <p className="mt-1.5 text-xs leading-5 text-[var(--text-muted)]">{copy.paxIdNote}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>{copy.leadName}</span>
          <input
            className={fieldClass}
            value={leadName}
            onChange={(event) => setLeadName(event.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className={labelClass}>{copy.leadContact}</span>
          <input
            className={fieldClass}
            value={leadContact}
            onChange={(event) => setLeadContact(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>{copy.notes}</span>
          <textarea
            className={`${fieldClass} min-h-24`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={copy.notesPlaceholder}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>{copy.proofLabel}</span>
          <input
            className={fieldClass}
            value={proof}
            onChange={(event) => setProof(event.target.value)}
            placeholder={copy.proofPlaceholder}
            autoComplete="off"
          />
          <span className="mt-1.5 block text-xs leading-5 text-[var(--text-muted)]">
            {copy.proofNote}
          </span>
        </label>
      </div>

      <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">{copy.consent}</p>

      <button
        type="submit"
        disabled={!isValid}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[1.1rem] bg-[var(--brand-green-700)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-green-900)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {copy.submit}
      </button>
    </form>
  );
}
