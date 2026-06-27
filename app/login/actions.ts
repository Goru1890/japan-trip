"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword, setSession } from "@/lib/auth";

export type LoginResult = { error?: string };

function safeRedirect(from: FormDataEntryValue | null): string {
  const f = String(from ?? "");
  // only allow internal paths, never loop back to /login
  if (f.startsWith("/") && !f.startsWith("//") && f !== "/login") return f;
  return "/";
}

export async function loginAction(
  _prev: LoginResult,
  fd: FormData
): Promise<LoginResult> {
  const username = String(fd.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (!username || !password) {
    return { error: "Enter your username and password." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  let user;
  try {
    const db = getDb();
    [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
  } catch {
    return {
      error: "Can't reach the database. Is it set up & seeded? (see README)",
    };
  }

  if (!user) {
    return { error: "Unknown user — try “joaquin” or “rosalie”." };
  }

  if (!user.passwordHash) {
    // First login: claim the account by setting this password.
    await getDb()
      .update(users)
      .set({ passwordHash: await hashPassword(password) })
      .where(eq(users.id, user.id));
  } else if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect password." };
  }

  await setSession({ uid: user.id, username: user.username, name: user.name });
  redirect(safeRedirect(fd.get("from")));
}
