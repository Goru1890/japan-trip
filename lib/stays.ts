// Pure helpers for stays (lodging). No server-only / DB here, so both client
// and server can use them. Map/booking links are derived from area + city.

export type StayStatus = "planned" | "maybe" | "booked" | "paid";

export interface StayView {
  id: number;
  city: string;
  area: string;
  fromDay: number;
  toDay: number;
  note: string;
  status: StayStatus;
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
