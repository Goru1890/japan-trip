// The single source of truth for the trip. Edit this file to reshape the plan —
// every page renders from it. Dates are computed from a start date you set in
// the app, so the itinerary stays flexible until booked.

export type Category = "food" | "culture" | "nature" | "city";

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
  subtitle: "Tokyo · Hakone · Kyoto · Nara · Osaka · Hiroshima",
  /** Pre-filled in the date picker; change it anytime in the app. */
  defaultStartDate: "2026-10-12",
  travelers: 1,
  /** Pacing note derived from the relaxed 8–14 day guideline. */
  pacing:
    "Relaxed pace: 1–2 major sights per day with built-in rest days, so you " +
    "can wander, eat slowly, and adjust on the fly.",
  /** Suggested because dates aren't booked yet — late Oct = autumn leaves, mild. */
  seasonNote:
    "Suggested for mid-October: shoulder season, mild weather, early autumn " +
    "colors, and fewer crowds than spring's cherry-blossom peak.",
};

export const days: Day[] = [
  {
    day: 1,
    city: "Tokyo",
    title: "Arrival & Shinjuku lights",
    summary:
      "Land, get a Suica/IC card and pocket Wi-Fi, drop bags, and ease into Tokyo with a gentle first evening.",
    transport: "Narita/Haneda → hotel via Narita Express or Airport Limousine bus.",
    restDay: true,
    activities: [
      {
        time: "16:00",
        title: "Check in around Shinjuku",
        description:
          "Central base with great rail links. Grab a Suica card and a SIM/pocket Wi-Fi at the airport first.",
        category: "city",
        cost: "—",
        location: "Shinjuku Station, Tokyo",
      },
      {
        time: "18:30",
        title: "Omoide Yokocho izakaya alley",
        description:
          "Tiny smoky lanes of yakitori stalls. Low-key, delicious first dinner. Cash helps here.",
        category: "food",
        cost: "¥2,500",
        booking: "Walk-in",
        location: "Omoide Yokocho, Shinjuku, Tokyo",
      },
      {
        time: "20:30",
        title: "Tokyo Metropolitan Gov. observation deck",
        description: "Free night view over the city to beat jet lag with a slow win.",
        category: "city",
        cost: "Free",
        location: "Tokyo Metropolitan Government Building Observation Deck",
      },
    ],
  },
  {
    day: 2,
    city: "Tokyo",
    title: "Old Tokyo: Asakusa & Akihabara",
    summary: "Temples and traditions in the morning, neon and gadgets by night.",
    activities: [
      {
        time: "09:00",
        title: "Senso-ji Temple & Nakamise street",
        description:
          "Tokyo's oldest temple. Arrive early to beat crowds, then browse the snack-and-souvenir approach.",
        category: "culture",
        cost: "Free",
        location: "Senso-ji Temple, Asakusa, Tokyo",
        mustDo: true,
      },
      {
        time: "12:30",
        title: "Lunch: tempura or unagi in Asakusa",
        description: "Classic old-Tokyo specialties around the temple district.",
        category: "food",
        cost: "¥2,000",
        location: "Asakusa, Tokyo",
      },
      {
        time: "15:00",
        title: "Akihabara electric town",
        description: "Arcades, retro games, anime, and gadget multi-floors. Pure sensory overload.",
        category: "city",
        cost: "—",
        location: "Akihabara, Tokyo",
      },
      {
        time: "19:00",
        title: "Dinner: standing sushi or ramen",
        description: "End in a buzzing counter spot — point, eat, repeat.",
        category: "food",
        cost: "¥2,500",
        location: "Akihabara, Tokyo",
      },
    ],
  },
  {
    day: 3,
    city: "Tokyo",
    title: "Markets, art & Ginza",
    summary: "A food-forward day from morning market to a digital art world.",
    activities: [
      {
        time: "08:00",
        title: "Toyosu / Tsukiji Outer Market breakfast",
        description: "Sushi breakfast and street snacks — tamago, scallops, fresh uni if you're brave.",
        category: "food",
        cost: "¥3,000",
        booking: "Go early",
        location: "Tsukiji Outer Market, Tokyo",
      },
      {
        time: "11:00",
        title: "teamLab Planets (digital art)",
        description: "Immersive walk-through art. Wildly photogenic; book a timed slot ahead.",
        category: "culture",
        cost: "¥3,800",
        booking: "Reserve ahead",
        location: "teamLab Planets TOKYO, Toyosu",
        mustDo: true,
      },
      {
        time: "15:00",
        title: "Ginza stroll & department-store depachika",
        description: "Upscale shopping, then a basement food hall that'll ruin you for grocery stores.",
        category: "city",
        cost: "—",
        location: "Ginza, Tokyo",
      },
    ],
  },
  {
    day: 4,
    city: "Tokyo",
    title: "Shibuya, Harajuku & Meiji",
    summary: "The Tokyo postcard: a forest shrine, youth fashion, and the famous scramble.",
    activities: [
      {
        time: "09:30",
        title: "Meiji Jingu shrine",
        description: "A serene cedar forest in the middle of the city. You might catch a wedding procession.",
        category: "culture",
        cost: "Free",
        location: "Meiji Jingu, Tokyo",
      },
      {
        time: "11:30",
        title: "Harajuku & Takeshita street",
        description: "Crepes, color, and street fashion. Detour to quieter Cat Street for better shops.",
        category: "city",
        cost: "—",
        location: "Takeshita Street, Harajuku, Tokyo",
      },
      {
        time: "16:00",
        title: "Shibuya Crossing & Sky observation",
        description: "Do the scramble, then go up Shibuya Sky for sunset over the sprawl.",
        category: "city",
        cost: "¥2,500",
        booking: "Reserve sunset slot",
        location: "Shibuya Sky, Tokyo",
      },
      {
        time: "19:30",
        title: "Dinner: izakaya crawl",
        description: "Graze across a few small plates and drinks in the backstreets.",
        category: "food",
        cost: "¥4,000",
        location: "Shibuya, Tokyo",
      },
    ],
  },
  {
    day: 5,
    city: "Hakone",
    title: "To Hakone: onsen & Mt. Fuji",
    summary: "Trade the city for hot springs, lake views, and (clouds permitting) Fuji.",
    transport: "Tokyo → Hakone by Odakyu Romancecar (~1h25). Use the Hakone Free Pass.",
    activities: [
      {
        time: "10:30",
        title: "Hakone loop: pirate ship + ropeway",
        description: "Lake Ashi cruise and a ropeway over the Owakudani volcanic valley. Eat a black egg.",
        category: "nature",
        cost: "Free w/ pass",
        location: "Owakudani, Hakone",
      },
      {
        time: "14:00",
        title: "Hakone Open-Air Museum",
        description: "Sculpture park against the mountains, with a Picasso pavilion.",
        category: "culture",
        cost: "¥2,000",
        location: "Hakone Open-Air Museum",
      },
      {
        time: "17:30",
        title: "Ryokan onsen & kaiseki dinner",
        description: "Soak in a hot spring, then a multi-course dinner in your yukata. The trip's slow centerpiece.",
        category: "nature",
        cost: "Incl. stay",
        booking: "Book ryokan early",
        location: "Hakone-Yumoto Onsen, Hakone",
        mustDo: true,
      },
    ],
  },
  {
    day: 6,
    city: "Kyoto",
    title: "Hakone → Kyoto",
    summary: "A scenic transfer west, then a first taste of old Kyoto by evening.",
    transport: "Hakone → Odawara → Kyoto by Shinkansen (~2h15). Reserve seats.",
    restDay: true,
    activities: [
      {
        time: "12:30",
        title: "Shinkansen west (bento on board)",
        description: "Grab an ekiben station bento and watch for Fuji on the right side of the train.",
        category: "food",
        cost: "¥1,200",
      },
      {
        time: "16:00",
        title: "Check in near Kyoto Station / Gion",
        description: "Settle in, then walk the Kamogawa riverbank as it cools off.",
        category: "city",
        cost: "—",
        location: "Gion, Kyoto",
      },
      {
        time: "19:00",
        title: "Pontocho alley dinner",
        description: "Lantern-lit lane of restaurants along the river. Atmospheric first Kyoto meal.",
        category: "food",
        cost: "¥4,500",
        booking: "Reserve ahead",
        location: "Pontocho, Kyoto",
      },
    ],
  },
  {
    day: 7,
    city: "Kyoto",
    title: "Fushimi Inari & Higashiyama",
    summary: "Thousands of red gates at dawn, historic lanes and a hillside temple by afternoon.",
    activities: [
      {
        time: "07:30",
        title: "Fushimi Inari Taisha (early)",
        description: "Endless vermilion torii up the mountain. Go at dawn for near-empty photos and a quiet climb.",
        category: "culture",
        cost: "Free",
        location: "Fushimi Inari Taisha, Kyoto",
        mustDo: true,
      },
      {
        time: "11:30",
        title: "Nishiki Market grazing",
        description: "‘Kyoto's kitchen’ — pickles, tofu, skewers, matcha everything. Eat your way through.",
        category: "food",
        cost: "¥2,500",
        location: "Nishiki Market, Kyoto",
      },
      {
        time: "15:00",
        title: "Kiyomizu-dera & Sannenzaka lanes",
        description: "Hilltop temple with city views, reached via preserved stone shopping streets.",
        category: "culture",
        cost: "¥500",
        location: "Kiyomizu-dera, Kyoto",
      },
      {
        time: "18:00",
        title: "Gion at dusk",
        description: "Wander the geisha district's wooden machiya; you may glimpse a geiko hurrying to work.",
        category: "culture",
        cost: "Free",
        location: "Gion, Kyoto",
      },
    ],
  },
  {
    day: 8,
    city: "Kyoto",
    title: "Arashiyama & golden temples",
    summary: "Bamboo groves, a riverside town, and Kyoto's most dazzling pavilion.",
    activities: [
      {
        time: "08:30",
        title: "Arashiyama bamboo grove",
        description: "Towering green corridors — earlier is calmer. Add the Iwatayama monkey park if energetic.",
        category: "nature",
        cost: "Free",
        location: "Arashiyama Bamboo Grove, Kyoto",
      },
      {
        time: "11:00",
        title: "Tenryu-ji temple & garden",
        description: "A Zen garden framed by the mountains; one of Kyoto's finest landscape designs.",
        category: "culture",
        cost: "¥500",
        location: "Tenryu-ji Temple, Kyoto",
      },
      {
        time: "14:30",
        title: "Kinkaku-ji (Golden Pavilion)",
        description: "Gold-leaf temple mirrored in its pond. Compact but unforgettable.",
        category: "culture",
        cost: "¥500",
        location: "Kinkaku-ji, Kyoto",
        mustDo: true,
      },
      {
        time: "18:30",
        title: "Dinner: tofu kaiseki or yakitori",
        description: "Kyoto does refined vegetarian-friendly cuisine beautifully.",
        category: "food",
        cost: "¥4,000",
        location: "Kyoto",
      },
    ],
  },
  {
    day: 9,
    city: "Nara",
    title: "Day trip: Nara's deer & Great Buddha",
    summary: "Bowing deer in the park and a colossal bronze Buddha, an easy hop from Kyoto.",
    transport: "Kyoto ⇄ Nara by JR/Kintetsu (~45 min each way).",
    restDay: true,
    activities: [
      {
        time: "09:30",
        title: "Nara Park & free-roaming deer",
        description: "Buy deer crackers and watch them bow for a treat. Gentle, very fun.",
        category: "nature",
        cost: "¥200",
        location: "Nara Park",
      },
      {
        time: "11:00",
        title: "Todai-ji & the Great Buddha",
        description: "One of the world's largest wooden buildings, housing a 15m bronze Buddha.",
        category: "culture",
        cost: "¥600",
        location: "Todai-ji, Nara",
      },
      {
        time: "13:00",
        title: "Lunch: kakinoha-zushi (persimmon-leaf sushi)",
        description: "A Nara specialty; pressed sushi wrapped in fragrant leaves.",
        category: "food",
        cost: "¥1,500",
        location: "Nara",
      },
      {
        time: "15:00",
        title: "Kasuga Taisha lantern shrine",
        description: "Moss-covered stone lanterns along a forest path back through the park.",
        category: "culture",
        cost: "Free",
        location: "Kasuga Taisha, Nara",
      },
    ],
  },
  {
    day: 10,
    city: "Osaka",
    title: "To Osaka: kuidaore feast",
    summary: "Move to Japan's kitchen and ‘eat until you drop’ in neon Dotonbori.",
    transport: "Kyoto → Osaka by train (~30–45 min). Base near Namba/Umeda.",
    activities: [
      {
        time: "11:00",
        title: "Osaka Castle & park",
        description: "Striking reconstructed keep with a museum inside and a moat-ringed park to stroll.",
        category: "culture",
        cost: "¥600",
        location: "Osaka Castle",
      },
      {
        time: "15:00",
        title: "Kuromon Ichiba Market",
        description: "Grilled scallops, wagyu skewers, blowfish — graze across the stalls.",
        category: "food",
        cost: "¥3,000",
        location: "Kuromon Ichiba Market, Osaka",
      },
      {
        time: "19:00",
        title: "Dotonbori: takoyaki & okonomiyaki",
        description: "The Glico sign, canal-side neon, and street food on every corner. Osaka at full volume.",
        category: "food",
        cost: "¥3,000",
        location: "Dotonbori, Osaka",
        mustDo: true,
      },
    ],
  },
  {
    day: 11,
    city: "Hiroshima",
    title: "Day trip: Hiroshima & Miyajima",
    summary: "A moving peace memorial and the floating torii of Miyajima — a long but iconic day.",
    transport: "Osaka ⇄ Hiroshima by Shinkansen (~1h25 each way); ferry to Miyajima.",
    activities: [
      {
        time: "09:00",
        title: "Peace Memorial Park & Museum",
        description: "Sobering, essential, beautifully done. The A-Bomb Dome stands across the river.",
        category: "culture",
        cost: "¥200",
        location: "Hiroshima Peace Memorial Park",
        mustDo: true,
      },
      {
        time: "12:30",
        title: "Hiroshima-style okonomiyaki",
        description: "Layered with noodles and cabbage — a different beast from Osaka's. Try Okonomimura.",
        category: "food",
        cost: "¥1,500",
        location: "Okonomimura, Hiroshima",
      },
      {
        time: "14:30",
        title: "Miyajima & the floating torii",
        description: "Ferry to the island for the famous sea gate, friendly deer, and Itsukushima Shrine.",
        category: "nature",
        cost: "¥500",
        location: "Itsukushima Shrine, Miyajima",
        mustDo: true,
      },
    ],
  },
  {
    day: 12,
    city: "Osaka",
    title: "Flex day: your Japan, your pace",
    summary:
      "An open day to repeat a favorite, chase a craving, or recover. Some options below.",
    restDay: true,
    activities: [
      {
        time: "Morning",
        title: "Option: Universal Studios Japan",
        description: "Super Nintendo World and Harry Potter. A full day on its own — book tickets ahead.",
        category: "city",
        cost: "¥8,400",
        booking: "Reserve ahead",
        location: "Universal Studios Japan, Osaka",
      },
      {
        time: "Midday",
        title: "Option: Kyoto encore or Koyasan",
        description: "Return for a missed Kyoto temple, or go deeper to the mountaintop temples of Koyasan.",
        category: "culture",
        cost: "—",
      },
      {
        time: "Evening",
        title: "Last big dinner: kushikatsu or sushi",
        description: "Send-off feast. Splurge a little — you earned it.",
        category: "food",
        cost: "¥5,000",
        location: "Dotonbori, Osaka",
      },
    ],
  },
  {
    day: 13,
    city: "Osaka",
    title: "Shopping & souvenirs",
    summary: "Last-minute gifts, a final market, and packing.",
    restDay: true,
    activities: [
      {
        time: "10:00",
        title: "Shinsaibashi shopping arcade",
        description: "Covered kilometer of shops — fashion, drugstores (great gifts), and Don Quijote.",
        category: "city",
        cost: "—",
        location: "Shinsaibashi, Osaka",
      },
      {
        time: "14:00",
        title: "Souvenir food haul",
        description: "Kit-Kats, matcha, sake, sembei. Depachika basements are gift gold.",
        category: "food",
        cost: "—",
        location: "Osaka",
      },
      {
        time: "18:00",
        title: "Sunset drink with a view",
        description: "Umeda Sky Building or a rooftop bar to toast the trip.",
        category: "city",
        cost: "¥2,000",
        location: "Umeda Sky Building, Osaka",
      },
    ],
  },
  {
    day: 14,
    city: "Departure",
    title: "Sayonara, Japan",
    summary: "One last conbini breakfast, then to the airport.",
    transport: "Osaka (KIX) or back to Tokyo for departure. Allow 3h before an international flight.",
    restDay: true,
    activities: [
      {
        time: "08:00",
        title: "Conbini breakfast & final konbini snacks",
        description: "An egg-salad sando, a coffee, and a haul of snacks for the flight home.",
        category: "food",
        cost: "¥800",
      },
      {
        time: "10:30",
        title: "Airport transfer",
        description: "Train or limousine bus to the airport; check in and decompress.",
        category: "city",
        cost: "—",
        location: "Kansai International Airport",
      },
    ],
  },
];

