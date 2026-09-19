# SMART STATIONERY INVENTORY MANAGEMENT SYSTEM
### Complete Academic Project Guide & Documentation

---

## 1. Project Introduction
The **Smart Stationery Inventory Management System** is a full-stack, beginner-friendly software solution designed for stationery retail businesses. It tracks products (such as pens, notebooks, markers, adhesives, and office supplies), manages suppliers and categories, automates stock movement audits (`INWARD`, `OUTWARD`, and `DAMAGED`), and provides an intuitive Point of Sale (POS) customer billing interface.

The system is architected with strict separation of concerns using **Core Java 21**, **JDBC**, **MySQL 8.0**, and a modern **React 18** Single Page Application (SPA). Heavy enterprise frameworks (such as Spring Boot or Hibernate) and Node.js backends are deliberately avoided to maintain clean architectural transparency, making the system easy to explain and defend during college project evaluations and vivas.

---

## 2. Key Features

### 📦 Core Inventory Management
- **Product Catalog:** Track stationery items with unique SKU, Barcode, Unit Price, Stock Quantity, Reorder Point, and Shelf Bin Location (e.g., `A01`, `B02`).
- **Categories:** Organize products into logical store departments (e.g., Pens, Notebooks, Markers, Office Supplies, Art Supplies).
- **Suppliers Directory:** Maintain vendor profiles with contact numbers, email, warehouse address, and active status.
- **Search & Multi-Criteria Filtering:** Live keyword search (by Name, SKU, or Barcode), category dropdown filter, stock status filter, sorting, and pagination.

### 🔄 Stock Operations & Immutable Audit Ledger
- **Stock Inward:** Log vendor restock deliveries with invoice remarks:  
  `New Stock = Current Stock + Inward Quantity`
- **Stock Outward:** Record store usage or branch dispatches:  
  `New Stock = Current Stock - Outward Quantity`
- **Damaged Stock:** Record defective or shop-soiled items with mandatory damage reasons.
- **Negative Stock Prevention:** The system atomically rejects any outward or damaged stock operation where requested quantity exceeds available stock.
- **Complete Movement History:** Non-repudiable audit ledger capturing `previous_quantity`, `quantity` delta, `new_quantity`, timestamp, and remarks for every transaction.

### 🛒 Point of Sale (POS) Billing
- Fast cashier interface: Select product, see live on-shelf stock, enter quantity, and view auto-calculated bill totals.
- **Atomic 3-Way Transactional Commit:** `Deduct Product Stock` ↔ `Create Sale Record` ↔ `Log OUTWARD Stock Audit` (all succeed together or rollback completely).
- Over-selling protection: Rejects purchases exceeding available stock.

### 🧠 Smart Inventory Features
1. **Low Stock Alerting:** Automatically flags items when `quantity <= reorder_point` and displays an amber warning badge.
2. **Out of Stock Alerting:** Prominently highlights items with `quantity == 0` in red.
3. **Algorithmic Reorder Suggestion:** Calculates recommended purchase quantities to avoid over-ordering or stockouts:  
   `Suggested Reorder Quantity = (reorder_point * 2) - current_quantity`
4. **Real-Time Financial Valuation:** Computes total capital tied up in stock (`unit_price * quantity`) store-wide, category-wise, and product-wise.
5. **1-Click CSV Data Export:** Export product catalogs, low-stock lists, valuation breakdowns, and audit trails directly into CSV files.
6. **Role Switcher (Academic Demo):** Interactive toggle between **Store Admin** (full CRUD) and **Store Staff** (restricted operational access).

---

