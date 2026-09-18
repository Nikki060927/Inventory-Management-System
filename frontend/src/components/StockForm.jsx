import React, { useState } from 'react';

export default function StockForm({ products = [], onSubmit }) {
  const [type, setType] = useState('INWARD'); // INWARD, OUTWARD, DAMAGED
  const [productId, setProductId] = useState(products[0]?.productId || '');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const selectedProduct = products.find((p) => String(p.productId) === String(productId));
  const currentStock = selectedProduct ? selectedProduct.quantity : 0;
  const numQty = parseInt(quantity, 10) || 0;

  let calculatedNewStock = currentStock;
  if (type === 'INWARD') {
    calculatedNewStock = currentStock + numQty;
  } else {
    calculatedNewStock = currentStock - numQty;
  }

  const isInsufficient = (type === 'OUTWARD' || type === 'DAMAGED') && numQty > currentStock;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!productId) {
      setError('Please select a stationery product.');
      return;
    }
    if (numQty <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }
    if (isInsufficient) {
      setError(`Insufficient stock. Current available stock is only ${currentStock} units.`);
      return;
    }
    if (type === 'DAMAGED' && !remarks.trim()) {
      setError('Damage reason/remarks are mandatory for damaged stock.');
      return;
    }

    onSubmit(type, parseInt(productId, 10), numQty, remarks.trim());
    setQuantity('');
    setRemarks('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">📦 Record Stock Movement</h3>
      </div>

      {/* Operation Type Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          type="button"
          className={`btn ${type === 'INWARD' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setType('INWARD')}
        >
          ↓ Inward (Restock)
        </button>
        <button
          type="button"
          className={`btn ${type === 'OUTWARD' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setType('OUTWARD')}
        >
          ↑ Outward (Dispatch)
        </button>
        <button
          type="button"
          className={`btn ${type === 'DAMAGED' ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setType('DAMAGED')}
        >
          ✕ Damaged / Defective
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group col-span-2">
            <label className="form-label">Select Stationery Product *</label>
            <select
              className="form-input"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productName} ({p.sku}) — Available: {p.quantity} units [Shelf: {p.binLocation || 'N/A'}]
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity to Adjust *</label>
            <input
              type="number"
              min="1"
              className="form-input"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {type === 'DAMAGED' ? 'Damage Reason * (Mandatory)' : 'Remarks / Invoice Reference'}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder={type === 'DAMAGED' ? 'e.g. Leaking ink cartridge, broken clip' : 'e.g. Supplier Invoice #902'}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required={type === 'DAMAGED'}
            />
          </div>
        </div>

        {/* Real-time Calculation Summary Ribbon */}
        {selectedProduct && numQty > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '14px 18px',
            borderRadius: '8px',
            background: isInsufficient ? '#fee2e2' : '#f0fdf4',
            border: isInsufficient ? '1px solid #f87171' : '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px'
          }}>
            <div>
              <strong>Current Stock:</strong> {currentStock} units
              <span style={{ margin: '0 8px' }}>➔</span>
              <strong>Transaction:</strong> {type === 'INWARD' ? `+${numQty}` : `-${numQty}`} units
            </div>
            <div>
              <strong>Resulting Stock: </strong>
              <span style={{ fontWeight: '700', color: isInsufficient ? '#dc2626' : '#15803d', fontSize: '15px' }}>
                {calculatedNewStock} units {isInsufficient && '(INSUFFICIENT)'}
              </span>
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className={`btn ${type === 'DAMAGED' ? 'btn-danger' : 'btn-primary'}`}
            disabled={isInsufficient}
          >
            Confirm {type} Transaction
          </button>
        </div>
      </form>
    </div>
  );
}
