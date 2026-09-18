import { useState } from "react";
import type { CSSProperties } from "react";
import type { DirectPaymentMethod } from "@/lib/direct-booking/types";
import { formatBookingDate, slotTime } from "@/lib/booking-engine/format";
import type { Locale } from "@/lib/i18n/types";
import { supportedLocales } from "@/lib/i18n/types";
import type { MarcoConfig, MarcoTour } from "./types";
import { buildMarcoWhatsAppUrl } from "./whatsapp";
import { getDirectBookingCopy } from "./direct-booking-copy";
import { useLiveAvailability } from "./useLiveAvailability";

type DirectBookingCardProps = {
  tour: MarcoTour;
  config: MarcoConfig;
  locale: string;
};

type PayChoice = Extract<DirectPaymentMethod, "bizum" | "bank" | "gift">;
type Status = "idle" | "submitting" | "sent" | "error";

function toLocale(value: string): Locale {
  return (supportedLocales as string[]).includes(value) ? (value as Locale) : "en";
}

/**
 * Inline "Book direct with us" lead form. Used for both private/quote tours (no
 * fixed price) and fixed-price FareHarbor tours booked off-platform (pay by
 * Bizum/cash/gift card, no booking fee).
 *
 * For self-serve FareHarbor tours it shows a live date/time picker with real
 * remaining capacity, so the guest requests a genuine open slot; quote tours keep a
 * free-text date. Bizum/bank payments can optionally carry a payment reference —
 * never required, since nothing is due until the operator confirms. Captures the
 * essentials, POSTs to /api/direct-booking, and hands off to WhatsApp (the
 * guaranteed channel) so the guest is never blocked if email delivery fails. No
 * card data is collected here.
 */
