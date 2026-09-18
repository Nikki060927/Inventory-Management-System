package dao;

import model.Sale;
import util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * SaleDAO - Data Access Object for Sales
 * Handles inserting sales records and retrieving point-of-sale history.
 */
public class SaleDAO {

    /**
     * Inserts a sale record using an active Connection (supports transactional commits).
     */
    public int insert(Connection conn, Sale sale) throws SQLException {
        String sql = "INSERT INTO sales (product_id, quantity_sold, unit_price, total_amount) " +
                     "VALUES (?, ?, ?, ?)";

        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, sale.getProductId());
            ps.setInt(2, sale.getQuantitySold());
            ps.setDouble(3, sale.getUnitPrice());
            ps.setDouble(4, sale.getTotalAmount());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        int id = rs.getInt(1);
                        sale.setSaleId(id);
                        return id;
                    }
                }
            }
        }
        return -1;
    }

    /**
     * Retrieves all sales with joined product names, ordered by most recent first.
     */
    public List<Sale> getAll() throws SQLException {
        List<Sale> list = new ArrayList<>();
        String sql = "SELECT s.sale_id, s.product_id, p.product_name, " +
                     "s.quantity_sold, s.unit_price, s.total_amount, s.sale_date " +
                     "FROM sales s " +
                     "JOIN products p ON s.product_id = p.product_id " +
                     "ORDER BY s.sale_id DESC";

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
     * Retrieves sales for a specific product.
     */
    public List<Sale> getByProductId(int productId) throws SQLException {
        List<Sale> list = new ArrayList<>();
        String sql = "SELECT s.sale_id, s.product_id, p.product_name, " +
                     "s.quantity_sold, s.unit_price, s.total_amount, s.sale_date " +
                     "FROM sales s " +
                     "JOIN products p ON s.product_id = p.product_id " +
                     "WHERE s.product_id = ? " +
                     "ORDER BY s.sale_id DESC";

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

    private Sale mapRow(ResultSet rs) throws SQLException {
        Sale s = new Sale();
        s.setSaleId(rs.getInt("sale_id"));
        s.setProductId(rs.getInt("product_id"));
        s.setProductName(rs.getString("product_name"));
        s.setQuantitySold(rs.getInt("quantity_sold"));
        s.setUnitPrice(rs.getDouble("unit_price"));
        s.setTotalAmount(rs.getDouble("total_amount"));
        Timestamp dt = rs.getTimestamp("sale_date");
        if (dt != null) s.setSaleDate(dt.toString());
        return s;
    }
}
