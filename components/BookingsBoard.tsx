"use client";

import { useState } from "react";
import { SecretBadge } from "@/components/Badge";
import {
  ReservationForm,
  type ReservationFormValues,
  type DayOption,
} from "@/components/ReservationForm";
import { deleteReservationAction } from "@/app/actions/reservations";
import { DangerButton } from "@/components/DangerButton";

export interface BoardReservation extends ReservationFormValues {
  startsAtLabel: string | null;
  canManage: boolean;
}

const TYPE_EMOJI: Record<string, string> = {
  hotel: "🏨",
  restaurant: "🍽️",
  transport: "🚆",
  activity: "🎟️",
  other: "📌",
};

export function BookingsBoard({
  reservations,
  days,
}: {
  reservations: BoardReservation[];
  days: DayOption[];
}) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const cityForDay = (n: number | null) =>
    n == null ? null : days.find((d) => d.dayNumber === n)?.city ?? null;

  return (
    <div className="space-y-4">
      {adding ? (
        <ReservationForm days={days} onClose={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink/90"
        >
          + Add a booking
        </button>
      )}

      {reservations.length === 0 && !adding && (
        <p className="rounded-lg border border-dashed border-ink/20 bg-white/60 p-6 text-center text-sm text-ink/60">
          No bookings yet. Add your booking.com stays, restaurant reservations,
          and transport tickets here.
        </p>
      )}

      <ul className="space-y-3">
        {reservations.map((r) => {
          if (editId === r.id) {
            return (
              <li key={r.id}>
                <ReservationForm
                  days={days}
                  initial={r}
                  onClose={() => setEditId(null)}
                />
              </li>
            );
          }
          const city = cityForDay(r.dayNumber);
          return (
            <li
              key={r.id}
              className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="text-xl" aria-hidden>
                    {TYPE_EMOJI[r.type] ?? "📌"}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-ink">{r.title}</h2>
                      {r.isSecret && <SecretBadge />}
                    </div>
                    <p className="text-sm text-ink/60">
                      {r.startsAtLabel ? `${r.startsAtLabel} (JST)` : "No time set"}
                      {r.dayNumber ? ` · Day ${r.dayNumber}${city ? ` · ${city}` : ""}` : ""}
                      {r.confirmation ? ` · #${r.confirmation}` : ""}
                    </p>
                    {r.notes && (
                      <p className="mt-1 text-sm text-ink/70">{r.notes}</p>
                    )}
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm font-medium text-red hover:underline"
                      >
                        Open booking ↗
                      </a>
                    )}
                  </div>
                </div>
                {r.canManage && (
                  <div className="flex shrink-0 items-center gap-3 text-xs font-medium">
                    <button
                      onClick={() => setEditId(r.id)}
                      className="text-ink/70 hover:underline"
                    >
                      Edit
                    </button>
                    <DangerButton
                      action={deleteReservationAction}
                      fields={{ id: r.id }}
                      confirm="Delete this booking?"
                      toast="Booking deleted"
                      label="Delete"
                      className="text-red/80 hover:underline"
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
