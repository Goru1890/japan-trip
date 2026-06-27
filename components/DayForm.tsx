"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDayAction, updateDayAction } from "@/app/actions/days";
import type { FormResult } from "@/app/actions/activities";
import { useUI } from "@/lib/ui";

export interface DayFormValues {
  id: number;
  city: string;
  title: string;
  summary: string;
  transport: string | null;
  restDay: boolean;
}

const inputCls =
  "w-full rounded-md border border-ink/20 bg-white px-2.5 py-1.5 text-base text-ink sm:text-sm focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30";

export function DayForm({
  initial,
  onClose,
}: {
  initial?: DayFormValues;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormResult, FormData>(
    initial ? updateDayAction : addDayAction,
    {}
  );
  const router = useRouter();
  const { toast } = useUI();

  useEffect(() => {
    if (state.ok) {
      toast(initial ? "Day saved" : "Day added");
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          name="city"
          defaultValue={initial?.city ?? ""}
          placeholder="City (e.g. Kanazawa)"
          autoFocus
          className={inputCls}
        />
        <input
          name="title"
          defaultValue={initial?.title ?? ""}
          placeholder="Day title (e.g. Gardens & geisha district)"
          className={inputCls}
        />
      </div>

      <textarea
        name="summary"
        defaultValue={initial?.summary ?? ""}
        placeholder="Short summary of the day (optional)"
        rows={2}
        className={inputCls}
      />

      <input
        name="transport"
        defaultValue={initial?.transport ?? ""}
        placeholder="Travel today (optional, e.g. Kyoto → Kanazawa by Thunderbird)"
        className={inputCls}
      />

      <label className="flex items-center gap-1.5 text-sm text-ink/80">
        <input
          type="checkbox"
          name="restDay"
          defaultChecked={initial?.restDay ?? false}
          className="h-4 w-4 rounded border-ink/30 accent-matcha"
        />
        Relaxed / rest day
      </label>

      {state.error && <p className="text-sm text-red">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : initial ? "Save day" : "Add day"}
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
