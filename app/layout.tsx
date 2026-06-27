import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Japan Trip Planner",
  description:
    "A flexible, day-by-day Japan itinerary planner — Tokyo, Kyoto, Osaka and beyond.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-washi-texture min-h-screen">
        <SiteNav />
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-stone-200/70 py-6 text-center text-xs text-stone-500">
          Plans are placeholders — edit{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px]">
            lib/trip.ts
          </code>{" "}
          to make it yours. よい旅を — have a good trip.
        </footer>
      </body>
    </html>
  );
}
