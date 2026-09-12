# AGENTS.md

## Reality check: README is aspirational

The root/client READMEs describe a full MySQL app with JWT auth and a Vercel deployment, but the code is a prototype. Trust the code:

- The React client is a **static demo** — it never calls the backend API. All data lives in `localStorage` (see `client/src/data/`). Server routes for auth/vendors/guests/etc. do not exist.
- There is **no Tailwind** despite the README: styling is one hand-written `client/src/styles.css` (single long file, minified-style rules). Font Awesome + Plus Jakarta Sans come from CDN links in `client/index.html`.
- **No react-router**: routing is manual `window.location.pathname` checks in `client/src/routes/AppRoutes.jsx`. New pages/routes are added there.
- **No tests, lint, or typecheck anywhere.** `npm test` in `server/` is a stub. Verify by running the app / `npm run build`.

## Two separate packages — no root tooling

No root `package.json` or workspaces. Install and run `client/` and `server/` independently (`cd` into each).

- Client: `npm run dev` → Vite on :5173. ESM.
- Server: `npm run dev` → nodemon on :5000. CommonJS. Needs a running MySQL and `server/.env` (gitignored; copy `.env.example`).

## Database (server)

- Schema + seed live in `server/sql/`. Load with: `mysql -u root -p eventflow < server/sql/schema.sql` (repeat for `seed.sql`; seed truncates all tables first).
- `server/src/config/db.js` deliberately uses `timezone: 'Z'` and `dateStrings: true` — DATETIME/TIMESTAMP come back as UTC strings, never JS `Date` objects. Preserve this.
- Only `/api/events` CRUD is implemented (`server/src/routes/events.routes.js`). `POST /api/events` requires `title`, `organizer_id`, `start_datetime`, `end_datetime`; it returns the inserted row (`201`).

## Client data shape

- `client/src/data/eventStore.js` — events in localStorage key `eventflow-events`; keep the `{ id, title, category, startDate, endDate, location, guests, progress, status, tone }` shape (`createEvent()` defines it).
- `client/src/data/demoSession.js` — demo users by role (Organizer/Staff/Guest/Admin); role switching is wired through the Topbar perspective menu. Guest/Role in the SQL schema is `guest`/`users`, but the demo client is role-agnostic — keep them separate.