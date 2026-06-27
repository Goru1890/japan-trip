"use client";

import { useState } from "react";
import { formatUsd } from "@/lib/format";
import { BudgetForm, type BudgetFormValues } from "@/components/BudgetForm";
import { deleteBudgetAction } from "@/app/actions/budget";
import { DangerButton } from "@/components/DangerButton";

export type BudgetLineView = BudgetFormValues;

function SummaryCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg border px-4 py-4 shadow-soft",
        accent ? "border-red/30 bg-red/5" : "border-ink/10 bg-white",
      ].join(" ")}
    >
      <div className="text-xs uppercase tracking-wide text-ink/55">{label}</div>
      <div className="mt-1 text-xl font-bold text-ink">{value}</div>
    </div>
  );
}

export function BudgetBoard({
  lines,
  daysCount,
  travelers,
}: {
  lines: BudgetLineView[];
  daysCount: number;
  travelers: number;
}) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const total = lines.reduce((s, l) => s + l.estimate, 0);
  const perDay = daysCount > 0 ? Math.round(total / daysCount) : 0;
  const max = Math.max(1, ...lines.map((l) => l.estimate));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Estimated total" value={formatUsd(total)} accent />
        <SummaryCard label="Per day" value={formatUsd(perDay)} />
        <SummaryCard
          label="Travelers"
          value={`${travelers} · ${formatUsd(total * travelers)}`}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
        <ul className="divide-y divide-ink/10">
          {lines.map((line) => {
            if (editId === line.id) {
              return (
                <li key={line.id} className="px-4 py-3">
                  <BudgetForm initial={line} onClose={() => setEditId(null)} />
                </li>
              );
            }
            const pct = total > 0 ? Math.round((line.estimate / total) * 100) : 0;
            return (
              <li key={line.id} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium text-ink">{line.category}</span>
                  <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
                    <span className="font-semibold text-ink">
                      {formatUsd(line.estimate)}
                    </span>
                    <span className="text-xs text-ink/45">{pct}%</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-lantern"
                    style={{ width: `${(line.estimate / max) * 100}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p className="text-xs text-ink/55">{line.note}</p>
                  <span className="flex shrink-0 items-center gap-3 text-xs font-medium">
                    <button
                      onClick={() => setEditId(line.id)}
                      className="text-ink/70 hover:underline"
                    >
                      Edit
                    </button>
                    <DangerButton
                      action={deleteBudgetAction}
                      fields={{ id: line.id }}
                      confirm="Delete this line?"
                      toast="Line deleted"
                      label="Delete"
                      className="text-red/80 hover:underline"
                    />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-ink/10 bg-paper/60 px-5 py-4">
          <span className="font-semibold text-ink">Total</span>
          <span className="text-lg font-bold tabular-nums text-ink">
            {formatUsd(total)}
          </span>
        </div>
      </div>

      {adding ? (
        <BudgetForm onClose={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink/90"
        >
          + Add a budget line
        </button>
      )}
    </div>
  );
}
