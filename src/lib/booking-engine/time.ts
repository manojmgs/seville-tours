/**
 * Timezone-aware date helpers for the booking engine.
 *
 * Booking windows are anchored to the operator's operational timezone (from config),
 * not the server's — so "today" and the calendar months are always correct for the
 * operator regardless of where the code runs.
 */

export type YearMonth = { year: number; month: number };

/** Returns today's date in the given IANA timezone as { year, month, iso }. */
export function operatorToday(timezone: string): YearMonth & { iso: string } {
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [year, month] = iso.split("-").map(Number);
  return { year, month, iso };
}

export function nextMonth(year: number, month: number): YearMonth {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

/** Returns the starting month plus the following ones, for a multi-month calendar. */
export function upcomingMonths(start: YearMonth, count: number): YearMonth[] {
  const months: YearMonth[] = [{ year: start.year, month: start.month }];
  for (let index = 1; index < count; index += 1) {
    const previous = months[index - 1];
    months.push(nextMonth(previous.year, previous.month));
  }
  return months;
}
