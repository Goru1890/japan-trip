import { SignJWT, jwtVerify } from "jose";

// Edge-safe: only jose + env. Importable from middleware (no node APIs here).

export interface SessionPayload {
  uid: number;
  username: string;
  name: string;
}

export const SESSION_COOKIE = "japan_trip_session";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set — see README.");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      typeof payload.uid === "number" &&
      typeof payload.username === "string" &&
      typeof payload.name === "string"
    ) {
      return {
        uid: payload.uid,
        username: payload.username,
        name: payload.name,
      };
    }
    return null;
  } catch {
    // bad/expired token, or AUTH_SECRET missing → treat as logged out
    return null;
  }
}
