import "server-only";
import { asc, eq, or, sql } from "drizzle-orm";
import { getDb } from "./index";
import {
  activities,
  reservations,
  settings,
  tripDays,
  stays,
  budgetLines,
  checklistItems,
} from "./schema";
import type {
  ActivityRow,
  ReservationRow,
  TripDayRow,
  StayRow,
  BudgetLineRow,
  ChecklistItemRow,
} from "./schema";
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
  stayId?: number | null;
  reservationId?: number | null;
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
    stayId: input.stayId ?? null,
    reservationId: input.reservationId ?? null,
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
      stayId: input.stayId ?? null,
      reservationId: input.reservationId ?? null,
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

// ---------- days (the editable scaffold) ----------

export interface DayInput {
  city: string;
  title: string;
  summary?: string;
  transport?: string | null;
  restDay?: boolean;
}

export async function getDays(): Promise<TripDayRow[]> {
  const db = getDb();
  return db.select().from(tripDays).orderBy(asc(tripDays.dayNumber));
}

async function maxDayNumber(): Promise<number> {
  const db = getDb();
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${tripDays.dayNumber}), 0)` })
    .from(tripDays);
  return Number(max ?? 0);
}

export async function addDay(input: DayInput): Promise<void> {
  const db = getDb();
  await db.insert(tripDays).values({
    dayNumber: (await maxDayNumber()) + 1,
    city: input.city,
    title: input.title,
    summary: input.summary ?? "",
    transport: input.transport ?? null,
    restDay: input.restDay ?? false,
  });
}

export async function updateDay(id: number, input: DayInput): Promise<void> {
  const db = getDb();
  await db
    .update(tripDays)
    .set({
      city: input.city,
      title: input.title,
      summary: input.summary ?? "",
      transport: input.transport ?? null,
      restDay: input.restDay ?? false,
    })
    .where(eq(tripDays.id, id));
}

/** Remove the last day (only), cascading its activities and unlinking bookings. */
export async function deleteDay(dayNumber: number): Promise<void> {
  const db = getDb();
  const last = await maxDayNumber();
  if (dayNumber !== last) {
    throw new Error("For now you can only remove the last day.");
  }
  await db.delete(activities).where(eq(activities.dayNumber, dayNumber));
  await db
    .update(reservations)
    .set({ dayNumber: null })
    .where(eq(reservations.dayNumber, dayNumber));
  await db.delete(tripDays).where(eq(tripDays.dayNumber, dayNumber));
}

// ---------- stays (lodging) ----------

export interface StayInput {
  city: string;
  area: string;
  fromDay: number;
  toDay: number;
  note?: string;
  status?: string;
  url?: string | null;
  mapQuery?: string | null;
}

export async function getStays(): Promise<StayRow[]> {
  const db = getDb();
  return db.select().from(stays).orderBy(asc(stays.fromDay), asc(stays.id));
}

export async function addStay(input: StayInput): Promise<void> {
  const db = getDb();
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${stays.sortOrder}), -1)` })
    .from(stays);
  await db.insert(stays).values({
    city: input.city,
    area: input.area,
    fromDay: input.fromDay,
    toDay: input.toDay,
    note: input.note ?? "",
    status: input.status ?? "planned",
    url: input.url ?? null,
    mapQuery: input.mapQuery ?? null,
    sortOrder: Number(max ?? -1) + 1,
  });
}

export async function updateStay(id: number, input: StayInput): Promise<void> {
  const db = getDb();
  await db
    .update(stays)
    .set({
      city: input.city,
      area: input.area,
      fromDay: input.fromDay,
      toDay: input.toDay,
      note: input.note ?? "",
      status: input.status ?? "planned",
      url: input.url ?? null,
      mapQuery: input.mapQuery ?? null,
    })
    .where(eq(stays.id, id));
}

export async function deleteStay(id: number): Promise<void> {
  const db = getDb();
  await db.delete(stays).where(eq(stays.id, id));
}

// ---------- budget ----------

export interface BudgetInput {
  category: string;
  estimate: number;
  note?: string;
}

export async function getBudget(): Promise<BudgetLineRow[]> {
  const db = getDb();
  return db
    .select()
    .from(budgetLines)
    .orderBy(asc(budgetLines.sortOrder), asc(budgetLines.id));
}

export async function addBudgetLine(input: BudgetInput): Promise<void> {
  const db = getDb();
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${budgetLines.sortOrder}), -1)` })
    .from(budgetLines);
  await db.insert(budgetLines).values({
    category: input.category,
    estimate: Math.round(input.estimate) || 0,
    note: input.note ?? "",
    sortOrder: Number(max ?? -1) + 1,
  });
}

export async function updateBudgetLine(
  id: number,
  input: BudgetInput
): Promise<void> {
  const db = getDb();
  await db
    .update(budgetLines)
    .set({
      category: input.category,
      estimate: Math.round(input.estimate) || 0,
      note: input.note ?? "",
    })
    .where(eq(budgetLines.id, id));
}

export async function deleteBudgetLine(id: number): Promise<void> {
  const db = getDb();
  await db.delete(budgetLines).where(eq(budgetLines.id, id));
}

// ---------- checklist ----------

export interface ChecklistInput {
  kind: string;
  section: string;
  label: string;
}

export async function getChecklist(): Promise<ChecklistItemRow[]> {
  const db = getDb();
  return db
    .select()
    .from(checklistItems)
    .orderBy(asc(checklistItems.sortOrder), asc(checklistItems.id));
}

export async function addChecklistItem(input: ChecklistInput): Promise<void> {
  const db = getDb();
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${checklistItems.sortOrder}), -1)` })
    .from(checklistItems);
  await db.insert(checklistItems).values({
    kind: input.kind,
    section: input.section || "General",
    label: input.label,
    sortOrder: Number(max ?? -1) + 1,
  });
}

export async function updateChecklistItem(
  id: number,
  input: ChecklistInput
): Promise<void> {
  const db = getDb();
  await db
    .update(checklistItems)
    .set({
      kind: input.kind,
      section: input.section || "General",
      label: input.label,
    })
    .where(eq(checklistItems.id, id));
}

export async function deleteChecklistItem(id: number): Promise<void> {
  const db = getDb();
  await db.delete(checklistItems).where(eq(checklistItems.id, id));
}

export async function setChecklistChecked(
  id: number,
  checked: boolean
): Promise<void> {
  const db = getDb();
  await db
    .update(checklistItems)
    .set({ checked })
    .where(eq(checklistItems.id, id));
}

// ---------- settings ----------

export async function getSettings(): Promise<Record<string, string>> {
  const db = getDb();
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDb();
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

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
