"use client";

import { useMemo, useState } from "react";
import type { SiteCopy, Locale } from "@/lib/i18n/types";
import { isGiftCardCodeFormatValid } from "@/lib/parausted/redeem";
import { directPaymentDetails } from "@/lib/payments/direct-payment-details";

type DirectCopy = SiteCopy["book"]["experience"]["direct"];

export type DirectGuest = {
  /** Stable row id within the request. */
  id: string;
  /** Customer-type label, e.g. "Adult". */
  label: string;
};

type PaymentMethod = "bizum" | "cash" | "bank" | "gift";

/**
 * UI state for the ParaUsted gift-card verification.
 *
 * Verification is READ-ONLY and advisory: an eligible result does not reserve funds
 * or guarantee later redemption. The authoritative full-balance redemption happens
 * only after booking confirmation (future operator/confirmed-booking commit path).
 */
type GiftState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "verified"; maskedCode: string; balanceCents: number }
  | { kind: "invalid-format" }
  | { kind: "inactive" }
  | { kind: "error" };

type VerifyResponse =
  | { eligible: true; maskedCode: string; balanceCents: number }
  | { eligible: false };

const eurFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

/** Formats integer cents to a EUR string at the UI boundary only. */
function formatEur(amountCents: number): string {
  return eurFormatter.format(amountCents / 100);
}

type DirectBookingPanelProps = {
  copy: DirectCopy;
  tourName: string;
  dateLabel: string;
  timeLabel: string;
  guests: DirectGuest[];
  totalLabel: string;
  whatsappNumber: string;
  requiresId: boolean;
  locale: Locale;
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
  locale,
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
  const [giftState, setGiftState] = useState<GiftState>({ kind: "idle" });

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

  // Clear any prior verification when the booking context changes, so a stale
  // "eligible" result can never be carried across a different tour/date/time.
  // Adjusting state during render (guarded by a changed key) is the React-recommended
  // pattern for deriving state from changing props. Code changes are cleared inline
  // by the input's onChange.
  const bookingContextKey = `${tourName}|${dateLabel}|${timeLabel}`;
  const [lastBookingContextKey, setLastBookingContextKey] = useState(bookingContextKey);
  if (bookingContextKey !== lastBookingContextKey) {
    setLastBookingContextKey(bookingContextKey);
    setGiftState({ kind: "idle" });
  }

  // Read-only ParaUsted verification: the route handler holds the partner token and
  // performs a GET; this only sends the code and renders the advisory result. It
  // never redeems and never reserves funds.
  async function verifyGift() {
    const code = giftCode.trim();
    if (code.length === 0 || giftState.kind === "checking") return;
    if (!isGiftCardCodeFormatValid(code)) {
      setGiftState({ kind: "invalid-format" });
      return;
    }
    setGiftState({ kind: "checking" });
    try {
      const response = await fetch("/api/parausted/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = (await response.json()) as VerifyResponse;
      if (response.ok && result.eligible) {
        setGiftState({
          kind: "verified",
          maskedCode: result.maskedCode,
          balanceCents: result.balanceCents,
        });
      } else if (response.ok) {
        setGiftState({ kind: "inactive" });
      } else {
        setGiftState({ kind: "error" });
      }
    } catch {
      setGiftState({ kind: "error" });
    }
  }

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
    // The raw voucher code is intentionally included in the operator WhatsApp/email
    // hand-off: Carlos redeems it MANUALLY in the ParaUsted dashboard (no automated
    // commit exists yet). This guest-initiated message to their own operator is the
    // only place a full code leaves the client. Do not log it or send it elsewhere.
    if (payment === "gift" && giftCode.trim()) {
      lines.push(`${copy.giftCodeLabel}: ${giftCode.trim()}`);
    }
    if (proof.trim()) lines.push(`${copy.proofLabel}: ${proof.trim()}`);
    if (notes.trim()) lines.push(`${copy.notes}: ${notes.trim()}`);

    // Notify the operator by email in parallel (fire-and-forget). WhatsApp stays the
    // guaranteed hand-off, so email failure must never block the guest.
    //
    // Gift verification here is READ-ONLY and advisory. Carlos re-verifies and
    // commits only in the authenticated ParaUsted dashboard. This browser state is
    // never redemption authorization or proof of remaining balance, and Seville
    // Tours owns no redemption state or commit route.
    void fetch("/api/direct-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tourName,
        dateLabel,
        timeLabel,
        paymentMethod: payment,
        guests: guests.map((guest) => ({
          label: guest.label,
          name: (names[guest.id] ?? "").trim(),
          idNumber: requiresId ? (ids[guest.id] ?? "").trim() || undefined : undefined,
        })),
        totalLabel,
        leadName: leadName.trim() || undefined,
        leadContact: leadContact.trim(),
        // Raw code is the operator hand-off for MANUAL redemption; not a commit trigger.
        giftCode: payment === "gift" ? giftCode.trim() || undefined : undefined,
        giftVerificationObserved:
          payment === "gift" ? giftState.kind === "verified" : undefined,
        paymentProof: proof.trim() || undefined,
        notes: notes.trim() || undefined,
        locale,
      }),
    }).catch(() => {});

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
                setGiftState({ kind: "idle" });
              }}
              placeholder={copy.giftCodePlaceholder}
              autoComplete="off"
              inputMode="text"
            />
          </label>
          <button
            type="button"
            onClick={verifyGift}
            disabled={giftCode.trim().length === 0 || giftState.kind === "checking"}
            className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--brand-green-700)] px-4 text-sm font-semibold text-[var(--brand-green-700)] transition hover:bg-[var(--brand-green-100)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {giftState.kind === "checking" ? copy.giftChecking : copy.giftRedeem}
          </button>
          {giftState.kind === "verified" ? (
            <div className="mt-3 rounded-[0.8rem] border border-[var(--brand-green-700)] bg-[var(--brand-green-100)] p-3 text-xs text-[var(--brand-green-700)]">
              <p className="text-sm font-extrabold">{copy.giftVerified}</p>
              <dl className="mt-2 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--text-muted)]">{copy.giftCodeMaskedLabel}</dt>
                  <dd className="font-semibold tabular-nums">{giftState.maskedCode}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--text-muted)]">{copy.giftBalanceLabel}</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatEur(giftState.balanceCents)}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 leading-5 text-[var(--brand-green-700)]">{copy.giftEligibleNote}</p>
            </div>
          ) : null}
          {giftState.kind === "error" ? (
            <p className="mt-2 text-xs font-semibold text-[var(--brand-gold-500)]">
              {copy.giftVerifyError}
            </p>
          ) : null}
          {giftState.kind === "invalid-format" ? (
            <p className="mt-2 text-xs font-semibold text-[var(--brand-gold-500)]">
              {copy.giftInvalidFormat}
            </p>
          ) : null}
          {giftState.kind === "inactive" ? (
            <p className="mt-2 text-xs font-semibold text-[var(--brand-gold-500)]">
              {copy.giftInactive}
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
