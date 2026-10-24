import "dotenv/config";
import { eq, isNull, isNotNull, sql } from "drizzle-orm";
import { getDb } from "../lib/db";
import {
  settings,
  activities,
  reservations,
  tripDays,
  stays as staysTable,
} from "../lib/db/schema";
import { days, tripMeta, stays } from "../lib/trip";
import { daysBetween } from "../lib/now";

/**
 * Replace the itinerary in the database with the plan in lib/trip.ts.
 *
 *   npm run db:reseed
 *
 * Replaces: the day scaffold, the seed activities (owner_id null), the stays,
 * and the start date / title / subtitle / season note.
 * Keeps:    users, passwords, reservations (bookings), checklist, budget, and
 *           any activity one of you added by hand (owner_id set).
 *
 * Kept activities and bookings are re-dated: a stop that was on "Oct 27" stays
 * on Oct 27 even though that is now day 2 instead of day 4. Anything that now
 * falls before the new day 1 or after the last day is listed at the end so you
 * can re-add it where you want.
 */
async function main() {
  const db = getDb();
  const newStart = tripMeta.defaultStartDate;
  const lastDay = days.length;

  const [startRow] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "start_date"))
    .limit(1);
  const oldStart = startRow?.value ?? newStart;
  // old day N  →  new day N + shift
  const shift = daysBetween(newStart, oldStart);
  console.log(`start date ${oldStart} → ${newStart}  (day shift ${shift >= 0 ? "+" : ""}${shift})`);

  // Safety: seed activities edited in the app keep owner_id null, so the DB can
  // hold a richer plan than lib/trip.ts. Refuse to wipe it unless forced.
  const known = new Set(days.flatMap((d) => d.activities.map((a) => a.title)));
  const unknown = (await db.select().from(activities)).filter(
    (a) => a.ownerId == null && !known.has(a.title)
  );
  if (unknown.length && !process.argv.includes("--force")) {
    console.log(
      `\n✋ The database has ${unknown.length} activities that are NOT in lib/trip.ts ` +
        `(edited in the app). Reseeding would delete them. First 10:`
    );
    for (const a of unknown.slice(0, 10)) console.log(`  day ${a.dayNumber}  ${a.time ?? ""}  ${a.title}`);
    console.log("\nNothing changed. Edit the plan in the app instead, or re-run with --force to replace it.");
    return;
  }

  if (process.argv.includes("--dry-run")) {
    const acts = await db.select().from(activities);
    const seed = acts.filter((a) => a.ownerId == null);
    const mine = acts.filter((a) => a.ownerId != null);
    console.log(`\nWould REPLACE ${seed.length} seed activities, all days and all stays.`);
    console.log(`Would KEEP ${mine.length} hand-added activities (re-dated):`);
    for (const a of mine.sort((x, y) => x.dayNumber - y.dayNumber)) {
      console.log(`  old day ${a.dayNumber} → new day ${a.dayNumber + shift}  ${a.time ?? ""}  ${a.title}`);
    }
    console.log("\nNothing changed. Run without --dry-run to apply.");
    return;
  }

  await db.transaction(async (tx) => {
    // 1) Days + seed activities + stays: wipe and reload from lib/trip.ts.
    await tx.delete(activities).where(isNull(activities.ownerId));
    await tx.delete(tripDays);
    await tx.delete(staysTable);

    await tx.insert(tripDays).values(
      days.map((d) => ({
        dayNumber: d.day,
        city: d.city,
        title: d.title,
        summary: d.summary,
        transport: d.transport ?? null,
        restDay: d.restDay ?? false,
      }))
    );
    await tx.insert(activities).values(
      days.flatMap((day) =>
        day.activities.map((a, i) => ({
          dayNumber: day.day,
          time: a.time ?? null,
          title: a.title,
          description: a.description,
          category: a.category,
          cost: a.cost ?? null,
          booking: a.booking ?? null,
          location: a.location ?? null,
          mustDo: a.mustDo ?? false,
          isSecret: false,
          ownerId: null,
          sortOrder: i,
        }))
      )
    );
    await tx.insert(staysTable).values(
      stays.map((s, i) => ({
        city: s.city,
        area: s.area,
        fromDay: s.fromDay,
        toDay: s.toDay,
        note: s.note,
        status: s.status,
        mapQuery: s.mapsQuery,
        sortOrder: i,
      }))
    );
    console.log(
      `✓ ${days.length} days, ${days.reduce((n, d) => n + d.activities.length, 0)} activities, ${stays.length} stays loaded`
    );

    // 2) Hand-added activities and bookings: keep their calendar date.
    if (shift !== 0) {
      await tx
        .update(activities)
        .set({ dayNumber: sql`${activities.dayNumber} + ${shift}` })
        .where(isNotNull(activities.ownerId));
      await tx
        .update(reservations)
        .set({ dayNumber: sql`${reservations.dayNumber} + ${shift}` })
        .where(isNotNull(reservations.dayNumber));
    }

    // 3) Settings.
    const values = [
      { key: "start_date", value: newStart },
      { key: "title", value: tripMeta.title },
      { key: "subtitle", value: tripMeta.subtitle },
      { key: "season_note", value: tripMeta.seasonNote },
      { key: "travelers", value: String(tripMeta.travelers) },
    ];
    for (const v of values) {
      await tx
        .insert(settings)
        .values(v)
        .onConflictDoUpdate({ target: settings.key, set: { value: v.value } });
    }
    console.log("✓ settings updated");
  });

  // Report what fell off the calendar.
  const stray = await db
    .select()
    .from(activities)
    .where(
      sql`${activities.ownerId} is not null and (${activities.dayNumber} < 1 or ${activities.dayNumber} > ${lastDay})`
    );
  const strayResv = await db
    .select()
    .from(reservations)
    .where(
      sql`${reservations.dayNumber} is not null and (${reservations.dayNumber} < 1 or ${reservations.dayNumber} > ${lastDay})`
    );
  if (stray.length || strayResv.length) {
    console.log("\n⚠ These now fall outside the trip — move or delete them in the app:");
    for (const a of stray) console.log(`  activity  "${a.title}" (was day ${a.dayNumber - shift})`);
    for (const r of strayResv) console.log(`  booking   "${r.title}" (was day ${(r.dayNumber ?? 0) - shift})`);
    // Pull them onto day 1 so they stay visible instead of vanishing.
    await db
      .update(activities)
      .set({ dayNumber: 1 })
      .where(sql`${activities.ownerId} is not null and ${activities.dayNumber} < 1`);
    await db
      .update(activities)
      .set({ dayNumber: lastDay })
      .where(sql`${activities.ownerId} is not null and ${activities.dayNumber} > ${lastDay}`);
    await db
      .update(reservations)
      .set({ dayNumber: 1 })
      .where(sql`${reservations.dayNumber} < 1`);
    await db
      .update(reservations)
      .set({ dayNumber: lastDay })
      .where(sql`${reservations.dayNumber} > ${lastDay}`);
    console.log("  (parked on the nearest day for now)");
  }

  console.log("\n✓ done — reload the app");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
