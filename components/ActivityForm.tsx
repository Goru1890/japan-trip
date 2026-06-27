"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categoryMeta, type Category } from "@/lib/trip";
import {
  addActivityAction,
  updateActivityAction,
  type FormResult,
} from "@/app/actions/activities";

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
}

const inputCls =
  "w-full rounded-md border border-ink/20 bg-white px-2.5 py-1.5 text-sm text-ink focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30";

export function ActivityForm({
  dayNumber,
  initial,
  onClose,
}: {
  dayNumber: number;
  initial?: ActivityFormValues;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormResult, FormData>(
    initial ? updateActivityAction : addActivityAction,
    {}
  );
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      onClose();
      router.refresh();
    }
  }, [state.ok, onClose, router]);

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
