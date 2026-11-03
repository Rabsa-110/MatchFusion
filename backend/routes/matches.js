// backend/routes/matches.js
// Serves normalized match data from sportsService (real APIs + DB cache).

import { Router } from "express";
import * as sportsService from "../services/sportsService.js";
import * as footballProvider from "../services/footballProvider.js";
import { matchMatchesSearch, getCompetitionPriority } from "../lib/aliases.js";

const router = Router();

const VALID_SPORTS = ["all", "football", "cricket"];

/**
 * GET /api/matches
 * Query params:
 *   - sport: "all" | "football" | "cricket"
 *   - status: "all" | "live" | "upcoming" | "completed"
 *   - q / search: text search across team names, aliases, competitions
 *   - sortBy: "priority" (default) | "live" | "recent" | "upcoming" | "completed"
 *   - limit: maximum count
 */
router.get("/", async (req, res) => {
  const {
    sport = "all",
    status = "all",
    q,
    search,
    sortBy = "priority",
    limit,
  } = req.query;

  if (!VALID_SPORTS.includes(sport)) {
    return res.status(400).json({
      success: false,
      message: `Invalid sport. Use: ${VALID_SPORTS.join(", ")}`,
    });
  }

  try {
    let matches = await sportsService.getMatches(sport);

    // 1. Status filter
    if (status && status !== "all") {
      const upperStatus = status.toUpperCase();
      matches = matches.filter((m) => (m.status || "").toUpperCase() === upperStatus);
    }

    // 2. Alias-aware search filter
    const query = q || search;
    if (query && query.trim()) {
      matches = matches.filter((m) => matchMatchesSearch(m, query.trim()));
    }

    // 3. Priority & Sorting
    matches.sort((a, b) => {
      // Always put LIVE matches first unless user explicitly requested another sort
      const isLiveA = a.status === "LIVE";
      const isLiveB = b.status === "LIVE";
      if (isLiveA && !isLiveB) return -1;
      if (!isLiveA && isLiveB) return 1;

      if (sortBy === "priority") {
        // Sort by competition priority tier
        const prioA = getCompetitionPriority(a.competition, a.sport);
        const prioB = getCompetitionPriority(b.competition, b.sport);
        if (prioB !== prioA) return prioB - prioA;

        // Within same priority: sort by kickoff
        if (a.kickoffAt && b.kickoffAt) {
          return new Date(b.kickoffAt) - new Date(a.kickoffAt);
        }
        return 0;
      }

      if (sortBy === "recent" || sortBy === "completed") {
        if (!a.kickoffAt) return 1;
        if (!b.kickoffAt) return -1;
        return new Date(b.kickoffAt) - new Date(a.kickoffAt);
      }

      if (sortBy === "upcoming") {
        if (!a.kickoffAt) return 1;
        if (!b.kickoffAt) return -1;
        return new Date(a.kickoffAt) - new Date(b.kickoffAt);
      }

      // Default standard order: LIVE -> UPCOMING -> COMPLETED
      const order = { LIVE: 0, UPCOMING: 1, COMPLETED: 2, POSTPONED: 3, CANCELLED: 4 };
      const diff = (order[a.status] ?? 5) - (order[b.status] ?? 5);
      if (diff !== 0) return diff;

      if (a.status === "COMPLETED") {
        return new Date(b.kickoffAt || 0) - new Date(a.kickoffAt || 0);
      }
      return new Date(a.kickoffAt || 0) - new Date(b.kickoffAt || 0);
    });

    if (limit) {
      matches = matches.slice(0, parseInt(limit, 10));
    }

    const cacheStatus = sportsService.getCacheStatus();
    const relevantCache =
      sport === "all"
        ? cacheStatus
        : {
            [sport]: cacheStatus[sport],
            refreshIntervalMinutes: cacheStatus.refreshIntervalMinutes,
          };

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
      message: "Failed to fetch matches. Please check connection and try again.",
      error: err.message,
    });
  }
});

/**
 * POST /api/matches/refresh
 * Manually trigger a refresh (rate-limited to protect provider quotas).
 */
router.post("/refresh", async (req, res) => {
  const { sport = "all" } = req.body || {};
  try {
    const matches = await sportsService.forceRefresh(sport);
    return res.json({
      success: true,
      count: matches.length,
      message: "Sports data refreshed successfully",
      timestamp: new Date().toISOString(),
    });
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
