"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  addReservationAction,
  updateReservationAction,
} from "@/app/actions/reservations";
import type { FormResult } from "@/app/actions/activities";
import { useUI } from "@/lib/ui";

export type DayOption = { dayNumber: number; city: string };

export interface ReservationFormValues {
  id: number;
  type: string;
  title: string;
  startsAtInput: string;
  dayNumber: number | null;
  confirmation: string | null;
  url: string | null;
  notes: string | null;
  isSecret: boolean;
}

const TYPES = ["hotel", "restaurant", "transport", "activity", "other"] as const;

const inputCls =
  "w-full rounded-md border border-ink/20 bg-white px-2.5 py-1.5 text-sm text-ink focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30";

export function ReservationForm({
  initial,
  onClose,
  days,
}: {
  initial?: ReservationFormValues;
  onClose: () => void;
  days: DayOption[];
}) {
  const [state, formAction, pending] = useActionState<FormResult, FormData>(
    initial ? updateReservationAction : addReservationAction,
    {}
  );
  const router = useRouter();
  const { toast } = useUI();

  useEffect(() => {
    if (state.ok) {
      toast(initial ? "Booking saved" : "Booking added");
      onClose();
      router.refresh();
    }
  }, [state.ok, onClose, router, toast, initial]);

  return (
    <form
      action={formAction}
      className="space-y-2.5 rounded-md border border-ink/15 bg-paper/60 p-3"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <select
          name="type"
          defaultValue={initial?.type ?? "hotel"}
          className={inputCls}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <input
          name="title"
          defaultValue={initial?.title ?? ""}
          placeholder="Name (e.g. Hotel Granbell)"
          autoFocus
          className={`${inputCls} sm:col-span-2`}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="text-xs text-ink/55">
          Date &amp; time (JST)
          <input
            type="datetime-local"
            name="startsAt"
            defaultValue={initial?.startsAtInput ?? ""}
            className={inputCls}
          />
        </label>
        <label className="text-xs text-ink/55">
          Link to day (optional)
          <select
            name="dayNumber"
            defaultValue={initial?.dayNumber ?? ""}
            className={inputCls}
          >
            <option value="">— none —</option>
            {days.map((d) => (
              <option key={d.dayNumber} value={d.dayNumber}>
                Day {d.dayNumber} · {d.city}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          name="confirmation"
          defaultValue={initial?.confirmation ?? ""}
          placeholder="Confirmation #"
          className={inputCls}
        />
        <input
          name="url"
          type="url"
          defaultValue={initial?.url ?? ""}
          placeholder="Booking link (https://…)"
          className={inputCls}
        />
      </div>

      <textarea
        name="notes"
        defaultValue={initial?.notes ?? ""}
        placeholder="Notes (address, who booked, etc.)"
        rows={2}
        className={inputCls}
      />

      <label className="flex items-center gap-1.5 text-sm text-ink/80">
        <input
          type="checkbox"
          name="isSecret"
          defaultChecked={initial?.isSecret ?? false}
          className="h-4 w-4 rounded border-ink/30 accent-cedar"
        />
        🔒 Secret (only you can see it)
      </label>

      {state.error && <p className="text-sm text-red">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : initial ? "Save" : "Add booking"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
