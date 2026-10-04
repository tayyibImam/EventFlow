<div align="center">

# EventFlow

**A Smart Event Planning & Management System**

Plan, coordinate, and track an event from start to finish — venues, vendors, guests, tasks, and schedules, all from a single dashboard.

[![React](https://img.shields.io/badge/Frontend-React.js-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0%2B-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Figma](https://img.shields.io/badge/Design-Figma-F24E1E?logo=figma&logoColor=white)](https://www.figma.com/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](#license)

</div>

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Team](#team)
- [License](#license)

---

## Overview

**EventFlow** is a web-based event planning and management platform that lets organizers plan, coordinate, and track an event from start to finish — all from a single dashboard. Instead of juggling spreadsheets and group chats, an organizer books a venue, lines up vendors, invites guests, assigns tasks to staff, and builds an event-day agenda — with everything tied back to one central event record.

## The Problem

Event organizers typically rely on a mix of spreadsheets, chat apps, and paper notes to manage venues, vendors, guest lists, and tasks. This creates three recurring problems:

| Problem | Description |
|---|---|
| **Scattered tools** | Information is fragmented across platforms — nothing lives in one place. |
| **Time-consuming coordination** | Manually cross-checking schedules, RSVPs, and vendor availability is slow and error-prone. |
| **Poor visibility** | No single, real-time view of an event's status — who's confirmed, what's pending, what's left to do. |

EventFlow solves this by bringing venues, vendors, guests, tasks, and schedules into one connected system, giving organizers a single source of truth.

## Key Features

- **Event Creation & Management** — Create events with a title, category, venue, date range, budget, and live status (`planned`, `ongoing`, `completed`, `cancelled`).
- **Venue & Vendor Booking** — Browse venues by capacity and price; assign vendors (catering, décor, photography, etc.) to an event with an agreed price and booking status.
- **Guest & RSVP Management** — Invite guests and track each response — `invited`, `accepted`, `declined`, or `no_response` — per event.
- **Task Management** — Create planning tasks, assign them to staff, set due dates, and track status (`pending`, `in_progress`, `done`).
- **Event Schedule / Agenda** — Build a simple timeline of event-day activities with start/end times and notes per segment.
- **Guest Feedback** — After the event, guests can rate their experience (1–5) and leave a comment.
- **Email Invites** — Guests get a branded HTML invite email (event name, date, time, venue, and a direct RSVP link); without real SMTP credentials configured it still "sends" via a console-logged preview link.
- **Venue & Vendor Payments** — Venue bookings and vendor hires both take a 10% confirmation deposit up front through SSLCommerz (sandbox-ready, no real money needed for local dev), with the remaining 90% settled after the event.
- **Post-Event Settlement** — The outstanding 90% on each venue/vendor lands on the organizer's **Payments** tab when the event ends and is due within 3 days; past that it's automatically flagged on the admin dashboard and emailed to the admins.
- **Staff Task Feedback** — Staff can leave a progress or completion note on their own tasks; organizers review every note on a dedicated tab and mark it read.
- **Request-Based Event Cancellation** — Organizers can't cancel their own events. They file a request with a reason, and an event is only ever marked cancelled once an admin approves it from the **Cancellations** queue (both sides get emailed).

## User Roles

| Role | Scope |
|---|---|
| **Admin** | Oversees the platform: manages event categories and has visibility across all events and users. |
| **Organizer** | Creates and manages their own events — books venues/vendors, invites guests, assigns tasks. |
| **Staff** | Assigned tasks by an organizer; updates task status as planning work gets done. |
| **Guest** | Receives invitations, responds with an RSVP, and can leave feedback after the event. |

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, HTML5, CSS3, Tailwind CSS |
| **Backend** | Node.js with Express.js (REST API) |
| **Database** | MySQL 8.0+ — 17-table, 3NF relational schema |
| **UI / UX Design** | Figma — wireframes, UI kit, high-fidelity prototypes |
| **Version Control** | GitHub — repository, branches, pull requests, project board |
| **Deployment** | Vercel (frontend + CI/CD) |

## Database Schema

The system is built around a relational MySQL schema of **17 tables and 27 foreign keys**, with `events` at the centre — every other table connects back to it, either directly (1:M) or through a junction table (M:N).

| Document | What's in it |
|---|---|
| **[`docs/erd/EventFlow_ERD.md`](docs/erd/EventFlow_ERD.md)** | The full entity-relationship diagram (renders inline on GitHub), plus design notes |
| **[`docs/erd/EventFlow_ERD.mmd`](docs/erd/EventFlow_ERD.mmd)** | Mermaid source for the same diagram — paste into [mermaid.live](https://mermaid.live) to export a PNG/SVG for a report |
| **[`docs/schema/EventFlow_Schema.md`](docs/schema/EventFlow_Schema.md)** | Column-level reference: every type, default, key, index and `ON DELETE` rule |
| [`server/sql/schema.sql`](server/sql/schema.sql) | The source of truth — the file you actually run |

Both documents are generated from a live introspection of the database, so they match `schema.sql` exactly.

<details>
<summary><strong>Table groups at a glance</strong></summary>

| Group | Tables |
|---|---|
| **Reference & identity** | `users`, `venues`, `vendors`, `categories`, `guests` |
| **Core record** | `events` |
| **Event dependents & junctions** | `event_guests`, `event_vendors`, `tasks`, `task_feedback`, `event_schedule`, `feedback` |
| **Payment ledgers & workflow** | `venue_bookings`, `vendor_bookings`, `balance_payments`, `event_creation_fees`, `event_cancellation_requests` |

Key design points: guests are deliberately **not** users (they act only through a random per-invite RSVP token); the two M:N pairs are `events`↔`guests` via `event_guests` and `events`↔`vendors` via `event_vendors`; and all four payment ledgers share one SSLCommerz transaction shape.

</details>

> The original hand-drawn diagram — [`docs/erd/EventFlow_ERD.png`](docs/erd/EventFlow_ERD.png) and
> [`docs/schema/EventFlow_Database_Schema_Design.docx`](docs/schema/EventFlow_Database_Schema_Design.docx) —
> captures the initial 11-table design and is kept for reference; the generated documents above are current.

## Project Structure

The actual layout is a little different from a typical Vite scaffold — most of the frontend app code sits *next to* `client/src/`, not inside it (a side effect of this project starting from a Google AI Studio template; see [`client/README.md`](client/README.md) for the full note):

```
eventflow/
├── client/                   # React frontend (Vite)
│   ├── src/                   # just the entry point: main.tsx, App.tsx, index.css
│   ├── context/                # EventFlowContext.jsx — the single global store (auth + all domains)
│   ├── routes/                  # AppRoutes.jsx + route guards (RequireAdmin, RequireRoleOrDemo)
│   ├── layout/                   # DashboardLayout/AdminLayout/StaffLayout/GuestLayout
│   ├── page/                      # one file per screen (Dashboard, Events, Tasks, AdminUsers, ...)
│   ├── component/                  # shared UI pieces (Sidebar, Header, Modal, TaskCard, ...)
│   ├── data/                        # mockData.js — fallback data for domains with no backend-only history
│   └── package.json
├── server/                   # Express backend (CommonJS)
│   ├── server.js               # entry point — wires middleware + mounts every /api/* route
│   ├── src/
│   │   ├── routes/               # one *.routes.js per resource
│   │   ├── controllers/          # one *.controller.js per resource — raw parameterized SQL, no ORM
│   │   ├── services/             # sslcommerz.service.js
│   │   ├── middleware/           # auth.middleware.js (verifyToken)
│   │   ├── utils/                # emailTemplates.js — shared branded HTML email layout
│   │   └── config/               # db.js (mysql2 pool), mailer.js (Nodemailer)
│   ├── sql/                    # schema.sql, seed.sql
│   └── package.json
├── docs/
│   ├── erd/                  # ERD: EventFlow_ERD.md (rendered) + .mmd (source)
│   └── schema/                # column-level schema reference
├── package.json              # root dev convenience — runs client + server together, not a workspace
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (v20 LTS recommended)
- [MySQL](https://www.mysql.com/) 8.0+ Server, running locally (or reachable), with the `mysql` command-line client available
- npm (ships with Node — `client/` and `server/` are independent packages with their own lockfiles, not an npm workspace, so each gets installed separately; `npm run install:all` below does this for you)
- Optional, only if you want to test them: an SMTP account (e.g. Gmail) for real invite emails, and a free [SSLCommerz sandbox account](https://developer.sslcommerz.com/registration/) for the venue/vendor payment flow — both are skippable and the app still runs fully without them (see [Environment Variables](#environment-variables))

### 1. Clone and install dependencies

```bash
git clone https://github.com/tayyibImam/EventFlow.git
cd EventFlow

npm install          # installs the root dev dependency (concurrently)
npm run install:all  # installs client/ and server/ dependencies
```

### 2. Create the MySQL database

Make sure your MySQL server is running, then create the `eventflow` database and load the schema. Pick the block for your shell:

**macOS / Linux / Git Bash on Windows:**

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS eventflow;"
mysql -u root -p eventflow < server/sql/schema.sql
mysql -u root -p eventflow < server/sql/seed.sql
```

**Windows PowerShell:**

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS eventflow;"
Get-Content server\sql\schema.sql | mysql -u root -p eventflow
Get-Content server\sql\seed.sql | mysql -u root -p eventflow
```

> PowerShell doesn't support `<` for input redirection (it's a reserved operator there) — use `Get-Content file | mysql ...` as shown, or run the macOS/Linux commands above from Git Bash instead.

Each `mysql` call prompts for your MySQL root password interactively. If `mysql` isn't recognized as a command, either add MySQL's `bin` folder to your PATH (on Windows, typically `C:\Program Files\MySQL\MySQL Server 8.0\bin`) and restart your terminal, or call the full path to `mysql.exe`/`mysql` instead.

`schema.sql` creates all 17 tables. `seed.sql` truncates them first (safe on a freshly-created database) and inserts a small set of demo data — 3 user accounts, 2 categories, a venue, a vendor, 2 guests, 1 event, and 1 task — so the app has something to show immediately and so you can log in right away (see [step 5](#5-log-in) below). You can skip the `seed.sql` step if you'd rather start from a completely empty database.

### 3. Configure the server's environment variables

```bash
cd server
cp .env.example .env
```

(Windows PowerShell: `Copy-Item .env.example .env`)

Open `server/.env` and fill in at least `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` to match what you used in step 2, then add a `JWT_SECRET` — see [Environment Variables](#environment-variables) for the full list and what's actually required.

### 4. Run it

```bash
# from the repo root — starts client (Vite) and server (Express) together
npm run dev
```

Wait for both the server's `Server running on port 5000` line and Vite's "ready" message in the terminal (prefixed `client` / `server`), then open **http://localhost:3000**. To run them separately instead: `npm run dev` inside `server/`, and `npm run dev` inside `client/`.

### 5. Log in

If you ran `seed.sql` in step 2, three accounts are ready to use — **the password for all three is `password123`**:

| Role | Email | Password | Sign in at |
|---|---|---|---|
| Admin | `admin@eventflow.com` | `password123` | http://localhost:3000/admin/login |
| Organizer | `organizer@eventflow.com` | `password123` | http://localhost:3000/signin |
| Staff | `staff@eventflow.com` | `password123` | http://localhost:3000/signin |

A few things worth knowing:

- Only `events` and `auth` (login/register) are backed by the real MySQL database end-to-end; every other section (venues, vendors, guests, tasks, schedule, feedback) falls back to local browser demo data if the API can't be reached — so the app still renders and feels "working" even if MySQL isn't actually running, just without real persistence. Check the `server` terminal output if something seems off.
- No login required to look around: the landing page's role switcher (demo/perspective mode) lets you preview the Organizer, Admin, Staff, and Guest views without any account at all.
- Public sign-up (the "Sign Up" form, `POST /api/auth/register`) always creates an `organizer` (or `staff`, if selected) account — it can never create an `admin` account. Admin/staff accounts only come from `seed.sql` or by inserting a row into `users` directly.

## Environment Variables

### Server — `server/.env`

Copied from `server/.env.example` in step 3 above. **Never commit this file.**

| Variable | Required? | Notes |
|---|---|---|
| `PORT` | Optional | Defaults to `5000`. |
| `DB_HOST` | **Required** | e.g. `localhost`. |
| `DB_USER` | **Required** | e.g. `root`. |
| `DB_PASSWORD` | **Required** | Your local MySQL password (an empty value is fine if your local root account has no password). |
| `DB_NAME` | **Required** | `eventflow`, or whatever you named it in [step 2](#2-create-the-mysql-database). |
| `JWT_SECRET` | **Required** | Deliberately **not** in `.env.example` — add it yourself (see below). Without it, login, sign-up, and admin login all fail with a server error. |
| `CLIENT_URL` | Optional | Defaults to `http://localhost:3000`. Used to build the `/rsvp/:token` link emailed to guests. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional | Leave unset and guest invite emails still "send" via a throwaway Ethereal test inbox — the server console prints a preview link for each one. Set real credentials (e.g. Gmail SMTP on port 587 with an [App Password](https://support.google.com/accounts/answer/185833) as `SMTP_PASS`) to deliver actual email. |
| `SSLCZ_STORE_ID`, `SSLCZ_STORE_PASSWORD` | Optional | Only needed to actually complete the venue-deposit / vendor-hire payment flow. Get free sandbox credentials at [developer.sslcommerz.com](https://developer.sslcommerz.com/registration/). Without them, everything else in the app still works — only "Pay & Book" actions are affected. |
| `SSLCZ_IS_LIVE` | Optional | Defaults to `false` (sandbox mode). |
| `SERVER_URL` | Optional | Defaults to `http://localhost:5000`. Must be reachable by the browser for SSLCommerz's success/fail/cancel redirects — `localhost` is fine for local dev. |

**Generating a `JWT_SECRET`:** any random string works for local dev —

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output into `server/.env` as `JWT_SECRET=<the generated value>`.

### Client — `client/.env` (optional)

Only needed if your backend isn't running at the default `http://localhost:5000` — the app already falls back to that if this isn't set:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Available Scripts

| Location | Command | Description |
|---|---|---|
| `/` (root) | `npm install` | Install the root dev dependency (`concurrently`) |
| `/` (root) | `npm run install:all` | Install both `client/` and `server/` dependencies in one go |
| `/` (root) | `npm run dev` | Run the client and server dev servers together |
| `/client` | `npm run dev` | Run the React app in development mode (Vite, pinned to port 3000) |
| `/client` | `npm run build` | Build the frontend for production |
| `/client` | `npm run lint` | Type-checks the frontend (`tsc --noEmit`) — there's no ESLint configured, despite the name |
| `/server` | `npm run dev` | Run the Express API with hot reload (nodemon, port 5000 by default) |
| `/server` | `npm start` | Run the Express API without hot reload |
| `/server` | `npm test` | Unimplemented stub — exits immediately; there's no automated test suite yet |

## Troubleshooting

- **`Error: connect ECONNREFUSED` / `ER_ACCESS_DENIED_ERROR` in the server terminal, or events never load** — MySQL isn't running, or `DB_HOST`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` in `server/.env` don't match your local setup. Confirm the database exists with `mysql -u root -p -e "SHOW DATABASES;"`.
- **Login, sign-up, or admin login returns a server error** — `JWT_SECRET` is missing from `server/.env`; see [Environment Variables](#environment-variables).
- **`'mysql' is not recognized as an internal or external command...`** — MySQL's `bin` folder isn't on your PATH. Add it (Windows default: `C:\Program Files\MySQL\MySQL Server 8.0\bin`) and restart your terminal, or call `mysql.exe` by its full path.
- **The app loads and looks fine, but nothing you add seems to persist on refresh** — expected for everything except events/auth (see [step 5](#5-log-in)); the client is silently using local demo data because it can't reach the API. Check the `server` terminal for the actual error.
- **Guest invite emails never arrive** — expected without real `SMTP_*` credentials; check the server console for an Ethereal preview link instead, or set up real SMTP credentials (see [Environment Variables](#environment-variables)).
- **Port 3000 or 5000 already in use** — stop whatever else is using it, or start the client/server dev servers separately (each with its own `npm run dev`) and adjust ports as needed.

## Deployment

- **Frontend** — deployed to [Vercel](https://vercel.com/), connected directly to this GitHub repository for automatic builds on every push to `main`.
- **Backend & Database** — the Express API and MySQL database are hosted on a Vercel-compatible / serverless-friendly provider; the frontend's API client points at the live URL via `VITE_API_BASE_URL`.

## Roadmap

Not in the current scope, but possible future extensions:

- [ ] Ticketing
- [ ] Vendor reviews/ratings (separate from event feedback)
- [ ] Notifications/reminders
- [ ] Guest waitlist handling

## Team

**Team — Hold My Query**

| Name | ID |
|---|---|
| Tayyib Imam Asif | 0112430104 |
| Meyadur Rahman | 0112430460 |
| Mirza Tafhim Osman | 0112430103 |
| Ishtiaq Ahmed | 0112430164 |

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**[@holdmyquery](https://github.com/holdmyquery)**

</div>
