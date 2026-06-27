"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addBudgetAction, updateBudgetAction } from "@/app/actions/budget";
import type { FormResult } from "@/app/actions/activities";
import { useUI } from "@/lib/ui";

export interface BudgetFormValues {
  id: number;
  category: string;
  estimate: number;
  note: string;
}

const inputCls =
  "w-full rounded-md border border-ink/20 bg-white px-2.5 py-1.5 text-sm text-ink focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30";

export function BudgetForm({
  initial,
  onClose,
}: {
  initial?: BudgetFormValues;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormResult, FormData>(
    initial ? updateBudgetAction : addBudgetAction,
    {}
  );
  const router = useRouter();
  const { toast } = useUI();

  useEffect(() => {
    if (state.ok) {
      toast("Saved");
      onClose();
      router.refresh();
    }
  }, [state.ok, onClose, router, toast]);

  return (
    <form
      action={formAction}
      className="space-y-2.5 rounded-md border border-ink/15 bg-paper/60 p-3"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          name="category"
          defaultValue={initial?.category ?? ""}
          placeholder="Category (e.g. Flights)"
          autoFocus
          className={`${inputCls} sm:col-span-2`}
        />
        <label className="text-xs text-ink/55">
          USD total
          <input
            name="estimate"
            type="number"
            min={0}
            step={10}
            defaultValue={initial?.estimate ?? 0}
            className={inputCls}
          />
        </label>
      </div>

      <input
        name="note"
        defaultValue={initial?.note ?? ""}
        placeholder="Note (optional)"
        className={inputCls}
      />

      {state.error && <p className="text-sm text-red">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : initial ? "Save" : "Add line"}
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
