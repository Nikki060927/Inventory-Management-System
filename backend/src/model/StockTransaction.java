package model;

/**
 * StockTransaction Model
 * Represents an immutable audit trail entry for every INWARD, OUTWARD, or DAMAGED stock adjustment.
 */
public class StockTransaction {
    private int transactionId;
    private int productId;
    private String productName; // Joined
    private String transactionType; // 'INWARD', 'OUTWARD', 'DAMAGED'
    private int quantity;
    private int previousQuantity;
    private int newQuantity;
    private String transactionDate;
    private String remarks;

    public StockTransaction() {}

    public StockTransaction(int productId, String transactionType, int quantity,
                            int previousQuantity, int newQuantity, String remarks) {
        this.productId = productId;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.remarks = remarks;
    }

    public StockTransaction(int transactionId, int productId, String transactionType, int quantity,
                            int previousQuantity, int newQuantity, String transactionDate, String remarks) {
        this.transactionId = transactionId;
        this.productId = productId;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.transactionDate = transactionDate;
        this.remarks = remarks;
    }

    public int getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(int transactionId) {
        this.transactionId = transactionId;
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

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getPreviousQuantity() {
        return previousQuantity;
    }

    public void setPreviousQuantity(int previousQuantity) {
        this.previousQuantity = previousQuantity;
    }

    public int getNewQuantity() {
        return newQuantity;
    }

    public void setNewQuantity(int newQuantity) {
        this.newQuantity = newQuantity;
    }

    public String getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(String transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    @Override
    public String toString() {
        return "StockTransaction{" +
                "transactionId=" + transactionId +
                ", productId=" + productId +
                ", type='" + transactionType + '\'' +
                ", quantity=" + quantity +
                ", prev=" + previousQuantity +
                ", new=" + newQuantity +
                '}';
    }
}
