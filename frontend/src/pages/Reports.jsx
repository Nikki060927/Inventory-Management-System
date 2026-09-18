import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ExportCsvButton from '../components/ExportCsvButton';

export default function Reports({ showToast }) {
  const [activeTab, setActiveTab] = useState('low-stock'); // 'low-stock', 'valuation', 'audit'

  const [lowStockItems, setLowStockItems] = useState([]);
  const [valuationReport, setValuationReport] = useState({
    grandTotalValue: 0,
    grandTotalUnits: 0,
    categoryValuations: [],
    productValuations: [],
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [lowData, valData, auditData] = await Promise.all([
        api.getLowStockReport(),
        api.getValuationReport(),
        api.getStockMovementReport(),
      ]);
      setLowStockItems(lowData || []);
      setValuationReport(valData || { grandTotalValue: 0, grandTotalUnits: 0, categoryValuations: [], productValuations: [] });
      setAuditLogs(auditData || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // CSV Export Configurations
  const lowStockCsvHeaders = [
    { label: 'Product Name', key: 'productName' },
    { label: 'SKU', key: 'sku' },
    { label: 'Category', key: 'categoryName' },
    { label: 'Current Stock', key: 'quantity' },
    { label: 'Reorder Point', key: 'reorderPoint' },
    { label: 'Suggested Reorder', key: 'suggestedReorderQuantity' },
    { label: 'Status', key: 'status' },
  ];

  const categoryValCsvHeaders = [
    { label: 'Category Name', key: 'categoryName' },
    { label: 'Product Items', key: 'totalItems' },
    { label: 'Stock Units', key: 'totalUnits' },
    { label: 'Total Value (INR)', key: 'categoryValue' },
  ];

  const auditCsvHeaders = [
    { label: 'Tx ID', key: 'transactionId' },
    { label: 'Product Name', key: 'productName' },
    { label: 'Type', key: 'transactionType' },
    { label: 'Quantity', key: 'quantity' },
    { label: 'Previous Stock', key: 'previousQuantity' },
    { label: 'New Stock', key: 'newQuantity' },
    { label: 'Timestamp', key: 'transactionDate' },
    { label: 'Remarks', key: 'remarks' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Inventory Reports & Intelligence</h1>
          <p>Exportable reports for restocking decisions, financial valuation, and stock audits</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={loadReports}>
          🔄 Refresh Reports
        </button>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'low-stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('low-stock')}
        >
          🚨 Low Stock & Reorder Suggestions
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'valuation' ? 'active' : ''}`}
          onClick={() => setActiveTab('valuation')}
        >
          💰 Inventory Financial Valuation
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          📜 Complete Stock Audit Trail
        </button>
      </div>

      {/* TAB 1: LOW STOCK & REORDER SUGGESTIONS */}
      {activeTab === 'low-stock' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Restocking Purchase Plan</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Items below safety threshold. Suggested order quantity computed as: (reorder_point × 2) - current_quantity
              </p>
            </div>
            <ExportCsvButton filename="low_stock_report" headers={lowStockCsvHeaders} data={lowStockItems} />
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      ✅ All inventory levels are healthy! No reorders required right now.
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((p) => {
                    const suggested = Math.max(0, (p.reorderPoint * 2) - p.quantity);
                    return (
                      <tr key={p.productId}>
                        <td><strong>{p.productName}</strong></td>
                        <td><code>{p.sku}</code></td>
                        <td>{p.categoryName}</td>
                        <td>
                          <span style={{ fontWeight: '700', color: p.quantity === 0 ? '#dc2626' : '#d97706' }}>
                            {p.quantity} units
                          </span>
                        </td>
                        <td>{p.reorderPoint} units</td>
                        <td>
                          <span style={{ fontWeight: '700', color: '#4f46e5' }}>
                            +{suggested} units
                          </span>
                        </td>
                        <td><StatusBadge status={p.status} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY VALUATION */}
      {activeTab === 'valuation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Valuation Summary Card */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-green">💎</div>
              <div className="stat-content">
                <span className="stat-label">Total Inventory Valuation</span>
                <span className="stat-value">₹{Number(valuationReport.grandTotalValue || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-blue">📦</div>
              <div className="stat-content">
                <span className="stat-label">Total Discrete Stock Units</span>
                <span className="stat-value">{valuationReport.grandTotalUnits} units</span>
              </div>
            </div>
          </div>

          {/* Category-Wise Breakdown Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Category-Wise Valuation Breakdown</h3>
              <ExportCsvButton filename="category_valuation" headers={categoryValCsvHeaders} data={valuationReport.categoryValuations} />
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Unique Products</th>
                    <th>Total Units</th>
                    <th>Category Value</th>
                  </tr>
                </thead>
                <tbody>
                  {valuationReport.categoryValuations.map((c) => (
                    <tr key={c.categoryName}>
                      <td><strong>{c.categoryName}</strong></td>
                      <td>{c.totalItems} items</td>
                      <td>{c.totalUnits} units</td>
                      <td><strong>₹{Number(c.categoryValue).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Stock Audit Ledger</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Complete immutable log of all inward, outward, and damaged adjustments
              </p>
            </div>
            <ExportCsvButton filename="audit_trail_report" headers={auditCsvHeaders} data={auditLogs} />
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tx ID</th>
                  <th>Product Name</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Prev Stock</th>
                  <th>New Stock</th>
                  <th>Timestamp</th>
                  <th>Remarks / Reason</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((tx) => (
                  <tr key={tx.transactionId}>
                    <td>#{tx.transactionId}</td>
                    <td><strong>{tx.productName}</strong></td>
                    <td><StatusBadge status={tx.transactionType} /></td>
                    <td>
                      <span style={{ fontWeight: '700', color: tx.transactionType === 'INWARD' ? '#15803d' : '#b91c1c' }}>
                        {tx.transactionType === 'INWARD' ? `+${tx.quantity}` : `-${tx.quantity}`}
                      </span>
                    </td>
                    <td>{tx.previousQuantity}</td>
                    <td><strong>{tx.newQuantity}</strong></td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{tx.transactionDate}</td>
                    <td>{tx.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
