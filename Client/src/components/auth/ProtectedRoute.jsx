import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !user.user_type) {
    // Redirect to login if not authenticated or user data is invalid
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles are required, just check authentication
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has the required role
  if (!allowedRoles.includes(user.user_type)) {
    // Redirect to appropriate dashboard based on user type
    const dashboardRoutes = {
      freelancer: '/freelancer/dashboard',
      client: '/client/dashboard',
      admin: '/admin/dashboard'
    };

    const redirectTo = dashboardRoutes[user.user_type] || '/login';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;