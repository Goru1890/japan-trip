import "dotenv/config";
import { getDb } from "../lib/db";
import { users, settings, activities, tripDays } from "../lib/db/schema";
import { days, tripMeta } from "../lib/trip";

async function main() {
  const db = getDb();

  // Two accounts — passwords are claimed on first login (passwordHash stays null).
  await db
    .insert(users)
    .values([
      { username: "joaquin", name: "Joaquin" },
      { username: "rosalie", name: "Rosalie" },
    ])
    .onConflictDoNothing({ target: users.username });
  console.log("✓ users ensured (joaquin, rosalie)");

  // Shared trip start date.
  await db
    .insert(settings)
    .values({ key: "start_date", value: tripMeta.defaultStartDate })
    .onConflictDoNothing({ target: settings.key });
  console.log("✓ start_date setting ensured");

  // Seed the day scaffold only if empty (idempotent).
  const existingDays = await db
    .select({ id: tripDays.id })
    .from(tripDays)
    .limit(1);
  if (existingDays.length === 0) {
    await db.insert(tripDays).values(
      days.map((d) => ({
        dayNumber: d.day,
        city: d.city,
        title: d.title,
        summary: d.summary,
        transport: d.transport ?? null,
        restDay: d.restDay ?? false,
      }))
    );
    console.log(`✓ seeded ${days.length} days`);
  } else {
    console.log("• days already present — skipped");
  }

  // Seed activities only if the table is empty (idempotent).
  const existing = await db.select({ id: activities.id }).from(activities).limit(1);
  if (existing.length === 0) {
    const rows = days.flatMap((day) =>
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
    );
    await db.insert(activities).values(rows);
    console.log(`✓ seeded ${rows.length} activities from the curated itinerary`);
  } else {
    console.log("• activities already present — skipped");
  }

  console.log("\nSeed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
