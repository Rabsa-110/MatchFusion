# MatchFusion — Module Descriptions & Code Documentation
*SDP-1 Final Project Report Support (Section 5)*

---

## 5.1 Tools and Technologies

- **Frontend:** React 19, Vite 8, Tailwind CSS, Axios, Lucide React, Recharts, React Router v7.
- **Backend:** Node.js 24 (ESM), Express 4.19, Prisma ORM 5.19, bcryptjs, jsonwebtoken, node-fetch.
- **Database:** Supabase PostgreSQL Cloud with connection pooling.
- **AI Engine:** Google Gemini 2.5 Flash SDK (`@google/generative-ai`).
- **External Providers:** API-Sports API-Football v3, CricketData.org API.

---

## 5.2 Module Descriptions

### Module 1: Sports Data Ingestion & Normalization (`sportsService.js`, `footballProvider.js`, `cricketProvider.js`)
- **Purpose:** Connects to third-party sports APIs, handles network timeouts and plan limitations, maps disparate status codes into a unified status vocabulary (`LIVE`, `UPCOMING`, `COMPLETED`, `POSTPONED`, `CANCELLED`), and orchestrates background synchronization.
- **Key Implementation Details:**
  - Manages dual-sport synchronization independently so cricket API downtime does not degrade football operations, and vice versa.
  - Implements in-memory cache with stale-while-revalidate pattern to stay strictly within the 100 requests/day free tier.
  - Upserts normalized records into the `Match` table with compound unique constraint `(provider, externalId)`.

### Module 2: Mathematical Probability Engine & AI Insights (`ai.js`, `AIInsight` Model)
- **Purpose:** Produces objective, sport-specific win probabilities without arbitrary percentages, invokes Google Gemini 2.5 Flash for natural language tactical explanations, and caches results in PostgreSQL.
- **Key Implementation Details:**
  - **Football:** Computes time-decay goal difference adjustments (`home + draw + away === 100%`).
  - **Cricket:** Evaluates Required Run Rate (RRR) and Current Run Rate (CRR) in target chases (`home + away === 100%`, `draw: null`).
  - **Completed Matches:** Detects verified final scores and assigns 100% to the verified winner.
  - **Database Caching:** Checks `prisma.aIInsight` before calling Gemini, avoiding duplicate API costs.

### Module 3: Authentication & User Profile (`auth.js`, `middleware/auth.js`, `AuthContext.jsx`)
- **Purpose:** Manages user account lifecycle, bcrypt password hashing, JWT creation/verification, session restoration, and user activity metrics.
- **Key Implementation Details:**
  - Registration enforces email format, minimum password length, and password confirmation.
  - On page reload, the frontend calls `GET /api/auth/me` with Bearer token to validate active sessions.
  - User profile area displays account details and aggregate statistics (`_count.posts`, `_count.comments`, `_count.reactions`, `_count.votes`).

### Module 4: Community Discussions & Match Polls (`posts.js`, `polls.js`, `lib/db.js`)
- **Purpose:** Real-time social engagement allowing registered sports fans to post opinions, reply with comments, like posts, and vote on match-linked polls.
- **Key Implementation Details:**
  - Users can create polls linked to real matches with 2 to 4 options.
  - Single vote per user per poll is enforced atomically using a PostgreSQL transaction checking `(userId, pollId)` uniqueness.
  - Authors have full authorization to delete their own posts and comments.

### Module 5: Search, Priority & Data Discovery (`aliases.js`, `Matches.jsx`)
- **Purpose:** Enables instant global discovery of matches, teams, and tournaments via abbreviation expansion and competition tiering.
- **Key Implementation Details:**
  - Normalizes aliases (e.g., `BD` -> Bangladesh, `RMA` -> Real Madrid, `IPL` -> Indian Premier League).
  - Categorizes competitions into 4 priority tiers to highlight major international events over regional domestic fixtures.

---

## 5.3 Important Code Snippets

### Snippet 1: Atomically Enforced One-Vote-Per-Poll Transaction (`backend/lib/db.js`)
```javascript
export async function votePoll({ pollId, optionId, userId }) {
  if (prismaActive) {
    return await prisma.$transaction(async (tx) => {
      // 1. Check if user already voted on ANY option in this poll
      const existingVote = await tx.vote.findFirst({
        where: { userId, OR: [{ pollId }, { option: { pollId } }] },
      });
      if (existingVote) {
        return { success: false, message: "You have already voted on this poll" };
      }

      // 2. Verify option belongs to this poll
      const option = await tx.pollOption.findFirst({
        where: { id: optionId, pollId },
      });
      if (!option) {
        return { success: false, message: "Invalid option for this poll" };
      }

      // 3. Create the vote record
      await tx.vote.create({
        data: { userId, optionId, pollId },
      });

      return { success: true, message: "Vote registered successfully" };
    });
  }
}
```

### Snippet 2: Sport-Specific Probability Calculation (`backend/routes/ai.js`)
```javascript
export function calculateProbabilities(match) {
  // Football: Home + Draw + Away normalized to 100%
  if (match.sport === "football" && match.status === "LIVE") {
    const diff = (parseInt(match.scoreHome, 10) || 0) - (parseInt(match.scoreAway, 10) || 0);
    const minute = extractMinute(match.statusDetail) || 45;
    const timeRatio = minute / 90;

    // Time decay adjustments
    let homeWeight = 38 + diff * 18 * timeRatio;
    let awayWeight = 32 - diff * 18 * timeRatio;
    let drawWeight = diff === 0 ? 28 + timeRatio * 35 : Math.max(4, 30 - Math.abs(diff) * 10);

    const total = homeWeight + awayWeight + drawWeight;
    const homeNorm = Math.round((homeWeight / total) * 100);
    const awayNorm = Math.round((awayWeight / total) * 100);
    const drawNorm = 100 - homeNorm - awayNorm;

    return { home: homeNorm, draw: drawNorm, away: awayNorm, method: "live_football_time_decay" };
  }

  // Cricket: Home + Away normalized to 100%, draw is null
  if (match.sport === "cricket" && match.status === "LIVE") {
    const rrr = match.stats?.requiredRunRate;
    const t2Prob = rrr <= 6.0 ? 75 : rrr <= 8.5 ? 55 : rrr <= 11.0 ? 35 : 15;
    return { home: 100 - t2Prob, draw: null, away: t2Prob, method: "cricket_required_run_rate" };
  }
}
```

