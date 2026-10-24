# Japan Trip Planner 🗾

A **private, two-person** Japan trip planner for Joaquin & Rosalie — built with
**Next.js 15**, deployed on **Vercel** with **Postgres**. Login-gated, collaboratively
editable, with per-person *secret* activities, a live "what now" view, and a place
to keep your real bookings. Currently holds the replanned 7-day Kansai route (Oct 26 – Nov 1, 2026).

## Features

- **Accounts & login gate** — two users (`joaquin`, `rosalie`); nothing is visible
  without logging in. First login sets your password.
- **Now** — "what now?" view: the next thing on the itinerary by current Japan time,
  plus your next booking.
- **Itinerary** — shared, editable day-by-day plan. **Add / edit / delete** activities,
  Google Maps link on every stop, must-do badges, "where you sleep tonight" per day,
  and interest filters (🍜 food · ⛩️ culture · 🌿 nature · 🏙️ city).
- **Secret activities** 🔒 — mark an activity (or booking) secret and only *you* can
  see it. Perfect for surprises.
- **Bookings** — save booking.com stays, restaurant reservations, and transport with
  date/time, confirmation #, and links.
- **Hotels** — suggested base areas with status badges and hotel-search + map links.
- **Budget** & **Checklist** — per-person estimate and a prep/packing checklist.
- **Cozy design system** — cream/indigo/sakura palette, hand-painted illustrations,
  falling sakura, and opt-in (default-off) sound. See [`docs/`](docs/).

## First-time setup (database + login)

The app needs a Postgres database and a session secret.

**1. Set two environment variables** (copy [`.env.example`](.env.example) → `.env.local`):

```bash
DATABASE_URL=postgres://…          # your Postgres connection string
AUTH_SECRET=…                      # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**2. Create the tables and seed the trip:**

```bash
npm run db:push     # create tables from the schema
npm run db:seed     # add the two users, the start date, and the itinerary
```

**3. Run it and claim your account:**

```bash
npm run dev         # http://localhost:3000
```

Log in as `joaquin` or `rosalie` — **whatever password you type on first login
becomes your password.** Tell Rosalie to do the same with `rosalie`.

> Other scripts: `npm run db:studio` (browse the data), `npm run build`, `npm run start`.

## Deploy to Vercel

1. Push to a Git repo and import it at [vercel.com](https://vercel.com) → **Add New → Project**.
2. **Add Postgres:** project → **Storage → Marketplace → Neon/Postgres → Create.**
   It auto-sets `DATABASE_URL`.
3. **Add the secret:** project → **Settings → Environment Variables** →
   `AUTH_SECRET` = a long random string.
4. **Create + seed the tables** against the production DB (run once locally with the
   prod `DATABASE_URL`, e.g. `vercel env pull .env.local` then `npm run db:push && npm run db:seed`).
5. **Deploy.** Visit the URL and claim your accounts.

## How it works

- **Auth:** username + password (bcrypt-hashed), a signed JWT in an httpOnly cookie
  ([`lib/auth`](lib/auth)). [`middleware.ts`](middleware.ts) redirects every route to
  `/login` until you're signed in.
- **Secret items:** each activity/booking has an owner and an `is_secret` flag. Queries
  only return rows that are non-secret **or** owned by you ([`lib/db/queries.ts`](lib/db/queries.ts)).
- **Data model:** `users`, `activities`, `reservations`, `settings` (Drizzle ORM,
  [`lib/db/schema.ts`](lib/db/schema.ts)). The start date is a shared setting.

## Replan the trip (reload the itinerary)

> ⚠️ The live plan is edited in the app and lives only in the database — it is
> richer than `lib/trip.ts`. `db:reseed` refuses to run if it would delete
> activities that aren't in `lib/trip.ts` (override with `--force`). For small
> changes, edit in the app or run targeted SQL in the Neon SQL Editor.

The live site reads from the database, not from `lib/trip.ts`. After editing the
plan in `lib/trip.ts`, load it into the production DB:

```bash
# put the prod DATABASE_URL in .env (Vercel → Settings → Environment Variables)
npm run db:reseed:check   # dry run: shows what will be replaced / kept
npm run db:reseed
```

`db:reseed` replaces the days, the seed activities and the stays, and updates the
start date. It **keeps** your logins, bookings, checklist, budget, and any activity
you added by hand (re-dated to the same calendar day; anything that no longer fits
is parked on the nearest day and listed in the output).

## Make it yours

The curated seed lives in **[`lib/trip.ts`](lib/trip.ts)** (the day scaffold, default
budget, packing/prep checklists, and interest categories). Re-run `npm run db:seed`
to load itinerary changes into a fresh database. Once seeded, edit activities and
bookings right in the app.

## Tech

Next.js (App Router, Server Actions) · React 19 · TypeScript · Tailwind v4 ·
Postgres + Drizzle ORM · jose (JWT) · bcryptjs. Deploys on Vercel.

---

よい旅を — have a good trip.
