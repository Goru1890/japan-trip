import { statusMeta, type Stay } from "@/lib/trip";

export function StatusBadge({ status }: { status: Stay["status"] }) {
  const m = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${m.chip}`}
    >
      {m.label}
    </span>
  );
}

export function MustDoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-red/40 bg-red/15 px-2 py-0.5 text-[11px] font-semibold text-ink">
      <span aria-hidden>★</span> Must-do
    </span>
  );
}
