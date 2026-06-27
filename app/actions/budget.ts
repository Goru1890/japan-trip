"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import {
  addBudgetLine,
  updateBudgetLine,
  deleteBudgetLine,
  type BudgetInput,
} from "@/lib/db/queries";
import type { FormResult } from "./activities";

function parse(fd: FormData): BudgetInput {
  return {
    category: String(fd.get("category") ?? "").trim(),
    estimate: Number(fd.get("estimate") || 0),
    note: String(fd.get("note") ?? "").trim(),
  };
}

function revalidate() {
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function addBudgetAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  await requireSession();
  const input = parse(fd);
  if (!input.category) return { error: "A category is required." };
  await addBudgetLine(input);
  revalidate();
  return { ok: true };
}

export async function updateBudgetAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  await requireSession();
  const id = Number(fd.get("id"));
  const input = parse(fd);
  if (!id) return { error: "Missing line id." };
  if (!input.category) return { error: "A category is required." };
  await updateBudgetLine(id, input);
  revalidate();
  return { ok: true };
}

export async function deleteBudgetAction(fd: FormData): Promise<void> {
  await requireSession();
  const id = Number(fd.get("id"));
  if (id) await deleteBudgetLine(id);
  revalidate();
}
