import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DATA_DIR = process.env.QROVIA_DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "qrovia.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

declare global {
  // eslint-disable-next-line no-var
  var __qroviaDb: ReturnType<typeof createDb> | undefined;
}

function createDb() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  migrateRaw(sqlite);
  const db = drizzle(sqlite, { schema });
  return db;
}

function migrateRaw(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      created_at INTEGER NOT NULL
    );
  `);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('dynamic','static')),
      code TEXT NOT NULL UNIQUE,
      target_url TEXT,
      static_payload TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused')),
      created_at INTEGER NOT NULL
    );
  `);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      scanned_at INTEGER NOT NULL,
      user_agent_raw TEXT NOT NULL DEFAULT '',
      device TEXT,
      os TEXT,
      browser TEXT,
      referer_host TEXT
    );
  `);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS campaigns_user_ix ON campaigns(user_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS campaigns_code_ix ON campaigns(code);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS scans_campaign_ix ON scans(campaign_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS scans_time_ix ON scans(scanned_at);`);
}

export function getDb() {
  if (!globalThis.__qroviaDb) {
    globalThis.__qroviaDb = createDb();
  }
  return globalThis.__qroviaDb;
}

export { schema };
