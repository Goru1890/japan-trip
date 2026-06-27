import Image from "next/image";
import Link from "next/link";
import {
  days,
  tripMeta,
  categoryMeta,
  type Category,
  stays,
  stayNights,
} from "@/lib/trip";
import { StartDateControl } from "@/components/StartDateControl";
import { CategoryDot } from "@/components/CategoryBadge";
import { Icon, type IconName } from "@/components/Icon";

function routeSegments() {
  const segments: { city: string; from: number; to: number }[] = [];
  for (const d of days) {
    const last = segments[segments.length - 1];
    if (last && last.city === d.city) last.to = d.day;
    else segments.push({ city: d.city, from: d.day, to: d.day });
  }
  return segments;
}

const quickLinks: { href: string; label: string; desc: string; icon: IconName }[] =
  [
    { href: "/itinerary", label: "Itinerary", desc: "Day by day", icon: "train" },
    { href: "/hotels", label: "Hotels", desc: "Where you sleep", icon: "hotel" },
    {
      href: "/checklist",
      label: "Checklist",
      desc: "Prep & packing",
      icon: "checklist",
    },
    { href: "/budget", label: "Budget", desc: "What it costs", icon: "budget" },
  ];

export default function HomePage() {
  const segments = routeSegments();
  const cities = new Set(days.map((d) => d.city).filter((c) => c !== "Departure"));
  const nights = stays.reduce((n, s) => n + stayNights(s), 0);

  const stats = [
    { label: "Days", value: days.length },
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
            {tripMeta.title}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-paper/90 sm:text-base">
            {tripMeta.subtitle}
          </p>
        </div>
      </section>

      <p className="text-sm text-ink/70">{tripMeta.seasonNote}</p>

      {/* Start date */}
      <StartDateControl totalDays={days.length} />

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
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          {stays.map((s) => (
            <li
              key={s.city}
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
