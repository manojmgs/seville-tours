"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import { formatMonthLabel, weekdayInitials } from "@/lib/fareharbor/format";

type BookingCalendarProps = {
  /** Selectable ISO dates ("YYYY-MM-DD"), Madrid tz. */
  bookableDates: string[];
  selectedDate: string | null;
  locale: Locale;
  prevLabel: string;
  nextLabel: string;
  onSelect: (date: string) => void;
};

type MonthKey = { year: number; month: number };

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Monday-first weekday index (0 = Monday … 6 = Sunday) for an ISO date. */
function mondayFirstIndex(year: number, month: number, day: number): number {
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function compareMonth(a: MonthKey, b: MonthKey): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

/**
 * Mobile-first month calendar. Shows the months that contain bookable dates,
 * lets the guest navigate between them, and surfaces only real bookable days as
 * tappable. Selecting a day triggers an on-demand slot fetch upstream.
 */
export function BookingCalendar({
  bookableDates,
  selectedDate,
  locale,
  prevLabel,
  nextLabel,
  onSelect,
}: BookingCalendarProps) {
  const bookableSet = useMemo(() => new Set(bookableDates), [bookableDates]);

  const { firstMonth, lastMonth } = useMemo(() => {
    const sorted = [...bookableDates].sort();
    const parse = (iso: string): MonthKey => {
      const [year, month] = iso.split("-").map(Number);
      return { year, month };
    };
    return {
      firstMonth: parse(sorted[0]),
      lastMonth: parse(sorted[sorted.length - 1]),
    };
  }, [bookableDates]);

  const [view, setView] = useState<MonthKey>(() => {
    if (selectedDate) {
      const [year, month] = selectedDate.split("-").map(Number);
      return { year, month };
    }
    return firstMonth;
  });

  const canGoPrev = compareMonth(view, firstMonth) > 0;
  const canGoNext = compareMonth(view, lastMonth) < 0;

  function shiftMonth(delta: number) {
    setView((current) => {
      const total = current.year * 12 + (current.month - 1) + delta;
      return { year: Math.floor(total / 12), month: (total % 12) + 1 };
    });
  }

  const weekdays = useMemo(() => weekdayInitials(locale), [locale]);

  const leadingBlanks = mondayFirstIndex(view.year, view.month, 1);
  const totalDays = daysInMonth(view.year, view.month);
  const cells: Array<{ iso: string; day: number } | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => ({
      iso: toIso(view.year, view.month, index + 1),
      day: index + 1,
    })),
  ];

  return (
    <div className="mt-2 rounded-[0.9rem] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label={prevLabel}
          onClick={() => shiftMonth(-1)}
          disabled={!canGoPrev}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] text-lg text-[var(--foreground)] transition hover:border-[var(--brand-green-500)] disabled:opacity-30"
        >
          <span aria-hidden>‹</span>
        </button>
        <p className="text-sm font-bold capitalize text-[var(--foreground)]">
          {formatMonthLabel(view.year, view.month, locale)}
        </p>
        <button
          type="button"
          aria-label={nextLabel}
          onClick={() => shiftMonth(1)}
          disabled={!canGoNext}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] text-lg text-[var(--foreground)] transition hover:border-[var(--brand-green-500)] disabled:opacity-30"
        >
          <span aria-hidden>›</span>
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center">
        {weekdays.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="py-1 text-[0.7rem] font-bold uppercase tracking-wide text-[var(--text-muted)]"
          >
            {label}
          </span>
        ))}

        {cells.map((cell, index) => {
          if (!cell) return <span key={`blank-${index}`} aria-hidden />;
          const isBookable = bookableSet.has(cell.iso);
          const isSelected = selectedDate === cell.iso;
          if (!isBookable) {
            return (
              <span
                key={cell.iso}
                className="flex h-11 items-center justify-center text-sm text-[var(--text-muted)] opacity-40"
              >
                {cell.day}
              </span>
            );
          }
          return (
            <button
              key={cell.iso}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(cell.iso)}
              className={`flex h-11 items-center justify-center rounded-full text-sm font-semibold transition ${
                isSelected
                  ? "bg-[var(--brand-green-700)] text-white shadow-sm"
                  : "bg-[var(--brand-green-100)] text-[var(--brand-green-900)] hover:bg-[var(--brand-green-700)] hover:text-white"
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
