import { categoryMeta, type Category } from "./trip";
import { mapsUrl } from "./links";
import {
  stayForDayIn,
  stayHotelHref,
  stayHotelLabel,
  stayMapHref,
  type StayView,
} from "./stays";

// Pure helpers for the "what now / what next" view. Trip time is reckoned in
// Japan local time (Asia/Tokyo). The view merges four kinds of "steps" —
// travel legs, activities, hotel check-ins, and real bookings — into one
// time-ordered feed so the app can always say "here's your next move".

/** Minimal day scaffold the engine needs (matches the DB day rows). */
export interface DayMeta {
  dayNumber: number;
  city: string;
  title: string;
  summary: string;
  transport: string | null;
  restDay: boolean;
}

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

export interface NowReservation {
  id: number;
  type: string;
  title: string;
  startsAt: Date | null;
  dayNumber: number | null;
  confirmation: string | null;
  url: string | null;
  isSecret: boolean;
}

export type StepKind = "travel" | "activity" | "hotel" | "booking";

export interface Step {
  key: string;
  kind: StepKind;
  dayNumber: number;
  city: string;
  minutes: number; // for ordering within a day
  time: string | null; // display time, if any
  icon: string;
  action: string; // "Go to", "Check in at", "Travel —", …
  title: string;
  detail?: string;
  mapsUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  category?: Category;
  isSecret?: boolean;
}

const KEYWORDS: Record<string, number> = {
  morning: 9 * 60,
  midday: 12 * 60,
  noon: 12 * 60,
  afternoon: 14 * 60,
  evening: 19 * 60,
  night: 20 * 60,
};

export function timeToMinutes(t: string | null): number | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(t.trim());
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  return KEYWORDS[t.trim().toLowerCase()] ?? null;
}

export function minutesToLabel(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h < 12 ? "AM" : "PM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(mm).padStart(2, "0")} ${ap}`;
}

/** Current date (YYYY-MM-DD) and minutes-since-midnight for a Date, in Tokyo. */
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

const TYPE_EMOJI: Record<string, string> = {
  hotel: "🏨",
  restaurant: "🍽️",
  transport: "🚆",
  activity: "🎟️",
  other: "📌",
};

function activityAction(a: NowActivity): string {
  if (a.category === "checkin") return "Check in —";
  if (/airport/i.test(a.location ?? a.title)) return "Head to";
  if (a.category === "travel") return "Travel —";
  if (a.category === "food") return a.location ? "Eat at" : "Food —";
  return a.location ? "Go to" : "Up next —";
}

