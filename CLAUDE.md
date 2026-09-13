# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reality check

The root/client READMEs describe a finished MySQL app with full JWT auth. The actual state is partial — trust the code over the docs:

- **Only `events` and `auth` (login/register/me) are wired to the real MySQL backend.** Venues, vendors, guests, tasks, schedule, feedback, users, and categories exist only as mock data (`client/data/mockData.js`) persisted to `localStorage` — there are no server routes for them.
- `client/context/EventFlowContext.jsx` is the seam between the two: it fetches `GET /api/events` on mount and falls back to `initialEvents` mock data if the request fails (e.g. no backend running); `addEvent`/`updateEvent`/`deleteEvent` try the API first and fall back to a local-only mutation on failure. Every other domain (`venues`, `vendors`, `guests`, `tasks`, `schedule`, `feedback`, `categories`, `activities`) is pure `useState` + `localStorage`, no network calls at all.
- No automated tests, lint, or typecheck config beyond `tsc --noEmit` in the client. `npm test` in `server/` is an unimplemented stub.

## Two independent packages — no root tooling

There is no root `package.json`/workspace. `cd` into `client/` or `server/` separately to install and run.

- **Client**: `cd client && npm install && npm run dev` → Vite on port 3000 (README says 5173 — the actual script pins `--port=3000`).
  - `npm run build` — production build
  - `npm run lint` — actually just `tsc --noEmit` (no ESLint configured)
  - Both `bun.lock` and `package-lock.json` exist in `client/`; npm is the documented path.
- **Server**: `cd server && npm install && npm run dev` → nodemon on port 5000 (CommonJS). Requires a running MySQL instance and `server/.env` (gitignored, copy `.env.example` and add `JWT_SECRET`).
  - `npm start` — run without nodemon
  - No real test suite exists.

## Database

- Schema + seed live in `server/sql/`. Load with `mysql -u root -p eventflow < server/sql/schema.sql` (then `seed.sql` — it truncates all tables first).
- 11-table 3NF MySQL schema centered on `events` (see `server/sql/schema.sql` for FKs/enums). `users.role` is `admin | organizer | staff` — there is no `guest` user role; guests are a separate, unauthenticated `guests` table tied to events via `event_guests` (RSVP status).
- `server/src/config/db.js` deliberately sets `timezone: 'Z'` and `dateStrings: true` — DATETIME/TIMESTAMP columns come back as plain UTC strings, never JS `Date` objects. Preserve this when touching queries or consumers.
- Public signup (`POST /api/auth/register`) always creates an `organizer` account; `role` is never accepted from the client. Staff/admin accounts must be provisioned directly in the DB.

## Server architecture (`server/`)

Plain Express, routes → controllers → `mysql2/promise` pool, no ORM/models layer:
- `server.js` wires `cors()`, `express.json()`, mounts `/api/events` and `/api/auth`.
- `src/routes/*.routes.js` → `src/controllers/*.controller.js` → raw parameterized SQL via the shared pool from `src/config/db.js`.
- `src/middleware/auth.middleware.js` (`verifyToken`) checks `Authorization: Bearer <jwt>`, verifies with `JWT_SECRET`, sets `req.user = { user_id, role }`. Currently only applied to `GET /api/auth/me`; the events routes are unauthenticated.
- Adding a new resource means adding all three layers (route, controller, and — if auth is needed — `verifyToken`) yourself; there's no scaffolding to follow beyond the `events`/`auth` pair.

## Client architecture (`client/`)

Bootstrapped from a Google AI Studio / Vite React template (see `client/metadata.json`, the `aistudioMediaPlugin` in `vite.config.ts`, `@google/genai` dependency) and then built out — some of that scaffolding is now vestigial:

- **Actual entry point**: `client/index.html` → `client/src/main.tsx` → `client/src/App.tsx`. `client/src/App.tsx` reaches *outside* `src/` with `../context/EventFlowContext` and `../routes/AppRoutes` — the real app code (context, routes, layouts, pages, components, mock data) lives at `client/context/`, `client/routes/`, `client/layout/`, `client/page/`, `client/component/`, `client/data/`, one level above `src/`. `client/src/` itself only holds `main.tsx`, `App.tsx`, and `index.css`.
- `client/App.jsx` at the repo root of `client/` is a duplicate/dead file — it is not imported by the actual entry chain and is safe to ignore (or ask before deleting).
- Routing is real `react-router-dom` (`BrowserRouter`), defined centrally in `client/routes/AppRoutes.jsx`. Layout routes (`DashboardLayout`, `AdminLayout`, `StaffLayout`, `GuestLayout` in `client/layout/`) wrap role-specific page groups (organizer at `/dashboard`, `/events`, etc.; `/admin/*`; `/staff/*`; `/guest/*`). New pages get both a `page/*.jsx` file and a `<Route>` entry here.
- `client/context/EventFlowContext.jsx` (`EventFlowProvider`/`useEventFlow`) is the single global store for the whole app — auth session, current role/profile, and every domain collection. There is no Redux/Zustand/React Query; everything is context + `useState` + manual `localStorage` sync effects.
- `currentRole` (`organizer | admin | staff | guest`) drives a client-side "perspective switcher" independent of real auth — this predates `loginWithApi`/`registerWithApi` (the real backend-auth path) and both still coexist. Real login maps the DB role (`admin | organizer | staff`) onto this; there is no real "guest" login, only the demo perspective.
- Styling is Tailwind CSS v4 via `@tailwindcss/vite` (not v3 config-file based) plus a `Plus Jakarta Sans` Google Font linked in `index.html`.
- Path alias `@/*` → `client/` root is configured in both `vite.config.ts` and `tsconfig.json`.
