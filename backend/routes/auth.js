import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

// TEMPORARY in-memory user store.
// The password hashing (bcrypt) and token signing (JWT) below are the real
// mechanisms the proposal calls for — what's temporary is *where the users
// are stored*. Swap this array for Prisma + Postgres once DATABASE_URL is
// configured (see prisma/schema.prisma and PROGRESS.md). Data here resets
// every time the server restarts.
const users = [];

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email and password are required" });
  }
  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ success: false, message: "An account with that email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: `u_${Date.now()}`, name, email, passwordHash };
  users.push(user);

  const token = jwt.sign({ sub: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const token = jwt.sign({ sub: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
});

export default router;
