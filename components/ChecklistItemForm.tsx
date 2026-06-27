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
  lockedSection,
  sections,
  onClose,
}: {
  kind: string;
  initial?: ChecklistFormValues;
  /** When adding inside a section, the section is fixed (no picker). */
  lockedSection?: string;
  /** Section titles in this kind (for the move-to picker when editing). */
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
    <form action={formAction} className="space-y-2">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="kind" value={initial?.kind ?? kind} />

      <div className="flex flex-wrap items-center gap-2">
        <input
          name="label"
          defaultValue={initial?.label ?? ""}
          placeholder="Item (e.g. Passport)"
          autoFocus
          className={`${inputCls} min-w-0 flex-1`}
        />
        {lockedSection != null ? (
          <input type="hidden" name="section" value={lockedSection} />
        ) : (
          <select
            name="section"
            defaultValue={initial?.section ?? sections[0] ?? "General"}
            className={`${inputCls} w-auto`}
          >
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
        >
          {pending ? "…" : initial ? "Save" : "Add"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-ink/15 px-2.5 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
        >
          Cancel
        </button>
      </div>

      {state.error && <p className="text-sm text-red">{state.error}</p>}
    </form>
  );
}
