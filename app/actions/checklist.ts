"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import {
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  setChecklistChecked,
  addSection,
  renameSection,
  deleteSection,
  moveSection,
  type ChecklistInput,
} from "@/lib/db/queries";
import type { FormResult } from "./activities";

function message(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong.";
}

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

// ---- sections ----

export async function addSectionAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  await requireSession();
  const kind = String(fd.get("kind") ?? "packing");
  const title = String(fd.get("title") ?? "").trim();
  try {
    await addSection(kind, title);
  } catch (e) {
    return { error: message(e) };
  }
  revalidate();
  return { ok: true };
}

export async function renameSectionAction(
  _prev: FormResult,
  fd: FormData
): Promise<FormResult> {
  await requireSession();
  const id = Number(fd.get("id"));
  const title = String(fd.get("title") ?? "").trim();
  if (!id) return { error: "Missing section id." };
  try {
    await renameSection(id, title);
  } catch (e) {
    return { error: message(e) };
  }
  revalidate();
  return { ok: true };
}

export async function deleteSectionAction(fd: FormData): Promise<void> {
  await requireSession();
  const id = Number(fd.get("id"));
  if (id) await deleteSection(id);
  revalidate();
}

export async function moveSectionAction(fd: FormData): Promise<void> {
  await requireSession();
  const id = Number(fd.get("id"));
  const dir = String(fd.get("dir")) === "up" ? "up" : "down";
  if (id) await moveSection(id, dir);
  revalidate();
}