## 3. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, JSX, CSS3, HTML5 | Component-based, responsive, fast client-side filtering and sorting. Zero Vanilla JS DOM manipulation. |
| **Frontend Tooling** | Node.js & Vite | Modern build tool and development server for React. *(Node.js is NOT used as the backend).* |
| **Backend** | Core Java 21 LTS | Pure standard library (`com.sun.net.httpserver.HttpServer`, Java 21 Virtual Threads). No Spring Boot overhead. |
| **Data Access** | JDBC (Java Database Connectivity) | Parameterized `PreparedStatement`, manual connection pooling, explicit transaction boundaries. |
| **Database** | MySQL 8.0 / InnoDB | Relational integrity, ACID compliance, foreign key cascade/restrictions, check constraints. |
| **Driver** | MySQL Connector/J 9.x | Official Type 4 JDBC driver. |
| **Architecture** | 3-Tier Architecture | Presentation (React) → Application (Java 21 REST) → Data (MySQL 8.0). |

---

## 4. Application Architecture

```text
+-----------------------------------------------------------------------+
|                           PRESENTATION TIER                           |
|                       React 18 Single Page App                        |
|   (Vite Dev Server, Components, Client-side Filtering/Sort/Search)   |
+-----------------------------------------------------------------------+
                                   |
                                   | HTTP / REST (JSON over Port 8080)
                                   v
+-----------------------------------------------------------------------+
|                          APPLICATION TIER                             |
|                        Core Java 21 Runtime                           |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  |             HttpServer & REST Handlers (Routing & CORS)         |  |
|  +-----------------------------------------------------------------+  |
|                                  |                                    |
|  +-----------------------------------------------------------------+  |
|  |             Service Layer (Business Logic & Validation)         |  |
|  |    (Stock Rules, Low-Stock Alerts, Reorder Math, Valuation)     |  |
|  +-----------------------------------------------------------------+  |
|                                  |                                    |
|  +-----------------------------------------------------------------+  |
|  |           DAO Layer (Data Access Object & Transactions)         |  |
|  |     (PreparedStatement, ResultSet, Connection Management)       |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
                                   |
                                   | JDBC Type 4 Connector/J
                                   v
+-----------------------------------------------------------------------+
|                             DATA TIER                                 |
|                         MySQL 8.0 Engine                              |
|           (InnoDB, Foreign Keys, ACID Transaction Isolation)          |
+-----------------------------------------------------------------------+
```

---

## 5. Project Directory Structure

