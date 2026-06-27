"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword, setSession } from "@/lib/auth";

export type LoginResult = {
  error?: string;
  /** The username exists but has no password yet → show the set-password screen. */
  claim?: boolean;
  username?: string;
};

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
const MIN_PASSWORD = 8;

function safeRedirect(from: FormDataEntryValue | null): string {
  const f = String(from ?? "");
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

  let user;
  try {
    const db = getDb();
    [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
  } catch {
    return { error: "Can't reach the database. Is it set up? (see README)" };
  }

  // Don't reveal whether the username exists.
  if (!user) return { error: "Incorrect username or password." };

  // Unclaimed account → route to the set-password screen (gated by a code there).
  if (!user.passwordHash) return { claim: true, username: user.username };

  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    const mins = Math.ceil(
      (new Date(user.lockedUntil).getTime() - Date.now()) / 60000
    );
    return { error: `Too many attempts — try again in ${mins} min.` };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    const fails = (user.failedAttempts ?? 0) + 1;
    const lock = fails >= MAX_FAILS;
    await getDb()
      .update(users)
      .set({
        failedAttempts: lock ? 0 : fails,
        lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60000) : null,
      })
      .where(eq(users.id, user.id));
    return {
      error: lock
        ? `Too many attempts — locked for ${LOCK_MINUTES} min.`
        : "Incorrect username or password.",
    };
  }

  await getDb()
    .update(users)
    .set({ failedAttempts: 0, lockedUntil: null })
    .where(eq(users.id, user.id));
  await setSession({ uid: user.id, username: user.username, name: user.name });
  redirect(safeRedirect(fd.get("from")));
}

export async function claimAction(
  _prev: LoginResult,
  fd: FormData
): Promise<LoginResult> {
  const username = String(fd.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const code = String(fd.get("code") ?? "");

  const required = process.env.CLAIM_CODE;
  const back = (error: string): LoginResult => ({ claim: true, username, error });

  if (!required) {
    return back("Account setup is disabled. Ask the trip admin to set CLAIM_CODE.");
  }
  if (code !== required) return back("Incorrect setup code.");
  if (password.length < MIN_PASSWORD) {
    return back(`Use at least ${MIN_PASSWORD} characters.`);
  }
  if (password !== confirm) return back("Those passwords don't match.");

  let user;
  try {
    const db = getDb();
    [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
  } catch {
    return back("Can't reach the database.");
  }
  if (!user) return { error: "Incorrect username or password." };
  if (user.passwordHash) {
    return { error: "That account is already set up — just log in." };
  }

  await getDb()
    .update(users)
    .set({
      passwordHash: await hashPassword(password),
      failedAttempts: 0,
      lockedUntil: null,
    })
    .where(eq(users.id, user.id));
  await setSession({ uid: user.id, username: user.username, name: user.name });
  redirect("/");
}
