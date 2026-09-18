import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ProductForm from '../components/ProductForm';
import ConfirmDialog from '../components/ConfirmDialog';
import ExportCsvButton from '../components/ExportCsvButton';

export default function Products({ userRole, showToast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'quantity'
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats, sups] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSuppliers(),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
      setSuppliers(sups || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and Sort in Memory
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          !searchTerm ||
          p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.barcode.includes(searchTerm);

        const matchesCat = !selectedCategory || String(p.categoryId) === String(selectedCategory);

        const matchesStatus =
          selectedStatus === 'ALL' ||
          (selectedStatus === 'OUT OF STOCK' && p.quantity === 0) ||
          (selectedStatus === 'LOW STOCK' && p.quantity > 0 && p.quantity <= p.reorderPoint) ||
          (selectedStatus === 'IN STOCK' && p.quantity > p.reorderPoint);

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortBy === 'name') {
          compare = a.productName.localeCompare(b.productName);
        } else if (sortBy === 'price') {
          compare = a.unitPrice - b.unitPrice;
        } else if (sortBy === 'quantity') {
          compare = a.quantity - b.quantity;
        }
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [products, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  // Paginated View
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleSaveProduct = async (formData) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.productId, formData);
        showToast('Product updated successfully!', 'success');
      } else {
        await api.createProduct(formData);
        showToast('Product added successfully!', 'success');
      }
      setIsFormOpen(false);
      setEditingProduct(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteProduct(deleteTarget.productId);
      showToast('Product deleted successfully!', 'success');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const csvHeaders = [
    { label: 'Product ID', key: 'productId' },
    { label: 'Product Name', key: 'productName' },
    { label: 'SKU', key: 'sku' },
    { label: 'Barcode', key: 'barcode' },
    { label: 'Category', key: 'categoryName' },
    { label: 'Unit Price', key: 'unitPrice' },
    { label: 'Quantity', key: 'quantity' },
    { label: 'Reorder Point', key: 'reorderPoint' },
    { label: 'Bin Location', key: 'binLocation' },
    { label: 'Supplier', key: 'supplierName' },
    { label: 'Status', key: 'status' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Stationery Products</h1>
          <p>Manage pens, notebooks, markers, files, and store catalog items</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ExportCsvButton filename="products_catalog" headers={csvHeaders} data={filteredProducts} />
          {userRole === 'ADMIN' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
            >
              + Add Product
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {/* Search, Filter & Sort Bar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by Product Name, SKU, or Barcode..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filter-group">
            <select
              className="select-input"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>

            <select
              className="select-input"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="IN STOCK">In Stock</option>
              <option value="LOW STOCK">Low Stock</option>
              <option value="OUT OF STOCK">Out of Stock</option>
            </select>

            <select
              className="select-input"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
            >
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="price-asc">Sort: Price (Low-High)</option>
              <option value="price-desc">Sort: Price (High-Low)</option>
              <option value="quantity-asc">Sort: Stock (Low-High)</option>
              <option value="quantity-desc">Sort: Stock (High-Low)</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Reorder</th>
                <th>Bin</th>
                <th>Supplier</th>
                <th>Status</th>
                {userRole === 'ADMIN' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'ADMIN' ? 12 : 11} className="empty-state">
                    <div className="empty-icon">📦</div>
                    <div>No stationery products found matching your filters.</div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.productId}>
                    <td>#{p.productId}</td>
                    <td><strong>{p.productName}</strong></td>
                    <td><code>{p.sku}</code></td>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>{p.barcode}</td>
                    <td>{p.categoryName}</td>
                    <td><strong>₹{Number(p.unitPrice).toFixed(2)}</strong></td>
                    <td>
                      <span style={{ fontWeight: '700', color: p.quantity === 0 ? '#dc2626' : (p.quantity <= p.reorderPoint ? '#d97706' : '#15803d') }}>
                        {p.quantity}
                      </span>
                    </td>
                    <td>{p.reorderPoint}</td>
                    <td><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{p.binLocation || 'N/A'}</span></td>
                    <td style={{ color: '#475569' }}>{p.supplierName}</td>
                    <td><StatusBadge status={p.status} /></td>
                    {userRole === 'ADMIN' && (
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            title="Edit Product"
                            onClick={() => {
                              setEditingProduct(p);
                              setIsFormOpen(true);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn-danger"
                            title="Delete Product"
                            onClick={() => setDeleteTarget(p)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ◀ Previous
            </button>
            <span style={{ padding: '6px 12px', fontSize: '13px', fontWeight: '600' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      <ProductForm
        isOpen={isFormOpen}
        product={editingProduct}
        categories={categories}
        suppliers={suppliers}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Stationery Product"
        message={`Are you sure you want to delete "${deleteTarget?.productName}" (${deleteTarget?.sku})? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
}
