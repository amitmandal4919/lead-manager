# LeadFlow - Lead Manager

A full-stack Lead Manager (mini CRM) built for the **Meru Technosoft Pvt. Ltd. Full Stack Developer screening assignment**.
Capture leads, track them through a simple pipeline (New -> Contacted -> Qualified / Lost), and see live dashboard counters.

## Features

- **Dashboard** with counters for Total, New, Contacted, Qualified and Lost leads
- **Add lead** form: Full Name, Email, Phone, Company, Source, Status
- **Leads table**: Name, Email, Phone, Company, Source, Status, Created Date, Actions
- **Edit lead** (including changing its status) - saved to the database
- **Delete lead** with a confirmation dialog
- **Search by name** and **filter by status** - results update dynamically (search is debounced)
- **Validation on both frontend and backend**: required fields, valid email, valid phone, clear error messages
- Responsive layout (desktop, tablet, mobile), loading indicators, empty states, success/error notifications
- Data is stored in **SQLite**, so it survives server restarts

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, CSS3, lucide-react (icons) |
| Backend | Node.js, Express.js (REST API) |
| Database | SQLite via `better-sqlite3` |
| Language | JavaScript (ES modules) |

## Project structure

```
lead-manager/
├── backend/
│   ├── server.js                 # starts the server
│   ├── scripts/initDb.js         # creates the DB + table and prints a summary
│   ├── src/
│   │   ├── app.js                # Express app (middleware + routes)
│   │   ├── config/               # db.js (SQLite), env.js, constants.js
│   │   ├── routes/               # leadRoutes.js, dashboardRoutes.js
│   │   ├── controllers/          # request handlers
│   │   ├── models/leadModel.js   # all SQL queries (parameterized)
│   │   ├── validators/           # lead validation rules
│   │   └── middleware/           # validateLead, errorHandler
│   └── tests/api.test.js         # automated API tests
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── components/           # Sidebar, StatsCards, LeadsTable, LeadModal, ...
│       ├── services/api.js       # all API calls
│       ├── utils/                # constants, validation, formatting
│       └── styles/index.css
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org) **18.12 or newer** (LTS recommended) - check with `node -v`
- npm (comes with Node.js)

## Installation and running locally

You need **two terminals** (one for the backend, one for the frontend).

### Terminal 1 - Backend (http://localhost:5000)

```bash
cd backend
npm install
```

Create the config file (optional - the defaults already work):

```bash
# Mac / Linux
cp ../.env.example .env

# Windows (PowerShell or CMD)
copy ..\.env.example .env
```

Create the database and table (also happens automatically on first start):

```bash
npm run db:init
```

Start the API:

```bash
npm run dev
```

Check it: open http://localhost:5000/api/health - you should see `{"success":true,...}`.

### Terminal 2 - Frontend (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. The Vite dev server forwards all `/api` requests to the backend.

### Run the automated tests

With the backend dependencies installed:

```bash
cd backend
npm test
```

The tests start the real API with a temporary database (your real data is never touched) and check adding, listing, editing,
status updates, deleting, search, filters, validation errors, SQL-injection safety, persistence and error handling.

### Production build of the frontend (optional)

```bash
cd frontend
npm run build
```

## API documentation

Base URL: `http://localhost:5000/api`. All responses are JSON with a `success` flag.

| Method | Endpoint | Description | Success code |
|---|---|---|---|
| GET | `/api/leads` | List leads. Query: `search` (name), `status`, `page` (default 1), `limit` (default 10, max 100) | 200 |
| GET | `/api/leads/:id` | Get a single lead | 200 |
| POST | `/api/leads` | Create a lead (`status` defaults to `New`) | 201 |
| PUT | `/api/leads/:id` | Update a lead (all fields required) | 200 |
| DELETE | `/api/leads/:id` | Delete a lead permanently | 200 |
| GET | `/api/dashboard/stats` | Counters: total, new, contacted, qualified, lost | 200 |
| GET | `/api/health` | Health check | 200 |

### Request body (POST / PUT)

```json
{
  "name": "Aditi Sharma",
  "email": "aditi@example.com",
  "phone": "+91 98765 43210",
  "company": "Acme Solutions",
  "source": "LinkedIn",
  "status": "New"
}
```

