import { db } from "../config/db.js";

async function ensureCategory(name) {
  await db.query(
    `
    INSERT INTO categories (name)
    VALUES (?)
    ON DUPLICATE KEY UPDATE name = VALUES(name)
    `,
    [name]
  );
}

async function ensureSupplier({ name, contactPerson = null, phone = null, email = null, address = null }) {
  await db.query(
    `
    INSERT INTO suppliers (name, contact_person, phone, email, address)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      contact_person = VALUES(contact_person),
      phone = VALUES(phone),
      email = VALUES(email),
      address = VALUES(address)
    `,
    [name, contactPerson, phone, email, address]
  );
}

async function getCategoryId(name) {
  const [rows] = await db.query("SELECT id FROM categories WHERE name = ? LIMIT 1", [name]);
  return rows[0]?.id || null;
}

async function getSupplierId(name) {
  const [rows] = await db.query("SELECT id FROM suppliers WHERE name = ? LIMIT 1", [name]);
  return rows[0]?.id || null;
}

async function productExists({ sku, barcodeValue, rfidValue }) {
  const [rows] = await db.query(
    `
    SELECT id
    FROM products
    WHERE sku = ?
       OR (? IS NOT NULL AND barcode_value = ?)
       OR (? IS NOT NULL AND rfid_value = ?)
    LIMIT 1
    `,
    [sku, barcodeValue, barcodeValue, rfidValue, rfidValue]
  );
  return Boolean(rows[0]?.id);
}

