import Link from "next/link";
import { days, tripMeta, categoryMeta, type Category } from "@/lib/trip";
import { StartDateControl } from "@/components/StartDateControl";
import { CategoryDot } from "@/components/CategoryBadge";

// Group consecutive days by city to show the route flow.
function routeSegments() {
  const segments: { city: string; from: number; to: number }[] = [];
  for (const d of days) {
    const last = segments[segments.length - 1];
    if (last && last.city === d.city) {
      last.to = d.day;
    } else {
      segments.push({ city: d.city, from: d.day, to: d.day });
    }
  }
  return segments;
}

export default function OverviewPage() {
  const segments = routeSegments();
  const cities = new Set(days.map((d) => d.city).filter((c) => c !== "Departure"));
  const activityCount = days.reduce((n, d) => n + d.activities.length, 0);

  const stats = [
    { label: "Days", value: days.length },
    { label: "Stops", value: cities.size },
    { label: "Planned stops", value: activityCount },
    { label: "Interests", value: Object.keys(categoryMeta).length },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 sm:p-10">
        <p className="text-sm font-medium uppercase tracking-widest text-vermillion">
          日本 · Your itinerary
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
          {tripMeta.title}
        </h1>
        <p className="mt-2 text-lg text-stone-600">{tripMeta.subtitle}</p>
        <p className="mt-4 max-w-2xl text-stone-600">{tripMeta.seasonNote}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-stone-200 bg-white/70 px-4 py-3 text-center"
            >
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs uppercase tracking-wide text-stone-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link
            href="/itinerary"
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
          >
            View the day-by-day →
          </Link>
        </div>
      </section>

      {/* Start date */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">When are you going?</h2>
        <StartDateControl totalDays={days.length} />
        <p className="text-sm text-stone-500">{tripMeta.pacing}</p>
      </section>

      {/* Route */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">The route</h2>
        <ol className="relative space-y-3 border-l-2 border-stone-200 pl-6">
          {segments.map((seg, i) => (
            <li key={`${seg.city}-${i}`} className="relative">
              <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-vermillion bg-white text-[10px] font-bold text-vermillion">
                {i + 1}
              </span>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold">{seg.city}</span>
                <span className="text-sm text-stone-500">
                  {seg.from === seg.to
                    ? `Day ${seg.from}`
                    : `Days ${seg.from}–${seg.to}`}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Interest legend */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Built around your interests</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(categoryMeta) as Category[]).map((key) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white/70 px-3 py-2.5"
            >
              <CategoryDot category={key} />
              <span className="text-sm font-medium">
                {categoryMeta[key].emoji} {categoryMeta[key].label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
