import { Router } from "express";
import { teams, getTeamById } from "../data/teams.js";

const router = Router();

router.get("/", (req, res) => {
  const { sport } = req.query;
  const result = sport ? teams.filter((t) => t.sport === sport) : teams;
  res.json({ success: true, count: result.length, teams: result });
});

router.get("/:id", (req, res) => {
  const team = getTeamById(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: "Team not found" });
  res.json({ success: true, team });
});

export default router;
