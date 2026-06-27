"use client";

import { useState } from "react";
import { bookingUrl, mapsUrl } from "@/lib/links";
import { stayNights, stayQuery, type StayView } from "@/lib/stays";
import { StatusBadge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import { StayForm } from "@/components/StayForm";
import type { DayOption } from "@/components/ReservationForm";
import { deleteStayAction } from "@/app/actions/stays";

export function HotelsBoard({
  stays,
  days,
}: {
  stays: StayView[];
  days: DayOption[];
}) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {adding ? (
        <StayForm days={days} onClose={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink/90"
        >
          + Add a stay
        </button>
      )}

      {stays.length === 0 && !adding && (
        <p className="rounded-lg border border-dashed border-ink/20 bg-white/60 p-6 text-center text-sm text-ink/60">
          No stays yet. Add where you&apos;ll sleep in each city.
        </p>
      )}

      <ul className="space-y-3">
        {stays.map((stay) => {
          if (editId === stay.id) {
            return (
              <li key={stay.id}>
                <StayForm
                  days={days}
                  initial={stay}
                  onClose={() => setEditId(null)}
                />
              </li>
            );
          }
          return (
            <li
              key={stay.id}
              className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Icon name="hotel" size={28} className="h-7 w-7 shrink-0" />
                  <div>
                    <h2 className="font-semibold text-ink">{stay.city}</h2>
                    <p className="text-sm text-ink/70">{stay.area}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={stay.status} />
                  <span className="text-xs text-ink/55">
                    {stay.fromDay === stay.toDay
                      ? `Day ${stay.fromDay}`
                      : `Days ${stay.fromDay}–${stay.toDay}`}{" "}
                    · {stayNights(stay)}{" "}
                    {stayNights(stay) === 1 ? "night" : "nights"}
                  </span>
                </div>
              </div>

              {stay.note && <p className="mt-2 text-sm text-ink/70">{stay.note}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={bookingUrl(stayQuery(stay))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90"
                >
                  🏨 Find hotels ↗
                </a>
                <a
                  href={mapsUrl(stayQuery(stay))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
                >
                  📍 Map ↗
                </a>
                <button
                  onClick={() => setEditId(stay.id)}
                  className="ml-auto text-xs font-medium text-ink/70 hover:underline"
                >
                  Edit
                </button>
                <form
                  action={deleteStayAction}
                  onSubmit={(e) => {
                    if (!confirm("Delete this stay?")) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={stay.id} />
                  <button
                    type="submit"
                    className="text-xs font-medium text-red/80 hover:underline"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-ink/55">
        Stays link to days by their range and feed the &quot;tonight&quot; line
        on the itinerary and the &quot;Now&quot; view. Booked a specific hotel?
        Add it under <strong>Bookings</strong> too for the confirmation number.
      </p>
    </div>
  );
}
