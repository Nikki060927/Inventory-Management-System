package dao;

import model.Product;
import util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * ProductDAO - Data Access Object for Products
 * Executes parameterized SQL operations for product CRUD, joins with Category & Supplier,
 * and handles search/filter queries.
 */
public class ProductDAO {

    /**
     * Retrieves all products with joined category and supplier names.
     * Optionally filters by search term, category ID, and stock status.
     */
    public List<Product> getAll(String search, Integer categoryId, String stockStatus) throws SQLException {
        List<Product> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
                "SELECT p.product_id, p.product_name, p.sku, p.barcode, " +
                "p.category_id, c.category_name, p.supplier_id, s.supplier_name, " +
                "p.unit_price, p.quantity, p.reorder_point, p.bin_location, " +
                "p.created_at, p.updated_at " +
                "FROM products p " +
                "JOIN categories c ON p.category_id = c.category_id " +
                "JOIN suppliers s ON p.supplier_id = s.supplier_id " +
                "WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();

        if (search != null && !search.trim().isEmpty()) {
            sql.append("AND (LOWER(p.product_name) LIKE ? OR LOWER(p.sku) LIKE ? OR LOWER(p.barcode) LIKE ?) ");
            String term = "%" + search.trim().toLowerCase() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
        }

        if (categoryId != null && categoryId > 0) {
            sql.append("AND p.category_id = ? ");
            params.add(categoryId);
        }

        if (stockStatus != null && !stockStatus.trim().isEmpty()) {
            String status = stockStatus.trim().toUpperCase();
            if ("OUT OF STOCK".equals(status)) {
                sql.append("AND p.quantity = 0 ");
            } else if ("LOW STOCK".equals(status)) {
                sql.append("AND p.quantity > 0 AND p.quantity <= p.reorder_point ");
            } else if ("IN STOCK".equals(status)) {
                sql.append("AND p.quantity > p.reorder_point ");
            }
        }

        sql.append("ORDER BY p.product_id DESC");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        }
        return list;
    }

    /**
     * Finds a single product by primary key ID.
     */
    public Product getById(int id) throws SQLException {
        String sql = "SELECT p.product_id, p.product_name, p.sku, p.barcode, " +
                     "p.category_id, c.category_name, p.supplier_id, s.supplier_name, " +
                     "p.unit_price, p.quantity, p.reorder_point, p.bin_location, " +
                     "p.created_at, p.updated_at " +
                     "FROM products p " +
                     "JOIN categories c ON p.category_id = c.category_id " +
                     "JOIN suppliers s ON p.supplier_id = s.supplier_id " +
                     "WHERE p.product_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        }
        return null;
    }

    /**
     * Finds product by SKU.
     */
    public Product getBySku(String sku) throws SQLException {
        String sql = "SELECT p.product_id, p.product_name, p.sku, p.barcode, " +
                     "p.category_id, c.category_name, p.supplier_id, s.supplier_name, " +
                     "p.unit_price, p.quantity, p.reorder_point, p.bin_location, " +
                     "p.created_at, p.updated_at " +
                     "FROM products p " +
                     "JOIN categories c ON p.category_id = c.category_id " +
                     "JOIN suppliers s ON p.supplier_id = s.supplier_id " +
                     "WHERE LOWER(p.sku) = LOWER(?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, sku.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        }
        return null;
    }

    /**
     * Finds product by Barcode.
     */
    public Product getByBarcode(String barcode) throws SQLException {
        String sql = "SELECT p.product_id, p.product_name, p.sku, p.barcode, " +
                     "p.category_id, c.category_name, p.supplier_id, s.supplier_name, " +
                     "p.unit_price, p.quantity, p.reorder_point, p.bin_location, " +
                     "p.created_at, p.updated_at " +
                     "FROM products p " +
                     "JOIN categories c ON p.category_id = c.category_id " +
                     "JOIN suppliers s ON p.supplier_id = s.supplier_id " +
                     "WHERE p.barcode = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, barcode.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        }
        return null;
    }

    /**
     * Inserts a new product into the database.
     * Returns generated product_id.
     */
    public int insert(Product product) throws SQLException {
        String sql = "INSERT INTO products " +
                     "(product_name, sku, barcode, category_id, supplier_id, unit_price, quantity, reorder_point, bin_location) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, product.getProductName().trim());
            ps.setString(2, product.getSku().trim().toUpperCase());
            ps.setString(3, product.getBarcode().trim());
            ps.setInt(4, product.getCategoryId());
            ps.setInt(5, product.getSupplierId());
            ps.setDouble(6, product.getUnitPrice());
            ps.setInt(7, product.getQuantity());
            ps.setInt(8, product.getReorderPoint());
            ps.setString(9, product.getBinLocation() != null ? product.getBinLocation().trim() : "");

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        int id = rs.getInt(1);
                        product.setProductId(id);
                        return id;
                    }
                }
            }
        }
        return -1;
    }

    /**
     * Updates an existing product's details.
     */
    public boolean update(Product product) throws SQLException {
        String sql = "UPDATE products SET " +
                     "product_name = ?, sku = ?, barcode = ?, category_id = ?, supplier_id = ?, " +
                     "unit_price = ?, reorder_point = ?, bin_location = ? " +
                     "WHERE product_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, product.getProductName().trim());
            ps.setString(2, product.getSku().trim().toUpperCase());
            ps.setString(3, product.getBarcode().trim());
            ps.setInt(4, product.getCategoryId());
            ps.setInt(5, product.getSupplierId());
            ps.setDouble(6, product.getUnitPrice());
            ps.setInt(7, product.getReorderPoint());
            ps.setString(8, product.getBinLocation() != null ? product.getBinLocation().trim() : "");
            ps.setInt(9, product.getProductId());

            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Updates only the stock quantity of a product (Used during transactions).
     * Accepts active Connection to participate in transactions.
     */
    public boolean updateQuantity(Connection conn, int productId, int newQuantity) throws SQLException {
        String sql = "UPDATE products SET quantity = ? WHERE product_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, newQuantity);
            ps.setInt(2, productId);
            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Deletes product by ID.
     */
    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM products WHERE product_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    private Product mapRow(ResultSet rs) throws SQLException {
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
        Timestamp ct = rs.getTimestamp("created_at");
        if (ct != null) p.setCreatedAt(ct.toString());
        Timestamp ut = rs.getTimestamp("updated_at");
        if (ut != null) p.setUpdatedAt(ut.toString());
        return p;
    }
}
