// backend/routes/posts.js
// Community posts and discussions backed by persistent database.

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  togglePostReaction,
  getComments,
  createComment,
  deleteComment,
} from "../lib/db.js";

const router = Router();

/**
 * GET /api/posts
 * Query params: matchStatus ("ALL" | "LIVE" | "UPCOMING" | "COMPLETED"), limit, offset, matchTag
 */
router.get("/", async (req, res) => {
  const { limit = "30", offset = "0", matchStatus = "ALL", matchTag } = req.query;

  try {
    const { posts, storage } = await getPosts({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      matchStatus,
      matchTag,
    });

    return res.json({
      success: true,
      count: posts.length,
      storage,
      posts,
    });
  } catch (err) {
    console.error("[posts] list error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load posts: " + err.message,
      posts: [],
    });
  }
});

/**
 * POST /api/posts — protected by JWT
 */
router.post("/", requireAuth, async (req, res) => {
  const { content, matchTag, matchStatus = "ALL" } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: "Post content is required" });
  }

  if (content.trim().length > 2000) {
    return res.status(400).json({ success: false, message: "Post content cannot exceed 2000 characters" });
  }

  try {
    const { post, storage } = await createPost({
      content: content.trim(),
      matchTag: matchTag?.trim() || null,
      matchStatus,
      authorId: req.user.sub,
      authorName: req.user.name,
    });

    return res.status(201).json({
      success: true,
      storage,
      post,
    });
  } catch (err) {
    console.error("[posts] create error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save post: " + err.message,
    });
  }
});

/**
 * PUT /api/posts/:id — edit own post
 */
router.put("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: "Content is required" });
  }

  try {
    const result = await updatePost({ postId: id, authorId: req.user.sub, content: content.trim() });
    if (result.notFound) return res.status(404).json({ success: false, message: "Post not found" });
    if (result.unauthorized) return res.status(403).json({ success: false, message: "You can only edit your own posts" });
    return res.json({ success: true, post: result.post });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/posts/:id — delete own post
 */
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deletePost({ postId: id, authorId: req.user.sub });
    if (result.notFound) return res.status(404).json({ success: false, message: "Post not found" });
    if (result.unauthorized) return res.status(403).json({ success: false, message: "You can only delete your own posts" });
    return res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/posts/:id/react — toggle a like/reaction
 */
router.post("/:id/react", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.sub;

  try {
    const { liked, likes } = await togglePostReaction({ userId, postId: id, type: "like" });
    return res.json({ success: true, liked, likes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/posts/:id/comments — list comments for a post
 */
router.get("/:id/comments", async (req, res) => {
  const { id } = req.params;
  try {
    const comments = await getComments(id);
    return res.json({ success: true, comments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, comments: [] });
  }
});

/**
 * POST /api/posts/:id/comments — add comment to post
 */
router.post("/:id/comments", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: "Comment content is required" });
  }

  if (content.trim().length > 1000) {
    return res.status(400).json({ success: false, message: "Comment cannot exceed 1000 characters" });
  }

  try {
    const comment = await createComment({
      postId: id,
      authorId: req.user.sub,
      authorName: req.user.name,
      content: content.trim(),
    });

    return res.status(201).json({ success: true, comment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/posts/:postId/comments/:commentId — delete own comment
 */
router.delete("/:postId/comments/:commentId", requireAuth, async (req, res) => {
  const { commentId } = req.params;

  try {
    const result = await deleteComment({ commentId, authorId: req.user.sub });
    if (result.notFound) return res.status(404).json({ success: false, message: "Comment not found" });
    if (result.unauthorized) return res.status(403).json({ success: false, message: "You can only delete your own comments" });
    return res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
