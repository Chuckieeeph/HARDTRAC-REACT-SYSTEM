import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 4000),
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_HOST: process.env.DB_HOST || "127.0.0.1",
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD ?? "",
  DB_NAME: process.env.DB_NAME || "hardtrac_db",
  JWT_SECRET: process.env.JWT_SECRET || "dev_only_change_me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  // Brute-force protection (login)
  TRUST_PROXY: String(process.env.TRUST_PROXY || "").toLowerCase() === "true",
  LOGIN_MAX_ATTEMPTS: Number(process.env.LOGIN_MAX_ATTEMPTS || 8),
  LOGIN_WINDOW_SEC: Number(process.env.LOGIN_WINDOW_SEC || 60),
  LOGIN_LOCK_SEC: Number(process.env.LOGIN_LOCK_SEC || 10 * 60)
};
