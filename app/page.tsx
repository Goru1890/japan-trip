import Image from "next/image";
import Link from "next/link";
import { tripMeta } from "@/lib/trip";
import { StartDateControl } from "@/components/StartDateControl";
import { Icon, type IconName } from "@/components/Icon";
import { TripSettingsForm } from "@/components/TripSettingsForm";
import { getSession } from "@/lib/auth";
import { tokyoNow, daysBetween, timeToMinutes } from "@/lib/now";
import { dateForDay } from "@/lib/format";
import {
  getStartDate,
  getDays,
  getStays,
  getSettings,
  getVisibleActivities,
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
  const [startDate, dayRows, stayRows, settings, acts] = await Promise.all([
    getStartDate(),
    getDays(),
    getStays(),
    getSettings(),
    getVisibleActivities(uid),
  ]);

  const totalDays = dayRows.length;
  const today = tokyoNow(new Date()).dateIso;
  const dayIndex = daysBetween(startDate, today) + 1;
  const todayRow = dayRows.find((d) => d.dayNumber === dayIndex) ?? null;
  const todayActs = acts
    .filter((a) => a.dayNumber === dayIndex)
    .sort((a, b) => (timeToMinutes(a.time) ?? 720) - (timeToMinutes(b.time) ?? 720));

  let countdown: string;
  if (dayIndex < 1) {
    const d = daysBetween(today, startDate);
    countdown = d === 1 ? "Tomorrow" : `In ${d} days`;
  } else if (dayIndex <= totalDays) {
    countdown = `Day ${dayIndex} of ${totalDays}`;
  } else {
    countdown = "Trip complete 🎉";
  }

  const title = settings.title || tripMeta.title;
  const subtitle = settings.subtitle || tripMeta.subtitle;
  const seasonNote = settings.season_note || tripMeta.seasonNote;
  const travelers = Number(settings.travelers || "1") || 1;
  const segments = routeSegments(dayRows);
  const first = dateForDay(startDate, 1);
  const last = dateForDay(startDate, totalDays);

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative h-52 overflow-hidden rounded-lg shadow-soft sm:h-72">
        <Image
          src="/assets/images/hero-tokyo-sakura.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/85">
            {first && last ? `${first} → ${last}` : "日本"}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-paper drop-shadow sm:text-5xl">
            {title}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-paper/90 sm:text-base">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Today */}
      <section className="rounded-lg border border-red/30 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-ink">
            {todayRow ? todayRow.title : dayIndex < 1 ? "Before the trip" : "After the trip"}
          </h2>
          <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-semibold text-ink">
            {countdown}
          </span>
        </div>
        {todayRow ? (
          <>
            <p className="mt-0.5 text-sm text-ink/60">{todayRow.city}</p>
            {todayActs.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm text-ink">
                {todayActs.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="w-12 shrink-0 tabular-nums text-ink/55">{a.time ?? ""}</span>
                    <span className={a.mustDo ? "font-semibold" : ""}>{a.title}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/now"
              className="mt-4 inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
            >
              What now? →
            </Link>
          </>
        ) : (
          <p className="mt-1 text-sm text-ink/70">{seasonNote}</p>
        )}
      </section>

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

      {/* Route + where you sleep, merged */}
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="date" size={20} className="h-5 w-5" />
            <h2 className="font-semibold text-ink">The route</h2>
          </div>
          <Link href="/hotels" className="text-sm font-medium text-red hover:underline">
            Hotels →
          </Link>
        </div>
        <ol className="relative space-y-3 border-l-2 border-sakura/60 pl-6">
          {segments.map((seg, i) => {
            const stay = stayRows.find((s) => seg.from >= s.fromDay && seg.from <= s.toDay);
            const d1 = dateForDay(startDate, seg.from);
            const d2 = dateForDay(startDate, seg.to);
            return (
              <li key={`${seg.city}-${i}`} className="relative">
                <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-sakura bg-white text-[10px] font-bold text-ink">
                  {i + 1}
                </span>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold text-ink">{seg.city}</span>
                  <span className="text-sm text-ink/55">
                    {seg.from === seg.to ? d1 : `${d1} – ${d2}`}
                  </span>
                </div>
                {stay && seg.city !== "Departure" && (
                  <p className="text-sm text-ink/60">🛏️ {stay.area}</p>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* Settings, tucked away */}
      <details className="rounded-lg border border-ink/10 bg-white/60 p-4 text-sm shadow-soft">
        <summary className="cursor-pointer font-medium text-ink/70">Trip settings</summary>
        <div className="mt-4 space-y-4">
          <StartDateControl totalDays={totalDays} initial={startDate} />
          <TripSettingsForm initial={{ title, subtitle, travelers, seasonNote }} />
        </div>
      </details>
    </div>
  );
}
