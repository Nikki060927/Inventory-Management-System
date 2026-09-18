import React from 'react';

export default function Sidebar({ activePage, setActivePage, userRole }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', adminOnly: false },
    { id: 'products', label: 'Products', icon: '📦', adminOnly: false },
    { id: 'categories', label: 'Categories', icon: '🏷️', adminOnly: true },
    { id: 'suppliers', label: 'Suppliers', icon: '🚚', adminOnly: true },
    { id: 'stock', label: 'Stock Movement', icon: '🔄', adminOnly: false },
    { id: 'sales', label: 'Sales (POS)', icon: '🛒', adminOnly: false },
    { id: 'reports', label: 'Reports & Value', icon: '📈', adminOnly: true },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">✏️</div>
        <div>
          <div className="sidebar-title">Smart Stationery</div>
          <div className="sidebar-subtitle">Inventory System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (item.adminOnly && userRole !== 'ADMIN') {
            return null; // Restricted in staff mode
          }
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div><strong>Current Role:</strong> {userRole}</div>
        <div>Java 21 + JDBC + React</div>
      </div>
    </aside>
  );
}
