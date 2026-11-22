import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      if (!name.trim()) return setError('Operator name required');
      if (!email.trim()) return setError('System email required');
      if (password.length < 6) return setError('Passkey must be at least 6 characters');
      if (password !== confirmPassword) return setError('Security passkeys do not match');

      setLoading(true);
      try {
        await register(name, email, password);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || 'Registration rejected');
      } finally {
        setLoading(false);
      }
    },
    [name, email, password, confirmPassword, register, navigate]
  );

  return (
    <div className="auth-page-forge">
      <div className="auth-portal-window">
        <div className="auth-portal-bar">
          <span>★ FINTRACK // OPERATOR INITIALIZATION</span>
          <span>[ - ] [ × ]</span>
        </div>

        <div className="auth-portal-body">
          <h1 className="auth-portal-title">NEW OPERATOR</h1>
          <p className="auth-portal-sub">[ENROLLMENT IN FINTRACK REPOSITORY]</p>

          {error && <div className="alert-forge alert-forge-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label className="auth-form-label">OPERATOR FULL NAME</label>
              <input
                className="auth-form-input"
                type="text"
                placeholder="JOHN DOE"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label">SYSTEM IDENTIFIER (EMAIL)</label>
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
              <label className="auth-form-label">SECURITY ACCESS PASS</label>
              <input
                className="auth-form-input"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label">CONFIRM ACCESS PASS</label>
              <input
                className="auth-form-input"
                type="password"
                placeholder="Repeat security pass"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" className="btn-auth-enter" disabled={loading}>
              {loading ? 'ENROLLING...' : 'INITIALIZE CREDENTIALS →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <Link
              to="/login"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#111',
                textDecoration: 'underline',
              }}
            >
              [ ← RETURN TO AUTHENTICATION PORTAL ]
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
