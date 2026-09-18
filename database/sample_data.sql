-- =============================================================
-- SMART STATIONERY INVENTORY MANAGEMENT SYSTEM
-- Sample Seed Data (5+ Realistic Records Per Table)
-- Database: MySQL 8.0 / InnoDB
-- =============================================================

USE inventory_db;

-- 1. SEED CATEGORIES (4 Records)
INSERT INTO categories (category_id, category_name) VALUES
(1, 'Pens & Writing'),
(2, 'Notebooks & Paper'),
(3, 'Markers & Highlighters'),
(4, 'Office & Desk Supplies')
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- 2. SEED SUPPLIERS (5 Records)
INSERT INTO suppliers (supplier_id, supplier_name, contact_person, phone, email, address) VALUES
(1, 'Camlin Stationery Suppliers', 'Ramesh Kumar', '+91 98765 43210', 'orders@camlin.in', 'Plot 12, Industrial Estate, Mumbai, MH'),
(2, 'Classmate Paper Products', 'Suresh Nair', '+91 98450 11223', 'sales@classmatepaper.com', 'Survey 45, Peenya Industrial Area, Bengaluru, KA'),
(3, 'Faber-Castell India Pvt Ltd', 'Priya Sharma', '+91 97110 99887', 'support@faber-castell.in', 'Building 4, Sector 18, Gurugram, HR'),
(4, 'Kangaro Stationery Products', 'Anil Mehta', '+91 98220 55443', 'info@kangarostationery.com', 'B-15, Focal Point, Ludhiana, PB'),
(5, 'Pidilite Industries Ltd', 'Vikas Patel', '+91 99330 66778', 'contact@pidilite.com', 'Ramkrishna Mandir Road, Andheri East, Mumbai, MH')
ON DUPLICATE KEY UPDATE supplier_name=VALUES(supplier_name);

-- 3. SEED PRODUCTS (6 Records)
INSERT INTO products (product_id, category_id, supplier_id, sku, barcode, product_name, unit_price, quantity, reorder_point, bin_location) VALUES
(1, 1, 1, 'PEN001', '890100000001', 'Blue Ball Pen (0.7mm)', 10.00, 150, 30, 'A01'),
(2, 2, 2, 'NOTE001', '890100000002', 'A4 Ruled Notebook (160 Pages)', 60.00, 25, 10, 'A02'),
(3, 3, 1, 'MARK001', '890100000003', 'Permanent Black Marker', 40.00, 8, 15, 'A03'),
(4, 4, 3, 'STAP001', '890100000004', 'Desktop Stapler #10', 75.00, 6, 10, 'B01'),
(5, 4, 5, 'GLUE001', '890100000005', 'Fevistik Glue Stick 15g', 25.00, 45, 10, 'B02'),
(6, 1, 1, 'GEL001', '890100000006', 'Black Gel Ink Pen 0.5mm', 15.00, 80, 20, 'A04')
ON DUPLICATE KEY UPDATE product_name=VALUES(product_name), quantity=VALUES(quantity);

-- 4. SEED STOCK TRANSACTIONS (Audit Ledger) (6 Records)
INSERT INTO stock_transactions (transaction_id, product_id, transaction_type, quantity, remarks, transaction_date) VALUES
(1, 1, 'INWARD', 200, 'Initial opening stock intake', '2026-09-01 10:00:00'),
(2, 2, 'INWARD', 40, 'School batch intake from Classmate', '2026-09-02 11:30:00'),
(3, 3, 'INWARD', 20, 'Opening inventory delivery', '2026-09-03 09:15:00'),
(4, 4, 'INWARD', 10, 'Initial hardware shelf stock', '2026-09-04 14:00:00'),
(5, 5, 'INWARD', 50, 'Adhesives delivery from Pidilite', '2026-09-05 16:45:00'),
(6, 3, 'DAMAGED', 2, 'Dried ink leakage in storage box', '2026-09-10 12:20:00')
ON DUPLICATE KEY UPDATE remarks=VALUES(remarks);

-- 5. SEED SALES (POS Customer Transactions) (5 Records)
INSERT INTO sales (sale_id, product_id, quantity_sold, total_price, sale_date) VALUES
(1, 1, 50, 500.00, '2026-09-12 11:00:00'),
(2, 2, 15, 900.00, '2026-09-13 14:20:00'),
(3, 3, 10, 400.00, '2026-09-14 16:10:00'),
(4, 4, 4, 300.00, '2026-09-15 10:45:00'),
(5, 5, 5, 125.00, '2026-09-16 18:00:00')
ON DUPLICATE KEY UPDATE total_price=VALUES(total_price);
