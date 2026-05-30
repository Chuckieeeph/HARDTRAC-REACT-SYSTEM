-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 24, 2026 at 07:44 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hardtrac_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `action` varchar(60) NOT NULL,
  `entity_type` varchar(60) NOT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `created_at`) VALUES
(1, 1, 'create', 'user', 3, '{\"username\":\"Cashier 2\",\"role\":\"cashier\"}', '2026-05-16 02:00:58'),
(2, 1, 'create', 'product', 4, '{\"id\":4,\"name\":\"LED Bulb 24W\",\"category_id\":3,\"supplier_id\":1,\"sku\":\"SKU-LED-24W\",\"barcode_value\":\"BC-000005\",\"rfid_value\":\"RFID-000005\",\"description\":\"Light Bulb\",\"unit\":\"box\",\"cost_price\":\"100.00\",\"selling_price\":\"120.00\",\"current_stock\":10,\"reorder_level\":4,\"status\":\"active\",\"created_at\":\"2026-05-16T10:08:46.000Z\",\"updated_at\":\"2026-05-16T10:08:46.000Z\",\"category_name\":\"Electrical\",\"supplier_name\":\"MVS Main Supplier\",\"stock_status\":\"in-stock\"}', '2026-05-16 02:08:46'),
(3, 1, 'stock_adjustment', 'product', 4, '{\"adjustmentType\":\"subtract\",\"quantity\":1,\"reason\":\"Bulok na item\"}', '2026-05-16 02:23:47'),
(4, 1, 'stock_adjustment', 'product', 2, '{\"adjustmentType\":\"subtract\",\"quantity\":10,\"reason\":\"bulok gi item\"}', '2026-05-16 02:42:17'),
(5, 2, 'sale_created', 'sale', 1, NULL, '2026-05-16 02:45:10'),
(6, 1, 'archive', 'product', 4, NULL, '2026-05-16 02:52:26'),
(7, 1, 'archive', 'product', 4, NULL, '2026-05-16 02:52:33'),
(8, 1, 'update', 'product', 4, '{\"id\":4,\"name\":\"LED Bulb 24W\",\"category_id\":3,\"supplier_id\":1,\"sku\":\"SKU-LED-24W\",\"barcode_value\":\"BC-000005\",\"rfid_value\":\"RFID-000005\",\"description\":\"Light Bulb\",\"unit\":\"box\",\"cost_price\":\"100.00\",\"selling_price\":\"120.00\",\"current_stock\":7,\"reorder_level\":4,\"status\":\"active\",\"created_at\":\"2026-05-16T10:08:46.000Z\",\"updated_at\":\"2026-05-16T10:52:49.000Z\",\"category_name\":\"Electrical\",\"supplier_name\":\"MVS Main Supplier\",\"stock_status\":\"in-stock\"}', '2026-05-16 02:52:49'),
(9, 1, 'archive', 'product', 4, NULL, '2026-05-16 02:52:53'),
(10, 1, 'update', 'product', 4, '{\"id\":4,\"name\":\"LED Bulb 24W\",\"category_id\":3,\"supplier_id\":1,\"sku\":\"SKU-LED-24W\",\"barcode_value\":\"BC-000005\",\"rfid_value\":\"RFID-000005\",\"description\":\"Light Bulb\",\"unit\":\"box\",\"cost_price\":\"100.00\",\"selling_price\":\"120.00\",\"current_stock\":7,\"reorder_level\":4,\"status\":\"active\",\"created_at\":\"2026-05-16T10:08:46.000Z\",\"updated_at\":\"2026-05-16T10:53:00.000Z\",\"category_name\":\"Electrical\",\"supplier_name\":\"MVS Main Supplier\",\"stock_status\":\"in-stock\"}', '2026-05-16 02:53:00'),
(11, 1, 'archive', 'product', 4, NULL, '2026-05-16 02:53:23'),
(12, 1, 'stock_adjustment', 'product', 2, '{\"adjustmentType\":\"add\",\"quantity\":3,\"reason\":\"New Delivery\"}', '2026-05-16 02:54:27'),
(13, 1, 'password_reset', 'user', 3, NULL, '2026-05-16 02:58:26'),
(14, 1, 'stock_adjustment', 'product', 4, '{\"adjustmentType\":\"subtract\",\"quantity\":2,\"reason\":\"bulok\"}', '2026-05-16 03:08:10'),
(15, 1, 'update', 'product', 4, '{\"id\":4,\"name\":\"LED Bulb 24W\",\"category_id\":3,\"supplier_id\":1,\"sku\":\"SKU-LED-24W\",\"barcode_value\":\"BC-000005\",\"rfid_value\":\"RFID-000005\",\"description\":\"Light Bulb\",\"unit\":\"box\",\"cost_price\":\"100.00\",\"selling_price\":\"120.00\",\"current_stock\":5,\"reorder_level\":4,\"status\":\"active\",\"created_at\":\"2026-05-16T10:08:46.000Z\",\"updated_at\":\"2026-05-16T16:00:18.000Z\",\"category_name\":\"Electrical\",\"supplier_name\":\"MVS Main Supplier\",\"stock_status\":\"in-stock\"}', '2026-05-16 08:00:18'),
(16, 1, 'archive', 'product', 4, NULL, '2026-05-16 08:06:25'),
(17, 3, 'sale_created', 'sale', 2, NULL, '2026-05-16 08:11:37'),
(18, 3, 'sale_created', 'sale', 3, NULL, '2026-05-16 08:25:05'),
(19, 1, 'stock_adjustment', 'product', 16, '{\"adjustmentType\":\"subtract\",\"quantity\":27,\"reason\":\"Transport\"}', '2026-05-16 08:30:17'),
(20, 1, 'archive', 'product', 16, NULL, '2026-05-16 08:31:31'),
(21, 1, 'update', 'product', 16, '{\"id\":16,\"name\":\"Paint Brush 2\\\"\",\"category_id\":4,\"supplier_id\":1,\"sku\":\"SKU-BRUSH-2IN\",\"barcode_value\":\"BC-000016\",\"rfid_value\":\"RFID-000016\",\"description\":\"Paint brush 2 inch\",\"unit\":\"pc\",\"cost_price\":\"28.00\",\"selling_price\":\"45.00\",\"current_stock\":0,\"reorder_level\":10,\"status\":\"active\",\"created_at\":\"2026-05-16T16:08:43.000Z\",\"updated_at\":\"2026-05-16T16:31:52.000Z\",\"category_name\":\"Paint\",\"supplier_name\":\"MVS Main Supplier\",\"stock_status\":\"out-of-stock\"}', '2026-05-16 08:31:52');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Fasteners', '2026-05-16 01:56:37', '2026-05-16 01:56:37'),
(2, 'Plumbing', '2026-05-16 01:56:37', '2026-05-16 01:56:37'),
(3, 'Electrical', '2026-05-16 01:56:37', '2026-05-16 01:56:37'),
(4, 'Paint', '2026-05-16 01:56:37', '2026-05-16 01:56:37'),
(5, 'Tools', '2026-05-16 01:56:37', '2026-05-16 01:56:37'),
(6, 'Building Materials', '2026-05-30 00:00:00', '2026-05-30 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_movements`
--

CREATE TABLE `inventory_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `movement_type` enum('sale','manual_add','adjustment','init') NOT NULL,
  `qty_change` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `reference_type` varchar(30) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `performed_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_movements`
--

INSERT INTO `inventory_movements` (`id`, `product_id`, `movement_type`, `qty_change`, `reason`, `reference_type`, `reference_id`, `performed_by`, `created_at`) VALUES
(1, 4, 'adjustment', -1, 'Bulok na item', 'manual', NULL, 1, '2026-05-16 02:23:47'),
(2, 2, 'adjustment', -10, 'bulok gi item', 'manual', NULL, 1, '2026-05-16 02:42:17'),
(3, 3, 'sale', -2, 'Sale deduction', 'sale', 1, 2, '2026-05-16 02:45:10'),
(4, 4, 'sale', -2, 'Sale deduction', 'sale', 1, 2, '2026-05-16 02:45:10'),
(5, 2, 'sale', -3, 'Sale deduction', 'sale', 1, 2, '2026-05-16 02:45:10'),
(6, 2, 'manual_add', 3, 'New Delivery', 'manual', NULL, 1, '2026-05-16 02:54:27'),
(7, 4, 'adjustment', -2, 'bulok', 'manual', NULL, 1, '2026-05-16 03:08:10'),
(8, 16, 'sale', -3, 'Sale deduction', 'sale', 2, 3, '2026-05-16 08:11:37'),
(9, 7, 'sale', -1, 'Sale deduction', 'sale', 2, 3, '2026-05-16 08:11:37'),
(10, 1, 'sale', -25, 'Sale deduction', 'sale', 3, 3, '2026-05-16 08:25:05'),
(11, 16, 'adjustment', -27, 'Transport', 'manual', NULL, 1, '2026-05-16 08:30:17');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(160) NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `supplier_id` int(10) UNSIGNED DEFAULT NULL,
  `sku` varchar(60) NOT NULL,
  `barcode_value` varchar(80) DEFAULT NULL,
  `rfid_value` varchar(80) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `unit` varchar(40) DEFAULT NULL,
  `cost_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `current_stock` int(11) NOT NULL DEFAULT 0,
  `reorder_level` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category_id`, `supplier_id`, `sku`, `barcode_value`, `rfid_value`, `description`, `unit`, `cost_price`, `selling_price`, `current_stock`, `reorder_level`, `status`, `created_at`, `updated_at`) VALUES
(1, 'GI Wire 16ga', 1, 1, 'SKU-GIWIRE-16', 'BC-000001', 'RFID-000001', 'General-purpose GI wire', 'roll', 120.00, 150.00, 0, 5, 'active', '2026-05-16 01:56:37', '2026-05-16 08:25:05'),
(2, 'PVC Pipe 1/2\"', 2, 2, 'SKU-PVC-12', 'BC-000002', 'RFID-000002', 'PVC pipe 1/2 inch', 'pc', 35.00, 50.00, 30, 10, 'active', '2026-05-16 01:56:37', '2026-05-16 02:54:27'),
(3, 'LED Bulb 9W', 3, 1, 'SKU-LED-9W', 'BC-000003', 'RFID-000003', 'Energy-saving LED bulb', 'pc', 60.00, 95.00, 6, 10, 'active', '2026-05-16 01:56:37', '2026-05-16 02:45:10'),
(4, 'LED Bulb 24W', 3, 1, 'SKU-LED-24W', 'BC-000005', 'RFID-000005', 'Light Bulb', 'box', 100.00, 120.00, 5, 4, 'inactive', '2026-05-16 02:08:46', '2026-05-16 08:06:25'),
(5, 'LED Bulb 12W', 3, 1, 'SKU-LED-12W', 'BC-000004', 'RFID-000004', 'Energy-saving LED bulb 12W', 'pc', 75.00, 110.00, 12, 10, 'active', '2026-05-16 08:08:43', '2026-05-16 08:08:43'),
(6, 'Extension Cord 5m', 3, 2, 'SKU-EXT-5M', 'BC-000006', 'RFID-000006', 'Heavy-duty extension cord 5 meters', 'pc', 120.00, 165.00, 15, 5, 'active', '2026-05-16 08:08:43', '2026-05-16 08:08:43'),
(7, 'Circuit Breaker 20A', 3, 1, 'SKU-CB-20A', 'BC-000007', 'RFID-000007', 'Mini circuit breaker 20A', 'pc', 95.00, 135.00, 19, 6, 'active', '2026-05-16 08:08:43', '2026-05-16 08:11:37'),
(8, 'Teflon Tape', 2, 2, 'SKU-TEFLON', 'BC-000008', 'RFID-000008', 'PTFE thread seal tape', 'pc', 8.00, 15.00, 80, 20, 'active', '2026-05-16 08:08:43', '2026-05-16 08:08:43'),
(9, 'PVC Elbow 1/2\"', 2, 2, 'SKU-PVC-ELBOW-12', 'BC-000009', 'RFID-000009', 'PVC elbow fitting 1/2 inch', 'pc', 6.00, 10.00, 120, 30, 'active', '2026-05-16 08:08:43', '2026-05-16 08:08:43'),
(10, 'Hammer 16oz', 5, 1, 'SKU-HAMMER-16', 'BC-000010', 'RFID-000010', 'Claw hammer 16oz', 'pc', 160.00, 220.00, 10, 3, 'active', '2026-05-16 08:08:43', '2026-05-16 08:08:43'),
(11, 'Screwdriver Set (6pcs)', 5, 2, 'SKU-SCREW-SET-6', 'BC-000011', 'RFID-000011', 'Phillips & flat screwdriver set', 'set', 180.00, 250.00, 8, 3, 'active', '2026-05-16 08:08:43', '2026-05-16 08:08:43'),
(12, 'Adjustable Wrench 10\"', 5, 1, 'SKU-WRENCH-10', 'BC-000012', 'RFID-000012', 'Adjustable wrench 10 inch', 'pc', 210.00, 295.00, 7, 2, 'active', '2026-05-16 08:08:43', '2026-05-16 08:08:43'),
(13, 'Common Nails 2\" (1kg)', 1, 2, 'SKU-NAILS-2-1KG', 'BC-000013', 'RFID-000013', 'Common nails 2 inch, 1kg pack', 'pack', 65.00, 95.00, 18, 6, 'active', '2026-05-16 08:08:43', '2026-05-16 08:08:43'),
(14, 'Wood Screws 1\" (100pcs)', 1, 1, 'SKU-SCREWS-1-100', 'BC-000014', 'RFID-000014', 'Wood screws 1 inch, 100pcs', 'box', 55.00, 85.00, 22, 8, 'active', '2026-05-16 08:08:43', '2026-05-16 08:08:43'),
(15, 'Flat Latex Paint White (1L)', 4, 2, 'SKU-PAINT-WHITE-1L', 'BC-000015', 'RFID-000015', 'Flat latex paint, white, 1 liter', 'can', 180.00, 245.00, 14, 4, 'active', '2026-05-16 08:08:43', '2026-05-16 08:08:43'),
(16, 'Paint Brush 2\"', 4, 1, 'SKU-BRUSH-2IN', 'BC-000016', 'RFID-000016', 'Paint brush 2 inch', 'pc', 28.00, 45.00, 0, 10, 'active', '2026-05-16 08:08:43', '2026-05-16 08:31:52'),
(17, 'Doorknob Set', 6, 2, 'SKU-DOORKNOB-SET', 'BC-000017', 'RFID-000017', 'Stainless steel doorknob set', 'set', 140.00, 195.00, 18, 6, 'active', '2026-05-30 00:00:00', '2026-05-30 00:00:00'),
(18, 'Iron Sheet 8ft', 6, 1, 'SKU-IRON-SHEET-8FT', 'BC-000018', 'RFID-000018', 'Corrugated iron sheet 8 feet', 'sheet', 320.00, 420.00, 24, 8, 'active', '2026-05-30 00:00:00', '2026-05-30 00:00:00'),
(19, 'Door Hinge 4in', 6, 2, 'SKU-DOOR-HINGE-4IN', 'BC-000019', 'RFID-000019', 'Heavy-duty door hinge 4 inch', 'pair', 25.00, 40.00, 60, 15, 'active', '2026-05-30 00:00:00', '2026-05-30 00:00:00'),
(20, 'Aluminum Roof Nail', 6, 1, 'SKU-ROOF-NAIL', 'BC-000020', 'RFID-000020', 'Aluminum roofing nails', 'pack', 18.00, 30.00, 90, 20, 'active', '2026-05-30 00:00:00', '2026-05-30 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cashier_id` int(10) UNSIGNED NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cash_received` decimal(10,2) NOT NULL DEFAULT 0.00,
  `change_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `cashier_id`, `subtotal`, `discount_amount`, `total_amount`, `cash_received`, `change_amount`, `created_at`) VALUES
