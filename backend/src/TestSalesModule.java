import model.Product;
import model.Sale;
import model.StockTransaction;
import service.ProductService;
import service.SaleService;
import service.StockService;

import java.util.List;

/**
 * TestSalesModule - Verification Program for Sales & Point of Sale (POS) Module
 * Tests atomic sale execution, stock deduction, and Edge Case 10 (insufficient stock).
 */
public class TestSalesModule {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("TESTING SALES & POS MODULE (RULES & ATOMICITY)");
        System.out.println("==================================================");

        SaleService saleService = new SaleService();
        ProductService productService = new ProductService();
        StockService stockService = new StockService();

        // 1. Rejection of Zero or Negative Quantity
        System.out.print("[1/4] Rejection of Zero or Negative Quantity Sold... ");
        boolean invalidQtyCaught = false;
        try {
            saleService.recordSale(1, 0);
        } catch (IllegalArgumentException e) {
            invalidQtyCaught = true;
        } catch (Exception ignored) {}
        assert invalidQtyCaught : "Should reject quantity <= 0";
        System.out.println("PASSED (Rejected quantity <= 0)");

        // 2. Edge Case 10: Sale Greater Than Available Stock
        System.out.print("[2/4] Edge Case 10: Sale Greater Than Available Stock... ");
        boolean insufficientStockCaught = false;
        try {
            // Attempting to sell 99,999 units of product 1
            saleService.recordSale(1, 99999);
        } catch (IllegalArgumentException e) {
            insufficientStockCaught = true;
        } catch (Exception ignored) {}
        assert insufficientStockCaught : "Should reject sale exceeding available stock";
        System.out.println("PASSED (Rejected with Insufficient Stock warning)");

        // 3. Atomic Live Sale Transaction
        System.out.print("[3/4] Testing Atomic POS Sale Transaction in MySQL... ");
        try {
            Product before = productService.getProductById(1); // Blue Ball Pen
            int initialStock = before.getQuantity();

            // Record sale of 2 pens
            Sale sale = saleService.recordSale(1, 2);
            assert sale.getSaleId() > 0 : "Sale ID should be generated";
            assert sale.getTotalAmount() == 20.0 : "Expected total amount 20.0";

            Product after = productService.getProductById(1);
            assert after.getQuantity() == initialStock - 2 : "Stock should decrease by 2";

            System.out.println("PASSED!");
            System.out.println("   -> Sale ID: #" + sale.getSaleId() + " | Item: " + sale.getProductName() + 
                    " | Sold: " + sale.getQuantitySold() + " | Total: ₹" + sale.getTotalAmount());
            System.out.println("   -> Stock before: " + initialStock + " | Stock after: " + after.getQuantity());

        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }

        // 4. Audit Trail Verification
        System.out.print("[4/4] Verifying Matching OUTWARD Audit Transaction... ");
        try {
            List<StockTransaction> history = stockService.getTransactionHistory();
            StockTransaction latest = history.get(0);
            assert "OUTWARD".equals(latest.getTransactionType()) : "Latest transaction must be OUTWARD";
            assert latest.getQuantity() == 2 : "Audit quantity must be 2";
            System.out.println("PASSED! Found audit record: " + latest.getRemarks() + " (Type: " + latest.getTransactionType() + ")");
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
        }

        System.out.println("==================================================");
        System.out.println("SALES MODULE VERIFICATION COMPLETE");
        System.out.println("==================================================");
    }
}
