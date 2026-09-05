import { Router } from "express";
import { matches, getMatchById } from "../data/matches.js";

const router = Router();

// GET /api/matches?sport=football&status=live
router.get("/", (req, res) => {
  const { sport, status } = req.query;
  let result = matches;
  if (sport) result = result.filter((m) => m.sport === sport);
  if (status) result = result.filter((m) => m.status === status);
  res.json({ success: true, count: result.length, matches: result });
});

// GET /api/matches/:id
router.get("/:id", (req, res) => {
  const match = getMatchById(req.params.id);
  if (!match) return res.status(404).json({ success: false, message: "Match not found" });
  res.json({ success: true, match });
});

export default router;
