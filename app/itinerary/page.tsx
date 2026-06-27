import Image from "next/image";
import { getSession } from "@/lib/auth";
import {
  getStartDate,
  getDays,
  getStays,
  getVisibleActivities,
  getVisibleReservations,
  canManage,
} from "@/lib/db/queries";
import { type Category } from "@/lib/trip";
import { type StayView, type StayStatus } from "@/lib/stays";
import {
  ItineraryBoard,
  type BoardActivity,
  type BoardDay,
} from "@/components/ItineraryBoard";
import { type ReservationLite } from "@/components/ActivityForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Itinerary · Japan Trip" };

export default async function ItineraryPage() {
  const session = await getSession();
  const uid = session?.uid ?? -1;

  const [startDate, dayRows, stayRows, acts, resvRows] = await Promise.all([
    getStartDate(),
    getDays(),
    getStays(),
    getVisibleActivities(uid),
    getVisibleReservations(uid),
  ]);

  const stays: StayView[] = stayRows.map((s) => ({
    id: s.id,
    city: s.city,
    area: s.area,
    fromDay: s.fromDay,
    toDay: s.toDay,
    note: s.note,
    status: s.status as StayStatus,
  }));

  const reservations: ReservationLite[] = resvRows.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    url: r.url,
    confirmation: r.confirmation,
  }));

  const activitiesByDay: Record<number, BoardActivity[]> = {};
  for (const a of acts) {
    (activitiesByDay[a.dayNumber] ??= []).push({
      id: a.id,
      dayNumber: a.dayNumber,
      time: a.time,
      title: a.title,
      description: a.description,
      category: a.category as Category,
      cost: a.cost,
      booking: a.booking,
      location: a.location,
      mustDo: a.mustDo,
      isSecret: a.isSecret,
      stayId: a.stayId,
      reservationId: a.reservationId,
      canManage: canManage(a, uid),
    });
  }

  const boardDays: BoardDay[] = dayRows.map((d) => ({
    id: d.id,
    day: d.dayNumber,
    city: d.city,
    title: d.title,
    summary: d.summary,
    transport: d.transport,
    restDay: d.restDay,
  }));

  return (
    <div className="space-y-5">
      <section className="relative h-36 overflow-hidden rounded-lg shadow-soft sm:h-44">
        <Image
          src="/assets/images/card-tokyo-itinerary.png"
          alt="Illustrated Tokyo itinerary scene"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h1 className="text-2xl font-bold tracking-tight text-paper drop-shadow sm:text-3xl">
            Day by day
          </h1>
          <p className="text-sm text-paper/90">
            Add, edit, or mark stops secret · tap an interest to filter
          </p>
        </div>
      </section>

      <ItineraryBoard
        startDate={startDate}
        days={boardDays}
        stays={stays}
        reservations={reservations}
        activitiesByDay={activitiesByDay}
      />
    </div>
  );
}
