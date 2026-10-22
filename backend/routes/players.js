import { Router } from "express";
import * as sportsService from "../services/sportsService.js";

const router = Router();

router.get("/", async (req, res) => {
  const { sport = "all" } = req.query;
  try {
    const list = await sportsService.getPlayers(sport);
    res.json({ success: true, count: list.length, players: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, players: [] });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const list = await sportsService.getPlayers("all");
    const player = list.find((p) => p.id === req.params.id || p.name.toLowerCase() === req.params.id.toLowerCase());
    if (!player) return res.status(404).json({ success: false, message: "Player not found" });
    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;