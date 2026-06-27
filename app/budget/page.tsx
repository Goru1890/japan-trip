import { budget, days, tripMeta } from "@/lib/trip";
import { formatUsd } from "@/lib/format";

export const metadata = { title: "Budget · Japan Trip" };

export default function BudgetPage() {
  const total = budget.reduce((sum, b) => sum + b.estimate, 0);
  const perDay = Math.round(total / days.length);
  const max = Math.max(...budget.map((b) => b.estimate));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Budget estimate</h1>
        <p className="text-sm text-stone-500">
          Rough per-person planning figures for a ~2-week mid-range trip. Refine
          as you book — edit <code className="rounded bg-stone-100 px-1">lib/trip.ts</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Estimated total" value={formatUsd(total)} accent />
        <SummaryCard label="Per day" value={formatUsd(perDay)} />
        <SummaryCard
          label="Travelers"
          value={`${tripMeta.travelers} · ${formatUsd(total * tripMeta.travelers)}`}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white/80">
        <ul className="divide-y divide-stone-100">
          {budget.map((line) => {
            const pct = Math.round((line.estimate / total) * 100);
            return (
              <li key={line.category} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium">{line.category}</span>
                  <span className="shrink-0 tabular-nums font-semibold">
                    {formatUsd(line.estimate)}
                    <span className="ml-1.5 text-xs font-normal text-stone-400">
                      {pct}%
                    </span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-vermillion/80"
                    style={{ width: `${(line.estimate / max) * 100}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-stone-500">{line.note}</p>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50/60 px-5 py-4">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold tabular-nums">{formatUsd(total)}</span>
        </div>
      </div>

      <p className="text-xs text-stone-500">
        Tip from the planning framework: flights + accommodation usually run
        50–70% of the budget. Shoulder-season travel and point-to-point rail can
        trim 20–40%.
      </p>
    </div>
  );
}

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
        "rounded-2xl border px-4 py-4",
        accent
          ? "border-vermillion/30 bg-vermillion/5"
          : "border-stone-200 bg-white/70",
      ].join(" ")}
    >
      <div className="text-xs uppercase tracking-wide text-stone-500">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}
