"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { addStay, updateStay, deleteStay, type StayInput } from "@/lib/db/queries";
import type { FormResult } from "./activities";

function field(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function parse(fd: FormData): StayInput {
  const from = Number(fd.get("fromDay"));
  const to = Number(fd.get("toDay"));
  return {
    city: String(fd.get("city") ?? "").trim(),
    area: String(fd.get("area") ?? "").trim(),
    fromDay: from,
    toDay: to >= from ? to : from,
    note: String(fd.get("note") ?? "").trim(),
    status: String(fd.get("status") ?? "planned"),
    url: field(fd.get("url")),
    mapQuery: field(fd.get("mapQuery")),
  };
}

function message(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong.";
}

function revalidate() {
  revalidatePath("/hotels");
  revalidatePath("/itinerary");
  revalidatePath("/now");
  revalidatePath("/");
}

export async function addStayAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  await requireSession();
  const input = parse(fd);
  if (!input.city || !input.area) return { error: "City and area are required." };
  if (!input.fromDay || !input.toDay) return { error: "Pick the day range." };
  try {
    await addStay(input);
  } catch (e) {
    return { error: message(e) };
  }
  revalidate();
  return { ok: true };
}

export async function updateStayAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  await requireSession();
  const id = Number(fd.get("id"));
  const input = parse(fd);
  if (!id) return { error: "Missing stay id." };
  if (!input.city || !input.area) return { error: "City and area are required." };
  try {
    await updateStay(id, input);
  } catch (e) {
    return { error: message(e) };
  }
  revalidate();
  return { ok: true };
}

export async function deleteStayAction(fd: FormData): Promise<void> {
  await requireSession();
  const id = Number(fd.get("id"));
  if (id) await deleteStay(id);
  revalidate();
}
