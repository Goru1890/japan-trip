// Build external links (Google Maps, hotel search) from plain place strings.

/** Google Maps search link for a place name. */
export function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Booking.com search link for an area (no dates baked in — pick on arrival). */
export function bookingUrl(query: string): string {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query)}`;
}

/** Google "hotels in <area>" search as a provider-neutral alternative. */
export function hotelsSearchUrl(query: string): string {
  return `https://www.google.com/travel/search?q=${encodeURIComponent(
    "hotels in " + query
  )}`;
}
