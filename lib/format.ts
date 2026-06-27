// Pure helpers shared across pages. No React here.

/** Parse a "YYYY-MM-DD" string as a local date (avoids UTC off-by-one). */
export function parseLocalDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Add whole days to a date, returning a new Date. */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** "Mon, Oct 12" */
export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Compute the calendar date for a 1-based day number given a start date. */
export function dateForDay(startIso: string, dayNumber: number): string | null {
  const start = parseLocalDate(startIso);
  if (!start) return null;
  return formatDayLabel(addDays(start, dayNumber - 1));
}

/** A Date → "YYYY-MM-DDThh:mm" in Japan time, for <input type="datetime-local">. */
export function toJstInputValue(date: Date): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

/** A Date → friendly Japan-time label, e.g. "Mon, Oct 12, 3:00 PM". */
export function formatJst(date: Date): string {
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
