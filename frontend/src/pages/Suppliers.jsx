import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import SupplierForm from '../components/SupplierForm';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Suppliers({ showToast }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSup, setEditingSup] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await api.getSuppliers();
      setSuppliers(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingSup) {
        await api.updateSupplier(editingSup.supplierId, formData);
        showToast('Supplier updated successfully!', 'success');
      } else {
        await api.createSupplier(formData);
        showToast('Supplier created successfully!', 'success');
      }
      setIsFormOpen(false);
      setEditingSup(null);
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteSupplier(deleteTarget.supplierId);
      showToast('Supplier deleted successfully!', 'success');
      setDeleteTarget(null);
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Stationery Suppliers & Vendors</h1>
          <p>Maintain contact records for distributors and manufacturers</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingSup(null);
            setIsFormOpen(true);
          }}
        >
          + Add Supplier
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Warehouse Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">No suppliers found.</td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.supplierId}>
                    <td>#{s.supplierId}</td>
                    <td><strong>{s.supplierName}</strong></td>
                    <td>{s.phone || '—'}</td>
                    <td>{s.email || '—'}</td>
                    <td>{s.address || '—'}</td>
                    <td>
                      <span className={`badge ${s.status === 'ACTIVE' ? 'badge-instock' : 'badge-outofstock'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit Supplier"
                          onClick={() => {
                            setEditingSup(s);
                            setIsFormOpen(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          title="Delete Supplier"
                          onClick={() => setDeleteTarget(s)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupplierForm
        isOpen={isFormOpen}
        supplier={editingSup}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSup(null);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${deleteTarget?.supplierName}"? (Deletion will be blocked if products are associated)`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
