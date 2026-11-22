import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import LoadingSpinner from '../components/common/LoadingSpinner';
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
      setUsers(res.data.users || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
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
        setError(err.response?.data?.message || 'Failed to update role');
      } finally {
        setUpdating(null);
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>User Management</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const userId = u._id || u.id;
              const isSelf = userId === (currentUser._id || currentUser.id);
              return (
                <tr key={userId}>
                  <td>
                    <div className="user-cell">
                      <span className="user-avatar">
                        {u.name?.charAt(0).toUpperCase()}
                      </span>
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role === 'admin' ? 'admin' : u.role === 'read-only' ? 'readonly' : 'user'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td>
                    {isSelf ? (
                      <span className="text-muted">Current user</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(userId, e.target.value)}
                        disabled={updating === userId}
                        className="role-select"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    )}
                    {updating === userId && (
                      <LoadingSpinner size="small" />
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
