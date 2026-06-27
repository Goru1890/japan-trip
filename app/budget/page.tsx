import { budget, days, tripMeta } from "@/lib/trip";
import { formatUsd } from "@/lib/format";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Budget · Japan Trip" };

export default function BudgetPage() {
  const total = budget.reduce((sum, b) => sum + b.estimate, 0);
  const perDay = Math.round(total / days.length);
  const max = Math.max(...budget.map((b) => b.estimate));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <Icon name="budget" size={32} className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Budget estimate
          </h1>
          <p className="text-sm text-ink/60">
            Rough per-person planning figures for a ~2-week mid-range trip.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Estimated total" value={formatUsd(total)} accent />
        <SummaryCard label="Per day" value={formatUsd(perDay)} />
        <SummaryCard
          label="Travelers"
          value={`${tripMeta.travelers} · ${formatUsd(total * tripMeta.travelers)}`}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
        <ul className="divide-y divide-ink/10">
          {budget.map((line) => {
            const pct = Math.round((line.estimate / total) * 100);
            return (
              <li key={line.category} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium text-ink">{line.category}</span>
                  <span className="shrink-0 tabular-nums font-semibold text-ink">
                    {formatUsd(line.estimate)}
                    <span className="ml-1.5 text-xs font-normal text-ink/45">
                      {pct}%
                    </span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-lantern"
                    style={{ width: `${(line.estimate / max) * 100}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-ink/55">{line.note}</p>
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

      <p className="text-xs text-ink/55">
        Flights + accommodation usually run 50–70% of the budget. Shoulder-season
        travel and point-to-point rail can trim 20–40%.
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
        "rounded-lg border px-4 py-4 shadow-soft",
        accent ? "border-red/30 bg-red/5" : "border-ink/10 bg-white",
      ].join(" ")}
    >
      <div className="text-xs uppercase tracking-wide text-ink/55">{label}</div>
      <div className="mt-1 text-xl font-bold text-ink">{value}</div>
    </div>
  );
}
