// backend/routes/players.js
// Player Directory API for MatchFusion (verified provider match data only).

import { Router } from "express";
import * as sportsService from "../services/sportsService.js";
import { getExpandedSearchTerms } from "../lib/aliases.js";

const router = Router();

/**
 * GET /api/players
 * Query params:
 *   - sport: "all" | "football" | "cricket"
 *   - q / search: player name or team
 *   - page, limit
 */
router.get("/", async (req, res) => {
  const { sport = "all", q, search, page = 1, limit = 50 } = req.query;

  try {
    let list = await sportsService.getPlayers(sport);

    // Filter by search
    const query = (q || search || "").trim().toLowerCase();
    if (query) {
      const terms = getExpandedSearchTerms(query);
      list = list.filter((p) => {
        const text = `${p.name} ${p.team || ""} ${p.role || ""} ${p.position || ""} ${p.sport}`.toLowerCase();
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
      players: paginated,
    });
  } catch (err) {
    console.error("[players] list error:", err.message);
    return res.status(500).json({ success: false, message: err.message, players: [] });
  }
});

/**
 * GET /api/players/:id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const list = await sportsService.getPlayers("all");
    const target = id.toLowerCase();
    const player = list.find(
      (p) =>
        p.id === id ||
        p.name.toLowerCase() === target ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === target
    );

    if (!player) {
      return res.status(404).json({ success: false, message: "Player not found" });
    }

    return res.json({ success: true, player });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
