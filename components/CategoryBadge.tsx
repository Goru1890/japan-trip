import { categoryMeta, type Category } from "@/lib/trip";

export function CategoryBadge({
  category,
  size = "md",
}: {
  category: Category;
  size?: "sm" | "md";
}) {
  const meta = categoryMeta[category] ?? categoryMeta.city;
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border font-medium",
        meta.chip,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs",
      ].join(" ")}
    >
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}

export function CategoryDot({ category }: { category: Category }) {
  return (
    <span
      aria-hidden
      className={[
        "inline-block h-2.5 w-2.5 rounded-full",
        (categoryMeta[category] ?? categoryMeta.city).dot,
      ].join(" ")}
    />
  );
}
