// Pure helpers for stays (lodging). No server-only / DB here, so both client
// and server can use them. Buttons prefer a stay's own hotel link / map place,
// and fall back to a search built from area + city.

import { mapsUrl, bookingUrl } from "./links";

export type StayStatus = "planned" | "maybe" | "booked" | "paid";

export interface StayView {
  id: number;
  city: string;
  area: string;
  fromDay: number;
  toDay: number;
  note: string;
  status: StayStatus;
  /** Optional specific hotel/booking link. */
  url: string | null;
  /** Optional exact map place/address. */
  mapQuery: string | null;
}

export function stayForDayIn(stays: StayView[], day: number): StayView | null {
  return stays.find((s) => day >= s.fromDay && day <= s.toDay) ?? null;
}

export function stayNights(s: { fromDay: number; toDay: number }): number {
  return Math.max(0, s.toDay - s.fromDay + 1);
}

export function stayQuery(s: { area: string; city: string }): string {
  return `${s.area}, ${s.city}`;
}

/** Where the hotel button points: a saved link, else a booking search. */
export function stayHotelHref(s: StayView): string {
  return s.url && s.url.trim() ? s.url.trim() : bookingUrl(stayQuery(s));
}

export function stayHotelLabel(s: StayView): string {
  return s.url && s.url.trim() ? "Open hotel" : "Find hotels";
}

/** Where the map button points: a saved place/address, else "area, city". */
export function stayMapHref(s: StayView): string {
  return mapsUrl(s.mapQuery && s.mapQuery.trim() ? s.mapQuery.trim() : stayQuery(s));
}
