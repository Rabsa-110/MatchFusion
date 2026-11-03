// backend/routes/polls.js
// Match polls backed by persistent database.

import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { getPolls, votePoll, createPollInDb } from "../lib/db.js";

const router = Router();

/**
 * GET /api/polls
 * Query params: matchStatus ("ALL" | "LIVE" | "UPCOMING" | "COMPLETED")
 */
router.get("/", optionalAuth, async (req, res) => {
  const { matchStatus = "ALL" } = req.query;
  const currentUserId = req.user?.sub || null;

  try {
    const polls = await getPolls(matchStatus, currentUserId);
    return res.json({ success: true, count: polls.length, polls });
  } catch (err) {
    console.error("[polls] list error:", err.message);
    return res.status(500).json({ success: false, message: err.message, polls: [] });
  }
});

/**
 * POST /api/polls — Create a new poll (linked to a real match or general discussion)
 * Body: { question, options: string[], matchId?, matchStatus? }
 */
router.post("/", requireAuth, async (req, res) => {
  const { question, options, matchId, matchStatus = "ALL" } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, message: "Poll question is required" });
  }

  if (!options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ success: false, message: "At least 2 options are required" });
  }

  if (options.length > 6) {
    return res.status(400).json({ success: false, message: "A maximum of 6 options is allowed" });
  }

  const cleanOptions = options.map((o) => String(o).trim()).filter(Boolean);
  if (cleanOptions.length < 2) {
    return res.status(400).json({ success: false, message: "All options must be non-empty" });
  }

  try {
    const poll = await createPollInDb({
      question: question.trim(),
      options: cleanOptions,
      matchId: matchId || null,
      matchStatus,
      creatorId: req.user.sub,
    });

    return res.status(201).json({ success: true, poll });
  } catch (err) {
    console.error("[polls] create error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to create poll: " + err.message });
  }
});

/**
 * POST /api/polls/:id/vote — Vote for an option
 * Body: { optionId }
 */
router.post("/:id/vote", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { optionId } = req.body;
  const userId = req.user.sub;

  if (!optionId) {
    return res.status(400).json({ success: false, message: "optionId is required" });
  }

  try {
    const result = await votePoll({ pollId: id, optionId, userId });
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Return updated poll data
    const polls = await getPolls("ALL", userId);
    const updatedPoll = polls.find((p) => p.id === id);

    return res.json({ success: true, poll: updatedPoll });
  } catch (err) {
    console.error("[polls] vote error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
