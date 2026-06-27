import Image from "next/image";
import { getStays, getDays } from "@/lib/db/queries";
import { stayNights, type StayView, type StayStatus } from "@/lib/stays";
import { HotelsBoard } from "@/components/HotelsBoard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hotels · Japan Trip" };

export default async function HotelsPage() {
  const [stayRows, dayRows] = await Promise.all([getStays(), getDays()]);

  const stays: StayView[] = stayRows.map((s) => ({
    id: s.id,
    city: s.city,
    area: s.area,
    fromDay: s.fromDay,
    toDay: s.toDay,
    note: s.note,
    status: s.status as StayStatus,
  }));
  const dayOptions = dayRows.map((d) => ({ dayNumber: d.dayNumber, city: d.city }));
  const totalNights = stays.reduce((n, s) => n + stayNights(s), 0);

  return (
    <div className="space-y-6">
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
            {stays.length} {stays.length === 1 ? "base" : "bases"} · {totalNights}{" "}
            nights
          </p>
        </div>
      </section>

      <HotelsBoard stays={stays} days={dayOptions} />
    </div>
  );
}
