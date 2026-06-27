import { type Day, type Category, stayForDay, stayNights } from "@/lib/trip";
import { mapsUrl, bookingUrl } from "@/lib/links";
import { CategoryBadge } from "@/components/CategoryBadge";
import { MustDoBadge } from "@/components/Badge";

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
  const stay = stayForDay(day.day);

  return (
    <article
      id={`day-${day.day}`}
      className="scroll-mt-24 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-paper/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-ink text-paper">
            <span className="text-[9px] uppercase leading-none opacity-70">Day</span>
            <span className="text-base font-bold leading-none">{day.day}</span>
          </span>
          <div>
            <h3 className="font-semibold leading-tight text-ink">{day.title}</h3>
            <p className="text-sm text-ink/55">
              {day.city}
              {dateLabel ? ` · ${dateLabel}` : ""}
            </p>
          </div>
        </div>
        {day.restDay && (
          <span className="rounded-md border border-matcha/50 bg-matcha/20 px-2.5 py-0.5 text-xs font-medium text-ink">
            relaxed day
          </span>
        )}
      </header>

      <div className="space-y-1 px-5 py-4">
        <p className="text-sm text-ink/70">{day.summary}</p>
        {day.transport && (
          <p className="flex items-start gap-1.5 pt-1 text-sm text-ink/60">
            <span aria-hidden>🚆</span>
            <span>{day.transport}</span>
          </p>
        )}
      </div>

      <ul className="divide-y divide-ink/10 border-t border-ink/10">
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
              <div className="w-14 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-ink/45">
                {act.time ?? ""}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">{act.title}</span>
                  <CategoryBadge category={act.category} size="sm" />
                  {act.mustDo && <MustDoBadge />}
                </div>
                <p className="mt-0.5 text-sm text-ink/70">{act.description}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/55">
                  {act.cost && <span>💴 {act.cost}</span>}
                  {act.booking && <span>📌 {act.booking}</span>}
                  {act.location && (
                    <a
                      href={mapsUrl(act.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-red hover:underline"
                    >
                      📍 Map ↗
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {stay && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 bg-sky/10 px-5 py-3">
          <div className="text-sm text-ink">
            <span className="mr-1" aria-hidden>
              🛏️
            </span>
            <span className="font-medium">Tonight: {stay.area}</span>
            <span className="text-ink/55">
              {" "}
              · night {day.day - stay.fromDay + 1} of {stayNights(stay)} in{" "}
              {stay.city}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <a
              href={bookingUrl(stay.bookingQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red hover:underline"
            >
              🏨 Hotels ↗
            </a>
            <a
              href={mapsUrl(stay.mapsQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red hover:underline"
            >
              📍 Area ↗
            </a>
          </div>
        </div>
      )}
    </article>
  );
}
