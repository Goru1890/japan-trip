"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/itinerary", label: "Itinerary" },
  { href: "/budget", label: "Budget" },
  { href: "/checklist", label: "Checklist" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-washi/80 backdrop-blur supports-[backdrop-filter]:bg-[rgba(250,247,242,0.7)]">
      <nav className="mx-auto flex w-full max-w-5xl items-center gap-1 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-3 flex items-center gap-2 font-semibold">
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-full bg-vermillion text-sm text-white"
          >
            ⛩
          </span>
          <span className="hidden sm:inline">Japan Trip</span>
        </Link>
        <div className="flex flex-1 items-center gap-0.5 overflow-x-auto">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-200/60 hover:text-stone-900",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
