// The single source of truth for the trip. Edit this file to reshape the plan —
// every page renders from it. Dates are computed from a start date you set in
// the app, so the itinerary stays flexible until booked.

export type Category =
  | "food"
  | "culture"
  | "nature"
  | "city"
  | "travel"
  | "checkin";

export interface Activity {
  /** 24h local time, e.g. "08:30". Optional for flexible items. */
  time?: string;
  title: string;
  description: string;
  category: Category;
  /** Rough per-person cost, already formatted, e.g. "¥1,500" or "Free". */
  cost?: string;
  /** Booking note, e.g. "Reserve ahead" or "Walk-in". */
  booking?: string;
  /** A Google-Maps-searchable place, e.g. "Senso-ji Temple, Asakusa, Tokyo".
   *  When set, the itinerary shows a "Map" link. */
  location?: string;
  /** Highlight as a signature, don't-miss stop. */
  mustDo?: boolean;
}

export interface Day {
  /** 1-based day number. */
  day: number;
  city: string;
  title: string;
  summary: string;
  /** How you move today (between cities or notable hops). */
  transport?: string;
  /** A lighter day with built-in slack (per the 8–14 day relaxed pacing). */
  restDay?: boolean;
  activities: Activity[];
}

/** Where you sleep. One stay can cover several days in the same city. */
export interface Stay {
  city: string;
  /** Recommended neighborhood / area to book in. */
  area: string;
  /** First and last day numbers you sleep here (inclusive). */
  fromDay: number;
  toDay: number;
  /** Why this area — one line. */
  note: string;
  /** Search string for hotel-booking links. */
  bookingQuery: string;
  /** Google-Maps-searchable area. */
  mapsQuery: string;
  /** Booking progress, surfaced as a status badge. */
  status: "planned" | "maybe" | "booked" | "paid";
}

export interface BudgetLine {
  category: string;
  /** Estimated total for one traveler across the whole trip, in USD. */
  estimate: number;
  note: string;
}

export interface ChecklistSection {
  title: string;
  items: string[];
}

export const categoryMeta: Record<
  Category,
  { label: string; emoji: string; dot: string; chip: string; ring: string }
> = {
  food: {
    label: "Food",
    emoji: "🍜",
    dot: "bg-lantern",
    chip: "bg-lantern/25 text-ink border-lantern/50",
    ring: "ring-lantern",
  },
  culture: {
    label: "Culture",
    emoji: "⛩️",
    dot: "bg-cedar",
    chip: "bg-cedar/15 text-ink border-cedar/40",
    ring: "ring-cedar",
  },
  nature: {
    label: "Nature",
    emoji: "🌿",
    dot: "bg-matcha",
    chip: "bg-matcha/25 text-ink border-matcha/50",
    ring: "ring-matcha",
  },
  city: {
    label: "City & Shopping",
    emoji: "🏙️",
    dot: "bg-sakura",
    chip: "bg-sakura/30 text-ink border-sakura/60",
    ring: "ring-sakura",
  },
  travel: {
    label: "Travel",
    emoji: "🚆",
    dot: "bg-sky",
    chip: "bg-sky/25 text-ink border-sky/50",
    ring: "ring-sky",
  },
  checkin: {
    label: "Check-in",
    emoji: "🛎️",
    dot: "bg-ink/60",
    chip: "bg-ink/10 text-ink border-ink/30",
    ring: "ring-ink",
  },
};

/** Status badge styling for hotel/booking progress. */
export const statusMeta: Record<
  Stay["status"],
  { label: string; chip: string }
> = {
  planned: { label: "Planned", chip: "bg-sky/20 text-ink border-sky/50" },
  maybe: { label: "Maybe", chip: "bg-ink/10 text-ink border-ink/20" },
  booked: { label: "Booked", chip: "bg-matcha/25 text-ink border-matcha/50" },
  paid: { label: "Paid", chip: "bg-lantern/30 text-ink border-lantern/60" },
};

export const tripMeta = {
  title: "Japan Trip",
  subtitle: "Osaka · Kyoto · Minoh · Uji · Kobe",
  /** Replanned after the Oct 24 flight was cancelled: CX566 lands KIX Oct 26 06:20. */
  defaultStartDate: "2026-10-26",
  travelers: 2,
  pacing:
    "One big thing per day. Two bases (Osaka, Kyoto) and a ryokan — the rest is slack.",
  seasonNote:
    "Replanned: landing Kansai Oct 26 at 06:20, straight to USJ. Home from Kobe Nov 1.",
};

