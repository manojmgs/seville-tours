"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BookingDate,
  BookingExperience as BookingExperienceData,
  BookingSlot,
  SlotLiveCapacity,
} from "@/lib/booking-engine";

export type LiveAvailabilityStatus = "loading" | "ready" | "empty";

export type LiveAvailability = {
  status: LiveAvailabilityStatus;
  bookableDates: string[];
  selectedDate: string | null;
  selectDate: (date: string) => void;
  slots: BookingSlot[];
  slotsLoading: boolean;
  selectedSlot: BookingSlot | null;
  selectSlot: (availabilityId: number) => void;
  /** Live capacity for the selected slot, when resolved for that exact slot. */
  liveCapacity: SlotLiveCapacity | null;
};

/**
 * Compact live-availability state machine for the inline "Book direct" picker.
 *
 * Mirrors the booking page's fetch sequence (availability → slots → live) and its
 * "skip a dead-end default date" auto-advance, but exposes only what the concierge
 * card needs: a date list, the chosen date's slots, and the selected slot's
 * real-time capacity. Display-only — it never holds a seat or takes payment.
 *
 * Pass `null` for tours without a self-serve flow; the hook stays inert (status
 * "empty") so callers can render a free-text date fallback instead.
 */
export function useLiveAvailability(itemId: string | null): LiveAvailability {
  const [status, setStatus] = useState<LiveAvailabilityStatus>(
    itemId ? "loading" : "empty",
  );
  const [bookableDates, setBookableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slotsData, setSlotsData] = useState<BookingDate | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [liveCapacity, setLiveCapacity] = useState<SlotLiveCapacity | null>(null);
  // Once the guest picks a date explicitly, stop auto-advancing away from it.
  const dateChosenByGuest = useRef(false);

  // Load availability on mount / itemId change.
  useEffect(() => {
    if (!itemId) return;
    const controller = new AbortController();
    dateChosenByGuest.current = false;

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
        const firstDate = experience.bookableDates[0];
        const initial =
          experience.initial && experience.initial.date === firstDate
            ? experience.initial
            : null;
        setBookableDates(experience.bookableDates);
        setSelectedDate(firstDate);
        setSlotsData(initial);
        setSelectedSlotId(initial?.slots[0]?.availabilityId ?? null);
        setStatus("ready");
      } catch {
        if (!controller.signal.aborted) setStatus("empty");
      }
    }

    void load();
    return () => controller.abort();
  }, [itemId]);

  // Load slots for the chosen date on demand; auto-advance past a dead-end default.
  useEffect(() => {
    if (!itemId || selectedDate === null) return;
    if (slotsData?.date === selectedDate) return;

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
        // FareHarbor's month calendar can flag a day bookable while its date-list
        // has no live slots. For the initial default only, skip forward to the next
        // date that actually has times so the guest never hits a dead end.
        if (next.slots.length === 0 && !dateChosenByGuest.current) {
          const nextDate = bookableDates.find((candidate) => candidate > date);
          if (nextDate) {
            setSelectedDate(nextDate);
            return;
          }
        }
        setSlotsData(next);
        setSelectedSlotId(next.slots[0]?.availabilityId ?? null);
      } catch {
        if (controller.signal.aborted) return;
        setSlotsData({ date, slots: [] });
        setSelectedSlotId(null);
      }
    }

    void loadSlots();
    return () => controller.abort();
  }, [itemId, selectedDate, slotsData?.date, bookableDates]);

  // Live capacity for the selected slot (fresh, never cached).
  useEffect(() => {
    if (!itemId || selectedSlotId === null) return;
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
      } catch {
        if (controller.signal.aborted) return;
        setLiveCapacity(null);
      }
    }

    void loadLive();
    return () => controller.abort();
  }, [itemId, selectedSlotId]);

  const selectDate = useCallback((date: string) => {
    dateChosenByGuest.current = true;
    setSelectedDate(date);
  }, []);

  const selectSlot = useCallback((availabilityId: number) => {
    setSelectedSlotId(availabilityId);
  }, []);

  const slots = slotsData?.date === selectedDate ? slotsData.slots : [];
  const slotsLoading = selectedDate !== null && slotsData?.date !== selectedDate;
  const selectedSlot =
    slots.find((slot) => slot.availabilityId === selectedSlotId) ?? null;
  const liveForSlot =
    liveCapacity && liveCapacity.availabilityId === selectedSlotId ? liveCapacity : null;

  return {
    status,
    bookableDates,
    selectedDate,
    selectDate,
    slots,
    slotsLoading,
    selectedSlot,
    selectSlot,
    liveCapacity: liveForSlot,
  };
}
