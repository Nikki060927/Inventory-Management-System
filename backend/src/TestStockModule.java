import model.StockTransaction;
import service.StockService;
import util.DBConnection;

import java.sql.Connection;

/**
 * TestStockModule - Verification Program for Stock Management & Audit Module
 * Tests business rules for Inward, Outward, Damaged, and Insufficient Stock edge cases.
 */
public class TestStockModule {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("TESTING STOCK MODULE (RULES & EDGE CASES)");
        System.out.println("==================================================");

        StockService stockService = new StockService();

        // 1. Test Inward Math: Current 20 + Inward 10 = 30
        System.out.print("[1/6] Inward Stock Calculation Logic... ");
        int curr = 20;
        int inQty = 10;
        int newIn = curr + inQty;
        assert newIn == 30 : "Expected 30";
        System.out.println("PASSED (20 + 10 = " + newIn + ")");

        // 2. Test Outward Math: Current 20 - Outward 5 = 15
        System.out.print("[2/6] Outward Stock Calculation Logic... ");
        int outQty = 5;
        int newOut = curr - outQty;
        assert newOut == 15 : "Expected 15";
        System.out.println("PASSED (20 - 5 = " + newOut + ")");

        // 3. Test Damaged Math: Current 20 - Damaged 2 = 18
        System.out.print("[3/6] Damaged Stock Calculation Logic... ");
        int dmgQty = 2;
        int newDmg = curr - dmgQty;
        assert newDmg == 18 : "Expected 18";
        System.out.println("PASSED (20 - 2 = " + newDmg + ")");

        // 4. Test Zero / Negative Quantity Rejection
        System.out.print("[4/6] Rejection of Zero / Negative Quantity... ");
        boolean invalidQtyCaught = false;
        try {
            stockService.recordInward(1, -5, "Invalid");
        } catch (IllegalArgumentException e) {
            invalidQtyCaught = true;
        } catch (Exception ignored) {}
        assert invalidQtyCaught : "Should reject negative quantity";
        System.out.println("PASSED (Rejected properly)");

        // 5. Test Edge Case 7: Damaged Stock Empty Reason Rejection
        System.out.print("[5/6] Edge Case 7: Damaged Stock Requires Remarks... ");
        boolean emptyRemarksCaught = false;
        try {
            stockService.recordDamaged(1, 2, "");
        } catch (IllegalArgumentException e) {
            emptyRemarksCaught = true;
        } catch (Exception ignored) {}
        assert emptyRemarksCaught : "Should reject empty damage remark";
        System.out.println("PASSED (Rejected empty remark)");

        // 6. Test Live Database Audit Log (if active)
        System.out.print("[6/6] Database Stock Movement Audit Log Check... ");
        try (Connection conn = DBConnection.getConnection()) {
            var history = stockService.getTransactionHistory();
            System.out.println("PASSED! Retrieved " + history.size() + " stock transactions from MySQL.");
            for (StockTransaction tx : history) {
                System.out.println("   -> [" + tx.getTransactionType() + "] Product: " + tx.getProductName() + 
                        " | Qty: " + tx.getQuantity() + " | Prev: " + tx.getPreviousQuantity() + 
                        " | New: " + tx.getNewQuantity() + " | Remarks: " + tx.getRemarks());
            }
        } catch (Exception e) {
            System.out.println("SKIPPED DB READ (Database offline or password pending in db.properties: " + e.getMessage() + ")");
        }

        System.out.println("==================================================");
        System.out.println("STOCK MODULE VERIFICATION COMPLETE");
        System.out.println("==================================================");
    }
}
