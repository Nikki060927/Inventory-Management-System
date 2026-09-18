package service;

import dao.ProductDAO;
import dao.SaleDAO;
import dao.StockTransactionDAO;
import model.Product;
import model.Sale;
import model.StockTransaction;
import util.DBConnection;
import util.ValidationUtil;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

/**
 * SaleService - Business logic for Point of Sale (POS) Transactions
 * Coordinates atomic stock deduction, sales recording, and outward audit logging.
 */
public class SaleService {

    private final ProductDAO productDAO;
    private final SaleDAO saleDAO;
    private final StockTransactionDAO stockTransactionDAO;

    public SaleService() {
        this.productDAO = new ProductDAO();
        this.saleDAO = new SaleDAO();
        this.stockTransactionDAO = new StockTransactionDAO();
    }

    public SaleService(ProductDAO productDAO, SaleDAO saleDAO, StockTransactionDAO stockTransactionDAO) {
        this.productDAO = productDAO;
        this.saleDAO = saleDAO;
        this.stockTransactionDAO = stockTransactionDAO;
    }

    /**
     * Executes a Point of Sale transaction atomically:
     * 1. Validates available stock.
     * 2. Deducts product stock.
     * 3. Inserts a sale record.
     * 4. Creates an OUTWARD stock transaction log.
     */
    public Sale recordSale(int productId, int quantitySold) throws SQLException {
        ValidationUtil.requirePositive(quantitySold, "Quantity Sold");

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false); // Begin ACID transaction

            Product product = productDAO.getById(productId);
            if (product == null) {
                throw new IllegalArgumentException("Product not found with ID: " + productId);
            }

            int availableStock = product.getQuantity();

            // Edge Case 10: Sale Greater Than Available Stock
            if (quantitySold > availableStock) {
                throw new IllegalArgumentException("Insufficient stock for sale. Available: " + availableStock + 
                        ", Requested: " + quantitySold);
            }

            double unitPrice = product.getUnitPrice();
            double totalAmount = Math.round(quantitySold * unitPrice * 100.0) / 100.0;
            int newStock = availableStock - quantitySold;

            // 1. Deduct product stock
            productDAO.updateQuantity(conn, productId, newStock);

            // 2. Insert into sales table
            Sale sale = new Sale(productId, quantitySold, unitPrice, totalAmount);
            int saleId = saleDAO.insert(conn, sale);
            sale.setSaleId(saleId);
            sale.setProductName(product.getProductName());

            // 3. Create OUTWARD stock transaction
            String remarks = "POS Sale - Receipt #" + saleId;
            StockTransaction tx = new StockTransaction(productId, "OUTWARD", quantitySold, availableStock, newStock, remarks);
            stockTransactionDAO.insert(conn, tx);

            // Commit all changes atomically
            conn.commit();

            return sale;
        } catch (Exception e) {
            DBConnection.rollback(conn);
            throw e;
        } finally {
            DBConnection.close(conn);
        }
    }

    /**
     * Retrieves all sales history.
     */
    public List<Sale> getAllSales() throws SQLException {
        return saleDAO.getAll();
    }

    /**
     * Retrieves sales history for a specific product.
     */
    public List<Sale> getSalesByProduct(int productId) throws SQLException {
        return saleDAO.getByProductId(productId);
    }
}
