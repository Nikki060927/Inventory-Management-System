import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StockForm from '../components/StockForm';
import StatusBadge from '../components/StatusBadge';
import ExportCsvButton from '../components/ExportCsvButton';

export default function Stock({ showToast }) {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, txs] = await Promise.all([
        api.getProducts(),
        api.getStockHistory(),
      ]);
      setProducts(prods || []);
      setTransactions(txs || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockSubmit = async (type, productId, quantity, remarks) => {
    try {
      let res;
      if (type === 'INWARD') {
        res = await api.stockInward(productId, quantity, remarks);
        showToast(`Stock Inward logged! Added ${quantity} units.`, 'success');
      } else if (type === 'OUTWARD') {
        res = await api.stockOutward(productId, quantity, remarks);
        showToast(`Stock Outward logged! Dispatched ${quantity} units.`, 'success');
      } else if (type === 'DAMAGED') {
        res = await api.stockDamaged(productId, quantity, remarks);
        showToast(`Damaged Stock logged! Deducted ${quantity} units.`, 'success');
      }
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const csvHeaders = [
    { label: 'Transaction ID', key: 'transactionId' },
    { label: 'Product Name', key: 'productName' },
    { label: 'Type', key: 'transactionType' },
    { label: 'Quantity Adjusted', key: 'quantity' },
    { label: 'Previous Stock', key: 'previousQuantity' },
    { label: 'New Stock', key: 'newQuantity' },
    { label: 'Date', key: 'transactionDate' },
    { label: 'Remarks / Reason', key: 'remarks' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Stock Operations & Movement Audit</h1>
          <p>Execute inward receipts, outward dispatches, and log damaged stationery goods</p>
        </div>
      </div>

      {/* Stock Movement Form Component */}
      <StockForm products={products} onSubmit={handleStockSubmit} />

      {/* Audit History Log */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">📜 Chronological Stock Movement History</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Non-repudiable audit ledger capturing every stock addition, dispatch, and damaged item
            </p>
          </div>
          <ExportCsvButton filename="stock_movement_audit" headers={csvHeaders} data={transactions} />
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Product Name</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Prev Stock</th>
                <th>New Stock</th>
                <th>Timestamp</th>
                <th>Remarks / Reason</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">No stock movements recorded yet.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.transactionId}>
                    <td>#{tx.transactionId}</td>
                    <td><strong>{tx.productName}</strong></td>
                    <td><StatusBadge status={tx.transactionType} /></td>
                    <td>
                      <span style={{
                        fontWeight: '700',
                        color: tx.transactionType === 'INWARD' ? '#15803d' : '#b91c1c'
                      }}>
                        {tx.transactionType === 'INWARD' ? `+${tx.quantity}` : `-${tx.quantity}`}
                      </span>
                    </td>
                    <td>{tx.previousQuantity}</td>
                    <td><strong>{tx.newQuantity}</strong></td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{tx.transactionDate}</td>
                    <td style={{ color: '#475569' }}>{tx.remarks || '—'}</td>
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
