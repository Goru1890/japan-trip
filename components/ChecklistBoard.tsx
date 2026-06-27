"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useAudio } from "@/lib/audio";
import {
  setCheckedAction,
  deleteChecklistAction,
} from "@/app/actions/checklist";
import {
  ChecklistItemForm,
  type ChecklistFormValues,
} from "@/components/ChecklistItemForm";

export interface ChecklistItem {
  id: number;
  kind: string;
  section: string;
  label: string;
  checked: boolean;
}

const KIND_LABEL: Record<string, string> = {
  prep: "Before you go",
  packing: "What to pack",
};

export function ChecklistBoard({ items }: { items: ChecklistItem[] }) {
  const { play } = useAudio();
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [addKind, setAddKind] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const isChecked = (it: ChecklistItem) => checks[it.id] ?? it.checked;

  const sections = useMemo(
    () => Array.from(new Set(items.map((i) => i.section))),
    [items]
  );

  const grouped = useMemo(() => {
    const byKind: Record<string, Record<string, ChecklistItem[]>> = {};
    for (const it of items) {
      (byKind[it.kind] ??= {});
      (byKind[it.kind][it.section] ??= []).push(it);
    }
    return byKind;
  }, [items]);

  const kinds = useMemo(() => {
    const base = ["prep", "packing"];
    const keys = Object.keys(grouped);
    return [...base, ...keys.filter((k) => !base.includes(k))];
  }, [grouped]);

  const done = items.filter((i) => isChecked(i)).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  function toggle(it: ChecklistItem) {
    const next = !isChecked(it);
    setChecks((c) => ({ ...c, [it.id]: next }));
    if (next) play("complete");
    startTransition(() => setCheckedAction(it.id, next));
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink">
            {done} of {total} done
          </span>
          <span className="tabular-nums text-ink/55">{pct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-matcha transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {allDone && (
        <div className="flex items-center gap-3 rounded-lg border border-matcha/50 bg-matcha/15 p-4">
          <Image
            src="/assets/images/mascot-suitcase-daruma.svg"
            alt=""
            aria-hidden
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12"
          />
          <p className="text-sm font-medium text-ink">
            All set — fully packed and prepped. Have an amazing trip! 🎉
          </p>
        </div>
      )}

      {kinds.map((kind) => (
        <section key={kind} className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">
            {KIND_LABEL[kind] ?? kind}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.entries(grouped[kind] ?? {}).map(([section, secItems]) => (
              <div
                key={section}
                className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft"
              >
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/55">
                  {section}
                </h3>
                <ul className="space-y-1">
                  {secItems.map((it) => {
                    if (editId === it.id) {
                      return (
                        <li key={it.id}>
                          <ChecklistItemForm
                            kind={it.kind}
                            initial={it as ChecklistFormValues}
                            sections={sections}
                            onClose={() => setEditId(null)}
                          />
                        </li>
                      );
                    }
                    const checked = isChecked(it);
                    return (
                      <li
                        key={it.id}
                        className="group flex items-start gap-2.5 rounded-md px-1.5 py-1.5 hover:bg-paper/70"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(it)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink/30 accent-matcha"
                        />
                        <span
                          className={[
                            "flex-1 text-sm",
                            checked
                              ? "text-ink/40 line-through"
                              : "text-ink/80",
                          ].join(" ")}
                        >
                          {it.label}
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => setEditId(it.id)}
                            className="text-ink/60 hover:underline"
                          >
                            Edit
                          </button>
                          <form
                            action={deleteChecklistAction}
                            onSubmit={(e) => {
                              if (!confirm("Delete this item?"))
                                e.preventDefault();
                            }}
                          >
                            <input type="hidden" name="id" value={it.id} />
                            <button
                              type="submit"
                              className="text-red/80 hover:underline"
                            >
                              Delete
                            </button>
                          </form>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {addKind === kind ? (
            <ChecklistItemForm
              kind={kind}
              sections={sections}
              onClose={() => setAddKind(null)}
            />
          ) : (
            <button
              onClick={() => setAddKind(kind)}
              className="text-sm font-medium text-red hover:underline"
            >
              + Add to {KIND_LABEL[kind] ?? kind}
            </button>
          )}
        </section>
      ))}
    </div>
  );
}
