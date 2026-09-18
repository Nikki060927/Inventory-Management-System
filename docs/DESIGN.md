# PHASE 2 — DESIGN: ARCHITECTURE, DFD, ER DIAGRAM & REST API CONTRACTS

**Project Title:** Smart Stationery Inventory Management System  
**Document Version:** 2.0 (Academic SOP Compliant)  
**Lead Architect:** Nikhila V (Reg No: 44731059)  
**Backend & Database Specialist:** Zaid Basha (Reg No: 44731049)  

---

## 1. 3-Tier System Architecture

```
+-------------------------------------------------------------------------------+
|                            PRESENTATION TIER (UI)                             |
|          Semantic HTML5 + Vanilla CSS3 (Light Theme) + Vanilla JS (ES6+)      |
|               Client Browser (Port: 8080 / Port: 5500 Live Server)            |
|          [index.html] <---> [css/style.css] <---> [js/script.js]             |
+---------------------------------------+---------------------------------------+
                                        |
                            HTTP / REST JSON (Fetch API)
                            CORS Enabled: *
                                        |
+---------------------------------------v---------------------------------------+
|                            APPLICATION LOGIC TIER                             |
|           Core Java 21 LTS Standard Library (com.sun.net.httpserver)          |
|                 Virtual Threads Dispatcher | Port: 8080                       |
|                                                                               |
|   [SimpleHttpServer]                                                          |
|         │                                                                     |
|         ├──> [Services: Business Rules & ACID Transaction Boundaries]        |
|         │         ├── ProductService                                          |
|         │         ├── StockService                                            |
|         │         ├── SaleService                                             |
|         │         └── ReportService                                           |
|         │                                                                     |
|         └──> [DAOs: Plain JDBC Data Access Objects]                           |
|                   ├── ProductDAO                                              |
|                   ├── StockTransactionDAO                                     |
|                   ├── SaleDAO                                                 |
|                   └── CategoryDAO / SupplierDAO                               |
+---------------------------------------+---------------------------------------+
                                        |
                          Plain JDBC Protocol (PreparedStatements)
                          Thread-Safe DBConnection Pool Helper
                                        |
+---------------------------------------v---------------------------------------+
|                              DATA STORAGE TIER                                |
|                   MySQL Server 8.0+ / 26.7 (InnoDB Engine)                    |
|                Port: 3306  |  Database: inventory_db (3NF)                    |
|                                                                               |
|   Tables: categories, suppliers, products, stock_transactions, sales          |
+-------------------------------------------------------------------------------+
```

---

## 2. Data Flow Diagrams (DFD)

### Level 0 Context Diagram
```
             +-----------------------------------------------+
             |                                               |
             |           STORE MANAGER / CASHIER             |
             |                                               |
             +--------+-----------------------------^--------+
                      |                             |
     Product Details, |                             | KPI Metrics,
     Stock Inward,    |                             | Real-Time Stock Status,
     POS Sale Request |                             | Low-Stock Alerts,
                      |                             | CSV Reports
                      v                             |
             +--------------------------------------+--------+
             |                                               |
             |                     0.0                       |
             |       SMART STATIONERY INVENTORY              |
             |              MANAGEMENT SYSTEM                |
             |                                               |
             +--------+-----------------------------^--------+
                      |                             |
    PreparedStatement |                             | Relational ResultSets,
    SQL INSERT/UPDATE |                             | Aggregated Valuations
                      v                             |
             +--------------------------------------+--------+
             |                                               |
             |            MySQL 8.0 INVENTORY_DB             |
             |                                               |
             +-----------------------------------------------+
```

### Level 1 Process Decomposition
```
[User Input]
     │
     ├──> (1.0 Manage Products) ─────────> [D1: products]
     │           │
     │           └──> Validate SKU & Positive Unit Price
     │
     ├──> (2.0 Stock Operations) ────────> [D2: stock_transactions] (Audit)
     │           │                               │
     │           └──> Update Quantity ───────────┴──> [D1: products]
     │
     ├──> (3.0 POS Sale Checkout) ───────> [D3: sales]
     │           │
     │           ├──> Atomic Verify & Decrement ───> [D1: products]
     │           └──> Generate Audit Ledger ───────> [D2: stock_transactions]
     │
     └──> (4.0 Analytics & Reports) <───── [D1, D2, D3]
                 │
                 ├──> Check (Qty <= ReorderPoint) ──> Low-Stock Alert
                 ├──> Compute (ReorderPoint*2 - Qty) -> Suggested Reorder
                 └──> Compute Sum(Qty * UnitPrice)  ──> Category Valuation
```

