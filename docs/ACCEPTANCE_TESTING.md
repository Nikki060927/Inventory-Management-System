# PHASE 3 & 4 — ACCEPTANCE CRITERIA VERIFICATION MATRIX

**Project Title:** Smart Stationery Inventory Management System  
**Lead Evaluators:** Academic Defense Committee  
**Students:** Nikhila V (44731059) & Zaid Basha (44731049)  
**Verification Date:** 2026-09-18  
**Final Status:** ALL 12 ACCEPTANCE CRITERIA TESTED & PASSED (100% SUCCESS)  

---

## Acceptance Testing Execution Log

| Test ID | User Story / Feature | Test Steps Executed | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Database & Driver Foundation | Check MySQL 8.0 connectivity and verify driver loading via `DBConnection.java`. | Connection established without errors; table metadata verified. | Connected successfully to `inventory_db` via port 3306. | **PASS** |
| **TC-02** | Add Valid Product | Submit new item: "Gel Pen Blue", SKU "GEL002", Price ₹15, Qty 50, Reorder 10. | HTTP 201 Created; Product appears with `IN STOCK` badge. | Product ID created; returned JSON matches input fields. | **PASS** |
| **TC-03** | Duplicate SKU Rejection | Attempt to add a second product with existing SKU `PEN001`. | System returns HTTP 409 Conflict with clear error message. | HTTP 409 returned: "A product with SKU PEN001 already exists." | **PASS** |
| **TC-04** | Negative Price Guard | Submit product with unit price `-20.00`. | System rejects payload with HTTP 400 Bad Request. | HTTP 400: "Unit price must be greater than zero." | **PASS** |
| **TC-05** | Dynamic Low Stock Alert | Query product with `quantity = 8` and `reorder_point = 15`. | Status displayed as `LOW STOCK`; Reorder formula suggests 22 units. | Status badge displays Amber `LOW STOCK`; suggested order is 22. | **PASS** |
| **TC-06** | Out of Stock Alert | Query product with `quantity = 0`. | Status displayed as `OUT OF STOCK` with Red badge. | Red badge rendered with warning to restock immediately. | **PASS** |
| **TC-07** | Inward Stock Restock | Submit Inward adjustment for +50 units on product with 8 units. | Quantity updates to 58; status changes from LOW to IN STOCK. | Quantity updated to 58; audit ledger logs `INWARD`. | **PASS** |
| **TC-08** | Atomic POS Sale | Execute POS sale for 5 units of Blue Ball Pen (Price ₹10.00). | Quantity decrements by 5; `sales` record created; ledger updated. | Total ₹50.00 recorded; stock decreased; audit ledger updated atomically. | **PASS** |
| **TC-09** | POS Overselling Guard | Attempt to sell 100 units when only 6 units exist in inventory. | Transaction aborts; stock remains 6; error alert displayed. | HTTP 400: "Insufficient stock available for this product." | **PASS** |
| **TC-10** | Damaged Goods Audit | Record 2 units of damaged dried markers with reason note. | Stock decrements by 2; transaction recorded as `DAMAGED`; zero sales added. | Quantity updated; audit ledger logs `DAMAGED`; no sales revenue created. | **PASS** |
| **TC-11** | Category Valuation | Generate financial valuation report across all categories. | Computes $\sum (\text{Qty} \times \text{Price})$ correctly for each category. | Mathematical valuation matches database sum exactly. | **PASS** |
| **TC-12** | 1-Click CSV Export | Click "Export Valuation CSV" in reports view. | Browser downloads valid formatted `.csv` spreadsheet file. | `.csv` file downloaded cleanly without third-party library errors. | **PASS** |

---

## Conclusion
All functional requirements, edge case guards, and transactional boundaries have been rigorously verified. The software is robust, compliant with the academic SOP, and ready for evaluator inspection.
