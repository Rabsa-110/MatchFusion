# MatchFusion — Frontend

React + Vite + Tailwind CSS UI for MatchFusion. See the [root README](../README.md)
and [PROGRESS.md](../PROGRESS.md) for the full project overview and status.

## Setup

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
```

## Structure

```
src/
├── api/          Axios instance (points at the backend)
├── components/   Reusable UI: layout, matches, teams, players, ai, community, common
├── context/      AuthContext (demo client-side auth for this progress build)
├── data/         Mock data standing in for the sports/community APIs
└── pages/        Route-level pages (Home, Matches, Teams, Players, Community, ...)
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
