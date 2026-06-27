import "dotenv/config";
import { getDb } from "../lib/db";
import {
  users,
  settings,
  activities,
  tripDays,
  stays as staysTable,
  budgetLines,
  checklistItems,
  checklistSections,
} from "../lib/db/schema";
import { days, tripMeta, stays, budget, packing, prep } from "../lib/trip";

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

  // Trip-level settings (title, subtitle, travelers, season note).
  await db
    .insert(settings)
    .values([
      { key: "title", value: tripMeta.title },
      { key: "subtitle", value: tripMeta.subtitle },
      { key: "travelers", value: String(tripMeta.travelers) },
      { key: "season_note", value: tripMeta.seasonNote },
    ])
    .onConflictDoNothing({ target: settings.key });
  console.log("✓ trip settings ensured");

  // Stays (lodging).
  const existingStays = await db
    .select({ id: staysTable.id })
    .from(staysTable)
    .limit(1);
  if (existingStays.length === 0) {
    await db.insert(staysTable).values(
      stays.map((s, i) => ({
        city: s.city,
        area: s.area,
        fromDay: s.fromDay,
        toDay: s.toDay,
        note: s.note,
        status: s.status,
        sortOrder: i,
      }))
    );
    console.log(`✓ seeded ${stays.length} stays`);
  } else {
    console.log("• stays already present — skipped");
  }

  // Budget lines.
  const existingBudget = await db
    .select({ id: budgetLines.id })
    .from(budgetLines)
    .limit(1);
  if (existingBudget.length === 0) {
    await db.insert(budgetLines).values(
      budget.map((b, i) => ({
        category: b.category,
        estimate: b.estimate,
        note: b.note,
        sortOrder: i,
      }))
    );
    console.log(`✓ seeded ${budget.length} budget lines`);
  } else {
    console.log("• budget already present — skipped");
  }

  // Checklist sections.
  const existingSections = await db
    .select({ id: checklistSections.id })
    .from(checklistSections)
    .limit(1);
  if (existingSections.length === 0) {
    const secRows: { kind: string; title: string; sortOrder: number }[] = [];
    for (const [kind, sections] of [
      ["prep", prep],
      ["packing", packing],
    ] as const) {
      sections.forEach((s, i) =>
        secRows.push({ kind, title: s.title, sortOrder: i })
      );
    }
    await db.insert(checklistSections).values(secRows);
    console.log(`✓ seeded ${secRows.length} checklist sections`);
  } else {
    console.log("• checklist sections already present — skipped");
  }

  // Checklist (prep + packing).
  const existingChecklist = await db
    .select({ id: checklistItems.id })
    .from(checklistItems)
    .limit(1);
  if (existingChecklist.length === 0) {
    const rows: {
      kind: string;
      section: string;
      label: string;
      sortOrder: number;
    }[] = [];
    let i = 0;
    for (const [kind, sections] of [
      ["prep", prep],
      ["packing", packing],
    ] as const) {
      for (const s of sections)
        for (const label of s.items)
          rows.push({ kind, section: s.title, label, sortOrder: i++ });
    }
    await db.insert(checklistItems).values(rows);
    console.log(`✓ seeded ${rows.length} checklist items`);
  } else {
    console.log("• checklist already present — skipped");
  }

  console.log("\nSeed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
