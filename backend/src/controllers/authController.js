import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { getUserByUsername } from "../models/userModel.js";
import { createLoginRateLimiter } from "../utils/loginRateLimit.js";

const loginLimiter = createLoginRateLimiter({
  maxAttempts: env.LOGIN_MAX_ATTEMPTS,
  windowSec: env.LOGIN_WINDOW_SEC,
  lockSec: env.LOGIN_LOCK_SEC
});

function getClientIp(req) {
  if (env.TRUST_PROXY) {
    const xff = req.headers["x-forwarded-for"];
    if (typeof xff === "string" && xff.trim()) return xff.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
}

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.validated.body;
  const clientIp = getClientIp(req);

  const pre = loginLimiter.check(clientIp, username);
  if (pre.locked) {
    res.set("Retry-After", String(pre.retryAfterSec));
    return res.status(429).json({ message: "Too many login attempts. Please try again later." });
  }

  const user = await getUserByUsername(username);
  if (!user || user.status !== "active") {
    const r = loginLimiter.fail(clientIp, username);
    if (r.locked) {
      res.set("Retry-After", String(r.retryAfterSec));
      return res.status(429).json({ message: "Too many login attempts. Please try again later." });
    }
    throw httpError(401, "Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const r = loginLimiter.fail(clientIp, username);
    if (r.locked) {
      res.set("Retry-After", String(r.retryAfterSec));
      return res.status(429).json({ message: "Too many login attempts. Please try again later." });
    }
    throw httpError(401, "Invalid credentials");
  }

  loginLimiter.success(clientIp, username);

  const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });

  return res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role, fullName: user.full_name }
  });
});

export const me = asyncHandler(async (req, res) => {
  return res.json({ user: req.user });
});