export const days: Day[] = [
  {
    day: 1,
    city: "Osaka",
    title: "Land & Universal Studios Japan",
    summary: "Overnight flight in, straight to USJ. Go easy in the evening.",
    transport:
      "CX566 lands Kansai (KIX) T1 at 06:20 → JR Kansai-Airport Rapid to Universal City (~70–80 min, change at Nishikujo).",
    activities: [
      {
        time: "06:20",
        title: "Land at Kansai Airport",
        description:
          "Immigration + bags ≈ 1h. Fill Visit Japan Web before landing.",
        category: "travel",
        location: "Kansai International Airport Terminal 1",
      },
      {
        time: "08:30",
        title: "Luggage: hotel or lockers",
        description:
          "If the hotel isn't on the way, skip it — big lockers at Universal City station and outside the park gate.",
        category: "checkin",
        location: "Universal City Station, Osaka",
      },
      {
        time: "09:00",
        title: "Universal Studios Japan",
        description:
          "Entry 9:00–10:00. Super Nintendo World needs a timed-entry ticket in the USJ app (unless your Express Pass includes it) — get it as soon as you're inside.",
        category: "city",
        booking: "Tickets dated Oct 26",
        location: "Universal Studios Japan, Osaka",
        mustDo: true,
      },
      {
        time: "18:30",
        title: "Dinner at CityWalk, then hotel",
        description: "You'll have been up ~36h. Eat, check in, sleep.",
        category: "food",
        location: "Universal CityWalk Osaka",
      },
    ],
  },
  {
    day: 2,
    city: "Kyoto",
    title: "Nanzen-ji, yudofu lunch & Ginkaku-ji",
    summary: "Train to Kyoto, tofu kaiseki at Junsei, then the Philosopher's Path to the Silver Pavilion.",
    transport: "Osaka → Kyoto by JR Special Rapid (~30 min). Drop bags at the Kyoto hotel first.",
    activities: [
      {
        time: "11:30",
        title: "Lunch: Nanzen-ji Junsei (yudofu kaiseki)",
        description: "Tofu hot-pot kaiseki in a garden setting, next to Nanzen-ji.",
        category: "food",
        booking: "Reserved 11:30",
        location: "Nanzenji Junsei, Kyoto",
        mustDo: true,
      },
      {
        time: "13:00",
        title: "Nanzen-ji",
        description: "Sanmon gate (climb it for the view) and the brick aqueduct behind the temple.",
        category: "culture",
        cost: "¥600",
        location: "Nanzen-ji, Kyoto",
      },
      {
        time: "14:30",
        title: "Philosopher's Path → Ginkaku-ji",
        description: "~30 min canal walk north. Ginkaku-ji closes at 17:00.",
        category: "culture",
        cost: "¥500",
        location: "Ginkaku-ji, Kyoto",
        mustDo: true,
      },
    ],
  },
  {
    day: 3,
    city: "Kyoto",
    title: "Katsuo-ji → Osaka → ryokan",
    summary: "Early start to the daruma temple in Minoh, a stop in Osaka, ryokan by 16:30.",
    transport:
      "Kyoto → Senri-Chuo → Hankyu bus to Katsuoji (~1h30). Send big luggage from the Kyoto hotel to the ryokan (hands-free delivery) or leave it in Kyoto Station lockers.",
    activities: [
      {
        time: "07:00",
        title: "Leave the Kyoto hotel",
        description: "Luggage sorted before you go (see transport).",
        category: "travel",
      },
      {
        time: "08:30",
        title: "Katsuo-ji (daruma temple)",
        description:
          "Thousands of 'victory' daruma on every ledge. Opens 08:00 on weekdays. Allow 5–6h with the round trip.",
        category: "culture",
        cost: "¥400",
        location: "Katsuo-ji, Minoh, Osaka",
        mustDo: true,
      },
      {
        time: "13:00",
        title: "Osaka",
        description: "13:00–15:00 in Osaka.",
        category: "city",
        location: "Osaka",
      },
      {
        time: "15:00",
        title: "Back to Kyoto → ryokan",
        description: "Arrive at the ryokan by 16:30.",
        category: "travel",
      },
      {
        time: "16:30",
        title: "Ryokan check-in, onsen evening",
        description: "Dinner at the ryokan.",
        category: "checkin",
        cost: "Incl. stay",
      },
    ],
  },
  {
    day: 4,
    city: "Kyoto",
    title: "Ryokan day",
    summary: "Nothing planned. Onsen evening.",
    restDay: true,
    activities: [
      {
        time: "Evening",
        title: "Onsen evening",
        description: "Dinner at the ryokan.",
        category: "nature",
        cost: "Incl. stay",
      },
    ],
  },
  {
    day: 5,
    city: "Osaka",
    title: "Maikoya → back to Osaka",
    summary: "Check out, tea/kimono experience at Maikoya, Osaka by evening.",
    transport: "Kyoto → Osaka by JR Special Rapid (~30 min).",
    activities: [
      {
        time: "10:30",
        title: "Maikoya",
        description: "Booked 10:30.",
        category: "culture",
        booking: "Reserved 10:30",
        location: "Maikoya Kyoto",
        mustDo: true,
      },
      {
        time: "17:00",
        title: "Check in at the Osaka hotel",
        description: "Same hotel as night 1.",
        category: "checkin",
        location: "Osaka",
      },
      {
        time: "19:30",
        title: "Option: teamLab Botanical Garden Osaka",
        description:
          "Replaces the Oct 25 slot lost to the cancellation — ask teamLab to move the ticket. Nagai Park, Midosuji Line to Nagai (~15 min from Namba). Evenings only.",
        category: "culture",
        booking: "Rebook",
        location: "teamLab Botanical Garden Osaka",
      },
    ],
  },
  {
    day: 6,
    city: "Osaka",
    title: "Uji matcha, Osaka, Kobe beef",
    summary: "Matcha tasting in Uji, afternoon in Osaka, Kobe beef dinner.",
    transport: "Osaka → Uji (~1h, via Kyoto or Keihan). Uji/Osaka → Kobe Sannomiya (~30 min from Osaka).",
    activities: [
      {
        time: "13:30",
        title: "Tatsumiya — Matcha Tasting Course",
        description: "On the Uji riverbank, 12 min walk from Keihan Uji / 15 min from JR Uji.",
        category: "food",
        cost: "¥8,500",
        booking: "Reserved 13:30",
        location: "Tatsumiya, Uji",
        mustDo: true,
      },
      {
        time: "Afternoon",
        title: "Osaka",
        description: "Free afternoon in Osaka.",
        category: "city",
        location: "Osaka",
      },
      {
        time: "19:00",
        title: "Kobe beef dinner",
        description: "Sannomiya area. Still to find & reserve.",
        category: "food",
        booking: "To reserve",
        location: "Sannomiya, Kobe",
        mustDo: true,
      },
    ],
  },
  {
    day: 7,
    city: "Departure",
    title: "Osaka → Kobe Airport → home",
    summary: "Train to Kobe, JX307 at 13:30.",
    transport:
      "Osaka → Sannomiya by JR / Hanshin (~30 min) → Port Liner to Kobe Airport (~18 min). Be at the airport by 11:30.",
    restDay: true,
    activities: [
      {
        time: "09:45",
        title: "Leave for Kobe Airport",
        description: "Check out, train to Sannomiya, Port Liner to the airport.",
        category: "travel",
        location: "Kobe Airport",
      },
      {
        time: "13:30",
        title: "JX307 Kobe → Taichung",
        description: "STARLUX, arrives 15:35.",
        category: "travel",
        location: "Kobe Airport",
      },
    ],
  },
];

