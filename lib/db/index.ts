import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Lazy, cached database client. Built only when first used so that `next build`
 * (and any page that never touches the DB) works without a connection string.
 * Vercel Postgres / Neon exposes DATABASE_URL (and POSTGRES_URL).
 */
function connectionString(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "No database configured. Set DATABASE_URL (Vercel Postgres / Neon) — see README."
    );
  }
  return url;
}

// Cache across hot reloads / serverless invocations to avoid exhausting connections.
const globalForDb = globalThis as unknown as {
  __pool?: Pool;
  __db?: NodePgDatabase<typeof schema>;
};

export function getDb(): NodePgDatabase<typeof schema> {
  if (!globalForDb.__db) {
    const url = connectionString();
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    const pool =
      globalForDb.__pool ??
      new Pool({
        connectionString: url,
        max: 5,
        // Verify the server certificate (Neon/Vercel present valid certs);
        // a local Postgres has none, so skip SSL there.
        ssl: local ? false : { rejectUnauthorized: true },
      });
    globalForDb.__pool = pool;
    globalForDb.__db = drizzle(pool, { schema });
  }
  return globalForDb.__db;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

export { schema };
