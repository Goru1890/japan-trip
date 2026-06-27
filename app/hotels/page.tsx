import Image from "next/image";
import { stays, stayNights } from "@/lib/trip";
import { bookingUrl, mapsUrl } from "@/lib/links";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/Badge";

export const metadata = { title: "Hotels · Japan Trip" };

export default function HotelsPage() {
  const totalNights = stays.reduce((n, s) => n + stayNights(s), 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <section className="relative h-40 overflow-hidden rounded-lg shadow-soft sm:h-52">
        <Image
          src="/assets/images/card-ryokan-onsen.png"
          alt="Illustrated ryokan with an onsen bath"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h1 className="text-2xl font-bold tracking-tight text-paper drop-shadow sm:text-3xl">
            Where you&apos;ll stay
          </h1>
          <p className="text-sm text-paper/90">
            {stays.length} bases · {totalNights} nights · suggested areas (nothing
            booked yet)
          </p>
        </div>
      </section>

      <ul className="space-y-3">
        {stays.map((stay) => (
          <li
            key={stay.city}
            className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Icon name="hotel" size={28} className="h-7 w-7 shrink-0" />
                <div>
                  <h2 className="font-semibold text-ink">{stay.city}</h2>
                  <p className="text-sm text-ink/70">{stay.area}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={stay.status} />
                <span className="text-xs text-ink/55">
                  {stay.fromDay === stay.toDay
                    ? `Day ${stay.fromDay}`
                    : `Days ${stay.fromDay}–${stay.toDay}`}{" "}
                  · {stayNights(stay)}{" "}
                  {stayNights(stay) === 1 ? "night" : "nights"}
                </span>
              </div>
            </div>

            <p className="mt-2 text-sm text-ink/70">{stay.note}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={bookingUrl(stay.bookingQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
              >
                <span aria-hidden>🏨</span> Find hotels ↗
              </a>
              <a
                href={mapsUrl(stay.mapsQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-ink/5"
              >
                <span aria-hidden>📍</span> Map ↗
              </a>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-ink/55">
        Status badges are just planning markers — update each stay&apos;s{" "}
        <code className="rounded bg-ink/5 px-1">status</code> in{" "}
        <code className="rounded bg-ink/5 px-1">lib/trip.ts</code> as you book
        (planned · maybe · booked · paid).
      </p>
    </div>
  );
}
