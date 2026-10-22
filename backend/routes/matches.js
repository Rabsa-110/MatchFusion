// backend/routes/matches.js
// Serves normalized match data from sportsService (real APIs + DB cache).
// Falls back cleanly if providers are unconfigured.

import { Router } from "express";
import * as sportsService from "../services/sportsService.js";
import * as footballProvider from "../services/footballProvider.js";

const router = Router();

const VALID_SPORTS = ["all", "football", "cricket"];
const VALID_STATUSES = ["all", "live", "upcoming", "completed", "LIVE", "UPCOMING", "COMPLETED", "POSTPONED", "CANCELLED"];

/**
 * GET /api/matches
 * Query params: sport (football|cricket|all), status (live|upcoming|completed|all)
 */
router.get("/", async (req, res) => {
  const { sport = "all", status = "all", limit } = req.query;

  if (!VALID_SPORTS.includes(sport)) {
    return res.status(400).json({ success: false, message: `Invalid sport. Use: ${VALID_SPORTS.join(", ")}` });
  }

  try {
    let matches = await sportsService.getMatches(sport);

    // Status filter — normalize to uppercase for comparison
    if (status && status !== "all") {
      const upperStatus = status.toUpperCase();
      matches = matches.filter((m) => m.status.toUpperCase() === upperStatus);
    }

    // Sort: LIVE first, then UPCOMING by kickoff, then COMPLETED newest first
    matches.sort((a, b) => {
      const order = { LIVE: 0, UPCOMING: 1, COMPLETED: 2, POSTPONED: 3, CANCELLED: 4 };
      const diff = (order[a.status] ?? 5) - (order[b.status] ?? 5);
      if (diff !== 0) return diff;
      if (!a.kickoffAt && !b.kickoffAt) return 0;
      if (!a.kickoffAt) return 1;
      if (!b.kickoffAt) return -1;
      const timeSort =
        a.status === "COMPLETED"
          ? new Date(b.kickoffAt) - new Date(a.kickoffAt)
          : new Date(a.kickoffAt) - new Date(b.kickoffAt);
      return timeSort;
    });

    if (limit) {
      matches = matches.slice(0, parseInt(limit, 10));
    }

    const cacheStatus = sportsService.getCacheStatus();
    const relevantCache = sport === "all"
      ? cacheStatus
      : { [sport]: cacheStatus[sport], refreshIntervalMinutes: cacheStatus.refreshIntervalMinutes };

    return res.json({
      success: true,
      count: matches.length,
      matches,
      cache: relevantCache,
    });
  } catch (err) {
    console.error("[matches] list error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch matches. Check API keys in .env",
      error: err.message,
    });
  }
});

/**
 * GET /api/matches/refresh
 * Manually trigger a refresh (rate-limited).
 */
router.post("/refresh", async (req, res) => {
  const { sport = "all" } = req.body || {};
  try {
    const matches = await sportsService.forceRefresh(sport);
    return res.json({ success: true, count: matches.length, message: "Refresh triggered" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/matches/statistics
 * Returns platform-wide statistics derived from real matches.
 */
router.get("/statistics", async (req, res) => {
  try {
    const stats = await sportsService.getPlatformStatistics();
    return res.json({ success: true, ...stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/matches/:id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const match = await sportsService.getMatchById(id);
    if (!match) {
      return res.status(404).json({ success: false, message: "Match not found" });
    }

    // For live football matches, try to enrich with events+stats if not cached
    if (match.sport === "football" && match.status === "LIVE" && !match.events?.length) {
      const [events, stats] = await Promise.allSettled([
        footballProvider.fetchFixtureEvents(match.externalId),
        footballProvider.fetchFixtureStats(match.externalId),
      ]);
      if (events.status === "fulfilled") match.events = events.value;
      if (stats.status === "fulfilled" && stats.value) match.stats = stats.value;
    }

    return res.json({ success: true, match });
  } catch (err) {
    console.error("[matches] detail error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
