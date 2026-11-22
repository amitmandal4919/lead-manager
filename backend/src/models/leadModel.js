// All SQL lives here. Every query uses "?" placeholders (parameterized) => no SQL injection.
import db from "../config/db.js";

const COLUMNS = "id, name, email, phone, company, source, status, created_at, updated_at";

// Make % and _ typed by the user behave like normal characters in LIKE searches.
const escapeLike = (text) => text.replace(/[\\%_]/g, (char) => `\\${char}`);

export function findAll({ search = "", status = "", page = 1, limit = 10 } = {}) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("name LIKE ? ESCAPE '\\'");
    params.push(`%${escapeLike(search)}%`);
  }
  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM leads${where}`).get(...params);
  const rows = db
    .prepare(`SELECT ${COLUMNS} FROM leads${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, (page - 1) * limit);

  return { rows, total };
}

export function findById(id) {
  return db.prepare(`SELECT ${COLUMNS} FROM leads WHERE id = ?`).get(id) || null;
}

export function create({ name, email, phone, company, source, status }) {
  const info = db
    .prepare("INSERT INTO leads (name, email, phone, company, source, status) VALUES (?, ?, ?, ?, ?, ?)")
    .run(name, email, phone, company, source, status);
  return findById(Number(info.lastInsertRowid));
}

export function update(id, { name, email, phone, company, source, status }) {
  const info = db
    .prepare(
      `UPDATE leads
          SET name = ?, email = ?, phone = ?, company = ?, source = ?, status = ?,
              updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ?`
    )
    .run(name, email, phone, company, source, status, id);
  return info.changes > 0 ? findById(id) : null;
}

export function remove(id) {
  return db.prepare("DELETE FROM leads WHERE id = ?").run(id).changes > 0;
}

export function countByStatus() {
  return db.prepare("SELECT status, COUNT(*) AS count FROM leads GROUP BY status").all();
}
