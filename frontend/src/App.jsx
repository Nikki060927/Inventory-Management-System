import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Stock from './pages/Stock';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import './App.css';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [userRole, setUserRole] = useState('ADMIN'); // 'ADMIN' or 'STAFF'
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} showToast={showToast} />;
      case 'products':
        return <Products userRole={userRole} showToast={showToast} />;
      case 'categories':
        return <Categories showToast={showToast} />;
      case 'suppliers':
        return <Suppliers showToast={showToast} />;
      case 'stock':
        return <Stock showToast={showToast} />;
      case 'sales':
        return <Sales showToast={showToast} />;
      case 'reports':
        return <Reports showToast={showToast} />;
      default:
        return <Dashboard onNavigate={setActivePage} showToast={showToast} />;
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            <span>{toast.type === 'error' ? '⚠️' : '✓'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          activePage={activePage}
          userRole={userRole}
          setUserRole={setUserRole}
        />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
