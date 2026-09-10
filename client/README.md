# EventFlow — Frontend

React + Vite frontend for the EventFlow event planning and management system.

## Overview

The frontend provides a unified dashboard for event organizers, staff, and guests to manage venues, vendors, guest lists, tasks, schedules, and feedback — all from a single interface.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| lucide-react | Icon library |
| localStorage | Client-side data persistence |

## Project Structure

```
client/
├── public/
│   └── eventflow-mark.svg
├── src/
│   ├── components/          # Sidebar, Topbar, EventCard, MetricCard, ProgressCard, ActivityCard, BuildingIcon
│   ├── pages/               # LandingPage, GetStarted, AuthPages, Dashboard, EventsPage, AdminDashboard, NotFound
│   ├── data/                # eventStore.js, demoSession.js
│   ├── modal/               # CreateEventModal
│   ├── routes/              # AppRoutes.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── package.json
└── package-lock.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

The app runs on `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |

## Pages

- **LandingPage** — Marketing homepage with feature showcase and live workspace preview
- **GetStarted** — Onboarding page with workflow overview and team role introduction
- **AuthPages** — Sign In and Create Account with role-based access selection
- **Dashboard** — Organizer dashboard with metrics, event cards, activity feed, and planning progress
- **EventsPage** — Browse and create events
- **AdminDashboard** — Platform-wide admin control with audit table and system metrics
- **NotFound** — 404 error page

## Components

| Component | Description |
|---|---|
| `Sidebar` | Navigation sidebar with role-based menu items |
| `Topbar` | Header with search, notifications, and profile menu |
| `EventCard` | Card displaying event details, status, and progress |
| `MetricCard` | Reusable metric display widget |
| `ProgressCard` | Planning progress tracker |
| `ActivityCard` | Recent activity feed |
| `BuildingIcon` | Custom SVG building icon |
| `CreateEventModal` | Modal form for creating new events |

## Data Layer

- **`data/eventStore.js`** — Manages events in `localStorage` with `getEvents()`, `createEvent()`, and `formatEventDate()`
- **`data/demoSession.js`** — Manages demo user sessions in `localStorage` with four roles: Organizer, Staff, Guest, Admin

## License

MIT — see [../LICENSE](../LICENSE).
