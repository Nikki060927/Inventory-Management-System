package dao;

import model.Supplier;
import util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * SupplierDAO - Data Access Object for Suppliers
 * Handles all JDBC PreparedStatement CRUD operations on the 'suppliers' table.
 */
public class SupplierDAO {

    public List<Supplier> getAll() throws SQLException {
        List<Supplier> list = new ArrayList<>();
        String sql = "SELECT supplier_id, supplier_name, phone, email, address, status FROM suppliers ORDER BY supplier_name ASC";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(new Supplier(
                        rs.getInt("supplier_id"),
                        rs.getString("supplier_name"),
                        rs.getString("phone"),
                        rs.getString("email"),
                        rs.getString("address"),
                        rs.getString("status")
                ));
            }
        }
        return list;
    }

    public Supplier getById(int id) throws SQLException {
        String sql = "SELECT supplier_id, supplier_name, phone, email, address, status FROM suppliers WHERE supplier_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Supplier(
                            rs.getInt("supplier_id"),
                            rs.getString("supplier_name"),
                            rs.getString("phone"),
                            rs.getString("email"),
                            rs.getString("address"),
                            rs.getString("status")
                    );
                }
            }
        }
        return null;
    }

    public int insert(Supplier supplier) throws SQLException {
        String sql = "INSERT INTO suppliers (supplier_name, phone, email, address, status) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, supplier.getSupplierName().trim());
            ps.setString(2, supplier.getPhone() != null ? supplier.getPhone().trim() : "");
            ps.setString(3, supplier.getEmail() != null ? supplier.getEmail().trim() : "");
            ps.setString(4, supplier.getAddress() != null ? supplier.getAddress().trim() : "");
            ps.setString(5, supplier.getStatus() != null ? supplier.getStatus().trim() : "ACTIVE");
            
            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        int id = rs.getInt(1);
                        supplier.setSupplierId(id);
                        return id;
                    }
                }
            }
        }
        return -1;
    }

    public boolean update(Supplier supplier) throws SQLException {
        String sql = "UPDATE suppliers SET supplier_name = ?, phone = ?, email = ?, address = ?, status = ? WHERE supplier_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, supplier.getSupplierName().trim());
            ps.setString(2, supplier.getPhone() != null ? supplier.getPhone().trim() : "");
            ps.setString(3, supplier.getEmail() != null ? supplier.getEmail().trim() : "");
            ps.setString(4, supplier.getAddress() != null ? supplier.getAddress().trim() : "");
            ps.setString(5, supplier.getStatus() != null ? supplier.getStatus().trim() : "ACTIVE");
            ps.setInt(6, supplier.getSupplierId());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM suppliers WHERE supplier_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean hasLinkedProducts(int supplierId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM products WHERE supplier_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, supplierId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        }
        return false;
    }
}
