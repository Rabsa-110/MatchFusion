import { Router } from "express";
import { players, getPlayerById } from "../data/players.js";

const router = Router();

router.get("/", (req, res) => {
  const { sport } = req.query;
  const result = sport ? players.filter((p) => p.sport === sport) : players;
  res.json({ success: true, count: result.length, players: result });
});

router.get("/:id", (req, res) => {
  const player = getPlayerById(req.params.id);
  if (!player) return res.status(404).json({ success: false, message: "Player not found" });
  res.json({ success: true, player });
});

export default router;