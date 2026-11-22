import "./src/config/env.js"; // must stay first: loads .env before the DB opens
import { createApp } from "./src/app.js";
import { dbPath } from "./src/config/db.js";

const PORT = Number(process.env.PORT) || 5000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Lead Manager API running at http://localhost:${PORT}`);
  console.log(`SQLite database file: ${dbPath}`);
});
