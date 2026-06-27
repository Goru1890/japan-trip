"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import {
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  setChecklistChecked,
  type ChecklistInput,
} from "@/lib/db/queries";
import type { FormResult } from "./activities";

function parse(fd: FormData): ChecklistInput {
  return {
    kind: String(fd.get("kind") ?? "packing"),
    section: String(fd.get("section") ?? "").trim() || "General",
    label: String(fd.get("label") ?? "").trim(),
  };
}

function revalidate() {
  revalidatePath("/checklist");
}

export async function addChecklistAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  await requireSession();
  const input = parse(fd);
  if (!input.label) return { error: "Enter an item." };
  await addChecklistItem(input);
  revalidate();
  return { ok: true };
}

export async function updateChecklistAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  await requireSession();
  const id = Number(fd.get("id"));
  const input = parse(fd);
  if (!id) return { error: "Missing item id." };
  if (!input.label) return { error: "Enter an item." };
  await updateChecklistItem(id, input);
  revalidate();
  return { ok: true };
}

export async function deleteChecklistAction(fd: FormData): Promise<void> {
  await requireSession();
  const id = Number(fd.get("id"));
  if (id) await deleteChecklistItem(id);
  revalidate();
}

export async function setCheckedAction(
  id: number,
  checked: boolean
): Promise<void> {
  await requireSession();
  await setChecklistChecked(id, checked);
  revalidate();
}
