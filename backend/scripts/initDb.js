// Run with: npm run db:init
// Importing db.js creates the database file and the "leads" table if they do not exist yet.
import "../src/config/env.js";
import db, { dbPath } from "../src/config/db.js";

const columns = db.prepare("PRAGMA table_info(leads)").all().map((column) => column.name);
const { total } = db.prepare("SELECT COUNT(*) AS total FROM leads").get();

console.log("Database ready:", dbPath);
console.log("Table 'leads' columns:", columns.join(", "));
console.log("Leads currently stored:", total);
db.close();
