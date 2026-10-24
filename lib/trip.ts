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
  subtitle: "Osaka · Kyoto · Arashiyama · Uji",
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
    summary:
      "Overnight flight in, bags to the hotel, then the whole day at USJ. Go easy in the evening.",
    transport:
      "CX566 lands Kansai (KIX) T1 at 06:20 → JR Haruka / Kansai-Airport Rapid to Osaka (~50–70 min).",
    activities: [
      {
        time: "06:20",
        title: "Land at Kansai Airport",
        description:
          "Immigration + bags ≈ 1h. Pick up ICOCA / eSIM if you haven't. Fill Visit Japan Web before landing.",
        category: "travel",
        location: "Kansai International Airport Terminal 1",
      },
      {
        time: "08:30",
        title: "Drop bags at the hotel",
        description:
          "Too early to check in — leave the luggage at reception and go. If the hotel isn't on the way, use the lockers at Universal City station instead.",
        category: "checkin",
        location: "Osaka",
      },
      {
        time: "10:00",
        title: "Universal Studios Japan",
        description:
          "Mon Oct 26: official 08:00–22:00, usually opens ~07:30. Expect crowds (Halloween season). Super Nintendo World needs a timed-entry ticket — grab it in the USJ app the moment you're inside, unless you hold an Express Pass that includes it. Mario Kart single-rider line is faster.",
        category: "city",
        cost: "¥8,400+",
        booking: "Date-specific ticket — rebook from Oct 31 to Oct 26",
        location: "Universal Studios Japan, Osaka",
        mustDo: true,
      },
      {
        time: "18:30",
        title: "Dinner at Universal CityWalk, then hotel",
        description:
          "You've been awake ~36h. Eat near the park, check in, sleep. Dotonbori is for the weekend.",
        category: "food",
        cost: "¥2,500",
        location: "Universal CityWalk Osaka",
      },
    ],
  },
  {
    day: 2,
    city: "Kyoto",
    title: "To Kyoto: Fushimi Inari & Gion",
    summary: "Slow morning after USJ, train to Kyoto, torii gates in the afternoon light.",
    transport: "Osaka → Kyoto by JR Special Rapid (~30 min) or Hankyu (~45 min).",
    restDay: true,
    activities: [
      {
        time: "11:00",
        title: "Check out, train to Kyoto",
        description: "No rush. Leave bags at the Kyoto hotel on arrival.",
        category: "travel",
        location: "Kyoto Station",
      },
      {
        time: "14:30",
        title: "Fushimi Inari Taisha",
        description:
          "Thousands of vermilion gates up the hill. Open 24h — afternoon is fine, and the upper trails thin out fast.",
        category: "culture",
        cost: "Free",
        location: "Fushimi Inari Taisha, Kyoto",
        mustDo: true,
      },
      {
        time: "18:00",
        title: "Gion at dusk",
        description: "Hanamikoji and the wooden machiya lanes as the lanterns come on.",
        category: "culture",
        cost: "Free",
        location: "Gion, Kyoto",
      },
      {
        time: "19:30",
        title: "Dinner in Pontocho",
        description: "Lantern-lit alley along the river. Walk in or book a counter spot.",
        category: "food",
        cost: "¥4,000",
        location: "Pontocho, Kyoto",
      },
    ],
  },
  {
    day: 3,
    city: "Kyoto",
    title: "Kinkaku-ji, Nijo Castle → ryokan",
    summary: "Golden pavilion in the morning, then check into the ryokan and stop moving.",
    activities: [
      {
        time: "09:00",
        title: "Kinkaku-ji (Golden Pavilion)",
        description: "Go at opening — the pond reflection is best before the crowds.",
        category: "culture",
        cost: "¥500",
        location: "Kinkaku-ji, Kyoto",
        mustDo: true,
      },
      {
        time: "11:30",
        title: "Nijo Castle",
        description: "Nightingale floors and painted screens. ~1.5h.",
        category: "culture",
        cost: "¥1,300",
        location: "Nijo Castle, Kyoto",
      },
      {
        time: "15:00",
        title: "Check in at the ryokan",
        description: "Private onsen first, then yukata. Dinner is served early — don't be late.",
        category: "checkin",
        location: "Kyoto",
      },
      {
        time: "18:00",
        title: "Kaiseki dinner & onsen",
        description: "The slow centerpiece of the trip.",
        category: "nature",
        cost: "Incl. stay",
        mustDo: true,
      },
    ],
  },
  {
    day: 4,
    city: "Arashiyama",
    title: "Arashiyama day",
    summary: "Bamboo grove early, temple garden, river, monkeys. Back to the ryokan for a second soak.",
    transport: "Kyoto → Saga-Arashiyama by JR Sagano Line (~15 min) or Hankyu to Arashiyama.",
    activities: [
      {
        time: "08:30",
        title: "Bamboo grove",
        description: "Be there by 8:30 — tour groups arrive mid-morning.",
        category: "nature",
        cost: "Free",
        location: "Arashiyama Bamboo Grove, Kyoto",
        mustDo: true,
      },
      {
        time: "09:30",
        title: "Tenryu-ji temple & garden",
        description: "Zen garden framed by the mountains. Exit through the north gate into the bamboo.",
        category: "culture",
        cost: "¥500",
        location: "Tenryu-ji Temple, Kyoto",
      },
      {
        time: "12:00",
        title: "Lunch: yudofu (tofu hot pot)",
        description: "The Arashiyama specialty.",
        category: "food",
        cost: "¥3,000",
        location: "Arashiyama, Kyoto",
      },
      {
        time: "13:30",
        title: "Iwatayama Monkey Park",
        description: "20-min uphill walk, free-roaming macaques, view over Kyoto.",
        category: "nature",
        cost: "¥600",
        location: "Arashiyama Monkey Park Iwatayama",
      },
      {
        time: "17:00",
        title: "Back to the ryokan",
        description: "Onsen, dinner, early night.",
        category: "nature",
        cost: "Incl. stay",
      },
    ],
  },
  {
    day: 5,
    city: "Osaka",
    title: "Uji on the way back to Osaka",
    summary: "Check out, matcha town for the day, Osaka by evening.",
    transport:
      "Ryokan → Kyoto Station → Uji by JR Nara Line (~20–30 min). Uji → Osaka via Kyoto (~1h). Use coin lockers at Uji station.",
    activities: [
      {
        time: "11:00",
        title: "Byodo-in temple",
        description: "The Phoenix Hall on the ¥10 coin. Book the inside tour on arrival (limited slots).",
        category: "culture",
        cost: "¥700",
        location: "Byodo-in, Uji",
        mustDo: true,
      },
      {
        time: "12:30",
        title: "Matcha lunch & sweets",
        description: "Byodo-in Omotesando street: matcha soba, parfaits, Nakamura Tokichi or Itoh Kyuemon.",
        category: "food",
        cost: "¥2,500",
        location: "Byodo-in Omotesando, Uji",
      },
      {
        time: "14:00",
        title: "Uji river & Ujigami shrine",
        description: "Cross the bridge, walk the riverbank, oldest shrine building in Japan.",
        category: "nature",
        cost: "Free",
        location: "Ujigami Shrine, Uji",
      },
      {
        time: "17:30",
        title: "Check in at the Osaka hotel",
        description: "Same hotel as night 1.",
        category: "checkin",
        location: "Osaka",
      },
      {
        time: "19:30",
        title: "Dinner near the hotel",
        description: "Easy night — tomorrow is the big Osaka day.",
        category: "food",
        cost: "¥3,000",
        location: "Osaka",
      },
    ],
  },
  {
    day: 6,
    city: "Osaka",
    title: "Osaka: Shitennoji, Shinsekai, castle, Dotonbori",
    summary: "The Osaka day that got cut from the start of the trip, all in one.",
    activities: [
      {
        time: "09:00",
        title: "Shitennoji temple",
        description:
          "Japan's oldest official temple (593). Closes at 16:00 — that's why it's first. Metro Tanimachi Line to Shitennoji-mae Yuhigaoka, 5-min walk.",
        category: "culture",
        cost: "¥500",
        location: "Shitennoji, Osaka",
        mustDo: true,
      },
      {
        time: "11:30",
        title: "Shinsekai & kushikatsu lunch",
        description: "20-min walk south. Tsutenkaku tower, retro streets, deep-fried skewers. No double-dipping.",
        category: "food",
        cost: "¥2,000",
        location: "Shinsekai, Osaka",
      },
      {
        time: "14:30",
        title: "Osaka Castle & park",
        description: "The keep + museum inside, moat walk outside. ~2h.",
        category: "culture",
        cost: "¥600",
        location: "Osaka Castle",
      },
      {
        time: "18:30",
        title: "Dotonbori",
        description: "Glico sign, canal neon, takoyaki and okonomiyaki. Kuromon market is on the way if it's still open.",
        category: "food",
        cost: "¥3,500",
        location: "Dotonbori, Osaka",
        mustDo: true,
      },
    ],
  },
  {
    day: 7,
    city: "Departure",
    title: "Osaka → Kobe Airport → home",
    summary: "Conbini breakfast, train to Kobe, JX307 at 13:30.",
    transport:
      "Osaka → Sannomiya by JR / Hanshin (~30 min) → Port Liner to Kobe Airport (~18 min). Be at the airport by 11:30.",
    restDay: true,
    activities: [
      {
        time: "08:00",
        title: "Conbini breakfast & last snacks",
        description: "Egg sando, coffee, a bag of Kit-Kats for the flight.",
        category: "food",
        cost: "¥800",
      },
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
    note: "Two nights with dinner. Dinner is served early — be back by 17:30.",
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
