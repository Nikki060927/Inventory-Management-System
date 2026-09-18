package model;

import java.util.ArrayList;
import java.util.List;

/**
 * ValuationReport DTO
 * Encapsulates store-wide, category-wise, and product-wise financial valuations.
 */
public class ValuationReport {

    public static class CategoryValuation {
        private String categoryName;
        private int totalItems;
        private int totalUnits;
        private double categoryValue;

        public CategoryValuation(String categoryName, int totalItems, int totalUnits, double categoryValue) {
            this.categoryName = categoryName;
            this.totalItems = totalItems;
            this.totalUnits = totalUnits;
            this.categoryValue = Math.round(categoryValue * 100.0) / 100.0;
        }

        public String getCategoryName() { return categoryName; }
        public int getTotalItems() { return totalItems; }
        public int getTotalUnits() { return totalUnits; }
        public double getCategoryValue() { return categoryValue; }
    }

    public static class ProductValuation {
        private int productId;
        private String productName;
        private String sku;
        private double unitPrice;
        private int quantity;
        private double totalValue;

        public ProductValuation(int productId, String productName, String sku, double unitPrice, int quantity, double totalValue) {
            this.productId = productId;
            this.productName = productName;
            this.sku = sku;
            this.unitPrice = unitPrice;
            this.quantity = quantity;
            this.totalValue = Math.round(totalValue * 100.0) / 100.0;
        }

        public int getProductId() { return productId; }
        public String getProductName() { return productName; }
        public String getSku() { return sku; }
        public double getUnitPrice() { return unitPrice; }
        public int getQuantity() { return quantity; }
        public double getTotalValue() { return totalValue; }
    }

    private double grandTotalValue;
    private int grandTotalUnits;
    private List<CategoryValuation> categoryValuations = new ArrayList<>();
    private List<ProductValuation> productValuations = new ArrayList<>();

    public ValuationReport() {}

    public double getGrandTotalValue() { return grandTotalValue; }
    public void setGrandTotalValue(double grandTotalValue) {
        this.grandTotalValue = Math.round(grandTotalValue * 100.0) / 100.0;
    }

    public int getGrandTotalUnits() { return grandTotalUnits; }
    public void setGrandTotalUnits(int grandTotalUnits) { this.grandTotalUnits = grandTotalUnits; }

    public List<CategoryValuation> getCategoryValuations() { return categoryValuations; }
    public void setCategoryValuations(List<CategoryValuation> categoryValuations) { this.categoryValuations = categoryValuations; }

    public List<ProductValuation> getProductValuations() { return productValuations; }
    public void setProductValuations(List<ProductValuation> productValuations) { this.productValuations = productValuations; }
}
