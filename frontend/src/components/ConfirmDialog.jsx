import React from 'react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3>{title || 'Confirm Action'}</h3>
          <button type="button" className="close-btn" onClick={onCancel}>&times;</button>
        </div>
        <div className="modal-body">
          <p style={{ color: '#475569', fontSize: '14.5px' }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>Confirm Delete</button>
        </div>
      </div>
    </div>
  );
}
