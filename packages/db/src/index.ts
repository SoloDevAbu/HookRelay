import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL!;

// Neon URLs contain "neon.tech" — use neon-http driver
// Standard postgres URLs use node-postgres driver
const isNeon = DATABASE_URL.includes("neon.tech");

const db = isNeon
  ? drizzleNeon({
      client: neon(DATABASE_URL),
      schema,
    })
  : drizzleNode({
      client: new Pool({
        connectionString: DATABASE_URL,
        max: 50,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
      }),
      schema,
    });

export { db };
export * from "./queries";
export * from "./schema";