---

## 3. Entity-Relationship (ER) Schema Specification (3NF)

```
  +--------------+          +-----------------------+
  |  categories  | 1      * |       products        |
  |--------------+----------+-----------------------|
  | category_id  |<--------+| product_id (PK)       |
  | category_name|          | category_id (FK)      |
  +--------------+          | supplier_id (FK)      |
                            | sku (UNIQUE)          |
  +--------------+          | product_name          |
  |  suppliers   | 1      * | unit_price (> 0)      |
  |--------------+----------+ quantity (CHECK >= 0) |
  | supplier_id  |<--------+| reorder_point         |
  | supplier_name|          | bin_location          |
  +--------------+          +-----------+-----------+
                                        | 1
                    +-------------------+-------------------+
                    | *                                     | *
         +----------v-----------+                +----------v-----------+
         |  stock_transactions  |                |        sales         |
         |----------------------|                |----------------------|
         | transaction_id (PK)  |                | sale_id (PK)         |
         | product_id (FK)      |                | product_id (FK)      |
         | transaction_type     |                | quantity_sold (> 0)  |
         | quantity, remarks    |                | total_price, date    |
         +----------------------+                +----------------------+
```

---

## 4. REST API Endpoints Specification

| Method | Endpoint | Purpose | Request Body | Success Code | Error Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve all items with filter/search | Query parameters (`?search=`, `?category=`, `?status=`) | `200 OK` (JSON Array) | `500 Server Error` |
| `POST`| `/api/products` | Create new product | JSON with `sku`, `productName`, `unitPrice`, `quantity`, etc. | `201 Created` | `400 Bad Request` / `409 Conflict (Duplicate SKU)` |
| `PUT` | `/api/products/{id}` | Update product details | JSON with updated product fields | `200 OK` | `404 Not Found` |
| `DELETE` | `/api/products/{id}` | Delete product | None | `200 OK` | `409 Conflict (Sales exist)` |
| `GET` | `/api/categories` | List all categories | None | `200 OK` | `500 Server Error` |
| `POST`| `/api/categories` | Add category | `{"categoryName": "Pens"}` | `201 Created` | `400 Bad Request` |
| `GET` | `/api/suppliers` | List all suppliers | None | `200 OK` | `500 Server Error` |
| `POST`| `/api/suppliers` | Add supplier | `{"supplierName": "Camlin", "phone": "..."}` | `201 Created` | `400 Bad Request` |
| `POST`| `/api/stock/inward` | Receive delivery batch | `{"productId": 1, "quantity": 50, "remarks": "..."}` | `200 OK` | `400 Invalid quantity` |
| `POST`| `/api/stock/outward`| Dispatch stock | `{"productId": 1, "quantity": 10, "remarks": "..."}` | `200 OK` | `400 Insufficient stock` |
| `POST`| `/api/stock/damaged`| Write-off damaged goods | `{"productId": 1, "quantity": 2, "remarks": "..."}` | `200 OK` | `400 Insufficient stock` |
| `GET` | `/api/stock/history`| Audit ledger entries | None | `200 OK` | `500 Server Error` |
| `POST`| `/api/sales` | Record POS sale (Atomic) | `{"productId": 1, "quantitySold": 5}` | `201 Created` | `400 Out of stock` |
| `GET` | `/api/sales` | List sales history | None | `200 OK` | `500 Server Error` |
| `GET` | `/api/reports/dashboard`| Fetch 4 KPI metrics | None | `200 OK` | `500 Server Error` |
| `GET` | `/api/reports/low-stock`| Get low-stock items | None | `200 OK` | `500 Server Error` |
| `GET` | `/api/reports/valuation`| Valuation by category| None | `200 OK` | `500 Server Error` |
