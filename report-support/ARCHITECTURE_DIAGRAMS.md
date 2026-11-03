# MatchFusion — Architecture, Use Case, Activity & ER Diagrams
*SDP-1 Final Project Report Support*

---

## 1. System Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 19 + Vite 8 + Tailwind CSS)"]
        UI["UI Layer (Pages, Components)"]
        State["State / AuthContext"]
        AxiosClient["Axios API Client (JWT Interceptor)"]
        UI --> State
        State --> AxiosClient
    end

    subgraph CDN["Public Static Hosting (Vercel / Netlify)"]
        SPA["Single Page App & Static Assets"]
        Client --- SPA
    end

    subgraph Backend["Backend API Server (Node.js 24 + Express ESM)"]
        Router["Express Routers (/matches, /teams, /players, /auth, /posts, /polls, /ai)"]
        AuthMiddleware["JWT requireAuth / optionalAuth Middleware"]
        SportsService["Sports Orchestrator & In-Memory Cache"]
        ProbEngine["Mathematical Probability Engine"]
        DBLayer["Universal Database Layer (lib/db.js)"]
        PrismaClient["Prisma ORM Client (lib/prisma.js)"]

        Router --> AuthMiddleware
        Router --> SportsService
        Router --> ProbEngine
        Router --> DBLayer
        DBLayer --> PrismaClient
        SportsService --> PrismaClient
    end

    subgraph ExternalAPIs["Third-Party Sports & AI Providers"]
        FootballAPI["API-Football v3 (REST API)"]
        CricketAPI["CricketData.org (cricScore & currentMatches)"]
        GeminiAPI["Google Gemini 2.5 Flash (Generative AI)"]
    end

    subgraph Database["Persistent Storage (Supabase PostgreSQL)"]
        PgPool["Transaction Pooler (Port 6543)"]
        Tables["Tables: User, Post, Comment, Reaction, Poll, PollOption, Vote, Match, Team, Player, AIInsight"]
        PgPool --> Tables
    end

    AxiosClient -->|HTTPS / REST API| Router
    SportsService -->|Scheduled Poll / Manual Refresh| FootballAPI
    SportsService -->|Scheduled Poll / Manual Refresh| CricketAPI
    ProbEngine -->|Grounded Prompt| GeminiAPI
    PrismaClient -->|PostgreSQL Connection Pool| PgPool
```

---

## 2. Use Case Diagram

```mermaid
flowchart LR
    subgraph Users["Actors"]
        Visitor["Public Visitor (Unauthenticated)"]
        Fan["Registered Fan (Authenticated)"]
        SystemAdmin["Background Refresh Scheduler"]
    end

    subgraph MatchCenter["Match Center & Insights"]
        UC1["Browse Live, Upcoming & Completed Matches"]
        UC2["Search Matches via Country / Team Aliases"]
        UC3["Filter by Sport, Status & Competition"]
        UC4["Trigger Live Provider Refresh"]
        UC5["View AI Match Probability & Insights"]
        UC6["View Team & Player Directories"]
    end

    subgraph AuthArea["Authentication & Profile"]
        UC7["Register Account (Name, Email, Password)"]
        UC8["Sign In (JWT Authentication)"]
        UC9["View Personal Profile & Activity History"]
        UC10["Sign Out"]
    end

    subgraph CommunityArea["Community & Polling"]
        UC11["Create Discussion Post (Tagged to Match)"]
        UC12["Edit & Delete Own Posts"]
        UC13["Add & Delete Comments"]
        UC14["Toggle Post Reactions (Like/Unlike)"]
        UC15["Vote on Match Polls (1 Vote per Poll)"]
        UC16["Create Match-Linked Poll"]
    end

    subgraph BackgroundService["Data Syncing"]
        UC17["Upsert Normalized Matches to PostgreSQL"]
        UC18["Sync Teams & Players to Database"]
    end

    Visitor --> UC1
    Visitor --> UC2
    Visitor --> UC3
    Visitor --> UC4
    Visitor --> UC5
    Visitor --> UC6
    Visitor --> UC7
    Visitor --> UC8

    Fan --> UC1
    Fan --> UC2
    Fan --> UC3
    Fan --> UC4
    Fan --> UC5
    Fan --> UC6
    Fan --> UC9
    Fan --> UC10
    Fan --> UC11
    Fan --> UC12
    Fan --> UC13
    Fan --> UC14
    Fan --> UC15
    Fan --> UC16

    SystemAdmin --> UC17
    SystemAdmin --> UC18
