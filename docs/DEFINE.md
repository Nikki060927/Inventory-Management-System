# PHASE 1 — DEFINE: PROJECT REQUIREMENTS & SCOPE SPECIFICATION

**Project Title:** Smart Stationery Inventory Management System  
**Document Version:** 2.0 (Academic SOP Compliant)  
**Lead Architect:** Nikhila V (Reg No: 44731059)  
**Backend & Database Specialist:** Zaid Basha (Reg No: 44731049)  
**Department:** Computer Science and Engineering  
**Academic Year:** 2025 - 2026  

---

## 1. Project Scope

### In-Scope:
- Real-time catalog management for stationery retail items (pens, notebooks, markers, adhesives, desk tools).
- Multi-criteria product indexing by unique SKU, barcode, unit price, stock quantity, reorder threshold, and shelf bin location.
- Category classification (Pens & Writing, Notebooks & Paper, Markers & Highlighters, Office & Desk Supplies) and Supplier vendor directory.
- Stock movement audit ledger supporting three immutable transaction types: `INWARD` (supplier shipments), `OUTWARD` (internal dispatch), and `DAMAGED` (damaged/dried goods write-off).
- Point of Sale (POS) customer billing register with atomic inventory decrement and real-time total calculation.
- Automated low-stock warning detection ($\le \text{reorder\_point}$) with mathematical suggested reorder quantity calculation: $\max(0, (\text{reorder\_point} \times 2) - \text{quantity})$.
- Real-time financial inventory valuation aggregated by product category.
- Client-side 1-click CSV spreadsheet report generation.

### Out-of-Scope:
- External payment gateway processing (Razorpay, Stripe) — cash/counter billing is modeled.
- E-commerce consumer checkout web portal — system is designed for retail storekeeper/cashier back-office use.
- Multi-warehouse interstate logistics tracking.

---

## 2. Target Stakeholder Personas

### Persona 1: Suresh Sharma (Store Owner / Inventory Manager)
- **Role:** Primary administrator responsible for purchasing, supplier relations, and profit margins.
- **Pain Points:** Lacks real-time visibility into capital tied up in slow-moving stock; experiences stock-outs during school exam season; struggles with handwritten paper registers.
- **Needs:** Executive dashboard with instant KPI cards, automated low-stock warnings with calculated order quantities, and 1-click CSV reports for vendor orders.

### Persona 2: Priya Patel (Store Cashier / Billing Staff)
- **Role:** Front-counter staff handling walk-in student and office customer billing.
- **Pain Points:** Manually verifying whether items are in stock causes long customer queues; accidentally oversells items that are physically out of stock.
- **Needs:** High-speed POS billing screen with instant stock checks, automatic subtotal calculations, and immediate stock balance updates.

---

## 3. MoSCoW Prioritization Matrix

| Priority | Feature / Requirement | Description |
| :--- | :--- | :--- |
| **Must Have** | Core Product & Stock CRUD | Create, read, update, delete stationery items with non-negative stock constraint. |
| **Must Have** | Low-Stock Warnings & Formula | Detect low stock ($\le \text{reorder\_point}$) and compute $(\text{reorder\_point} \times 2) - \text{quantity}$. |
| **Must Have** | Atomic POS Billing | Synchronized sales logging and stock deduction in an ACID database transaction. |
| **Must Have** | Audit Transaction Ledger | Record `INWARD`, `OUTWARD`, and `DAMAGED` events with timestamps and remarks. |
| **Should Have**| Executive KPI Dashboard | Live summary cards (Total Products, Stock Units, Alerts, Valuation). |
| **Should Have**| 1-Click CSV Export | Pure client-side CSV spreadsheet generation without external libraries. |
| **Could Have** | Shelf Bin Location Tracking | Tag shelf locations (e.g., `A01`, `B02`) to optimize in-store retrieval. |
| **Won't Have** | Biometric Hardware Auth | Deferred to future commercial enterprise release. |

---

## 4. User Stories & Acceptance Criteria (Given/When/Then)

### User Story 1: Add New Product with Duplicate SKU Guard
- **As a** store manager, **I want** to register new stationery products with a unique SKU, **so that** my store items have unambiguous tracking codes.
- **Scenario 1 (Valid Product Addition):**
  - **Given:** The user provides Name "Gel Pen Blue", SKU "GEL002", Price 15.00, Quantity 50, Reorder 15.
  - **When:** The user clicks "Save Product".
  - **Then:** The product is stored in MySQL, status displays `IN STOCK`, and a success toast appears.
