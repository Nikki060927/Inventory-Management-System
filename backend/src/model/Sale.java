package model;

/**
 * Sale Model
 * Represents a completed customer billing event at Point of Sale.
 */
public class Sale {
    private int saleId;
    private int productId;
    private String productName; // Joined
    private int quantitySold;
    private double unitPrice;
    private double totalAmount;
    private String saleDate;

    public Sale() {}

    public Sale(int productId, int quantitySold, double unitPrice, double totalAmount) {
        this.productId = productId;
        this.quantitySold = quantitySold;
        this.unitPrice = unitPrice;
        this.totalAmount = totalAmount;
    }

    public Sale(int saleId, int productId, int quantitySold, double unitPrice, double totalAmount, String saleDate) {
        this.saleId = saleId;
        this.productId = productId;
        this.quantitySold = quantitySold;
        this.unitPrice = unitPrice;
        this.totalAmount = totalAmount;
        this.saleDate = saleDate;
    }

    public int getSaleId() {
        return saleId;
    }

    public void setSaleId(int saleId) {
        this.saleId = saleId;
    }

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

    public int getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(int quantitySold) {
        this.quantitySold = quantitySold;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(String saleDate) {
        this.saleDate = saleDate;
    }

    @Override
    public String toString() {
        return "Sale{" +
                "saleId=" + saleId +
                ", productId=" + productId +
                ", quantitySold=" + quantitySold +
                ", totalAmount=" + totalAmount +
                ", saleDate='" + saleDate + '\'' +
                '}';
    }
}