```

---

## 3. Activity Diagram (Match Refresh & AI Insight Generation)

```mermaid
flowchart TD
    Start([User opens Match Details]) --> CheckCache{Is Match in Cache?}
    CheckCache -- No --> FetchAPI[Fetch from SportsService]
    CheckCache -- Yes --> RenderMatch[Render Match Details & Live Scoreboard]
    FetchAPI --> RenderMatch

    RenderMatch --> UserRequestsAI[User Views AI Insights Tab]
    UserRequestsAI --> CheckDBInsight{Active AIInsight in PostgreSQL?}

    CheckDBInsight -- Yes & Unexpired --> LoadDBInsight[Return Cached DB Insight]
    CheckDBInsight -- No or Expired --> RunProbEngine[Run Sport-Specific Mathematical Probability Engine]

    RunProbEngine --> CheckSport{Sport?}
    CheckSport -- Football --> CalcFootball[Time-Decay Goal Differential Model<br/>P_home + P_draw + P_away = 100%]
    CheckSport -- Cricket --> CalcCricket[Required Run Rate & Wickets In Hand Model<br/>P_home + P_away = 100%]

    CalcFootball --> GroundedPrompt[Construct Grounded Prompt with Fixed Probabilities]
    CalcCricket --> GroundedPrompt

    GroundedPrompt --> CallGemini[Call Google Gemini 2.5 Flash API]
    CallGemini --> ParseResponse{Valid JSON Returned?}

    ParseResponse -- Yes --> SaveDB[Persist Insight to PostgreSQL AIInsight Table]
    ParseResponse -- No --> FallbackParse[Fallback to Plain Probability Display]

    SaveDB --> DisplayInsight[Display Probability Bars + Tactical AI Commentary]
    FallbackParse --> DisplayInsight
    LoadDBInsight --> DisplayInsight
    DisplayInsight --> Finish([End Activity])
```

---

## 4. Database Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--o{ Post : "creates"
    User ||--o{ Comment : "writes"
    User ||--o{ Reaction : "gives"
    User ||--o{ Vote : "casts"
    User ||--o{ Poll : "creates"

    Post ||--o{ Comment : "has"
    Post ||--o{ Reaction : "receives"
    Post ||--o| Poll : "optional link"

    Poll ||--|{ PollOption : "contains"
    PollOption ||--o{ Vote : "receives"

    Match ||--o{ AIInsight : "has"
    Team ||--o{ Player : "has"

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        datetime createdAt
    }

    Post {
        string id PK
        string content
        string matchTag
        string matchStatus
        datetime createdAt
        string authorId FK
    }

    Comment {
        string id PK
        string content
        datetime createdAt
        string authorId FK
        string postId FK
    }

    Reaction {
        string id PK
        string type
        datetime createdAt
        string userId FK
        string postId FK
    }

    Poll {
        string id PK
        string question
        string matchStatus
        string matchId
        datetime createdAt
        string postId FK
        string creatorId FK
    }

    PollOption {
        string id PK
        string label
        string pollId FK
    }

    Vote {
        string id PK
        string userId FK
        string optionId FK
        string pollId
    }

    Match {
        string id PK
        string provider
        string externalId UK
        string sport
        string competition
        string status
        datetime kickoffAt
        string homeTeam
        string homeShort
        string awayTeam
        string awayShort
        string scoreHome
        string scoreAway
        string statusDetail
        string eventsJson
        string statsJson
        string extraJson
        datetime lastFetchedAt
    }

    AIInsight {
        string id PK
        string matchId FK
        float probHome
        float probDraw
        float probAway
        string confidence
        string method
        string explanation
        string disclaimer
        string factorsJson
        string modelName
        datetime generatedAt
        datetime expiresAt
    }

    Team {
        string id PK
        string externalId
        string provider
        string name UK
        string shortName
        string country
        string sport UK
        string logo
        string competition
        datetime lastUpdated
    }

    Player {
        string id PK
        string externalId
        string provider
        string name
        string shortName
        string country
        string sport
        string position
        string role
        string image
        string statsJson
        datetime lastUpdated
        string teamId FK
    }
```
