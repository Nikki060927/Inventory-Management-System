import React, { useState, useEffect } from 'react';

export default function ProductForm({ isOpen, onClose, onSave, product, categories = [], suppliers = [] }) {
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    barcode: '',
    categoryId: '',
    supplierId: '',
    unitPrice: '',
    quantity: 0,
    reorderPoint: 10,
    binLocation: 'A01',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        categoryId: product.categoryId || (categories[0]?.categoryId || ''),
        supplierId: product.supplierId || (suppliers[0]?.supplierId || ''),
        unitPrice: product.unitPrice || '',
        quantity: product.quantity || 0,
        reorderPoint: product.reorderPoint || 10,
        binLocation: product.binLocation || 'A01',
      });
    } else {
      setFormData({
        productName: '',
        sku: '',
        barcode: '',
        categoryId: categories[0]?.categoryId || '',
        supplierId: suppliers[0]?.supplierId || '',
        unitPrice: '',
        quantity: 0,
        reorderPoint: 10,
        binLocation: 'A01',
      });
    }
    setError('');
  }, [product, isOpen, categories, suppliers]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic frontend checks matching backend validation
    if (!formData.productName.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!formData.sku.trim()) {
      setError('SKU is required.');
      return;
    }
    if (!formData.barcode.trim()) {
      setError('Barcode is required.');
      return;
    }
    if (Number(formData.unitPrice) <= 0) {
      setError('Unit price must be greater than 0.');
      return;
    }
    if (!formData.categoryId) {
      setError('Category is required.');
      return;
    }
    if (!formData.supplierId) {
      setError('Supplier is required.');
      return;
    }

    onSave({
      ...formData,
      categoryId: parseInt(formData.categoryId, 10),
      supplierId: parseInt(formData.supplierId, 10),
      unitPrice: parseFloat(formData.unitPrice),
      quantity: parseInt(formData.quantity, 10) || 0,
      reorderPoint: parseInt(formData.reorderPoint, 10) || 0,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{product ? 'Edit Stationery Product' : 'Add New Stationery Product'}</h3>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
                ⚠️ {error}
              </div>
            )}
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="productName"
                  className="form-input"
                  placeholder="e.g. Blue Ball Pen, A4 Spiral Notebook"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">SKU * (Unique Code)</label>
                <input
                  type="text"
                  name="sku"
                  className="form-input"
                  placeholder="e.g. PEN001"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Barcode * (Scan / Numeric)</label>
                <input
                  type="text"
                  name="barcode"
                  className="form-input"
                  placeholder="e.g. 890100000001"
                  value={formData.barcode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="categoryId"
                  className="form-input"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Supplier *</label>
                <select
                  name="supplierId"
                  className="form-input"
                  value={formData.supplierId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Unit Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="unitPrice"
                  className="form-input"
                  placeholder="e.g. 10.00"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reorder Point *</label>
                <input
                  type="number"
                  name="reorderPoint"
                  className="form-input"
                  placeholder="e.g. 20"
                  value={formData.reorderPoint}
                  onChange={handleChange}
                  required
                />
              </div>

              {!product && (
                <div className="form-group">
                  <label className="form-label">Opening Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-input"
                    placeholder="e.g. 50"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Storage Bin Location</label>
                <input
                  type="text"
                  name="binLocation"
                  className="form-input"
                  placeholder="e.g. A01, Shelf 3"
                  value={formData.binLocation}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{product ? 'Update Product' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
