package service;

import dao.SupplierDAO;
import model.Supplier;
import util.ValidationUtil;

import java.sql.SQLException;
import java.util.List;

/**
 * SupplierService - Business logic and validation for Suppliers
 */
public class SupplierService {

    private final SupplierDAO supplierDAO;

    public SupplierService() {
        this.supplierDAO = new SupplierDAO();
    }

    public SupplierService(SupplierDAO supplierDAO) {
        this.supplierDAO = supplierDAO;
    }

    public List<Supplier> getAllSuppliers() throws SQLException {
        return supplierDAO.getAll();
    }

    public Supplier getSupplierById(int id) throws SQLException {
        Supplier supplier = supplierDAO.getById(id);
        if (supplier == null) {
            throw new IllegalArgumentException("Supplier not found with ID: " + id);
        }
        return supplier;
    }

    public Supplier addSupplier(Supplier supplier) throws SQLException {
        validateSupplier(supplier);
        int id = supplierDAO.insert(supplier);
        supplier.setSupplierId(id);
        return supplier;
    }

    public Supplier updateSupplier(Supplier supplier) throws SQLException {
        if (supplier.getSupplierId() <= 0) {
            throw new IllegalArgumentException("Invalid Supplier ID for update.");
        }
        Supplier existing = supplierDAO.getById(supplier.getSupplierId());
        if (existing == null) {
            throw new IllegalArgumentException("Cannot update. Supplier not found with ID: " + supplier.getSupplierId());
        }

        validateSupplier(supplier);
        supplierDAO.update(supplier);
        return supplier;
    }

    public boolean deleteSupplier(int id) throws SQLException {
        Supplier current = supplierDAO.getById(id);
        if (current == null) {
            throw new IllegalArgumentException("Cannot delete. Supplier not found with ID: " + id);
        }

        if (supplierDAO.hasLinkedProducts(id)) {
            throw new IllegalStateException("Cannot delete supplier '" + current.getSupplierName() + 
                    "'. Stationery products are currently associated with this supplier.");
        }

        return supplierDAO.delete(id);
    }

    private void validateSupplier(Supplier supplier) {
        ValidationUtil.requireNonEmpty(supplier.getSupplierName(), "Supplier Name");

        if (supplier.getEmail() != null && !supplier.getEmail().trim().isEmpty()) {
            if (!ValidationUtil.isValidEmail(supplier.getEmail().trim())) {
                throw new IllegalArgumentException("Invalid email format for supplier: " + supplier.getEmail());
            }
        }

        if (supplier.getPhone() != null && !supplier.getPhone().trim().isEmpty()) {
            if (!ValidationUtil.isValidPhone(supplier.getPhone().trim())) {
                throw new IllegalArgumentException("Invalid phone number format for supplier: " + supplier.getPhone());
            }
        }

        if (supplier.getStatus() == null || 
            (!supplier.getStatus().equalsIgnoreCase("ACTIVE") && !supplier.getStatus().equalsIgnoreCase("INACTIVE"))) {
            supplier.setStatus("ACTIVE");
        }
    }
}
