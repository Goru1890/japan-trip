import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#f8eedc",
  viewportFit: "cover",
};
import { SiteNav } from "@/components/SiteNav";
import { BottomNav } from "@/components/BottomNav";
import { AudioProvider } from "@/lib/audio";
import { UIProvider } from "@/lib/ui";
import { SakuraFall } from "@/components/SakuraFall";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/db/queries";

export async function generateMetadata(): Promise<Metadata> {
  let title = "Japan Trip";
  try {
    title = (await getSettings()).title || title;
  } catch {
    // DB not ready (e.g. at build) — fall back
  }
  return {
    title: `${title} · Planner`,
    description: "A cozy, private day-by-day Japan trip planner.",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings] = await Promise.all([
    getSession(),
    getSettings().catch(() => ({}) as Record<string, string>),
  ]);
  const title = settings.title || "Japan Trip";

  return (
    <html lang="en">
      <body className="min-h-screen">
        <AudioProvider>
          <UIProvider>
            <SakuraFall />
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-paper"
            >
              Skip to content
            </a>
            <SiteNav user={session?.name ?? null} title={title} />
            <main
              id="main"
              className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6"
            >
              {children}
            </main>
            <footer className="relative z-10 hidden border-t border-ink/10 bg-paper/55 py-6 text-center text-xs text-ink/55 backdrop-blur sm:block">
              A private travel notebook for two. よい旅を — have a good trip.
            </footer>
            {session?.name ? <BottomNav /> : null}
          </UIProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
