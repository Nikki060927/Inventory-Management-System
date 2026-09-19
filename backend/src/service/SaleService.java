package service;

import dao.ProductDAO;
import dao.SaleDAO;
import dao.StockTransactionDAO;
import model.Product;
import model.Sale;
import model.SaleBill;
import model.StockTransaction;
import util.DBConnection;
import util.JsonUtil;
import util.ValidationUtil;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * SaleService - Business logic for Multi-Commodity Point of Sale (POS) Transactions
 * Coordinates atomic stock deduction across multiple products, sales recording, and outward audit logging.
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
     * Executes a Multi-Commodity Point of Sale bill transaction atomically:
     * 1. Pre-validates all requested commodities and available shelf stock.
     * 2. Atomically decrements product stock for each commodity.
     * 3. Inserts each item into the sales table linked by a shared Bill Number.
     * 4. Creates OUTWARD stock transaction audit entries for each commodity.
     * 5. Commits the entire bill as a single ACID transaction.
     */
    public SaleBill recordBill(List<JsonUtil.SaleItemRequest> rawItems, String customerName, String paymentMethod) throws SQLException {
        if (rawItems == null || rawItems.isEmpty()) {
            throw new IllegalArgumentException("Cannot generate bill: No commodities selected.");
        }

        String custName = (customerName != null && !customerName.trim().isEmpty()) ? customerName.trim() : "Walk-in Customer";
        String payMethod = (paymentMethod != null && !paymentMethod.trim().isEmpty()) ? paymentMethod.trim() : "Cash";

        // Aggregate duplicates in case same product was added multiple times
        Map<Integer, Integer> consolidated = new LinkedHashMap<>();
        for (JsonUtil.SaleItemRequest item : rawItems) {
            ValidationUtil.requirePositive(item.quantitySold, "Quantity for Product ID " + item.productId);
            consolidated.put(item.productId, consolidated.getOrDefault(item.productId, 0) + item.quantitySold);
        }

        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false); // Begin ACID transaction

            // Generate unique Bill Number: e.g. BILL-20260919-4821
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
            String billNo = "BILL-" + timestamp + "-" + (int)(Math.random() * 900 + 100);
            String billDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            // 1. Pre-validation: verify all products exist and have sufficient stock
            Map<Integer, Product> productMap = new HashMap<>();
            for (Map.Entry<Integer, Integer> entry : consolidated.entrySet()) {
                int productId = entry.getKey();
                int qtyNeeded = entry.getValue();

                Product product = productDAO.getById(productId);
                if (product == null) {
                    throw new IllegalArgumentException("Product not found with ID: " + productId);
                }

                if (qtyNeeded > product.getQuantity()) {
                    throw new IllegalArgumentException("Insufficient stock for '" + product.getProductName() + 
                            "'. Available on shelf: " + product.getQuantity() + " units, Requested: " + qtyNeeded + " units.");
                }

                productMap.put(productId, product);
            }

            // 2. Process all commodities
            List<Sale> saleItems = new ArrayList<>();
            double grandTotal = 0.0;

            for (Map.Entry<Integer, Integer> entry : consolidated.entrySet()) {
                int productId = entry.getKey();
                int quantitySold = entry.getValue();
                Product product = productMap.get(productId);

                int availableStock = product.getQuantity();
                double unitPrice = product.getUnitPrice();
                double lineTotal = Math.round(quantitySold * unitPrice * 100.0) / 100.0;
                int newStock = availableStock - quantitySold;

                // 2a. Deduct product quantity
                productDAO.updateQuantity(conn, productId, newStock);

                // 2b. Insert sales record linked by billNo
                Sale sale = new Sale(0, billNo, productId, quantitySold, unitPrice, lineTotal, custName, payMethod, billDate);
                int saleId = saleDAO.insert(conn, sale);
                sale.setSaleId(saleId);
                sale.setProductName(product.getProductName());
                saleItems.add(sale);

                // 2c. Audit log stock movement
                String remarks = "POS Bill #" + billNo + " - " + product.getProductName() + " (" + quantitySold + " units)";
                StockTransaction tx = new StockTransaction(productId, "OUTWARD", quantitySold, availableStock, newStock, remarks);
                stockTransactionDAO.insert(conn, tx);

                grandTotal += lineTotal;
            }

            grandTotal = Math.round(grandTotal * 100.0) / 100.0;

            // Commit all changes atomically
            conn.commit();

            SaleBill bill = new SaleBill(billNo, custName, payMethod, billDate, saleItems, grandTotal);
            return bill;
        } catch (Exception e) {
            DBConnection.rollback(conn);
            throw e;
        } finally {
            DBConnection.close(conn);
        }
    }

    /**
     * Single-item sale execution (backward compatible with legacy POS requests).
     */
    public Sale recordSale(int productId, int quantitySold) throws SQLException {
        List<JsonUtil.SaleItemRequest> items = Collections.singletonList(new JsonUtil.SaleItemRequest(productId, quantitySold));
        SaleBill bill = recordBill(items, "Walk-in Customer", "Cash");
        return bill.getItems().get(0);
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

    /**
     * Retrieves all line items for a specific bill number.
     */
    public List<Sale> getSalesByBillNo(String billNo) throws SQLException {
        return saleDAO.getByBillNo(billNo);
    }
}
