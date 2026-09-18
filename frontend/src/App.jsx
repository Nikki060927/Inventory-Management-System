import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
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
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('inventory_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('inventory_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save session to localStorage', e);
    }
    showToast(`Signed in as ${user.name}`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('inventory_user');
    } catch (e) {
      console.warn('Could not clear session', e);
    }
    showToast('Signed out successfully.', 'success');
  };

  const handleSetUserRole = (newRole, displayName) => {
    if (!currentUser) return;
    const name = displayName || (newRole === 'ADMIN' ? 'Admin' : 'Staff 1');
    const username = newRole === 'ADMIN' ? 'admin' : (displayName === 'Staff 2' ? 'staff2' : 'staff1');
    const updated = {
      username,
      role: newRole,
      name,
    };
    setCurrentUser(updated);
    try {
      localStorage.setItem('inventory_user', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not update role', e);
    }
    showToast(`Active user switched to ${name}`, 'success');
  };

  // If not logged in, render the Login Screen
  if (!currentUser) {
    return (
      <div className="app-login-container">
        {toast && (
          <div className="toast-container">
            <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
              <span>{toast.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{toast.message}</span>
            </div>
          </div>
        )}
        <Login onLogin={handleLogin} showToast={showToast} />
      </div>
    );
  }

  const userRole = currentUser.role || 'ADMIN';

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
          setUserRole={handleSetUserRole}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

