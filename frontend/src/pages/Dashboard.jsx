import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard({ onNavigate, showToast }) {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inventoryValue: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [sumData, lowData] = await Promise.all([
        api.getDashboardSummary(),
        api.getLowStockReport(),
      ]);
      setSummary(sumData || {});
      setLowStockItems(lowData || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Stationery Store Overview</h1>
          <p>Real-time metrics, stock levels, and inventory valuation</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={loadDashboard}>
          🔄 Refresh
        </button>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">📦</div>
          <div className="stat-content">
            <span className="stat-label">Total SKUs</span>
            <span className="stat-value">{summary.totalProducts}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-indigo">🔢</div>
          <div className="stat-content">
            <span className="stat-label">Total Stock Units</span>
            <span className="stat-value">{summary.totalStock}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">⚠️</div>
          <div className="stat-content">
            <span className="stat-label">Low Stock Items</span>
            <span className="stat-value">{summary.lowStockCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-red">🚫</div>
          <div className="stat-content">
            <span className="stat-label">Out of Stock</span>
            <span className="stat-value">{summary.outOfStockCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">₹</div>
          <div className="stat-content">
            <span className="stat-label">Inventory Value</span>
            <span className="stat-value">₹{Number(summary.inventoryValue || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Urgent Restock Attention Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">🚨 Low Stock Items Requiring Reorder</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Items at or below reorder threshold. Recommended order quantity is calculated automatically.
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onNavigate('stock')}>
            + Inward Stock
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Reorder Point</th>
                <th>Suggested Reorder</th>
                <th>Bin Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    ✅ All stationery products have sufficient stock levels!
                  </td>
                </tr>
              ) : (
                lowStockItems.map((item) => (
                  <tr key={item.productId}>
                    <td><strong>{item.productName}</strong></td>
                    <td><code>{item.sku}</code></td>
                    <td>{item.categoryName}</td>
                    <td>
                      <span style={{ fontWeight: '700', color: item.quantity === 0 ? '#dc2626' : '#d97706' }}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td>{item.reorderPoint} units</td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#4f46e5' }}>
                        +{(item.reorderPoint * 2) - item.quantity} units
                      </span>
                    </td>
                    <td><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{item.binLocation || 'N/A'}</span></td>
                    <td><StatusBadge status={item.status} /></td>
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
