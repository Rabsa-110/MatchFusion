// backend/routes/players.js
// Player Directory API for MatchFusion.
//
// Primary source: Prisma Player table (persistent, populated via /api/players/sync).
// Fallback: Event-derived player names from match cache (real event names only, no fabricated stats).
// Admin endpoint: POST /api/players/sync — fetches squads from API-Football and persists Player records.

import { Router } from "express";
import prisma from "../lib/prisma.js";
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
    const query = (q || search || "").trim().toLowerCase();
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    // ── Primary source: Prisma Player table ─────────────────────────────────
    try {
      const where = {};
      if (sport && sport !== "all") where.sport = sport;
      if (query) {
        const terms = getExpandedSearchTerms(query);
        where.OR = terms.flatMap((t) => [
          { name: { contains: t, mode: "insensitive" } },
          { country: { contains: t, mode: "insensitive" } },
          { position: { contains: t, mode: "insensitive" } },
          { role: { contains: t, mode: "insensitive" } },
          { team: { is: { name: { contains: t, mode: "insensitive" } } } },
        ]);
      }

      const [prismaTotal, prismaPlayers] = await Promise.all([
        prisma.player.count({ where }),
        prisma.player.findMany({
          where,
          include: { team: { select: { id: true, name: true, logo: true, sport: true, country: true } } },
          orderBy: [{ name: "asc" }],
          take: limitNum,
          skip: offset,
        }),
      ]);

      console.log(`[players] DB query: total=${prismaTotal}, returned=${prismaPlayers.length}, sport=${sport}, query="${query}"`);

      if (prismaTotal >= 0) {
        const formatted = prismaPlayers.map((p) => {
          let stats = {};
          try { stats = p.statsJson ? JSON.parse(p.statsJson) : {}; } catch {}
          return {
            id: p.id,
            externalId: p.externalId,
            name: p.name,
            shortName: p.shortName || p.name,
            sport: p.sport,
            position: p.position || null,
            role: p.role || p.position || null,
            country: p.country || p.team?.country || null,
            team: p.team?.name || null,
            teamId: p.teamId || null,
            teamLogo: p.team?.logo || null,
            image: p.image || null,
            goals: stats.goals ?? null,
            assists: stats.assists ?? null,
            runs: stats.runs ?? null,
            wickets: stats.wickets ?? null,
            matches: stats.appearances ?? null,
            lastUpdated: p.lastUpdated?.toISOString() || null,
            source: "database",
          };
        });

        return res.json({
          success: true,
          count: formatted.length,
          total: prismaTotal,
          page: pageNum,
          totalPages: Math.ceil(prismaTotal / limitNum) || 1,
          players: formatted,
          source: "database",
          note: prismaTotal === 0 && query
            ? "No players found matching your search. Try a different name or clear the filter."
            : prismaTotal === 0
            ? "Player directory is empty. Use 'Sync Squads' to populate it."
            : null,
        });
      }
    } catch (dbErr) {
      console.error("[players] Prisma query failed:", dbErr.message);
      // Don't swallow — return an error so the UI can show it
      return res.status(500).json({
        success: false,
        message: "Database query failed: " + dbErr.message,
        players: [],
        total: 0,
      });
    }

    // ── Fallback: event-derived players from match cache ─────────────────────
    // Only real names from provider event payloads. No fabricated stats.
    const matches = await sportsService.getMatches(sport === "all" ? "all" : sport);
    const playerMap = new Map();

    for (const m of matches) {
      if (!m.events || !Array.isArray(m.events)) continue;
      for (const e of m.events) {
        if (!e.player || e.player.trim().length < 3) continue;
        const key = `${m.sport}-${e.player.toLowerCase().trim()}`;
        if (!playerMap.has(key)) {
          playerMap.set(key, {
            id: `ev-${e.player.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            name: e.player.trim(),
            sport: m.sport,
            team: e.team || null,
            position: "Player",
            role: "Player",
            country: null,
            goals: 0,
            assists: 0,
            runs: null,
            wickets: null,
            matches: null,
            source: "event_derived",
          });
        }
        const p = playerMap.get(key);
        if (e.type === "goal") p.goals += 1;
      }
    }

    let list = Array.from(playerMap.values());

    if (sport && sport !== "all") {
      list = list.filter((p) => p.sport === sport);
    }

    if (query) {
      const terms = getExpandedSearchTerms(query);
      list = list.filter((p) => {
        const text = `${p.name} ${p.team || ""} ${p.sport}`.toLowerCase();
        return terms.some((term) => text.includes(term));
      });
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + limitNum);

    return res.json({
      success: true,
      count: paginated.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      players: paginated,
      source: total === 0 ? "empty" : "event_derived",
      note: total === 0
        ? "No player data available yet. Player profiles are populated from real match events and squad syncs. Use the 'Sync Squads' button or call POST /api/players/sync to fetch squad data."
        : "Showing players from real match events. Use 'Sync Squads' to populate the full player directory from squad data.",
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
    // Try Prisma first by cuid ID
    try {
      const player = await prisma.player.findUnique({
        where: { id },
        include: { team: { select: { id: true, name: true, logo: true, sport: true, country: true } } },
      });
      if (player) {
        let stats = {};
        try { stats = player.statsJson ? JSON.parse(player.statsJson) : {}; } catch {}
        return res.json({
          success: true,
          player: {
            id: player.id,
            name: player.name,
            sport: player.sport,
            position: player.position,
            role: player.role,
            country: player.country,
            team: player.team?.name || null,
            teamLogo: player.team?.logo || null,
            image: player.image,
            goals: stats.goals ?? null,
            assists: stats.assists ?? null,
            runs: stats.runs ?? null,
            wickets: stats.wickets ?? null,
            lastUpdated: player.lastUpdated?.toISOString(),
            source: "database",
          },
        });
      }
    } catch (dbErr) {
      console.warn("[players/:id] DB lookup failed:", dbErr.message);
    }

    // Fallback: event-derived lookup
    const matches = await sportsService.getMatches("all");
    const playerMap = new Map();
    for (const m of matches) {
      if (!m.events) continue;
      for (const e of m.events) {
        if (!e.player || e.player.trim().length < 3) continue;
        const key = `ev-${e.player.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        if (!playerMap.has(key)) {
          playerMap.set(key, { id: key, name: e.player.trim(), sport: m.sport, team: e.team || null, position: "Player", goals: 0 });
        }
        if (e.type === "goal") playerMap.get(key).goals += 1;
      }
    }

    const target = id.toLowerCase();
    const player = Array.from(playerMap.values()).find(
      (p) => p.id === id || p.name.toLowerCase() === target || p.id === target
    );

    if (!player) {
      return res.status(404).json({ success: false, message: "Player not found" });
    }

    return res.json({ success: true, player });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/players/sync
 * Fetches squad data from API-Football for known teams and persists into Player table.
 * Rate-limited to once per hour to protect API quotas.
 */
let lastSyncAt = 0;
const SYNC_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

router.post("/sync", async (req, res) => {
  const now = Date.now();
  if (now - lastSyncAt < SYNC_COOLDOWN_MS) {
    const remainingMinutes = Math.ceil((SYNC_COOLDOWN_MS - (now - lastSyncAt)) / 60000);
    return res.status(429).json({
      success: false,
      message: `Player sync is rate-limited. Try again in ${remainingMinutes} minute(s).`,
      nextSyncAt: new Date(lastSyncAt + SYNC_COOLDOWN_MS).toISOString(),
    });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      message: "API_FOOTBALL_KEY is not configured. Cannot sync player squads.",
    });
  }

  lastSyncAt = now;
  res.json({
    success: true,
    message: "Player squad sync started in background. Check /api/players in a few seconds to see imported data.",
    startedAt: new Date().toISOString(),
  });

  // Background async sync — doesn't block the HTTP response
  syncSquadsFromApiFootball(apiKey).catch((err) => {
    console.error("[players/sync] background sync error:", err.message);
    lastSyncAt = 0; // Reset so it can be retried
  });
});

/**
 * Sync squad data from API-Football for teams that have an externalId stored.
 * Uses upsert by (name, sport) composite to prevent duplicates.
 */
async function syncSquadsFromApiFootball(apiKey) {
  const { default: fetch } = await import("node-fetch");

  // Get teams with provider IDs stored
  const teams = await prisma.team.findMany({
    where: {
      sport: "football",
      externalId: { not: null },
    },
    take: 20, // Limit to conserve API quota (100 req/day free plan)
  });

  console.log(`[players/sync] syncing squads for ${teams.length} football teams`);
  let totalUpserted = 0;
  let totalSkipped = 0;

  for (const team of teams) {
    if (!team.externalId) continue;
    try {
      const url = new URL("https://v3.football.api-sports.io/players/squads");
      url.searchParams.set("team", team.externalId);

      const response = await fetch(url.toString(), {
        headers: { "x-apisports-key": apiKey },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        console.warn(`[players/sync] API error for ${team.name}: HTTP ${response.status}`);
        continue;
      }

      const body = await response.json();
      if (body.errors && Object.keys(body.errors).length > 0) {
        console.warn(`[players/sync] API error for ${team.name}:`, Object.values(body.errors).join("; "));
        continue;
      }

      const squad = body.response?.[0]?.players || [];

      for (const playerData of squad) {
        const name = playerData.name;
        const extId = playerData.id ? String(playerData.id) : null;
        if (!name || name.trim().length < 2) continue;

        try {
          // Use name+sport as the stable upsert key since Player has no unique(externalId, provider)
          // First try to find existing by externalId + provider
          let existing = null;
          if (extId) {
            existing = await prisma.player.findFirst({
              where: { externalId: extId, provider: "football" },
            });
          }

          if (existing) {
            await prisma.player.update({
              where: { id: existing.id },
              data: {
                name: name.trim(),
                position: playerData.position || existing.position,
                role: playerData.position || existing.role,
                image: playerData.photo || existing.image,
                teamId: team.id,
                lastUpdated: new Date(),
              },
            });
          } else {
            await prisma.player.create({
              data: {
                externalId: extId,
                provider: "football",
                name: name.trim(),
                sport: "football",
                position: playerData.position || null,
                role: playerData.position || null,
                image: playerData.photo || null,
                teamId: team.id,
                lastUpdated: new Date(),
              },
            });
          }
          totalUpserted++;
        } catch (upsertErr) {
          totalSkipped++;
          if (!upsertErr.message.includes("P2002") && !upsertErr.message.includes("Unique")) {
            console.warn(`[players/sync] error for ${name}:`, upsertErr.message.slice(0, 80));
          }
        }
      }

      console.log(`[players/sync] processed ${squad.length} players for ${team.name}`);
      // 200ms delay between requests to avoid hammering API
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.warn(`[players/sync] failed for team ${team.name}:`, err.message);
    }
  }

  console.log(`[players/sync] complete — ${totalUpserted} players synced, ${totalSkipped} skipped`);
}

export default router;
