import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupPath = path.resolve(__dirname, "../../../database/hardtrac_db_backup.sql");

async function dropAllTables(connection) {
  const [tables] = await connection.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
  const tableNames = tables.map((row) => Object.values(row)[0]);

  if (!tableNames.length) return;

  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const tableName of tableNames) {
    await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
  }
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
}

async function ensurePostRestoreSchema(connection) {
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");

  await connection.query(
    "ALTER TABLE users MODIFY role ENUM('admin','cashier','head-cashier') NOT NULL DEFAULT 'cashier'"
  );
  await connection.query(
    "ALTER TABLE inventory_movements MODIFY movement_type ENUM('sale','manual_add','adjustment','void','init') NOT NULL"
  );

  const [salesColumns] = await connection.query("SHOW COLUMNS FROM sales");
  const salesColumnNames = new Set(salesColumns.map((column) => column.Field));

  if (!salesColumnNames.has("voided_at")) {
    await connection.query("ALTER TABLE sales ADD COLUMN voided_at TIMESTAMP NULL DEFAULT NULL AFTER change_amount");
  }
  if (!salesColumnNames.has("voided_by")) {
    await connection.query(
      "ALTER TABLE sales ADD COLUMN voided_by INT UNSIGNED NULL AFTER voided_at"
    );
  }
  if (!salesColumnNames.has("void_reason")) {
    await connection.query("ALTER TABLE sales ADD COLUMN void_reason VARCHAR(255) NULL AFTER voided_by");
  }
  if (!salesColumnNames.has("voided_by")) {
    await connection.query(
      "ALTER TABLE sales ADD CONSTRAINT fk_sales_voided_by FOREIGN KEY (voided_by) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL"
    );
  } else {
    const [foreignKeys] = await connection.query("SHOW CREATE TABLE sales");
    const createStatement = foreignKeys[0]?.["Create Table"] || "";
    if (!createStatement.includes("fk_sales_voided_by")) {
      await connection.query(
        "ALTER TABLE sales ADD CONSTRAINT fk_sales_voided_by FOREIGN KEY (voided_by) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL"
      );
    }
  }

  const [roleRows] = await connection.query("SELECT COUNT(*) AS count FROM users WHERE role = 'head-cashier'");
  if (roleRows[0].count === 0) {
    const passwordHash = await bcrypt.hash("HeadCashier123!", 10);
    await connection.query(
      `
      INSERT INTO users (username, password_hash, role, full_name, status)
      VALUES ('headcashier', ?, 'head-cashier', 'Head Cashier', 'active')
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        role = VALUES(role),
        full_name = VALUES(full_name),
        status = VALUES(status)
      `,
      [passwordHash]
    );
  }

  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
}

async function run() {
  const dump = await fs.readFile(backupPath, "utf8");

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true,
    timezone: "Z"
  });

  try {
    // Drop the current schema so the backup can be restored cleanly.
    await dropAllTables(connection);

    // Restore the phpMyAdmin backup dump.
    await connection.query(dump);

    // Add the newer app-era columns and roles after the import.
    await ensurePostRestoreSchema(connection);

    // eslint-disable-next-line no-console
    console.log(`Backup restored from ${path.relative(process.cwd(), backupPath)}`);
    // eslint-disable-next-line no-console
    console.log("Head cashier account ensured: headcashier / HeadCashier123!");
  } finally {
    await connection.end();
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
