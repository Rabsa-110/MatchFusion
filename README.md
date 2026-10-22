# MatchFusion — AI-Powered Sports Community & Match Analysis Platform ⚽🏏

**Course:** Software Development Project – I (CSE-3208) · **Session:** July–Dec 2026  
**Team:** MD. Mehedi Hassan · Tabassum Binte Tariq Rabsa · Intasar Mostafiz · Pritoma Paul Lopa

---

## Overview

**MatchFusion** is a web-based platform designed for football and cricket fans. It brings live match scores, upcoming fixtures, completed match results, team and player profiles, AI-powered match predictions, and fan community interaction together in one unified platform. 🌟

### Problem Statement
Sports fans often need to navigate multiple disjointed websites and apps to access match updates, statistics, probability analysis, and discussions. MatchFusion solves this by consolidating live data, AI insights, and fan community discussions into a single, clean, interactive dashboard. 📊

---

## Target Users

MatchFusion is designed for:
* **Football & Cricket Fans** who want real-time scores, match status, and fixtures.
* **Sports Enthusiasts** interested in team profiles, squads, and player statistics.
* **Data-Oriented Users** who want probability breakdowns and performance trends.
* **Community Members** who want to share opinions, comment, react, and vote on polls.

---

## Core Features

- ⚽ **Football Match Center**: Real fixtures from API-Football v3 (live, today, upcoming fixtures, and completed results) across major leagues (Premier League, La Liga, Serie A, Champions League).
- 🏏 **Cricket Match Center**: Live and upcoming match scores from CricketData.org (cricapi) with overs, wickets, and innings scores.
- 🤖 **AI Match Insights**: Match analysis powered by Google Gemini 1.5 Flash, providing structured probability estimates and plain-language match factors without data hallucinations.
- 💾 **PostgreSQL Database via Prisma**: Persistent user registration, login with bcrypt password hashing and JWT authentication, community discussion posts, and sports data snapshots.
- ⚡ **Free-Tier Friendly Caching**: Central sports caching service with configurable refresh intervals (default 30 min) and deduplication to keep API consumption well within free quotas.
- 🎨 **Broadcast-Style UI**: Modern dark theme with score tickers, live status indicators, sport filter switchers, and data freshness badges.
- 💬 **Sports Community**: Create discussion posts, react, comment, and participate in match polls.

---

## Required Software

Before starting, ensure the following are installed on your Windows machine:

1. **Node.js**: v18.0.0 or newer (tested on Node v20/v22/v24 LTS).  
   Check in PowerShell: `node -v` and `npm -v`
