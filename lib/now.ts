import { type Category } from "./trip";

// Pure helpers for the "what now / up next" view. Trip time is reckoned in
// Japan local time (Asia/Tokyo), since that's where you'll be standing.

export interface NowActivity {
  id: number;
  dayNumber: number;
  time: string | null;
  title: string;
  description: string;
  category: Category;
  location: string | null;
  cost: string | null;
  booking: string | null;
  mustDo: boolean;
  isSecret: boolean;
}

const KEYWORDS: Record<string, number> = {
  morning: 9 * 60,
  midday: 12 * 60,
  noon: 12 * 60,
  afternoon: 14 * 60,
  evening: 19 * 60,
  night: 20 * 60,
};

/** "09:30" → 570; "Morning" → 540; unknown → null. */
export function timeToMinutes(t: string | null): number | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(t.trim());
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  return KEYWORDS[t.trim().toLowerCase()] ?? null;
}

/** Current date (YYYY-MM-DD) and minutes-since-midnight in Tokyo. */
export function tokyoNow(now: Date): { dateIso: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const dateIso = `${get("year")}-${get("month")}-${get("day")}`;
  let hh = Number(get("hour"));
  if (hh === 24) hh = 0;
  return { dateIso, minutes: hh * 60 + Number(get("minute")) };
}

export function daysBetween(startIso: string, endIso: string): number {
  const toUtc = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(endIso) - toUtc(startIso)) / 86_400_000);
}

export type NowPhase = "before" | "during" | "after";

export interface NowResult {
  phase: NowPhase;
  /** 1-based current trip day (can be <1 before the trip, >total after). */
  dayIndex: number;
  totalDays: number;
  daysUntilStart: number;
  current: NowActivity | null;
  next: NowActivity | null;
  upcoming: NowActivity[];
}

function position(dayNumber: number, time: string | null): number {
  return dayNumber * 10_000 + (timeToMinutes(time) ?? 0);
}

export function computeNow(
  startIso: string,
  activities: NowActivity[],
  now: Date,
  totalDays: number
): NowResult {
  const { dateIso, minutes } = tokyoNow(now);
  const dayIndex = daysBetween(startIso, dateIso) + 1;
  const daysUntilStart = daysBetween(dateIso, startIso);

  const sorted = [...activities].sort(
    (a, b) => position(a.dayNumber, a.time) - position(b.dayNumber, b.time)
  );

  const phase: NowPhase =
    dayIndex < 1 ? "before" : dayIndex > totalDays ? "after" : "during";

  if (phase === "before") {
    return {
      phase,
      dayIndex,
      totalDays,
      daysUntilStart,
      current: null,
      next: sorted[0] ?? null,
      upcoming: sorted.slice(0, 3),
    };
  }
  if (phase === "after") {
    return {
      phase,
      dayIndex,
      totalDays,
      daysUntilStart,
      current: null,
      next: null,
      upcoming: [],
    };
  }

  const nowPos = dayIndex * 10_000 + minutes;
  let current: NowActivity | null = null;
  let nextIdx = sorted.length;
  for (let i = 0; i < sorted.length; i++) {
    const pos = position(sorted[i].dayNumber, sorted[i].time);
    if (pos <= nowPos && sorted[i].dayNumber === dayIndex) current = sorted[i];
    if (pos > nowPos) {
      nextIdx = i;
      break;
    }
  }

  return {
    phase,
    dayIndex,
    totalDays,
    daysUntilStart,
    current,
    next: sorted[nextIdx] ?? null,
    upcoming: sorted.slice(nextIdx, nextIdx + 3),
  };
}
