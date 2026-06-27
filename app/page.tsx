import Image from "next/image";
import Link from "next/link";
import { tripMeta, categoryMeta, type Category } from "@/lib/trip";
import { stayNights } from "@/lib/stays";
import { StartDateControl } from "@/components/StartDateControl";
import { CategoryDot } from "@/components/CategoryBadge";
import { Icon, type IconName } from "@/components/Icon";
import { TripSettingsForm } from "@/components/TripSettingsForm";
import { getSession } from "@/lib/auth";
import { tokyoNow, daysBetween } from "@/lib/now";
import {
  getStartDate,
  getDays,
  getStays,
  getSettings,
  getChecklist,
  getVisibleReservations,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type RouteDay = { dayNumber: number; city: string };

function routeSegments(days: RouteDay[]) {
  const segments: { city: string; from: number; to: number }[] = [];
  for (const d of days) {
    const last = segments[segments.length - 1];
    if (last && last.city === d.city) last.to = d.dayNumber;
    else segments.push({ city: d.city, from: d.dayNumber, to: d.dayNumber });
  }
  return segments;
}

function ReadyRow({
  icon,
  label,
  value,
  pct,
}: {
  icon: string;
  label: string;
  value: string;
  pct: number;
}) {
  return (
    <li>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink/80">
          <span className="mr-1.5" aria-hidden>
            {icon}
          </span>
          {label}
        </span>
        <span className="font-medium tabular-nums text-ink">{value}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-matcha transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

const quickLinks: { href: string; label: string; desc: string; icon: IconName }[] =
  [
    { href: "/now", label: "Now", desc: "What's next", icon: "date" },
    { href: "/itinerary", label: "Itinerary", desc: "Day by day", icon: "train" },
    { href: "/hotels", label: "Hotels", desc: "Where you sleep", icon: "hotel" },
    { href: "/bookings", label: "Bookings", desc: "Reservations", icon: "onsen" },
    {
      href: "/checklist",
      label: "Checklist",
      desc: "Prep & packing",
      icon: "checklist",
    },
    { href: "/budget", label: "Budget", desc: "What it costs", icon: "budget" },
  ];

export default async function HomePage() {
  const session = await getSession();
  const uid = session?.uid ?? -1;
  const [startDate, dayRows, stayRows, settings, checklistRows, resvRows] =
    await Promise.all([
      getStartDate(),
      getDays(),
      getStays(),
      getSettings(),
      getChecklist(),
      getVisibleReservations(uid),
    ]);

  // Trip readiness
  const totalDays = dayRows.length;
  const today = tokyoNow(new Date()).dateIso;
  const dayIndex = daysBetween(startDate, today) + 1;
  let countdown: string;
  if (dayIndex < 1) {
    const d = daysBetween(today, startDate);
    countdown = `In ${d} day${d === 1 ? "" : "s"}`;
  } else if (dayIndex <= totalDays) {
    countdown = `Day ${dayIndex} of ${totalDays}`;
  } else {
    countdown = "Trip complete 🎉";
  }

  // Hotels measured as booked nights / total trip nights (fixed denominator),
  // so adding a *tentative* stay never lowers readiness — only booking one raises it.
  const bookedNights = stayRows
    .filter((s) => s.status === "booked" || s.status === "paid")
    .reduce((n, s) => n + stayNights(s), 0);
  const tripNights = Math.max(totalDays - 1, 1);
  const hotelsPct = Math.min(100, Math.round((bookedNights / tripNights) * 100));
  const checkDone = checklistRows.filter((c) => c.checked).length;
  const checkPct = checklistRows.length
    ? Math.round((checkDone / checklistRows.length) * 100)
    : 0;
  const bookings = resvRows.length;
  const readiness = Math.round((hotelsPct + checkPct) / 2);
  const title = settings.title || tripMeta.title;
  const subtitle = settings.subtitle || tripMeta.subtitle;
  const seasonNote = settings.season_note || tripMeta.seasonNote;
  const travelers = Number(settings.travelers || "1") || 1;
  const segments = routeSegments(dayRows);
  const cities = new Set(
    dayRows.map((d) => d.city).filter((c) => c !== "Departure")
  );
  const nights = stayRows.reduce((n, s) => n + stayNights(s), 0);

  const stats = [
    { label: "Days", value: dayRows.length },
    { label: "Stops", value: cities.size },
    { label: "Nights", value: nights },
    { label: "Interests", value: Object.keys(categoryMeta).length },
  ];

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative h-60 overflow-hidden rounded-lg shadow-soft sm:h-80">
        <Image
          src="/assets/images/hero-tokyo-sakura.png"
          alt="Illustrated Tokyo street under cherry blossoms"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/85">
            日本 · Your trip
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-paper drop-shadow sm:text-5xl">
            {title}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-paper/90 sm:text-base">
            {subtitle}
          </p>
        </div>
      </section>

      <div className="space-y-2">
        <p className="text-sm text-ink/70">{seasonNote}</p>
        <TripSettingsForm
          initial={{ title, subtitle, travelers, seasonNote }}
        />
      </div>

      {/* Trip readiness */}
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-ink">Trip readiness</h2>
          <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-semibold text-ink">
            {countdown}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-3xl font-bold tabular-nums text-ink">
            {readiness}%
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-matcha transition-all"
              style={{ width: `${readiness}%` }}
            />
          </div>
        </div>
        <ul className="mt-4 space-y-2.5">
          <ReadyRow
            icon="🏨"
            label="Hotel nights booked"
            value={`${bookedNights}/${tripNights}`}
            pct={hotelsPct}
          />
          <ReadyRow
            icon="✅"
            label="Checklist"
            value={`${checkDone}/${checklistRows.length}`}
            pct={checkPct}
          />
        </ul>
        <p className="mt-3 text-sm text-ink/60">
          🎫 {bookings} booking{bookings === 1 ? "" : "s"} saved
        </p>
      </section>

      {/* Start date */}
      <StartDateControl totalDays={dayRows.length} initial={startDate} />

      {/* Stats band */}
      <div className="grid grid-cols-2 divide-x divide-y divide-ink/10 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft sm:grid-cols-4 sm:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-3 text-center">
            <div className="text-2xl font-bold text-ink">{s.value}</div>
            <div className="text-xs uppercase tracking-wide text-ink/55">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {quickLinks.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="flex flex-col gap-1 rounded-lg border border-ink/10 bg-white p-4 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <Icon name={q.icon} size={28} className="h-7 w-7" />
            <span className="mt-1 font-semibold text-ink">{q.label}</span>
            <span className="text-xs text-ink/60">{q.desc}</span>
          </Link>
        ))}
      </section>

      {/* Route */}
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <Icon name="date" size={20} className="h-5 w-5" />
          <h2 className="font-semibold text-ink">The route</h2>
        </div>
        <ol className="relative space-y-3 border-l-2 border-sakura/60 pl-6">
          {segments.map((seg, i) => (
            <li key={`${seg.city}-${i}`} className="relative">
              <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-sakura bg-white text-[10px] font-bold text-ink">
                {i + 1}
              </span>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold text-ink">{seg.city}</span>
                <span className="text-sm text-ink/55">
                  {seg.from === seg.to
                    ? `Day ${seg.from}`
                    : `Days ${seg.from}–${seg.to}`}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Stay teaser */}
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="hotel" size={20} className="h-5 w-5" />
            <h2 className="font-semibold text-ink">Where you&apos;ll stay</h2>
          </div>
          <Link
            href="/hotels"
            className="text-sm font-medium text-red hover:underline"
          >
            All hotels →
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-ink/10">
          {stayRows.map((s) => (
            <li
              key={s.id}
              className="flex items-baseline justify-between gap-3 py-2 text-sm"
            >
              <span className="font-medium text-ink">{s.city}</span>
              <span className="text-ink/60">{s.area}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Interests */}
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <h2 className="mb-3 font-semibold text-ink">Built around your interests</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(categoryMeta) as Category[]).map((key) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <CategoryDot category={key} />
              <span className="font-medium text-ink">
                {categoryMeta[key].emoji} {categoryMeta[key].label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
