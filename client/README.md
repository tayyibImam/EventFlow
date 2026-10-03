# EventFlow — Client

React (Vite) frontend for EventFlow. For how to install, configure, and run the whole project (client + server + MySQL), see the [repo-root README](../README.md).

## Why this doesn't look like a typical Vite app

This package started from a Google AI Studio / Vite React template (see `metadata.json`, the `aistudioMediaPlugin` in `vite.config.ts`, and the `@google/genai` dependency in `package.json`) and was then built out into the real app on top of it. A few consequences of that:

- The actual entry chain is `index.html` → `src/main.tsx` → `src/App.tsx`, but `src/App.tsx` reaches *outside* `src/` — the real app code (global context, routes, layouts, pages, shared components, mock data) lives one level up, in `context/`, `routes/`, `layout/`, `page/`, `component/`, and `data/`, sitting next to `src/` rather than inside it.
- `src/` itself only holds `main.tsx`, `App.tsx`, and `index.css`.
- `App.jsx` at this package's root (`client/App.jsx`) is a leftover duplicate from the original template — it isn't imported by the real entry chain and is safe to ignore.
- The `@google/genai` dependency and `GEMINI_API_KEY`/`APP_URL` variables you may see in a local `.env` are also leftover AI Studio scaffolding — the running app doesn't call the Gemini API anywhere, so neither is required to develop or run EventFlow.

## Scripts

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the Vite dev server on `http://localhost:3000` |
| `npm run build` | Production build |
| `npm run lint` | Type-checks the app (`tsc --noEmit`) — there's no ESLint configured, despite the name |

The app talks to the backend at `http://localhost:5000/api` by default; set `VITE_API_BASE_URL` in a local `.env` here only if your backend runs somewhere else. See the root README's [Environment Variables](../README.md#environment-variables) section for everything else.
