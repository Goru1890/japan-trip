import "server-only";
import { asc, eq, or, sql } from "drizzle-orm";
import { getDb } from "./index";
import { activities, reservations, settings } from "./schema";
import type { ActivityRow, ReservationRow } from "./schema";
import { tripMeta } from "@/lib/trip";

// ---- visibility & permission rules ----
// A secret row is visible/editable only by its owner. Everything else is shared.
export function canManage(
  row: { isSecret: boolean; ownerId: number | null },
  uid: number
): boolean {
  return !row.isSecret || row.ownerId === uid;
}

// ---------- activities ----------

export interface ActivityInput {
  dayNumber: number;
  time?: string | null;
  title: string;
  description?: string;
  category: string;
  cost?: string | null;
  booking?: string | null;
  location?: string | null;
  mustDo?: boolean;
  isSecret?: boolean;
}

export async function getVisibleActivities(uid: number): Promise<ActivityRow[]> {
  const db = getDb();
  return db
    .select()
    .from(activities)
    .where(or(eq(activities.isSecret, false), eq(activities.ownerId, uid)))
    .orderBy(
      asc(activities.dayNumber),
      asc(activities.sortOrder),
      asc(activities.id)
    );
}

export async function addActivity(
  uid: number,
  input: ActivityInput
): Promise<void> {
  const db = getDb();
  const [{ max }] = await db
    .select({
      max: sql<number>`coalesce(max(${activities.sortOrder}), -1)`,
    })
    .from(activities)
    .where(eq(activities.dayNumber, input.dayNumber));

  await db.insert(activities).values({
    dayNumber: input.dayNumber,
    time: input.time ?? null,
    title: input.title,
    description: input.description ?? "",
    category: input.category,
    cost: input.cost ?? null,
    booking: input.booking ?? null,
    location: input.location ?? null,
    mustDo: input.mustDo ?? false,
    isSecret: input.isSecret ?? false,
    ownerId: uid,
    sortOrder: Number(max ?? -1) + 1,
  });
}

export async function updateActivity(
  uid: number,
  id: number,
  input: ActivityInput
): Promise<void> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);
  if (!row) throw new Error("Activity not found");
  if (!canManage(row, uid)) throw new Error("You can't edit this activity");

  const becomingSecret = input.isSecret ?? row.isSecret;
  await db
    .update(activities)
    .set({
      dayNumber: input.dayNumber,
      time: input.time ?? null,
      title: input.title,
      description: input.description ?? "",
      category: input.category,
      cost: input.cost ?? null,
      booking: input.booking ?? null,
      location: input.location ?? null,
      mustDo: input.mustDo ?? false,
      isSecret: becomingSecret,
      // Marking something secret makes it yours; unmarking keeps current owner.
      ownerId: becomingSecret ? row.ownerId ?? uid : row.ownerId,
    })
    .where(eq(activities.id, id));
}

export async function deleteActivity(uid: number, id: number): Promise<void> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);
  if (!row) return;
  if (!canManage(row, uid)) throw new Error("You can't delete this activity");
  await db.delete(activities).where(eq(activities.id, id));
}

// ---------- reservations ----------

// A datetime-local string ("YYYY-MM-DDThh:mm") carries no zone — the user means
// Japan time, so pin it to +09:00 to store the correct instant.
function parseJst(s: string | null | undefined): Date | null {
  if (!s) return null;
  if (/[zZ]|[+-]\d\d:\d\d$/.test(s)) return new Date(s);
  const withSeconds = s.length === 16 ? `${s}:00` : s;
  return new Date(`${withSeconds}+09:00`);
}

export interface ReservationInput {
  type: string;
  title: string;
  startsAt?: string | null;
  dayNumber?: number | null;
  confirmation?: string | null;
  url?: string | null;
  notes?: string | null;
  isSecret?: boolean;
}

export async function getVisibleReservations(
  uid: number
): Promise<ReservationRow[]> {
  const db = getDb();
  return db
    .select()
    .from(reservations)
    .where(
      or(eq(reservations.isSecret, false), eq(reservations.ownerId, uid))
    )
    .orderBy(
      sql`${reservations.startsAt} asc nulls last`,
      asc(reservations.dayNumber),
      asc(reservations.id)
    );
}

export async function addReservation(
  uid: number,
  input: ReservationInput
): Promise<void> {
  const db = getDb();
  await db.insert(reservations).values({
    type: input.type,
    title: input.title,
    startsAt: parseJst(input.startsAt),
    dayNumber: input.dayNumber ?? null,
    confirmation: input.confirmation ?? null,
    url: input.url ?? null,
    notes: input.notes ?? null,
    isSecret: input.isSecret ?? false,
    ownerId: uid,
    createdBy: uid,
  });
}

export async function updateReservation(
  uid: number,
  id: number,
  input: ReservationInput
): Promise<void> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);
  if (!row) throw new Error("Reservation not found");
  if (!canManage(row, uid)) throw new Error("You can't edit this reservation");

  const becomingSecret = input.isSecret ?? row.isSecret;
  await db
    .update(reservations)
    .set({
      type: input.type,
      title: input.title,
      startsAt: parseJst(input.startsAt),
      dayNumber: input.dayNumber ?? null,
      confirmation: input.confirmation ?? null,
      url: input.url ?? null,
      notes: input.notes ?? null,
      isSecret: becomingSecret,
      ownerId: becomingSecret ? row.ownerId ?? uid : row.ownerId,
    })
    .where(eq(reservations.id, id));
}

export async function deleteReservation(
  uid: number,
  id: number
): Promise<void> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);
  if (!row) return;
  if (!canManage(row, uid)) throw new Error("You can't delete this reservation");
  await db.delete(reservations).where(eq(reservations.id, id));
}

// ---------- settings ----------

export async function getStartDate(): Promise<string> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "start_date"))
    .limit(1);
  return row?.value ?? tripMeta.defaultStartDate;
}

export async function setStartDate(value: string): Promise<void> {
  const db = getDb();
  await db
    .insert(settings)
    .values({ key: "start_date", value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export type { ActivityRow, ReservationRow };
