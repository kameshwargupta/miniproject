import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

export * from "./schema";

/**
 * Creates or retrieves a PostgreSQL pool for Drizzle ORM
 */
export function getPostgresPool(connectionString?: string) {
  const url =
    connectionString ||
    process.env.POSTGRES_URL ||
    (process.env.DATABASE_URL?.startsWith("postgres") ? process.env.DATABASE_URL : undefined);

  if (!url) {
    return null;
  }

  const isSsl = url.includes("sslmode=require") || process.env.PGSSL === "true";
  return new Pool({
    connectionString: url,
    ssl: isSsl ? { rejectUnauthorized: false } : undefined,
  });
}

/**
 * Initializes Drizzle ORM with PostgreSQL
 */
export function createPostgresDb(connectionString?: string) {
  const pool = getPostgresPool(connectionString);
  if (!pool) return null;
  return drizzle(pool, { schema });
}