async function insertProduct(p) {
  const categoryId = p.category ? await getCategoryId(p.category) : null;
  const supplierId = p.supplier ? await getSupplierId(p.supplier) : null;

  await db.query(
    `
    INSERT INTO products
      (name, category_id, supplier_id, sku, barcode_value, rfid_value, description, unit, cost_price, selling_price, current_stock, reorder_level, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      p.name,
      categoryId,
      supplierId,
      p.sku,
      p.barcodeValue ?? null,
      p.rfidValue ?? null,
      p.description ?? null,
      p.unit ?? null,
      Number(p.costPrice ?? 0),
      Number(p.sellingPrice ?? 0),
      Number(p.currentStock ?? 0),
      Number(p.reorderLevel ?? 0),
      p.status ?? "active"
    ]
  );
}

async function run() {
  // Ensure base reference data exists
  const categories = ["Fasteners", "Plumbing", "Electrical", "Paint", "Tools"];
  for (const c of categories) await ensureCategory(c);

  const suppliers = [
    {
      name: "MVS Main Supplier",
      contactPerson: "Supplier Rep",
      phone: "0917-000-0000",
      email: "supplier@example.com",
      address: "Local City"
    },
    {
      name: "Hardware Wholesale Co.",
      contactPerson: "Wholesale Rep",
      phone: "0917-111-1111",
      email: "wholesale@example.com",
      address: "Local City"
    }
  ];
  for (const s of suppliers) await ensureSupplier(s);

  // IMPORTANT: Do not add/duplicate the user's new product:
  // LED Bulb 24W  SKU-LED-24W  BC-000005  RFID-000005
  const products = [
    {
      name: "LED Bulb 12W",
      category: "Electrical",
      supplier: "MVS Main Supplier",
      sku: "SKU-LED-12W",
      barcodeValue: "BC-000004",
      rfidValue: "RFID-000004",
      description: "Energy-saving LED bulb 12W",
      unit: "pc",
      costPrice: 75.0,
      sellingPrice: 110.0,
      currentStock: 12,
      reorderLevel: 10
    },
    {
      name: "Extension Cord 5m",
      category: "Electrical",
      supplier: "Hardware Wholesale Co.",
      sku: "SKU-EXT-5M",
      barcodeValue: "BC-000006",
      rfidValue: "RFID-000006",
      description: "Heavy-duty extension cord 5 meters",
      unit: "pc",
      costPrice: 120.0,
      sellingPrice: 165.0,
      currentStock: 15,
      reorderLevel: 5
    },
    {
      name: "Circuit Breaker 20A",
      category: "Electrical",
      supplier: "MVS Main Supplier",
      sku: "SKU-CB-20A",
      barcodeValue: "BC-000007",
      rfidValue: "RFID-000007",
      description: "Mini circuit breaker 20A",
      unit: "pc",
      costPrice: 95.0,
      sellingPrice: 135.0,
      currentStock: 20,
      reorderLevel: 6
    },
    {
      name: "Teflon Tape",
      category: "Plumbing",
      supplier: "Hardware Wholesale Co.",
      sku: "SKU-TEFLON",
      barcodeValue: "BC-000008",
      rfidValue: "RFID-000008",
      description: "PTFE thread seal tape",
      unit: "pc",
      costPrice: 8.0,
      sellingPrice: 15.0,
      currentStock: 80,
      reorderLevel: 20
    },
    {
      name: "PVC Elbow 1/2\"",
      category: "Plumbing",
      supplier: "Hardware Wholesale Co.",
      sku: "SKU-PVC-ELBOW-12",
      barcodeValue: "BC-000009",
      rfidValue: "RFID-000009",
      description: "PVC elbow fitting 1/2 inch",
      unit: "pc",
      costPrice: 6.0,
      sellingPrice: 10.0,
      currentStock: 120,
      reorderLevel: 30
    },
    {
      name: "Hammer 16oz",
      category: "Tools",
      supplier: "MVS Main Supplier",
      sku: "SKU-HAMMER-16",
      barcodeValue: "BC-000010",
      rfidValue: "RFID-000010",
      description: "Claw hammer 16oz",
      unit: "pc",
      costPrice: 160.0,
      sellingPrice: 220.0,
      currentStock: 10,
      reorderLevel: 3
    },
    {
      name: "Screwdriver Set (6pcs)",
      category: "Tools",
      supplier: "Hardware Wholesale Co.",
      sku: "SKU-SCREW-SET-6",
      barcodeValue: "BC-000011",
      rfidValue: "RFID-000011",
      description: "Phillips & flat screwdriver set",
      unit: "set",
      costPrice: 180.0,
      sellingPrice: 250.0,
      currentStock: 8,
      reorderLevel: 3
    },
    {
      name: "Adjustable Wrench 10\"",
      category: "Tools",
      supplier: "MVS Main Supplier",
      sku: "SKU-WRENCH-10",
      barcodeValue: "BC-000012",
      rfidValue: "RFID-000012",
      description: "Adjustable wrench 10 inch",
      unit: "pc",
      costPrice: 210.0,
      sellingPrice: 295.0,
      currentStock: 7,
      reorderLevel: 2
    },
    {
      name: "Common Nails 2\" (1kg)",
      category: "Fasteners",
      supplier: "Hardware Wholesale Co.",
      sku: "SKU-NAILS-2-1KG",
      barcodeValue: "BC-000013",
      rfidValue: "RFID-000013",
      description: "Common nails 2 inch, 1kg pack",
      unit: "pack",
      costPrice: 65.0,
      sellingPrice: 95.0,
      currentStock: 18,
      reorderLevel: 6
    },
    {
      name: "Wood Screws 1\" (100pcs)",
      category: "Fasteners",
      supplier: "MVS Main Supplier",
      sku: "SKU-SCREWS-1-100",
      barcodeValue: "BC-000014",
      rfidValue: "RFID-000014",
      description: "Wood screws 1 inch, 100pcs",
      unit: "box",
      costPrice: 55.0,
      sellingPrice: 85.0,
      currentStock: 22,
      reorderLevel: 8
    },
    {
      name: "Flat Latex Paint White (1L)",
      category: "Paint",
      supplier: "Hardware Wholesale Co.",
      sku: "SKU-PAINT-WHITE-1L",
      barcodeValue: "BC-000015",
      rfidValue: "RFID-000015",
      description: "Flat latex paint, white, 1 liter",
      unit: "can",
      costPrice: 180.0,
      sellingPrice: 245.0,
      currentStock: 14,
      reorderLevel: 4
    },
    {
      name: "Paint Brush 2\"",
      category: "Paint",
      supplier: "MVS Main Supplier",
      sku: "SKU-BRUSH-2IN",
      barcodeValue: "BC-000016",
      rfidValue: "RFID-000016",
      description: "Paint brush 2 inch",
      unit: "pc",
      costPrice: 28.0,
      sellingPrice: 45.0,
      currentStock: 30,
      reorderLevel: 10
    }
  ];

  let inserted = 0;
  let skipped = 0;

  for (const p of products) {
    // Safety: skip any product that matches the user-provided LED Bulb 24W identifiers.
    const isUserNew =
      p.name === "LED Bulb 24W" || p.sku === "SKU-LED-24W" || p.barcodeValue === "BC-000005" || p.rfidValue === "RFID-000005";
    if (isUserNew) {
      skipped += 1;
      continue;
    }

    // Avoid duplicates by sku/barcode/rfid.
    // If already exists, skip.
    // (If you want to update prices/stock later, do it in a separate admin flow.)
    // eslint-disable-next-line no-await-in-loop
    const exists = await productExists(p);
    if (exists) {
      skipped += 1;
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await insertProduct(p);
    inserted += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Products added. Inserted: ${inserted}, Skipped (already exists / protected): ${skipped}`);
}

run()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });

