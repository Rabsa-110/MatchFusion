import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

import express from "express";
import cors from "cors";

import matchesRouter from "./routes/matches.js";
import teamsRouter from "./routes/teams.js";
import playersRouter from "./routes/players.js";
import authRouter from "./routes/auth.js";
import postsRouter from "./routes/posts.js";
import pollsRouter from "./routes/polls.js";
import aiRouter from "./routes/ai.js";
import { startScheduler, getCacheStatus, getPlatformStatistics, checkDbConnectivity } from "./services/sportsService.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  })
);
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  const cache = getCacheStatus();
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      footballApi: !!process.env.API_FOOTBALL_KEY ? "configured" : "not configured",
      cricketApi: !!process.env.CRICKETDATA_API_KEY ? "configured" : "not configured",
      geminiAi: !!process.env.GEMINI_API_KEY ? "configured" : "not configured",
      database: !!process.env.DATABASE_URL ? "configured" : "not configured",
    },
    cache,
  });
});

// ── Database health check ─────────────────────────────────────────────────────
app.get("/api/health/db", async (req, res) => {
  const result = await checkDbConnectivity();
  res.status(result.ok ? 200 : 503).json({
    success: result.ok,
    database: result.ok ? "connected" : "unreachable",
    detail: result.message,
    timestamp: new Date().toISOString(),
  });
});

// ── Platform-wide Statistics ─────────────────────────────────────────────────
app.get("/api/statistics", async (req, res) => {
  try {
    const stats = await getPlatformStatistics();
    res.json({ success: true, ...stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/matches", matchesRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/polls", pollsRouter);
app.use("/api/ai", aiRouter);

// ── 404 & error handlers ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Something went wrong on the server" });
});

// ── Start ────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 MatchFusion Backend API running on http://localhost:${PORT}`);
  console.log(`======================================================`);
  console.log(`  Football API key: ${process.env.API_FOOTBALL_KEY ? "✓ set" : "✗ missing"}`);
  console.log(`  Cricket API key:  ${process.env.CRICKETDATA_API_KEY ? "✓ set" : "✗ missing"}`);
  console.log(`  Gemini API key:   ${process.env.GEMINI_API_KEY ? "✓ set" : "✗ missing"}`);
  console.log(`  Database URL:     ${process.env.DATABASE_URL?.includes("PASSWORD") ? "✗ placeholder" : process.env.DATABASE_URL ? "✓ set" : "✗ missing"}`);

  // Start background refresh scheduler
  try {
    startScheduler();
  } catch (err) {
    console.error("[scheduler] failed to start:", err.message);
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ [PORT CONFLICT] Port ${PORT} is already in use by another process.`);
    console.error(`MatchFusion requires port ${PORT} for the backend API.`);
    console.error(`To close the conflicting process on Windows:`);
    console.error(`  1. Open Command Prompt or PowerShell`);
    console.error(`  2. Run: netstat -ano | findstr :${PORT}`);
    console.error(`  3. Run: taskkill /PID <PID> /F  (replace <PID> with the number from the last column)\n`);
    process.exit(1);
  } else {
    console.error("\n❌ [SERVER ERROR]", err.message);
    process.exit(1);
  }
});
