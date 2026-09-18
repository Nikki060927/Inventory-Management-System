package model;

/**
 * DashboardSummary DTO
 * Holds aggregated high-level metrics for the store dashboard.
 */
public class DashboardSummary {
    private int totalProducts;
    private int totalStock;
    private int lowStockCount;
    private int outOfStockCount;
    private double inventoryValue;

    public DashboardSummary() {}

    public DashboardSummary(int totalProducts, int totalStock, int lowStockCount, int outOfStockCount, double inventoryValue) {
        this.totalProducts = totalProducts;
        this.totalStock = totalStock;
        this.lowStockCount = lowStockCount;
        this.outOfStockCount = outOfStockCount;
        this.inventoryValue = Math.round(inventoryValue * 100.0) / 100.0;
    }

    public int getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(int totalProducts) {
        this.totalProducts = totalProducts;
    }

    public int getTotalStock() {
        return totalStock;
    }

    public void setTotalStock(int totalStock) {
        this.totalStock = totalStock;
    }

    public int getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(int lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public int getOutOfStockCount() {
        return outOfStockCount;
    }

    public void setOutOfStockCount(int outOfStockCount) {
        this.outOfStockCount = outOfStockCount;
    }

    public double getInventoryValue() {
        return inventoryValue;
    }

    public void setInventoryValue(double inventoryValue) {
        this.inventoryValue = inventoryValue;
    }
}
