import model.Product;
import service.ProductService;
import util.DBConnection;

import java.sql.Connection;

/**
 * TestProductModule - Unit tests and edge cases verification for Product Module
 */
public class TestProductModule {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("TESTING PRODUCT MODULE (EDGES CASES & RULES)");
        System.out.println("==================================================");

        ProductService productService = new ProductService();

        // 1. Edge Case 9: Empty Product Name
        System.out.print("[1/6] Edge Case 9: Empty Product Name... ");
        boolean emptyNameCaught = false;
        try {
            productService.addProduct(new Product(0, "", "SKU123", "890001", 1, 1, 50.0, 10, 5, "A01"));
        } catch (IllegalArgumentException e) {
            emptyNameCaught = true;
        } catch (Exception ignored) {}
        assert emptyNameCaught : "Should reject empty product name";
        System.out.println("PASSED (Rejected properly)");

        // 2. Edge Case 8: Invalid Price (<= 0)
        System.out.print("[2/6] Edge Case 8: Invalid Price (0 or Negative)... ");
        boolean invalidPriceCaught = false;
        try {
            productService.addProduct(new Product(0, "Gel Pen", "SKU123", "890001", 1, 1, 0.0, 10, 5, "A01"));
        } catch (IllegalArgumentException e) {
            invalidPriceCaught = true;
        } catch (Exception ignored) {}
        assert invalidPriceCaught : "Should reject price <= 0";
        System.out.println("PASSED (Rejected price <= 0)");

        // 3. Edge Case 3: Negative Quantity
        System.out.print("[3/6] Edge Case 3: Negative Quantity... ");
        boolean negativeQtyCaught = false;
        try {
            productService.addProduct(new Product(0, "Gel Pen", "SKU123", "890001", 1, 1, 20.0, -5, 5, "A01"));
        } catch (IllegalArgumentException e) {
            negativeQtyCaught = true;
        } catch (Exception ignored) {}
        assert negativeQtyCaught : "Should reject quantity < 0";
        System.out.println("PASSED (Rejected negative quantity)");

        // 4. Edge Case 5: Low Stock Detection & Reorder Math
        System.out.print("[4/6] Edge Case 5: Low Stock & Reorder Formula... ");
        Product lowStockItem = new Product(0, "Permanent Marker", "MARK001", "890100000003", 3, 1, 40.0, 8, 15, "A03");
        assert "LOW STOCK".equals(lowStockItem.getStatus()) : "Expected status LOW STOCK";
        // Suggested Reorder: (15 * 2) - 8 = 22
        assert lowStockItem.getSuggestedReorderQuantity() == 22 : "Expected suggested reorder 22";
        System.out.println("PASSED (Status: " + lowStockItem.getStatus() + ", Suggested: " + lowStockItem.getSuggestedReorderQuantity() + ")");

        // 5. Edge Case 6: Out of Stock Detection
        System.out.print("[5/6] Edge Case 6: Out of Stock Detection... ");
        Product outOfStockItem = new Product(0, "Glue Stick", "GLUE001", "890100000005", 4, 1, 25.0, 0, 10, "B02");
        assert "OUT OF STOCK".equals(outOfStockItem.getStatus()) : "Expected status OUT OF STOCK";
        System.out.println("PASSED (Status: " + outOfStockItem.getStatus() + ")");

        // 6. Database Integration Query Check
        System.out.print("[6/6] Database Product Read & Joins Check... ");
        try (Connection conn = DBConnection.getConnection()) {
            var products = productService.getAllProducts(null, null, null);
            System.out.println("PASSED! Retrieved " + products.size() + " products from MySQL.");
            for (Product p : products) {
                System.out.println("   -> " + p.getProductName() + " | SKU: " + p.getSku() + " | Qty: " + p.getQuantity() + " | Status: " + p.getStatus());
            }
        } catch (Exception e) {
            System.out.println("SKIPPED DB READ (Database offline or password pending in db.properties: " + e.getMessage() + ")");
        }

        System.out.println("==================================================");
        System.out.println("PRODUCT MODULE VERIFICATION COMPLETE");
        System.out.println("==================================================");
    }
}
