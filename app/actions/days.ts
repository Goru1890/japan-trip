"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { addDay, updateDay, deleteDay, type DayInput } from "@/lib/db/queries";
import type { FormResult } from "./activities";

function field(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function parse(fd: FormData): DayInput {
  return {
    city: String(fd.get("city") ?? "").trim(),
    title: String(fd.get("title") ?? "").trim(),
    summary: String(fd.get("summary") ?? "").trim(),
    transport: field(fd.get("transport")),
    restDay: fd.get("restDay") === "on" || fd.get("restDay") === "true",
  };
}

function message(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong.";
}

function revalidate() {
  revalidatePath("/itinerary");
  revalidatePath("/now");
  revalidatePath("/");
  revalidatePath("/bookings");
}

export async function addDayAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  await requireSession();
  const input = parse(fd);
  if (!input.city || !input.title) {
    return { error: "City and title are required." };
  }
  try {
    await addDay(input);
  } catch (e) {
    return { error: message(e) };
  }
  revalidate();
  return { ok: true };
}

export async function updateDayAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  await requireSession();
  const id = Number(fd.get("id"));
  const input = parse(fd);
  if (!id) return { error: "Missing day id." };
  if (!input.city || !input.title) {
    return { error: "City and title are required." };
  }
  try {
    await updateDay(id, input);
  } catch (e) {
    return { error: message(e) };
  }
  revalidate();
  return { ok: true };
}

export async function deleteDayAction(fd: FormData): Promise<void> {
  await requireSession();
  const dayNumber = Number(fd.get("dayNumber"));
  if (dayNumber) await deleteDay(dayNumber);
  revalidate();
}
