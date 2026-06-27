import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { TripStateProvider } from "@/lib/state";
import { AudioProvider } from "@/lib/audio";
import { SakuraFall } from "@/components/SakuraFall";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Japan Trip Planner",
  description:
    "A cozy, day-by-day Japan itinerary planner — Tokyo, Kyoto, Osaka and beyond.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <TripStateProvider>
          <AudioProvider>
            <SakuraFall />
            <SiteNav user={session?.name ?? null} />
            <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
              {children}
            </main>
            <footer className="relative z-10 border-t border-ink/10 bg-paper/55 py-6 text-center text-xs text-ink/55 backdrop-blur">
              A private travel notebook · edit{" "}
              <code className="rounded bg-ink/5 px-1 py-0.5 text-[11px]">
                lib/trip.ts
              </code>{" "}
              to make it yours. よい旅を — have a good trip.
            </footer>
          </AudioProvider>
        </TripStateProvider>
      </body>
    </html>
  );
}
