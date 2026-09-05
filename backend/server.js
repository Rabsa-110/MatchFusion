import "dotenv/config";
import express from "express";
import cors from "cors";

import matchesRouter from "./routes/matches.js";
import teamsRouter from "./routes/teams.js";
import playersRouter from "./routes/players.js";
import authRouter from "./routes/auth.js";
import postsRouter from "./routes/posts.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  })
);
app.use(express.json());

// Health check — useful once deployed on Render to confirm the service is up
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/matches", matchesRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);

// AI insights endpoint is intentionally not implemented yet — see PROGRESS.md.
// It will take structured match data, run MatchFusion's own prediction logic,
// then call the Gemini API to produce a human-readable explanation.
app.post("/api/ai/predict", (req, res) => {
  res.status(501).json({
    success: false,
    message: "AI prediction endpoint not implemented yet in this progress build.",
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Something went wrong on the server" });
});

app.listen(PORT, () => {
  console.log(`MatchFusion API running on http://localhost:${PORT}`);
});
