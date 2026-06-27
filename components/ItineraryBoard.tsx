"use client";

import { useState } from "react";
import { categoryMeta, type Category } from "@/lib/trip";
import { dateForDay } from "@/lib/format";
import { mapsUrl } from "@/lib/links";
import {
  stayForDayIn,
  stayNights,
  stayHotelHref,
  stayHotelLabel,
  stayMapHref,
  type StayView,
} from "@/lib/stays";
import { useAudio } from "@/lib/audio";
import { CategoryBadge } from "@/components/CategoryBadge";
import { MustDoBadge, SecretBadge } from "@/components/Badge";
import {
  ActivityForm,
  type ActivityFormValues,
  type ReservationLite,
} from "@/components/ActivityForm";
import { DayForm } from "@/components/DayForm";
import { deleteActivityAction } from "@/app/actions/activities";
import { deleteDayAction } from "@/app/actions/days";

export interface BoardActivity extends ActivityFormValues {
  dayNumber: number;
  canManage: boolean;
}

export interface BoardDay {
  id: number;
  day: number;
  city: string;
  title: string;
  summary: string;
  transport: string | null;
  restDay: boolean;
}

export function ItineraryBoard({
  startDate,
  days,
  stays,
  reservations,
  activitiesByDay,
}: {
  startDate: string;
  days: BoardDay[];
  stays: StayView[];
  reservations: ReservationLite[];
  activitiesByDay: Record<number, BoardActivity[]>;
}) {
  const { play } = useAudio();
  const [filters, setFilters] = useState<Set<Category>>(new Set());
  const [addOn, setAddOn] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editDayId, setEditDayId] = useState<number | null>(null);
  const [addingDay, setAddingDay] = useState(false);
  const filtering = filters.size > 0;
  const lastDay = days.reduce((m, d) => Math.max(m, d.day), 0);

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
      {/* Filters */}
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
        {filtering && (
          <button
            onClick={() => setFilters(new Set())}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-ink/55 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {days.map((day) => {
        const acts = activitiesByDay[day.day] ?? [];
        const stay = stayForDayIn(stays, day.day);
        const dateLabel = dateForDay(startDate, day.day);
        return (
          <article
            key={day.id}
            className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft"
          >
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-paper/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-ink text-paper">
                  <span className="text-[9px] uppercase leading-none opacity-70">
                    Day
                  </span>
                  <span className="text-base font-bold leading-none">{day.day}</span>
                </span>
                <div>
                  <h3 className="font-semibold leading-tight text-ink">
                    {day.title}
                  </h3>
                  <p className="text-sm text-ink/55">
                    {day.city}
                    {dateLabel ? ` · ${dateLabel}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {day.restDay && (
                  <span className="rounded-md border border-matcha/50 bg-matcha/20 px-2.5 py-0.5 text-xs font-medium text-ink">
                    relaxed
                  </span>
                )}
                <button
                  onClick={() =>
                    setEditDayId(editDayId === day.id ? null : day.id)
                  }
                  className="rounded-md border border-ink/15 px-2 py-1 text-xs font-medium text-ink/70 hover:bg-ink/5"
                >
                  Edit day
                </button>
                {day.day === lastDay && (
                  <form
                    action={deleteDayAction}
                    onSubmit={(e) => {
                      if (
                        !confirm(
                          `Remove Day ${day.day} and everything on it? This can't be undone.`
                        )
                      )
                        e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="dayNumber" value={day.day} />
                    <button
                      type="submit"
                      className="rounded-md border border-red/30 px-2 py-1 text-xs font-medium text-red/80 hover:bg-red/5"
                    >
                      Remove
                    </button>
                  </form>
                )}
              </div>
            </header>

            {editDayId === day.id ? (
              <div className="px-5 py-4">
                <DayForm
                  initial={{
                    id: day.id,
                    city: day.city,
                    title: day.title,
                    summary: day.summary,
                    transport: day.transport,
                    restDay: day.restDay,
                  }}
                  onClose={() => setEditDayId(null)}
                />
              </div>
            ) : (
              <div className="space-y-1 px-5 py-4">
                {day.summary && (
                  <p className="text-sm text-ink/70">{day.summary}</p>
                )}
                {day.transport && (
                  <p className="flex items-start gap-1.5 pt-1 text-sm text-ink/60">
                    <span aria-hidden>🚆</span>
                    <span>{day.transport}</span>
                  </p>
                )}
              </div>
            )}

            <ul className="divide-y divide-ink/10 border-t border-ink/10">
              {acts.map((act) => {
                const dim = filtering && !filters.has(act.category);
                const linkedStay = act.stayId
                  ? stays.find((s) => s.id === act.stayId)
                  : null;
                const linkedResv = act.reservationId
                  ? reservations.find((r) => r.id === act.reservationId)
                  : null;
                if (editId === act.id) {
                  return (
                    <li key={act.id} className="px-5 py-3">
                      <ActivityForm
                        dayNumber={day.day}
                        initial={act}
                        stays={stays}
                        reservations={reservations}
                        onClose={() => setEditId(null)}
                      />
                    </li>
                  );
                }
                return (
                  <li
                    key={act.id}
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
                        {act.isSecret && <SecretBadge />}
                      </div>
                      {act.description && (
                        <p className="mt-0.5 text-sm text-ink/70">
                          {act.description}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/55">
                        {act.cost && <span>💴 {act.cost}</span>}
                        {act.booking && <span>📌 {act.booking}</span>}
                        {act.location && (
                          <a
                            href={mapsUrl(act.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-red hover:underline"
                          >
                            📍 Map ↗
                          </a>
                        )}
                        {linkedStay && (
                          <a
                            href={stayMapHref(linkedStay)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded border border-sky/40 bg-sky/10 px-1.5 py-0.5 font-medium text-ink hover:bg-sky/20"
                          >
                            🛏️ {linkedStay.area}
                          </a>
                        )}
                        {linkedResv &&
                          (linkedResv.url ? (
                            <a
                              href={linkedResv.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded border border-lantern/50 bg-lantern/15 px-1.5 py-0.5 font-medium text-ink hover:bg-lantern/25"
                            >
                              📌 {linkedResv.title}
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded border border-lantern/50 bg-lantern/15 px-1.5 py-0.5 font-medium text-ink">
                              📌 {linkedResv.title}
                            </span>
                          ))}
                        {act.canManage && (
                          <>
                            <button
                              onClick={() => setEditId(act.id)}
                              className="font-medium text-ink/70 hover:underline"
                            >
                              Edit
                            </button>
                            <form
                              action={deleteActivityAction}
                              onSubmit={(e) => {
                                if (!confirm("Delete this activity?"))
                                  e.preventDefault();
                              }}
                              className="inline"
                            >
                              <input type="hidden" name="id" value={act.id} />
                              <button
                                type="submit"
                                className="font-medium text-red/80 hover:underline"
                              >
                                Delete
                              </button>
                            </form>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}

              {/* Add activity */}
              <li className="px-5 py-3">
                {addOn === day.day ? (
                  <ActivityForm
                    dayNumber={day.day}
                    stays={stays}
                    reservations={reservations}
                    onClose={() => setAddOn(null)}
                  />
                ) : (
                  <button
                    onClick={() => setAddOn(day.day)}
                    className="text-sm font-medium text-red hover:underline"
                  >
                    + Add activity
                  </button>
                )}
              </li>
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
                    href={stayHotelHref(stay)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red hover:underline"
                  >
                    🏨 {stayHotelLabel(stay)} ↗
                  </a>
                  <a
                    href={stayMapHref(stay)}
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
      })}

      {/* Add a day */}
      {addingDay ? (
        <DayForm onClose={() => setAddingDay(false)} />
      ) : (
        <button
          onClick={() => setAddingDay(true)}
          className="w-full rounded-lg border border-dashed border-ink/25 bg-white/60 px-4 py-3 text-sm font-semibold text-ink/70 hover:border-ink/40 hover:text-ink"
        >
          + Add a day (Day {lastDay + 1})
        </button>
      )}
    </div>
  );
}
