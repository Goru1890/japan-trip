import { type Day, type Category } from "@/lib/trip";
import { CategoryBadge } from "@/components/CategoryBadge";

export function DayCard({
  day,
  dateLabel,
  activeFilters,
}: {
  day: Day;
  dateLabel: string | null;
  /** When set, activities not in this set are dimmed (not hidden). */
  activeFilters: Set<Category>;
}) {
  const filtering = activeFilters.size > 0;

  return (
    <article
      id={`day-${day.day}`}
      className="scroll-mt-20 overflow-hidden rounded-2xl border border-stone-200 bg-white/80 shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 bg-stone-50/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-stone-900 text-white">
            <span className="text-[9px] uppercase leading-none opacity-70">Day</span>
            <span className="text-base font-bold leading-none">{day.day}</span>
          </span>
          <div>
            <h3 className="font-semibold leading-tight">{day.title}</h3>
            <p className="text-sm text-stone-500">
              {day.city}
              {dateLabel ? ` · ${dateLabel}` : ""}
            </p>
          </div>
        </div>
        {day.restDay && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            relaxed day
          </span>
        )}
      </header>

      <div className="space-y-1 px-5 py-4">
        <p className="text-sm text-stone-600">{day.summary}</p>
        {day.transport && (
          <p className="flex items-start gap-1.5 pt-1 text-sm text-stone-500">
            <span aria-hidden>🚆</span>
            <span>{day.transport}</span>
          </p>
        )}
      </div>

      <ul className="divide-y divide-stone-100 border-t border-stone-100">
        {day.activities.map((act, i) => {
          const dim = filtering && !activeFilters.has(act.category);
          return (
            <li
              key={i}
              className={[
                "flex gap-3 px-5 py-3 transition-opacity",
                dim ? "opacity-35" : "opacity-100",
              ].join(" ")}
            >
              <div className="w-14 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-stone-400">
                {act.time ?? ""}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{act.title}</span>
                  <CategoryBadge category={act.category} size="sm" />
                </div>
                <p className="mt-0.5 text-sm text-stone-600">{act.description}</p>
                {(act.cost || act.booking) && (
                  <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-stone-500">
                    {act.cost && <span>💴 {act.cost}</span>}
                    {act.booking && <span>📌 {act.booking}</span>}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
