import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { getUserById } from "../models/userModel.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await getUserById(payload.userId);
    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = { id: user.id, role: user.role, username: user.username };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

