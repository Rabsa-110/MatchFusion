# MatchFusion — Production Deployment & Public Hosting Manual

This comprehensive guide details step-by-step instructions for deploying MatchFusion to the public internet so that users can access it from any browser, laptop, or mobile phone.

---

## 1. Architecture & Recommended Hosting Platforms

| Tier | Recommended Platform | Why Selected | Free Tier Availability |
| :--- | :--- | :--- | :---: |
| **Frontend** | **Vercel** (or Netlify) | Native Vite/React support, global edge CDN, automated HTTPS/SSL, instant Git CI/CD deployments. | Free ($0/month) |
| **Backend** | **Render** (or Railway) | Native Node.js support, automatic build & deploy on Git push, environment variable management, free web service tier. | Free ($0/month) |
| **Database** | **Supabase PostgreSQL** | Already configured & active! 500MB free storage, connection pooling, automated backups, instant global latency. | Free ($0/month) |

---

## 2. Domain Investigation: `matchfusion.com` Status & Alternatives

A live RDAP / DNS verification was performed on `matchfusion.com`:

```
Domain Name: MATCHFUSION.COM
Registry Domain ID: 129759292_DOMAIN_COM-VRSN
Current Status: Registered / Active (clientTransferProhibited)
Registration Date: September 8, 2004
Expiration Date: September 8, 2027
Current IP: 207.148.248.143
```

> [!WARNING]
> **`matchfusion.com` is NOT currently available for new registration.** It has been owned by a third party since 2004 and does not expire until September 2027.

### Recommended Available Alternatives:
1. **Free Immediate Default:** Deploy on Vercel (`https://matchfusion.vercel.app` or custom subdomain) — **$0/month, instant setup**.
2. **Purchase an Alternative TLD:**
   - `matchfusion.app` (ideal for web apps, Google Registry, ~$14/year)
   - `matchfusion.live` (perfect for live sports streaming & scores, ~$3/first year)
   - `matchfusion.io` (tech/developer focused, ~$35/year)
   - `matchfusion.net` (classic alternative, ~$12/year)

### Custom Domain DNS Setup (Once Purchased):
If you purchase a custom domain (e.g. from Namecheap, GoDaddy, or Cloudflare):
1. In your **Vercel Dashboard**, open your project -> **Settings** -> **Domains**.
2. Enter your custom domain (e.g., `matchfusion.app`).
3. Add the two DNS records shown by Vercel into your domain registrar's DNS manager:
   - **Type A Record:** `@` points to `76.76.21.21`
   - **Type CNAME Record:** `www` points to `cname.vercel-dns.com`
4. SSL certificates are provisioned automatically by Vercel in 60 seconds.

---

## 3. Pre-Deployment Repository Preparation

Ensure your Git repository is up to date and pushed to GitHub:

```bash
# 1. Check Git status
git status

# 2. Add modified files and commit
git add .
git commit -m "feat: complete player directory, team directory, and domain audit"

# 3. Push to your GitHub repository
git push origin main
```

---

## 4. Backend Deployment (Render.com)

