// backend/routes/auth.js
// Real auth with dual-mode persistence (Prisma PostgreSQL or Local Persistent DB).

import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../lib/db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

/** POST /api/auth/register */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with that email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, passwordHash });

    const token = jwt.sign(
      { sub: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[auth] register error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Registration failed: " + err.message,
    });
  }
});

/** POST /api/auth/login */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { sub: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[auth] login error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Login failed: " + err.message,
    });
  }
});

/** GET /api/auth/me — returns current user from JWT */
router.get("/me", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Not authenticated" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({
      success: true,
      user: { id: payload.sub, name: payload.name, email: payload.email },
    });
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
});

export default router;
