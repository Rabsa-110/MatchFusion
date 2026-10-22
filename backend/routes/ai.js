// backend/routes/ai.js
// Gemini AI match insights.
// Uses @google/generative-ai SDK with the current recommended model.
//
// Workflow:
//   1. Receive matchId in POST body
//   2. Fetch normalized match from sportsService
//   3. Validate data is sufficient for a meaningful insight
//   4. Calculate simple baseline win-probability from available data
//   5. Send structured prompt to Gemini
//   6. Return validated structured response

import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as sportsService from "../services/sportsService.js";

const router = Router();

const getGeminiApiKey = () => process.env.GEMINI_API_KEY;
const getGeminiModel = () => process.env.GEMINI_MODEL || "gemini-1.5-flash";

// Simple cache: don't repeatedly call Gemini for the same match
const insightCache = new Map(); // matchId → { insight, generatedAt }
const INSIGHT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * POST /api/ai/predict
 * Body: { matchId: string }
 */
router.post("/predict", async (req, res) => {
  const { matchId } = req.body;

  if (!matchId) {
    return res.status(400).json({ success: false, message: "matchId is required" });
  }

  // Check cache
  const cached = insightCache.get(matchId);
  if (cached && Date.now() - cached.generatedAt < INSIGHT_CACHE_TTL) {
    return res.json({ success: true, insight: cached.insight, fromCache: true });
  }

  // Check key configured
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      message:
        "GEMINI_API_KEY is not configured. Add it to backend/.env to enable AI insights. " +
        "Get a free key at https://ai.google.dev/gemini-api/docs/api-key",
      keyMissing: true,
    });
  }

  // Fetch match
  let match;
  try {
    match = await sportsService.getMatchById(matchId);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to load match data" });
  }

  if (!match) {
    return res.status(404).json({ success: false, message: "Match not found" });
  }

  // Validate: need at least both team names
  if (!match.home?.name || !match.away?.name) {
    return res.status(422).json({
      success: false,
      message: "Insufficient match data to generate an AI insight",
    });
  }

  // Calculate baseline probabilities
  const probs = calculateProbabilities(match);

  // Build prompt
  const prompt = buildPrompt(match, probs);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: getGeminiModel() });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let text;
    try {
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } finally {
      clearTimeout(timeout);
    }

    // Parse JSON from response
    const insight = parseGeminiResponse(text, match, probs);

    // Cache the result
    insightCache.set(matchId, { insight, generatedAt: Date.now() });

    return res.json({ success: true, insight });
  } catch (err) {
    console.error("[ai] Gemini error:", err.message);

    // Return probabilities without explanation if Gemini fails
    const fallbackInsight = {
      home: probs.home,
      draw: probs.draw,
      away: probs.away,
      factors: probs.factors,
      explanation:
        "AI explanation unavailable at this time. The probability estimates above are based on match status and available data.",
      confidence: "low",
      disclaimer: "Probability-based estimate. Not a guaranteed outcome.",
      generatedAt: new Date().toISOString(),
      aiAvailable: false,
    };

    return res.json({ success: true, insight: fallbackInsight, aiError: err.message });
  }
});

/**
 * Calculate simple baseline win probabilities.
 * For live matches: uses current score + time elapsed.
 * For upcoming: uses neutral 40/20/40 baseline (equal teams assumed without history).
 * For completed: reflects actual result.
 *
 * Values are normalized to sum to 100.
 */
export function calculateProbabilities(match) {
  const isCricket = match.sport === "cricket";
  const factors = [];

  if (match.status === "COMPLETED") {
    const hScore = parseScore(match.scoreHome, isCricket);
    const aScore = parseScore(match.scoreAway, isCricket);
    if (hScore !== null && aScore !== null) {
      factors.push("Completed match — result determined");
      if (hScore > aScore) return { home: 100, draw: 0, away: 0, factors, method: "result" };
      if (aScore > hScore) return { home: 0, draw: 0, away: 100, factors, method: "result" };
      return { home: 0, draw: 100, away: 0, factors, method: "result" };
    }
  }

  if (match.status === "LIVE") {
    const hScore = parseScore(match.scoreHome, isCricket);
    const aScore = parseScore(match.scoreAway, isCricket);

    if (hScore !== null && aScore !== null) {
      factors.push("Current live score used as primary input");
      const diff = hScore - aScore;
      let homeBase = 40 + diff * 8;
      let awayBase = 40 - diff * 8;
      let drawBase = isCricket ? 0 : 20;

      homeBase = Math.max(5, Math.min(90, homeBase));
      awayBase = Math.max(5, Math.min(90, awayBase));
      drawBase = Math.max(0, drawBase);

      const total = homeBase + awayBase + drawBase;
      return {
        home: Math.round((homeBase / total) * 100),
        draw: isCricket ? null : Math.round((drawBase / total) * 100),
        away: Math.round((awayBase / total) * 100),
        factors,
        method: "live_score",
      };
    }
  }

  // Upcoming or insufficient data — return neutral estimate
  factors.push("Insufficient historical data for this match pair");
  factors.push("Neutral baseline applied — result is uncertain");
  const homeBase = isCricket ? 50 : 40;
  const awayBase = isCricket ? 50 : 40;
  const drawBase = isCricket ? null : 20;
  return {
    home: homeBase,
    draw: drawBase,
    away: awayBase,
    factors,
    method: "neutral_baseline",
  };
}

