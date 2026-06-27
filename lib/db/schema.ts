import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// Exactly two known people, but modeled as a real users table so identity
// (and therefore "secret only I can see") is enforceable.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  /** Null until the user claims the account by setting a password on first login. */
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// The day scaffold — editable so the trip can be any length.
export const tripDays = pgTable("days", {
  id: serial("id").primaryKey(),
  dayNumber: integer("day_number").notNull().unique(),
  city: text("city").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  transport: text("transport"),
  restDay: boolean("rest_day").notNull().default(false),
});

// Itinerary activities live here so both users can add/edit them.
// owner_id null = shared/seed activity (either user may edit).
// is_secret true = visible & editable only by owner_id.
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  dayNumber: integer("day_number").notNull(),
  time: text("time"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("city"),
  cost: text("cost"),
  booking: text("booking"),
  location: text("location"),
  mustDo: boolean("must_do").notNull().default(false),
  isSecret: boolean("is_secret").notNull().default(false),
  ownerId: integer("owner_id").references(() => users.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Booking.com stays, restaurant reservations, transport tickets, etc.
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  /** hotel | restaurant | transport | activity | other */
  type: text("type").notNull().default("other"),
  title: text("title").notNull(),
  /** Optional scheduled time (check-in, reservation time, departure). */
  startsAt: timestamp("starts_at", { withTimezone: true }),
  /** Optional link to an itinerary day. */
  dayNumber: integer("day_number"),
  confirmation: text("confirmation"),
  url: text("url"),
  notes: text("notes"),
  isSecret: boolean("is_secret").notNull().default(false),
  ownerId: integer("owner_id").references(() => users.id, { onDelete: "set null" }),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Simple shared key/value (e.g. the trip start date).
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type TripDayRow = typeof tripDays.$inferSelect;
export type ActivityRow = typeof activities.$inferSelect;
export type ReservationRow = typeof reservations.$inferSelect;
export type UserRow = typeof users.$inferSelect;
