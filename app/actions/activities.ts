"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import {
  addActivity,
  updateActivity,
  deleteActivity,
  type ActivityInput,
} from "@/lib/db/queries";

export type FormResult = { ok?: boolean; error?: string };

function field(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function checkbox(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true";
}

function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  return s ? Number(s) : null;
}

function parse(fd: FormData): ActivityInput {
  return {
    dayNumber: Number(fd.get("dayNumber")),
    time: field(fd.get("time")),
    title: String(fd.get("title") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim(),
    category: String(fd.get("category") ?? "city"),
    cost: field(fd.get("cost")),
    booking: field(fd.get("booking")),
    location: field(fd.get("location")),
    mustDo: checkbox(fd.get("mustDo")),
    isSecret: checkbox(fd.get("isSecret")),
    stayId: numOrNull(fd.get("stayId")),
    reservationId: numOrNull(fd.get("reservationId")),
  };
}

function message(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong.";
}

function revalidate() {
  revalidatePath("/itinerary");
  revalidatePath("/now");
}

export async function addActivityAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  const s = await requireSession();
  const input = parse(fd);
  if (!input.title) return { error: "A title is required." };
  if (!input.dayNumber) return { error: "Missing day number." };
  try {
    await addActivity(s.uid, input);
  } catch (e) {
    return { error: message(e) };
  }
  revalidate();
  return { ok: true };
}

export async function updateActivityAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  const s = await requireSession();
  const id = Number(fd.get("id"));
  const input = parse(fd);
  if (!id) return { error: "Missing activity id." };
  if (!input.title) return { error: "A title is required." };
  try {
    await updateActivity(s.uid, id, input);
  } catch (e) {
    return { error: message(e) };
  }
  revalidate();
  return { ok: true };
}

export async function deleteActivityAction(fd: FormData): Promise<void> {
  const s = await requireSession();
  const id = Number(fd.get("id"));
  if (id) await deleteActivity(s.uid, id);
  revalidate();
}
