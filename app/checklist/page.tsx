import { getChecklist } from "@/lib/db/queries";
import { Icon } from "@/components/Icon";
import { ChecklistBoard, type ChecklistItem } from "@/components/ChecklistBoard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checklist · Japan Trip" };

export default async function ChecklistPage() {
  const rows = await getChecklist();
  const items: ChecklistItem[] = rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    section: r.section,
    label: r.label,
    checked: r.checked,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <Icon name="checklist" size={32} className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Prep &amp; packing
          </h1>
          <p className="text-sm text-ink/60">
            Shared between you and Rosalie — add, tick, or remove items. Ticks
            save for both of you.
          </p>
        </div>
      </div>

      <ChecklistBoard items={items} />
    </div>
  );
}
