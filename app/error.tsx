"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        🚧
      </span>
      <h1 className="text-2xl font-bold text-ink">Something went sideways</h1>
      <p className="max-w-sm text-sm text-ink/60">
        A hiccup loading this page — your trip data is safe. Try again.
      </p>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
