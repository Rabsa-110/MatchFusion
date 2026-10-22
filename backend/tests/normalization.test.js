// backend/tests/normalization.test.js
// Automated tests for sports provider normalization and AI insights.
// Run with: npm test (or node --test)

import test from "node:test";
import assert from "node:assert/strict";

import { mapStatus as mapFootballStatus, normalizeFixture } from "../services/footballProvider.js";
import { mapStatus as mapCricketStatus, normalizeCricketMatch } from "../services/cricketProvider.js";
import { calculateProbabilities, parseGeminiResponse } from "../routes/ai.js";

// ── 1. API-Football Status Mapping ──────────────────────────────────────────
test("API-Football status mapping converts provider codes to internal standard", () => {
  assert.equal(mapFootballStatus("1H"), "LIVE");
  assert.equal(mapFootballStatus("2H"), "LIVE");
  assert.equal(mapFootballStatus("HT"), "LIVE");
  assert.equal(mapFootballStatus("FT"), "COMPLETED");
  assert.equal(mapFootballStatus("AET"), "COMPLETED");
  assert.equal(mapFootballStatus("PEN"), "COMPLETED");
  assert.equal(mapFootballStatus("NS"), "UPCOMING");
  assert.equal(mapFootballStatus("TBD"), "POSTPONED");
  assert.equal(mapFootballStatus("CANC"), "CANCELLED");
  assert.equal(mapFootballStatus("ABD"), "CANCELLED");
});

