// One-off schema migration: adds the "source" column to nodes and models.
// Safe to run more than once. Usage: bun scripts/migrate.ts
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
console.log(`Migrating ${new URL(process.env.DATABASE_URL!).host}`);
await sql`ALTER TABLE nodes ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'user'`;
await sql`ALTER TABLE models ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'user'`;
console.log("Done");
