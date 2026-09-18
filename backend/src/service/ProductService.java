package service;

import dao.CategoryDAO;
import dao.ProductDAO;
import dao.SupplierDAO;
import model.Category;
import model.Product;
import model.Supplier;
import util.ValidationUtil;

import java.sql.SQLException;
import java.util.List;

/**
 * ProductService - Business logic and validation for Products
 * Enforces unique SKU, unique barcode, positive pricing, and valid foreign keys.
 */
public class ProductService {

    private final ProductDAO productDAO;
    private final CategoryDAO categoryDAO;
    private final SupplierDAO supplierDAO;

    public ProductService() {
        this.productDAO = new ProductDAO();
        this.categoryDAO = new CategoryDAO();
        this.supplierDAO = new SupplierDAO();
    }

    public ProductService(ProductDAO productDAO, CategoryDAO categoryDAO, SupplierDAO supplierDAO) {
        this.productDAO = productDAO;
        this.categoryDAO = categoryDAO;
        this.supplierDAO = supplierDAO;
    }

    public List<Product> getAllProducts(String search, Integer categoryId, String stockStatus) throws SQLException {
        return productDAO.getAll(search, categoryId, stockStatus);
    }

    public Product getProductById(int id) throws SQLException {
        Product p = productDAO.getById(id);
        if (p == null) {
            throw new IllegalArgumentException("Product not found with ID: " + id);
        }
        return p;
    }

    public Product addProduct(Product product) throws SQLException {
        validateProduct(product);

        // Edge Case 1: Duplicate SKU
        Product existingSku = productDAO.getBySku(product.getSku());
        if (existingSku != null) {
            throw new IllegalArgumentException("SKU already exists: " + product.getSku());
        }

        // Edge Case 2: Duplicate Barcode
        Product existingBarcode = productDAO.getByBarcode(product.getBarcode());
        if (existingBarcode != null) {
            throw new IllegalArgumentException("Barcode already exists: " + product.getBarcode());
        }

        // Validate Foreign Keys
        Category cat = categoryDAO.getById(product.getCategoryId());
        if (cat == null) {
            throw new IllegalArgumentException("Invalid Category ID: " + product.getCategoryId() + ". Category does not exist.");
        }

        Supplier sup = supplierDAO.getById(product.getSupplierId());
        if (sup == null) {
            throw new IllegalArgumentException("Invalid Supplier ID: " + product.getSupplierId() + ". Supplier does not exist.");
        }

        int id = productDAO.insert(product);
        product.setProductId(id);
        product.setCategoryName(cat.getCategoryName());
        product.setSupplierName(sup.getSupplierName());
        return product;
    }

    public Product updateProduct(Product product) throws SQLException {
        if (product.getProductId() <= 0) {
            throw new IllegalArgumentException("Invalid Product ID for update.");
        }

        Product current = productDAO.getById(product.getProductId());
        if (current == null) {
            throw new IllegalArgumentException("Cannot update. Product not found with ID: " + product.getProductId());
        }

        validateProductForUpdate(product);

        // Check if SKU changed and if new SKU conflicts with another product
        if (!current.getSku().equalsIgnoreCase(product.getSku())) {
            Product existingSku = productDAO.getBySku(product.getSku());
            if (existingSku != null && existingSku.getProductId() != product.getProductId()) {
                throw new IllegalArgumentException("SKU already exists on another product: " + product.getSku());
            }
        }

        // Check if Barcode changed and if new Barcode conflicts
        if (!current.getBarcode().equals(product.getBarcode())) {
            Product existingBarcode = productDAO.getByBarcode(product.getBarcode());
            if (existingBarcode != null && existingBarcode.getProductId() != product.getProductId()) {
                throw new IllegalArgumentException("Barcode already exists on another product: " + product.getBarcode());
            }
        }

        // Validate foreign keys
        Category cat = categoryDAO.getById(product.getCategoryId());
        if (cat == null) {
            throw new IllegalArgumentException("Category does not exist with ID: " + product.getCategoryId());
        }

        Supplier sup = supplierDAO.getById(product.getSupplierId());
        if (sup == null) {
            throw new IllegalArgumentException("Supplier does not exist with ID: " + product.getSupplierId());
        }

        productDAO.update(product);
        product.setCategoryName(cat.getCategoryName());
        product.setSupplierName(sup.getSupplierName());
        product.setQuantity(current.getQuantity()); // Quantity is altered via Stock transactions, not manual update
        return product;
    }

    public boolean deleteProduct(int id) throws SQLException {
        Product current = productDAO.getById(id);
        if (current == null) {
            throw new IllegalArgumentException("Cannot delete. Product not found with ID: " + id);
        }
        return productDAO.delete(id);
    }

    private void validateProduct(Product p) {
        // Edge Case 9: Empty product name
        ValidationUtil.requireNonEmpty(p.getProductName(), "Product Name");
        ValidationUtil.requireNonEmpty(p.getSku(), "SKU");
        ValidationUtil.requireNonEmpty(p.getBarcode(), "Barcode");

        // Edge Case 8: Invalid price
        ValidationUtil.requirePositive(p.getUnitPrice(), "Unit Price");

        // Edge Case 3: Negative quantity
        ValidationUtil.requireNonNegative(p.getQuantity(), "Quantity");
        ValidationUtil.requireNonNegative(p.getReorderPoint(), "Reorder Point");

        if (p.getCategoryId() <= 0) {
            throw new IllegalArgumentException("Category is required.");
        }
        if (p.getSupplierId() <= 0) {
            throw new IllegalArgumentException("Supplier is required.");
        }
    }

    private void validateProductForUpdate(Product p) {
        ValidationUtil.requireNonEmpty(p.getProductName(), "Product Name");
        ValidationUtil.requireNonEmpty(p.getSku(), "SKU");
        ValidationUtil.requireNonEmpty(p.getBarcode(), "Barcode");
        ValidationUtil.requirePositive(p.getUnitPrice(), "Unit Price");
        ValidationUtil.requireNonNegative(p.getReorderPoint(), "Reorder Point");

        if (p.getCategoryId() <= 0) throw new IllegalArgumentException("Category is required.");
        if (p.getSupplierId() <= 0) throw new IllegalArgumentException("Supplier is required.");
    }
}
