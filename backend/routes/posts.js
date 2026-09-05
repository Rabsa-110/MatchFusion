import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// TEMPORARY in-memory feed — replace with Prisma Post/Comment/Reaction
// queries once the database is connected (see prisma/schema.prisma).
const posts = [
  {
    id: "p1",
    author: "Rahim",
    content: "Who do you think wins tonight? Barcelona vs Real Madrid feels too close to call.",
    matchTag: "Barcelona vs Real Madrid",
    likes: 24,
    createdAt: new Date().toISOString(),
  },
];

router.get("/", (req, res) => {
  res.json({ success: true, count: posts.length, posts });
});

// Protected: requires a valid JWT from /api/auth/login or /api/auth/register
router.post("/", requireAuth, (req, res) => {
  const { content, matchTag } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: "Post content is required" });
  }
  const post = {
    id: `p_${Date.now()}`,
    author: req.user.name,
    content: content.trim(),
    matchTag: matchTag || null,
    likes: 0,
    createdAt: new Date().toISOString(),
  };
  posts.unshift(post);
  res.status(201).json({ success: true, post });
});

export default router;