// Where you sleep each night.
export const stays: Stay[] = [
  {
    city: "Osaka",
    area: "Osaka hotel · night 1",
    fromDay: 1,
    toDay: 1,
    note: "Same hotel as nights 5–6. Tell them you're arriving Oct 26, not Oct 24, so the booking isn't cancelled as a no-show.",
    bookingQuery: "Namba, Osaka",
    mapsQuery: "Namba, Osaka",
    status: "booked",
  },
  {
    city: "Kyoto",
    area: "Kyoto hotel",
    fromDay: 2,
    toDay: 2,
    note: "One night before the ryokan.",
    bookingQuery: "Kyoto Station, Kyoto",
    mapsQuery: "Kyoto Station",
    status: "booked",
  },
  {
    city: "Kyoto",
    area: "Ryokan",
    fromDay: 3,
    toDay: 4,
    note: "Two nights with dinner. Arrive by 16:30.",
    bookingQuery: "Kyoto ryokan private onsen",
    mapsQuery: "Kyoto",
    status: "booked",
  },
  {
    city: "Osaka",
    area: "Osaka hotel · nights 5–6",
    fromDay: 5,
    toDay: 6,
    note: "Same hotel as night 1.",
    bookingQuery: "Namba, Osaka",
    mapsQuery: "Namba, Osaka",
    status: "booked",
  },
];

