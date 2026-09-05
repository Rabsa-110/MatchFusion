# MatchFusion — Progress Report

This document maps this submission against the **Major Features and
Functionalities** listed in the submitted Project Proposal Report, so it's
clear what's implemented, what's stubbed for demo purposes, and what's
planned for the final submission.

Legend: ✅ Done &nbsp; 🟡 Partially done / stubbed &nbsp; ⬜ Not started yet

---

## 1. User Authentication — 🟡

- ✅ Registration & login **UI** (`frontend/src/pages/Login.jsx`, `Register.jsx`)
- ✅ Backend `/api/auth/register` and `/api/auth/login` with **real** bcrypt
  password hashing and JWT signing (`backend/routes/auth.js`)
- 🟡 Users are currently stored in an **in-memory array** on the backend
  (resets on server restart) instead of PostgreSQL — the `User` model
  already exists in `backend/prisma/schema.prisma`, it just isn't wired up
  to a live database yet
- 🟡 The frontend does not yet call the real backend auth routes — it uses a
  lightweight `AuthContext` (`frontend/src/context/AuthContext.jsx`) so the
  login → profile menu → logout flow can be demoed without a running
  backend. Swapping this for real `axios` calls to `/api/auth/*` is a small,
  well-scoped next step.
- ⬜ Supabase PostgreSQL connection (`DATABASE_URL`) not yet configured

## 2. Match Center (live / upcoming / completed, scores, events, details) — 🟡

- ✅ Full UI: match grids with sport + status filters + search
  (`frontend/src/pages/Matches.jsx`)
- ✅ Match Details page with Overview / Events / Statistics / AI Insights /
  Discussion tabs (`frontend/src/pages/MatchDetails.jsx`)
- ✅ Backend `/api/matches` and `/api/matches/:id` routes, with `sport` and
  `status` filtering
- 🟡 All match/score/event data is currently **mock data**
  (`frontend/src/data/mockMatches.js`, `backend/data/matches.js`) — no live
  sports API is connected yet
- ⬜ Sports API provider not finalized. TheSportsDB is the leading free-tier
  candidate, but its live-score endpoints need to be tested against exactly
  the football/cricket data MatchFusion needs before committing to it

## 3. Football & Cricket switching — ✅

- Sport switcher implemented and used consistently across Matches, Teams,
  and Players pages (`frontend/src/components/common/SportSwitcher.jsx`)

## 4. Team & Player Information — 🟡

- ✅ Teams grid, Team Details page (form, record, squad, recent matches)
- ✅ Players grid with position/role and available stats
- 🟡 Backed by mock data only; no live sync from a sports API yet
- ⬜ Player Details as its own page (currently player info is shown via
  cards only — kept in scope for the next milestone)

## 5. Statistics & Charts — 🟡

- ✅ Match-level stats (possession, shots, corners, fouls for football; run
  rate & partnership for cricket) rendered as comparison bars
- 🟡 Recharts is installed and listed in the stack, but the current stat
  visuals use lightweight custom bars rather than Recharts components —
  swapping in Recharts (line/bar/pie charts for team & player analytics) is
  planned for the next milestone, once real historical data is available to
  chart

## 6. AI Match Insights — 🟡

- ✅ Full AI Insight UI: probability bars (Team A / Draw / Team B), key
  factors list, plain-language explanation
  (`frontend/src/components/ai/AIPredictionCard.jsx`)
- 🟡 Percentages and explanations are **mock data** — the real pipeline
  (backend calculates probability from structured stats → Gemini API turns
  it into a natural-language explanation) is designed but not implemented
- ⬜ `POST /api/ai/predict` exists on the backend but currently returns
  `501 Not Implemented` on purpose, as a clear placeholder
- ⬜ `GEMINI_API_KEY` integration not started

## 7. Sports Community (posts, comments, reactions, polls) — 🟡

- ✅ Community feed UI: posts, likes, comments count, Latest/Popular tabs
- ✅ Poll UI with live vote percentages
- ✅ Backend `GET/POST /api/posts`, with `POST` protected by JWT
  (`backend/middleware/auth.js`)
- 🟡 Posts are stored in-memory on the backend (not Postgres yet); the
  frontend feed doesn't call the backend yet — new posts are added to local
  React state only, so they don't persist across a refresh
- ⬜ Comments and reactions are UI-only for now (no dedicated endpoints yet)
- ⬜ Prisma models for `Post`, `Comment`, `Reaction`, `Poll`, `PollOption`,
  `Vote` are written (`backend/prisma/schema.prisma`) but not migrated to a
  real database

## 8. Search & Filtering — ✅

- Implemented on Matches, Teams, and Players pages (client-side search over
  mock data + sport/status filters)

---

## Technology stack — what's actually wired up

| Technology | Status |
|---|---|
| React + Vite | ✅ Running |
| Tailwind CSS | ✅ Configured with a custom MatchFusion theme |
| React Router | ✅ All routes working |
| Axios | ✅ Configured (`frontend/src/api/axios.js`), not yet called from pages |
| Recharts | 🟡 Installed, not yet used (see Statistics & Charts above) |
| Node.js + Express | ✅ Running, tested (`/api/health`, `/api/matches`, `/api/auth/*`) |
| PostgreSQL + Prisma | 🟡 Schema written, no live database connected |
| JWT + bcrypt | ✅ Working end-to-end (against in-memory users) |
| Gemini API | ⬜ Not started |
| Sports APIs | ⬜ Provider not finalized |
| Git/GitHub, VS Code, Postman | ✅ In use for development |

## What's next (before final submission)

1. Confirm a sports API provider and verify its free-tier football/cricket
   endpoints actually cover what MatchFusion needs (live scores, events,
   team/player stats).
2. Stand up a Supabase PostgreSQL project, set `DATABASE_URL`, and run
   `npx prisma migrate dev` to create real tables.
3. Move the in-memory user/post stores in the backend over to Prisma
   queries.
4. Connect the frontend to the real backend: replace mock data imports with
   `axios` calls (`frontend/src/api/axios.js` is already set up for this),
   and connect `AuthContext` to `/api/auth/*`.
5. Implement `/api/ai/predict`: prediction logic from match stats, then a
   Gemini API call for the explanation text.
6. Swap the custom stat bars for real Recharts visualizations once live
   data is flowing.
7. Deploy: Render (frontend static site + backend web service) + Supabase,
   and share the public link.
