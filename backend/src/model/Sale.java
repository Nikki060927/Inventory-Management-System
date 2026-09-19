package model;

/**
 * Sale Model
 * Represents a completed customer billing line event at Point of Sale.
 */
public class Sale {
    private int saleId;
    private String billNo;
    private int productId;
    private String productName; // Joined
    private int quantitySold;
    private double unitPrice;
    private double totalAmount;
    private String customerName;
    private String paymentMethod;
    private String saleDate;

    public Sale() {}

    public Sale(int productId, int quantitySold, double unitPrice, double totalAmount) {
        this.productId = productId;
        this.quantitySold = quantitySold;
        this.unitPrice = unitPrice;
        this.totalAmount = totalAmount;
        this.customerName = "Walk-in Customer";
        this.paymentMethod = "Cash";
    }

    public Sale(int saleId, int productId, int quantitySold, double unitPrice, double totalAmount, String saleDate) {
        this.saleId = saleId;
        this.productId = productId;
        this.quantitySold = quantitySold;
        this.unitPrice = unitPrice;
        this.totalAmount = totalAmount;
        this.saleDate = saleDate;
        this.customerName = "Walk-in Customer";
        this.paymentMethod = "Cash";
    }

    public Sale(int saleId, String billNo, int productId, int quantitySold, double unitPrice, double totalAmount, String customerName, String paymentMethod, String saleDate) {
        this.saleId = saleId;
        this.billNo = billNo;
        this.productId = productId;
        this.quantitySold = quantitySold;
        this.unitPrice = unitPrice;
        this.totalAmount = totalAmount;
        this.customerName = customerName;
        this.paymentMethod = paymentMethod;
        this.saleDate = saleDate;
    }

    public int getSaleId() {
        return saleId;
    }

    public void setSaleId(int saleId) {
        this.saleId = saleId;
    }

    public String getBillNo() {
        return billNo;
    }

    public void setBillNo(String billNo) {
        this.billNo = billNo;
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

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
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
                ", billNo='" + billNo + '\'' +
                ", productId=" + productId +
                ", quantitySold=" + quantitySold +
                ", totalAmount=" + totalAmount +
                ", customerName='" + customerName + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", saleDate='" + saleDate + '\'' +
                '}';
    }
}
