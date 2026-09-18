package service;

import dao.ProductDAO;
import dao.StockTransactionDAO;
import model.Product;
import model.StockTransaction;
import util.DBConnection;
import util.ValidationUtil;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

/**
 * StockService - Business logic for Inventory Stock Adjustments & Movement Audits
 * Enforces transaction atomicity, negative stock prevention, and immutable logging.
 */
public class StockService {

    private final ProductDAO productDAO;
    private final StockTransactionDAO stockTransactionDAO;

    public StockService() {
        this.productDAO = new ProductDAO();
        this.stockTransactionDAO = new StockTransactionDAO();
    }

    public StockService(ProductDAO productDAO, StockTransactionDAO stockTransactionDAO) {
        this.productDAO = productDAO;
        this.stockTransactionDAO = stockTransactionDAO;
    }

    /**
     * Records INWARD stock receipt (Restocking from vendor).
     * new_stock = current_stock + inward_quantity
     */
    public StockTransaction recordInward(int productId, int quantity, String remarks) throws SQLException {
        ValidationUtil.requirePositive(quantity, "Inward Quantity");

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            Product product = productDAO.getById(productId);
            if (product == null) {
                throw new IllegalArgumentException("Product not found with ID: " + productId);
            }

            int prevQty = product.getQuantity();
            int newQty = prevQty + quantity;

            // 1. Update product quantity
            productDAO.updateQuantity(conn, productId, newQty);

            // 2. Insert audit log
            String auditRemarks = (remarks != null && !remarks.trim().isEmpty()) ? remarks.trim() : "Stock Inward Receipt";
            StockTransaction tx = new StockTransaction(productId, "INWARD", quantity, prevQty, newQty, auditRemarks);
            stockTransactionDAO.insert(conn, tx);

            conn.commit();

            tx.setProductName(product.getProductName());
            return tx;
        } catch (Exception e) {
            DBConnection.rollback(conn);
            throw e;
        } finally {
            DBConnection.close(conn);
        }
    }

    /**
     * Records OUTWARD stock dispatch (Store usage, branch transfer).
     * Enforces negative stock prevention.
     */
    public StockTransaction recordOutward(int productId, int quantity, String remarks) throws SQLException {
        ValidationUtil.requirePositive(quantity, "Outward Quantity");

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            Product product = productDAO.getById(productId);
            if (product == null) {
                throw new IllegalArgumentException("Product not found with ID: " + productId);
            }

            int prevQty = product.getQuantity();

            // Edge Case 4: Insufficient Stock check
            if (quantity > prevQty) {
                throw new IllegalArgumentException("Insufficient stock. Available: " + prevQty + ", Requested Outward: " + quantity);
            }

            int newQty = prevQty - quantity;

            // 1. Update product quantity
            productDAO.updateQuantity(conn, productId, newQty);

            // 2. Insert audit log
            String auditRemarks = (remarks != null && !remarks.trim().isEmpty()) ? remarks.trim() : "Stock Outward Dispatch";
            StockTransaction tx = new StockTransaction(productId, "OUTWARD", quantity, prevQty, newQty, auditRemarks);
            stockTransactionDAO.insert(conn, tx);

            conn.commit();

            tx.setProductName(product.getProductName());
            return tx;
        } catch (Exception e) {
            DBConnection.rollback(conn);
            throw e;
        } finally {
            DBConnection.close(conn);
        }
    }

    /**
     * Records DAMAGED stock (Breakage, leakage, defects).
     * Enforces mandatory damage reason and negative stock prevention.
     */
    public StockTransaction recordDamaged(int productId, int quantity, String remarks) throws SQLException {
        ValidationUtil.requirePositive(quantity, "Damaged Quantity");
        // Edge Case 7: Damaged goods require explicit remarks
        ValidationUtil.requireNonEmpty(remarks, "Damage Reason / Remarks");

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            Product product = productDAO.getById(productId);
            if (product == null) {
                throw new IllegalArgumentException("Product not found with ID: " + productId);
            }

            int prevQty = product.getQuantity();

            // Edge Case 4: Insufficient Stock check
            if (quantity > prevQty) {
                throw new IllegalArgumentException("Insufficient stock. Available: " + prevQty + ", Requested Damaged: " + quantity);
            }

            int newQty = prevQty - quantity;

            // 1. Update product quantity
            productDAO.updateQuantity(conn, productId, newQty);

            // 2. Insert audit log
            StockTransaction tx = new StockTransaction(productId, "DAMAGED", quantity, prevQty, newQty, remarks.trim());
            stockTransactionDAO.insert(conn, tx);

            conn.commit();

            tx.setProductName(product.getProductName());
            return tx;
        } catch (Exception e) {
            DBConnection.rollback(conn);
            throw e;
        } finally {
            DBConnection.close(conn);
        }
    }

    /**
     * Retrieves chronological audit history.
     */
    public List<StockTransaction> getTransactionHistory() throws SQLException {
        return stockTransactionDAO.getAll();
    }

    /**
     * Retrieves audit history for a single product.
     */
    public List<StockTransaction> getProductTransactionHistory(int productId) throws SQLException {
        return stockTransactionDAO.getByProductId(productId);
    }
}
