import jwt from "jsonwebtoken";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is missing in production");
    }
    return "dev_secret_change_me";
  }
  return secret;
}

// Verifies the "Authorization: Bearer <token>" header and attaches the
// decoded payload to req.user. Used to protect routes like POST /api/posts.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Missing authentication token" });
  }

  try {
    const secret = getSecret();
    req.user = jwt.verify(token, secret);
    next();
  } catch (err) {
    if (err.message.includes("JWT_SECRET environment variable")) {
      console.error("[auth] Critical configuration error:", err.message);
      return res.status(500).json({ success: false, message: "Server authentication misconfigured" });
    }
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

// Optionally attaches user if token is present and valid
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const secret = getSecret();
    req.user = jwt.verify(token, secret);
  } catch {
    req.user = null;
  }
  next();
}
