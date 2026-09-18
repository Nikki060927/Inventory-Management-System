# Project Interview & Viva Defense Talking Points
## Smart Stationery Inventory Management System
**Candidate:** Nikhila V | **Register No:** `44731059` | **Target Roles:** Software Development Engineer (SDE), Full-Stack Java Developer

---

## 1. The 60-Second Project Elevator Pitch

> *"For my major capstone project, I served as the Lead Architect for the **Smart Stationery Inventory Management System** — a full-stack, enterprise retail platform engineered with **Core Java 21, JDBC, MySQL 8.0, and React 19**.*  
> *The system manages six key retail workflows: Product Catalog, Categorization, Vendor Logistics, Stock Movement Auditing, Point-of-Sale (POS) Billing, and Real-Time Financial Valuation.*  
> *On the backend, instead of relying on heavyweight frameworks like Spring Boot, I engineered a lightweight REST API using **Java 21 Virtual Threads (Project Loom)** and the **DAO architectural pattern**. This gave us non-blocking concurrency with minimal memory footprint.*  
> *On the frontend, I developed a component-driven React 19 dashboard with automated low-stock threshold alerts (<10 units), dynamic search/filtering, role toggles, and zero-dependency client-side CSV reporting.*  
> *This project demonstrated how modern Java 21 and clean OOP principles can deliver enterprise-grade performance without framework bloat."*

---

## 2. Technical Architecture Highlights & Deep Dives

### A. Why Java 21 Virtual Threads (`Executors.newVirtualThreadPerTaskExecutor()`)?
- **Interview Question:** *"Why did you choose Java 21 Virtual Threads instead of traditional thread pools or Spring Boot?"*
- **Model Answer:**
  > *"Traditional Java thread pools (`Executors.newFixedThreadPool()`) map 1:1 to OS-level platform threads, which consume around 1MB of stack memory each and incur substantial context-switching overhead when handling hundreds of concurrent connections.*  
  > *Java 21 introduced Virtual Threads (Project Loom). Virtual Threads are managed entirely by the JVM at user-space, requiring only a few hundred bytes of heap memory. When a virtual thread blocks on a JDBC database call or socket read, the JVM unmounts it from the carrier platform thread and schedules another task.*  
  > *This allowed our custom `SimpleHttpServer` to handle concurrent POS transactions and stock checks with optimal throughput, zero thread starvation, and clean, readable synchronous-style code."*

### B. Database Design & Transaction Isolation (ACID)
- **Interview Question:** *"How did you prevent race conditions or negative inventory during high-volume sales?"*
- **Model Answer:**
  > *"In retail inventory, race conditions happen when two concurrent sales check the stock at the same time, see 5 units, and both deduct 4 units, resulting in an oversell. We prevented this at two levels:*  
  > *1. **Transactional Integrity (`setAutoCommit(false)`):** In our `SaleDAO` and `StockTransactionDAO`, every checkout operation performs a stock validation, an inventory decrement, and a sales receipt insert inside a single atomic transaction block.*  
  > *2. **Database Constraints & Rollback:** The MySQL column `current_stock` has an unsigned constraint / check (`stock >= 0`). If concurrent updates attempt to decrement below zero, the database throws an exception, our catch block triggers `connection.rollback()`, and the API returns a structured HTTP 400 error (`Insufficient stock available`)."*

### C. Design Patterns Employed
1. **Data Access Object (DAO) Pattern:** Decouples business logic (`ProductService`, `SaleService`) from raw SQL (`ProductDAO`, `SaleDAO`), making queries maintainable and parameterized to eliminate SQL injection.
2. **Service Layer Pattern:** Encapsulates business validation rules (e.g., reorder point verification, price validation, stock thresholds) prior to invoking persistence.
3. **Singleton / Centralized Connection Utility:** `DBConnection.java` provides standardized access to the MySQL connection pool using configurable external `db.properties`.
4. **Observer / Component-Driven UI (React 19):** Reactive state hooks (`useState`, `useEffect`) update stock statuses and dashboard valuation cards instantaneously upon transaction completion.

---

## 3. High-Frequency Interview & Viva Questions & Answers

### Q1: How did you implement CORS and REST communication between React and Java?
> *"Our Java backend exposes endpoints under the `/api` context (e.g., `/api/products`, `/api/sales`). In our custom `ApiHandler`, we set HTTP response headers `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`. For preflight `OPTIONS` requests, the server immediately acknowledges with HTTP 204. In React, our centralized `api.js` service utility utilizes the modern `fetch()` API with JSON serialization and structured error propagation."*

### Q2: How is client-side CSV reporting implemented without external libraries?
> *"Instead of adding heavy third-party npm packages, I wrote a pure JavaScript export utility `exportToCsv()` in `api.js`. It transforms the active dataset array into comma-separated rows with string quoting to escape commas, encodes the string into a `data:text/csv;charset=utf-8` URI, programmatically triggers a virtual `<a download="...">` element click, and cleans up the DOM node. This produces instant offline reports for stock valuation and low-stock audits."*

### Q3: What were the most critical edge cases you handled in this project?
> *"We systematically tested and handled 10 critical edge cases:*  
> *1. Attempting to sell more units than current inventory (clean 400 error + rollback).*  
> *2. Deleting a category that has active products assigned (foreign key constraint protection).*  
> *3. Deleting a supplier with existing stock supply logs.*  
> *4. Entering negative or non-numeric stock quantities or product prices.*  
> *5. Adding duplicate product names or SKUs.*  
> *6. Recording damaged goods with automatic inventory decrement and audit logging.*  
> *7. Handling MySQL server disconnection gracefully with retry warnings.*  
> *8. Dynamic reorder alerts when current stock drops below the defined threshold.*  
> *9. Handling zero-quantity checkout submissions.*  
> *10. Role-based privilege enforcement: restricting catalog creation and financial valuation to Admin mode."*

### Q4: If this system were scaled to 100,000 stores, what architectural changes would you introduce?
> *"To scale this architecture horizontally:*  
> *1. **Connection Pooling:** Upgrade from standard JDBC connections to **HikariCP** for enterprise connection lifecycle management.*  
> *2. **Distributed Caching:** Introduce **Redis** to cache frequently queried read-heavy data like product catalogs and category hierarchies, reducing database read load by up to 80%.*  
> *3. **Message Queue for Stock Audits:** Use **Apache Kafka** or RabbitMQ for asynchronous processing of sales logs, invoice generation, and vendor restock notifications.*  
> *4. **Microservices Migration:** Decompose the monolithic HTTP server into independent microservices (Catalog Service, POS Service, Reporting Service) orchestrated via Docker and Kubernetes."*

---

## 4. Key Metrics to Highlight on Your Resume & in Interviews

- **Technology Stack:** Core Java 21, JDBC, MySQL 8.0, React 19, Vite, RESTful API
- **Modules Implemented:** 6 core business modules (Catalog, Categories, Vendors, Stock In/Out/Damaged, POS, Analytics)
- **Concurrency Model:** Java 21 Virtual Threads (Project Loom) providing non-blocking asynchronous request handling
- **Data Integrity:** 100% ACID compliant with transactional rollback protection against negative stock
- **Performance:** Sub-10ms local response times with zero external heavy framework dependencies
