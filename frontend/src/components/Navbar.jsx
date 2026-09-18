import React from 'react';

export default function Navbar({ activePage, userRole, setUserRole }) {
  const titles = {
    dashboard: 'Store Dashboard & Overview',
    products: 'Stationery Product Catalog',
    suppliers: 'Vendor & Supplier Management',
    categories: 'Product Categories',
    stock: 'Stock Inward, Outward & Damaged Audit',
    sales: 'Point of Sale (POS) Billing',
    reports: 'Inventory Analytics & Valuation Reports',
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="top-navbar">
      <div className="navbar-page-title">{titles[activePage] || 'Smart Inventory'}</div>
      <div className="navbar-right">
        <span className="date-badge">📅 {today}</span>
        <div className="role-toggle" title="Switch User Role for Academic Demonstration">
          <button
            type="button"
            className={`role-btn ${userRole === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setUserRole('ADMIN')}
          >
            Store Admin
          </button>
          <button
            type="button"
            className={`role-btn ${userRole === 'STAFF' ? 'active' : ''}`}
            onClick={() => setUserRole('STAFF')}
          >
            Store Staff
          </button>
        </div>
      </div>
    </header>
  );
}
