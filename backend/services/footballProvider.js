// backend/services/footballProvider.js
//
// Fetches football match data from API-Football (v3.football.api-sports.io).
// Free plan: 100 requests/day. This module is called only through sportsService
// which enforces caching — never called directly from routes.
//
// Docs: https://www.api-football.com/documentation-v3

import fetch from "node-fetch";

const BASE_URL = "https://v3.football.api-sports.io";
const getApiKey = () => process.env.API_FOOTBALL_KEY;

// Leagues we care about (free plan covers many leagues)
const TARGET_LEAGUES = [39, 140, 135, 78, 2, 3]; // PL, La Liga, Serie A, Bundesliga, UCL, UEL

/** Build request headers */
function headers() {
  return {
    "x-apisports-key": getApiKey(),
    "Content-Type": "application/json",
  };
}

/**
 * Low-level fetch with timeout and error handling.
 * Never logs the full URL (to avoid key exposure in logs).
 */
async function apiFetch(path, params = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY not configured");
  }

  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url.toString(), {
      headers: headers(),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`API-Football HTTP ${res.status}`);
    }

    const body = await res.json();

    // Provider-level errors
    if (body.errors && Object.keys(body.errors).length > 0) {
      const errMsg = Object.values(body.errors).join("; ");
      throw new Error(`API-Football error: ${errMsg}`);
    }

    return body.response || [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Map API-Football fixture status to internal status.
 * https://www.api-football.com/documentation-v3#operation/get-fixtures
 */
export function mapStatus(shortStatus) {
  const live = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"];
  const completed = ["FT", "AET", "PEN"];
  const cancelled = ["CANC", "ABD", "WO"];
  const postponed = ["PST", "SUSP", "TBD"];

  if (live.includes(shortStatus)) return "LIVE";
  if (completed.includes(shortStatus)) return "COMPLETED";
  if (cancelled.includes(shortStatus)) return "CANCELLED";
  if (postponed.includes(shortStatus)) return "POSTPONED";
  return "UPCOMING";
}

/**
 * Normalize a raw API-Football fixture object into MatchFusion's internal format.
 */
export function normalizeFixture(f) {
  const status = mapStatus(f.fixture?.status?.short);
  const homeGoals = f.goals?.home;
  const awayGoals = f.goals?.away;

  return {
    provider: "football",
    externalId: String(f.fixture?.id),
    sport: "football",
    competition: f.league?.name || "Unknown",
    competitionCountry: f.league?.country || "",
    competitionLogo: f.league?.logo || null,
    status,
    kickoffAt: f.fixture?.date || null,
    homeTeam: f.teams?.home?.name || "Home",
    homeShort: (f.teams?.home?.name || "HOM").slice(0, 3).toUpperCase(),
    homeLogo: f.teams?.home?.logo || null,
    awayTeam: f.teams?.away?.name || "Away",
    awayShort: (f.teams?.away?.name || "AWY").slice(0, 3).toUpperCase(),
    awayLogo: f.teams?.away?.logo || null,
    scoreHome: homeGoals !== null && homeGoals !== undefined ? String(homeGoals) : null,
    scoreAway: awayGoals !== null && awayGoals !== undefined ? String(awayGoals) : null,
    statusDetail:
      status === "LIVE"
        ? `${f.fixture?.status?.elapsed || ""}' ${f.fixture?.status?.long || ""}`
        : status === "COMPLETED"
        ? f.fixture?.status?.long || "Full Time"
        : null,
    venue: f.fixture?.venue?.name || null,
    venueCicy: f.fixture?.venue?.city || null,
    events: [],   // populated by fetchFixtureEvents if needed
    stats: null,  // populated by fetchFixtureStats if needed
    extra: {
      referee: f.fixture?.referee || null,
      round: f.league?.round || null,
    },
    lastFetchedAt: new Date().toISOString(),
  };
}

/** GET /fixtures?live=all — currently live matches */
export async function fetchLiveFootball() {
  const raw = await apiFetch("/fixtures", { live: "all" });
  return raw.map(normalizeFixture);
}

/** GET /fixtures?date=YYYY-MM-DD — today's matches */
export async function fetchTodayFootball() {
  const today = new Date().toISOString().slice(0, 10);
  const raw = await apiFetch("/fixtures", { date: today });
  return raw.map(normalizeFixture);
}

/**
 * Fetch upcoming fixtures for target leagues (next N days).
 * Season 2024 is the last season accessible on the API-Football free plan.
 */
export async function fetchUpcomingFootball(daysAhead = 3) {
  const from = new Date().toISOString().slice(0, 10);
  const toDate = new Date(Date.now() + daysAhead * 86400000).toISOString().slice(0, 10);
  // Free plan: only seasons 2022-2024 are accessible for historical/upcoming endpoints.
  // For current-season upcoming fixtures, the /fixtures?live=all and /fixtures?date= endpoints
  // work without season restriction. We use season 2024 as the base.
  const season = 2024;

  const results = [];
  for (const leagueId of TARGET_LEAGUES.slice(0, 3)) {
    try {
      const raw = await apiFetch("/fixtures", {
        league: leagueId,
        season,
        from,
        to: toDate,
        status: "NS",
      });
      results.push(...raw.map(normalizeFixture));
    } catch (err) {
      console.warn(`[football] upcoming league ${leagueId} error:`, err.message);
    }
  }
  return results;
}

/**
 * Fetch recently completed fixtures.
 * Season 2024 is the last season accessible on the API-Football free plan.
 */
export async function fetchRecentFootball(daysBack = 3) {
  const toDate = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - daysBack * 86400000).toISOString().slice(0, 10);
  // Free plan only allows 2022-2024. Season 2024 covers results through mid-2025
  // depending on competition. Use 2024 as base for historical results.
  const season = 2024;

  const results = [];
  for (const leagueId of TARGET_LEAGUES.slice(0, 3)) {
    try {
      const raw = await apiFetch("/fixtures", {
        league: leagueId,
        season,
        from,
        to: toDate,
        status: "FT",
      });
      results.push(...raw.map(normalizeFixture));
    } catch (err) {
      console.warn(`[football] recent league ${leagueId} error:`, err.message);
    }
  }
  return results;
}

