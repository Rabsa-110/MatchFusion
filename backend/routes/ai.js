// backend/routes/ai.js
// Gemini AI match insights with transparent, sport-specific mathematical probability models.
// Persisted to PostgreSQL (AIInsight table) to prevent redundant external API calls.

import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as sportsService from "../services/sportsService.js";
import { calculateProbabilities } from "../services/probabilityService.js";
export { calculateProbabilities };
import prisma from "../lib/prisma.js";

const router = Router();

const getGeminiApiKey = () => process.env.GEMINI_API_KEY;
const getGeminiModel = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

// In-memory fallback cache
const memoryCache = new Map();

/**
 * POST /api/ai/predict
 * Body: { matchId: string }
 */
router.post("/predict", async (req, res) => {
  const { matchId } = req.body;

  if (!matchId) {
    return res.status(400).json({ success: false, message: "matchId is required" });
  }

  // 1. Fetch match from sportsService
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

  // 2. Check persistent DB cache for an active, unexpired AI insight
  try {
    const dbMatch = await prisma.match.findUnique({
      where: {
        provider_externalId: {
          provider: match.provider,
          externalId: match.externalId,
        },
      },
    });

    if (dbMatch) {
      const existingInsight = await prisma.aIInsight.findFirst({
        where: {
          matchId: dbMatch.id,
          expiresAt: { gt: new Date() },
        },
        orderBy: { generatedAt: "desc" },
      });

      if (existingInsight) {
        return res.json({
          success: true,
          insight: {
            home: existingInsight.probHome,
            draw: existingInsight.probDraw,
            away: existingInsight.probAway,
            factors: existingInsight.factorsJson ? JSON.parse(existingInsight.factorsJson) : [],
            explanation: existingInsight.explanation,
            confidence: existingInsight.confidence,
            disclaimer: existingInsight.disclaimer,
            generatedAt: existingInsight.generatedAt.toISOString(),
            aiAvailable: true,
            probMethod: existingInsight.method,
            modelName: existingInsight.modelName,
          },
          fromCache: true,
        });
      }
    }
  } catch (err) {
    // If DB read fails, continue to calculate live
    console.warn("[ai] DB cache lookup skipped:", err.message);
  }

  // Check in-memory cache
  const inMem = memoryCache.get(matchId);
  if (inMem && Date.now() - inMem.generatedAt < 15 * 60 * 1000) {
    return res.json({ success: true, insight: inMem.insight, fromCache: true });
  }

  // 3. Calculate defensible, mathematically normalized probabilities
  const probs = calculateProbabilities(match);

  // 4. Generate structured explanation with Gemini if API key is present
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    const fallbackInsight = {
      home: probs.home,
      draw: probs.draw,
      away: probs.away,
      factors: probs.factors,
      explanation:
        "Statistical probabilities calculated from real match state. Add GEMINI_API_KEY to backend/.env to unlock tactical AI commentary.",
      confidence: probs.confidence || "medium",
      disclaimer: "Statistical probability estimate based on verified match data. Not a guaranteed outcome.",
      generatedAt: new Date().toISOString(),
      aiAvailable: false,
      probMethod: probs.method,
    };
    return res.json({ success: true, insight: fallbackInsight, keyMissing: true });
  }

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

    const insight = parseGeminiResponse(text, match, probs);
    memoryCache.set(matchId, { insight, generatedAt: Date.now() });

    // 5. Persist insight to DB
    try {
      const dbMatch = await prisma.match.findUnique({
        where: {
          provider_externalId: {
            provider: match.provider,
            externalId: match.externalId,
          },
        },
      });

      if (dbMatch) {
        // TTL: 15 min for LIVE, 2 hours for UPCOMING, 7 days for COMPLETED
        const ttlHours =
          match.status === "LIVE" ? 0.25 : match.status === "COMPLETED" ? 168 : 2;
        const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

        await prisma.aIInsight.create({
          data: {
            matchId: dbMatch.id,
            probHome: insight.home,
            probDraw: insight.draw,
            probAway: insight.away,
            confidence: insight.confidence,
            method: probs.method,
            explanation: insight.explanation,
            disclaimer: insight.disclaimer,
            factorsJson: JSON.stringify(insight.factors),
            modelName: getGeminiModel(),
            expiresAt,
          },
        });
      }
    } catch (e) {
      console.warn("[ai] DB persistence skipped:", e.message);
    }

    return res.json({ success: true, insight });
  } catch (err) {
    console.error("[ai] Gemini error:", err.message);

    const fallbackInsight = {
      home: probs.home,
      draw: probs.draw,
      away: probs.away,
      factors: probs.factors,
      explanation:
        "AI narrative generation is currently unavailable. Displaying factual probability model based on match state.",
      confidence: probs.confidence || "low",
      disclaimer: "Statistical probability estimate. Not a guaranteed outcome.",
      generatedAt: new Date().toISOString(),
      aiAvailable: false,
      probMethod: probs.method,
    };

    return res.json({ success: true, insight: fallbackInsight, aiError: err.message });
  }
});

