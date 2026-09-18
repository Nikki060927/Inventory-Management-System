package model;

/**
 * Product Model
 * Represents a stationery item (Pen, Notebook, Marker, etc.)
 * Includes smart derived fields for status, valuation, and reorder suggestion.
 */
public class Product {
    private int productId;
    private String productName;
    private String sku;
    private String barcode;
    private int categoryId;
    private String categoryName; // Joined from categories table
    private int supplierId;
    private String supplierName; // Joined from suppliers table
    private double unitPrice;
    private int quantity;
    private int reorderPoint;
    private String binLocation;
    private String createdAt;
    private String updatedAt;

    public Product() {}

    public Product(int productId, String productName, String sku, String barcode,
                   int categoryId, int supplierId, double unitPrice,
                   int quantity, int reorderPoint, String binLocation) {
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.barcode = barcode;
        this.categoryId = categoryId;
        this.supplierId = supplierId;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.reorderPoint = reorderPoint;
        this.binLocation = binLocation;
    }

    // Getters and Setters
    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public int getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(int supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getReorderPoint() {
        return reorderPoint;
    }

    public void setReorderPoint(int reorderPoint) {
        this.reorderPoint = reorderPoint;
    }

    public String getBinLocation() {
        return binLocation;
    }

    public void setBinLocation(String binLocation) {
        this.binLocation = binLocation;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Smart Business Helpers
    public String getStatus() {
        if (this.quantity == 0) {
            return "OUT OF STOCK";
        } else if (this.quantity <= this.reorderPoint) {
            return "LOW STOCK";
        } else {
            return "IN STOCK";
        }
    }

    public int getSuggestedReorderQuantity() {
        if (this.quantity <= this.reorderPoint) {
            return Math.max(0, (this.reorderPoint * 2) - this.quantity);
        }
        return 0;
    }

    public double getInventoryValue() {
        return Math.round(this.unitPrice * this.quantity * 100.0) / 100.0;
    }

    @Override
    public String toString() {
        return "Product{" +
                "productId=" + productId +
                ", productName='" + productName + '\'' +
                ", sku='" + sku + '\'' +
                ", barcode='" + barcode + '\'' +
                ", unitPrice=" + unitPrice +
                ", quantity=" + quantity +
                ", reorderPoint=" + reorderPoint +
                ", status='" + getStatus() + '\'' +
                '}';
    }
}
