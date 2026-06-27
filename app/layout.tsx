import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { TripStateProvider } from "@/lib/state";
import { AudioProvider } from "@/lib/audio";
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
        <TripStateProvider>
          <AudioProvider>
            <SakuraFall />
            <SiteNav user={session?.name ?? null} title={title} />
            <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
              {children}
            </main>
            <footer className="relative z-10 border-t border-ink/10 bg-paper/55 py-6 text-center text-xs text-ink/55 backdrop-blur">
              A private travel notebook for two. よい旅を — have a good trip.
            </footer>
          </AudioProvider>
        </TripStateProvider>
      </body>
    </html>
  );
}
