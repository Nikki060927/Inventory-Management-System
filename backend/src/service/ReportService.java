package service;

import dao.ProductDAO;
import dao.StockTransactionDAO;
import model.DashboardSummary;
import model.Product;
import model.StockTransaction;
import model.ValuationReport;
import util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * ReportService - Business logic for Reports, Analytics, Low-Stock Alerting, and Valuations
 */
public class ReportService {

    private final ProductDAO productDAO;
    private final StockTransactionDAO stockTransactionDAO;

    public ReportService() {
        this.productDAO = new ProductDAO();
        this.stockTransactionDAO = new StockTransactionDAO();
    }

    public ReportService(ProductDAO productDAO, StockTransactionDAO stockTransactionDAO) {
        this.productDAO = productDAO;
        this.stockTransactionDAO = stockTransactionDAO;
    }

    /**
     * Aggregates high-level metrics for the Dashboard summary cards:
     * - Total Products (SKU count)
     * - Total Stock (Total discrete units)
     * - Low Stock Count (quantity <= reorder_point AND quantity > 0)
     * - Out of Stock Count (quantity == 0)
     * - Inventory Valuation (sum of unit_price * quantity)
     */
    public DashboardSummary getDashboardSummary() throws SQLException {
        String sql = "SELECT " +
                     "COUNT(*) AS total_products, " +
                     "COALESCE(SUM(quantity), 0) AS total_stock, " +
                     "COALESCE(SUM(CASE WHEN quantity > 0 AND quantity <= reorder_point THEN 1 ELSE 0 END), 0) AS low_stock_count, " +
                     "COALESCE(SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END), 0) AS out_of_stock_count, " +
                     "COALESCE(SUM(unit_price * quantity), 0.0) AS total_value " +
                     "FROM products";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return new DashboardSummary(
                        rs.getInt("total_products"),
                        rs.getInt("total_stock"),
                        rs.getInt("low_stock_count"),
                        rs.getInt("out_of_stock_count"),
                        rs.getDouble("total_value")
                );
            }
        }
        return new DashboardSummary(0, 0, 0, 0, 0.0);
    }

    /**
     * Retrieves all products where quantity <= reorder_point,
     * including calculated suggested reorder quantities: (reorder_point * 2) - quantity.
     */
    public List<Product> getLowStockReport() throws SQLException {
        List<Product> list = new ArrayList<>();
        String sql = "SELECT p.product_id, p.product_name, p.sku, p.barcode, " +
                     "p.category_id, c.category_name, p.supplier_id, s.supplier_name, " +
                     "p.unit_price, p.quantity, p.reorder_point, p.bin_location, " +
                     "p.created_at, p.updated_at " +
                     "FROM products p " +
                     "JOIN categories c ON p.category_id = c.category_id " +
                     "JOIN suppliers s ON p.supplier_id = s.supplier_id " +
                     "WHERE p.quantity <= p.reorder_point " +
                     "ORDER BY p.quantity ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Product p = new Product();
                p.setProductId(rs.getInt("product_id"));
                p.setProductName(rs.getString("product_name"));
                p.setSku(rs.getString("sku"));
                p.setBarcode(rs.getString("barcode"));
                p.setCategoryId(rs.getInt("category_id"));
                p.setCategoryName(rs.getString("category_name"));
                p.setSupplierId(rs.getInt("supplier_id"));
                p.setSupplierName(rs.getString("supplier_name"));
                p.setUnitPrice(rs.getDouble("unit_price"));
                p.setQuantity(rs.getInt("quantity"));
                p.setReorderPoint(rs.getInt("reorder_point"));
                p.setBinLocation(rs.getString("bin_location"));
                list.add(p);
            }
        }
        return list;
    }

    /**
     * Generates a complete financial valuation report:
     * - Grand total valuation
     * - Category-wise breakdown
     * - Product-wise breakdown
     */
    public ValuationReport getValuationReport() throws SQLException {
        ValuationReport report = new ValuationReport();

        // 1. Category-wise valuation query
        String catSql = "SELECT c.category_name, " +
                        "COUNT(p.product_id) AS total_items, " +
                        "COALESCE(SUM(p.quantity), 0) AS total_units, " +
                        "COALESCE(SUM(p.unit_price * p.quantity), 0.0) AS category_value " +
                        "FROM categories c " +
                        "LEFT JOIN products p ON c.category_id = p.category_id " +
                        "GROUP BY c.category_id, c.category_name " +
                        "ORDER BY category_value DESC";

        double grandTotal = 0.0;
        int grandUnits = 0;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(catSql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                double catVal = rs.getDouble("category_value");
                int units = rs.getInt("total_units");
                grandTotal += catVal;
                grandUnits += units;

                report.getCategoryValuations().add(new ValuationReport.CategoryValuation(
                        rs.getString("category_name"),
                        rs.getInt("total_items"),
                        units,
                        catVal
                ));
            }
        }

        report.setGrandTotalValue(grandTotal);
        report.setGrandTotalUnits(grandUnits);

        // 2. Product-wise valuation query
        String prodSql = "SELECT product_id, product_name, sku, unit_price, quantity, " +
                         "(unit_price * quantity) AS total_value " +
                         "FROM products " +
                         "ORDER BY total_value DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(prodSql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                report.getProductValuations().add(new ValuationReport.ProductValuation(
                        rs.getInt("product_id"),
                        rs.getString("product_name"),
                        rs.getString("sku"),
                        rs.getDouble("unit_price"),
                        rs.getInt("quantity"),
                        rs.getDouble("total_value")
                ));
            }
        }

        return report;
    }

    /**
     * Retrieves full chronological stock movement audit trail.
     */
    public List<StockTransaction> getStockMovementReport() throws SQLException {
        return stockTransactionDAO.getAll();
    }
}
