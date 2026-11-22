import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const links = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/transactions', icon: '💳', label: 'Transactions' },
  ];

  if (user?.role === 'admin') {
    links.push({ to: '/users', icon: '👥', label: 'Users' });
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
