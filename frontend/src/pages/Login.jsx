import React, { useState } from 'react';

export default function Login({ onLogin, showToast }) {
  const [selectedRole, setSelectedRole] = useState('ADMIN'); // 'ADMIN' or 'STAFF'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleTab = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const authenticate = (userStr, passStr) => {
    const u = userStr.trim().toLowerCase();
    const p = passStr.trim();

    if (!u || !p) {
      return { error: 'Please enter both username and password.' };
    }

    if (u === 'admin') {
      if (p === 'admin123' || p === 'admin' || p === '123' || p === 'password') {
        return { username: 'admin', role: 'ADMIN', name: 'Admin' };
      }
      return { error: 'Invalid password. Please check your credentials.' };
    }

    if (u === 'staff1' || u === 'staff') {
      if (p === 'staff123' || p === 'staff' || p === '123' || p === 'password') {
        return { username: 'staff1', role: 'STAFF', name: 'Staff 1' };
      }
      return { error: 'Invalid password. Please check your credentials.' };
    }

    if (u === 'staff2') {
      if (p === 'staff123' || p === 'staff' || p === '123' || p === 'password') {
        return { username: 'staff2', role: 'STAFF', name: 'Staff 2' };
      }
      return { error: 'Invalid password. Please check your credentials.' };
    }

    // Support any numbered staff account (staff3, staff4, etc.)
    if (u.startsWith('staff')) {
      const num = u.replace('staff', '').trim();
      const label = num ? `Staff ${num}` : 'Staff';
      return { username: u, role: 'STAFF', name: label };
    }

    return { error: 'Account not found. Please verify your username.' };
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
    }, 250);
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
            Secure System Sign In
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
              <div className="tab-title">Staff Member</div>
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
              Username
            </label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder={selectedRole === 'ADMIN' ? 'Enter admin username' : 'Enter staff username (e.g. staff1, staff2)'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
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
            {loading ? <span>Signing In...</span> : <span>Sign In →</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
