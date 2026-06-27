# Frontend Guidelines

## Product Feel

The first screen should be the actual planner, not a marketing page. The app should feel like a shared command center for itinerary days, hotels, checklist items, and budget decisions.

Keep the UI calm and scannable. Use cute illustration as warmth around a practical planner, not as decoration that competes with dates, addresses, prices, and confirmation numbers.

## Layout

- Use a persistent top or side navigation with icons for `Itinerary`, `Hotels`, `Checklist`, and `Budget`.
- Prefer dense but friendly cards for trip days, bookings, and tasks.
- Keep card radius at `8px` or less.
- Do not nest cards inside cards; use bands, lists, tabs, and dividers instead.
- Give fixed-format controls stable dimensions so icons, counters, and labels do not resize the layout.

## Components

- Buttons: icon-first with short labels for primary actions such as add, save, edit, delete, map, and calendar.
- Tabs: use for day-by-day itinerary, bookings, and notes.
- Badges: use colored accents for status such as planned, booked, paid, maybe, and must-do.
- Empty states: use `mascot-suitcase-daruma.svg` plus one direct action button.
- Images: use `hero-tokyo-sakura.png` for the home/dashboard atmosphere and card images sparingly.

## CSS Tokens

```css
:root {
  --paper: #f8eedc;
  --ink: #3f4a5a;
  --sakura: #f6b3be;
  --matcha: #7daa92;
  --lantern: #f3b35b;
  --cedar: #8a5a44;
  --sky: #79b8d9;
  --red: #d65f5f;
  --radius-card: 8px;
  --shadow-soft: 0 10px 30px rgb(63 74 90 / 12%);
}
```

## Motion And Sound

Use motion lightly: 120-180ms for taps, 180-240ms for drawers/modals, and no bouncy effects on data-heavy lists.

Audio is optional and should default off or be very quiet. Use `tap.wav` for tiny interactions, `complete.wav` for saved checklist items, and `ambient-loop.wav` only as an opt-in planning mode.