// Where you sleep each night. Areas are recommendations (nothing booked yet) —
// the app builds hotel-search and map links from these.
export const stays: Stay[] = [
  {
    city: "Tokyo",
    area: "Shinjuku or Shibuya",
    fromDay: 1,
    toDay: 4,
    note: "Central, unbeatable train access — ideal for a first visit.",
    bookingQuery: "Shinjuku, Tokyo",
    mapsQuery: "Shinjuku Station, Tokyo",
    status: "planned",
  },
  {
    city: "Hakone",
    area: "Hakone-Yumoto (ryokan)",
    fromDay: 5,
    toDay: 5,
    note: "Book a ryokan with a private/public onsen + kaiseki dinner — the splurge night.",
    bookingQuery: "Hakone Yumoto ryokan onsen",
    mapsQuery: "Hakone-Yumoto, Hakone",
    status: "maybe",
  },
  {
    city: "Kyoto",
    area: "Gion / Kyoto Station",
    fromDay: 6,
    toDay: 9,
    note: "Gion for atmosphere; near Kyoto Station for easy day trips to Nara.",
    bookingQuery: "Gion, Kyoto",
    mapsQuery: "Gion, Kyoto",
    status: "planned",
  },
  {
    city: "Osaka",
    area: "Namba / Dotonbori",
    fromDay: 10,
    toDay: 13,
    note: "Walkable to the food, quick trains to Hiroshima and Kansai airport.",
    bookingQuery: "Namba, Osaka",
    mapsQuery: "Namba, Osaka",
    status: "planned",
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

// Rough per-person estimate for a ~2-week mid-range trip (shoulder season).
// These are planning placeholders — refine as you book.
export const budget: BudgetLine[] = [
  { category: "Flights (round trip)", estimate: 1100, note: "Book 6–8 weeks ahead; set price alerts." },
  { category: "Accommodation (13 nights)", estimate: 1560, note: "~$120/night mid-range; ryokan night costs more." },
  { category: "Rail & Shinkansen", estimate: 400, note: "Point-to-point often beats the JR Pass now — compare." },
  { category: "Food & dining", estimate: 700, note: "~$50/day; cheap ramen to one splurge kaiseki." },
  { category: "Activities & entries", estimate: 300, note: "Temples are cheap; teamLab/USJ are the big ones." },
  { category: "Local transport & IC card", estimate: 150, note: "Suica/ICOCA for subways, buses, conbini." },
  { category: "Travel insurance", estimate: 80, note: "Medical + cancellation; buy at booking." },
  { category: "Contingency (10%)", estimate: 460, note: "Gifts, surprises, that extra bowl of ramen." },
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
    title: "Clothing (~2 weeks)",
    items: [
      "5–6 tops, 3–4 bottoms (mix & match)",
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
      "Reserve Shinkansen seats for transfer days",
      "Decide JR Pass vs point-to-point (run the numbers)",
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