```text
smart-stationery-inventory/
│
├── backend/
│   ├── src/
│   │   ├── model/
│   │   │   ├── Category.java             # Category model
│   │   │   ├── Supplier.java             # Supplier model
│   │   │   ├── Product.java              # Product model with smart helpers
│   │   │   ├── StockTransaction.java     # Audit transaction model
│   │   │   ├── Sale.java                 # Sales billing model
│   │   │   ├── DashboardSummary.java     # Dashboard KPI DTO
│   │   │   └── ValuationReport.java      # Financial valuation DTO
│   │   │
│   │   ├── dao/
│   │   │   ├── CategoryDAO.java          # JDBC CRUD for categories
│   │   │   ├── SupplierDAO.java          # JDBC CRUD for suppliers
│   │   │   ├── ProductDAO.java           # Parameterized queries & joins
│   │   │   ├── StockTransactionDAO.java  # Audit trail insertion & queries
│   │   │   └── SaleDAO.java              # Sales insertion & history
│   │   │
│   │   ├── service/
│   │   │   ├── CategoryService.java      # Category validation & rules
│   │   │   ├── SupplierService.java      # Vendor validation & phone/email
│   │   │   ├── ProductService.java       # Uniqueness & pricing validation
│   │   │   ├── StockService.java         # Transactional Inward/Outward/Damaged
│   │   │   ├── SaleService.java          # Atomic POS billing service
│   │   │   └── ReportService.java        # Low-stock math & valuations
│   │   │
│   │   ├── util/
│   │   │   ├── DBConnection.java         # Thread-safe JDBC connection provider
│   │   │   ├── DatabaseInitializer.java # Auto-executes schema.sql on startup
│   │   │   ├── ValidationUtil.java       # Domain validation helper
│   │   │   └── JsonUtil.java             # Pure Java JSON serializer/parser
│   │   │
│   │   ├── server/
│   │   │   └── SimpleHttpServer.java     # Java 21 REST HTTP server on port 8080
│   │   │
│   │   └── Main.java                     # Application bootstrap runner
│   │
│   ├── lib/
│   │   └── mysql-connector-j.jar         # MySQL JDBC driver
│   ├── db.properties                     # Database connection settings
│   └── out/                              # Compiled bytecode (.class)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Top nav with role switcher
│   │   │   ├── Sidebar.jsx               # Left navigation menu
│   │   │   ├── StatusBadge.jsx           # In Stock / Low Stock / Out of Stock
│   │   │   ├── ConfirmDialog.jsx         # Deletion safety modal
│   │   │   ├── ExportCsvButton.jsx       # 1-click CSV download
│   │   │   ├── ProductForm.jsx           # Add/Edit product modal
│   │   │   ├── CategoryForm.jsx          # Add/Edit category modal
│   │   │   ├── SupplierForm.jsx          # Add/Edit supplier modal
│   │   │   └── StockForm.jsx             # Inward/Outward/Damaged stock form
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx             # 5 KPI cards + urgent restock table
│   │   │   ├── Products.jsx              # Searchable product catalog table
│   │   │   ├── Suppliers.jsx             # Supplier directory table
│   │   │   ├── Categories.jsx            # Category management table
│   │   │   ├── Stock.jsx                 # Stock operations & audit ledger
│   │   │   ├── Sales.jsx                 # POS customer billing interface
│   │   │   └── Reports.jsx               # Low stock, valuation, and audit tabs
│   │   │
│   │   ├── services/
│   │   │   └── api.js                    # REST API client & CSV exporter
│   │   │
│   │   ├── App.jsx                       # Root application component
│   │   ├── main.jsx                      # React entry point
│   │   └── App.css                       # Modern CSS3 design system
│   │
│   ├── package.json                      # Frontend dependencies
│   └── index.html                        # HTML5 template
│
├── database/
│   └── schema.sql                        # MySQL 8.0 DDL & initial seed data
│
├── postman/
│   └── SmartStationery.postman_collection.json # Postman API collection
│
├── docs/
│   ├── architecture.drawio               # System architecture diagram
│   ├── er-diagram.drawio                 # Entity-Relationship diagram
│   └── dfd.drawio                        # DFD Level 0 & Level 1 diagrams
│
├── .gitignore                            # Git exclusion rules
├── README.md                             # Comprehensive project documentation
└── run.bat                               # Windows 1-click execution script
```

---

## 6. Prerequisites & Installation

