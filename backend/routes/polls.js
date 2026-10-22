// backend/routes/polls.js
// Match polls backed by persistent database.

import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { getPolls, votePoll } from "../lib/db.js";

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
