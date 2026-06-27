import { getBudget, getDays, getSettings } from "@/lib/db/queries";
import { Icon } from "@/components/Icon";
import { BudgetBoard, type BudgetLineView } from "@/components/BudgetBoard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Budget · Japan Trip" };

export default async function BudgetPage() {
  const [rows, dayRows, settings] = await Promise.all([
    getBudget(),
    getDays(),
    getSettings(),
  ]);

  const lines: BudgetLineView[] = rows.map((r) => ({
    id: r.id,
    category: r.category,
    estimate: r.estimate,
    note: r.note,
  }));
  const travelers = Number(settings.travelers || "1") || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <Icon name="budget" size={32} className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Budget estimate
          </h1>
          <p className="text-sm text-ink/60">
            Per-person planning figures. Add, edit, or remove lines as you book.
          </p>
        </div>
      </div>

      <BudgetBoard lines={lines} daysCount={dayRows.length} travelers={travelers} />

      <p className="text-xs text-ink/55">
        Flights + accommodation usually run 50–70% of the budget. Shoulder-season
        travel and point-to-point rail can trim 20–40%.
      </p>
    </div>
  );
}
