import React, { useState } from 'react';

export default function Login({ onLogin, showToast }) {
  const [selectedRole, setSelectedRole] = useState('ADMIN'); // 'ADMIN' or 'STAFF'
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'ADMIN') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('staff');
      setPassword('staff123');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      // Demo authentication logic
      if (selectedRole === 'ADMIN') {
        if (cleanUser === 'admin' && (cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === '123' || cleanPass === 'password')) {
          onLogin({
            username: 'admin',
            role: 'ADMIN',
            name: 'Nikhila V (Store Admin)',
          });
        } else {
          setError('Invalid Admin credentials. Try demo: admin / admin123');
          if (showToast) showToast('Invalid Admin credentials. Try demo: admin / admin123', 'error');
        }
      } else {
        if (cleanUser === 'staff' && (cleanPass === 'staff123' || cleanPass === 'staff' || cleanPass === '123' || cleanPass === 'password')) {
          onLogin({
            username: 'staff',
            role: 'STAFF',
            name: 'Zaid Basha (Store Staff)',
          });
        } else {
          setError('Invalid Staff credentials. Try demo: staff / staff123');
          if (showToast) showToast('Invalid Staff credentials. Try demo: staff / staff123', 'error');
        }
      }
    }, 400);
  };

  const handleQuickLogin = (role) => {
    if (role === 'ADMIN') {
      onLogin({
        username: 'admin',
        role: 'ADMIN',
        name: 'Nikhila V (Store Admin)',
      });
    } else {
      onLogin({
        username: 'staff',
        role: 'STAFF',
        name: 'Zaid Basha (Store Staff)',
      });
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
            Academic Full-Stack Project • Java 21 + MySQL + React 19
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="login-role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${selectedRole === 'ADMIN' ? 'active' : ''}`}
            onClick={() => handleRoleChange('ADMIN')}
          >
            <span className="tab-icon">🛡️</span>
            <div>
              <div className="tab-title">Store Admin</div>
              <div className="tab-desc">Full System Access</div>
            </div>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${selectedRole === 'STAFF' ? 'active' : ''}`}
            onClick={() => handleRoleChange('STAFF')}
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
              Username
            </label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder={selectedRole === 'ADMIN' ? 'admin' : 'staff'}
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
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <span>Sign In as {selectedRole === 'ADMIN' ? 'Admin' : 'Staff'} →</span>
            )}
          </button>
        </form>

        {/* Quick Demo One-Click Sign-In */}
        <div className="quick-login-section">
          <div className="divider-text">
            <span>OR 1-CLICK DEMO LOGIN</span>
          </div>
          <div className="quick-buttons-row">
            <button
              type="button"
              className="quick-btn quick-admin"
              onClick={() => handleQuickLogin('ADMIN')}
              title="Instant Admin Sign In"
            >
              🚀 Demo Admin (Nikhila V)
            </button>
            <button
              type="button"
              className="quick-btn quick-staff"
              onClick={() => handleQuickLogin('STAFF')}
              title="Instant Staff Sign In"
            >
              🚀 Demo Staff (Zaid Basha)
            </button>
          </div>
        </div>

        {/* Credentials Info Helper */}
        <div className="login-footer-info">
          <div className="credential-hint">
            <strong>Demo Credentials:</strong><br />
            • Admin: <code>admin</code> / <code>admin123</code><br />
            • Staff: <code>staff</code> / <code>staff123</code>
          </div>
          <div className="team-credit">
            Lead Architect: <strong>Nikhila V (44731059)</strong> • Specialist: <strong>Zaid Basha (44731049)</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
