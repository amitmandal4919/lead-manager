// Automated API test. Run with:  npm test
// It starts the real Express app on a random port with a TEMPORARY database,
// so your real data in data/leads.db is never touched.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "lead-manager-test-"));
const testDbPath = path.join(tmpDir, "test.db");
process.env.DB_PATH = testDbPath; // must be set BEFORE the app (and database) is imported

const { createApp } = await import("../src/app.js");
const { default: appDb } = await import("../src/config/db.js");

let server;
let baseUrl;

before(
  () =>
    new Promise((resolve) => {
      server = createApp().listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    })
);

after(
  () =>
    new Promise((resolve) => {
      server.close(() => {
        appDb.close();
        fs.rmSync(tmpDir, { recursive: true, force: true });
        resolve();
      });
    })
);

async function api(method, url, body, rawBody) {
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: rawBody !== undefined ? rawBody : body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json() };
}

const validLead = {
  name: "Aditi Sharma",
  email: "Aditi@Example.com",
  phone: "+91 98765 43210",
  company: "Acme Solutions",
  source: "LinkedIn",
  status: "New",
};

let createdId;

test("health check works", async () => {
  const res = await api("GET", "/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test("dashboard stats are all zero on an empty database", async () => {
  const res = await api("GET", "/api/dashboard/stats");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.data, { total: 0, new: 0, contacted: 0, qualified: 0, lost: 0 });
});

test("ADD a lead -> 201 and saved data is cleaned (email lower-cased)", async () => {
  const res = await api("POST", "/api/leads", validLead);
  assert.equal(res.status, 201);
  assert.equal(res.body.data.email, "aditi@example.com");
  assert.equal(res.body.data.status, "New");
  assert.ok(res.body.data.created_at);
  assert.ok(res.body.data.updated_at);
  createdId = res.body.data.id;
  assert.ok(Number.isInteger(createdId));
});

test("status defaults to New when it is not sent on create", async () => {
  const { status, ...withoutStatus } = validLead;
  const res = await api("POST", "/api/leads", { ...withoutStatus, name: "Default Status", email: "d@example.com" });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.status, "New");
});

test("INVALID email is rejected with a clear message", async () => {
  for (const email of ["not-an-email", "a@b", "a b@c.com", "@example.com"]) {
    const res = await api("POST", "/api/leads", { ...validLead, email });
    assert.equal(res.status, 400, `email "${email}" should be rejected`);
    assert.match(res.body.errors.email, /valid email/i);
  }
});

test("MISSING required fields are rejected (empty body)", async () => {
  const res = await api("POST", "/api/leads", {});
  assert.equal(res.status, 400);
  for (const field of ["name", "email", "phone", "company", "source"]) {
    assert.ok(res.body.errors[field], `${field} should have an error`);
  }
});

test("blank / whitespace-only values are rejected", async () => {
  const res = await api("POST", "/api/leads", { ...validLead, name: "   ", company: "" });
  assert.equal(res.status, 400);
  assert.ok(res.body.errors.name);
  assert.ok(res.body.errors.company);
});

test("INVALID phone, source and status are rejected", async () => {
  for (const phone of ["abc", "12345", "98765-abc-43", "1".repeat(20)]) {
    const res = await api("POST", "/api/leads", { ...validLead, phone });
    assert.equal(res.status, 400, `phone "${phone}" should be rejected`);
    assert.ok(res.body.errors.phone);
  }
  const badSource = await api("POST", "/api/leads", { ...validLead, source: "Newspaper" });
  assert.equal(badSource.status, 400);
  assert.ok(badSource.body.errors.source);
  const badStatus = await api("POST", "/api/leads", { ...validLead, status: "Won" });
  assert.equal(badStatus.status, 400);
  assert.ok(badStatus.body.errors.status);
});

test("VIEW ALL leads returns data + pagination", async () => {
  const res = await api("GET", "/api/leads");
  assert.equal(res.status, 200);
  assert.equal(res.body.data.length, 2);
  assert.equal(res.body.pagination.total, 2);
  assert.equal(res.body.pagination.page, 1);
});

test("GET one lead by id, 404 for unknown id, 400 for invalid id", async () => {
  const found = await api("GET", `/api/leads/${createdId}`);
  assert.equal(found.status, 200);
  assert.equal(found.body.data.name, "Aditi Sharma");

  const missing = await api("GET", "/api/leads/99999");
  assert.equal(missing.status, 404);

  const invalid = await api("GET", "/api/leads/abc");
  assert.equal(invalid.status, 400);
});

