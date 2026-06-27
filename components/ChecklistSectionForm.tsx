"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  addSectionAction,
  renameSectionAction,
} from "@/app/actions/checklist";
import type { FormResult } from "@/app/actions/activities";
import { useUI } from "@/lib/ui";

const inputCls =
  "min-w-0 flex-1 rounded-md border border-ink/20 bg-white px-2.5 py-1.5 text-base text-ink sm:text-sm focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30";

export function ChecklistSectionForm({
  kind,
  initial,
  onClose,
}: {
  kind: string;
  initial?: { id: number; title: string };
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormResult, FormData>(
    initial ? renameSectionAction : addSectionAction,
    {}
  );
  const router = useRouter();
  const { toast } = useUI();

  useEffect(() => {
    if (state.ok) {
      toast(initial ? "Section renamed" : "Section added");
      onClose();
      router.refresh();
    }
  }, [state.ok, onClose, router, toast, initial]);

  return (
    <form action={formAction} className="space-y-1.5">
      {initial ? (
        <input type="hidden" name="id" value={initial.id} />
      ) : (
        <input type="hidden" name="kind" value={kind} />
      )}
      <div className="flex items-center gap-2">
        <input
          name="title"
          defaultValue={initial?.title ?? ""}
          placeholder="Section name (e.g. Documents)"
          autoFocus
          className={inputCls}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50"
        >
          {pending ? "…" : initial ? "Rename" : "Add section"}
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
