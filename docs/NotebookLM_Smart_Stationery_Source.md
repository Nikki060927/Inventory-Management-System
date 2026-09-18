# SOURCE DOCUMENT FOR NOTEBOOKLM
# Project: Smart Stationery Inventory Management System
# Academic Capstone Project (Core Java 21 LTS, Plain JDBC, MySQL, React 18)

---

## 1. Executive Summary & Overview
The **Smart Stationery Inventory Management System** is a production-grade, framework-independent academic software application developed for stationery retail businesses (handling pens, notebooks, markers, adhesives, and office supplies).

The core objective is to solve operational problems common to small and medium retail stationery stores:
1. High inventory shrinkage and unrecorded damaged goods.
2. Unexpected stock-outs during back-to-school and exam periods due to lack of automated tracking.
3. Errors in manual handwritten book-keeping.
4. Overselling items at checkout due to lack of synchronized stock verification.
5. Inability to calculate real-time capital valuation tied up in inventory.

### Key Architectural Constraint:
Unlike generic tutorial projects, this system deliberately avoids heavy enterprise frameworks like **Spring Boot**, **Hibernate**, or **JPA**, and avoids **Node.js** backend runtimes. Instead, the backend is implemented purely in **Core Java 21 LTS** using the standard library (`com.sun.net.httpserver.HttpServer`), **Java 21 Virtual Threads**, and **Plain JDBC** with `java.sql.PreparedStatement`. This makes the application clean, modular, and easy to explain during college project evaluations and vivas.

---

## 2. 3-Tier System Architecture

### Tier 1: Client / Presentation Tier
- **Technology:** React 18 Single Page Application (SPA), scaffolded with Vite.
- **Port:** 5173 (`http://127.0.0.1:5173/`).
- **Features:**
  - 7 dedicated views: Executive Dashboard, Product Catalog, Category Management, Supplier Management, Stock Operations, Point of Sale (POS) Billing Register, and Reports & Analytics.
  - Zero external UI bloat; custom responsive CSS with dark-mode aesthetic.
  - Client-side CSV export engine built in pure JavaScript with zero third-party npm dependencies.
  - Dynamic, color-coded status badges: Green for `IN STOCK`, Amber for `LOW STOCK`, Red for `OUT OF STOCK`.

### Tier 2: Application / Business Logic Tier
- **Technology:** Core Java 21 LTS standard library (`com.sun.net.httpserver.HttpServer`).
- **Port:** 8080 (`http://localhost:8080/api`).
- **Concurrency:** Uses Java 21 lightweight Virtual Threads (`Executors.newVirtualThreadPerTaskExecutor()`) to handle concurrent POS requests without thread pool exhaustion.
- **Layered Design:**
  - `model/`: Plain Java Objects (Category, Supplier, Product, StockTransaction, Sale).
  - `dao/`: Data Access Objects implementing plain JDBC `PreparedStatement` operations.
  - `service/`: Enforces retail business rules, validation, and ACID transaction boundaries.
  - `server/`: HTTP request dispatching, URL parameter parsing, CORS headers, and JSON serialization.

### Tier 3: Data Storage Tier
- **Technology:** MySQL Server 8.0+ / 26.7 with InnoDB storage engine.
- **Port:** 3306 (`inventory_db`).
- **Relational Integrity:** Normalized to Third Normal Form (3NF) with foreign keys, unique SKU constraints, and database-level `CHECK (quantity >= 0)`.

---

## 3. Relational Database Schema & Tables

1. **`categories` Table**:
   - `category_id` (INT, Primary Key, Auto Increment)
   - `category_name` (VARCHAR(100), UNIQUE, NOT NULL)
   - *Purpose:* Organizes items into categories (Pens, Notebooks, Markers, Office Supplies).

2. **`suppliers` Table**:
   - `supplier_id` (INT, Primary Key, Auto Increment)
   - `supplier_name` (VARCHAR(150), NOT NULL)
   - `contact_person` (VARCHAR(100))
   - `phone` (VARCHAR(20))
   - `email` (VARCHAR(100))
   - `address` (TEXT)
   - *Purpose:* Maintains supplier directories for restocking stationery.

