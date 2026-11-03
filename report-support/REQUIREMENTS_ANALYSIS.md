# MatchFusion — Requirement Analysis Document
*SDP-1 Final Project Report Support (Section 3)*

---

## 3.1 Functional Requirements

### FR-1: User Registration and Account Security
- The system shall allow new users to register by providing their full name, valid email address, password, and password confirmation.
- The system shall validate email address uniqueness and enforce a minimum password length of 6 characters.
- Passwords must be hashed using bcrypt (cost factor 10) prior to storage; plaintext passwords must never be stored.
- The system shall issue a signed JSON Web Token (JWT) with a 7-day expiration upon successful registration and login.

### FR-2: Session Management and Verification
- The frontend shall store the JWT securely in `localStorage` and transmit it via standard `Authorization: Bearer <token>` headers.
- On application reload, the frontend shall validate the session against the backend (`GET /api/auth/me`) rather than blindly trusting cached user state.
- The system shall invalidate sessions cleanly on user logout.

### FR-3: Multi-Sport Match Center & Data Normalization
- The system shall fetch real sports fixtures from API-Football (football) and CricketData.org (cricket).
- The system shall normalize heterogeneous provider responses into a common schema: `homeTeam`, `awayTeam`, `scores`, `statusDetail`, `venue`, `kickoffAt`, `events`, and `stats`.
- The system shall upsert normalized matches into PostgreSQL using the unique compound constraint `(provider, externalId)`, preventing duplicate records.

### FR-4: Global Competition Prioritization & Search
- The system shall prioritize major international tournaments (World Cups, Champions League) and primary leagues over regional domestic fixtures.
- The system shall support case-insensitive, alias-expanded searches across team names, abbreviations (`BD` -> Bangladesh, `RMA` -> Real Madrid, `IND` -> India), and competitions.
- The system shall allow users to sort matches by priority, live status, upcoming soonest, or recent results.

### FR-5: Rate-Limited Manual & Scheduled Refresh
- The system shall execute background refresh cycles every 30 minutes to preserve free API quotas (100 calls/day per provider).
- The system shall allow manual refresh via `POST /api/matches/refresh`, rate-limited to at most once every 2 minutes.

### FR-6: Mathematically Normalized AI Match Insights
- The system shall separate numerical probability calculation from natural language AI commentary.
- For football, probabilities shall sum to 100% across home win, draw, and away win using a time-decay goal-difference model.
- For cricket, outcomes shall follow a two-way win model (draw: null) utilizing required run rate and wickets in hand.
- Completed matches shall display verified final scores (100% to winner) rather than probabilistic forecasts.
- The system shall invoke Google Gemini 2.5 Flash with grounded prompts and cache results in the `AIInsight` PostgreSQL table.

### FR-7: Persistent Community Discussions
- Authenticated users shall be able to create, edit, and delete their own discussion posts tagged to specific matches or categories.
- Authenticated users shall be able to toggle reactions (likes) on posts, with database uniqueness preventing duplicate reactions.
- Authenticated users shall be able to post and delete their own comments on discussions.

### FR-8: Real Match-Linked Community Polls & Voting
- The system shall support creating interactive polls linked to active or upcoming matches.
- Authenticated users shall cast exactly one vote per poll, enforced atomically via PostgreSQL transactions and unique database constraints.

### FR-9: Team and Player Directories
- The system shall persist real teams and players derived from verified provider match data and squad events.
- Fabricated players or invented statistics are strictly forbidden.

### FR-10: User Profile & Activity Tracking
- The system shall provide a dedicated user profile area displaying account registration date, security status, and aggregate statistics (posts created, comments written, reactions given, and votes cast).

---

## 3.2 Non-Functional Requirements

### NFR-1: Reliability & Data Persistence
- The system shall strictly avoid silent local JSON fallbacks in production. In the event of database unavailability, the API shall return an explicit HTTP 503 Service Unavailable response with descriptive error messages.
- The system must never execute destructive schema resets or delete existing historical records.

### NFR-2: Performance & Latency
- The system shall pre-warm the in-memory cache directly from PostgreSQL upon startup, ensuring sub-50ms API response times on warm endpoints.
- Client-side static assets shall be bundled via Vite with gzip compression (bundle size < 400 kB).

### NFR-3: Security & Credential Protection
- Private API keys (`API_FOOTBALL_KEY`, `CRICKETDATA_API_KEY`, `GEMINI_API_KEY`, `DATABASE_URL`) must remain exclusively on the backend server.
- The backend shall enforce CORS origin validation and lightweight security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).

### NFR-4: Responsive UI & Usability
- The interface shall maintain visual fidelity across desktop, tablet, and mobile displays using Tailwind CSS responsive breakpoints.
- Dark broadcast glassmorphic styling shall be preserved throughout all components.

### NFR-5: SEO & Public Discoverability
- The public website shall provide Open Graph tags, Twitter Card metadata, canonical references, `robots.txt`, and an XML sitemap.
- Static client-side routing must support direct URL access through SPA rewrite fallback rules.

### NFR-6: Maintainability & Testability
- Code shall be modularized into discrete Express routers and React components.
- Automated tests shall cover normalization, authentication, priority scoring, and database persistence.

---

## 3.3 Hardware Requirements

| Component | Minimum Specification | Recommended Specification |
|---|---|---|
| Processor | Dual-Core 2.0 GHz (x86_64) | Quad-Core 2.5 GHz or higher |
| Memory (RAM) | 2 GB Available RAM | 4 GB+ RAM |
| Storage | 500 MB Free Disk Space | 2 GB+ SSD Storage |
| Network | Broadband Internet Connection (1 Mbps) | High-speed Internet (10 Mbps+) |

---

## 3.4 Software Requirements

| Category | Component / Tool | Version |
|---|---|---|
| Operating System | Windows 10/11, macOS, or Linux | Latest 64-bit |
| Runtime Environment | Node.js | v20.x or v24.x LTS |
| Package Manager | npm | v10.x+ |
| Database Engine | PostgreSQL (Supabase Cloud) | v15.x / v16.x |
| Object-Relational Mapper | Prisma ORM | v5.19.1+ |
| Frontend Library | React | v19.x |
| Frontend Build Tool | Vite | v8.x |
| Styling Framework | Tailwind CSS | v3.4.x |
| Icons & Charts | Lucide React, Recharts | Latest |
| Version Control | Git | v2.40+ |
