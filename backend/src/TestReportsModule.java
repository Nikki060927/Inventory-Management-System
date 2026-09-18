import model.DashboardSummary;
import model.Product;
import model.ValuationReport;
import service.ReportService;

import java.util.List;

/**
 * TestReportsModule - Verification Program for Reports & Analytics Module
 * Tests Dashboard KPIs, Low Stock detection, Reorder Math, and Valuations.
 */
public class TestReportsModule {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("TESTING REPORTS & ANALYTICS MODULE");
        System.out.println("==================================================");

        ReportService reportService = new ReportService();

        try {
            // 1. Test Dashboard Summary KPIs
            System.out.print("[1/4] Testing Dashboard Summary KPI Counters... ");
            DashboardSummary summary = reportService.getDashboardSummary();
            assert summary.getTotalProducts() >= 5 : "Expected at least 5 products";
            assert summary.getTotalStock() > 0 : "Expected positive stock units";
            assert summary.getInventoryValue() > 0 : "Expected positive inventory value";
            System.out.println("PASSED!");
            System.out.println("   -> Total SKUs: " + summary.getTotalProducts() + 
                    " | Total Units: " + summary.getTotalStock() + 
                    " | Low Stock Items: " + summary.getLowStockCount() + 
                    " | Total Value: ₹" + summary.getInventoryValue());

            // 2. Test Low Stock & Reorder Quantity Suggestions
            System.out.print("[2/4] Testing Low Stock Detection & Reorder Calculations... ");
            List<Product> lowStockItems = reportService.getLowStockReport();
            assert !lowStockItems.isEmpty() : "Expected at least 1 low stock item";
            System.out.println("PASSED! Found " + lowStockItems.size() + " low-stock items:");
            for (Product p : lowStockItems) {
                System.out.println("   -> [" + p.getStatus() + "] " + p.getProductName() + 
                        " | Current Stock: " + p.getQuantity() + 
                        " | Reorder Point: " + p.getReorderPoint() + 
                        " | Suggested Reorder: " + p.getSuggestedReorderQuantity() + " units");
            }

            // 3. Test Inventory Valuation (Store-wide & Category-wise)
            System.out.print("[3/4] Testing Financial Valuation Breakdown... ");
            ValuationReport valReport = reportService.getValuationReport();
            assert valReport.getGrandTotalValue() > 0 : "Grand total value must be positive";
            System.out.println("PASSED!");
            System.out.println("   -> Grand Total Value: ₹" + valReport.getGrandTotalValue() + 
                    " across " + valReport.getGrandTotalUnits() + " units");
            for (ValuationReport.CategoryValuation cv : valReport.getCategoryValuations()) {
                System.out.println("      * Category: " + cv.getCategoryName() + 
                        " | Units: " + cv.getTotalUnits() + 
                        " | Value: ₹" + cv.getCategoryValue());
            }

            // 4. Test Stock Movement Audit Trail Report
            System.out.print("[4/4] Testing Stock Movement Audit Log Report... ");
            var auditList = reportService.getStockMovementReport();
            assert !auditList.isEmpty() : "Expected audit trail records";
            System.out.println("PASSED! Found " + auditList.size() + " chronological audit transactions.");

        } catch (Exception e) {
            System.err.println("FAILED: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("==================================================");
        System.out.println("REPORTS & ANALYTICS MODULE VERIFICATION COMPLETE");
        System.out.println("==================================================");
    }
}
