import { Router } from "express";
import * as sportsService from "../services/sportsService.js";

const router = Router();

router.get("/", async (req, res) => {
  const { sport = "all" } = req.query;
  try {
    const list = await sportsService.getTeams(sport);
    res.json({ success: true, count: list.length, teams: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, teams: [] });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const list = await sportsService.getTeams("all");
    const team = list.find((t) => t.id === req.params.id || t.name.toLowerCase() === req.params.id.toLowerCase());
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
