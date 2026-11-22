import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const roleBadgeClass = user?.role === 'admin'
    ? 'badge badge-admin'
    : user?.role === 'read-only'
    ? 'badge badge-readonly'
    : 'badge badge-user';

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/dashboard" className="header-logo">
          <span className="logo-icon">💰</span>
          <span className="logo-text">FinTracker</span>
        </Link>
      </div>

      <nav className="header-nav">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/transactions" className="nav-link">Transactions</Link>
        {user?.role === 'admin' && (
          <Link to="/users" className="nav-link">Users</Link>
        )}
      </nav>

      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className={roleBadgeClass}>{user?.role}</span>
        </div>

        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
