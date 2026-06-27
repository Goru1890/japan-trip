# Japan Trip Planner 🗾

A flexible, personal Japan itinerary planner built with **Next.js 15** — designed
to deploy to **Vercel** in a couple of clicks. Seeded with a curated ~2-week,
Tokyo-anchored route covering food, temples, nature, and city/shopping.

## Features

- **Overview** — trip summary, the route at a glance, and quick stats.
- **Itinerary** — day-by-day plan with a morning→evening timeline. Tap an interest
  (🍜 food · ⛩️ culture · 🌿 nature · 🏙️ city) to highlight matching stops.
- **Flexible dates** — set a start date and every day recomputes. No booking needed.
- **Budget** — per-person estimate broken down by category with shares and tips.
- **Checklist** — interactive prep timeline + packing list; progress saves locally.

Your personal tweaks (start date, checklist) persist in the browser via
`localStorage` — no database or account required.

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

## Tech

Next.js (App Router) · React 19 · TypeScript · Tailwind CSS v4. Fully static —
every route prerenders, so it's fast and cheap to host.

---

よい旅を — have a good trip.
