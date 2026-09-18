import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;
  const s = status.toUpperCase();

  if (s === 'OUT OF STOCK') {
    return <span className="badge badge-outofstock">● Out of Stock</span>;
  } else if (s === 'LOW STOCK') {
    return <span className="badge badge-lowstock">▲ Low Stock</span>;
  } else if (s === 'IN STOCK') {
    return <span className="badge badge-instock">✓ In Stock</span>;
  } else if (s === 'INWARD') {
    return <span className="badge badge-type-inward">↓ Inward</span>;
  } else if (s === 'OUTWARD') {
    return <span className="badge badge-type-outward">↑ Outward</span>;
  } else if (s === 'DAMAGED') {
    return <span className="badge badge-type-damaged">✕ Damaged</span>;
  } else {
    return <span className="badge badge-instock">{status}</span>;
  }
}