/** Build the full, time-ordered list of steps across the whole trip. */
export function buildSteps(
  startIso: string,
  dayList: DayMeta[],
  stays: StayView[],
  activities: NowActivity[],
  reservations: NowReservation[]
): Step[] {
  const steps: Step[] = [];
  const lastDay = dayList.reduce((m, d) => Math.max(m, d.dayNumber), 0);
  const cityOf = (n: number) =>
    dayList.find((d) => d.dayNumber === n)?.city ?? "";

  for (const d of dayList) {
    const stay = stayForDayIn(stays, d.dayNumber);

    // 1) Travel leg — start of day.
    if (d.transport) {
      const isAirport = /airport|kix|narita|haneda|depart/i.test(d.transport);
      const arriving = stay && stay.fromDay === d.dayNumber;
      steps.push({
        key: `travel-${d.dayNumber}`,
        kind: "travel",
        dayNumber: d.dayNumber,
        city: d.city,
        minutes: 5,
        time: null,
        icon: d.dayNumber === lastDay && isAirport ? "✈️" : "🚆",
        action: d.dayNumber === lastDay ? "Head out —" : "Travel —",
        title: d.transport,
        mapsUrl: arriving ? stayMapHref(stay!) : undefined,
      });
    }

    // 2) Activities (by time).
    for (const a of activities.filter((x) => x.dayNumber === d.dayNumber)) {
      steps.push({
        key: `act-${a.id}`,
        kind: "activity",
        dayNumber: d.dayNumber,
        city: d.city,
        minutes: timeToMinutes(a.time) ?? 12 * 60,
        time: a.time,
        icon: (categoryMeta[a.category] ?? categoryMeta.city).emoji,
        action: activityAction(a),
        title: a.title,
        detail: a.description || undefined,
        mapsUrl: a.location ? mapsUrl(a.location) : undefined,
        category: a.category,
        isSecret: a.isSecret,
      });
    }

    // 3) Hotel for the night — end of day.
    if (stay) {
      const arrival = stay.fromDay === d.dayNumber;
      steps.push({
        key: `hotel-${d.dayNumber}`,
        kind: "hotel",
        dayNumber: d.dayNumber,
        city: d.city,
        minutes: 22 * 60,
        time: null,
        icon: "🛏️",
        action: arrival ? "Check in at" : "Back to your hotel —",
        title: `${stay.area} · ${stay.city}`,
        mapsUrl: stayMapHref(stay),
        linkUrl: stayHotelHref(stay),
        linkLabel: stayHotelLabel(stay),
      });
    }
  }

  // 4) Real bookings. Placed by their assigned day (preferred) and/or time;
  //    a day-assigned but timeless booking still shows (at midday), and a
  //    date is clamped into the trip so it never falls off the feed.
  for (const r of reservations) {
    let day: number | null = r.dayNumber ?? null;
    let minutes = 12 * 60;
    let timeLabel: string | null = null;
    if (r.startsAt) {
      const t = tokyoNow(r.startsAt);
      minutes = t.minutes;
      timeLabel = minutesToLabel(minutes);
      if (day == null) day = daysBetween(startIso, t.dateIso) + 1;
    }
    if (day == null) continue; // no day and no time → nothing to anchor it to
    day = Math.max(1, Math.min(lastDay, day));
    steps.push({
      key: `resv-${r.id}`,
      kind: "booking",
      dayNumber: day,
      city: cityOf(day),
      minutes,
      time: timeLabel,
      icon: TYPE_EMOJI[r.type] ?? "📌",
      action: `${r.type[0].toUpperCase()}${r.type.slice(1)} —`,
      title: r.title,
      detail: r.confirmation ? `Confirmation ${r.confirmation}` : undefined,
      linkUrl: r.url ?? undefined,
      linkLabel: r.url ? "Open booking" : undefined,
      isSecret: r.isSecret,
    });
  }

  steps.sort(
    (a, b) => a.dayNumber * 10_000 + a.minutes - (b.dayNumber * 10_000 + b.minutes)
  );
  return steps;
}

export type NowPhase = "before" | "during" | "after";

export interface NextSteps {
  phase: NowPhase;
  dayIndex: number;
  totalDays: number;
  daysUntilStart: number;
  current: Step | null;
  next: Step | null;
  laterToday: Step[];
  upcoming: Step[];
}

export function computeNextSteps(
  startIso: string,
  dayList: DayMeta[],
  stays: StayView[],
  activities: NowActivity[],
  reservations: NowReservation[],
  now: Date
): NextSteps {
  const steps = buildSteps(startIso, dayList, stays, activities, reservations);
  const lastDay = dayList.reduce((m, d) => Math.max(m, d.dayNumber), 0);
  const totalDays = dayList.length;

  const { dateIso, minutes } = tokyoNow(now);
  const dayIndex = daysBetween(startIso, dateIso) + 1;
  const daysUntilStart = daysBetween(dateIso, startIso);
  const phase: NowPhase =
    dayIndex < 1 ? "before" : dayIndex > lastDay ? "after" : "during";

  const pos = (s: Step) => s.dayNumber * 10_000 + s.minutes;
  const nowPos = dayIndex * 10_000 + minutes;

  if (phase === "after" || steps.length === 0) {
    return {
      phase,
      dayIndex,
      totalDays,
      daysUntilStart,
      current: null,
      next: null,
      laterToday: [],
      upcoming: [],
    };
  }

  let nextIdx = phase === "before" ? 0 : steps.findIndex((s) => pos(s) >= nowPos);
  if (nextIdx < 0) nextIdx = steps.length;

  const next = steps[nextIdx] ?? null;
  const current =
    phase === "during"
      ? steps
          .filter((s) => s.dayNumber === dayIndex && pos(s) <= nowPos)
          .pop() ?? null
      : null;

  const rest = next ? steps.slice(nextIdx + 1) : [];
  const laterToday = next
    ? rest.filter((s) => s.dayNumber === next.dayNumber)
    : [];
  const upcoming = next
    ? rest.filter((s) => s.dayNumber > next.dayNumber).slice(0, 5)
    : [];

  return {
    phase,
    dayIndex,
    totalDays,
    daysUntilStart,
    current,
    next,
    laterToday,
    upcoming,
  };
}
