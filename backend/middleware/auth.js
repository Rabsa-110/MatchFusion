import jwt from "jsonwebtoken";

// Verifies the "Authorization: Bearer <token>" header and attaches the
// decoded payload to req.user. Used to protect routes like POST /api/posts.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Missing authentication token" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
