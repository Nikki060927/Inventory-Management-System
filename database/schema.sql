-- ============================================================
-- SMART STATIONERY INVENTORY MANAGEMENT SYSTEM
-- Database Schema & Initial Seed Data
-- Database Engine: MySQL 8.0 (InnoDB)
-- ============================================================

CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- ------------------------------------------------------------
-- Drop existing tables in reverse dependency order
-- ------------------------------------------------------------
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS stock_transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS categories;

-- ------------------------------------------------------------
-- 1. CATEGORIES TABLE
-- Stores product classifications (e.g. Pens, Notebooks, etc.)
-- ------------------------------------------------------------
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 2. SUPPLIERS TABLE
-- Stores vendor contact details and status
-- ------------------------------------------------------------
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- Stores stationery product details, pricing, stock, & reorder points
-- ------------------------------------------------------------
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(50) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    supplier_id INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reorder_point INT NOT NULL DEFAULT 10 CHECK (reorder_point >= 0),
    bin_location VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) 
        REFERENCES categories(category_id) ON DELETE RESTRICT,
    CONSTRAINT fk_product_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers(supplier_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 4. STOCK TRANSACTIONS TABLE (AUDIT TRAIL)
-- Stores non-repudiable logs of all stock additions, dispatches, and defects
-- ------------------------------------------------------------
CREATE TABLE stock_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    transaction_type ENUM('INWARD', 'OUTWARD', 'DAMAGED') NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    previous_quantity INT NOT NULL CHECK (previous_quantity >= 0),
    new_quantity INT NOT NULL CHECK (new_quantity >= 0),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255),
    CONSTRAINT fk_transaction_product FOREIGN KEY (product_id) 
        REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 5. SALES TABLE
-- Stores Point of Sale billing transactions
-- ------------------------------------------------------------
CREATE TABLE sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_no VARCHAR(50) DEFAULT NULL,
    product_id INT NOT NULL,
    quantity_sold INT NOT NULL CHECK (quantity_sold > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    customer_name VARCHAR(100) DEFAULT 'Walk-in Customer',
    payment_method VARCHAR(50) DEFAULT 'Cash',
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sale_product FOREIGN KEY (product_id) 
        REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- INITIAL SEED DATA
-- ============================================================

-- 1. Insert Standard Categories
INSERT INTO categories (category_name) VALUES 
('Pens'),
('Notebooks'),
('Markers'),
('Office Supplies'),
('Art Supplies');

-- 2. Insert Initial Suppliers
INSERT INTO suppliers (supplier_name, phone, email, address, status) VALUES 
('Camlin Stationery Suppliers', '9876543210', 'sales@camlin.example.com', '12 Industrial Estate, Mumbai', 'ACTIVE'),
('Classmate Distributors', '9812345678', 'orders@classmate.example.com', '45 Paper Mills Road, Kolkata', 'ACTIVE'),
('Faber-Castell India', '9823456789', 'support@faber.example.com', '88 Art Tech Park, Bengaluru', 'ACTIVE');

-- 3. Insert 5 Initial Sample Products
INSERT INTO products (product_name, sku, barcode, category_id, supplier_id, unit_price, quantity, reorder_point, bin_location) VALUES 
('Blue Ball Pen', 'PEN001', '890100000001', 1, 1, 10.00, 150, 30, 'A01'),
('A4 Notebook', 'NOTE001', '890100000002', 2, 2, 60.00, 25, 10, 'A02'),
('Permanent Marker', 'MARK001', '890100000003', 3, 1, 40.00, 8, 15, 'A03'),
('Stapler', 'STAP001', '890100000004', 4, 3, 75.00, 6, 10, 'B01'),
('Glue Stick', 'GLUE001', '890100000005', 4, 1, 25.00, 40, 10, 'B02');

-- 4. Record Initial Inward Audit History for Seed Products
INSERT INTO stock_transactions (product_id, transaction_type, quantity, previous_quantity, new_quantity, remarks) VALUES 
(1, 'INWARD', 150, 0, 150, 'Initial opening inventory setup'),
(2, 'INWARD', 25, 0, 25, 'Initial opening inventory setup'),
(3, 'INWARD', 8, 0, 8, 'Initial opening inventory setup'),
(4, 'INWARD', 6, 0, 6, 'Initial opening inventory setup'),
(5, 'INWARD', 40, 0, 40, 'Initial opening inventory setup');
