import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { getUserByUsername } from "../models/userModel.js";

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.validated.body;
  const user = await getUserByUsername(username);
  if (!user || user.status !== "active") throw httpError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw httpError(401, "Invalid credentials");

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