3. **`products` Table**:
   - `product_id` (INT, Primary Key, Auto Increment)
   - `category_id` (INT, Foreign Key referencing `categories`)
   - `supplier_id` (INT, Foreign Key referencing `suppliers`)
   - `sku` (VARCHAR(50), UNIQUE, NOT NULL)
   - `barcode` (VARCHAR(50), UNIQUE)
   - `product_name` (VARCHAR(150), NOT NULL)
   - `unit_price` (DECIMAL(10,2), NOT NULL, CHECK unit_price > 0)
   - `quantity` (INT, NOT NULL, CHECK quantity >= 0)
   - `reorder_point` (INT, NOT NULL, DEFAULT 10)
   - `bin_location` (VARCHAR(50), e.g., 'A01', 'B02')
   - *Purpose:* Master inventory catalog.

4. **`stock_transactions` Table**:
   - `transaction_id` (INT, Primary Key, Auto Increment)
   - `product_id` (INT, Foreign Key referencing `products`)
   - `transaction_type` (ENUM: 'INWARD', 'OUTWARD', 'DAMAGED')
   - `quantity` (INT, NOT NULL)
   - `remarks` (VARCHAR(255))
   - `transaction_date` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   - *Purpose:* Immutable, append-only audit trail. Prevents untracked shrinkage or arbitrary edits.

5. **`sales` Table**:
   - `sale_id` (INT, Primary Key, Auto Increment)
   - `product_id` (INT, Foreign Key referencing `products`)
   - `quantity_sold` (INT, NOT NULL, CHECK quantity_sold > 0)
   - `total_price` (DECIMAL(10,2), NOT NULL)
   - `sale_date` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
   - *Purpose:* POS customer checkout billing records.

---

## 4. Key Mathematical Formulas & Business Rules

### 1. Real-Time Dynamic Stock Status Formula:
$$\text{Status} = \begin{cases} 
\text{OUT OF STOCK}, & \text{if } \text{Quantity} = 0 \\
\text{LOW STOCK}, & \text{if } \text{Quantity} \le \text{Reorder Point} \\
\text{IN STOCK}, & \text{otherwise}
\end{cases}$$
*Evaluated on every query to ensure instant UI badge transitions without stale cached states.*

### 2. Suggested Reorder Quantity Formula:
$$\text{Suggested Reorder Quantity} = \max\Big(0,\; (\text{Reorder Point} \times 2) - \text{Current Quantity}\Big)$$
*Automatically calculates the exact number of units to order from the supplier to restore twice the safety buffer.*
*Example: If Reorder Point = 10 and Current Quantity = 6, Suggested Order = (10 × 2) - 6 = 14 units.*

### 3. Real-Time Inventory Valuation:
$$\text{Total Valuation} = \sum_{i=1}^{n} (\text{Quantity}_i \times \text{Unit Price}_i)$$
*Provides instant store-wide and category-specific asset valuation.*

### 4. Atomic POS Sales (ACID Guarantee):
When a sale is recorded:
1. `connection.setAutoCommit(false)`
2. Verify available stock $\ge$ quantity requested.
3. Decrement stock: `UPDATE products SET quantity = quantity - ? WHERE product_id = ?`
4. Post audit ledger entry: `INSERT INTO stock_transactions (..., 'OUTWARD')`
5. Record POS sale receipt: `INSERT INTO sales (...)`
6. `connection.commit()`
If any step fails, `connection.rollback()` reverses all modifications cleanly.

---

## 5. Defensive Programming: 10 Edge Cases Handled

1. **Duplicate SKU Rejection:** HTTP 409 Conflict returned if a user tries to create a duplicate SKU.
2. **SQL Injection Immunity:** 100% of queries use `PreparedStatement` with `?` parameter placeholders.
3. **Negative Price & Zero Quantity Guard:** Prevented both at the Java Service layer and via database `CHECK` constraints.
4. **Overselling Protection:** Rejects sale requests exceeding physical inventory.
5. **Damaged Stock Handling:** Logs damaged items into the audit ledger without generating false sales revenue.
6. **Foreign Key Cascade Protection:** Restricts deletion of categories or suppliers with active assigned products.
7. **Safe Restocking:** Validates product existence before accepting `INWARD` stock shipments.
8. **Decimal Precision Protection:** Double-precision calculations avoid accumulated floating-point rounding errors in retail subtotals.
9. **Zero Sales Quantity Guard:** Rejects customer sales with 0 or negative quantities.
10. **Graceful Database Reconnection:** Automated verification and clear error reporting if MySQL goes offline.

