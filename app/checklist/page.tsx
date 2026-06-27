"use client";

import { useMemo } from "react";
import Image from "next/image";
import { packing, prep, type ChecklistSection } from "@/lib/trip";
import { useTripState } from "@/lib/state";
import { useAudio } from "@/lib/audio";
import { SyncSettings } from "@/components/SyncSettings";
import { Icon } from "@/components/Icon";

type Checked = Record<string, boolean>;

function itemKey(group: string, section: string, item: string) {
  return `${group}::${section}::${item}`;
}

export default function ChecklistPage() {
  const { checklist, toggleChecklistItem, loaded } = useTripState();
  const { play } = useAudio();

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

  const doneCount = loaded ? allItems.filter((k) => checklist[k]).length : 0;
  const pct = Math.round((doneCount / allItems.length) * 100);
  const allDone = loaded && doneCount === allItems.length;

  function handleToggle(key: string) {
    if (!checklist[key]) play("complete"); // only on check, not uncheck
    toggleChecklistItem(key);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <Icon name="checklist" size={32} className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Prep &amp; packing
          </h1>
          <p className="text-sm text-ink/60">
            A countdown timeline and a packing list. Progress saves automatically.
          </p>
        </div>
      </div>

      <SyncSettings />

      {/* Progress */}
      <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink">
            {loaded ? `${doneCount} of ${allItems.length} done` : "—"}
          </span>
          <span className="tabular-nums text-ink/55">
            {loaded ? `${pct}%` : ""}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-matcha transition-all"
            style={{ width: loaded ? `${pct}%` : "0%" }}
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
            All set — you&apos;re fully packed and prepped. Have an amazing trip! 🎉
          </p>
        </div>
      )}

      <ChecklistGroup
        heading="Before you go"
        group="prep"
        sections={prep}
        checked={checklist}
        loaded={loaded}
        onToggle={handleToggle}
      />
      <ChecklistGroup
        heading="What to pack"
        group="packing"
        sections={packing}
        checked={checklist}
        loaded={loaded}
        onToggle={handleToggle}
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
      <h2 className="text-lg font-semibold text-ink">{heading}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft"
          >
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/55">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const key = itemKey(group, section.title, item);
                const isChecked = loaded && !!checked[key];
                return (
                  <li key={item}>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-md px-1.5 py-1.5 hover:bg-paper/70">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(key)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink/30 accent-matcha"
                      />
                      <span
                        className={[
                          "text-sm",
                          isChecked
                            ? "text-ink/40 line-through"
                            : "text-ink/80",
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
