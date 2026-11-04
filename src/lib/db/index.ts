import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";
import * as schema from "./schema";

// Ensure this file is never executed on the client
if (typeof window !== "undefined") {
  throw new Error("Database module cannot be loaded in client-side code");
}

if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

const connectionString =
  process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

declare global {
  var _dbPool: Pool | undefined;
}

const pool =
  globalThis._dbPool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis._dbPool = pool;
}

export const db = drizzle(pool, { schema });

export function getDirectDb() {
  const directConnectionString = process.env.DATABASE_URL;
  if (!directConnectionString) {
    throw new Error("DATABASE_URL direct connection string is not set");
  }
  const directPool = new Pool({
    connectionString: directConnectionString,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });
  return { db: drizzle(directPool, { schema }), pool: directPool };
}

export type Database = typeof db;
export { schema };