### Step 1: Java 21 Installation on Windows
1. Download **Oracle JDK 21** or **Eclipse Temurin JDK 21 (LTS)** from [adoptium.net](https://adoptium.net).
2. Run the installer and ensure **"Add to PATH"** is checked.
3. Open PowerShell / Command Prompt and verify:
   ```powershell
   java -version
   javac -version
   ```

### Step 2: MySQL 8.0 Installation & Database Setup
1. Download **MySQL Community Server 8.0+** and **MySQL Workbench** from [dev.mysql.com](https://dev.mysql.com/downloads/).
2. During setup, configure the root password (e.g. `123`).
3. Ensure the MySQL Windows service is running (Port `3306`).
4. Execute `database/schema.sql` via MySQL Workbench or CLI:
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 26.7\bin\mysql.exe" -u root -p < database/schema.sql
   ```
   *(Note: The Java application also includes an automatic `DatabaseInitializer` that initializes the database on first run).*

### Step 3: Node.js Installation (For React UI Tooling)
1. Download **Node.js (v18+)** from [nodejs.org](https://nodejs.org).
2. Verify in terminal:
   ```powershell
   node -v
   npm -v
   ```

---

## 7. Database Configuration (`db.properties`)
Database credentials are kept configurable in `backend/db.properties` to ensure security:
```properties
db.url=jdbc:mysql://localhost:3306/inventory_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
db.username=root
db.password=123
```
> [!IMPORTANT]
> Never commit private production passwords to GitHub. The project's `.gitignore` protects credentials and sensitive environments.

---

## 8. How to Run the Project

### Method A: One-Click Windows Launch (Recommended)
Double-click `run.bat` in the project root directory.  
It will automatically:
1. Verify Java 21 and Node.js.
2. Compile the Java backend.
3. Launch the REST server on `http://localhost:8080/api`.
4. Launch the React Vite server on `http://127.0.0.1:5173/`.
5. Open your default browser to the application dashboard.

---

### Method B: Running via Command Line (Manual)

#### 1. Start the Java Backend:
```powershell
cd smart-stationery-inventory/backend

# Compile all source files
javac -cp "lib/mysql-connector-j.jar;src" -d "out" src/model/*.java src/util/*.java src/dao/*.java src/service/*.java src/server/*.java src/Main.java

# Run backend application
java -cp "out;lib/mysql-connector-j.jar" Main
```
Backend starts on: `http://localhost:8080/api`

#### 2. Start the React Frontend:
```powershell
cd smart-stationery-inventory/frontend

# Install dependencies (first time only)
npm install

# Start Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend opens at: `http://127.0.0.1:5173/`

---

### Method C: Running the Backend in IntelliJ IDEA
1. Open **IntelliJ IDEA**.
2. Click **Open** → Navigate to `smart-stationery-inventory/backend`.
3. Open **File** → **Project Structure** → **Project**:
   - Set **SDK** to **21**.
4. In **Project Structure** → **Libraries**:
   - Click **+** (Java) → select `backend/lib/mysql-connector-j.jar` → Apply.
5. In **Project Structure** → **Modules**:
   - Ensure the `src` folder is marked as **Sources Root**.
6. Open `src/Main.java` and click the green **Run** icon.

---

## 9. Verification & Testing

### Running the Backend Automated Test Suite
From the `backend/` directory, run each test runner:
```powershell
# Foundation & Models Test
java -ea -cp "out;lib/mysql-connector-j.jar" TestFoundation

# Category & Supplier Validation Test
java -ea -cp "out;lib/mysql-connector-j.jar" TestCategorySupplier

# Product Rules & Edge Cases Test
java -ea -cp "out;lib/mysql-connector-j.jar" TestProductModule

# Stock Movements & Insufficient Stock Protection Test
java -ea -cp "out;lib/mysql-connector-j.jar" TestStockModule

# Sales & Atomic POS Billing Test
java -ea -cp "out;lib/mysql-connector-j.jar" TestSalesModule

# Reports, Analytics & Valuation Test
java -ea -cp "out;lib/mysql-connector-j.jar" TestReportsModule
```

### Edge Cases Verified
| Edge Case | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **EC-1: Duplicate SKU** | Attempting to create product with existing SKU (e.g. `PEN001`) | Throws `IllegalArgumentException("SKU already exists")` | ✅ Passed |
| **EC-2: Duplicate Barcode** | Attempting to insert existing barcode | Throws `IllegalArgumentException("Barcode already exists")` | ✅ Passed |
| **EC-3: Negative Quantity** | Entering stock quantity `< 0` | Throws `IllegalArgumentException("Quantity cannot be negative")` | ✅ Passed |
| **EC-4: Insufficient Stock** | Attempting outward dispatch `> available stock` | Operation rejected, stock unmodified, no audit record logged | ✅ Passed |
| **EC-5: Low Stock Detection** | Current stock `<= reorder_point` | Displayed as `LOW STOCK`; suggested order computed | ✅ Passed |
| **EC-6: Out of Stock** | Current stock reaches `0` | Highlighted as `OUT OF STOCK` | ✅ Passed |
| **EC-7: Damaged Goods** | Logging damaged goods without remarks | Blocked; damage reason is mandatory | ✅ Passed |
| **EC-8: Invalid Price** | Unit price `<= 0` | Blocked; price must be strictly `> 0` | ✅ Passed |
| **EC-9: Empty Product Name** | Empty product name input | Blocked; product name is required | ✅ Passed |
| **EC-10: Over-Selling** | Sale quantity sold `> available stock` | Blocked with HTTP 400 Insufficient Stock error | ✅ Passed |

---

## 10. Postman API Testing
Import the collection located at:
`postman/SmartStationery.postman_collection.json`

### Endpoints Available:
- **Products:** `GET /api/products`, `GET /api/products/{id}`, `POST /api/products`, `PUT /api/products/{id}`, `DELETE /api/products/{id}`
- **Categories:** `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/{id}`, `DELETE /api/categories/{id}`
- **Suppliers:** `GET /api/suppliers`, `POST /api/suppliers`, `PUT /api/suppliers/{id}`, `DELETE /api/suppliers/{id}`
- **Stock:** `POST /api/stock/inward`, `POST /api/stock/outward`, `POST /api/stock/damaged`, `GET /api/stock/history`
- **Sales:** `POST /api/sales`, `GET /api/sales`
- **Reports:** `GET /api/reports/dashboard`, `GET /api/reports/low-stock`, `GET /api/reports/valuation`, `GET /api/reports/stock-movement`

---

## 11. College Project Viva Questions & Answers

#### Q1: Why did you use Core Java and JDBC instead of Spring Boot and Hibernate?
**Answer:** Spring Boot and Hibernate introduce heavy abstractions, auto-configuration, and large JAR footprints that obscure the underlying mechanics of SQL queries and HTTP handling. By using pure Java 21, `com.sun.net.httpserver.HttpServer`, and plain JDBC `PreparedStatement`, every database query, transaction boundary, and REST route is explicit and easy to understand and defend.

#### Q2: How do you prevent SQL Injection attacks?
**Answer:** We strictly use `PreparedStatement` with parameterized placeholders (`?`) for all user-supplied inputs across every DAO. No SQL query in the application concatenates raw strings.

#### Q3: How do you prevent negative stock when multiple sales or outward dispatches occur?
**Answer:** Two layers of protection are enforced:
1. **Service Layer:** In `StockService` and `SaleService`, we verify that `requested_quantity <= current_quantity`. If insufficient, an exception is thrown immediately.
2. **Database Layer:** The `products` table has a hard constraint: `CHECK (quantity >= 0)`. Any operation causing negative stock is rejected by the MySQL InnoDB engine.

#### Q4: How is atomicity guaranteed in Point of Sale (POS) operations?
**Answer:** We use JDBC's manual transaction control:
```java
conn.setAutoCommit(false);
// 1. Check stock
// 2. Update product stock
// 3. Insert sale record
// 4. Insert OUTWARD audit transaction
conn.commit();
```
If any of the three operations fails, `conn.rollback()` restores the original state, ensuring no partial writes occur.

#### Q5: How is the suggested reorder quantity calculated?
**Answer:** When an item's stock drops to or below its reorder point, the system computes:  
`Suggested Reorder Quantity = (reorder_point * 2) - current_quantity`  
This replenishes inventory to twice the safety stock level without over-purchasing.

---

## 12. Troubleshooting

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `Access denied for user 'root'@'localhost'` | MySQL root password mismatch | Update `db.password` in `backend/db.properties` to match your local password. |
| `Port 8080 already in use` | Another process is bound to port 8080 | Change `PORT` in `Main.java` to `8081` and update `BASE_URL` in `api.js`. |
| `Cannot delete category/supplier` | Referential integrity constraint | Products are currently linked to this category or supplier. Delete or reassign the products first. |
| `CORS Error in Browser` | Backend server not running | Ensure `Main.java` is running on port 8080. `SimpleHttpServer` automatically sets `Access-Control-Allow-Origin: *`. |

---

## 13. License & Academic Attribution
Developed as an academic software engineering capstone project. Designed for educational clarity, modularity, and beginner-friendly demonstration.
