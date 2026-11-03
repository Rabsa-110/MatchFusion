# MatchFusion — Technology Stack & Screenshots Documentation
**Course / Project:** SDP-1 Final Project Report Support  
**Document:** Chapter on System Implementation, Architecture Stack & Visual Evidence  
**Application:** MatchFusion (Sports Community & Match-Analysis Platform)  

---

## 1. Technology Stack Architecture & Technical Justifications

MatchFusion utilizes a modern, decoupled client-server architecture designed for high scalability, rapid response times, and robust relational data persistence.

```
+---------------------------------------------------------------------------------+
|                               PRESENTATION TIER                                 |
|         React 19  *  Vite 8  *  Tailwind CSS  *  Lucide Icons  *  React Router  |
+---------------------------------------+-----------------------------------------+
                                        |  RESTful JSON API / HTTPS
                                        v
+---------------------------------------------------------------------------------+
|                                APPLICATION TIER                                 |
|            Node.js v24  *  Express.js 4.19  *  Bcrypt  *  JSON Web Tokens       |
+-------------------+-----------------------------+-------------------------------+
                    |                             |
      External APIs v                             v Data Access Layer
  +----------------------+             +-----------------------------------------+
  |  API-Football (v3)   |             |            PRISMA ORM v5                |
  |  CricketData.org     |             |  Type-Safe Schema, Client & Migrations  |
  |  Google Gemini 2.5   |             +--------------------+--------------------+
  +----------------------+                                  |
                                                            v
+---------------------------------------------------------------------------------+
|                                 DATABASE TIER                                   |
|       Supabase Managed PostgreSQL 15+ (Session & Transaction Connection Pools)   |
+---------------------------------------------------------------------------------+
```

### Detailed Component Analysis

| Layer | Technology | Version | Technical Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | `19.0.0` | Declarative UI framework offering concurrent rendering, component reusability, efficient virtual DOM diffing, and seamless state synchronization via Context API. |
| **Frontend Bundler** | **Vite** | `8.x` | Next-generation build tool powered by native ES modules (ESM) and Rollup; provides sub-second Hot Module Replacement (HMR) and optimized minified production assets. |
| **Styling & Design** | **Tailwind CSS** | `3.4.x` | Utility-first CSS framework enabling a sleek, dark sports-themed aesthetic with custom gradient accents, fluid responsiveness, and zero runtime CSS overhead. |
| **Iconography** | **Lucide React** | `0.4x` | Lightweight, tree-shakeable SVG icon library providing crisp sports, navigation, community, and analytical iconography. |
| **Routing** | **React Router DOM** | `7.x` | Declarative client-side routing enabling single-page application (SPA) transitions without full page reloads. |
| **Backend Runtime** | **Node.js** | `v24.x LTS` | Event-driven, non-blocking asynchronous I/O runtime optimal for handling concurrent API requests, background schedulers, and live data streaming. |
| **Web Application Server**| **Express.js** | `4.19.2` | Minimalist, unopinionated web server framework with rich middleware support for CORS, authentication barriers, route parameterization, and sanitized error handling. |
| **Database Engine** | **PostgreSQL** | `15+` (Supabase) | Enterprise-grade Relational Database Management System (RDBMS) ensuring ACID compliance, strong relational integrity, foreign key cascading, and performant indexing. |
| **Object-Relational Mapping** | **Prisma ORM** | `5.x` | Type-safe database client and declarative schema modeling tool; prevents SQL injection vulnerabilities through automated query parameterization and safe schema migrations. |
| **Security & Authentication** | **Bcrypt & JWT** | `bcrypt 5.1`, `jsonwebtoken 9.0` | Salted SHA-512 password hashing ($2b$10$) ensuring cryptographic protection against rainbow-table attacks; stateless, digitally signed JWT tokens for scalable API authentication. |
| **External Sports Data** | **API-Football** | `v3` | Comprehensive live football statistics provider offering fixtures, lineups, live match events, and league standings across international competitions. |
| **External Cricket Data** | **CricketData.org** | `v1` | Specialized cricket API offering real-time ball-by-ball updates, live runs/wickets/overs, and international series coverage. |
| **Artificial Intelligence** | **Google Gemini AI** | `v2.5 Flash / Pro` | Generative AI LLM utilized for contextual tactical summaries, key factor breakdown, and multi-variable analytical synthesis combining mathematical probabilities. |

---

## 2. Report Screenshots Checklist & Capture Guide

To visually substantiate the project report chapters (e.g., Chapter 4: Implementation and Chapter 5: System Evaluation), the following 10 screenshots should be captured directly from the running web application:

