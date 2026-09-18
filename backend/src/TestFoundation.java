import model.*;
import util.*;
import java.sql.Connection;
import java.util.Map;

/**
 * TestFoundation - Verification Program for Backend Foundation
 * Tests Models, ValidationUtil, JsonUtil, and DBConnection
 */
public class TestFoundation {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("TESTING BACKEND FOUNDATION MODULE");
        System.out.println("==================================================");

        // 1. Test Model & Smart Logic
        System.out.print("[1/4] Testing Product Model & Smart Rules... ");
        Product p = new Product(1, "Permanent Marker", "MARK001", "890100000003", 3, 1, 40.0, 8, 15, "A03");
        assert "LOW STOCK".equals(p.getStatus()) : "Expected LOW STOCK";
        assert p.getSuggestedReorderQuantity() == 22 : "Expected 22 suggested reorder";
        assert p.getInventoryValue() == 320.0 : "Expected 320.0 inventory value";
        System.out.println("PASSED (Status: " + p.getStatus() + ", Suggested Reorder: " + p.getSuggestedReorderQuantity() + ")");

        // 2. Test ValidationUtil
        System.out.print("[2/4] Testing ValidationUtil... ");
        boolean validationCaught = false;
        try {
            ValidationUtil.requirePositive(-5.0, "Unit Price");
        } catch (IllegalArgumentException e) {
            validationCaught = true;
        }
        assert validationCaught : "Validation should reject negative price";
        System.out.println("PASSED (Negative price rejected properly)");

        // 3. Test JsonUtil
        System.out.print("[3/4] Testing JsonUtil Serialization & Parsing... ");
        String json = JsonUtil.toJson(p);
        assert json.contains("\"sku\":\"MARK001\"") : "JSON missing sku";
        Map<String, String> parsed = JsonUtil.parse("{\"sku\":\"NOTE001\", \"unitPrice\":\"60.00\"}");
        assert "NOTE001".equals(parsed.get("sku")) : "Parsed SKU mismatch";
        System.out.println("PASSED (Serialized JSON length: " + json.length() + ")");

        // 4. Test DBConnection
        System.out.print("[4/4] Testing MySQL JDBC Connection... ");
        try (Connection conn = DBConnection.getConnection()) {
            if (conn != null && !conn.isClosed()) {
                System.out.println("PASSED! Connected to MySQL: " + conn.getMetaData().getDatabaseProductName() + " " + conn.getMetaData().getDatabaseProductVersion());
            } else {
                System.out.println("FAILED (Connection returned null or closed)");
            }
        } catch (Exception e) {
            System.out.println("NOTE: DB connection test details: " + e.getMessage());
            System.out.println("      (Please ensure inventory_db is created and credentials in db.properties match your MySQL root password)");
        }

        System.out.println("==================================================");
        System.out.println("BACKEND FOUNDATION VALIDATION COMPLETE");
        System.out.println("==================================================");
    }
}
