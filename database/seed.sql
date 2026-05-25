-- Sample seed data for HARDTRAC
-- Users (admin & cashier) are seeded by `backend/src/scripts/seed.js` because passwords must be bcrypt-hashed.

INSERT INTO categories (name) VALUES
('Fasteners'),
('Plumbing'),
('Electrical'),
('Paint'),
('Tools')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('MVS Main Supplier', 'Supplier Rep', '0917-000-0000', 'supplier@example.com', 'Local City'),
('Hardware Wholesale Co.', 'Wholesale Rep', '0917-111-1111', 'wholesale@example.com', 'Local City')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Products (barcode_value / rfid_value are unique, but can be NULL)
INSERT INTO products
  (name, category_id, supplier_id, sku, barcode_value, rfid_value, description, unit, cost_price, selling_price, current_stock, reorder_level, status)
VALUES
  ('GI Wire 16ga', (SELECT id FROM categories WHERE name='Fasteners' LIMIT 1), (SELECT id FROM suppliers WHERE name='MVS Main Supplier' LIMIT 1),
   'SKU-GIWIRE-16', 'BC-000001', 'RFID-000001', 'General-purpose GI wire', 'roll', 120.00, 150.00, 25, 5, 'active'),
  ('PVC Pipe 1/2"', (SELECT id FROM categories WHERE name='Plumbing' LIMIT 1), (SELECT id FROM suppliers WHERE name='Hardware Wholesale Co.' LIMIT 1),
   'SKU-PVC-12', 'BC-000002', 'RFID-000002', 'PVC pipe 1/2 inch', 'pc', 35.00, 50.00, 40, 10, 'active'),
  ('LED Bulb 9W', (SELECT id FROM categories WHERE name='Electrical' LIMIT 1), (SELECT id FROM suppliers WHERE name='MVS Main Supplier' LIMIT 1),
   'SKU-LED-9W', 'BC-000003', 'RFID-000003', 'Energy-saving LED bulb', 'pc', 60.00, 95.00, 8, 10, 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

