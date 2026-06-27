import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { TripStateProvider } from "@/lib/state";
import { AudioProvider } from "@/lib/audio";

export const metadata: Metadata = {
  title: "Japan Trip Planner",
  description:
    "A cozy, day-by-day Japan itinerary planner — Tokyo, Kyoto, Osaka and beyond.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <TripStateProvider>
          <AudioProvider>
            <SiteNav />
            <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
              {children}
            </main>
            <footer className="border-t border-ink/10 py-6 text-center text-xs text-ink/55">
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