(1, 2, 580.00, 0.00, 580.00, 600.00, 20.00, '2026-05-16 02:45:10'),
(2, 3, 270.00, 0.00, 270.00, 1000.00, 730.00, '2026-05-16 08:11:37'),
(3, 3, 3750.00, 0.00, 3750.00, 4000.00, 250.00, '2026-05-16 08:25:05');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `qty` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `line_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `qty`, `unit_price`, `line_total`, `created_at`) VALUES
(1, 1, 3, 2, 95.00, 190.00, '2026-05-16 02:45:10'),
(2, 1, 4, 2, 120.00, 240.00, '2026-05-16 02:45:10'),
(3, 1, 2, 3, 50.00, 150.00, '2026-05-16 02:45:10'),
(4, 2, 16, 3, 45.00, 135.00, '2026-05-16 08:11:37'),
(5, 2, 7, 1, 135.00, 135.00, '2026-05-16 08:11:37'),
(6, 3, 1, 25, 150.00, 3750.00, '2026-05-16 08:25:05');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `contact_person` varchar(120) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `phone`, `email`, `address`, `created_at`, `updated_at`) VALUES
(1, 'MVS Main Supplier', 'Supplier Rep', '0917-000-0000', 'supplier@example.com', 'Local City', '2026-05-16 01:56:37', '2026-05-16 01:56:37'),
(2, 'Hardware Wholesale Co.', 'Wholesale Rep', '0917-111-1111', 'wholesale@example.com', 'Local City', '2026-05-16 01:56:37', '2026-05-16 01:56:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','cashier') NOT NULL DEFAULT 'cashier',
  `full_name` varchar(120) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `full_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2a$10$3zMGZWQFMPINNtpgg4Wl2.nqdn3JnKxztkPJUBMvciTsD8l5lqZPS', 'admin', 'System Admin', 'active', '2026-05-16 01:56:37', '2026-05-16 01:56:37'),
