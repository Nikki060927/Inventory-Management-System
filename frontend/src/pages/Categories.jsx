import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CategoryForm from '../components/CategoryForm';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Categories({ showToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingCat) {
        await api.updateCategory(editingCat.categoryId, formData);
        showToast('Category updated successfully!', 'success');
      } else {
        await api.createCategory(formData);
        showToast('Category created successfully!', 'success');
      }
      setIsFormOpen(false);
      setEditingCat(null);
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteCategory(deleteTarget.categoryId);
      showToast('Category deleted successfully!', 'success');
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Product Categories</h1>
          <p>Organize stationery inventory into logical store sections</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingCat(null);
            setIsFormOpen(true);
          }}
        >
          + Add Category
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category ID</th>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-state">No categories defined yet.</td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.categoryId}>
                    <td>#{c.categoryId}</td>
                    <td><strong>{c.categoryName}</strong></td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit Category"
                          onClick={() => {
                            setEditingCat(c);
                            setIsFormOpen(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          title="Delete Category"
                          onClick={() => setDeleteTarget(c)}
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

      <CategoryForm
        isOpen={isFormOpen}
        category={editingCat}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCat(null);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.categoryName}"? (Deletion will be blocked if products are linked)`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
