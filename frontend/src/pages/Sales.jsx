import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ExportCsvButton from '../components/ExportCsvButton';

export default function Sales({ showToast }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // POS Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantitySold, setQuantitySold] = useState('');
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

  const selectedProduct = products.find((p) => String(p.productId) === String(selectedProductId));
  const availableStock = selectedProduct ? selectedProduct.quantity : 0;
  const unitPrice = selectedProduct ? selectedProduct.unitPrice : 0;
  const numSold = parseInt(quantitySold, 10) || 0;
  const totalAmount = Math.round(numSold * unitPrice * 100) / 100;
  const isStockInsufficient = numSold > availableStock;

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedProductId) {
      setError('Please select a product.');
      return;
    }
    if (numSold <= 0) {
      setError('Quantity sold must be greater than 0.');
      return;
    }
    if (isStockInsufficient) {
      setError(`Cannot complete sale. Only ${availableStock} units available in stock.`);
      return;
    }

    try {
      const result = await api.recordSale(parseInt(selectedProductId, 10), numSold);
      showToast(`Sale recorded successfully! Receipt #${result.saleId} for ₹${result.totalAmount.toFixed(2)}`, 'success');
      setQuantitySold('');
      loadData();
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  const csvHeaders = [
    { label: 'Receipt ID', key: 'saleId' },
    { label: 'Product Name', key: 'productName' },
    { label: 'Quantity Sold', key: 'quantitySold' },
    { label: 'Unit Price (INR)', key: 'unitPrice' },
    { label: 'Total Amount (INR)', key: 'totalAmount' },
    { label: 'Sale Date', key: 'saleDate' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Point of Sale (POS) & Customer Billing</h1>
          <p>Execute customer purchases with instant automated stock deduction and audit logging</p>
        </div>
      </div>

      {/* POS Billing Form Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🛒 New Sale Transaction</h3>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSaleSubmit}>
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label className="form-label">Select Stationery Item *</label>
              <select
                className="form-input"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                <option value="">-- Choose Item to Sell --</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId} disabled={p.quantity === 0}>
                    {p.productName} ({p.sku}) — ₹{Number(p.unitPrice).toFixed(2)} [Available: {p.quantity} units]{p.quantity === 0 ? ' (OUT OF STOCK)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity to Sell *</label>
              <input
                type="number"
                min="1"
                max={availableStock > 0 ? availableStock : 1}
                className="form-input"
                placeholder="e.g. 2"
                value={quantitySold}
                onChange={(e) => setQuantitySold(e.target.value)}
                disabled={availableStock === 0}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Price (Auto-Loaded)</label>
              <input
                type="text"
                className="form-input"
                value={selectedProduct ? `₹${Number(unitPrice).toFixed(2)}` : '—'}
                disabled
              />
            </div>
          </div>

          {/* Real-time Billing Summary Banner */}
          {selectedProduct && (
            <div style={{
              marginTop: '18px',
              padding: '16px 20px',
              borderRadius: '8px',
              background: isStockInsufficient ? '#fee2e2' : '#f8fafc',
              border: isStockInsufficient ? '1px solid #f87171' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Stock Status: </span>
                <strong style={{ color: availableStock === 0 ? '#dc2626' : '#0f172a' }}>
                  {availableStock} units available on shelf {selectedProduct.binLocation ? `(${selectedProduct.binLocation})` : ''}
                </strong>
                {isStockInsufficient && (
                  <span style={{ color: '#dc2626', marginLeft: '10px', fontWeight: '600' }}>
                    ⚠️ Requested quantity exceeds available stock!
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Payable Amount
                </span>
                <div style={{ fontSize: '26px', fontWeight: '800', color: '#4f46e5' }}>
                  ₹{totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isStockInsufficient || availableStock === 0 || numSold <= 0}
            >
              💳 Complete Sale & Print Receipt
            </button>
          </div>
        </form>
      </div>

      {/* Sales History Log */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">🧾 Point of Sale (POS) Billing History</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Chronological log of completed customer sales with price, quantity, and total bill values
            </p>
          </div>
          <ExportCsvButton filename="sales_history" headers={csvHeaders} data={sales} />
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Item Purchased</th>
                <th>Qty Sold</th>
                <th>Unit Price</th>
                <th>Total Bill</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No sales transactions recorded yet.</td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.saleId}>
                    <td><strong>#{s.saleId}</strong></td>
                    <td>{s.productName}</td>
                    <td><span style={{ fontWeight: '700' }}>{s.quantitySold} units</span></td>
                    <td>₹{Number(s.unitPrice).toFixed(2)}</td>
                    <td><strong style={{ color: '#15803d' }}>₹{Number(s.totalAmount).toFixed(2)}</strong></td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{s.saleDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
