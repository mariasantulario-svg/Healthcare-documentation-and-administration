import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

const dbPath = process.env.DATABASE_URL?.replace("sqlite://", "") || "./local.db";

export const sqlite = new Database(dbPath);

// Ensure table exists on startup (e.g. on Render when db:push is not in build)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    context TEXT NOT NULL,
    spanish TEXT NOT NULL,
    unit_number INTEGER NOT NULL,
    unit_title TEXT NOT NULL,
    category TEXT NOT NULL,
    course TEXT NOT NULL,
    image_url TEXT
  )
`);

export const db = drizzle(sqlite, { schema });