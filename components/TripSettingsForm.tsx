"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setTripSettingsAction } from "@/app/actions/settings";
import type { FormResult } from "@/app/actions/activities";
import { useUI } from "@/lib/ui";

export interface TripSettingsValues {
  title: string;
  subtitle: string;
  travelers: number;
  seasonNote: string;
}

const inputCls =
  "w-full rounded-md border border-ink/20 bg-white px-2.5 py-1.5 text-base text-ink sm:text-sm focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30";

export function TripSettingsForm({ initial }: { initial: TripSettingsValues }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormResult, FormData>(
    setTripSettingsAction,
    {}
  );
  const router = useRouter();
  const { toast } = useUI();

  useEffect(() => {
    if (state.ok) {
      toast("Trip details saved");
      setOpen(false);
      router.refresh();
    }
  }, [state.ok, router, toast]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-red hover:underline"
      >
        Edit trip details
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-2.5 rounded-lg border border-ink/15 bg-white p-4 shadow-soft"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="text-xs text-ink/55 sm:col-span-2">
          Trip title
          <input name="title" defaultValue={initial.title} className={inputCls} />
        </label>
        <label className="text-xs text-ink/55">
          Travelers
          <input
            name="travelers"
            type="number"
            min={1}
            defaultValue={initial.travelers}
            className={inputCls}
          />
        </label>
      </div>
      <label className="block text-xs text-ink/55">
        Subtitle (route)
        <input
          name="subtitle"
          defaultValue={initial.subtitle}
          className={inputCls}
        />
      </label>
      <label className="block text-xs text-ink/55">
        Season note
        <textarea
          name="seasonNote"
          defaultValue={initial.seasonNote}
          rows={2}
          className={inputCls}
        />
      </label>

      {state.error && <p className="text-sm text-red">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