---

## 6. Live Viva Demonstration Script (5-Minute Walkthrough)

- **Step 1 (Dashboard):** Open `http://127.0.0.1:5173/`. Point out the 4 KPI metric cards and the Low Stock Warning Table showing items that have breached their safety threshold.
- **Step 2 (Products):** Navigate to Products. Attempt to enter a duplicate SKU (`PEN001`) to demonstrate validation error handling. Add a valid product (e.g., *Gel Pen Black*).
- **Step 3 (Stock Operations):** Select *Permanent Marker* and record an `INWARD` delivery of +50 units. Return to the dashboard and show how the status badge dynamically transitions from `LOW STOCK` (Amber) to `IN STOCK` (Green).
- **Step 4 (POS Sales):** Switch to the Sales tab. Sell 5 units of *Blue Ball Pen*. Verify that the sale appears in the register and check the stock ledger to confirm an automatic `OUTWARD` transaction was posted.
- **Step 5 (Reports & CSV):** Navigate to Reports. Review the category valuation summary and click **Download CSV** to demonstrate instant spreadsheet report generation.

---

## 7. Examiner Viva Questions & Answers (Top 5)

**Q1: Why did you build this in Core Java and JDBC instead of using Spring Boot or Hibernate?**  
*Answer:* Spring Boot and Hibernate hide critical backend mechanics like thread dispatching, socket handling, and database connection pooling behind annotations. In an academic defense, using Core Java 21 standard library and plain JDBC demonstrates fundamental understanding of socket servers, virtual threads, relational SQL, and explicit transaction management (`commit`/`rollback`).

**Q2: How does the system prevent SQL Injection?**  
*Answer:* Every single database query is executed using `java.sql.PreparedStatement` with parameterized placeholders (`?`). The SQL statement is pre-compiled by the database engine before values are bound as literal data, making SQL injection mathematically impossible.

**Q3: How do you guarantee inventory will never show negative stock?**  
*Answer:* We enforce non-negative stock at two levels: (1) In Java business logic, `SaleService` queries the current quantity and aborts if `requested > available`. (2) In MySQL, the column is defined with `CHECK (quantity >= 0)`, providing an engine-level integrity guarantee.

**Q4: What formula does your system use for suggested reorder quantity?**  
*Answer:* We use the standard retail equation: $(\text{Reorder Point} \times 2) - \text{Current Quantity}$. If an item with a threshold of 10 drops to 6, the system suggests ordering $(10 \times 2) - 6 = 14$ units to safely re-establish a 2× buffer.

**Q5: How does the application support concurrent cashiers?**  
*Answer:* The backend leverages Java 21 Virtual Threads to spin up lightweight threads per HTTP request, while MySQL InnoDB uses row-level locking on the `products` table during atomic updates.

---

## 8. Suggested 10-Slide Presentation Outline for College Viva

- **Slide 1:** Title Slide (Project Title, Candidate Name, Tech Stack, University Info)
- **Slide 2:** Problem Statement (Paper registers, sudden stock-outs, unrecorded shrinkage)
- **Slide 3:** Objectives & Proposed Solution (Real-time tracking, low-stock warnings, POS billing)
- **Slide 4:** 3-Tier System Architecture (React 18 SPA $\leftrightarrow$ Java 21 REST API $\leftrightarrow$ MySQL InnoDB)
- **Slide 5:** Relational Database Design (5 Normalized 3NF Tables with Foreign Keys & Constraints)
- **Slide 6:** Application Modules (Dashboard, Products, Stock Ledger, POS Register, Reports)
- **Slide 7:** Smart Business Formulas (Dynamic status calculation, reorder equation, atomic ACID sales)
- **Slide 8:** 5-Step Live Demonstration Flow (Dashboard $\rightarrow$ Add Product $\rightarrow$ Restock $\rightarrow$ Sell $\rightarrow$ Export CSV)
- **Slide 9:** Top Viva Questions & Architectural Defenses (Why JDBC, SQL injection prevention, non-negative stock)
- **Slide 10:** Conclusion & Future Scope (Barcode scanner hardware support, cloud sync, summary)