/** The stay you sleep at on a given day number (null on the departure day). */
export function stayForDay(day: number): Stay | null {
  return stays.find((s) => day >= s.fromDay && day <= s.toDay) ?? null;
}

/** Number of nights for a stay. */
export function stayNights(stay: Stay): number {
  return stay.toDay - stay.fromDay + 1;
}

// Rough per-person estimate for the 6-night Kansai trip.
// These are planning placeholders — refine as you book.
export const budget: BudgetLine[] = [
  { category: "Flights", estimate: 800, note: "STARLUX return + Cathay rebooking after the cancellation." },
  { category: "Accommodation (6 nights)", estimate: 1100, note: "Osaka ×3, Kyoto ×1, ryokan ×2 (ryokan incl. dinner)." },
  { category: "Rail", estimate: 80, note: "All local Kansai trains — no Shinkansen, no JR Pass." },
  { category: "Food & dining", estimate: 350, note: "~$50/day; two dinners are included at the ryokan." },
  { category: "Activities & entries", estimate: 150, note: "USJ is the big one; temples are ¥500–1,300." },
  { category: "Local transport & IC card", estimate: 150, note: "Suica/ICOCA for subways, buses, conbini." },
  { category: "Travel insurance", estimate: 80, note: "Medical + cancellation; buy at booking." },
  { category: "Contingency (10%)", estimate: 260, note: "Gifts, surprises, that extra bowl of ramen." },
];

export const packing: ChecklistSection[] = [
  {
    title: "Documents",
    items: [
      "Passport (valid 6+ months beyond travel)",
      "Flight & hotel confirmations (printed + digital)",
      "Travel insurance documents",
      "Two cards from different banks + some cash",
      "Copies of everything stored in the cloud",
    ],
  },
  {
    title: "Electronics",
    items: [
      "Phone + charger",
      "Type A power adapter (Japan = 100V, often works as-is for US plugs)",
      "Portable battery pack (long sightseeing days)",
      "Pocket Wi-Fi or eSIM/SIM",
    ],
  },
  {
    title: "Clothing (1 week)",
    items: [
      "4 tops, 2–3 bottoms (mix & match)",
      "Layers + light rain jacket (Oct can swing cool)",
      "One smart-casual outfit for nicer dinners",
      "Genuinely comfortable walking shoes (you'll do 15k+ steps/day)",
      "Slip-on shoes & clean socks (you'll remove shoes often)",
    ],
  },
  {
    title: "Japan-specific",
    items: [
      "Small coin purse (¥ coins pile up fast)",
      "Compact daypack for day trips",
      "Foldable tote for shopping (few free bags)",
      "Hand towel (many restrooms have no dryers)",
      "Any prescription meds in original packaging — check Japan's import rules",
    ],
  },
];

export const prep: ChecklistSection[] = [
  {
    title: "12+ weeks before",
    items: [
      "Confirm visa-free eligibility for your passport (90 days for many)",
      "Check passport validity & renew if needed",
      "Set flight price alerts; decide cities & rough dates",
      "Buy travel insurance once flights are booked",
    ],
  },
  {
    title: "4–8 weeks before",
    items: [
      "Book all accommodation (ryokan & peak nights fill first)",
      "Reserve teamLab / USJ / popular restaurants",
    ],
  },
  {
    title: "1–2 weeks before",
    items: [
      "Order pocket Wi-Fi / eSIM (airport pickup or pre-installed)",
      "Set up Suica/ICOCA in Apple/Google Wallet if supported",
      "Notify banks of travel; load a travel card",
      "Download maps offline + a translation app",
    ],
  },
  {
    title: "Day of",
    items: [
      "Passport + boarding pass accessible",
      "Hotel address written down (for immigration form & taxis)",
      "Battery pack charged",
      "Fill the immigration/customs QR (Visit Japan Web) in advance",
    ],
  },
];
