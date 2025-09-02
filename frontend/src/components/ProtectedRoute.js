import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const ProtectedRoute = ({ children, requireRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle requireRole prop - it can be null, undefined, a string, or an array of strings
  if (requireRole) {
    if (Array.isArray(requireRole)) {
      if (!requireRole.includes(user.role)) {
        return <Navigate to="/" replace />;
      }
    } else if (typeof requireRole === 'string') {
      if (user.role !== requireRole) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
