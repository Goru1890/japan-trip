"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { setStartDate, setSetting } from "@/lib/db/queries";
import type { FormResult } from "./activities";

export async function setStartDateAction(value: string): Promise<void> {
  await requireSession();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
  await setStartDate(value);
  revalidatePath("/");
  revalidatePath("/itinerary");
  revalidatePath("/now");
}

export async function setTripSettingsAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  await requireSession();
  const title = String(fd.get("title") ?? "").trim();
  const subtitle = String(fd.get("subtitle") ?? "").trim();
  const travelers = String(Math.max(1, Math.round(Number(fd.get("travelers") || 1))));
  const seasonNote = String(fd.get("seasonNote") ?? "").trim();
  if (!title) return { error: "A trip title is required." };

  await Promise.all([
    setSetting("title", title),
    setSetting("subtitle", subtitle),
    setSetting("travelers", travelers),
    setSetting("season_note", seasonNote),
  ]);

  // Layout revalidation refreshes the nav title across every page.
  revalidatePath("/", "layout");
  revalidatePath("/budget");
  return { ok: true };
}
