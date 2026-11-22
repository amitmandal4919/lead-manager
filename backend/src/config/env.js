// Loads backend/.env (if it exists). This file must be imported FIRST in server.js
// so that PORT, DB_PATH etc. are available before the database is opened.
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
