"use client";

import { useState } from "react";
import { days, categoryMeta, type Category } from "@/lib/trip";
import { dateForDay } from "@/lib/format";
import { useStartDate } from "@/components/StartDateControl";
import { DayCard } from "@/components/DayCard";

export default function ItineraryPage() {
  const { start, loaded } = useStartDate();
  const [filters, setFilters] = useState<Set<Category>>(new Set());

  function toggle(cat: Category) {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Day by day</h1>
          <p className="text-sm text-stone-500">
            Tap an interest to highlight matching stops. Dates follow your start
            date.
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="sticky top-[57px] z-10 -mx-4 flex flex-wrap items-center gap-2 bg-washi/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[rgba(250,247,242,0.7)] sm:-mx-6 sm:px-6">
        {(Object.keys(categoryMeta) as Category[]).map((cat) => {
          const active = filters.has(cat);
          const meta = categoryMeta[cat];
          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              aria-pressed={active}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? `${meta.chip} ring-2 ${meta.ring}`
                  : "border-stone-200 bg-white/70 text-stone-600 hover:border-stone-300",
              ].join(" ")}
            >
              {meta.emoji} {meta.label}
            </button>
          );
        })}
        {filters.size > 0 && (
          <button
            onClick={() => setFilters(new Set())}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-stone-500 underline-offset-2 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-5">
        {days.map((day) => (
          <DayCard
            key={day.day}
            day={day}
            dateLabel={loaded ? dateForDay(start, day.day) : null}
            activeFilters={filters}
          />
        ))}
      </div>
    </div>
  );
}
