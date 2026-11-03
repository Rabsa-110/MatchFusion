// backend/tests/auth.test.js
// Unit tests for authentication validation and JWT signing.

import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const TEST_SECRET = "test_super_secure_jwt_secret_32_characters_long";

// ── 1. Password Hashing and Comparison ────────────────────────────────────────
test("bcrypt hashes passwords securely and matches valid plaintext", async () => {
  const plain = "StrongPassword@2026";
  const hash = await bcrypt.hash(plain, 10);

  assert.notEqual(plain, hash);
  assert.ok(hash.startsWith("$2"), "Valid bcrypt hash format");

  const matches = await bcrypt.compare(plain, hash);
  assert.equal(matches, true);

  const wrong = await bcrypt.compare("WrongPassword", hash);
  assert.equal(wrong, false);
});

// ── 2. JWT Generation & Verification ──────────────────────────────────────────
test("JWT sign and verify correctly restores user payload", () => {
  const payload = { sub: "user-123", name: "Alex Morgan", email: "alex@example.com" };
  const token = jwt.sign(payload, TEST_SECRET, { expiresIn: "1h" });

  assert.ok(token.length > 20);

  const decoded = jwt.verify(token, TEST_SECRET);
  assert.equal(decoded.sub, "user-123");
  assert.equal(decoded.name, "Alex Morgan");
  assert.equal(decoded.email, "alex@example.com");
});

test("JWT verification fails on invalid signature", () => {
  const token = jwt.sign({ sub: "user-123" }, TEST_SECRET);
  assert.throws(() => {
    jwt.verify(token, "wrong_secret");
  });
});

// ── 3. Email Validation ───────────────────────────────────────────────────────
test("Email validation regex catches malformed emails", () => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert.ok(regex.test("user@matchfusion.com"));
  assert.ok(regex.test("john.doe@domain.co.uk"));
  assert.equal(regex.test("invalid-email"), false);
  assert.equal(regex.test("user@"), false);
  assert.equal(regex.test("@domain.com"), false);
  assert.equal(regex.test("user@domain"), false);
});

