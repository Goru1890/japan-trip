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
import { dateForDay } from "@/lib/format";
import { timeToMinutes } from "@/lib/now";

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
    url: s.url,
    mapQuery: s.mapQuery,
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

  // Within a day, order by time (hand-added stops land where they belong).
  for (const list of Object.values(activitiesByDay)) {
    list.sort(
      (a, b) =>
        (timeToMinutes(a.time) ?? 12 * 60) - (timeToMinutes(b.time) ?? 12 * 60)
    );
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

  const first = dateForDay(startDate, 1);
  const last = dateForDay(startDate, boardDays.length);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Itinerary</h1>
        {first && last && (
          <p className="text-sm text-ink/60">
            {first} → {last} · {boardDays.length} days
          </p>
        )}
      </div>

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