### Step 4.1: Create Web Service on Render
1. Visit [render.com](https://render.com) and sign in (using GitHub).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your MatchFusion repository.
4. Configure the Web Service settings:
   - **Name:** `matchfusion-api` (or a name of your choice)
   - **Region:** Frankfurt (EU Central) or Singapore (closest to your database)
   - **Branch:** `main`
   - **Root Directory:** `backend` *(CRITICAL: Must specify `backend`)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

### Step 4.2: Configure Backend Environment Variables
In the Render dashboard, navigate to **Environment** -> **Add Environment Variable** and enter the following keys and values:

| Variable Name | Value / Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | `production` |
| `PORT` | `5000` (or Render will inject `$PORT` automatically) | `5000` |
| `DATABASE_URL` | Your Supabase Transaction Pooler URL (Port 6543) | `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Your Supabase Direct Connection URL (Port 5432) | `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | A secure, random string (min 32 characters) | *e.g. generate:* `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `FRONTEND_URL` | Your Vercel frontend URL | `https://matchfusion.vercel.app` |
| `API_FOOTBALL_KEY` | Your RapidAPI API-Football Key | *(From your backend/.env)* |
| `CRICKETDATA_API_KEY`| Your CricketData.org API Key | *(From your backend/.env)* |
| `GEMINI_API_KEY` | Your Google Gemini API Key | *(From your backend/.env)* |
| `FALLBACK_ENABLED` | Set strictly to `false` in production | `false` |

### Step 4.3: Deploy & Retrieve Public Backend URL
1. Click **Create Web Service**.
2. Wait 2-3 minutes for Render to run `npm install`, generate Prisma client, and start Express.
3. Once the build logs display `[db] Connected to Supabase PostgreSQL via Prisma`, your backend is live!
4. Note your Render public URL: `https://matchfusion-api.onrender.com`.

---

## 5. Frontend Deployment (Vercel)

### Step 5.1: Import Project to Vercel
1. Visit [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Select your MatchFusion GitHub repository and click **Import**.

### Step 5.2: Configure Vercel Build Settings
1. **Framework Preset:** Vite
2. **Root Directory:** Click "Edit" and choose `frontend` *(CRITICAL: Must specify `frontend`)*
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### Step 5.3: Configure Frontend Environment Variables
In the **Environment Variables** section on Vercel, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://matchfusion-api.onrender.com/api` | **Your public Render backend URL + `/api`** (Without trailing slash) |

### Step 5.4: Deploy & Test SPA Routing
1. Click **Deploy**.
2. In ~60 seconds, Vercel will complete the build and assign your domain (e.g. `https://matchfusion.vercel.app`).
3. SPA fallback routing (`/* -> /index.html`) is pre-configured via `vercel.json` and `_redirects` so refreshing deep routes (`/matches`, `/players`, `/teams`, `/profile`) works flawlessly.

---

## 6. Connecting Frontend & Backend (CORS Finalization)

1. Return to your Render backend dashboard -> **Environment Variables**.
2. Update `FRONTEND_URL` to your exact Vercel URL:  
   `FRONTEND_URL=https://matchfusion.vercel.app`
3. Click **Save Changes** (Render will redeploy with the new allowed origin).
4. Now your frontend communicates securely with your backend with zero CORS issues!

---

## 7. How to Run Database Migrations in Production

Your Supabase PostgreSQL database is already fully migrated with all tables:
- `Match`: 680 records (preserved)
- `Team`: 454 records (preserved & linked)
- `Player`: 352 records (populated from real provider data)
- `User`, `Post`, `Comment`, `Reaction`, `Poll`, `PollOption`, `Vote`, `AIInsight`

If you ever add new database fields in the future:
```bash
# In your local backend directory:
npx prisma migrate deploy
```
> **CRITICAL:** NEVER run `prisma migrate reset` in production! Always use `prisma migrate deploy`.

---

## 8. Handling Free-Tier Backend Cold Starts

Render's free tier spins down instances after 15 minutes of inactivity. When a new visitor opens the site after inactivity:
- The first API request may take **30-50 seconds** while Render boots the container.
- MatchFusion frontend is equipped with graceful loading skeletons and retry states to inform users during this spin-up.

### Optional Free Solution: Keep-Alive Ping
To prevent Render from sleeping during daytime hours:
1. Sign up for a free monitor at [cron-job.org](https://cron-job.org) or [uptimerobot.com](https://uptimerobot.com).
2. Set up an HTTP GET monitor pinging:  
   `https://matchfusion-api.onrender.com/api/health`
3. Set the interval to every **10 minutes**.
4. This keeps the backend warm 24/7 without incurring server fees!

---

## 9. Post-Deployment Verification Checklist

Once deployed, perform this step-by-step test sequence:

| Verification Step | Action to Perform | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :---: |
| **1. Site Loading** | Open public Vercel URL | Landing page loads instantly with live ticker and real match counts. | [ ] |
| **2. Match Center** | Click "Matches" in navbar | 680+ fixtures displayed with live filters, priority sorting, and alias search. | [ ] |
| **3. Alias Search** | Search `"BGD"`, `"BAN"`, `"RMA"`, `"Sixes"` | Matches featuring Bangladesh, Real Madrid, or Hong Kong Sixes appear. | [ ] |
| **4. Player Directory** | Click "Players" in navbar | 352 real players loaded with team badges, positions, photos, and pagination. | [ ] |
| **5. Team Directory** | Click "Teams" in navbar | 454 teams displayed with linked squad rosters. | [ ] |
| **6. User Registration** | Sign Up with new email & password | User registered, salted bcrypt hash saved in Supabase, redirected to logged-in state. | [ ] |
| **7. Session Restoration**| Refresh page (`F5`) | User remains logged in (`GET /auth/me` verifies session). | [ ] |
| **8. Profile Activity** | Open "My Profile" | User information displayed alongside live activity counters. | [ ] |
| **9. Community Post** | Create post in Community | Post appears in feed with user as author. | [ ] |
| **10. Match Poll Vote** | Cast a vote on a poll | Option tally increments atomically; duplicate vote rejected by DB. | [ ] |
| **11. AI Insights** | Open any match -> View AI Insights | Probabilities sum to 100%; tactical explanation displayed. | [ ] |
| **12. Logout** | Click "Logout" | Session clears; UI transitions cleanly to guest state. | [ ] |

---

## 10. Troubleshooting Common Production Issues

### Issue 1: "CORS error: Not allowed by CORS" in browser console
- **Fix:** In Render Environment Variables, ensure `FRONTEND_URL` is set to `https://<your-vercel-domain>.vercel.app` (ensure no trailing slash `/`).

### Issue 2: "Failed to connect to database" on Render
- **Fix:** Ensure `DATABASE_URL` uses port `6543` with `?pgbouncer=true` for transaction pooler mode, and `DIRECT_URL` uses port `5432`.

### Issue 3: Page refresh on deep route returns 404
- **Fix:** Ensure `vercel.json` exists in `frontend/` with rewrite rule `{"source": "/(.*)", "destination": "/"}`. This is already committed in the repository.

### Issue 4: Match refresh shows "cooling down"
- **Fix:** The match refresh endpoint has a 120-second cooldown to protect third-party API quotas. Wait 2 minutes between manual refreshes.
