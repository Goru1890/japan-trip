import { getSession } from "@/lib/auth";
import { getVisibleReservations, canManage } from "@/lib/db/queries";
import { toJstInputValue, formatJst } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { BookingsBoard, type BoardReservation } from "@/components/BookingsBoard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings · Japan Trip" };

export default async function BookingsPage() {
  const session = await getSession();
  const uid = session?.uid ?? -1;
  const rows = await getVisibleReservations(uid);

  const reservations: BoardReservation[] = rows.map((r) => {
    const at = r.startsAt ? new Date(r.startsAt) : null;
    return {
      id: r.id,
      type: r.type,
      title: r.title,
      startsAtInput: at ? toJstInputValue(at) : "",
      startsAtLabel: at ? formatJst(at) : null,
      dayNumber: r.dayNumber,
      confirmation: r.confirmation,
      url: r.url,
      notes: r.notes,
      isSecret: r.isSecret,
      canManage: canManage(r, uid),
    };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <Icon name="onsen" size={32} className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Bookings</h1>
          <p className="text-sm text-ink/60">
            Hotels, restaurant reservations, transport — with confirmation
            numbers and links.
          </p>
        </div>
      </div>

      <BookingsBoard reservations={reservations} />
    </div>
  );
}