| Figure # | Screen Name | URL Route | Description & Key UI Elements to Highlight |
| :---: | :--- | :--- | :--- |
| **Fig. 1** | **Landing Page / Hero Experience** | `/` | Dark sports-themed banner, MatchFusion logo, platform summary, quick action cards ("Live Match Center", "AI Predictions", "Sports Community"), and live ticker. |
| **Fig. 2** | **Match Center with Status Filters** | `/matches` | Filter tabs ("All", "Live", "Upcoming", "Finished"), sport selector (All, Football, Cricket), sorting dropdown ("Top Competitions", "Live Now"), and match cards displaying live scores and teams. |
| **Fig. 3** | **Search Alias Expansion in Action** | `/matches` | Search input with query `"BAN"` or `"RMA"`, displaying auto-resolved matches for Bangladesh or Real Madrid with high competition priority badges. |
| **Fig. 4** | **Match Detail & Live Match Center** | `/matches/:id` | Detailed scoreboard, venue, referee, kickoff countdown / live minute, team lineups, and synchronized match events. |
| **Fig. 5** | **AI Insights & Mathematical Probability Breakdown** | `/matches/:id` (AI Tab) | Probability bars totaling exactly $100\%$ (Home win, Draw, Away win), key calculated tactical factors, and Gemini AI contextual analysis. |
| **Fig. 6** | **Sports Community Feed & Discussions** | `/community` | Feed of user posts categorized by sport tags, like counters, comment sections, and authored post management controls. |
| **Fig. 7** | **Interactive Match Poll & Real-Time Voting** | `/community` (Polls) | Match-linked poll card showing vote options; transition to dynamic percentage distribution bars upon submitting a single vote. |
| **Fig. 8** | **Create Match Poll Interface** | `/community` (New Poll) | Form allowing registered users to link a poll to an upcoming match, define 2-4 custom voting options, and publish to the live feed. |
| **Fig. 9** | **User Profile & Activity Dashboard** | `/profile` | User badge, member since date, role tag, activity counter cards (Total Posts, Comments, Votes, Reactions), and authored post list with delete action. |
| **Fig. 10** | **Authentication & Password Strength Meter** | `/register` & `/login` | Attractive sports entry modal/page with email validation, live color-coded password strength meter (Red -> Yellow -> Green), and error handling toasts. |

> **Tip for Report Formatting:** Place two screenshots side-by-side in 2-column tables for compact report pages (e.g., Fig. 10: Registration side-by-side with Login).

---

## 3. Known System Limitations

While MatchFusion is fully functional, robust, and production-ready, developers and evaluators should recognize the following inherent external constraints:

1. **Free-Tier Sports API Rate Limits:**
   - *API-Football:* Free plan restricts consumption to 100 requests per day.
   - *CricketData.org:* Free plan restricts consumption to 100 requests per day.
   - *Mitigation Implemented:* Background sync scheduler is throttled to 30-minute intervals, match data is persistently cached in PostgreSQL, and the frontend refresh button enforces a 120-second client-side rate limit (`HTTP 429`).
2. **Player Roster Data Depth:**
   - Free API tiers only return player lineups for premier active fixtures, omitting non-starting squad members or historical career stats for lower-tier matches.
   - *Policy Enforced:* In accordance with data integrity guidelines, MatchFusion strictly stores genuine provider data and refuses to fabricate fake players or artificial batting/bowling statistics.
3. **Database Serverless Cold Starts:**
   - Supabase free-tier PostgreSQL projects may pause after 7 days of inactivity, leading to a 3-5 second delay on the initial cold query upon wake-up.
4. **WebSocket vs. Polling:**
   - Live scores currently update via periodic HTTP polling and manual refreshed queries rather than bidirectional WebSockets, optimizing hosting costs on serverless environments.

---

## 4. Future Enhancements & Roadmap

For future iterations and extended development (e.g., SDP-2 / Capstone Phase 2), the following architectural enhancements are planned:

1. **Bidirectional WebSocket / Server-Sent Events (SSE) Live Feed:**
   - Replace polling with Socket.io or Supabase Realtime to push live goal alerts, cricket boundary updates, and community comments directly to client screens without page reloads.
2. **Push Notifications & Match Reminders:**
   - Implement Web Push API / Service Workers to allow users to subscribe to their favorite teams (e.g., Arsenal, Bangladesh Cricket) and receive instant kickoff notifications.
3. **Fantasy League & Social Leaderboard:**
   - Expand the community module with a peer-to-peer prediction league where correct poll votes earn experience points (XP) and rank users on a global community leaderboard.
4. **Native Mobile Applications:**
   - Port the frontend component architecture to React Native / Expo to deliver native iOS and Android experiences with biometric authentication (FaceID / Fingerprint).
5. **Advanced Machine Learning Predictive Model:**
   - Train an in-house Python / Scikit-Learn or PyTorch model on 10 seasons of historical match data (incorporating Elo ratings, player injuries, and weather metrics) to complement Gemini LLM insights.

