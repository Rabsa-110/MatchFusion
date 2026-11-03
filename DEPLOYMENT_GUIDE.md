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

## 2. Pre-Deployment Repository Preparation

Ensure your Git repository is up to date and pushed to GitHub:

```bash
# 1. Check Git status
git status

# 2. Add modified files and commit
git add .
git commit -m "feat: complete production-ready sports platform with hardened auth and report support"

# 3. Push to your GitHub repository
git push origin main
```

---

## 3. Backend Deployment (Render.com)

### Step 3.1: Create Web Service on Render
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

### Step 3.2: Configure Backend Environment Variables
In the Render dashboard, navigate to **Environment** -> **Add Environment Variable** and enter the following keys and values:

| Variable Name | Value / Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | `production` |
| `PORT` | `5000` (or Render will inject `$PORT` automatically) | `5000` |
| `DATABASE_URL` | Your Supabase Transaction Pooler URL (Port 6543) | `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Your Supabase Direct Connection URL (Port 5432) | `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | A secure, random string (min 32 characters) | *e.g. run in terminal:* `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `FRONTEND_URL` | Your Vercel frontend URL (will be updated after Step 4) | `https://matchfusion.vercel.app` |
| `API_FOOTBALL_KEY` | Your RapidAPI API-Football Key | *(Your existing key from .env)* |
| `CRICKET_API_KEY` | Your CricketData.org API Key | *(Your existing key from .env)* |
| `GEMINI_API_KEY` | Your Google Gemini API Key | *(Your existing key from .env)* |
| `FALLBACK_ENABLED` | Set strictly to `false` in production | `false` |

### Step 3.3: Deploy & Retrieve Public Backend URL
1. Click **Create Web Service**.
2. Wait 2-3 minutes for Render to run `npm install`, generate Prisma client, and start Express.
3. Once the build logs display `[db] Connected to Supabase PostgreSQL via Prisma`, your backend is live!
4. Note your Render public URL:  
   `https://matchfusion-api.onrender.com`

---

## 4. Frontend Deployment (Vercel)

### Step 4.1: Import Project to Vercel
1. Visit [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Select your MatchFusion GitHub repository and click **Import**.

### Step 4.2: Configure Vercel Build Settings
1. **Framework Preset:** Vite
2. **Root Directory:** Click "Edit" and choose `frontend` *(CRITICAL: Must specify `frontend`)*
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### Step 4.3: Configure Frontend Environment Variables
In the **Environment Variables** section on Vercel, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://matchfusion-api.onrender.com` | **Your public Render backend URL from Step 3.3** (Without trailing slash) |

### Step 4.4: Deploy & Test SPA Routing
1. Click **Deploy**.
2. In ~60 seconds, Vercel will complete the build and assign your domain (e.g. `https://matchfusion.vercel.app`).
3. Note: MatchFusion includes `vercel.json` and `_redirects` in `frontend/public/` which automatically handle SPA fallback routing (`/* -> /index.html`) so refreshing deep links like `/matches` or `/profile` will never result in 404 errors.

---

## 5. Connecting Frontend & Backend (CORS Finalization)

1. Return to your Render backend dashboard -> **Environment Variables**.
2. Update `FRONTEND_URL` to your exact Vercel URL:  
   `FRONTEND_URL=https://matchfusion.vercel.app`
3. Click **Save Changes** (Render will automatically redeploy the backend with the new allowed origin).
4. Now your frontend can securely communicate with your backend with zero CORS issues!

---

## 6. How to Run Database Migrations in Production

Your Supabase PostgreSQL database is already fully migrated with all tables (`User`, `Match`, `Team`, `Player`, `Post`, `Comment`, `Reaction`, `Poll`, `PollOption`, `Vote`, `AIInsight`).

If you ever add new database fields in the future:
```bash
# In your local backend directory:
# Safely apply pending migrations to Supabase without resetting data:
npx prisma migrate deploy
```
> **IMPORTANT:** NEVER run `prisma migrate reset` in production, as that drops all historical match and user records! Always use `prisma migrate deploy`.

---

## 7. Handling Free-Tier Backend Cold Starts

Render's free tier spins down instances after 15 minutes of inactivity. When a new visitor opens the site after inactivity:
- The first API request may take **30-50 seconds** while Render boots the container.
- MatchFusion frontend is equipped with graceful loading skeletons and retry states to inform users during this spin-up.

### Optional Free Solution: Keep-Alive Ping
To prevent Render from sleeping during daytime hours:
1. Sign up for a free monitor at [cron-job.org](https://cron-job.org) or [uptimerobot.com](https://uptimerobot.com).
2. Set up an HTTP GET monitor pinging:  
   `https://matchfusion-api.onrender.com/api/matches?limit=1`
3. Set the interval to every **10 minutes**.
4. This keeps the backend warm 24/7 without incurring server fees!

---

## 8. Post-Deployment Verification Checklist

Once deployed, perform this step-by-step test sequence from your mobile phone or browser to verify all systems:

| Verification Step | Action to Perform | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :---: |
| **1. Site Loading** | Open `https://matchfusion.vercel.app` | Dark sports-themed landing page loads instantly with live match ticker. | [ ] |
| **2. Public Match Center** | Click "Matches" in navbar | 321+ football & cricket fixtures displayed with live filters and sorting. | [ ] |
| **3. Alias Search** | Type `"BAN"` into match search | Matches featuring Bangladesh are instantly displayed. | [ ] |
| **4. User Registration** | Click "Sign Up", enter name, email, password | User is registered, JWT token stored, redirected to logged-in state. | [ ] |
| **5. Session Persistence** | Refresh the browser page (`F5`) | User remains logged in (`GET /auth/me` verifies session). | [ ] |
| **6. Profile Activity** | Open "My Profile" from navbar | User information displayed alongside 0 initial activity counts. | [ ] |
| **7. Community Discussion**| Go to Community -> Create Post | Post appears in feed with user as author. | [ ] |
| **8. Match Poll Voting** | Click an option on a poll & click Vote | Option tally increments; single vote enforced; duplicate prevented. | [ ] |
| **9. AI Insights** | Open any match -> View AI Insights | Probabilities sum to 100%; tactical explanation displayed. | [ ] |
| **10. Logout** | Click "Logout" from profile dropdown | Session clears; UI transitions back to guest state cleanly. | [ ] |

---

## 9. Troubleshooting Common Production Issues

### Issue 1: "CORS error: Not allowed by CORS" in browser console
- **Cause:** `FRONTEND_URL` on Render does not match your Vercel URL.
- **Fix:** In Render Environment Variables, ensure `FRONTEND_URL` is set to `https://<your-vercel-domain>.vercel.app` (ensure no trailing slash `/`).

### Issue 2: "Failed to connect to database" on Render
- **Cause:** Incorrect `DATABASE_URL` or Supabase pooler password.
- **Fix:** Ensure `DATABASE_URL` uses port `6543` with `?pgbouncer=true` for transaction pooler mode, and `DIRECT_URL` uses port `5432`.

### Issue 3: Page refresh on `/matches` returns 404 on Vercel
- **Cause:** SPA routing not configured.
- **Fix:** Verify `vercel.json` exists in `frontend/` with rewrite rule `{"source": "/(.*)", "destination": "/"}`. This is already committed in the MatchFusion repository.

### Issue 4: Match refresh returns HTTP 429
- **Cause:** The match refresh endpoint has a 120-second cooldown to protect third-party API quotas.
- **Fix:** Wait 2 minutes between manual refreshes. Automatic background refresh continues every 30 minutes.

