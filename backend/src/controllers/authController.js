import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { getUserByRfid, getUserByUsername } from "../models/userModel.js";
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

function buildAuthPayload(user) {
  const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });

  return {
    token,
    user: { id: user.id, username: user.username, role: user.role, fullName: user.full_name }
  };
}

function handleLockedResponse(res, retryAfterSec) {
  res.set("Retry-After", String(retryAfterSec));
  return res.status(429).json({ message: "Too many login attempts. Please try again later." });
}

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.validated.body;
  const clientIp = getClientIp(req);

  const pre = loginLimiter.check(clientIp, username);
  if (pre.locked) {
    return handleLockedResponse(res, pre.retryAfterSec);
  }

  const user = await getUserByUsername(username);
  if (!user || user.status !== "active") {
    const r = loginLimiter.fail(clientIp, username);
    if (r.locked) return handleLockedResponse(res, r.retryAfterSec);
    throw httpError(401, "Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const r = loginLimiter.fail(clientIp, username);
    if (r.locked) return handleLockedResponse(res, r.retryAfterSec);
    throw httpError(401, "Invalid credentials");
  }

  loginLimiter.success(clientIp, username);
  return res.json(buildAuthPayload(user));
});

export const rfidLogin = asyncHandler(async (req, res) => {
  const { rfidValue } = req.validated.body;
  const clientIp = getClientIp(req);
  const key = `rfid:${rfidValue}`;

  const pre = loginLimiter.check(clientIp, key);
  if (pre.locked) {
    return handleLockedResponse(res, pre.retryAfterSec);
  }

  const user = await getUserByRfid(rfidValue);
  if (!user || user.status !== "active") {
    const r = loginLimiter.fail(clientIp, key);
    if (r.locked) return handleLockedResponse(res, r.retryAfterSec);
    throw httpError(401, "Invalid RFID");
  }

  loginLimiter.success(clientIp, key);
  return res.json(buildAuthPayload(user));
});

export const me = asyncHandler(async (req, res) => {
  return res.json({ user: req.user });
});
