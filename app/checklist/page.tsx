import { getChecklist, getChecklistSections } from "@/lib/db/queries";
import { Icon } from "@/components/Icon";
import {
  ChecklistBoard,
  type ChecklistItem,
  type ChecklistSection,
} from "@/components/ChecklistBoard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checklist · Japan Trip" };

export default async function ChecklistPage() {
  const [sectionRows, itemRows] = await Promise.all([
    getChecklistSections(),
    getChecklist(),
  ]);

  const sections: ChecklistSection[] = sectionRows.map((s) => ({
    id: s.id,
    kind: s.kind,
    title: s.title,
  }));
  const items: ChecklistItem[] = itemRows.map((r) => ({
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
            Shared with Rosalie. Add sections, add items inside them, tick as you
            go.
          </p>
        </div>
      </div>

      <ChecklistBoard sections={sections} items={items} />
    </div>
  );
}
