"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { siteCopy } from "@/lib/i18n/site";
import type { Locale } from "@/lib/i18n/types";
import type {
  BookingDate,
  BookingExperience as BookingExperienceData,
  SlotLiveCapacity,
} from "@/lib/fareharbor/types";
import {
  durationMinutes,
  formatBookingDate,
  formatMoneyCents,
  slotTime,
} from "@/lib/fareharbor/format";
import { BookingCalendar } from "./BookingCalendar";
import { DirectBookingPanel, type DirectGuest } from "./DirectBookingPanel";

type BookingExperienceProps = {
  itemId: string;
  locale: Locale;
  tourName: string;
  paraustedUrl: string;
  whatsappNumber: string;
};

type LoadState = "loading" | "ready" | "empty";

const chipBase =
  "min-h-11 shrink-0 rounded-[0.9rem] border px-4 py-2 text-sm font-semibold transition";
const chipActive = "border-transparent bg-[var(--brand-green-700)] text-white shadow-sm";
const chipIdle =
  "border-[color:var(--border-soft)] bg-[var(--surface-card)] text-[var(--foreground)] hover:border-[var(--brand-green-500)]";

export function BookingExperience({
  itemId,
  locale,
  tourName,
  paraustedUrl,
  whatsappNumber,
}: BookingExperienceProps) {
  const copy = siteCopy(locale).book.experience;

  const [status, setStatus] = useState<LoadState>("loading");
  const [data, setData] = useState<BookingExperienceData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slotsData, setSlotsData] = useState<BookingDate | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [liveCapacity, setLiveCapacity] = useState<SlotLiveCapacity | null>(null);
  const [resolvedSlotId, setResolvedSlotId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`/api/fareharbor/availability?itemId=${itemId}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setStatus("empty");
          return;
        }
        const experience = (await response.json()) as BookingExperienceData;
        if (experience.bookableDates.length === 0) {
          setStatus("empty");
          return;
        }

        const defaultType =
          experience.customerTypes.find((type) => /adult/i.test(type.label)) ??
          experience.customerTypes[0];

        setData(experience);
        setSelectedDate(experience.bookableDates[0]);
        setCounts(defaultType ? { [defaultType.rateId]: 1 } : {});
        setStatus("ready");
      } catch {
        if (!controller.signal.aborted) setStatus("empty");
      }
    }

    void load();
    return () => controller.abort();
  }, [itemId]);

  // Load time slots for the chosen date on demand, then auto-select the first one.
  // State only updates after the request resolves to avoid cascading renders.
  useEffect(() => {
    if (selectedDate === null) return;

    const controller = new AbortController();
    const date = selectedDate;

    async function loadSlots() {
      try {
        const response = await fetch(
          `/api/fareharbor/slots?itemId=${itemId}&date=${date}`,
          { signal: controller.signal },
        );
        const next: BookingDate = response.ok
          ? ((await response.json()) as BookingDate)
          : { date, slots: [] };
        if (controller.signal.aborted) return;
        setSlotsData(next);
        setSelectedSlotId(next.slots[0]?.availabilityId ?? null);
        setPanelOpen(false);
      } catch {
        if (controller.signal.aborted) return;
        setSlotsData({ date, slots: [] });
        setSelectedSlotId(null);
      }
    }

    void loadSlots();
    return () => controller.abort();
  }, [itemId, selectedDate]);

  // Fetch real-time capacity for the selected slot (fresh, never cached).
  // All state updates happen after the request resolves to avoid cascading renders.
  useEffect(() => {
    if (selectedSlotId === null) return;

    const controller = new AbortController();
    const slotId = selectedSlotId;

    async function loadLive() {
      try {
        const response = await fetch(
          `/api/fareharbor/live?itemId=${itemId}&availabilityId=${slotId}`,
          { signal: controller.signal },
        );
        const next = response.ok ? ((await response.json()) as SlotLiveCapacity) : null;
        if (controller.signal.aborted) return;
        setLiveCapacity(next);
        setResolvedSlotId(slotId);
      } catch {
        if (controller.signal.aborted) return;
        setLiveCapacity(null);
        setResolvedSlotId(slotId);
      }
    }

    void loadLive();
    return () => controller.abort();
  }, [itemId, selectedSlotId]);

  const slotsLoading = selectedDate !== null && slotsData?.date !== selectedDate;

  const activeSlots = useMemo(
    () => (slotsData?.date === selectedDate ? slotsData.slots : []),
    [slotsData, selectedDate],
  );

  const selectedSlot = useMemo(
    () => activeSlots.find((slot) => slot.availabilityId === selectedSlotId) ?? null,
    [activeSlots, selectedSlotId],
  );

  const totalGuests = useMemo(
    () => Object.values(counts).reduce((sum, count) => sum + count, 0),
    [counts],
  );

  const totalCents = useMemo(() => {
    if (!data) return 0;
    return data.customerTypes.reduce(
      (sum, type) => sum + (counts[type.rateId] ?? 0) * type.basePriceCents,
      0,
    );
  }, [data, counts]);

  const fromCents = useMemo(() => {
    if (!data) return 0;
    const prices = data.customerTypes
      .map((type) => type.basePriceCents)
      .filter((cents) => cents > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [data]);

  const liveForSlot =
    liveCapacity && liveCapacity.availabilityId === selectedSlotId ? liveCapacity : null;

  const capacity = liveForSlot
    ? liveForSlot.remainingCapacity
    : selectedSlot?.remainingCapacity ?? null;
  const isSoldOut = liveForSlot?.isSoldOut ?? false;
  const isCheckingCapacity = Boolean(selectedSlot) && resolvedSlotId !== selectedSlotId;
  const canBook = Boolean(selectedSlot) && totalGuests > 0 && !isSoldOut;

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedSlotId(null);
    setPanelOpen(false);
  }, []);

  const adjustCount = useCallback(
    (rateId: number, delta: number) => {
      setPanelOpen(false);
      setCounts((prev) => {
        const next = Math.max((prev[rateId] ?? 0) + delta, 0);
        if (delta > 0 && capacity !== null && totalGuests >= capacity) return prev;
        return { ...prev, [rateId]: next };
      });
    },
    [capacity, totalGuests],
  );

  const guests: DirectGuest[] = useMemo(() => {
    if (!data) return [];
    return data.customerTypes.flatMap((type) =>
      Array.from({ length: counts[type.rateId] ?? 0 }, (_, index) => ({
        id: `${type.rateId}-${index}`,
        label: type.label,
      })),
    );
  }, [data, counts]);

  const requiresId = useMemo(
    () => Boolean(data?.perPaxFields.some((field) => field.key === "pax-id")),
    [data],
  );

  if (status === "loading") {
    return (
      <div className="mt-6 rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-6">
        <div className="loading-shimmer h-4 w-40 rounded bg-[var(--surface-cream)]" />
        <p className="mt-4 text-sm text-[var(--text-muted)]">{copy.loading}</p>
      </div>
    );
  }

  if (status === "empty" || !data) {
    return (
      <div className="mt-6 rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-6">
        <p className="text-sm leading-7 text-[var(--text-muted)]">{copy.noDates}</p>
      </div>
    );
  }

  return (
    <div className="card-glow mt-6 rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
          {copy.eyebrow}
        </p>
        {fromCents > 0 ? (
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {copy.from} {formatMoneyCents(fromCents, data.currency, locale)}{" "}
            <span className="font-normal text-[var(--text-muted)]">{copy.perPerson}</span>
          </p>
        ) : null}
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{copy.liveNote}</p>

      {/* Date picker */}
      <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-green-700)]">
        {copy.selectDate}
      </p>
      <BookingCalendar
        bookableDates={data.bookableDates}
        selectedDate={selectedDate}
        locale={locale}
        prevLabel={copy.prevMonth}
        nextLabel={copy.nextMonth}
        onSelect={handleSelectDate}
      />
      {selectedDate ? (
        <p className="mt-2 text-xs font-semibold text-[var(--foreground)]">
          {formatBookingDate(selectedDate, locale)}
        </p>
      ) : (
        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{copy.chooseDateHint}</p>
      )}

      {/* Times */}
      {slotsLoading ? (
        <p className="mt-5 text-sm text-[var(--text-muted)]">{copy.loadingTimes}</p>
      ) : selectedDate && activeSlots.length === 0 ? (
        <p className="mt-5 text-sm text-[var(--text-muted)]">{copy.noTimesForDate}</p>
      ) : activeSlots.length > 0 ? (
        <>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-green-700)]">
            {copy.selectTime}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {activeSlots.map((slot) => {
              const active = selectedSlotId === slot.availabilityId;
              const minutes = durationMinutes(slot.startAt, slot.endAt);
              return (
                <button
                  key={slot.availabilityId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedSlotId(slot.availabilityId);
                    setPanelOpen(false);
                  }}
                  className={`${chipBase} ${active ? chipActive : chipIdle}`}
                >
                  <span>{slotTime(slot.startAt)}</span>
                  {minutes > 0 ? (
                    <span className={active ? "text-white/80" : "text-[var(--text-muted)]"}>
                      {" "}
                      · {minutes} {copy.minutesShort}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {isCheckingCapacity ? (
            <p className="mt-2 text-xs font-semibold text-[var(--text-muted)]">
              {copy.checkingSpots}
            </p>
          ) : isSoldOut ? (
            <p className="mt-2 text-xs font-semibold text-[var(--brand-gold-500)]">
              {copy.soldOut}
            </p>
          ) : capacity !== null ? (
            <p className="mt-2 text-xs font-semibold text-[var(--brand-green-700)]">
              {capacity <= 6 ? copy.limitedSpots : `${capacity} ${copy.spotsLeft}`}
            </p>
          ) : null}
        </>
      ) : null}

      {/* Guests */}
      <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-green-700)]">
        {copy.guests}
      </p>
      <div className="mt-2 space-y-2">
        {data.customerTypes.map((type) => {
          const count = counts[type.rateId] ?? 0;
          const atCapacity = capacity !== null && totalGuests >= capacity;
          return (
            <div
              key={type.rateId}
              className="flex items-center justify-between gap-3 rounded-[0.9rem] border border-[color:var(--border-soft)] bg-[var(--surface-cream)] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)]">{type.label}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {type.ageNote ? `${type.ageNote} · ` : ""}
                  {type.basePriceCents > 0
                    ? formatMoneyCents(type.basePriceCents, data.currency, locale)
                    : copy.free}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`-1 ${type.label}`}
                  onClick={() => adjustCount(type.rateId, -1)}
                  disabled={count === 0}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[var(--surface-card)] text-lg font-semibold text-[var(--foreground)] transition hover:border-[var(--brand-green-500)] disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-bold tabular-nums">{count}</span>
                <button
                  type="button"
                  aria-label={`+1 ${type.label}`}
                  onClick={() => adjustCount(type.rateId, 1)}
                  disabled={atCapacity}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[var(--surface-card)] text-lg font-semibold text-[var(--foreground)] transition hover:border-[var(--brand-green-500)] disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-5 rounded-[0.9rem] bg-[var(--brand-green-100)] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--brand-green-900)]">
            {copy.estimatedTotal}
          </span>
          <span className="text-lg font-bold text-[var(--brand-green-900)]">
            {formatMoneyCents(totalCents, data.currency, locale)}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-[var(--brand-green-900)]/80">{copy.totalNote}</p>
      </div>

      {/* CTAs */}
      <div className="mt-4 space-y-2.5">
        <div>
          <button
            type="button"
            onClick={() => setPanelOpen((open) => !open)}
            disabled={!canBook}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[1.1rem] bg-[var(--brand-green-700)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-green-900)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copy.bookDirect}
          </button>
          <p className="mt-1 px-1 text-xs leading-5 text-[var(--text-muted)]">{copy.bookDirectHint}</p>
        </div>

        {panelOpen && canBook && selectedSlot && selectedDate ? (
          <DirectBookingPanel
            copy={siteCopy(locale).book.experience.direct}
            tourName={tourName}
            dateLabel={formatBookingDate(selectedDate, locale)}
            timeLabel={slotTime(selectedSlot.startAt)}
            guests={guests}
            totalLabel={`${copy.estimatedTotal}: ${formatMoneyCents(totalCents, data.currency, locale)}`}
            whatsappNumber={whatsappNumber}
            requiresId={requiresId}
            onBack={() => setPanelOpen(false)}
          />
        ) : null}

        <div>
          {canBook && selectedSlot ? (
            <a
              href={selectedSlot.bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[1.1rem] border border-[color:var(--brand-green-700)] bg-[var(--surface-card)] px-5 text-sm font-semibold text-[var(--brand-green-700)] transition hover:bg-[var(--brand-green-100)]"
            >
              {copy.bookFareharbor}
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-[1.1rem] border border-[color:var(--border-soft)] bg-[var(--surface-card)] px-5 text-sm font-semibold text-[var(--text-muted)] opacity-60"
            >
              {copy.bookFareharbor}
            </button>
          )}
          <p className="mt-1 px-1 text-xs leading-5 text-[var(--text-muted)]">
            {canBook ? copy.bookFareharborHint : copy.selectPrompt}
          </p>
        </div>

        <div className="pt-1">
          <a
            href={paraustedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[1.1rem] border border-[color:var(--brand-gold-500)] bg-[var(--surface-card)] px-5 text-sm font-semibold text-[var(--brand-gold-500)] transition hover:bg-[rgba(184,144,58,0.08)]"
          >
            {copy.buyGift}
          </a>
          <p className="mt-1 px-1 text-xs leading-5 text-[var(--text-muted)]">{copy.buyGiftHint}</p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-[var(--text-muted)]">{copy.feeNote}</p>
    </div>
  );
}
