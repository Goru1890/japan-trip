"use client";

import { useMemo } from "react";
import { packing, prep, type ChecklistSection } from "@/lib/trip";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { CHECKLIST_KEY } from "@/lib/constants";

type Checked = Record<string, boolean>;

function itemKey(group: string, section: string, item: string) {
  return `${group}::${section}::${item}`;
}

export default function ChecklistPage() {
  const [checked, setChecked, loaded] = useLocalStorage<Checked>(
    CHECKLIST_KEY,
    {}
  );

  const allItems = useMemo(() => {
    const keys: string[] = [];
    for (const [group, sections] of [
      ["prep", prep],
      ["packing", packing],
    ] as const) {
      for (const s of sections)
        for (const i of s.items) keys.push(itemKey(group, s.title, i));
    }
    return keys;
  }, []);

  const doneCount = loaded
    ? allItems.filter((k) => checked[k]).length
    : 0;
  const pct = Math.round((doneCount / allItems.length) * 100);

  function toggle(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Prep & packing</h1>
        <p className="text-sm text-stone-500">
          Progress saves in your browser. Two lists: a countdown timeline and
          what to pack.
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-stone-200 bg-white/70 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {loaded ? `${doneCount} of ${allItems.length} done` : "—"}
          </span>
          <span className="tabular-nums text-stone-500">{loaded ? `${pct}%` : ""}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: loaded ? `${pct}%` : "0%" }}
          />
        </div>
      </div>

      <ChecklistGroup
        heading="Before you go"
        group="prep"
        sections={prep}
        checked={checked}
        loaded={loaded}
        onToggle={toggle}
      />
      <ChecklistGroup
        heading="What to pack"
        group="packing"
        sections={packing}
        checked={checked}
        loaded={loaded}
        onToggle={toggle}
      />
    </div>
  );
}

function ChecklistGroup({
  heading,
  group,
  sections,
  checked,
  loaded,
  onToggle,
}: {
  heading: string;
  group: string;
  sections: ChecklistSection[];
  checked: Checked;
  loaded: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-stone-200 bg-white/80 p-4"
          >
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const key = itemKey(group, section.title, item);
                const isChecked = loaded && !!checked[key];
                return (
                  <li key={item}>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-stone-50">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(key)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 accent-emerald-600"
                      />
                      <span
                        className={[
                          "text-sm",
                          isChecked ? "text-stone-400 line-through" : "text-stone-700",
                        ].join(" ")}
                      >
                        {item}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