export function DirectBookingCard({ tour, config, locale }: DirectBookingCardProps) {
  const copy = getDirectBookingCopy(locale);
  const loc = toLocale(locale);
  const payOptions: { value: PayChoice; label: string }[] = [
    { value: "bizum", label: copy.payBizum },
    { value: "bank", label: copy.payBank },
    { value: "gift", label: copy.payGift },
  ];

  const availability = useLiveAvailability(tour.fareHarborItemId ?? null);
  const usePicker = Boolean(tour.fareHarborItemId);

  const [leadName, setLeadName] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [groupSize, setGroupSize] = useState("2");
  const [payment, setPayment] = useState<PayChoice>("bizum");
  const [deposit, setDeposit] = useState(true);
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const showReference = payment === "bizum" || payment === "bank";

  // Self-serve tours resolve the date/time from the live picker; quote tours use
  // the free-text field.
  const pickedSlot = usePicker ? availability.selectedSlot : null;
  const pickerDateLabel =
    usePicker && availability.selectedDate
      ? formatBookingDate(availability.selectedDate, loc)
      : "";
  const pickerTimeLabel = pickedSlot ? slotTime(pickedSlot.startAt) : "";
  const dateSummary = usePicker
    ? [pickerDateLabel, pickerTimeLabel].filter(Boolean).join(" · ")
    : preferredDate.trim();
  const hasDate = usePicker ? Boolean(pickedSlot) : preferredDate.trim().length > 0;

  const canSubmit =
    leadName.trim().length > 0 &&
    leadContact.trim().length > 0 &&
    hasDate &&
    status !== "submitting";

  const paymentLabel =
    payOptions.find((option) => option.value === payment)?.label ?? payment;

  const whatsappHref = buildMarcoWhatsAppUrl(
    config.whatsapp,
    copy.whatsappLead({
      operator: config.operatorName,
      tourName: tour.name,
      name: leadName,
      date: dateSummary,
      guests: groupSize,
      payment: paymentLabel,
      deposit,
      reference: showReference ? reference.trim() : "",
    }),
  );

  async function handleSubmit() {
    if (!canSubmit) return;
    setStatus("submitting");

    const trimmedReference = showReference ? reference.trim() : "";
    const notes = [
      `Group size: ${groupSize}.`,
      `Payment preference: ${payment}${deposit ? " (deposit now, balance later)" : " (pay in full)"}.`,
      trimmedReference ? `Payment reference: ${trimmedReference}.` : null,
      tour.priceKnown
        ? "Requested via Isabel concierge (book direct, fixed-price tour)."
        : "Requested via Isabel concierge (private/quote tour).",
    ]
      .filter(Boolean)
      .join(" ");

    try {
      const response = await fetch("/api/direct-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourName: tour.name,
          dateLabel: usePicker ? pickerDateLabel : preferredDate.trim(),
          timeLabel: usePicker ? pickerTimeLabel || "To be confirmed" : "To be confirmed",
          paymentMethod: payment,
          guests: [{ label: "Lead guest", name: leadName.trim() }],
          leadName: leadName.trim(),
          leadContact: leadContact.trim(),
          notes,
          locale,
        }),
      });

      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const primaryStyle: CSSProperties = { backgroundColor: config.primaryColor };
  const accentText: CSSProperties = { color: config.accentColor };

  if (status === "sent") {
    return (
      <div className="flex justify-start">
        <div className="w-full max-w-[280px] rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
          <p style={accentText} className="text-[10px] font-medium uppercase tracking-[0.15em]">
            {copy.sentEyebrow}
          </p>
          <h3 className="font-display mt-1.5 text-base font-semibold text-[#1A3A2A]">
            {copy.sentHeading(config.operatorName)}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[#666]">
            {tour.priceKnown
              ? copy.sentBodyFixed(config.operatorName)
              : copy.sentBodyQuote(config.operatorName)}
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-[10px] bg-[#25D366] px-4 text-sm font-semibold text-white"
          >
            {copy.continueWhatsapp}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[280px] rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
        <p style={accentText} className="text-[10px] font-medium uppercase tracking-[0.15em]">
          {copy.eyebrow}
        </p>
        <h3 className="font-display mt-1.5 text-base font-semibold leading-tight text-[#1A3A2A]">
          {tour.name}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-[#666]">
          {tour.priceKnown
            ? copy.introFixed(tour.price, config.operatorName)
            : copy.introQuote(config.operatorName)}
        </p>

        <div className="mt-3 flex flex-col gap-2.5">
          <label className="flex flex-col gap-1 text-[11px] font-medium text-[#8A7F72]">
            {copy.nameLabel}
            <input
              type="text"
              value={leadName}
              onChange={(event) => setLeadName(event.target.value)}
              autoComplete="name"
              className="min-h-[44px] rounded-[10px] border border-[rgba(0,0,0,0.12)] px-3 text-sm text-[#1A3A2A] outline-none focus:border-[#2C5F3F]"
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-medium text-[#8A7F72]">
            {copy.contactLabel}
            <input
              type="text"
              value={leadContact}
              onChange={(event) => setLeadContact(event.target.value)}
              autoComplete="email"
              className="min-h-[44px] rounded-[10px] border border-[rgba(0,0,0,0.12)] px-3 text-sm text-[#1A3A2A] outline-none focus:border-[#2C5F3F]"
            />
          </label>

          {usePicker ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[#8A7F72]">{copy.pickDate}</span>
                {availability.status === "loading" ? (
                  <p className="text-xs text-[#666]">{copy.checkingLive}</p>
                ) : availability.bookableDates.length === 0 ? (
                  <p className="text-xs text-[#666]">{copy.noTimes}</p>
                ) : (
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {availability.bookableDates.slice(0, 14).map((date) => {
                      const active = availability.selectedDate === date;
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => availability.selectDate(date)}
                          aria-pressed={active}
                          style={
                            active ? { backgroundColor: config.primaryColor, color: "#fff" } : undefined
                          }
                          className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-[10px] border px-2.5 text-xs font-medium transition active:scale-95 ${
                            active ? "border-transparent" : "border-[rgba(0,0,0,0.12)] text-[#1A3A2A]"
                          }`}
                        >
                          {formatBookingDate(date, loc)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {availability.status === "ready" && availability.bookableDates.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-[#8A7F72]">{copy.pickTime}</span>
                  {availability.slotsLoading ? (
                    <p className="text-xs text-[#666]">{copy.checkingLive}</p>
                  ) : availability.slots.length === 0 ? (
                    <p className="text-xs text-[#666]">{copy.noTimes}</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {availability.slots.map((slot) => {
                        const active = pickedSlot?.availabilityId === slot.availabilityId;
                        return (
                          <button
                            key={slot.availabilityId}
                            type="button"
                            onClick={() => availability.selectSlot(slot.availabilityId)}
                            aria-pressed={active}
                            style={
                              active ? { backgroundColor: config.primaryColor, color: "#fff" } : undefined
                            }
                            className={`min-h-[44px] rounded-[10px] border px-3 text-xs font-medium transition active:scale-95 ${
                              active ? "border-transparent" : "border-[rgba(0,0,0,0.12)] text-[#1A3A2A]"
                            }`}
                          >
                            {slotTime(slot.startAt)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {pickedSlot ? (
                    <p className="text-[11px] text-[#666]">
                      {availability.liveCapacity
                        ? availability.liveCapacity.isSoldOut
                          ? copy.soldOut
                          : copy.spotsLeft(availability.liveCapacity.remainingCapacity)
                        : copy.checkingLive}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <label className="flex w-[88px] flex-col gap-1 text-[11px] font-medium text-[#8A7F72]">
                {copy.guestsLabel}
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={40}
                  value={groupSize}
                  onChange={(event) => setGroupSize(event.target.value)}
                  className="min-h-[44px] rounded-[10px] border border-[rgba(0,0,0,0.12)] px-3 text-sm text-[#1A3A2A] outline-none focus:border-[#2C5F3F]"
                />
              </label>
            </div>
          ) : (
            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1 text-[11px] font-medium text-[#8A7F72]">
                {copy.dateLabel}
                <input
                  type="text"
                  value={preferredDate}
                  onChange={(event) => setPreferredDate(event.target.value)}
                  placeholder={copy.datePlaceholder}
                  className="min-h-[44px] rounded-[10px] border border-[rgba(0,0,0,0.12)] px-3 text-sm text-[#1A3A2A] outline-none focus:border-[#2C5F3F]"
                />
              </label>
              <label className="flex w-[72px] flex-col gap-1 text-[11px] font-medium text-[#8A7F72]">
                {copy.guestsLabel}
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={40}
                  value={groupSize}
                  onChange={(event) => setGroupSize(event.target.value)}
                  className="min-h-[44px] rounded-[10px] border border-[rgba(0,0,0,0.12)] px-3 text-sm text-[#1A3A2A] outline-none focus:border-[#2C5F3F]"
                />
              </label>
            </div>
          )}

          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-[11px] font-medium text-[#8A7F72]">{copy.paymentLegend}</legend>
            <div className="flex flex-wrap gap-1.5">
              {payOptions.map((option) => {
                const active = payment === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPayment(option.value)}
                    aria-pressed={active}
                    style={active ? { backgroundColor: config.primaryColor, color: "#fff" } : undefined}
                    className={`min-h-[36px] rounded-full border px-3 text-xs font-medium transition active:scale-95 ${
                      active ? "border-transparent" : "border-[rgba(0,0,0,0.12)] text-[#666]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {showReference ? (
            <label className="flex flex-col gap-1 text-[11px] font-medium text-[#8A7F72]">
              {copy.referenceLabel}
              <input
                type="text"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder={copy.referencePlaceholder}
                className="min-h-[44px] rounded-[10px] border border-[rgba(0,0,0,0.12)] px-3 text-sm text-[#1A3A2A] outline-none focus:border-[#2C5F3F]"
              />
              <span className="text-[10px] font-normal leading-snug text-[#8A7F72]">
                {copy.referenceHint(config.operatorName)}
              </span>
            </label>
          ) : null}

          <label className="flex items-center gap-2 text-xs text-[#666]">
            <input
              type="checkbox"
              checked={deposit}
              onChange={(event) => setDeposit(event.target.checked)}
              className="h-4 w-4"
            />
            {copy.depositLabel}
          </label>

          {status === "error" ? (
            <p className="text-xs text-[#B4232A]">{copy.errorMsg}</p>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={primaryStyle}
            className="min-h-[44px] w-full rounded-[10px] px-3 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
          >
            {status === "submitting" ? copy.submittingLabel : copy.submitLabel}
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] w-full items-center justify-center rounded-[10px] bg-[#F2EDE6] px-4 text-sm font-medium text-[#1A3A2A]"
          >
            {copy.whatsappFallback(config.operatorName)}
          </a>
        </div>
      </div>
    </div>
  );
}
