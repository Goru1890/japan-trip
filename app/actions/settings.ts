"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { setStartDate } from "@/lib/db/queries";

export async function setStartDateAction(value: string): Promise<void> {
  await requireSession();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
  await setStartDate(value);
  revalidatePath("/");
  revalidatePath("/itinerary");
  revalidatePath("/now");
}
