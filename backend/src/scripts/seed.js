import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { db } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readSql(relPath) {
  return fs.readFileSync(path.resolve(__dirname, relPath), "utf8");
}

async function run() {
  const schemaSql = readSql("../../../database/hardtrac_schema.sql");
  const seedSql = readSql("../../../database/seed.sql");

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Split statements by ; on new lines (simple local seed runner)
    for (const chunk of (schemaSql + "\n" + seedSql).split(/;\s*\n/)) {
      const stmt = chunk.trim();
      if (!stmt) continue;
      await connection.query(stmt);
    }

    // Seed default accounts (bcrypt passwords).
    // Credentials for demo/testing:
    // - Admin:   admin / Admin123!
    // - Cashier: cashier / Cashier123!
    const adminHash = await bcrypt.hash("Admin123!", 10);
    const cashierHash = await bcrypt.hash("Cashier123!", 10);

    // Insert if not exists
    await connection.query(
      `
      INSERT INTO users (username, password_hash, role, full_name, status)
      VALUES ('admin', ?, 'admin', 'System Admin', 'active')
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        role = VALUES(role),
        full_name = VALUES(full_name),
        status = VALUES(status)
      `,
      [adminHash]
    );
    await connection.query(
      `
      INSERT INTO users (username, password_hash, role, full_name, status)
      VALUES ('cashier', ?, 'cashier', 'Default Cashier', 'active')
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        role = VALUES(role),
        full_name = VALUES(full_name),
        status = VALUES(status)
      `,
      [cashierHash]
    );

    await connection.commit();
    // eslint-disable-next-line no-console
    console.log("Database schema + seed applied.");
  } catch (err) {
    await connection.rollback();
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  } finally {
    connection.release();
    await db.end();
  }
}

run();