- `source` must be one of: `Website`, `Referral`, `Social Media`, `LinkedIn`, `Other`
- `status` must be one of: `New`, `Contacted`, `Qualified`, `Lost`

### Example responses

`POST /api/leads` -> `201 Created`

```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": 1, "name": "Aditi Sharma", "email": "aditi@example.com", "phone": "+91 98765 43210",
    "company": "Acme Solutions", "source": "LinkedIn", "status": "New",
    "created_at": "2026-11-22T10:15:30.123Z", "updated_at": "2026-11-22T10:15:30.123Z"
  }
}
```

`GET /api/leads?status=New&search=adi&page=1&limit=10` -> `200 OK`

```json
{
  "success": true,
  "data": [ { "id": 1, "name": "Aditi Sharma", "...": "..." } ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

`GET /api/dashboard/stats` -> `200 OK`

```json
{ "success": true, "data": { "total": 12, "new": 4, "contacted": 3, "qualified": 3, "lost": 2 } }
```

Validation error -> `400 Bad Request`

```json
{
  "success": false,
  "message": "Validation failed. Please correct the highlighted fields.",
  "errors": { "email": "Enter a valid email address", "phone": "Phone number is required" }
}
```

### Status codes used

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation error, invalid id, invalid status filter, or broken JSON |
| 404 | Lead or route not found |
| 413 | Request body too large |
| 500 | Unexpected server error (details are logged on the server, not sent to the client) |

## Database

SQLite database file: `backend/data/leads.db` (created automatically on first start, ignored by Git).

```sql
CREATE TABLE leads (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL,
  company    TEXT NOT NULL,
  source     TEXT NOT NULL CHECK (source IN ('Website','Referral','Social Media','LinkedIn','Other')),
  status     TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','Qualified','Lost')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

- Timestamps are stored in UTC (ISO 8601) and shown in the local format in the UI.
- Every query uses parameterized statements (`?` placeholders), which prevents SQL injection.
- To reset all data, stop the backend and delete the `backend/data` folder.

## Validation rules

| Field | Rule |
|---|---|
| Full Name | required, 2-100 characters |
| Email | required, valid format (e.g. `name@company.com`), stored in lower case |
| Phone | required, only digits, spaces, `+`, `-`, `(`, `)`, with 7-15 digits |
| Company | required, up to 100 characters |
| Source / Status | required, must be one of the allowed values |

The same rules run in the browser (instant feedback) and on the server (the real protection).

## Troubleshooting

- **`npm install` fails while installing `better-sqlite3`** - make sure you use an LTS version of Node.js (20 or 22). If it still tries to compile, install the build tools (Windows: "Desktop development with C++" from Visual Studio Build Tools; Mac: `xcode-select --install`) and run `npm install` again.
- **Port already in use** - change `PORT` in `backend/.env` and the proxy target in `frontend/vite.config.js`.
- **Frontend shows "Cannot reach the server"** - the backend is not running. Start it with `npm run dev` inside `backend`.

## Assumptions and possible improvements

- Single workspace, no login (authentication was not part of the assignment).
- Duplicate emails are allowed.
- Possible next steps: authentication, CSV export, status-change history, sorting by column, deployment.

## Upload to GitHub

```bash
git init
git add .
git status        # check that .env and node_modules are NOT listed
git commit -m "feat: initial Lead Manager project"
git branch -M main
git remote add origin https://github.com/<your-username>/lead-manager.git
git push -u origin main
```

Create the empty repository on github.com first (without README/.gitignore), then use its URL above.

### Suggested commit messages

If you want a clean history, commit in steps instead of one big commit:

1. `chore: add project structure, .gitignore and .env.example`
2. `feat(backend): add Express server and SQLite database setup`
3. `feat(backend): add leads REST API with validation and error handling`
4. `feat(backend): add dashboard stats endpoint`
5. `test(backend): add automated API tests`
6. `feat(frontend): add Vite React app, API service and dashboard layout`
7. `feat(frontend): add leads table, search and status filter`
8. `feat(frontend): add add/edit lead modal with validation`
9. `feat(frontend): add delete confirmation and notifications`
10. `style: make layout responsive for mobile and tablet`
11. `docs: write README with setup and API documentation`
