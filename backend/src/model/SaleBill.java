package model;

import java.util.ArrayList;
import java.util.List;

/**
 * SaleBill Model
 * Represents an aggregated customer invoice / bill containing multiple commodities.
 */
public class SaleBill {
    private String billNo;
    private String customerName;
    private String paymentMethod;
    private String billDate;
    private List<Sale> items;
    private int totalCommodities; // Distinct products count
    private int totalQuantity;    // Sum of units sold
    private double subtotal;
    private double discount;
    private double tax;
    private double grandTotal;

    public SaleBill() {
        this.items = new ArrayList<>();
        this.customerName = "Walk-in Customer";
        this.paymentMethod = "Cash";
    }

    public SaleBill(String billNo, String customerName, String paymentMethod, String billDate, List<Sale> items, double grandTotal) {
        this.billNo = billNo;
        this.customerName = customerName;
        this.paymentMethod = paymentMethod;
        this.billDate = billDate;
        this.items = items != null ? items : new ArrayList<>();
        this.totalCommodities = this.items.size();
        this.totalQuantity = this.items.stream().mapToInt(Sale::getQuantitySold).sum();
        this.subtotal = grandTotal;
        this.discount = 0.0;
        this.tax = 0.0;
        this.grandTotal = grandTotal;
    }

    public String getBillNo() {
        return billNo;
    }

    public void setBillNo(String billNo) {
        this.billNo = billNo;
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

    public String getBillDate() {
        return billDate;
    }

    public void setBillDate(String billDate) {
        this.billDate = billDate;
    }

    public List<Sale> getItems() {
        return items;
    }

    public void setItems(List<Sale> items) {
        this.items = items;
        if (items != null) {
            this.totalCommodities = items.size();
            this.totalQuantity = items.stream().mapToInt(Sale::getQuantitySold).sum();
        }
    }

    public int getTotalCommodities() {
        return totalCommodities;
    }

    public void setTotalCommodities(int totalCommodities) {
        this.totalCommodities = totalCommodities;
    }

    public int getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(int totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }

    public double getDiscount() {
        return discount;
    }

    public void setDiscount(double discount) {
        this.discount = discount;
    }

    public double getTax() {
        return tax;
    }

    public void setTax(double tax) {
        this.tax = tax;
    }

    public double getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(double grandTotal) {
        this.grandTotal = grandTotal;
    }

    @Override
    public String toString() {
        return "SaleBill{" +
                "billNo='" + billNo + '\'' +
                ", customerName='" + customerName + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", billDate='" + billDate + '\'' +
                ", totalCommodities=" + totalCommodities +
                ", totalQuantity=" + totalQuantity +
                ", grandTotal=" + grandTotal +
                '}';
    }
}
