// backend/routes/teams.js
// Team Directory API for MatchFusion.

import { Router } from "express";
import * as sportsService from "../services/sportsService.js";
import { getExpandedSearchTerms } from "../lib/aliases.js";

const router = Router();

/**
 * GET /api/teams
 * Query params:
 *   - sport: "all" | "football" | "cricket"
 *   - q / search: text search
 *   - page, limit
 */
router.get("/", async (req, res) => {
  const { sport = "all", q, search, page = 1, limit = 50 } = req.query;

  try {
    let list = await sportsService.getTeams(sport);

    // Search filter
    const query = (q || search || "").trim().toLowerCase();
    if (query) {
      const terms = getExpandedSearchTerms(query);
      list = list.filter((t) => {
        const text = `${t.name} ${t.short || ""} ${t.competition || ""} ${t.sport}`.toLowerCase();
        return terms.some((term) => text.includes(term));
      });
    }

    const total = list.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;
    const paginated = list.slice(offset, offset + limitNum);

    return res.json({
      success: true,
      count: paginated.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      teams: paginated,
    });
  } catch (err) {
    console.error("[teams] list error:", err.message);
    return res.status(500).json({ success: false, message: err.message, teams: [] });
  }
});

/**
 * GET /api/teams/:id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const list = await sportsService.getTeams("all");
    const target = id.toLowerCase();
    const team = list.find(
      (t) =>
        t.id === id ||
        t.name.toLowerCase() === target ||
        t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === target
    );

    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    // Attach squad members if available from players directory
    const allPlayers = await sportsService.getPlayers(team.sport);
    const squad = allPlayers.filter(
      (p) => p.team && p.team.toLowerCase().includes(team.name.toLowerCase().slice(0, 5))
    );

    return res.json({
      success: true,
      team: {
        ...team,
        squad: squad.length > 0 ? squad : null,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
