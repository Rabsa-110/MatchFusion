// backend/routes/auth.js
// Authentication routes for MatchFusion (PostgreSQL via Prisma).

import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser, getUserProfileData } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is missing in production environment");
    }
    return "dev_secret_change_me";
  }
  return secret;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /api/auth/register */
router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !name.trim() || !email || !email.trim() || !password) {
    return res.status(400).json({ success: false, message: "Full name, email address, and password are required" });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ success: false, message: "Name must be at least 2 characters long" });
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ success: false, message: "Please enter a valid email address" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  try {
    const existing = await findUserByEmail(email.trim());
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with that email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name: name.trim(), email: email.trim(), passwordHash });

    const secret = getJwtSecret();
    const token = jwt.sign(
      { sub: user.id, name: user.name, email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to MatchFusion.",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[auth] register error:", err.message);
    const isDbUnavailable = err.message.includes("Database");
    return res.status(isDbUnavailable ? 503 : 500).json({
      success: false,
      message: isDbUnavailable
        ? "Database service is temporarily unavailable. Please try again shortly."
        : "Registration failed. Please check your information and try again.",
    });
  }
});

/** POST /api/auth/login */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.trim() || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await findUserByEmail(email.trim());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const secret = getJwtSecret();
    const token = jwt.sign(
      { sub: user.id, name: user.name, email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[auth] login error:", err.message);
    const isDbUnavailable = err.message.includes("Database");
    return res.status(isDbUnavailable ? 503 : 500).json({
      success: false,
      message: isDbUnavailable
        ? "Database service is temporarily unavailable. Please try again shortly."
        : "Login failed. Please check your credentials.",
    });
  }
});

/** GET /api/auth/me — verifies session token and returns fresh user info */
router.get("/me", async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Not authenticated" });

  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret);
    const user = await findUserByEmail(payload.email);
    if (!user) {
      return res.status(401).json({ success: false, message: "User account no longer exists" });
    }

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
});

/** GET /api/auth/profile — returns detailed profile and activity */
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const profile = await getUserProfileData(req.user.sub);
    if (!profile) {
      return res.status(404).json({ success: false, message: "User profile not found" });
    }
    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/auth/logout — client clears token; server confirms invalidation */
router.post("/logout", (req, res) => {
  return res.json({ success: true, message: "Logged out successfully" });
});

export default router;