/** Parse a score string to a numeric value for comparison */
function parseScore(score, isCricket) {
  if (score === null || score === undefined) return null;
  const n = parseInt(String(score).split("/")[0], 10);
  return isNaN(n) ? null : n;
}

/** Build the Gemini prompt */
export function buildPrompt(match, probs) {
  const sport = match.sport === "cricket" ? "cricket" : "football";
  const statusDesc =
    match.status === "LIVE"
      ? `This is a LIVE ${sport} match. Current status: ${match.statusDetail || "In progress"}.`
      : match.status === "UPCOMING"
      ? `This is an upcoming ${sport} match scheduled for ${match.kickoffAt ? new Date(match.kickoffAt).toUTCString() : "soon"}.`
      : `This is a completed ${sport} match.`;

  const scoreInfo =
    match.scoreHome !== null
      ? `Current score: ${match.home.name} ${match.scoreHome} — ${match.away.name} ${match.scoreAway ?? "—"}.`
      : "Score not yet available.";

  const probSection = `
Pre-calculated probability estimates (from match data, not your training):
- ${match.home.name} win: ${probs.home}%
- ${probs.draw !== null ? `Draw: ${probs.draw}%` : "(no draw in cricket)"}
- ${match.away.name} win: ${probs.away}%
Method: ${probs.method}
`;

  return `You are MatchFusion's AI assistant providing factual match insights.

Match: ${match.home.name} vs ${match.away.name}
Competition: ${match.competition}
Sport: ${sport}
${statusDesc}
${scoreInfo}

${probSection}

IMPORTANT RULES:
1. Do NOT invent statistics, lineups, historical results, or player info not provided here.
2. Base your explanation ONLY on the data in this prompt.
3. Clearly distinguish what is known (from data) vs what is probabilistic (your interpretation).
4. If data is insufficient, say so — do not make up context.

Respond in this exact JSON format (no markdown, no code block, just raw JSON):
{
  "factors": ["factor 1", "factor 2", "factor 3"],
  "explanation": "2-3 sentence plain-language explanation based ONLY on the data above",
  "confidence": "low|medium|high",
  "disclaimer": "short disclaimer that these are estimates"
}`;
}

/** Parse and validate Gemini's JSON response */
export function parseGeminiResponse(text, match, probs) {
  try {
    // Extract JSON from response (Gemini sometimes wraps in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      home: probs.home,
      draw: probs.draw,
      away: probs.away,
      factors: Array.isArray(parsed.factors) ? parsed.factors.slice(0, 5) : probs.factors,
      explanation:
        typeof parsed.explanation === "string"
          ? parsed.explanation
          : "Explanation unavailable.",
      confidence: ["low", "medium", "high"].includes(parsed.confidence)
        ? parsed.confidence
        : "low",
      disclaimer: parsed.disclaimer || "Probability-based estimate. Not a guaranteed outcome.",
      generatedAt: new Date().toISOString(),
      aiAvailable: true,
      probMethod: probs.method,
    };
  } catch (err) {
    console.warn("[ai] parse error:", err.message);
    return {
      home: probs.home,
      draw: probs.draw,
      away: probs.away,
      factors: probs.factors,
      explanation: text.slice(0, 300) || "AI explanation could not be parsed.",
      confidence: "low",
      disclaimer: "Probability-based estimate. Not a guaranteed outcome.",
      generatedAt: new Date().toISOString(),
      aiAvailable: true,
      probMethod: probs.method,
    };
  }
}

export default router;
