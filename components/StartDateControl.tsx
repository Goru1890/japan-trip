"use client";

import { useTripState } from "@/lib/state";
import { parseLocalDate, formatDayLabel, addDays } from "@/lib/format";
import { Icon } from "@/components/Icon";

export function StartDateControl({ totalDays }: { totalDays: number }) {
  const { startDate, setStartDate, loaded } = useTripState();

  const start = parseLocalDate(startDate);
  const endLabel =
    start && loaded ? formatDayLabel(addDays(start, totalDays - 1)) : null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <Icon name="date" size={28} className="h-7 w-7 shrink-0" />
        <div>
          <label
            htmlFor="start-date"
            className="block text-xs font-medium uppercase tracking-wide text-ink/55"
          >
            Trip start date
          </label>
          <p className="text-sm text-ink/70">
            {loaded && endLabel
              ? `Day 1 onward — ends ${endLabel}.`
              : "Set a date and every day updates."}
          </p>
        </div>
      </div>
      <input
        id="start-date"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30"
      />
    </div>
  );
}
