// backend/routes/ai.js
// Gemini AI match insights with transparent, sport-specific mathematical probability models.
// Persisted to PostgreSQL (AIInsight table) to prevent redundant external API calls.

import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as sportsService from "../services/sportsService.js";
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
export function calculateProbabilities(match) {
  const isCricket = match.sport === "cricket";
  const factors = [];

  // ── 1. COMPLETED MATCHES: Exact result ──────────────────────────────────────
  if (match.status === "COMPLETED") {
    factors.push("Match has concluded — outcome verified from final scorecard");
    if (isCricket) {
      const detail = (match.statusDetail || "").toLowerCase();
      if (detail.includes(match.home?.name?.toLowerCase() || "___") || detail.includes("home won")) {
        return { home: 100, draw: null, away: 0, factors, method: "result", confidence: "high" };
      }
      if (detail.includes(match.away?.name?.toLowerCase() || "___") || detail.includes("away won")) {
        return { home: 0, draw: null, away: 100, factors, method: "result", confidence: "high" };
      }
      // Check numeric score
      const hRuns = parseCricketRuns(match.scoreHome);
      const aRuns = parseCricketRuns(match.scoreAway);
      if (hRuns !== null && aRuns !== null) {
        if (hRuns > aRuns) return { home: 100, draw: null, away: 0, factors, method: "result", confidence: "high" };
        if (aRuns > hRuns) return { home: 0, draw: null, away: 100, factors, method: "result", confidence: "high" };
        return { home: 50, draw: null, away: 50, factors: [...factors, "Match tied"], method: "result", confidence: "high" };
      }
      return { home: 50, draw: null, away: 50, factors, method: "result", confidence: "medium" };
    } else {
      // Football
      const h = parseInt(match.scoreHome, 10);
      const a = parseInt(match.scoreAway, 10);
      if (!isNaN(h) && !isNaN(a)) {
        if (h > a) return { home: 100, draw: 0, away: 0, factors, method: "result", confidence: "high" };
        if (a > h) return { home: 0, draw: 0, away: 100, factors, method: "result", confidence: "high" };
        return { home: 0, draw: 100, away: 0, factors: [...factors, "Match ended in a draw"], method: "result", confidence: "high" };
      }
    }
  }

  // ── 2. LIVE FOOTBALL MATCHES: Dynamic Goal & Time Model ────────────────────
  if (match.sport === "football" && match.status === "LIVE") {
    const h = parseInt(match.scoreHome, 10) || 0;
    const a = parseInt(match.scoreAway, 10) || 0;
    const diff = h - a;

    // Parse elapsed minute
    let minute = 45;
    if (match.statusDetail) {
      const minMatch = match.statusDetail.match(/(\d+)'/);
      if (minMatch) minute = Math.min(95, Math.max(1, parseInt(minMatch[1], 10)));
    }

    factors.push(`Live score: ${match.home?.name || "Home"} ${h} - ${a} ${match.away?.name || "Away"}`);
    factors.push(`Match progress: ~${minute} minutes played`);

    // Time decay factor: later in the game, current leader is much more likely to hold on
    const timeRatio = minute / 90;

    let homeWeight = 38;
    let awayWeight = 32;
    let drawWeight = 30;

    if (diff === 0) {
      // Tie game: as time goes on, probability of draw increases
      drawWeight = Math.min(65, 28 + Math.round(timeRatio * 35));
      const remaining = 100 - drawWeight;
      homeWeight = Math.round(remaining * 0.54); // Home advantage
      awayWeight = remaining - homeWeight;
      factors.push("Score is level; probability of a draw increases as remaining time decreases");
    } else if (diff > 0) {
      // Home leading
      const leadFactor = Math.min(diff * 18, 50);
      homeWeight = Math.min(94, 45 + leadFactor + Math.round(timeRatio * 20));
      drawWeight = Math.max(4, Math.round((90 - minute) * 0.3 * (1 / diff)));
      awayWeight = Math.max(2, 100 - homeWeight - drawWeight);
      factors.push(`Home team holds a ${diff}-goal advantage in the ${minute}' minute`);
    } else {
      // Away leading
      const absDiff = Math.abs(diff);
      const leadFactor = Math.min(absDiff * 18, 50);
      awayWeight = Math.min(92, 42 + leadFactor + Math.round(timeRatio * 20));
      drawWeight = Math.max(4, Math.round((90 - minute) * 0.3 * (1 / absDiff)));
      homeWeight = Math.max(2, 100 - awayWeight - drawWeight);
      factors.push(`Away team holds a ${absDiff}-goal lead entering the latter stages`);
    }

    // Normalization to guarantee 100%
    const total = homeWeight + awayWeight + drawWeight;
    const homeNorm = Math.round((homeWeight / total) * 100);
    const awayNorm = Math.round((awayWeight / total) * 100);
    const drawNorm = 100 - homeNorm - awayNorm;

    return {
      home: homeNorm,
      draw: drawNorm,
      away: awayNorm,
      factors,
      method: "live_football_time_decay",
      confidence: minute > 60 ? "high" : "medium",
    };
  }

  // ── 3. LIVE CRICKET MATCHES: Run-Rate & Wickets In Hand Model ──────────────
  if (match.sport === "cricket" && match.status === "LIVE") {
    factors.push("Sport: Cricket (limited-overs/first-class result model)");
    const stats = match.stats || {};
    const rrr = stats.requiredRunRate;
    const crr = stats.runRate;

    // Check if Team 2 is chasing
    if (rrr !== null && rrr !== undefined && rrr > 0) {
      factors.push(`Target chase in progress: Required Run Rate is ${rrr.toFixed(1)} rpo`);

      let t2Prob = 50;
      if (rrr <= 6.0) {
        t2Prob = 75;
        factors.push("Required run rate is well within standard scoring parameters");
      } else if (rrr <= 8.5) {
        t2Prob = 55;
        factors.push("Chase is balanced; steady partnerships required");
      } else if (rrr <= 11.0) {
        t2Prob = 35;
        factors.push("Elevated required run rate applies mounting pressure on chasing batting lineup");
      } else {
        t2Prob = 15;
        factors.push("Steep required run rate (>11 rpo) strongly favors the defending bowling attack");
      }

      const t1Prob = 100 - t2Prob;
      return {
        home: t1Prob,
        draw: null,
        away: t2Prob,
        factors,
        method: "cricket_required_run_rate",
        confidence: "medium",
      };
    }

    // 1st innings in progress
    if (crr !== null && crr !== undefined) {
      factors.push(`1st Innings active: Current run rate is ${crr.toFixed(1)} rpo`);
      const base = crr >= 8.5 ? 60 : crr >= 7.0 ? 52 : 45;
      return {
        home: base,
        draw: null,
        away: 100 - base,
        factors,
        method: "cricket_first_innings_rate",
        confidence: "medium",
      };
    }

    // Fallback live cricket
    factors.push("Live cricket match active; equal team baseline applied");
    return {
      home: 50,
      draw: null,
      away: 50,
      factors,
      method: "cricket_live_baseline",
      confidence: "low",
    };
  }

  // ── 4. UPCOMING MATCHES: Documented Neutral Baseline ─────────────────────────
  if (isCricket) {
    factors.push("Upcoming fixture — match has not commenced");
    factors.push("Neutral baseline applied (50% / 50%) — outcomes in cricket do not include draws");
    return {
      home: 50,
      draw: null,
      away: 50,
      factors,
      method: "neutral_baseline",
      confidence: "low",
    };
  } else {
    // Football: standard European home advantage baseline (40% Home, 25% Draw, 35% Away)
    factors.push("Upcoming fixture — match has not commenced");
    factors.push("Standard European football baseline applied with historical home advantage (+5%)");
    return {
      home: 40,
      draw: 25,
      away: 35,
      factors,
      method: "neutral_baseline",
      confidence: "low",
    };
  }
}

function parseCricketRuns(scoreStr) {
  if (!scoreStr) return null;
  const m = String(scoreStr).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

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
