// backend/services/cricketProvider.js
//
// Fetches live, completed, and upcoming cricket matches from CricketData.org (api.cricapi.com).
// Uses both /cricScore (fast, high-volume live/result/fixture data) and /currentMatches
// to ensure complete coverage of international, domestic, and league cricket.
//
// Docs: https://cricketdata.org/cricket-live-score-api/

import fetch from "node-fetch";

const BASE_URL = "https://api.cricapi.com/v1";
const getApiKey = () => process.env.CRICKETDATA_API_KEY;

/** Low-level fetch with timeout & enhanced error handling */
async function apiFetch(endpoint, params = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("CRICKETDATA_API_KEY not configured");
  }

  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("apikey", apiKey);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // Expanded timeout to 15s for high stability

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`CricketData HTTP ${res.status}`);
    }

    const body = await res.json();

    if (body.status !== "success" && body.status !== "ok") {
      throw new Error(`CricketData error: ${body.reason || body.status}`);
    }

    return body.data || [];
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`[cricketProvider] Request timed out for endpoint: ${endpoint}`);
    } else {
      console.error(`[cricketProvider] Fetch error for ${endpoint}:`, err.message);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Clean team strings from cricScore (e.g. "Pakistan [PAK]" -> { name: "Pakistan", short: "PAK" })
 */
function parseTeamString(str, fallback = "Team") {
  if (!str) return { name: fallback, short: fallback.slice(0, 3).toUpperCase() };
  const trimmed = str.trim();
  const bracketMatch = trimmed.match(/^(.*?)\s*\[(.*?)\]$/);
  if (bracketMatch) {
    const name = bracketMatch[1].trim();
    const short = bracketMatch[2].trim().toUpperCase();
    return { name, short };
  }
  return { name: trimmed, short: trimmed.slice(0, 3).toUpperCase() };
}

/**
 * Parse cricket score line (e.g. "168/8 (20)" or "97/2 (10.5)") into structured stats
 */
function parseScoreStats(scoreStr) {
  if (!scoreStr) return null;
  const m = scoreStr.match(/(\d+)(?:\/(\d+))?\s*(?:\(([\d.]+)\s*(?:ov)?\))?/i);
  if (m) {
    const runs = parseInt(m[1], 10);
    const wickets = m[2] !== undefined ? parseInt(m[2], 10) : 0;
    const overs = m[3] ? parseFloat(m[3]) : null;
    const runRate = overs && overs > 0 ? parseFloat((runs / overs).toFixed(2)) : null;
    return { runs, wickets, overs, runRate };
  }
  return null;
}

/**
 * Normalize cricScore endpoint items
 */
export function normalizeCricScoreMatch(m) {
  const t1 = parseTeamString(m.t1, "Team 1");
  const t2 = parseTeamString(m.t2, "Team 2");

  // Determine status from ms field ('live' | 'result' | 'fixture')
  let status = "UPCOMING";
  if (m.ms === "live") status = "LIVE";
  else if (m.ms === "result") status = "COMPLETED";
  else if (m.ms === "fixture") status = "UPCOMING";
  else if (m.status?.toLowerCase().includes("won") || m.status?.toLowerCase().includes("drawn")) status = "COMPLETED";
  else if (m.status?.toLowerCase().includes("need") || m.status?.toLowerCase().includes("opt to")) status = "LIVE";

  // Score extraction
  const scoreHome = m.t1s || null;
  const scoreAway = m.t2s || null;

  // Run rates & match statistics
  const t1Stats = parseScoreStats(scoreHome);
  const t2Stats = parseScoreStats(scoreAway);

  // Active run rate
  const activeStats = t2Stats || t1Stats;
  let requiredRunRate = null;
  if (status === "LIVE" && m.status) {
    const needMatch = m.status.match(/need\s+(\d+)\s+runs\s+(?:in|off)\s+(\d+)\s+balls/i);
    if (needMatch) {
      const runsNeeded = parseInt(needMatch[1], 10);
      const ballsLeft = parseInt(needMatch[2], 10);
      if (ballsLeft > 0) {
        requiredRunRate = parseFloat(((runsNeeded / ballsLeft) * 6).toFixed(2));
      }
    }
  }

  return {
    provider: "cricket",
    externalId: String(m.id),
    sport: "cricket",
    competition: m.series || "International Cricket",
    competitionCountry: "",
    competitionLogo: null,
    status,
    kickoffAt: m.dateTimeGMT || null,
    homeTeam: t1.name,
    homeShort: t1.short,
    homeLogo: m.t1img || null,
    awayTeam: t2.name,
    awayShort: t2.short,
    awayLogo: m.t2img || null,
    scoreHome,
    scoreAway,
    statusDetail:
      status === "LIVE"
        ? m.status || "Match In Progress"
        : status === "COMPLETED"
        ? m.status || "Match Ended"
        : m.status || "Upcoming Match",
    venue: null,
    events: [],
    stats: activeStats
      ? {
          runRate: activeStats.runRate,
          requiredRunRate,
          homeRuns: t1Stats?.runs ?? null,
          homeWickets: t1Stats?.wickets ?? null,
          homeOvers: t1Stats?.overs ?? null,
          awayRuns: t2Stats?.runs ?? null,
          awayWickets: t2Stats?.wickets ?? null,
          awayOvers: t2Stats?.overs ?? null,
          partnership: null,
        }
      : null,
    extra: {
      matchType: m.matchType || "cricket",
      series: m.series || null,
      rawStatus: m.status || null,
      inningsNote: scoreHome && scoreAway ? "2 innings recorded" : scoreHome ? "1st innings" : null,
    },
    lastFetchedAt: new Date().toISOString(),
  };
}

/**
 * Normalize currentMatches / matches endpoint items
 */
export function normalizeCricketMatch(m) {
  const teams = m.teams || [];
  const teamInfo = m.teamInfo || [];

  const homeRaw = teams[0] || teamInfo[0]?.name || "Team A";
  const awayRaw = teams[1] || teamInfo[1]?.name || "Team B";

  const t1 = parseTeamString(homeRaw);
  const t2 = parseTeamString(awayRaw);

  const homeLogo = teamInfo.find((t) => t.name === homeRaw)?.img || null;
  const awayLogo = teamInfo.find((t) => t.name === awayRaw)?.img || null;

  // Status calculation
  let status = "UPCOMING";
  const s = (m.status || "").toLowerCase();
  if (m.matchStarted && !m.matchEnded) {
    status = "LIVE";
  } else if (m.matchEnded || s.includes("won") || s.includes("tied") || s.includes("drawn") || s.includes("no result")) {
    status = "COMPLETED";
  } else if (s.includes("live") || s.includes("in progress")) {
    status = "LIVE";
  } else if (s.includes("postponed") || s.includes("cancelled")) {
    status = "POSTPONED";
  } else {
    status = "UPCOMING";
  }

  const scoreArr = m.score || [];
  const formatScore = (s) => (s ? `${s.r}/${s.w} (${s.o} ov)` : null);

  const homeScoreObj = scoreArr.find((s) => (s.inning || "").toLowerCase().includes(t1.name.slice(0, 3).toLowerCase()));
  const awayScoreObj = scoreArr.find((s) => (s.inning || "").toLowerCase().includes(t2.name.slice(0, 3).toLowerCase()));

  const scoreHome = homeScoreObj ? formatScore(homeScoreObj) : scoreArr[0] ? formatScore(scoreArr[0]) : null;
  const scoreAway = awayScoreObj ? formatScore(awayScoreObj) : scoreArr[1] ? formatScore(scoreArr[1]) : null;

  const currentRunRate = scoreArr[0]?.r && scoreArr[0]?.o ? parseFloat((scoreArr[0].r / parseFloat(scoreArr[0].o)).toFixed(2)) : null;

  return {
    provider: "cricket",
    externalId: String(m.id),
    sport: "cricket",
    competition: m.name || m.series_id || "International Cricket",
    competitionCountry: "",
    competitionLogo: null,
    status,
    kickoffAt: m.dateTimeGMT || m.date || null,
    homeTeam: t1.name,
    homeShort: t1.short,
    homeLogo,
    awayTeam: t2.name,
    awayShort: t2.short,
    awayLogo,
    scoreHome,
    scoreAway,
    statusDetail:
      status === "LIVE"
        ? m.status || "Live in progress"
        : status === "COMPLETED"
        ? m.status || "Match Ended"
        : m.status || "Scheduled",
    venue: m.venue || null,
    events: [],
    stats: currentRunRate
      ? {
          runRate: currentRunRate,
          requiredRunRate: null,
          partnership: null,
        }
      : null,
    extra: {
      matchType: m.matchType || null,
      series: m.series_id || null,
      tossWinner: m.tossChoice || null,
      inningsNote: scoreArr.length > 0 ? `${scoreArr.length} innings recorded` : null,
    },
    lastFetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch cricket scores using the primary /cricScore endpoint
 * which gives up to 130 live, completed, and fixture matches.
 */
export async function fetchCricScore() {
  try {
    const raw = await apiFetch("cricScore");
    return raw.map(normalizeCricScoreMatch);
  } catch (err) {
    console.warn("[cricket] cricScore fetch error:", err.message);
    return [];
  }
}

/**
 * Fetch currently active / recent cricket matches.
 */
export async function fetchCurrentCricket() {
  const [cricScores, current] = await Promise.allSettled([
    fetchCricScore(),
    apiFetch("currentMatches").then((raw) => raw.map(normalizeCricketMatch)),
  ]);

  const scores = cricScores.status === "fulfilled" ? cricScores.value : [];
  const curr = current.status === "fulfilled" ? current.value : [];

  // Merge with priority to cricScores (which has up-to-date live/result status)
  const seen = new Set();
  const merged = [];

  for (const m of scores) {
    seen.add(m.externalId);
    merged.push(m);
  }

  for (const m of curr) {
    if (!seen.has(m.externalId)) {
      seen.add(m.externalId);
      merged.push(m);
    }
  }

  return merged;
}

/**
 * Fetch upcoming cricket matches.
 */
export async function fetchUpcomingCricket() {
  try {
    const raw = await apiFetch("matches", { offset: 0 });
    const now = new Date();
    return raw
      .map(normalizeCricketMatch)
      .filter((m) => m.status === "UPCOMING" && m.kickoffAt && new Date(m.kickoffAt) > now);
  } catch (err) {
    console.warn("[cricket] upcoming fetch error:", err.message);
    return [];
  }
}

/**
 * Fetch a specific match by ID (for match detail page).
 */
export async function fetchCricketMatchById(externalId) {
  try {
    const raw = await apiFetch("match_info", { id: externalId });
    if (!raw || (Array.isArray(raw) && raw.length === 0)) return null;
    const match = Array.isArray(raw) ? raw[0] : raw;
    return normalizeCricketMatch(match);
  } catch {
    return null;
  }
}