test("EDIT a lead and UPDATE its status", async () => {
  const res = await api("PUT", `/api/leads/${createdId}`, {
    ...validLead,
    company: "Acme Global",
    status: "Contacted",
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.company, "Acme Global");
  assert.equal(res.body.data.status, "Contacted");

  const check = await api("GET", `/api/leads/${createdId}`);
  assert.equal(check.body.data.status, "Contacted");
});

test("PUT validates input and returns 404 for unknown id", async () => {
  const invalid = await api("PUT", `/api/leads/${createdId}`, { ...validLead, email: "bad" });
  assert.equal(invalid.status, 400);

  const missingStatus = await api("PUT", `/api/leads/${createdId}`, { ...validLead, status: "" });
  assert.equal(missingStatus.status, 400);
  assert.ok(missingStatus.body.errors.status);

  const unknown = await api("PUT", "/api/leads/99999", validLead);
  assert.equal(unknown.status, 404);
});

test("SEARCH by name (case-insensitive, partial)", async () => {
  const res = await api("GET", "/api/leads?search=aDi");
  assert.equal(res.status, 200);
  assert.equal(res.body.data.length, 1);
  assert.equal(res.body.data[0].name, "Aditi Sharma");

  const none = await api("GET", "/api/leads?search=zzzz");
  assert.equal(none.body.data.length, 0);
});

test("FILTER by status, combined with search; invalid status -> 400", async () => {
  const contacted = await api("GET", "/api/leads?status=Contacted");
  assert.equal(contacted.body.data.length, 1);
  assert.equal(contacted.body.data[0].status, "Contacted");

  const combined = await api("GET", "/api/leads?status=New&search=aditi");
  assert.equal(combined.body.data.length, 0);

  const invalid = await api("GET", "/api/leads?status=Won");
  assert.equal(invalid.status, 400);
});

test("pagination works", async () => {
  const res = await api("GET", "/api/leads?limit=1&page=2");
  assert.equal(res.body.data.length, 1);
  assert.equal(res.body.pagination.totalPages, 2);
});

test("SQL injection attempts are treated as plain text", async () => {
  const search = await api("GET", `/api/leads?search=${encodeURIComponent("' OR 1=1; DROP TABLE leads; --")}`);
  assert.equal(search.status, 200);
  assert.equal(search.body.data.length, 0);

  const percent = await api("GET", `/api/leads?search=${encodeURIComponent("%")}`);
  assert.equal(percent.body.data.length, 0); // "%" is searched literally, not as a wildcard

  const still = await api("GET", "/api/leads");
  assert.equal(still.body.pagination.total, 2); // table is intact
});

test("dashboard stats match the stored leads", async () => {
  const res = await api("GET", "/api/dashboard/stats");
  assert.deepEqual(res.body.data, { total: 2, new: 1, contacted: 1, qualified: 0, lost: 0 });
});

test("DATA PERSISTS in the SQLite file (read through a separate connection)", () => {
  const other = new Database(testDbPath, { readonly: true });
  const rows = other.prepare("SELECT name, status FROM leads ORDER BY id").all();
  other.close();
  assert.equal(rows.length, 2);
  assert.equal(rows[0].name, "Aditi Sharma");
  assert.equal(rows[0].status, "Contacted");
});

test("DELETE a lead, then it is gone (404 on repeat)", async () => {
  const res = await api("DELETE", `/api/leads/${createdId}`);
  assert.equal(res.status, 200);

  const again = await api("DELETE", `/api/leads/${createdId}`);
  assert.equal(again.status, 404);

  const get = await api("GET", `/api/leads/${createdId}`);
  assert.equal(get.status, 404);

  const stats = await api("GET", "/api/dashboard/stats");
  assert.equal(stats.body.data.total, 1);

  const invalid = await api("DELETE", "/api/leads/xyz");
  assert.equal(invalid.status, 400);
});

test("API error handling: broken JSON -> 400, unknown route -> 404", async () => {
  const broken = await api("POST", "/api/leads", undefined, "{ this is not json");
  assert.equal(broken.status, 400);
  assert.match(broken.body.message, /invalid json/i);

  const unknown = await api("GET", "/api/does-not-exist");
  assert.equal(unknown.status, 404);
  assert.equal(unknown.body.success, false);
});
