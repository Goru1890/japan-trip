"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  addChecklistAction,
  updateChecklistAction,
} from "@/app/actions/checklist";
import type { FormResult } from "@/app/actions/activities";

export interface ChecklistFormValues {
  id: number;
  kind: string;
  section: string;
  label: string;
}

const inputCls =
  "w-full rounded-md border border-ink/20 bg-white px-2.5 py-1.5 text-sm text-ink focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30";

export function ChecklistItemForm({
  kind,
  initial,
  sections,
  onClose,
}: {
  kind: string;
  initial?: ChecklistFormValues;
  sections: string[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormResult, FormData>(
    initial ? updateChecklistAction : addChecklistAction,
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
      className="space-y-2 rounded-md border border-ink/15 bg-paper/60 p-3"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="kind" value={initial?.kind ?? kind} />

      <input
        name="label"
        defaultValue={initial?.label ?? ""}
        placeholder="Item (e.g. Passport)"
        autoFocus
        className={inputCls}
      />
      <input
        name="section"
        defaultValue={initial?.section ?? ""}
        list="checklist-sections"
        placeholder="Section (e.g. Documents)"
        className={inputCls}
      />
      <datalist id="checklist-sections">
        {sections.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

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
