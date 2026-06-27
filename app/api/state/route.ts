import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

// Always run on-demand (never statically cached) — this is user state.
export const dynamic = "force-dynamic";

const CODE_RE = /^[A-Za-z0-9_-]{4,64}$/;
const TTL_SECONDS = 60 * 60 * 24 * 120; // keep a synced trip for ~120 days

function keyFor(code: string) {
  return `trip:${code}`;
}

/** GET /api/state?code=XYZ → { configured, state } */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json({ configured: false, state: null });
  }
  if (code && !CODE_RE.test(code)) {
    return NextResponse.json({ error: "invalid code" }, { status: 400 });
  }

  const state = code ? await redis.get(keyFor(code)) : null;
  return NextResponse.json({ configured: true, state: state ?? null });
}

/** PUT /api/state?code=XYZ  body: { state } → { configured, ok } */
export async function PUT(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code || !CODE_RE.test(code)) {
    return NextResponse.json({ error: "invalid code" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const state = (body as { state?: unknown })?.state;
  if (typeof state !== "object" || state === null) {
    return NextResponse.json({ error: "invalid state" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    // No DB on this deployment — tell the client to stay local-only.
    return NextResponse.json({ configured: false, ok: false });
  }

  await redis.set(keyFor(code), state, { ex: TTL_SECONDS });
  return NextResponse.json({ configured: true, ok: true });
}
