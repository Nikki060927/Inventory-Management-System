import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ExportCsvButton from '../components/ExportCsvButton';

export default function Sales({ showToast, currentUser }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Multi-Commodity Cart State
  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Checkout & Receipt Modal State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedBill, setGeneratedBill] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, sls] = await Promise.all([
        api.getProducts(),
        api.getSalesHistory(),
      ]);
      setProducts(prods || []);
      setSales(sls || []);
      if (prods && prods.length > 0 && !selectedProductId) {
        setSelectedProductId(prods[0].productId);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Currently selected product in the picker
  const selectedProduct = products.find((p) => String(p.productId) === String(selectedProductId));
  const availableStock = selectedProduct ? selectedProduct.quantity : 0;
  
  // Calculate existing cart allocation for selected product
  const existingCartItem = cart.find((item) => item.product.productId === (selectedProduct ? selectedProduct.productId : null));
  const alreadyInCart = existingCartItem ? existingCartItem.quantity : 0;
  const remainingStock = Math.max(0, availableStock - alreadyInCart);

  // Cart Calculations
  const totalItemsCount = cart.length;
  const totalUnitsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Math.round(cart.reduce((sum, item) => sum + (item.quantity * item.product.unitPrice), 0) * 100) / 100;
  const grandTotal = subtotal; // Can add tax/discount if needed

  // Add selected commodity to the bill cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedProduct) {
      setError('Please select a product first.');
      return;
    }
    const qty = parseInt(addQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (qty > remainingStock) {
      setError(`Cannot add ${qty} units. Only ${remainingStock} more units available on shelf (${alreadyInCart} already in bill).`);
      return;
    }

    setCart((prevCart) => {
      const idx = prevCart.findIndex((item) => item.product.productId === selectedProduct.productId);
      if (idx !== -1) {
        const updated = [...prevCart];
        const newQty = updated[idx].quantity + qty;
        updated[idx] = {
          ...updated[idx],
          quantity: newQty,
          lineTotal: Math.round(newQty * selectedProduct.unitPrice * 100) / 100,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product: selectedProduct,
            quantity: qty,
            unitPrice: selectedProduct.unitPrice,
            lineTotal: Math.round(qty * selectedProduct.unitPrice * 100) / 100,
          },
        ];
      }
    });

    setAddQty(1);
    showToast(`Added ${qty}x ${selectedProduct.productName} to bill`, 'info');
  };

  // Update quantity directly in cart table
  const handleUpdateCartQty = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.productId === productId) {
            const newQty = item.quantity + delta;
            const maxAllowed = item.product.quantity;
            if (newQty <= 0) return null; // Will be filtered out
            if (newQty > maxAllowed) {
              showToast(`Cannot exceed shelf stock of ${maxAllowed} units`, 'warning');
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              lineTotal: Math.round(newQty * item.product.unitPrice * 100) / 100,
            };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Remove commodity from cart
  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.productId !== productId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (cart.length > 0 && window.confirm('Are you sure you want to clear all commodities from the current bill?')) {
      setCart([]);
      setError('');
    }
  };

  // Checkout & Generate Multi-Commodity Bill
  const handleGenerateBill = async () => {
    setError('');
    if (cart.length === 0) {
      setError('Cannot generate empty bill. Please add at least one commodity.');
      return;
    }

    try {
      setIsSubmitting(true);
      const billPayload = {
        customerName: customerName.trim() || 'Walk-in Customer',
        paymentMethod: paymentMethod || 'Cash',
        items: cart.map((item) => ({
          productId: item.product.productId,
          quantitySold: item.quantity,
        })),
      };

      const billResult = await api.recordBill(billPayload);
      setGeneratedBill(billResult);
      showToast(`Bill ${billResult.billNo} generated successfully for ₹${Number(billResult.grandTotal).toFixed(2)}!`, 'success');
      setCart([]);
      loadData();
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const csvHeaders = [
    { label: 'Bill / Receipt No', key: 'billNo' },
    { label: 'Receipt ID', key: 'saleId' },
    { label: 'Commodity Name', key: 'productName' },
    { label: 'Quantity Sold', key: 'quantitySold' },
    { label: 'Unit Price (INR)', key: 'unitPrice' },
    { label: 'Line Total (INR)', key: 'totalAmount' },
    { label: 'Customer Name', key: 'customerName' },
    { label: 'Payment Method', key: 'paymentMethod' },
    { label: 'Sale Timestamp', key: 'saleDate' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Point of Sale (POS) & Multi-Product Billing</h1>
          <p>Bill multiple stationery commodities in a single transaction with atomic stock deductions and instant receipt printing</p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: '#fee2e2',
          border: '1px solid #f87171',
          color: '#b91c1c',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Top Grid: Customer & Commodity Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Card 1: Customer & Payment Details */}
        <div className="card" style={{ height: '100%' }}>
          <div className="card-header">
            <h3 className="card-title">👤 Customer & Payment Mode</h3>
          </div>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Walk-in Customer / Student Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '6px' }}>
              {['Cash', 'UPI', 'Card'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMethod(mode)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '6px',
                    border: paymentMethod === mode ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: paymentMethod === mode ? '#eef2ff' : '#ffffff',
                    color: paymentMethod === mode ? '#4f46e5' : '#475569',
                    fontWeight: paymentMethod === mode ? '700' : '500',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>
                    {mode === 'Cash' ? '💵' : mode === 'UPI' ? '📱' : '💳'}
                  </span>
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Commodity Selector */}
        <div className="card" style={{ height: '100%' }}>
          <div className="card-header">
            <h3 className="card-title">📦 Add Commodity to Bill</h3>
          </div>
          <form onSubmit={handleAddToCart}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Select Stationery Product *</label>
              <select
                className="form-input"
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setAddQty(1);
                  setError('');
                }}
                required
              >
                <option value="">-- Choose Product to Add --</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId} disabled={p.quantity === 0}>
                    {p.productName} ({p.sku}) — ₹{Number(p.unitPrice).toFixed(2)} [Stock: {p.quantity}]{p.quantity === 0 ? ' (OUT OF STOCK)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '14px',
                background: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
              }}>
                <div>
                  <span style={{ color: '#64748b' }}>Rate: </span>
                  <strong style={{ color: '#0f172a' }}>₹{Number(selectedProduct.unitPrice).toFixed(2)}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Shelf Stock: </span>
                  <strong style={{ color: remainingStock > 0 ? '#15803d' : '#dc2626' }}>
                    {remainingStock} units left
                  </strong>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'flex-end' }}>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={remainingStock > 0 ? remainingStock : 1}
                  className="form-input"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  disabled={remainingStock === 0}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedProduct || remainingStock === 0 || parseInt(addQty, 10) <= 0}
                style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>➕</span> Add to Bill
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Middle Section: Active Multi-Product Bill (Cart) */}
      <div className="card" style={{ marginBottom: '24px', border: cart.length > 0 ? '2px solid #4f46e5' : '1px solid #e2e8f0' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🛒</span> Current Bill Register ({totalItemsCount} Commodities, {totalUnitsCount} Units)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Items queued for invoice generation. You can adjust quantities or remove items before finalizing.
            </p>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearCart}
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              🗑️ Clear Bill
            </button>
          )}
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Commodity / Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Line Total</th>
                <th style={{ width: '70px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state" style={{ padding: '36px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛍️</div>
                    <strong style={{ fontSize: '16px', color: '#334155' }}>Bill Cart is Empty</strong>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      Select stationery products above and click <strong>"➕ Add to Bill"</strong> to generate a multi-commodity receipt.
                    </p>
                  </td>
                </tr>
              ) : (
                cart.map((item, idx) => (
                  <tr key={item.product.productId}>
                    <td><strong>{idx + 1}</strong></td>
                    <td>
                      <strong>{item.product.productName}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.product.categoryName || 'Stationery'}</div>
                    </td>
                    <td><span className="sku-tag">{item.product.sku}</span></td>
                    <td>₹{Number(item.product.unitPrice).toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 6px', background: '#f8fafc' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(item.product.productId, -1)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', padding: '0 4px', color: '#475569' }}
                          title="Decrease"
                        >
                          -
                        </button>
                        <span style={{ fontWeight: '700', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(item.product.productId, 1)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', padding: '0 4px', color: '#4f46e5' }}
                          title="Increase"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                      ₹{item.lineTotal.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.product.productId)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: '16px' }}
                        title="Remove commodity"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bill Grand Total & Action Footer */}
        {cart.length > 0 && (
          <div style={{
            background: '#f8fafc',
            borderTop: '2px solid #e2e8f0',
            padding: '20px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Customer: <strong style={{ color: '#0f172a' }}>{customerName || 'Walk-in Customer'}</strong> | Payment Mode: <strong style={{ color: '#4f46e5' }}>{paymentMethod}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Total Items: <strong>{totalItemsCount} products</strong> ({totalUnitsCount} discrete units)
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Grand Total Payable
                </span>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#15803d' }}>
                  ₹{grandTotal.toFixed(2)}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerateBill}
                disabled={isSubmitting || cart.length === 0}
                style={{
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                }}
              >
                {isSubmitting ? '⏳ Processing Sale...' : '🧾 Generate Bill & Print Receipt'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Historical Sales Register */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">📜 Sales & Billing Transaction Register</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Complete audit history of customer transactions, bill numbers, items sold, and payment modes
            </p>
          </div>
          <ExportCsvButton filename="stationery_sales_register" headers={csvHeaders} data={sales} />
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Receipt ID</th>
                <th>Commodity Name</th>
                <th>Qty Sold</th>
                <th>Unit Price</th>
                <th>Total Bill</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state">No sales recorded yet.</td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.saleId}>
                    <td>
                      <span style={{ fontWeight: '700', color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {s.billNo || `#${s.saleId}`}
                      </span>
                    </td>
                    <td><strong>#{s.saleId}</strong></td>
                    <td>{s.productName}</td>
                    <td><span style={{ fontWeight: '700' }}>{s.quantitySold} units</span></td>
                    <td>₹{Number(s.unitPrice).toFixed(2)}</td>
                    <td><strong style={{ color: '#15803d' }}>₹{Number(s.totalAmount).toFixed(2)}</strong></td>
                    <td style={{ fontSize: '13px' }}>{s.customerName || 'Walk-in Customer'}</td>
                    <td>
                      <span style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '4px', background: s.paymentMethod === 'UPI' ? '#f0fdf4' : s.paymentMethod === 'Card' ? '#eff6ff' : '#f8fafc', color: s.paymentMethod === 'UPI' ? '#15803d' : s.paymentMethod === 'Card' ? '#1d4ed8' : '#475569', fontWeight: '600' }}>
                        {s.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{s.saleDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          PRINTABLE STORE RECEIPT MODAL
          ============================================================ */}
      {generatedBill && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
          }}>
            {/* Modal Actions Bar (hidden on print) */}
            <div className="no-print" style={{
              padding: '12px 20px',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>🧾 Customer Invoice Ready</span>
              <button
                type="button"
                onClick={() => setGeneratedBill(null)}
                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div id="printableReceipt" style={{
              padding: '28px 24px',
              fontFamily: "'Courier New', Courier, monospace",
              color: '#0f172a',
              overflowY: 'auto',
              fontSize: '13px',
              lineHeight: '1.4',
            }}>
              {/* Store Header */}
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #94a3b8', paddingBottom: '14px', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>
                  SMART STATIONERY STORE
                </h2>
                <p style={{ margin: '0', fontSize: '11px', color: '#475569' }}>
                  Sathyabama Institute of Science and Technology
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#475569' }}>
                  Semmencherry, Chennai - 600119 | Ph: +91-44-24503150
                </p>
                <div style={{ marginTop: '8px', display: 'inline-block', border: '1px solid #0f172a', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                  RETAIL TAX INVOICE
                </div>
              </div>

              {/* Invoice Meta */}
              <div style={{ borderBottom: '1px dashed #94a3b8', paddingBottom: '10px', marginBottom: '14px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Bill No: <strong>{generatedBill.billNo}</strong></span>
                  <span>Date: {generatedBill.billDate ? generatedBill.billDate.split(' ')[0] : 'Today'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>Customer: <strong>{generatedBill.customerName}</strong></span>
                  <span>Time: {generatedBill.billDate ? generatedBill.billDate.split(' ')[1] : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>Payment Mode: <strong>{generatedBill.paymentMethod}</strong></span>
                  <span>Cashier: <strong>{currentUser?.username || 'admin'}</strong></span>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #0f172a' }}>
                    <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                    <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '4px 0' }}>Rate</th>
                    <th style={{ textAlign: 'right', padding: '4px 0' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedBill.items && generatedBill.items.map((it, i) => (
                    <tr key={i} style={{ borderBottom: '1px dotted #cbd5e1' }}>
                      <td style={{ padding: '6px 0' }}>
                        {it.productName}
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 0' }}>{it.quantitySold}</td>
                      <td style={{ textAlign: 'right', padding: '6px 0' }}>₹{Number(it.unitPrice).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: '700' }}>
                        ₹{Number(it.totalAmount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Totals */}
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '10px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Total Commodities:</span>
                  <strong>{generatedBill.totalCommodities || (generatedBill.items ? generatedBill.items.length : 1)} items</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Total Discrete Units:</span>
                  <strong>{generatedBill.totalQuantity} units</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Subtotal:</span>
                  <span>₹{Number(generatedBill.subtotal || generatedBill.grandTotal).toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px dashed #94a3b8',
                  paddingTop: '8px',
                  fontSize: '16px',
                  fontWeight: '800',
                }}>
                  <span>NET PAYABLE:</span>
                  <span>₹{Number(generatedBill.grandTotal).toFixed(2)}</span>
                </div>
              </div>

              {/* Footer Note & Barcode */}
              <div style={{ textAlign: 'center', borderTop: '1px dashed #94a3b8', paddingTop: '14px', fontSize: '11px', color: '#475569' }}>
                <p style={{ margin: '0 0 4px 0' }}>*** THANK YOU FOR SHOPPING WITH US! ***</p>
                <p style={{ margin: '0 0 8px 0' }}>Exchange within 7 days with original receipt.</p>
                <div style={{
                  letterSpacing: '4px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  color: '#1e293b',
                }}>
                  ||| | | |||| || | || |||
                </div>
                <div style={{ fontSize: '10px', marginTop: '2px' }}>{generatedBill.billNo}</div>
              </div>
            </div>

            {/* Modal Bottom Buttons (hidden on print) */}
            <div className="no-print" style={{
              padding: '16px 20px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>🖨️</span> Print Invoice
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setGeneratedBill(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>➕</span> Start New Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Specific CSS to ensure clean thermal / A4 invoice printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printableReceipt, #printableReceipt * {
            visibility: visible;
          }
          #printableReceipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
