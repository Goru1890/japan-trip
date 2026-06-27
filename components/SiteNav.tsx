"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import { useAudio } from "@/lib/audio";
import { logout } from "@/app/actions/auth";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/now", label: "Now", icon: "date" },
  { href: "/itinerary", label: "Itinerary", icon: "train" },
  { href: "/hotels", label: "Hotels", icon: "hotel" },
  { href: "/bookings", label: "Bookings", icon: "onsen" },
  { href: "/checklist", label: "Checklist", icon: "checklist" },
  { href: "/budget", label: "Budget", icon: "budget" },
];

export function SiteNav({ user }: { user: string | null }) {
  const pathname = usePathname();
  const { enabled, setEnabled, play, loaded } = useAudio();

  function toggleSound() {
    const next = !enabled;
    setEnabled(next);
    if (next) {
      try {
        const a = new Audio("/assets/audio/soft-open.wav");
        a.volume = 0.35;
        void a.play().catch(() => {});
      } catch {
        // ignore
      }
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-[rgba(248,238,220,0.78)]">
      <nav className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-2.5 sm:px-6">
        <Link
          href="/"
          onClick={() => play("tap")}
          className="mr-1 flex items-center gap-2 font-semibold"
        >
          <Image
            src="/assets/images/mascot-suitcase-daruma.svg"
            alt=""
            aria-hidden
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8"
          />
          <span className="hidden text-ink sm:inline">Japan Trip</span>
        </Link>

        {user ? (
          <>
            <div className="flex flex-1 items-center gap-1 overflow-x-auto">
              {links.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => play("tap")}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-ink text-paper"
                        : "text-ink/70 hover:bg-ink/5 hover:text-ink",
                    ].join(" ")}
                  >
                    <Icon name={link.icon} size={20} className="h-5 w-5" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <span className="hidden shrink-0 items-center gap-1 text-sm text-ink/70 md:flex">
              <span aria-hidden>🙂</span>
              {user}
            </span>
            <button
              onClick={toggleSound}
              aria-pressed={enabled}
              title={enabled ? "Sound on" : "Sound off"}
              className="shrink-0 rounded-md border border-ink/15 px-2 py-1.5 text-sm hover:bg-ink/5"
            >
              <span aria-hidden>{loaded && enabled ? "🔊" : "🔈"}</span>
              <span className="sr-only">Toggle sound</span>
            </button>
            <form action={logout} className="shrink-0">
              <button
                type="submit"
                title="Log out"
                className="rounded-md border border-ink/15 px-2 py-1.5 text-sm text-ink/70 hover:bg-ink/5"
              >
                <span aria-hidden>↩</span>
                <span className="sr-only">Log out</span>
              </button>
            </form>
          </>
        ) : (
          <span className="flex-1 text-sm font-medium text-ink/60">
            Private trip planner
          </span>
        )}
      </nav>
    </header>
  );
}
