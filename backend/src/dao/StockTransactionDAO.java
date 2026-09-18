package dao;

import model.StockTransaction;
import util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * StockTransactionDAO - Data Access Object for Stock Transactions
 * Handles inserting audit records and retrieving chronological stock movement logs.
 */
public class StockTransactionDAO {

    /**
     * Inserts an audit transaction using an active Connection (supports transactional commits).
     */
    public int insert(Connection conn, StockTransaction tx) throws SQLException {
        String sql = "INSERT INTO stock_transactions " +
                     "(product_id, transaction_type, quantity, previous_quantity, new_quantity, remarks) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";

        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, tx.getProductId());
            ps.setString(2, tx.getTransactionType());
            ps.setInt(3, tx.getQuantity());
            ps.setInt(4, tx.getPreviousQuantity());
            ps.setInt(5, tx.getNewQuantity());
            ps.setString(6, tx.getRemarks() != null ? tx.getRemarks().trim() : "");

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        int id = rs.getInt(1);
                        tx.setTransactionId(id);
                        return id;
                    }
                }
            }
        }
        return -1;
    }

    /**
     * Retrieves all stock transactions ordered by most recent first.
     * Joins products table to include product name.
     */
    public List<StockTransaction> getAll() throws SQLException {
        List<StockTransaction> list = new ArrayList<>();
        String sql = "SELECT t.transaction_id, t.product_id, p.product_name, " +
                     "t.transaction_type, t.quantity, t.previous_quantity, t.new_quantity, " +
                     "t.transaction_date, t.remarks " +
                     "FROM stock_transactions t " +
                     "JOIN products p ON t.product_id = p.product_id " +
                     "ORDER BY t.transaction_id DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        }
        return list;
    }

    /**
     * Retrieves stock transactions for a single product.
     */
    public List<StockTransaction> getByProductId(int productId) throws SQLException {
        List<StockTransaction> list = new ArrayList<>();
        String sql = "SELECT t.transaction_id, t.product_id, p.product_name, " +
                     "t.transaction_type, t.quantity, t.previous_quantity, t.new_quantity, " +
                     "t.transaction_date, t.remarks " +
                     "FROM stock_transactions t " +
                     "JOIN products p ON t.product_id = p.product_id " +
                     "WHERE t.product_id = ? " +
                     "ORDER BY t.transaction_id DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, productId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        }
        return list;
    }

    private StockTransaction mapRow(ResultSet rs) throws SQLException {
        StockTransaction tx = new StockTransaction();
        tx.setTransactionId(rs.getInt("transaction_id"));
        tx.setProductId(rs.getInt("product_id"));
        tx.setProductName(rs.getString("product_name"));
        tx.setTransactionType(rs.getString("transaction_type"));
        tx.setQuantity(rs.getInt("quantity"));
        tx.setPreviousQuantity(rs.getInt("previous_quantity"));
        tx.setNewQuantity(rs.getInt("new_quantity"));
        Timestamp dt = rs.getTimestamp("transaction_date");
        if (dt != null) tx.setTransactionDate(dt.toString());
        tx.setRemarks(rs.getString("remarks"));
        return tx;
    }
}
