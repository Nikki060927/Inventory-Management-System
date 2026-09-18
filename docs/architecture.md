# 3-TIER SYSTEM ARCHITECTURE & MULTI-PORT DATA FLOW SPECIFICATION

**Project:** Smart Stationery Inventory Management System  
**Lead Architect:** Nikhila V (Reg No: 44731059)  
**Backend & Database Specialist:** Zaid Basha (Reg No: 44731049)  

---

## 1. Network & Port Allocation

```
+---------------------------------------------------------------------------------------------------+
|                                  3-TIER ARCHITECTURAL DATA FLOW                                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|   [Presentation Tier]                  [Application / Business Tier]      [Data Persistence Tier]  |
|   HTML5 + CSS3 + JS (ES6+)      -->     Java SE (HttpServer / JDBC)  -->   MySQL Server 8.0        |
|   Client Browser (Port 5500 / 8080)    Application Server (Port 8080)     Database Engine (Port 3306)
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

- **Port 5500 / 8080:** Client Presentation Tier (serves semantic HTML5, CSS3 light theme, and ES6+ Vanilla JavaScript).
- **Port 8080:** Application / Business Logic Server (`com.sun.net.httpserver.HttpServer` powered by Java 21 Virtual Threads).
- **Port 3306:** Relational Database Engine (`MySQL Server 8.0` / InnoDB with 3NF schema `inventory_db`).

---

## 2. Component Responsibility Matrix

### A. Presentation Tier (`frontend/`)
- `index.html`: Semantic layout, cards, modal dialogs, and responsive tables.
- `css/style.css`: Light academic theme using CSS Grid & Flexbox; zero framework bloat.
- `js/script.js`:
  - Asynchronous `fetch()` client managing CRUD requests against `:8080/api`.
  - Dynamic stock status badge computation.
  - Client-side CSV generator triggering spreadsheet downloads in pure JavaScript.

### B. Business Logic Tier (`backend/src/`)
- `Main.java`: Initializes database connection, checks table schemas, and launches `SimpleHttpServer`.
- `server/SimpleHttpServer.java`:
  - Dispatches HTTP requests using Java 21 Virtual Threads (`Executors.newVirtualThreadPerTaskExecutor()`).
  - Sets CORS headers (`Access-Control-Allow-Origin: *`).
  - Serves static frontend assets and REST JSON payloads.
- `service/`:
  - `ProductService`: Validates positive pricing, SKU uniqueness, and reorder points.
  - `StockService`: Manages `INWARD`, `OUTWARD`, and `DAMAGED` stock ledger entries.
  - `SaleService`: Coordinates atomic 3-way POS sales transactions.
  - `ReportService`: Calculates live store valuation and low-stock filters.
- `dao/`:
  - Implements raw JDBC using `java.sql.PreparedStatement` to guarantee 100% SQL injection immunity.

### C. Data Persistence Tier (`database/`)
- Relational schema enforcing primary keys, foreign keys, cascading rules, and check constraints (`CHECK (quantity >= 0)`).
- Strict ACID transaction guarantees under MySQL InnoDB storage engine.
