"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useAudio } from "@/lib/audio";
import { navLinks } from "@/components/SiteNav";

/** Fixed bottom tab bar — mobile only (desktop uses the top nav). */
export function BottomNav() {
  const pathname = usePathname();
  const { play } = useAudio();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {navLinks.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                onClick={() => play("tap")}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex flex-col items-center gap-0.5 px-0.5 py-2 text-[10px] font-medium leading-none transition-colors",
                  active ? "text-ink" : "text-ink/65",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active ? "bg-ink/10" : "",
                  ].join(" ")}
                >
                  <Icon
                    name={link.icon}
                    size={20}
                    className={active ? "h-5 w-5" : "h-5 w-5 opacity-70"}
                  />
                </span>
                <span className="max-w-full truncate">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
