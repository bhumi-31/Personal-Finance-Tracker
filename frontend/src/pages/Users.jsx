import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { Navigate } from 'react-router-dom';

const ROLES = ['admin', 'user', 'read-only'];

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getUsers();
      setUsers(res.data.users || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to query user repository');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = useCallback(
    async (userId, newRole) => {
      setUpdating(userId);
      try {
        await userService.updateRole(userId, newRole);
        setUsers((prev) =>
          prev.map((u) =>
            (u._id || u.id) === userId ? { ...u, role: newRole } : u
          )
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Access privilege update rejected');
      } finally {
        setUpdating(null);
      }
    },
    []
  );

  return (
    <div>
      {/* Engine Banner (Matching Image 2) */}
      <div className="engine-banner">
        <div className="engine-banner-info">
          <h1>OPERATOR ACCESS & PRIVILEGE MATRIX</h1>
          <p>
            ROLE-BASED ACCESS CONTROL (RBAC) // ACTIVE IDENTITY: [
            {currentUser?.email?.toUpperCase()}]
          </p>
        </div>

        <div>
          <span className="status-pill status-online">
            ● RBAC ENFORCEMENT: ACTIVE
          </span>
        </div>
      </div>

      {error && <div className="alert-forge alert-forge-error">{error}</div>}

      {/* User Matrix Table (Matching Image 2) */}
      <div className="matrix-table-container">
        <div className="matrix-table-header-bar">
          <span>★ ACTIVE OPERATOR REGISTRY</span>
          <span>[ {users.length} ENROLLED ACCOUNTS ]</span>
        </div>

        <table className="matrix-table">
          <thead>
            <tr>
              <th>OPERATOR NAME</th>
              <th>SYSTEM IDENTIFIER</th>
              <th>ASSIGNED ROLE</th>
              <th>TIMESTAMP</th>
              <th style={{ textAlign: 'right' }}>ACCESS PERMISSION</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const userId = u._id || u.id;
              const isSelf = userId === (currentUser._id || currentUser.id);
              const roleBadge =
                u.role === 'admin'
                  ? 'badge-admin'
                  : u.role === 'read-only'
                  ? 'badge-readonly'
                  : 'badge-user';

              return (
                <tr key={userId}>
                  <td style={{ fontWeight: 800 }}>
                    [{u.name?.toUpperCase()}]
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{u.email}</td>
                  <td>
                    <span className={`badge-matrix ${roleBadge}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {isSelf ? (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#6B7280',
                        }}
                      >
                        [SESSION OPERATOR]
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(userId, e.target.value)}
                        disabled={updating === userId}
                        className="filter-select-forge"
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            ASSIGN: {role.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
