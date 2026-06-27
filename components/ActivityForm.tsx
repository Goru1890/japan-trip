"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categoryMeta, type Category } from "@/lib/trip";
import type { StayView } from "@/lib/stays";
import { useUI } from "@/lib/ui";
import {
  addActivityAction,
  updateActivityAction,
  type FormResult,
} from "@/app/actions/activities";

export interface ReservationLite {
  id: number;
  title: string;
  type: string;
  url: string | null;
  confirmation: string | null;
}

export interface ActivityFormValues {
  id: number;
  time: string | null;
  title: string;
  description: string;
  category: Category;
  cost: string | null;
  booking: string | null;
  location: string | null;
  mustDo: boolean;
  isSecret: boolean;
  stayId: number | null;
  reservationId: number | null;
}

const inputCls =
  "w-full rounded-md border border-ink/20 bg-white px-2.5 py-1.5 text-sm text-ink focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30";

export function ActivityForm({
  dayNumber,
  initial,
  onClose,
  stays,
  reservations,
}: {
  dayNumber: number;
  initial?: ActivityFormValues;
  onClose: () => void;
  stays: StayView[];
  reservations: ReservationLite[];
}) {
  const [state, formAction, pending] = useActionState<FormResult, FormData>(
    initial ? updateActivityAction : addActivityAction,
    {}
  );
  const router = useRouter();
  const { toast } = useUI();
  const [showAdvanced, setShowAdvanced] = useState(Boolean(initial));

  useEffect(() => {
    if (state.ok) {
      toast(initial ? "Activity saved" : "Activity added");
      onClose();
      router.refresh();
    }
  }, [state.ok, onClose, router, toast, initial]);

  return (
    <form
      action={formAction}
      className="space-y-2.5 rounded-md border border-ink/15 bg-paper/60 p-3"
    >
      <input type="hidden" name="dayNumber" value={dayNumber} />
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <input
        name="title"
        defaultValue={initial?.title ?? ""}
        placeholder="Title (e.g. Lunch at …)"
        autoFocus
        className={inputCls}
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          name="time"
          defaultValue={initial?.time ?? ""}
          placeholder="Time (09:00 / Morning)"
          className={inputCls}
        />
        <select
          name="category"
          defaultValue={initial?.category ?? "city"}
          className={inputCls}
        >
          {(Object.keys(categoryMeta) as Category[]).map((c) => (
            <option key={c} value={c}>
              {categoryMeta[c].emoji} {categoryMeta[c].label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="text-xs font-medium text-ink/60 hover:text-ink"
      >
        {showAdvanced ? "− Fewer options" : "+ More options (notes, cost, links, secret)"}
      </button>

      <div className={showAdvanced ? "space-y-2.5" : "hidden"}>
        <textarea
          name="description"
          defaultValue={initial?.description ?? ""}
          placeholder="Notes / description"
          rows={2}
          className={inputCls}
        />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          name="cost"
          defaultValue={initial?.cost ?? ""}
          placeholder="Cost (¥2,000)"
          className={inputCls}
        />
        <input
          name="booking"
          defaultValue={initial?.booking ?? ""}
          placeholder="Booking note"
          className={inputCls}
        />
        <input
          name="location"
          defaultValue={initial?.location ?? ""}
          placeholder="Map location"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="text-xs text-ink/55">
          🛏️ Linked hotel
          <select
            name="stayId"
            defaultValue={initial?.stayId != null ? String(initial.stayId) : ""}
            className={inputCls}
          >
            <option value="">— none —</option>
            {stays.map((s) => (
              <option key={s.id} value={s.id}>
                {s.city} · {s.area}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ink/55">
          📌 Linked booking
          <select
            name="reservationId"
            defaultValue={
              initial?.reservationId != null ? String(initial.reservationId) : ""
            }
            className={inputCls}
          >
            <option value="">— none —</option>
            {reservations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-ink/80">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            name="mustDo"
            defaultChecked={initial?.mustDo ?? false}
            className="h-4 w-4 rounded border-ink/30 accent-red"
          />
          Must-do
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            name="isSecret"
            defaultChecked={initial?.isSecret ?? false}
            className="h-4 w-4 rounded border-ink/30 accent-cedar"
          />
          🔒 Secret (only you can see it)
        </label>
      </div>
      </div>

      {state.error && <p className="text-sm text-red">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : initial ? "Save" : "Add"}
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
