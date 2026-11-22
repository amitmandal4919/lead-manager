// SQLite connection. The database file and the leads table are created automatically.
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SOURCES, STATUSES } from "./constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../..");

// DB_PATH can be relative (to the backend folder) or absolute.
export const dbPath = process.env.DB_PATH
  ? path.resolve(backendRoot, process.env.DB_PATH)
  : path.join(backendRoot, "data", "leads.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const quoted = (list) => list.map((item) => `'${item}'`).join(", ");

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT NOT NULL,
    company    TEXT NOT NULL,
    source     TEXT NOT NULL CHECK (source IN (${quoted(SOURCES)})),
    status     TEXT NOT NULL DEFAULT 'New' CHECK (status IN (${quoted(STATUSES)})),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
  CREATE INDEX IF NOT EXISTS idx_leads_name ON leads (name);
`);

export default db;
