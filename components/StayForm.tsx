"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addStayAction, updateStayAction } from "@/app/actions/stays";
import type { FormResult } from "@/app/actions/activities";
import type { DayOption } from "@/components/ReservationForm";
import type { StayStatus } from "@/lib/stays";
import { useUI } from "@/lib/ui";

export interface StayFormValues {
  id: number;
  city: string;
  area: string;
  fromDay: number;
  toDay: number;
  note: string;
  status: StayStatus;
  url: string | null;
  mapQuery: string | null;
}

const STATUSES: StayStatus[] = ["planned", "maybe", "booked", "paid"];

const inputCls =
  "w-full rounded-md border border-ink/20 bg-white px-2.5 py-1.5 text-base text-ink sm:text-sm focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30";

export function StayForm({
  initial,
  onClose,
  days,
}: {
  initial?: StayFormValues;
  onClose: () => void;
  days: DayOption[];
}) {
  const [state, formAction, pending] = useActionState<FormResult, FormData>(
    initial ? updateStayAction : addStayAction,
    {}
  );
  const router = useRouter();
  const { toast } = useUI();

  useEffect(() => {
    if (state.ok) {
      toast(initial ? "Stay saved" : "Stay added");
      onClose();
      router.refresh();
    }
  }, [state.ok, onClose, router, toast, initial]);

  const firstDay = days[0]?.dayNumber ?? 1;
  const lastDay = days[days.length - 1]?.dayNumber ?? 1;

  return (
    <form
      action={formAction}
      className="space-y-2.5 rounded-md border border-ink/15 bg-paper/60 p-3"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          name="city"
          defaultValue={initial?.city ?? ""}
          placeholder="City (e.g. Kyoto)"
          autoFocus
          className={inputCls}
        />
        <input
          name="area"
          defaultValue={initial?.area ?? ""}
          placeholder="Area / hotel (e.g. Gion)"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label className="text-xs text-ink/55">
          From day
          <select
            name="fromDay"
            defaultValue={initial?.fromDay ?? firstDay}
            className={inputCls}
          >
            {days.map((d) => (
              <option key={d.dayNumber} value={d.dayNumber}>
                Day {d.dayNumber} · {d.city}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ink/55">
          To day
          <select
            name="toDay"
            defaultValue={initial?.toDay ?? lastDay}
            className={inputCls}
          >
            {days.map((d) => (
              <option key={d.dayNumber} value={d.dayNumber}>
                Day {d.dayNumber} · {d.city}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ink/55">
          Status
          <select
            name="status"
            defaultValue={initial?.status ?? "planned"}
            className={inputCls}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <textarea
        name="note"
        defaultValue={initial?.note ?? ""}
        placeholder="Note (why this area, room type, etc.)"
        rows={2}
        className={inputCls}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="text-xs text-ink/55">
          🏨 Hotel link (optional)
          <input
            name="url"
            type="url"
            defaultValue={initial?.url ?? ""}
            placeholder="https://… the booked hotel"
            className={inputCls}
          />
        </label>
        <label className="text-xs text-ink/55">
          📍 Exact map place / address (optional)
          <input
            name="mapQuery"
            defaultValue={initial?.mapQuery ?? ""}
            placeholder="Overrides the area search"
            className={inputCls}
          />
        </label>
      </div>

      {state.error && <p className="text-sm text-red">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : initial ? "Save" : "Add stay"}
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
