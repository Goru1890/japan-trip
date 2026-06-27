# Japan Trip Planner 🗾

A flexible, personal Japan itinerary planner built with **Next.js 15** — designed
to deploy to **Vercel** in a couple of clicks. Seeded with a curated ~2-week,
Tokyo-anchored route covering food, temples, nature, and city/shopping.

## Features

- **Home dashboard** — hero, quick stats, jump-off cards, the route at a glance,
  and a stay teaser. Planner-first, not a marketing page.
- **Itinerary** — day-by-day plan with a morning→evening timeline, **Google Maps
  links on every stop**, must-do badges, and a "where you sleep tonight" block per
  day. Tap an interest (🍜 food · ⛩️ culture · 🌿 nature · 🏙️ city) to highlight stops.
- **Hotels** — every base with suggested area, nights, status badges
  (planned · maybe · booked · paid), and hotel-search + map links.
- **Flexible dates** — set a start date and every day recomputes. No booking needed.
- **Budget** — per-person estimate broken down by category with shares and tips.
- **Checklist** — interactive prep timeline + packing list; progress saves automatically.
- **Cross-device sync** *(optional)* — enter a personal sync code to share your
  checklist + dates across phone and laptop. Off by default; see below.
- **Cozy design system** — cream/indigo/sakura palette, hand-painted illustrations,
  and opt-in (default-off) sound effects. See [`docs/`](docs/) for the art
  direction and frontend guidelines the UI follows.

Your personal tweaks (start date, checklist) persist in the browser via
`localStorage` with **no account required**. Cross-device sync is an optional
add-on backed by a serverless key-value store.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build` (production build), `npm run start` (serve the build).

## Make it yours

Everything renders from one file: **[`lib/trip.ts`](lib/trip.ts)**.

- Edit `days[]` to change the route, activities, times, costs, and transport.
- Adjust `tripMeta` for the title, default start date, and season note.
- Tweak `budget`, `packing`, and `prep` for the other pages.

The four interest categories live in `categoryMeta` in the same file.

## Deploy to Vercel

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. In [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Framework preset auto-detects **Next.js**. No env vars needed. Click **Deploy**.

Or from the CLI:

```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production deploy
```

## Cross-device sync (optional)

By default the app saves everything in your browser. To make your checklist and
dates follow you across devices, add a free serverless KV store:

1. **Provision Upstash Redis** — easiest from Vercel: your project → **Storage →
   Marketplace → "Upstash for Redis" → Create**. Vercel auto-injects
   `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. (Or create one free at
   [upstash.com](https://upstash.com) and copy the REST URL/token into your env.)
2. **Redeploy** (Vercel does this automatically when you add the integration).
3. In the app → **Checklist → Cross-device sync**, click **Generate** (or type a
   passphrase) to get a sync code, then enter that same code on your other devices.

For local testing, copy [`.env.example`](.env.example) to `.env.local` and fill in
the two values. Without them, the app simply stays in local-only mode — the sync
panel will say it isn't configured, and nothing breaks.

> **Privacy:** the sync code *is* the key — anyone who knows your code (and the
> URL) can read/edit that trip. Pick something non-obvious. There's no login.

## Tech

Next.js (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Upstash Redis
(optional, for sync). Pages prerender to static; only the tiny `/api/state` sync
endpoint runs on demand — so it's fast and cheap to host.

---

よい旅を — have a good trip.
