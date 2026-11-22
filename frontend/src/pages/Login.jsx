import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      if (!email.trim()) return setError('System identifier required');
      if (!password) return setError('Security access pass required');

      setLoading(true);
      try {
        await login(email, password);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || 'Access denied: Invalid credentials');
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, navigate]
  );

  return (
    <div className="auth-page-forge">
      <div className="auth-portal-window">
        {/* Window Top Bar (Image 1) */}
        <div className="auth-portal-bar">
          <span>★ FINTRACK // OPERATIONAL AUTH PORTAL</span>
          <span>[ - ] [ × ]</span>
        </div>

        <div className="auth-portal-body">
          <h1 className="auth-portal-title">FINTRACK</h1>
          <p className="auth-portal-sub">[SECURITY LEVEL 4 ACCESS REQUIRED]</p>

          {error && <div className="alert-forge alert-forge-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label className="auth-form-label">
                SYSTEM IDENTIFIER (EMAIL)
              </label>
              <input
                className="auth-form-input"
                type="email"
                placeholder="operator@fintrack.internal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label">
                SECURITY ACCESS PASS
              </label>
              <input
                className="auth-form-input"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn-auth-enter" disabled={loading}>
              {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER →'}
            </button>
          </form>

          {/* Quick Role Selector (Demo) matching Image 1 */}
          <div className="quick-role-section">
            <p className="quick-role-title">★ QUICK ROLE SELECTOR (DEMO):</p>
            <div className="quick-role-buttons">
              <button
                type="button"
                className="btn-quick-role role-btn-admin"
                onClick={() => handleQuickFill('admin@demo.com', 'admin123')}
              >
                ADMIN
              </button>
              <button
                type="button"
                className="btn-quick-role role-btn-user"
                onClick={() => handleQuickFill('user@demo.com', 'user123')}
              >
                USER
              </button>
              <button
                type="button"
                className="btn-quick-role role-btn-readonly"
                onClick={() => handleQuickFill('readonly@demo.com', 'readonly123')}
              >
                READ-ONLY
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link
              to="/register"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#111',
                textDecoration: 'underline',
              }}
            >
              [ + INITIALIZE NEW OPERATOR ACCOUNT ]
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