// ── 2. API-Football Fixture Normalization ───────────────────────────────────
test("API-Football normalizeFixture formats live fixture into common schema", () => {
  const mockFixture = {
    fixture: {
      id: 991201,
      date: "2026-10-13T18:00:00Z",
      status: { short: "2H", elapsed: 67, long: "Second Half" },
      venue: { name: "Camp Nou", city: "Barcelona" },
    },
    league: {
      name: "La Liga",
      country: "Spain",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      round: "Regular Season - 9",
    },
    teams: {
      home: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
      away: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
    },
    goals: { home: 2, away: 1 },
  };

  const normalized = normalizeFixture(mockFixture);
  assert.equal(normalized.provider, "football");
  assert.equal(normalized.externalId, "991201");
  assert.equal(normalized.sport, "football");
  assert.equal(normalized.competition, "La Liga");
  assert.equal(normalized.status, "LIVE");
  assert.equal(normalized.homeTeam, "Barcelona");
  assert.equal(normalized.awayTeam, "Real Madrid");
  assert.equal(normalized.scoreHome, "2");
  assert.equal(normalized.scoreAway, "1");
  assert.equal(normalized.venue, "Camp Nou");
  assert.match(normalized.statusDetail, /67'/);
});

test("API-Football normalizeFixture handles missing goals safely for upcoming fixture", () => {
  const mockUpcoming = {
    fixture: {
      id: 991202,
      date: "2026-10-15T20:00:00Z",
      status: { short: "NS", elapsed: null, long: "Not Started" },
      venue: { name: "Anfield", city: "Liverpool" },
    },
    league: { name: "Premier League", country: "England" },
    teams: {
      home: { name: "Liverpool" },
      away: { name: "Chelsea" },
    },
    goals: { home: null, away: null },
  };

  const normalized = normalizeFixture(mockUpcoming);
  assert.equal(normalized.status, "UPCOMING");
  assert.equal(normalized.scoreHome, null);
  assert.equal(normalized.scoreAway, null);
  assert.equal(normalized.homeShort, "LIV");
  assert.equal(normalized.awayShort, "CHE");
});

// ── 3. CricketData Status Mapping ───────────────────────────────────────────
test("CricketData status mapping correctly categorizes match statuses", () => {
  assert.equal(mapCricketStatus("t20", "In Progress", null), "LIVE");
  assert.equal(mapCricketStatus("odi", "Live - 34th Over", null), "LIVE");
  assert.equal(mapCricketStatus("test", "India won by 6 wickets", null), "COMPLETED");
  assert.equal(mapCricketStatus("t20", "Match yet to begin", null), "UPCOMING");
  assert.equal(mapCricketStatus("t20", "Match abandoned due to rain", null), "COMPLETED");
  assert.equal(mapCricketStatus("odi", "Match postponed", null), "POSTPONED");
});

// ── 4. CricketData Match Normalization ──────────────────────────────────────
test("CricketData normalizeCricketMatch parses score arrays and team info", () => {
  const mockCricket = {
    id: "cric-88910",
    name: "India vs Australia, 2nd ODI",
    matchType: "odi",
    status: "India won by 5 wickets",
    venue: "Wankhede Stadium, Mumbai",
    date: "2026-10-12",
    dateTimeGMT: "2026-10-12T09:00:00",
    teams: ["Australia", "India"],
    teamInfo: [
      { name: "Australia", shortname: "AUS", img: "https://cricapi.com/img/aus.png" },
      { name: "India", shortname: "IND", img: "https://cricapi.com/img/ind.png" },
    ],
    score: [
      { r: 278, w: 9, o: 50.0, inning: "Australia Inning 1" },
      { r: 280, w: 5, o: 47.3, inning: "India Inning 1" },
    ],
  };

  const normalized = normalizeCricketMatch(mockCricket);
  assert.equal(normalized.provider, "cricket");
  assert.equal(normalized.sport, "cricket");
  assert.equal(normalized.status, "COMPLETED");
  assert.equal(normalized.homeTeam, "Australia");
  assert.equal(normalized.awayTeam, "India");
  assert.equal(normalized.scoreHome, "278/9 (50 ov)");
  assert.equal(normalized.scoreAway, "280/5 (47.3 ov)");
  assert.equal(normalized.venue, "Wankhede Stadium, Mumbai");
});

// ── 5. AI Probability Calculation ───────────────────────────────────────────
test("AI calculateProbabilities produces normalized probabilities without fabricating facts", () => {
  // Test completed match
  const completedMatch = {
    sport: "football",
    status: "COMPLETED",
    scoreHome: "3",
    scoreAway: "1",
    home: { name: "Arsenal" },
    away: { name: "Chelsea" },
  };
  const completedProbs = calculateProbabilities(completedMatch);
  assert.equal(completedProbs.home, 100);
  assert.equal(completedProbs.away, 0);
  assert.equal(completedProbs.draw, 0);
  assert.equal(completedProbs.method, "result");

  // Test live football match: probabilities sum to 100
  const liveMatch = {
    sport: "football",
    status: "LIVE",
    scoreHome: "1",
    scoreAway: "0",
    home: { name: "Liverpool" },
    away: { name: "Everton" },
  };
  const liveProbs = calculateProbabilities(liveMatch);
  assert.ok(liveProbs.home > liveProbs.away, "Leading home team has higher probability");
  assert.equal(liveProbs.home + (liveProbs.draw || 0) + liveProbs.away, 100);

  // Test upcoming match: neutral baseline applied
  const upcomingMatch = {
    sport: "cricket",
    status: "UPCOMING",
    scoreHome: null,
    scoreAway: null,
    home: { name: "India" },
    away: { name: "Pakistan" },
  };
  const upcomingProbs = calculateProbabilities(upcomingMatch);
  assert.equal(upcomingProbs.home, 50);
  assert.equal(upcomingProbs.away, 50);
  assert.equal(upcomingProbs.draw, null, "Cricket does not have draw probability");
  assert.equal(upcomingProbs.method, "neutral_baseline");
});

// ── 6. Gemini Response Parsing ──────────────────────────────────────────────
test("parseGeminiResponse extracts JSON and handles markdown code blocks", () => {
  const match = { home: { name: "Arsenal" }, away: { name: "Chelsea" }, competition: "PL" };
  const probs = { home: 55, draw: 20, away: 25, method: "live_score", factors: ["Live score"] };

  const rawGeminiMarkdown = `\`\`\`json
{
  "factors": ["Arsenal leads 2-1 at 70'", "Dominant possession in second half"],
  "explanation": "Arsenal holds a one-goal advantage entering the final 20 minutes with momentum on their side.",
  "confidence": "medium",
  "disclaimer": "Probability-based estimate. Not a guaranteed outcome."
}
\`\`\``;

  const parsed = parseGeminiResponse(rawGeminiMarkdown, match, probs);
  assert.equal(parsed.aiAvailable, true);
  assert.equal(parsed.confidence, "medium");
  assert.equal(parsed.factors.length, 2);
  assert.match(parsed.explanation, /Arsenal holds a one-goal advantage/);
  assert.equal(parsed.home, 55);
  assert.equal(parsed.away, 25);
});

test("parseGeminiResponse falls back cleanly if response is unparseable", () => {
  const match = { home: { name: "Arsenal" }, away: { name: "Chelsea" }, competition: "PL" };
  const probs = { home: 40, draw: 20, away: 40, method: "neutral_baseline", factors: ["Baseline"] };

  const badResponse = "I cannot determine a winner for this match without more context.";
  const parsed = parseGeminiResponse(badResponse, match, probs);

  assert.equal(parsed.aiAvailable, true);
  assert.equal(parsed.confidence, "low");
  assert.ok(parsed.explanation.length > 0);
  assert.equal(parsed.home, 40);
});
