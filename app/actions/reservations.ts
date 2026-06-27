"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import {
  addReservation,
  updateReservation,
  deleteReservation,
  type ReservationInput,
} from "@/lib/db/queries";
import type { FormResult } from "./activities";

function field(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function parse(fd: FormData): ReservationInput {
  const day = field(fd.get("dayNumber"));
  return {
    type: String(fd.get("type") ?? "other"),
    title: String(fd.get("title") ?? "").trim(),
    startsAt: field(fd.get("startsAt")),
    dayNumber: day ? Number(day) : null,
    confirmation: field(fd.get("confirmation")),
    url: field(fd.get("url")),
    notes: field(fd.get("notes")),
    isSecret: fd.get("isSecret") === "on" || fd.get("isSecret") === "true",
  };
}

function message(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong.";
}

function revalidate() {
  revalidatePath("/bookings");
  revalidatePath("/now");
  revalidatePath("/itinerary");
}

export async function addReservationAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  const s = await requireSession();
  const input = parse(fd);
  if (!input.title) return { error: "A title is required." };
  try {
    await addReservation(s.uid, input);
  } catch (e) {
    return { error: message(e) };
  }
  revalidate();
  return { ok: true };
}

export async function updateReservationAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  const s = await requireSession();
  const id = Number(fd.get("id"));
  const input = parse(fd);
  if (!id) return { error: "Missing reservation id." };
  if (!input.title) return { error: "A title is required." };
  try {
    await updateReservation(s.uid, id, input);
  } catch (e) {
    return { error: message(e) };
  }
  revalidate();
  return { ok: true };
}

export async function deleteReservationAction(fd: FormData): Promise<void> {
  const s = await requireSession();
  const id = Number(fd.get("id"));
  if (id) await deleteReservation(s.uid, id);
  revalidate();
}