- **Scenario 2 (Duplicate SKU Rejection):**
  - **Given:** A product already exists with SKU "PEN001".
  - **When:** The user attempts to save another product with SKU "PEN001".
  - **Then:** The system rejects the request with HTTP `409 Conflict` and displays "SKU already exists".

### User Story 2: Automatic Low-Stock Warning & Reorder Recommendation
- **As a** store manager, **I want** the system to alert me when an item's quantity drops to or below its reorder threshold, **so that** I can order replacement stock before running out.
- **Scenario 1 (Threshold Trigger):**
  - **Given:** A product has `quantity = 8` and `reorder_point = 15`.
  - **When:** The store manager navigates to the Dashboard or Low-Stock Report.
  - **Then:** The item appears in the Low-Stock Warning Table with status `LOW STOCK` and Suggested Reorder Quantity $= (15 \times 2) - 8 = 22$ units.
- **Scenario 2 (Out of Stock Alert):**
  - **Given:** A product has `quantity = 0`.
  - **When:** Queried via API or UI.
  - **Then:** The item displays status `OUT OF STOCK` with a red badge and urgent replenishment prompt.

### User Story 3: Atomic POS Customer Billing
- **As a** store cashier, **I want** to record sales transactions with automatic stock decrement, **so that** inventory stays synchronized in real-time.
- **Scenario 1 (Successful Sale):**
  - **Given:** "Blue Ball Pen" has 150 units in stock at ₹10.00 each.
  - **When:** The cashier enters Quantity Sold = 5 and clicks "Complete Sale".
  - **Then:** The total price ₹50.00 is calculated, product stock drops to 145, an `OUTWARD` audit transaction is logged, and the sale is recorded.
- **Scenario 2 (Overselling Prevention):**
  - **Given:** "Desktop Stapler" has 6 units in stock.
  - **When:** The cashier attempts to sell 10 units.
  - **Then:** The transaction rolls back, stock remains 6, and the system alerts "Insufficient stock available".

### User Story 4: Restock Delivery Inward Intake
- **As a** storekeeper, **I want** to record incoming supplier shipments, **so that** product stock counts increase and low-stock alerts clear.
- **Scenario 1 (Inward Restock):**
  - **Given:** "Permanent Black Marker" has 8 units and shows `LOW STOCK`.
  - **When:** An inward transaction of +50 units is recorded.
  - **Then:** Stock becomes 58 units, status transitions to `IN STOCK` (Green badge), and the audit ledger records `INWARD` with timestamp.

### User Story 5: Damaged Goods Write-off
- **As a** storekeeper, **I want** to write off broken or dried-up stationery without recording revenue, **so that** physical stock matches system stock.
- **Scenario 1 (Damaged Intake):**
  - **Given:** A product has 20 units in stock.
  - **When:** 2 units are marked as `DAMAGED` with remark "Dried ink leakage".
  - **Then:** Stock decreases to 18 units, the event is logged in `stock_transactions`, and zero sales revenue is added.

### User Story 6: Category Financial Valuation & CSV Export
- **As a** store owner, **I want** to view total asset valuation by category and export reports to CSV, **so that** I have physical spreadsheets for supplier audits.
- **Scenario 1 (Valuation Calculation):**
  - **Given:** Pens category has 150 units @ ₹10 (₹1500) and 80 units @ ₹15 (₹1200).
  - **When:** Valuation report is generated.
  - **Then:** Category valuation displays ₹2,700.00.
- **Scenario 2 (CSV Download):**
  - **Given:** Valuation report is visible on screen.
  - **When:** User clicks "Export Valuation CSV".
  - **Then:** A valid `.csv` file downloads automatically to the user's browser.

---

## 5. Non-Functional Requirements (NFRs)

- **NFR-1 (Performance):** REST API endpoints must respond in $< 50\text{ ms}$ on localhost under normal load.
- **NFR-2 (Reliability & ACID):** All stock updates during POS billing must be 100% atomic (`setAutoCommit(false)` with explicit `commit()` and `rollback()`).
- **NFR-3 (Security & SQL Injection Immunity):** Zero raw string concatenation in SQL queries. 100% parameterized `PreparedStatement`.
- **NFR-4 (Explainability):** Zero external framework abstractions (No Spring Boot, No Hibernate, No React runtime). Clean, readable code for academic viva defense.
- **NFR-5 (Light Academic Aesthetic):** Light theme UI with high-contrast text suitable for college classroom projectors.
- **NFR-6 (Data Integrity):** Relational schema enforced with foreign keys, unique SKU indices, and `CHECK (quantity >= 0)`.
