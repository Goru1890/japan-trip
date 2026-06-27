"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useAudio } from "@/lib/audio";
import {
  setCheckedAction,
  deleteChecklistAction,
  deleteSectionAction,
  moveSectionAction,
} from "@/app/actions/checklist";
import {
  ChecklistItemForm,
  type ChecklistFormValues,
} from "@/components/ChecklistItemForm";
import { ChecklistSectionForm } from "@/components/ChecklistSectionForm";

export interface ChecklistItem {
  id: number;
  kind: string;
  section: string;
  label: string;
  checked: boolean;
}

export interface ChecklistSection {
  id: number;
  kind: string;
  title: string;
}

const KIND_LABEL: Record<string, string> = {
  prep: "Before you go",
  packing: "What to pack",
};

export function ChecklistBoard({
  sections,
  items,
}: {
  sections: ChecklistSection[];
  items: ChecklistItem[];
}) {
  const { play } = useAudio();
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [addInSection, setAddInSection] = useState<number | null>(null);
  const [renameSectionId, setRenameSectionId] = useState<number | null>(null);
  const [newSectionKind, setNewSectionKind] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const isChecked = (it: ChecklistItem) => checks[it.id] ?? it.checked;

  const kinds = useMemo(() => {
    const base = ["prep", "packing"];
    const present = Array.from(new Set(sections.map((s) => s.kind)));
    return [...base, ...present.filter((k) => !base.includes(k))];
  }, [sections]);

  const done = items.filter(isChecked).length;
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

      {kinds.map((kind) => {
        const kindSections = sections.filter((s) => s.kind === kind);
        const sectionTitles = kindSections.map((s) => s.title);
        return (
          <section key={kind} className="space-y-3">
            <h2 className="text-lg font-semibold text-ink">
              {KIND_LABEL[kind] ?? kind}
            </h2>

            {kindSections.map((section, idx) => {
              const secItems = items.filter(
                (i) => i.kind === kind && i.section === section.title
              );
              return (
                <div
                  key={section.id}
                  className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft"
                >
                  {/* Section header */}
                  {renameSectionId === section.id ? (
                    <ChecklistSectionForm
                      kind={kind}
                      initial={{ id: section.id, title: section.title }}
                      onClose={() => setRenameSectionId(null)}
                    />
                  ) : (
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/55">
                        {section.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-ink/45">
                        <SectionMove id={section.id} dir="up" disabled={idx === 0} />
                        <SectionMove
                          id={section.id}
                          dir="down"
                          disabled={idx === kindSections.length - 1}
                        />
                        <button
                          onClick={() => setRenameSectionId(section.id)}
                          className="px-1 hover:text-ink hover:underline"
                        >
                          Rename
                        </button>
                        <form
                          action={deleteSectionAction}
                          onSubmit={(e) => {
                            if (
                              !confirm(
                                `Delete "${section.title}" and its ${secItems.length} item(s)?`
                              )
                            )
                              e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="id" value={section.id} />
                          <button
                            type="submit"
                            className="px-1 text-red/80 hover:underline"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <ul className="space-y-1">
                    {secItems.map((it) => {
                      if (editItemId === it.id) {
                        return (
                          <li key={it.id} className="py-1">
                            <ChecklistItemForm
                              kind={kind}
                              initial={it as ChecklistFormValues}
                              sections={sectionTitles}
                              onClose={() => setEditItemId(null)}
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
                              onClick={() => setEditItemId(it.id)}
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
                    {secItems.length === 0 && (
                      <li className="px-1.5 py-1 text-sm text-ink/40">
                        No items yet.
                      </li>
                    )}
                  </ul>

                  {/* Add item in this section */}
                  <div className="mt-2">
                    {addInSection === section.id ? (
                      <ChecklistItemForm
                        kind={kind}
                        lockedSection={section.title}
                        sections={sectionTitles}
                        onClose={() => setAddInSection(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setAddInSection(section.id)}
                        className="text-sm font-medium text-red hover:underline"
                      >
                        + Add item
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* New section */}
            {newSectionKind === kind ? (
              <ChecklistSectionForm
                kind={kind}
                onClose={() => setNewSectionKind(null)}
              />
            ) : (
              <button
                onClick={() => setNewSectionKind(kind)}
                className="rounded-md border border-dashed border-ink/25 px-3 py-1.5 text-sm font-medium text-ink/70 hover:border-ink/40 hover:text-ink"
              >
                + New section
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}

function SectionMove({
  id,
  dir,
  disabled,
}: {
  id: number;
  dir: "up" | "down";
  disabled: boolean;
}) {
  if (disabled) {
    return <span className="px-1 opacity-30">{dir === "up" ? "↑" : "↓"}</span>;
  }
  return (
    <form action={moveSectionAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <button
        type="submit"
        title={`Move ${dir}`}
        className="px-1 hover:text-ink"
      >
        {dir === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}
