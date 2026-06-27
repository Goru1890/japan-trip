import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Image
        src="/assets/images/mascot-suitcase-daruma.svg"
        alt=""
        aria-hidden
        width={96}
        height={96}
        unoptimized
        className="h-24 w-24"
      />
      <h1 className="text-2xl font-bold text-ink">Off the map</h1>
      <p className="max-w-sm text-sm text-ink/60">
        This page wandered off the itinerary. Let&apos;s get you back to the plan.
      </p>
      <Link
        href="/"
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
      >
        Back to the planner
      </Link>
    </div>
  );
}
