export default function Loading() {
  return (
    <div className="flex items-center justify-center py-24 text-sm text-ink/60">
      <span
        aria-hidden
        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-ink/70"
      />
      <span className="ml-3">Loading…</span>
      <span className="sr-only">Loading</span>
    </div>
  );
}
