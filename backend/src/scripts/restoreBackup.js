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

  const [userColumns] = await connection.query("SHOW COLUMNS FROM users");
  const userColumnNames = new Set(userColumns.map((column) => column.Field));

  if (!userColumnNames.has("rfid_value")) {
    await connection.query("ALTER TABLE users ADD COLUMN rfid_value VARCHAR(80) NULL AFTER full_name");
  }
  const [userCreateRows] = await connection.query("SHOW CREATE TABLE users");
  const userCreateStatement = userCreateRows[0]?.["Create Table"] || "";
  if (!userCreateStatement.includes("uq_users_rfid")) {
    await connection.query("ALTER TABLE users ADD UNIQUE KEY uq_users_rfid (rfid_value)");
  }
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

  const adminHash = await bcrypt.hash("Admin123!", 10);
  const cashierHash = await bcrypt.hash("Cashier123!", 10);
  const cashier2Hash = await bcrypt.hash("Cashier2123!", 10);
  const headCashierHash = await bcrypt.hash("HeadCashier123!", 10);

  await connection.query(
    `
    INSERT INTO users (username, password_hash, role, full_name, rfid_value, status)
    VALUES ('admin', ?, 'admin', 'System Admin', '0805615836', 'active')
    ON DUPLICATE KEY UPDATE
      password_hash = VALUES(password_hash),
      role = VALUES(role),
      full_name = VALUES(full_name),
      rfid_value = VALUES(rfid_value),
      status = VALUES(status)
    `,
    [adminHash]
  );
  await connection.query(
    `
    INSERT INTO users (username, password_hash, role, full_name, rfid_value, status)
    VALUES ('cashier', ?, 'cashier', 'Cashier', '0807110236', 'active')
    ON DUPLICATE KEY UPDATE
      password_hash = VALUES(password_hash),
      role = VALUES(role),
      full_name = VALUES(full_name),
      rfid_value = VALUES(rfid_value),
      status = VALUES(status)
    `,
    [cashierHash]
  );
  await connection.query(
    `
    INSERT INTO users (username, password_hash, role, full_name, rfid_value, status)
    VALUES ('cashier2', ?, 'cashier', 'Cashier 2', '0805666812', 'active')
    ON DUPLICATE KEY UPDATE
      password_hash = VALUES(password_hash),
      role = VALUES(role),
      full_name = VALUES(full_name),
      rfid_value = VALUES(rfid_value),
      status = VALUES(status)
    `,
    [cashier2Hash]
  );
  await connection.query(
    `
    INSERT INTO users (username, password_hash, role, full_name, rfid_value, status)
    VALUES ('headcashier', ?, 'head-cashier', 'Head Cashier', '0807793948', 'active')
    ON DUPLICATE KEY UPDATE
      password_hash = VALUES(password_hash),
      role = VALUES(role),
      full_name = VALUES(full_name),
      rfid_value = VALUES(rfid_value),
      status = VALUES(status)
    `,
    [headCashierHash]
  );

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
    console.log("Demo accounts ensured: admin, cashier, and headcashier");
  } finally {
    await connection.end();
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
