"use client";

import { useState } from "react";
import Image from "next/image";
import { days, categoryMeta, type Category } from "@/lib/trip";
import { dateForDay } from "@/lib/format";
import { useTripState } from "@/lib/state";
import { useAudio } from "@/lib/audio";
import { DayCard } from "@/components/DayCard";

export default function ItineraryPage() {
  const { startDate, loaded } = useTripState();
  const { play } = useAudio();
  const [filters, setFilters] = useState<Set<Category>>(new Set());

  function toggle(cat: Category) {
    play("tap");
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      {/* Banner */}
      <section className="relative h-36 overflow-hidden rounded-lg shadow-soft sm:h-44">
        <Image
          src="/assets/images/card-tokyo-itinerary.png"
          alt="Illustrated Tokyo itinerary scene"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h1 className="text-2xl font-bold tracking-tight text-paper drop-shadow sm:text-3xl">
            Day by day
          </h1>
          <p className="text-sm text-paper/90">
            Tap an interest to highlight matching stops · dates follow your start
            date
          </p>
        </div>
      </section>

      {/* Filter chips */}
      <div className="sticky top-[53px] z-10 -mx-4 flex flex-wrap items-center gap-2 bg-paper/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[rgba(248,238,220,0.78)] sm:-mx-6 sm:px-6">
        {(Object.keys(categoryMeta) as Category[]).map((cat) => {
          const active = filters.has(cat);
          const meta = categoryMeta[cat];
          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              aria-pressed={active}
              className={[
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? `${meta.chip} ring-2 ${meta.ring}`
                  : "border-ink/15 bg-white text-ink/70 hover:border-ink/30",
              ].join(" ")}
            >
              {meta.emoji} {meta.label}
            </button>
          );
        })}
        {filters.size > 0 && (
          <button
            onClick={() => setFilters(new Set())}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-ink/55 underline-offset-2 hover:underline"
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
            dateLabel={loaded ? dateForDay(startDate, day.day) : null}
            activeFilters={filters}
          />
        ))}
      </div>
    </div>
  );
}
