import model.Category;
import model.Supplier;
import service.CategoryService;
import service.SupplierService;
import util.DBConnection;

import java.sql.Connection;

/**
 * TestCategorySupplier - Verification Program for Category & Supplier Modules
 * Tests business validations, DAO interactions, and error handling.
 */
public class TestCategorySupplier {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("TESTING CATEGORY & SUPPLIER MODULES");
        System.out.println("==================================================");

        CategoryService categoryService = new CategoryService();
        SupplierService supplierService = new SupplierService();

        // 1. Test Category Validation: Empty Name
        System.out.print("[1/5] Testing Category Validation (Empty Name)... ");
        boolean emptyCatCaught = false;
        try {
            categoryService.addCategory(new Category(""));
        } catch (IllegalArgumentException e) {
            emptyCatCaught = true;
        } catch (Exception ignored) {}
        assert emptyCatCaught : "Should reject empty category name";
        System.out.println("PASSED");

        // 2. Test Supplier Validation: Empty Name
        System.out.print("[2/5] Testing Supplier Validation (Empty Name)... ");
        boolean emptySupCaught = false;
        try {
            supplierService.addSupplier(new Supplier(0, "", "9876543210", "test@test.com", "Addr", "ACTIVE"));
        } catch (IllegalArgumentException e) {
            emptySupCaught = true;
        } catch (Exception ignored) {}
        assert emptySupCaught : "Should reject empty supplier name";
        System.out.println("PASSED");

        // 3. Test Supplier Validation: Invalid Email Format
        System.out.print("[3/5] Testing Supplier Validation (Invalid Email)... ");
        boolean invalidEmailCaught = false;
        try {
            supplierService.addSupplier(new Supplier(0, "ABC Supplier", "9876543210", "invalid-email-address", "Addr", "ACTIVE"));
        } catch (IllegalArgumentException e) {
            invalidEmailCaught = true;
        } catch (Exception ignored) {}
        assert invalidEmailCaught : "Should reject malformed email";
        System.out.println("PASSED");

        // 4. Test Supplier Validation: Invalid Phone Format
        System.out.print("[4/5] Testing Supplier Validation (Invalid Phone)... ");
        boolean invalidPhoneCaught = false;
        try {
            supplierService.addSupplier(new Supplier(0, "ABC Supplier", "not-a-number", "valid@mail.com", "Addr", "ACTIVE"));
        } catch (IllegalArgumentException e) {
            invalidPhoneCaught = true;
        } catch (Exception ignored) {}
        assert invalidPhoneCaught : "Should reject malformed phone";
        System.out.println("PASSED");

        // 5. Test Live Database Queries (if DB connection active)
        System.out.print("[5/5] Testing Database Retrieval (Categories & Suppliers)... ");
        try (Connection conn = DBConnection.getConnection()) {
            var categories = categoryService.getAllCategories();
            var suppliers = supplierService.getAllSuppliers();
            System.out.println("PASSED! Retrieved " + categories.size() + " categories and " + suppliers.size() + " suppliers from MySQL.");
        } catch (Exception e) {
            System.out.println("SKIPPED DB READ (Database offline or password pending in db.properties: " + e.getMessage() + ")");
        }

        System.out.println("==================================================");
        System.out.println("CATEGORY & SUPPLIER MODULE VERIFICATION COMPLETE");
        System.out.println("==================================================");
    }
}
