import React, { useState } from 'react';

export default function Login({ onLogin, showToast }) {
  const [selectedRole, setSelectedRole] = useState('ADMIN'); // 'ADMIN' or 'STAFF'
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleTab = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'ADMIN') {
      setUsername('admin');
      setPassword('admin123');
    } else if (username === 'admin') {
      setUsername('staff1');
      setPassword('staff123');
    }
  };

  const authenticate = (userStr, passStr) => {
    const u = userStr.trim().toLowerCase();
    const p = passStr.trim();

    if (u === 'admin') {
      if (p === 'admin123' || p === 'admin' || p === '123' || p === 'password') {
        return { username: 'admin', role: 'ADMIN', name: 'Admin' };
      }
      return { error: 'Invalid password for Admin. Try: admin123' };
    }

    if (u === 'staff1' || u === 'staff') {
      if (p === 'staff123' || p === 'staff' || p === '123' || p === 'password') {
        return { username: 'staff1', role: 'STAFF', name: 'Staff 1' };
      }
      return { error: 'Invalid password for Staff 1. Try: staff123' };
    }

    if (u === 'staff2') {
      if (p === 'staff123' || p === 'staff' || p === '123' || p === 'password') {
        return { username: 'staff2', role: 'STAFF', name: 'Staff 2' };
      }
      return { error: 'Invalid password for Staff 2. Try: staff123' };
    }

    // Generic fallback for any other staff username (staff3, etc.)
    if (u.startsWith('staff')) {
      return { username: u, role: 'STAFF', name: u.charAt(0).toUpperCase() + u.slice(1) };
    }

    return { error: 'Unknown username. Use admin, staff1, or staff2' };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const result = authenticate(username, password);
      if (result.error) {
        setError(result.error);
        if (showToast) showToast(result.error, 'error');
      } else {
        onLogin(result);
      }
    }, 300);
  };

  const handleQuickLogin = (account) => {
    if (account === 'admin') {
      onLogin({ username: 'admin', role: 'ADMIN', name: 'Admin' });
    } else if (account === 'staff1') {
      onLogin({ username: 'staff1', role: 'STAFF', name: 'Staff 1' });
    } else if (account === 'staff2') {
      onLogin({ username: 'staff2', role: 'STAFF', name: 'Staff 2' });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="login-logo-icon">📚✏️</div>
          <h1 className="login-title">Smart Stationery</h1>
          <p className="login-subtitle">Inventory Management System</p>
          <div className="login-badge">
            Role-Based Access Control • Admin &amp; Staff
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="login-role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${selectedRole === 'ADMIN' ? 'active' : ''}`}
            onClick={() => handleRoleTab('ADMIN')}
          >
            <span className="tab-icon">🛡️</span>
            <div>
              <div className="tab-title">Administrator</div>
              <div className="tab-desc">Full System Access</div>
            </div>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${selectedRole === 'STAFF' ? 'active' : ''}`}
            onClick={() => handleRoleTab('STAFF')}
          >
            <span className="tab-icon">💼</span>
            <div>
              <div className="tab-title">Store Staff</div>
              <div className="tab-desc">POS &amp; Stock Operations</div>
            </div>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error-alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username (admin, staff1, staff2)
            </label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="admin, staff1, or staff2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit-btn"
            disabled={loading}
          >
            {loading ? <span>Signing in...</span> : <span>Sign In →</span>}
          </button>
        </form>

        {/* Quick Demo One-Click Sign-In */}
        <div className="quick-login-section">
          <div className="divider-text">
            <span>1-CLICK QUICK SIGN IN</span>
          </div>
          <div className="quick-buttons-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <button
              type="button"
              className="quick-btn quick-admin"
              onClick={() => handleQuickLogin('admin')}
              title="Sign in as Admin"
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              className="quick-btn quick-staff"
              onClick={() => handleQuickLogin('staff1')}
              title="Sign in as Staff 1"
            >
              💼 Staff 1
            </button>
            <button
              type="button"
              className="quick-btn quick-staff"
              onClick={() => handleQuickLogin('staff2')}
              title="Sign in as Staff 2"
            >
              💼 Staff 2
            </button>
          </div>
        </div>

        {/* Credentials Info Helper */}
        <div className="login-footer-info">
          <div className="credential-hint">
            <strong>Default Accounts:</strong><br />
            • <code>admin</code> / <code>admin123</code> (Full permissions)<br />
            • <code>staff1</code> / <code>staff123</code> (POS &amp; Stock)<br />
            • <code>staff2</code> / <code>staff123</code> (POS &amp; Stock)
          </div>
        </div>
      </div>
    </div>
  );
}
