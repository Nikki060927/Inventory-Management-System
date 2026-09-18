import React, { useState, useEffect } from 'react';

export default function SupplierForm({ isOpen, onClose, onSave, supplier }) {
  const [formData, setFormData] = useState({
    supplierName: '',
    phone: '',
    email: '',
    address: '',
    status: 'ACTIVE',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (supplier) {
      setFormData({
        supplierName: supplier.supplierName || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        status: supplier.status || 'ACTIVE',
      });
    } else {
      setFormData({
        supplierName: '',
        phone: '',
        email: '',
        address: '',
        status: 'ACTIVE',
      });
    }
    setError('');
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.supplierName.trim()) {
      setError('Supplier name is required.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
                ⚠️ {error}
              </div>
            )}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Supplier Name *</label>
              <input
                type="text"
                name="supplierName"
                className="form-input"
                placeholder="e.g. Camlin Distributors Pvt Ltd"
                value={formData.supplierName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid" style={{ marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="e.g. vendor@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Office / Warehouse Address</label>
              <textarea
                name="address"
                className="form-input"
                rows="2"
                placeholder="e.g. Plot 12, Industrial Estate, Mumbai"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-input"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{supplier ? 'Update Supplier' : 'Save Supplier'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
