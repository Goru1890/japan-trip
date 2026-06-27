"use client";

import { useLocalStorage } from "@/lib/useLocalStorage";
import { START_DATE_KEY } from "@/lib/constants";
import { tripMeta } from "@/lib/trip";
import { parseLocalDate, formatDayLabel, addDays } from "@/lib/format";

/** Read the saved start date (or the default) anywhere in a client component. */
export function useStartDate() {
  const [start, setStart, loaded] = useLocalStorage<string>(
    START_DATE_KEY,
    tripMeta.defaultStartDate
  );
  return { start, setStart, loaded };
}

export function StartDateControl({ totalDays }: { totalDays: number }) {
  const { start, setStart, loaded } = useStartDate();

  const startDate = parseLocalDate(start);
  const endLabel =
    startDate && loaded ? formatDayLabel(addDays(startDate, totalDays - 1)) : null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <label
          htmlFor="start-date"
          className="block text-xs font-medium uppercase tracking-wide text-stone-500"
        >
          Trip start date
        </label>
        <p className="text-sm text-stone-500">
          {loaded && endLabel
            ? `Day 1 onward — ends ${endLabel}. Saved in your browser.`
            : "Set a date and every day updates."}
        </p>
      </div>
      <input
        id="start-date"
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-vermillion focus:outline-none focus:ring-2 focus:ring-vermillion/30"
      />
    </div>
  );
}