/**
 * Sport-Specific, Mathematically Normalized Probability Engine.
 *
 * Requirements:
 * - Football: home + draw + away = 100%
 * - Cricket: home + away = 100% (draw: null)
 * - Completed matches: reflect actual final result (100% to winner)
 * - Transparent calculation methodology returned with factors
 */
export function buildPrompt(match, probs) {
  const sport = match.sport === "cricket" ? "cricket" : "football";
  const statusDesc =
    match.status === "LIVE"
      ? `This is a LIVE ${sport} match. Current status: ${match.statusDetail || "In progress"}.`
      : match.status === "UPCOMING"
      ? `This is an upcoming ${sport} match scheduled for ${match.kickoffAt ? new Date(match.kickoffAt).toUTCString() : "soon"}.`
      : `This is a completed ${sport} match.`;

  const scoreInfo =
    match.scoreHome !== null && match.scoreHome !== undefined
      ? `Current score: ${match.home?.name || "Home"} ${match.scoreHome} — ${match.away?.name || "Away"} ${match.scoreAway ?? "—"}.`
      : "Score not yet recorded.";

  const probSection = `
Mathematical probability estimates (pre-calculated from verified match data):
- ${match.home?.name || "Home"} win: ${probs.home}%
- ${probs.draw !== null ? `Draw: ${probs.draw}%` : "Draw: N/A (cricket)"}
- ${match.away?.name || "Away"} win: ${probs.away}%
Methodology: ${probs.method}
`;

  return `You are MatchFusion's AI sports analyst providing factual, defensible match insights.

Match: ${match.home?.name} vs ${match.away?.name}
Competition: ${match.competition}
Sport: ${sport}
${statusDesc}
${scoreInfo}

${probSection}

CRITICAL RULES:
1. Base your explanation strictly on the facts, status, and calculated probabilities provided above.
2. DO NOT alter the probabilities or invent fictitious player lineups, statistics, or historical matches.
3. Keep the explanation concise (2-3 sentences), professional, and informative.
4. Mention key factors influencing the state of the contest.

Respond in raw JSON format (no markdown code blocks, pure JSON):
{
  "factors": ["factor 1", "factor 2", "factor 3"],
  "explanation": "2-3 sentence factual explanation",
  "confidence": "low" | "medium" | "high",
  "disclaimer": "Probabilistic estimate based on real match data. Sports outcomes remain uncertain."
}`;
}

export function parseGeminiResponse(text, match, probs) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      home: probs.home,
      draw: probs.draw,
      away: probs.away,
      factors: Array.isArray(parsed.factors) && parsed.factors.length > 0 ? parsed.factors.slice(0, 5) : probs.factors,
      explanation:
        typeof parsed.explanation === "string" && parsed.explanation.trim()
          ? parsed.explanation.trim()
          : "Match insight generated from verified match state and mathematical probability modeling.",
      confidence: ["low", "medium", "high"].includes(parsed.confidence)
        ? parsed.confidence
        : probs.confidence || "medium",
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
      explanation: text.slice(0, 300) || "Match insight generated from verified match state.",
      confidence: probs.confidence || "low",
      disclaimer: "Probability-based estimate. Not a guaranteed outcome.",
      generatedAt: new Date().toISOString(),
      aiAvailable: true,
      probMethod: probs.method,
    };
  }
}

export default router;