(2, 'cashier', '$2a$10$G7a32POYgE/HCW.RiJ49vOUIkV2ZZu5AqKEVyGGL2Hd.IRosegE3W', 'cashier', 'Default Cashier', 'active', '2026-05-16 01:56:37', '2026-05-16 01:56:37'),
(3, 'Cashier 2', '$2a$10$ILyS0J3ZaV15owrjD3//b.N3v24rzokOElWdx2hbog/J23EjW2nFe', 'cashier', 'Eleah Camille', 'active', '2026-05-16 02:00:58', '2026-05-16 02:58:26');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_created` (`created_at`),
  ADD KEY `idx_audit_user` (`user_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_categories_name` (`name`);

--
-- Indexes for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_movements_product` (`product_id`),
  ADD KEY `idx_movements_created` (`created_at`),
  ADD KEY `fk_movements_user` (`performed_by`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_products_sku` (`sku`),
  ADD UNIQUE KEY `uq_products_barcode` (`barcode_value`),
  ADD UNIQUE KEY `uq_products_rfid` (`rfid_value`),
  ADD KEY `idx_products_name` (`name`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_supplier` (`supplier_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sales_created` (`created_at`),
  ADD KEY `idx_sales_cashier` (`cashier_id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sale_items_sale` (`sale_id`),
  ADD KEY `idx_sale_items_product` (`product_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_suppliers_name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `fk_movements_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movements_user` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `fk_sales_cashier` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `fk_sale_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