2. **Git**: [git-scm.com](https://git-scm.com/)  
   Check in PowerShell: `git --version`
3. **VS Code** (or your preferred IDE)

---

## Accounts and Free API Keys Required

MatchFusion runs out-of-the-box locally with graceful fallbacks. To enable live external data, create free accounts and obtain API keys (all $0 cost):

| Service | Purpose | Free Quota | Sign-Up URL |
|---|---|---|---|
| **Supabase** | PostgreSQL Database | 500 MB free database | [supabase.com](https://supabase.com) |
| **API-Football** | Live football fixtures & scores | 100 requests / day | [dashboard.api-football.com](https://dashboard.api-football.com/register) |
| **CricketData.org** | Live cricket scores & fixtures | 100 hits / day | [cricketdata.org](https://cricketdata.org) |
| **Google AI Studio** | Gemini AI match insights | 15 RPM / free tier | [aistudio.google.com](https://aistudio.google.com/app/apikey) |

---

## Local Setup Guide (Windows PowerShell)

Follow these exact PowerShell commands to configure and run the application locally.

### Step 1: Open the Project
Open PowerShell in the project root directory:
```powershell
cd E:\Desktop\Project\MatchFusion
```

---

### Step 2: Configure Environment Variables

#### A. Configure the Backend `.env`
In PowerShell, copy the example environment file:
```powershell
Copy-Item backend\.env.example backend\.env
```

Open `backend\.env` in VS Code and fill in your credentials:
```env
PORT=5000
CORS_ORIGIN=http://localhost:5173

# 1. Supabase PostgreSQL Connection URL:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].pooler.supabase.com:6543/postgres?sslmode=require"

# 2. JWT Secret for user session signing:
JWT_SECRET="matchfusion_secret_key_change_in_production_2026"

# 3. Sports APIs (Free Tier Keys):
API_FOOTBALL_KEY="your_api_football_key_here"
CRICKETDATA_API_KEY="your_cricketdata_api_key_here"

# 4. Google Gemini API Key:
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_MODEL="gemini-1.5-flash"

# 5. Sports Refresh Interval:
SPORTS_REFRESH_INTERVAL_MINUTES=30
```

#### B. Configure the Frontend `.env`
In PowerShell, verify the frontend configuration:
```powershell
Copy-Item frontend\.env.example frontend\.env
```
Ensure `frontend\.env` contains:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### Step 3: Install Dependencies

#### Install Backend Dependencies:
```powershell
cd backend
npm install
cd ..
```

#### Install Frontend Dependencies:
```powershell
cd frontend
npm install
cd ..
```

---

### Step 4: Run Prisma Database Migrations

Once your `DATABASE_URL` is configured in `backend\.env`:
```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

> **Note:** If you haven't configured Supabase yet, the backend will still run! The matches service will use in-memory caching and local database fallbacks.

---

### Step 5: Start the Application

#### Method 1: One-Click Launcher (Recommended for Windows)

Simply double-click the **`start-matchfusion.bat`** file in the project root folder.
It automatically opens two Command Prompt windows:
1. **MatchFusion Backend (Port 5000)**: Starts Express API server with diagnostics.
2. **MatchFusion Frontend (Port 5173)**: Starts Vite React client.

Wait until both windows display ready messages, then open your browser:
👉 **http://localhost:5173**

---

#### Method 2: Manual Terminal Startup

**Terminal 1 — Backend API:**
```powershell
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`.

**Terminal 2 — Frontend Web:**
```powershell
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## Verifying the API & Endpoints

You can verify backend endpoints directly using PowerShell:

### Health Check:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

### Live Matches:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/matches?status=live"
```

### Football Upcoming Matches:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/matches?sport=football&status=upcoming"
```

### Cricket Matches:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/matches?sport=cricket"
```

---

## Automated Tests

MatchFusion includes an automated unit test suite covering sports provider normalization, status mapping, probability calculations, and AI response parsing:

```powershell
cd backend
npm test
```
All tests use mocked provider payloads so running tests never consumes your live API quotas.

---

## Free-Tier Quotas and Rate Limits

- **API-Football**: 100 requests per day.
- **CricketData.org**: 100 API hits per day.
- **Gemini 1.5 Flash**: 15 requests per minute free limit.

### Protection Mechanisms:
1. **In-Memory & Database Caching**: Cached for 30 minutes (`SPORTS_REFRESH_INTERVAL_MINUTES=30`).
2. **Stampede Prevention**: Concurrent requests for the same sport share a single in-flight promise.
3. **Manual Refresh Throttling**: `/api/matches/refresh` is rate-limited.
4. **AI Insight Caching**: Match predictions are cached for 30 minutes per match.

---

## Feature Implementation Status

| Feature | Current Status | Details |
|---|---|---|
| Football live / upcoming / completed | ✅ Connected | Real data from API-Football with status mapping |
| Cricket live / upcoming / completed | ✅ Connected | Real data from CricketData.org with overs & wickets |
| AI match insights | ✅ Connected | Google Gemini 1.5 Flash with structured prompt & probabilities |
| User authentication (bcrypt + JWT) | ✅ Connected | Persistent via Prisma & PostgreSQL (with local DB fallback) |
| Community feed (posts & reactions) | ✅ Connected | Database storage with local JSON fallback |
| Teams & Players directory | 🟡 Hybrid | Directory data with team and player associations |
| Interactive Poll voting backend | ✅ Connected | Dynamic poll retrieval and vote recording |
| Production cloud deployment | ⬜ Future Milestone | Localhost execution; cloud deployment planned |
