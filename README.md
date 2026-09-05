# MatchFusion

**AI-Powered Sports Community & Match Analysis Platform**

Course: Software Development Project – I (CSE-3208) · Session: July–Dec 2026
Team: MD. Mehedi Hassan · Tabassum Binte Tariq Rabsa · Intasar Mostafiz · Pritoma Paul Lopa

> ⚠️ **Progress build.** This submission implements roughly half of the full
> proposal — a complete, polished frontend UI on mock data, plus a working
> backend scaffold (real auth, a few live API routes). It is **not** the
> final deliverable. See [`PROGRESS.md`](./PROGRESS.md) for exactly what's
> done, what's stubbed, and what's left before the final submission.

---

## What is MatchFusion?

A web platform for football and cricket fans that brings together live
scores, upcoming/completed matches, team & player stats, AI-based match
insights, and a fan community (posts, comments, reactions, polls) — in one
place, at zero cost.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide icons |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Supabase free tier) + Prisma ORM |
| Auth | JWT + bcrypt |
| AI | Gemini API (planned) |
| Sports data | TheSportsDB / football & cricket APIs (planned) |
| Tooling | VS Code, Git/GitHub, Postman |
| Hosting (free) | Render (frontend static site + backend web service), Supabase (Postgres) |

## Project structure

```
MatchFusion/
├── frontend/     React + Vite + Tailwind UI (see frontend/README below)
├── backend/      Node/Express API + Prisma schema
├── PROGRESS.md   What's implemented vs pending, mapped to the proposal
└── README.md     This file
```

## Running it locally

### 1. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # defaults are fine for local dev
npm run dev                # http://localhost:5173
```

The frontend currently renders entirely from mock data in
`frontend/src/data/` so it runs and looks complete even with the backend
turned off.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in DATABASE_URL / JWT_SECRET when ready
npm run dev                 # http://localhost:5000
```

The backend runs standalone (no database required yet) — `/api/matches`,
`/api/teams`, and `/api/players` serve placeholder data, and `/api/auth`
performs **real** bcrypt hashing + JWT signing against an in-memory user
list. See `PROGRESS.md` for what changes once Postgres is connected.

Quick check once it's running:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/matches?status=live
```

## Deployment (planned, free tier)

- Frontend → Render Static Site
- Backend → Render Web Service (connected to this GitHub repo)
- Database → Supabase PostgreSQL (not Render's free Postgres — it expires
  after 30 days)
- AI → Gemini API free tier
- Sports data → TheSportsDB free tier (pending endpoint verification)

This gives a public `https://matchfusion.onrender.com`-style link at ৳0.
Not yet deployed in this progress build — see `PROGRESS.md`.

## Design

Dark, gradient-accented UI (emerald → blue → violet) inspired by sports
broadcast graphics — scoreboard-style monospace digits for scores, a
pulsing live indicator, and a scrolling match ticker. Fully responsive,
built with reusable components (`MatchCard`, `TeamCard`, `PlayerCard`,
`AIPredictionCard`, `CommunityPost`, `PollCard`, etc.) under
`frontend/src/components/`.
