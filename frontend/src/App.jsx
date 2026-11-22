import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Users = lazy(() => import('./pages/Users'));

const SuspenseFallback = () => (
  <div className="suspense-fallback">
    <LoadingSpinner size="large" />
    <p>Loading...</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Users />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  );
}
