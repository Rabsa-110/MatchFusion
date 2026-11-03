// backend/routes/teams.js
// Team Directory API for MatchFusion.
//
// Primary source: Prisma Team table (persisted, 446 records from match sync).
// Fallback: Dynamic derivation from match cache (if DB unavailable).

import { Router } from "express";
import prisma from "../lib/prisma.js";
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

  const query = (q || search || "").trim().toLowerCase();
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  try {
    // ── Primary: Prisma Team table ─────────────────────────────────────────
    let prismaTotal = 0;
    try {
      const where = {};
      if (sport && sport !== "all") where.sport = sport;
      if (query) {
        const terms = getExpandedSearchTerms(query);
        where.OR = terms.flatMap((t) => [
          { name: { contains: t, mode: "insensitive" } },
          { shortName: { contains: t, mode: "insensitive" } },
          { country: { contains: t, mode: "insensitive" } },
          { competition: { contains: t, mode: "insensitive" } },
        ]);
      }

      [prismaTotal] = await Promise.all([prisma.team.count({ where })]);

      if (prismaTotal > 0) {
        const dbTeams = await prisma.team.findMany({
          where,
          include: {
            _count: { select: { players: true } },
          },
          orderBy: [{ name: "asc" }],
          take: limitNum,
          skip: offset,
        });

        // Enrich with match data for recent results / form
        const allMatches = await sportsService.getMatches(sport === "all" ? "all" : sport);

        const teams = dbTeams.map((t) => {
          const teamMatches = allMatches.filter(
            (m) =>
              m.home?.name?.toLowerCase() === t.name.toLowerCase() ||
              m.away?.name?.toLowerCase() === t.name.toLowerCase()
          );

          let wins = 0, draws = 0, losses = 0;
          const form = [];
          const recentMatches = [];

          for (const m of teamMatches) {
            if (recentMatches.length < 5) {
              recentMatches.push({
                id: m.id,
                competition: m.competition,
                status: m.status,
                homeTeam: m.home?.name,
                awayTeam: m.away?.name,
                scoreHome: m.scoreHome,
                scoreAway: m.scoreAway,
                date: m.date,
              });
            }

            if (m.status === "COMPLETED") {
              const isHome = m.home?.name?.toLowerCase() === t.name.toLowerCase();
              const myScore = isHome ? parseInt(m.scoreHome, 10) : parseInt(m.scoreAway, 10);
              const oppScore = isHome ? parseInt(m.scoreAway, 10) : parseInt(m.scoreHome, 10);

              if (!isNaN(myScore) && !isNaN(oppScore)) {
                if (myScore > oppScore) { wins++; if (form.length < 5) form.push("W"); }
                else if (myScore < oppScore) { losses++; if (form.length < 5) form.push("L"); }
                else { draws++; if (form.length < 5) form.push("D"); }
              }
            }
          }

          return {
            id: t.id,
            name: t.name,
            short: t.shortName || t.name.slice(0, 3).toUpperCase(),
            logo: t.logo || null,
            sport: t.sport,
            country: t.country || null,
            competition: t.competition || null,
            externalId: t.externalId || null,
            playerCount: t._count?.players || 0,
            matchesCount: teamMatches.length,
            form: form, // Empty array if no match data — no fabricated W/D/W
            stats: { played: teamMatches.length, won: wins, drawn: draws, lost: losses },
            recentMatches: recentMatches.slice(0, 5),
            lastUpdated: t.lastUpdated?.toISOString() || null,
            source: "database",
          };
        });

        return res.json({
          success: true,
          count: teams.length,
          total: prismaTotal,
          page: pageNum,
          totalPages: Math.ceil(prismaTotal / limitNum) || 1,
          teams,
          source: "database",
        });
      }
    } catch (dbErr) {
      console.warn("[teams] Prisma query failed, falling back to match-derived:", dbErr.message);
    }

    // ── Fallback: dynamic derivation from match cache ────────────────────────
    let list = await sportsService.getTeams(sport === "all" ? "all" : sport);

    if (query) {
      const terms = getExpandedSearchTerms(query);
      list = list.filter((t) => {
        const text = `${t.name} ${t.short || ""} ${t.competition || ""} ${t.sport}`.toLowerCase();
        return terms.some((term) => text.includes(term));
      });
    }

    // Strip fabricated form data
    list = list.map((t) => ({
      ...t,
      form: t.form?.filter((f) => ["W", "L", "D"].includes(f) && t.stats?.played > 0) || [],
      source: "match_derived",
    }));

    const total = list.length;
    const paginated = list.slice(offset, offset + limitNum);

    return res.json({
      success: true,
      count: paginated.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      teams: paginated,
      source: "match_derived",
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
    // Try Prisma first
    try {
      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          players: {
            orderBy: { name: "asc" },
            take: 30,
          },
          _count: { select: { players: true } },
        },
      });

      if (team) {
        const allMatches = await sportsService.getMatches(team.sport);
        const teamMatches = allMatches
          .filter(
            (m) =>
              m.home?.name?.toLowerCase() === team.name.toLowerCase() ||
              m.away?.name?.toLowerCase() === team.name.toLowerCase()
          )
          .slice(0, 10);

        return res.json({
          success: true,
          team: {
            id: team.id,
            name: team.name,
            short: team.shortName || team.name.slice(0, 3).toUpperCase(),
            logo: team.logo,
            sport: team.sport,
            country: team.country,
            competition: team.competition,
            externalId: team.externalId,
            playerCount: team._count?.players || 0,
            squad: team.players.map((p) => ({
              id: p.id,
              name: p.name,
              position: p.position,
              role: p.role,
              image: p.image,
            })),
            recentMatches: teamMatches.map((m) => ({
              id: m.id,
              competition: m.competition,
              status: m.status,
              homeTeam: m.home?.name,
              awayTeam: m.away?.name,
              scoreHome: m.scoreHome,
              scoreAway: m.scoreAway,
              date: m.date,
            })),
            lastUpdated: team.lastUpdated?.toISOString(),
          },
        });
      }
    } catch (dbErr) {
      console.warn("[teams/:id] DB lookup failed:", dbErr.message);
    }

    // Fallback: match-derived team lookup
    const target = id.toLowerCase();
    const list = await sportsService.getTeams("all");
    const team = list.find(
      (t) =>
        t.id === id ||
        t.name.toLowerCase() === target ||
        t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === target
    );

    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    return res.json({
      success: true,
      team: {
        ...team,
        form: team.form?.filter(() => team.stats?.played > 0) || [],
        squad: null, // No squad available from match-derived fallback
        source: "match_derived",
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