/**
 * Fetch events for a specific fixture (goals, cards, subs).
 * Returns empty array if not on a plan that includes events.
 */
export async function fetchFixtureEvents(externalId) {
  try {
    const raw = await apiFetch("/fixtures/events", { fixture: externalId });
    return raw.map((e) => ({
      minute: e.time?.elapsed ? `${e.time.elapsed}'` : null,
      type: (e.type || "").toLowerCase().includes("goal")
        ? "goal"
        : (e.type || "").toLowerCase().includes("card")
        ? e.detail?.toLowerCase().includes("yellow")
          ? "yellow"
          : "red"
        : "sub",
      team: e.team?.name || "",
      player: e.player?.name || null,
      text: `${e.detail || e.type || "Event"} — ${e.team?.name || ""}`,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch statistics for a specific fixture.
 * Returns null if endpoint not on current plan.
 */
export async function fetchFixtureStats(externalId) {
  try {
    const raw = await apiFetch("/fixtures/statistics", { fixture: externalId });
    if (!raw || raw.length < 2) return null;
    const home = raw[0]?.statistics || [];
    const away = raw[1]?.statistics || [];

    const get = (arr, type) => {
      const item = arr.find((s) => s.type === type);
      return item?.value ?? null;
    };

    return {
      possession: [get(home, "Ball Possession"), get(away, "Ball Possession")],
      shots: [get(home, "Total Shots"), get(away, "Total Shots")],
      shotsOnTarget: [get(home, "Shots on Goal"), get(away, "Shots on Goal")],
      corners: [get(home, "Corner Kicks"), get(away, "Corner Kicks")],
      fouls: [get(home, "Fouls"), get(away, "Fouls")],
    };
  } catch {
    return null;
  }
}
