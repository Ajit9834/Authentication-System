const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return "dev-only-secret-change-me-please-32chars!!";
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function clearCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return { httpOnly: true, secure: isProd, sameSite: "lax", path: "/" };
}

function createToken(userId) {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: "1d" });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignup({ name, email, password }) {
  if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
    return "Enter a valid name (1–100 characters).";
  }
  if (
    typeof email !== "string" ||
    !EMAIL_RE.test(email.trim().toLowerCase()) ||
    email.trim().length > 255
  ) {
    return "Enter a valid email address.";
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 72) {
    return "Password must be 8–72 characters.";
  }
  return null;
}

// REGISTER — POST /api/auth/signup
async function signup(req, res) {
  try {
    const err = validateSignup(req.body || {});
    if (err) return res.status(400).json({ message: err });

    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const row = await User.createUser({ name, email, passwordHash });
    const user = User.toPublic(row);

    const token = createToken(user.id);
    res.cookie("token", token, cookieOptions());

    return res.status(201).json({ message: "Account created successfully.", user });
  } catch (e) {
    const msg = e && e.message ? e.message : "unknown";
    if (msg.includes("duplicate") || msg.includes("unique") || e.code === "23505") {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    console.error("Signup error:", msg);
    return res.status(500).json({ message: "Unable to create your account." });
  }
}

// LOGIN — POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (
      typeof email !== "string" ||
      !EMAIL_RE.test(String(email).trim().toLowerCase()) ||
      typeof password !== "string" ||
      !password ||
      password.length > 72
    ) {
      return res.status(400).json({ message: "Enter a valid email and password." });
    }

    const normalized = email.trim().toLowerCase();
    const row = await User.findWithPasswordByEmail(normalized);
    if (!row) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = User.toPublic(row);
    const token = createToken(user.id);
    res.cookie("token", token, cookieOptions());

    return res.status(200).json({ message: "Login successful.", user });
  } catch (e) {
    console.error("Login error:", e.message);
    return res.status(500).json({ message: "Unable to log in." });
  }
}

// LOGOUT — POST /api/auth/logout
function logout(req, res) {
  res.clearCookie("token", clearCookieOptions());
  return res.status(200).json({ message: "Logout successful." });
}

// ME — GET /api/auth/me (protect middleware already loaded req.user)
function me(req, res) {
  return res.status(200).json({ user: User.toPublic(req.user) });
}

module.exports = {
  signup,
  login,
  logout,
  me,
  createToken,
  cookieOptions,
  clearCookieOptions,
  getJwtSecret,
  validateSignup,
};
