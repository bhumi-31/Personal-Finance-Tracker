import React, { useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

  const roleClass = user?.role === 'admin'
    ? 'status-role'
    : user?.role === 'read-only'
    ? 'status-readonly'
    : 'status-role';

  return (
    <header className="header">
      <div className="header-left">
        <NavLink to="/dashboard" className="header-logo-badge">
          F
        </NavLink>
        <div className="header-logo-text">
          <span className="header-logo-title">FINTRACK // CORE</span>
          <span className="header-logo-sub">PERSONAL FINANCE TRACKER</span>
        </div>
      </div>

      <nav className="header-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          OVERVIEW
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          TRANSACTIONS
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink
            to="/users"
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          >
            USER MATRIX
          </NavLink>
        )}
      </nav>

      <div className="header-right">
        <button
          className="nav-tab"
          onClick={toggleTheme}
          style={{ fontSize: '0.72rem', padding: '5px 10px' }}
          title="Toggle system mode"
        >
          {theme === 'light' ? '[MODE: DARK]' : '[MODE: LIGHT]'}
        </button>

        <span className="status-pill status-online">
          ● SYSTEM ONLINE
        </span>

        <span className={`status-pill ${roleClass}`}>
          ROLE: {user?.role ? user.role.toUpperCase() : 'USER'}
        </span>

        <button className="btn-logout" onClick={handleLogout}>
          LOGOUT
        </button>
      </div>
    </header>
  );
}
