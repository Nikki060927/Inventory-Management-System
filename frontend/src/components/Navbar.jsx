import React from 'react';

export default function Navbar({ activePage, userRole, setUserRole, currentUser, onLogout }) {
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

        {/* User Session Profile Badge */}
        {currentUser && (
          <div className="user-profile-badge" title="Active Logged-In User">
            <span>👤</span>
            <span>{currentUser.name || (userRole === 'ADMIN' ? 'Store Admin' : 'Store Staff')}</span>
            <span className={`user-role-tag ${userRole === 'ADMIN' ? 'admin' : 'staff'}`}>
              {userRole}
            </span>
          </div>
        )}

        {/* Role Quick Toggle for Viva Demonstration */}
        <div className="role-toggle" title="Switch User Role for Academic Demonstration">
          <button
            type="button"
            className={`role-btn ${userRole === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setUserRole('ADMIN')}
          >
            Admin
          </button>
          <button
            type="button"
            className={`role-btn ${userRole === 'STAFF' ? 'active' : ''}`}
            onClick={() => setUserRole('STAFF')}
          >
            Staff
          </button>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            type="button"
            className="btn-logout"
            onClick={onLogout}
            title="Sign out of system"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}

